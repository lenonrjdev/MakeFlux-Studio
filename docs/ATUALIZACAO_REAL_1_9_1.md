# Atualização real do MakeFlux Studio 1.9.0 para 1.9.1

## Objetivo

Comprovar o ciclo completo do atualizador assinado em uma instalação real:

1. o MakeFlux Studio 1.9.0 consulta `latest.json`;
2. localiza a versão 1.9.1;
3. baixa o instalador;
4. valida a assinatura incorporada ao manifesto;
5. instala e reinicia;
6. o 1.9.1 reconhece a transição iniciada pela versão anterior;
7. confirma a versão 1.9.1;
8. verifica SQLite, registros persistidos e cofre;
9. registra a evidência como `confirmada-legado`;
10. habilita checkpoint completo para as próximas atualizações e operações de rollback.


## Limite técnico da primeira transição

A instalação oficial 1.9.0 já foi publicada antes da criação do checkpoint nativo da Fase 23. Por isso, o binário 1.9.0 não consegue criar antecipadamente um snapshot que só existe no código 1.9.1.

Na primeira atualização real, o 1.9.1 usa os metadados persistidos pelo atualizador 1.9.0 para reconhecer a origem e o destino, valida a versão atual, executa `PRAGMA quick_check`, confere os registros existentes e verifica o cofre. O histórico recebe o status `confirmada-legado`, deixando explícito que não houve comparação com um checkpoint prévio.

Toda atualização iniciada a partir do 1.9.1 usa o checkpoint completo descrito abaixo.

## Checkpoint pré-instalação

Antes de chamar `update.install()`, o runtime Rust executa:

- `PRAGMA wal_checkpoint(FULL)`;
- `PRAGMA quick_check`;
- contagem dos registros de `workspace_store`;
- leitura do tamanho e SHA-256 do SQLite;
- verificação da existência do cofre criptografado;
- cópia do SQLite consolidado para `update-checkpoints`;
- registro em `historico_atualizacoes_reais`;
- criação do registro único em `checkpoint_atualizacao`.

A instalação é bloqueada quando o SQLite não está íntegro, quando já existe um checkpoint pendente ou quando a versão de destino é igual à instalada.

## Confirmação pós-reinício

Durante o startup da nova versão, o runtime reconcilia o checkpoint. Um provedor global da interface também reconhece a primeira transição legada em qualquer rota, sem depender de abrir previamente a Central de Atualizações. A operação é considerada confirmada somente quando:

- a versão atual é exatamente a versão de destino;
- `PRAGMA quick_check` retorna `OK`;
- a quantidade de registros persistidos não diminuiu;
- o cofre continua presente quando já existia antes da atualização.

O checksum do banco é registrado antes e depois como evidência. Ele não precisa permanecer igual, pois uma migração de schema ou checkpoint pode alterar os bytes sem representar perda de dados.

## Schema SQLite v9

Novas tabelas:

- `historico_atualizacoes_reais`;
- `checkpoint_atualizacao`.

Novos índices:

- `idx_historico_atualizacoes_iniciado`;
- `idx_historico_atualizacoes_status`.

## Preparar a release assinada 1.9.1

A Fase 23 inclui o comando:

```powershell
.\PREPARAR_ATUALIZACAO_1_9_1.cmd `
  -ChavePrivada "$HOME\.makeflux\updater\makeflux-studio.key" `
  -ChavePublica "$HOME\.makeflux\updater\makeflux-studio.key.pub"
```

O script baixa o `latest.json` da release v1.9.0, gera a v1.9.1 e cria manifestos separados por canal e rollback. Essa separação é necessária porque o formato estático do atualizador possui uma única versão no topo de cada JSON.

A pasta final é:

```text
dist\updater-v1.9.1
├── MakeFlux.Studio_1.9.1_x64-setup.exe
├── MakeFlux.Studio_1.9.1_x64-setup.exe.sig
├── latest.json
├── windows-x86_64.json
├── beta-windows-x86_64.json
├── rollback-windows-x86_64.json
├── rollback-beta-windows-x86_64.json
├── release-manifest.json
└── checksums.sha256
```

`latest.json` mantém a compatibilidade com o aplicativo 1.9.0 já publicado. O binário 1.9.1 passa a consultar `{{target}}.json`, permitindo que os manifestos de rollback anunciem corretamente a versão 1.9.0.

## Publicar a release v1.9.1

Depois da validação e do commit da fase:

```powershell
git tag -a v1.9.1 -m "MakeFlux Studio 1.9.1 - atualização real"
git push origin v1.9.1
```

Envie **todos** os arquivos da pasta `dist\updater-v1.9.1` para a GitHub Release v1.9.1. O `latest.json` e os manifestos por alvo precisam estar na release marcada como mais recente.

## Homologar em uma instalação 1.9.0

1. instale a release oficial 1.9.0;
2. crie pelo menos um projeto;
3. inicialize o cofre;
4. confirme que o aplicativo mostra v1.9.0;
5. publique a v1.9.1;
6. abra `/atualizacoes`;
7. selecione o canal Estável;
8. pressione **Verificar agora**;
9. baixe o pacote;
10. pressione **Instalar e reiniciar**;
11. confirme que a aplicação voltou em v1.9.1;
12. confirme que os projetos e o cofre permanecem disponíveis;
13. abra `/atualizacoes` e confirme o status `confirmada-legado` da primeira transição;
14. nas atualizações posteriores iniciadas pelo 1.9.1 ou superior, confirme o status `confirmada` e a comparação completa dos dados.

## Teste de rollback

Na versão 1.9.1:

1. abra `/atualizacoes`;
2. pressione **Procurar rollback**;
3. confirme que a versão 1.9.0 aparece como ponto de recuperação;
4. baixe e instale;
5. confirme manualmente o reinício em 1.9.0;
6. valide novamente projetos e cofre.

O 1.9.1 cria o checkpoint antes do rollback, mas o binário antigo 1.9.0 não possui o reconciliador da Fase 23. Portanto, a confirmação imediata do rollback é manual. A reconciliação automática completa vale para destinos que já contenham o runtime da Fase 23 ou superior. O rollback deve ser feito apenas no computador de homologação.

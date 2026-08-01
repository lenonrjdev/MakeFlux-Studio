# Atualizações assinadas do MakeFlux Studio

## Segurança

O atualizador do Tauri exige assinatura e não permite desativar essa verificação. A chave pública é incorporada ao aplicativo de distribuição; a chave privada permanece fora do repositório e deve ser preservada em armazenamento seguro.

## 1. Gerar as chaves

```powershell
.\GERAR_CHAVE_ATUALIZADOR.cmd
```

O destino padrão fica em `%USERPROFILE%\.makeflux\updater`, fora do repositório.

## 2. Preparar a release

```powershell
.\PREPARAR_ATUALIZACAO_ASSINADA.cmd `
  -ChavePrivada "$HOME\.makeflux\updater\makeflux-studio.key" `
  -ChavePublica "$HOME\.makeflux\updater\makeflux-studio.key.pub" `
  -Notas "Notas da versão 1.4.0"
```

O script:

- cria uma configuração temporária do Tauri;
- ativa `createUpdaterArtifacts` somente para a release;
- injeta endpoint e chave pública no build;
- usa a chave privada apenas por variável de ambiente;
- gera instalador e `.sig`;
- cria `latest.json`, `release-manifest.json` e `checksums.sha256`;
- remove a configuração temporária ao finalizar.

## 3. Publicar no GitHub

Crie a tag e a GitHub Release correspondentes à versão. Envie para a mesma release:

- o instalador selecionado pelo script;
- o arquivo `.sig`;
- `latest.json`;
- `checksums.sha256`;
- `release-manifest.json`.

O endpoint padrão é:

```text
https://github.com/lenonrjdev/MakeFlux-Studio/releases/latest/download/latest.json
```

## Rollback

Passe `-ManifestoAnterior caminho\latest.json` ao preparar uma nova release. O script copia a entrada anterior para o alvo customizado `rollback-windows-x86_64`. A Central de Atualizações consulta esse alvo com `allowDowngrades` somente quando o usuário solicita explicitamente um ponto de recuperação.

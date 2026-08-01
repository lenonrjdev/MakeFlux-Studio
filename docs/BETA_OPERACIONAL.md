# Beta operacional do MakeFlux Studio

## Objetivo

A Fase 22 transforma o processo de validação em uma sessão auditável. Cada rodada representa uma máquina, conta ou release candidate específica.

## Fluxo recomendado

1. Instale o MakeFlux em uma máquina limpa.
2. Inicie uma sessão em **Beta operacional**.
3. Resolva os portões automáticos bloqueados.
4. Execute cada teste manual obrigatório e registre uma evidência verificável.
5. Crie um snapshot do SQLite.
6. Exporte o relatório JSON.
7. Aprove a sessão apenas quando o aplicativo indicar prontidão.

## Portões automáticos

O runtime verifica integridade do SQLite, gravação no workspace, cofre, exportação real, provedor de IA, canais, observabilidade e configuração assinada do updater.

## Evidências

Uma evidência pode ser um caminho de arquivo, versão do Windows, link de publicação, ID remoto, nome do instalador, hash, data ou descrição objetiva do resultado.

## Snapshot

O snapshot executa checkpoint do WAL, copia o SQLite e calcula SHA-256. O cofre criptografado não é incluído para evitar que credenciais façam parte do pacote de homologação.

## Critério de aprovação

A sessão só pode ser aprovada quando não houver portão obrigatório bloqueado e todos os testes manuais obrigatórios estiverem concluídos.


## Preparar a release candidate

Depois de consolidar a fase e manter o Git limpo, execute `PREPARAR_RELEASE_CANDIDATE.cmd`. O script reaplica a validação, localiza o instalador NSIS, copia o artefato para `dist/release-candidate`, calcula SHA-256 e cria `release-candidate.json`.

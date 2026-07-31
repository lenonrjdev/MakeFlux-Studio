# Fase 10 — Configurações

A Fase 10 transforma `/configuracoes` em uma central persistente para perfil local, workspace, padrões do estúdio, desempenho, armazenamento, aparência, backup, segurança e atualizações.

## Contratos principais

- `makeflux:workspace-configuracoes:v1`
- `makeflux:workspace-configuracoes-atualizado`
- `makeflux:bloquear-aplicacao`

## Recursos funcionais

- preferências refletidas no shell e no perfil;
- tema e densidade aplicados globalmente;
- backup e restauração JSON do workspace;
- medição real do `localStorage`;
- bloqueio local por PIN com SHA-256;
- configuração de pastas por seletor Tauri;
- política de desempenho, armazenamento e atualização.

A atualização real do aplicativo e do MoneyPrinterTurbo permanece isolada para a fase de integração nativa.

# Fase 22 — Beta operacional

A versão 1.9.0 adiciona uma central de homologação para transformar testes isolados em uma release candidate rastreável.

## Entregas

- portões automáticos de integridade, workspace, cofre, produção, IA, canais, logs e updater;
- sessões de homologação persistentes no SQLite;
- checklist manual com evidências obrigatórias;
- snapshot consistente do banco local com SHA-256;
- relatório JSON sanitizado;
- aprovação bloqueada enquanto existirem critérios obrigatórios pendentes;
- rota `/beta` integrada à navegação.

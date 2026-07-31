# Fase 14 — Desempenho e grandes volumes

A versão 1.1.0 adiciona uma camada operacional para workspaces extensos: paginação nativa no SQLite, renderização virtualizada, métricas, operações em lote canceláveis e manutenção segura do banco.

## Contratos principais

- `PRAGMA user_version = 2`.
- Consultas limitadas a 1.000 registros por página.
- Operações em blocos de 250 registros e transações curtas.
- Cancelamento cooperativo no fim do bloco atual.
- Compactação bloqueada enquanto um lote está ativo.
- Dados de carga isolados pela origem `desempenho-teste`.

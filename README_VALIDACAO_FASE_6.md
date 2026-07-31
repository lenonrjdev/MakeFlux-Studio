# Homologação da Fase 6 — Biblioteca

Execute na raiz do repositório:

```powershell
.\VALIDAR_FASE_ATUAL.cmd
```

A homologação valida estrutura, versões, lint, TypeScript, testes, build estático, rota `/biblioteca`, Rust, Tauri e instalador desktop.

## Contratos específicos

- Workspace `makeflux:workspace-biblioteca:v1`.
- Importação e classificação de recursos.
- Coleções, favoritos, tags, movimentação e duplicação.
- Sincronização de arquivos da Produção.
- Sincronização de prompts do Laboratório de IA.
- Transferência de recursos para o estúdio.
- Pasta raiz integrada ao seletor desktop reutilizável.

A fase está aprovada somente quando o relatório terminar com `FASE APROVADA`.

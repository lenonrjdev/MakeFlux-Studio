# Validação da Fase 9 — Integrações

Execute na raiz do repositório:

```powershell
.\VALIDAR_FASE_ATUAL.cmd
```

A homologação valida:
- rota `/integracoes` e componentes obrigatórios;
- catálogo de motor, IA, mídia, voz, legendas, sistema e publicação;
- modos Online, Híbrido e Offline;
- provedores padrão por capacidade;
- persistência local versionada;
- ausência de persistência da credencial completa;
- teste individual, diagnóstico geral e restauração;
- lint, TypeScript, testes, build Next.js, rotas exportadas, Rust e instalador Tauri.

A fase somente está concluída quando o script exibir `FASE APROVADA`.

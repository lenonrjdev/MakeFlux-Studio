# Validação da Fase 16

A Fase 16 conecta contas sociais por OAuth e envia conteúdo real pelo backend Tauri.

## Executar

```powershell
cd C:\projetos\makeFluxStudio
cargo fmt --manifest-path .\frontend\src-tauri\Cargo.toml
.\VALIDAR_FASE_ATUAL.cmd
```

A fase somente está concluída quando o relatório terminar com `FASE APROVADA`.

## Contratos homologados

- versão 1.3.0 sincronizada;
- rota `/canais` exportada;
- OAuth com state, PKCE e callback loopback temporário;
- tokens no cofre criptografado;
- SQLite schema v4;
- YouTube resumable upload;
- Instagram Reels por media container;
- TikTok Direct Post;
- lint, TypeScript, testes, Next.js, Rust, Tauri e instalador.

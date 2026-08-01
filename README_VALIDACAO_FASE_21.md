# Validação da Fase 21

Execute na raiz:

```powershell
cargo fmt --manifest-path .\frontend\src-tauri\Cargo.toml
.\VALIDAR_FASE_ATUAL.cmd
```

A fase valida a versão `1.8.0`, rota `/distribuicao`, schema SQLite v7, Cloudinary no cofre, upload em blocos, retomada, renovação de tokens, tentativas, cancelamento, recuperação, frontend, Rust, Tauri e instalador.

A fase somente deve ser consolidada quando o relatório terminar com `FASE APROVADA`.

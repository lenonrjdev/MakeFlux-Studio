
# Validação da Fase 19

Execute na raiz:

```powershell
cargo fmt --manifest-path .\frontend\src-tauri\Cargo.toml
.\VALIDAR_FASE_ATUAL.cmd
```

A fase só deve ser consolidada quando o terminal exibir `FASE APROVADA`.

O validador confirma a versão 1.6.0, a rota `/instalacao`, os testes acumulados, o build Next.js, a compilação Rust/Tauri e o instalador desktop.

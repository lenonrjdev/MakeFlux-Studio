# Validação da Fase 15

A Fase 15 adiciona o plugin oficial de notificações do Tauri. Atualize as dependências antes da homologação:

```powershell
cd .\frontend
npm install
cd ..
```

Formate o backend Rust e execute o validador na raiz:

```powershell
cargo fmt --manifest-path .\frontend\src-tauri\Cargo.toml
.\VALIDAR_FASE_ATUAL.cmd
```

A homologação cobre lint, TypeScript, testes acumulados, rota `/rotinas`, schema SQLite v3, agendador, notificações, formatação Rust, compilação Tauri e instalador desktop.

A fase só deve ser consolidada quando o relatório terminar com `FASE APROVADA`.

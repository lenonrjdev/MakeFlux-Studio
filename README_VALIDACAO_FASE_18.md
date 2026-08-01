
# Validação da Fase 18

A Fase 18 consolida observabilidade e diagnóstico técnico no MakeFlux Studio 1.5.0.

O validador executa contrato de arquivos, sincronização de versão, lint sem avisos, TypeScript estrito, testes acumulados, build estático do Next.js, verificação das rotas, formatação e compilação Rust, diagnóstico Tauri e build completo do instalador.

Execute:

```powershell
cargo fmt --manifest-path .\frontend\src-tauri\Cargo.toml
.\VALIDAR_FASE_ATUAL.cmd
```

A fase somente pode ser consolidada quando o terminal apresentar `FASE APROVADA`.

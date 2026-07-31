# Validação da Fase 11 — MakeFlux Studio

A Fase 11 é aprovada somente quando o validador oficial confirma frontend, testes, exportação estática, Rust, Tauri e instalador.

## Executar

```powershell
cd C:\projetos\makeFluxStudio
.\VALIDAR_FASE_ATUAL.cmd
```

Também é possível validar diretamente:

```powershell
.\VALIDAR_FASE_11.cmd
```

## Contratos verificados

- versão `0.11.0` sincronizada;
- rota `/central-de-ajuda` exportada;
- onboarding local persistente;
- biblioteca de guias;
- diagnóstico do workspace;
- solução guiada de problemas;
- pacote `makeflux-support` sanitizado;
- lint sem avisos;
- TypeScript estrito;
- testes automatizados;
- build Next.js;
- Cargo e Rust;
- Tauri e instalador desktop.

A fase somente está homologada quando o terminal exibir:

```text
FASE APROVADA
```

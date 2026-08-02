# Validação da Fase 23

A Fase 23 valida a versão 1.9.1 e o fluxo real de atualização assinada.

## Executar

```powershell
cd C:\projetos\makeFluxStudio

cargo fmt `
  --manifest-path .\frontend\src-tauri\Cargo.toml

.\VALIDAR_FASE_ATUAL.cmd
```

## Cobertura

O validador confirma:

- versões 1.9.1 sincronizadas;
- arquivos acumulados das fases anteriores;
- painel de homologação pós-atualização;
- schema SQLite v9;
- checkpoint pré-instalação;
- snapshot e SHA-256;
- validação do SQLite e do cofre;
- confirmação automática no startup;
- reconhecimento global da transição legada 1.9.0 → 1.9.1 em qualquer rota;
- bloqueio da mesma versão;
- canais estável e beta;
- manifestos independentes de canal e rollback, com a versão 1.9.0 anunciada corretamente;
- lint sem avisos;
- TypeScript estrito;
- testes automatizados;
- build estático Next.js;
- formatação e compilação Rust;
- diagnóstico Tauri;
- build completo e instaladores desktop.

A fase somente deve ser consolidada quando o terminal exibir `FASE APROVADA`.

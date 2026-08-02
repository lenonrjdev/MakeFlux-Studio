# Validação da Fase 24

A Fase 24 valida a versão 1.10.0 e a camada de estabilidade pós-lançamento.

## Executar

```powershell
cd C:\projetos\makeFluxStudio

cargo fmt `
  --manifest-path .\frontend\src-tauri\Cargo.toml

.\VALIDAR_FASE_ATUAL.cmd
```

## Cobertura

O validador confirma:

- versões 1.10.0 sincronizadas;
- rota `/estabilidade` integrada à navegação;
- SQLite schema v10;
- marcação de inicialização e saída limpa;
- detecção de encerramento inesperado;
- modo seguro automático após falhas recorrentes;
- pausa de rotinas e retomadas de rede em modo seguro;
- persistência e restauração da última rota;
- captura sanitizada de erros globais e promessas rejeitadas;
- validação do SQLite, cofre, checkpoint e caches;
- backup preventivo antes do reparo do banco;
- limpeza limitada a caches aprovados;
- relatório sanitizado de estabilidade;
- lint, TypeScript, testes e build Next.js;
- formatação, compilação e build Tauri;
- geração dos instaladores desktop.

A fase somente deve ser consolidada quando o terminal exibir `FASE APROVADA`.

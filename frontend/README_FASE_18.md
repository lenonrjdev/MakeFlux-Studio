
# Fase 18 — Observabilidade e diagnóstico

A Fase 18 adiciona logs estruturados e sanitizados ao MakeFlux Studio 1.5.0.

Principais entregas:

- Central em `/observabilidade`;
- SQLite schema v5 com logs e índices por correlação;
- níveis `debug`, `info`, `aviso` e `erro`;
- origens de interface, Rust, MoneyPrinterTurbo, provedores, publicação e sistema;
- captura de erros globais e rejeições de promessa;
- correlação entre eventos de uma mesma execução;
- retenção configurável em 7, 30 ou 90 dias;
- exportação de diagnóstico JSON sanitizado;
- mascaramento de senhas, tokens, cookies, chaves e caminhos pessoais conhecidos.

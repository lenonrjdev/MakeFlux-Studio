# Fase 15 — Rotinas locais e notificações

A versão 1.2.0 adiciona um agendador persistente no backend Tauri. As rotinas ficam no SQLite, possuem histórico, repetição e recuperação de pendências ao abrir o aplicativo.

## Contratos principais

- `PRAGMA user_version = 3`.
- Worker nativo com ciclo de 15 segundos.
- Recuperação limitada a 20 rotinas vencidas por ciclo.
- Intervalos entre 5 minutos e 7 dias.
- Ações restritas ao próprio workspace e ao SQLite.
- Notificações persistentes mesmo quando a permissão nativa não estiver disponível.
- O aplicativo não instala serviço do Windows e não executa tarefas enquanto estiver totalmente fechado.

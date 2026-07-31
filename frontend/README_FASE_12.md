# Fase 12 — Integração nativa e modo offline

Esta fase substitui as verificações demonstrativas do ambiente local por uma ponte real entre React e o backend Rust do Tauri.

## Entregas

- detecção nativa de Python, FFmpeg, Git, uv, CPU, RAM e GPU;
- gerenciamento do processo local do MoneyPrinterTurbo;
- diagnóstico da API pelo documento OpenAPI;
- criação e acompanhamento de tarefas em `/api/v1/videos` e `/api/v1/tasks/{task_id}`;
- fila híbrida, preservando a simulação quando o motor real não estiver disponível;
- atualização Git por fast-forward com bloqueio de workspace sujo;
- branch de backup e registro de rollback antes da atualização;
- encerramento do processo iniciado pelo MakeFlux ao fechar a janela principal.

## Segurança operacional

O adaptador HTTP aceita apenas HTTP/HTTPS e restringe o MoneyPrinterTurbo a endereços locais. A atualização é recusada quando o repositório possui alterações não salvas. O rollback utiliza somente o commit registrado pelo próprio MakeFlux.

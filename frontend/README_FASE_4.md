# MakeFlux Studio — Fase 4

## Central de produção e fila de renderização

Esta fase transforma a rota `/producao` em uma central operacional completa para acompanhar tarefas locais de criação de vídeo.

### Entregas

- fila persistente em `makeflux:workspace-producao:v1`;
- integração entre o estúdio, projetos e produção;
- estados de fila, processamento, pausa, conclusão, erro e cancelamento;
- prioridades, retomada, nova tentativa, duplicação e limpeza;
- progresso geral e detalhamento por oito etapas;
- painel de logs, erros amigáveis e arquivos produzidos;
- monitor de CPU, RAM, GPU, VRAM e disco preparado para Tauri;
- simulador local de processamento para homologar a experiência antes da API real;
- testes automatizados e validador completo da Fase 4.

A camada local foi isolada em `lib/producao-local.ts`, permitindo substituir a simulação pelo adaptador do MoneyPrinterTurbo sem reconstruir a interface.

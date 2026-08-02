# MakeFlux Studio — Fase 23

## Atualização real 1.9.0 → 1.9.1

A versão 1.9.1 transforma a Central de Atualizações em um fluxo de homologação real. A primeira transição 1.9.0 → 1.9.1 é reconhecida após o reinício a partir do histórico deixado pela versão anterior e recebe a marca `confirmada-legado`. A partir da 1.9.1, toda atualização iniciada pelo aplicativo consolida o WAL, valida o SQLite, cria um snapshot local e registra o estado do cofre antes de instalar.

### Entregas principais

- versão 1.9.1 sincronizada em workspace, frontend, Cargo e Tauri;
- schema SQLite v9;
- checkpoint nativo antes de instalar ou executar rollback;
- histórico persistente de atualizações reais;
- confirmação automática no startup após o reinício;
- reconhecimento seguro da primeira transição legada 1.9.0 → 1.9.1;
- bloqueio de reinstalação da mesma versão;
- canais estável e beta por alvo assinado;
- snapshot local dos dados antes da troca de binário;
- validação de integridade, contagem de registros e presença do cofre;
- preparador específico para a release assinada v1.9.1 com rollback para v1.9.0;
- painel de homologação dentro de `/atualizacoes`;
- validador acumulado da Fase 23.

### Regra de segurança

O snapshot é local e não contém a chave descriptografada do cofre. O arquivo do cofre permanece criptografado e não é copiado para a release.

## Reconciliação global

A primeira transição 1.9.0 → 1.9.1 é reconhecida no startup da interface em qualquer rota, e não somente ao abrir a Central de Atualizações.

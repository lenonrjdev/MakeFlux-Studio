# Fase 17 — Atualizações assinadas

Esta fase conecta o aplicativo ao plugin oficial de atualização do Tauri, com verificação obrigatória de assinatura, progresso de download, instalação, reinicialização e alvo opcional de rollback.

A rota `/atualizacoes` funciona em modo informativo na prévia web. Verificação e instalação reais exigem o aplicativo desktop e um build de distribuição criado com endpoint HTTPS e chave pública.

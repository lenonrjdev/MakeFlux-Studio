# Plano de fases — MakeFlux Studio

## Fase 1 — Fundação visual e aplicativo desktop — concluída
- Shell Tauri 2 + Next.js com exportação estática.
- Sidebar completa e navegação de todos os módulos.
- Página Início fiel à referência clean enviada.
- Resumo do estúdio, projetos recentes, busca e filtros.
- Seletor reutilizável de pasta com Tauri Dialog e fallback web.
- Rotas provisórias para evitar páginas quebradas.

## Fase 2 — Criar vídeo — concluída
- Fluxo guiado de Ideia, Roteiro, Cenas, Narração, Legendas, Música e Exportação.
- Modos Rápido, Assistido e Avançado.
- Storyboard, editor de roteiro, prévias, controles de áudio e revisão final.
- Interface pronta para receber contratos e chamadas do MoneyPrinterTurbo.

## Fase 3 — Projetos — concluída
- Persistência local versionada e migração do rascunho anterior.
- Autosave no estúdio e carregamento por identificador de projeto.
- Busca, filtros, ordenação, grade e lista.
- Pastas virtuais, favoritos, duplicação, movimentação e arquivo.
- Painel de detalhes, histórico, versões, restauração e exportação JSON.
- Página Início conectada ao workspace real de projetos.

## Fase 4 — Produção — concluída
- Fila local persistente e integrada aos projetos.
- Progresso geral e detalhado por oito etapas.
- Pausa, retomada, cancelamento, prioridade, duplicação e nova tentativa.
- Erros amigáveis, logs técnicos e arquivos gerados.
- Monitor de CPU, RAM, GPU, VRAM e disco preparado para Tauri.
- Simulador isolado e pronto para substituição pelo MoneyPrinterTurbo.

## Fase 5 — Laboratório de IA — concluída
- Ferramentas separadas para roteiros, prompts do sistema, ganchos, termos visuais e metadados.
- Experimentos persistentes com parâmetros, histórico e duplicação.
- Geração local simulada com duas a quatro variações comparáveis.
- Pontuações de clareza, engajamento, representabilidade visual e aderência.
- Comparação A/B, escolha do melhor resultado e biblioteca de presets.
- Transferência do resultado aprovado para um novo projeto no estúdio.

## Fase 6 — Biblioteca — concluída
- Acervo local para vídeos, imagens, músicas, narrações, legendas, fontes, prompts e exportações.
- Busca, categorias, ordenação, visualização em grade ou lista e filtros por coleção.
- Coleções personalizadas, favoritos, tags, metadados, duplicação, movimentação e remoção segura.
- Importação de múltiplos arquivos e pasta raiz reutilizando o seletor desktop.
- Sincronização das exportações da Produção e dos presets do Laboratório de IA.
- Transferência de recursos aprovados diretamente para as etapas do estúdio.

## Fase 7 — Templates — concluída
- Oito templates oficiais para curiosidades, listas, histórias, notícias, educação, produtos, documentários e Dark Lo-fi.
- Presets completos de roteiro, prompts, materiais, voz, legendas, música e exportação.
- Criação manual ou a partir de projetos existentes.
- Busca, categorias, filtros, favoritos, grade, lista, duplicação, edição e arquivamento.
- Importação e exportação JSON para compartilhar configurações.
- Aplicação direta no estúdio e salvamento da configuração atual como template.

## Fase 8 — Publicação — concluída
- Central de distribuição com rascunhos, conteúdos prontos, agendados, publicados e falhas.
- Metadados completos: título, descrição, hashtags e chamada para ação.
- Quatro estilos de thumbnail com texto, cor e prévia em tempo real.
- Planejamento mensal em calendário e visualização em grade.
- Criação a partir de projetos ou vídeos concluídos na Produção.
- Agendamento local, registro do link publicado, favoritos, duplicação, arquivo e histórico.

## Fase 9 — Integrações — concluída
- Catálogo de provedores para MoneyPrinterTurbo, OpenAI, Ollama, Gemini, DeepSeek, mídia, TTS, Whisper, FFmpeg e publicação.
- Modos Online, Híbrido e Offline com indicação de compatibilidade.
- Provedores padrão por capacidade: motor, roteiro, materiais, voz, legendas, renderização e publicação.
- Configuração de endpoints, modelos, parâmetros e confirmação segura de credenciais sem persistir o segredo completo.
- Teste individual, diagnóstico geral, histórico, ativação, restauração e mensagens de estado.
- Camada local isolada e preparada para o adaptador Tauri, cofre seguro e API real do MoneyPrinterTurbo.

## Fase 10 — Configurações — concluída
- Perfil local com foto, idioma, autoria e identidade refletida no shell.
- Workspace com pastas reutilizáveis, nomenclatura e organização de exportações.
- Padrões de criação, desempenho, limites de CPU/GPU, fila e RAM.
- Medição real do armazenamento local, política de cache e limpeza segura.
- Tema claro, escuro ou do sistema, densidade, escala, contraste e sidebar compacta.
- Backup JSON real, restauração por mesclagem ou substituição e seleção do conteúdo.
- Bloqueio local por PIN com hash SHA-256 e inatividade configurável.
- Preferências de atualização preparadas para aplicativo, motor e rollback.

## Fase 11 — Central de ajuda — concluída
- Onboarding persistente com seis etapas para preparar o workspace e concluir o primeiro fluxo.
- Biblioteca de guias por categoria, favoritos, progresso e perguntas frequentes.
- Diagnóstico local do armazenamento, projetos, configurações, integrações, Tauri e Web Crypto.
- Solução guiada para falhas de motor, IA, FFmpeg, voz, legendas e espaço em disco.
- Pacote de suporte JSON com credenciais, PIN, foto e caminhos pessoais sanitizados.
- Histórico de novidades e atalhos internos para cada módulo relacionado.

## Fase 12 — Integração completa e modo offline — concluída
- Ponte Tauri com comandos Rust para HTTP local, capacidades do sistema e processo do motor.
- Detecção real de Python, FFmpeg, Git, uv, CPU, RAM e GPU.
- Diagnóstico OpenAPI e adaptador REST para criar e acompanhar tarefas do MoneyPrinterTurbo.
- Fila híbrida: motor real quando conectado e simulação local como fallback seguro.
- Inicialização, status, logs e encerramento controlado do processo `main.py`.
- Atualização Git por fast-forward, bloqueio de alterações locais, branch de backup e rollback.
- Diagnóstico da Central de ajuda conectado ao runtime nativo.

## Fase 13 — Qualidade, migrações e distribuição — concluída
- Testes de ponta a ponta para os fluxos críticos e regressão acumulada.
- Migração transacional e idempotente do `localStorage` para SQLite com fallback preservado.
- Sincronização periódica do workspace e hidratação segura em novas instalações.
- Cofre criptografado com Argon2, ChaCha20-Poly1305 e chave somente em memória.
- Telemetria local opcional, desativada por padrão e sem envio para servidores.
- Central de qualidade com status de dados, cofre, testes e distribuição.
- Preparação de MSI/NSIS, manifesto de release, checksums SHA-256 e fluxo externo de assinatura.
- Versão `1.0.0` sincronizada em Next.js, Cargo e Tauri.

## Fase 14 — Desempenho e grandes volumes — concluída
- Schema SQLite v2 com índices para atualização, origem e telemetria.
- Paginação nativa com filtros, ordenação, cursor e métricas de duração.
- Lista virtualizada no frontend para manter a interface leve com milhares de registros.
- Operações em lote persistentes, transacionais, executadas em blocos e canceláveis.
- Carga controlada de até 100 mil registros para homologação de campo.
- Checkpoint WAL, otimização de índices, compactação protegida e histórico de manutenção.
- Central `/desempenho` com saúde do banco, fragmentação e consultas lentas.
- Versão `1.1.0` sincronizada em Next.js, Cargo e Tauri.

## Fase 15 — Rotinas locais e notificações — concluída
- Schema SQLite v3 com rotinas, execuções e notificações persistentes.
- Agendador nativo em thread própria com ciclo seguro a cada 15 segundos.
- Repetição única, diária, semanal, mensal ou por intervalo configurável.
- Recuperação limitada de rotinas vencidas ao reabrir o aplicativo.
- Ações locais para lembretes, integridade, otimização, WAL, telemetria e resumo do workspace.
- Histórico completo, pausa, retomada, execução imediata e remoção segura.
- Notificações nativas pelo plugin oficial do Tauri e central interna no cabeçalho.
- Versão `1.2.0` sincronizada em Next.js, Cargo e Tauri.

## Pós-1.2 — Evolução contínua
Publicação real por OAuth, atualização automática assinada e novos provedores serão entregues por versões incrementais.

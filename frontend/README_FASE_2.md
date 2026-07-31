# MakeFlux Studio — Fase 2

A Fase 2 implementa o módulo **Criar vídeo** como um estúdio guiado completo no frontend desktop.

## Entregas

- Fluxo em sete etapas: Ideia, Roteiro, Cenas, Narração, Legendas, Música e Exportação.
- Navegação livre entre etapas com indicação de progresso.
- Modos Rápido, Assistido e Avançado.
- Editor de roteiro com demonstração local, contagem de palavras e duração estimada.
- Storyboard editável com termos visuais, duração, ordem, duplicação e remoção.
- Escolha de provedor, voz, velocidade e volume de narração.
- Editor visual de legendas com presets, posição e tamanho.
- Biblioteca demonstrativa de músicas e controles de mixagem.
- Revisão completa de exportação, codificador, qualidade e quantidade de versões.
- Resumo lateral persistente durante todo o fluxo.
- Seletores nativos reutilizáveis para pastas de materiais, músicas e exportações.
- Salvamento manual do rascunho no `localStorage` para validar a experiência do frontend.
- Cabeçalho global adaptado à rota atual.

## Limite desta fase

Nenhuma chamada real ao MoneyPrinterTurbo, OpenAI, bancos de mídia, TTS ou FFmpeg é executada. Os botões de geração apresentam respostas demonstrativas para validar o fluxo e a experiência antes da integração do motor.

## Executar

```bash
npm install
npm run desktop
```

Somente no navegador:

```bash
npm run dev
```

## Estrutura principal adicionada

```text
app/criar-video/
components/criar-video/
components/criar-video/etapas/
content/criar-video.ts
data/criar-video.ts
types/criar-video.ts
```

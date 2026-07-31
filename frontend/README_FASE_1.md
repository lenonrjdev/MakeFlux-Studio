# MakeFlux Studio — Fase 1

Primeira entrega do frontend desktop baseada na referência visual enviada.

## Executar no navegador

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Executar como aplicativo desktop

Pré-requisitos do Tauri 2 no Windows: Rust, Microsoft C++ Build Tools e WebView2.

```bash
npm install
npm run desktop
```

## Gerar build

```bash
npm run build
npm run desktop:build
```

## Estrutura

- `app/`: composição das páginas e rotas.
- `components/`: componentes organizados por módulo.
- `content/`: textos fixos e plano descritivo dos módulos.
- `data/`: navegação, métricas e dados temporários da interface.
- `hooks/`: comportamento reutilizável, incluindo seleção de pasta.
- `src-tauri/`: shell desktop Tauri 2.

## Observação

Os projetos exibidos são dados de apresentação da Fase 1. A persistência real entra na Fase 3 e a integração com o MoneyPrinterTurbo entra nas fases de Integrações e modo offline.

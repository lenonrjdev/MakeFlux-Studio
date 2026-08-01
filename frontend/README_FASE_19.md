
# Fase 19 — Instalação assistida

A versão 1.6.0 adiciona uma preparação guiada para Windows. A nova rota `/instalacao` detecta ferramentas, cria o workspace, instala dependências aprovadas via WinGet, clona o MoneyPrinterTurbo e sincroniza o ambiente Python com uv.

## Segurança

O backend aceita somente cinco identificadores fixos: Git, Python 3.11, FFmpeg, uv e ImageMagick. Nenhum comando arbitrário enviado pelo frontend é executado.

## MoneyPrinterTurbo

O assistente usa o repositório oficial `https://github.com/harry0703/MoneyPrinterTurbo.git`, executa `uv python install 3.11`, `uv sync --frozen` e cria `config.toml` a partir de `config.example.toml` quando necessário.

## Homologação

A etapa final valida os arquivos do motor, o Python virtual, FFmpeg e ImageMagick. Em seguida, pode iniciar a API em `http://127.0.0.1:8080` e abrir o fluxo de criação do primeiro vídeo.

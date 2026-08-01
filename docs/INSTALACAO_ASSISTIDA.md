
# Instalação assistida do MakeFlux Studio

## Objetivo

Levar uma instalação limpa do Windows até um ambiente local pronto para o MoneyPrinterTurbo sem exigir que o usuário copie comandos de terminal.

## Estrutura padrão

Quando nenhuma pasta é informada, o aplicativo usa `Documentos\\MakeFlux Studio` e cria:

- `Motores`
- `Projetos`
- `Exportacoes`
- `Cache`
- `Modelos`
- `Logs`

## Dependências aprovadas

| Item | Identificador WinGet | Obrigatório |
|---|---|---|
| Git | `Git.Git` | Sim |
| uv | `astral-sh.uv` | Sim |
| FFmpeg | `Gyan.FFmpeg` | Sim |
| ImageMagick | `ImageMagick.ImageMagick` | Sim |
| Python 3.11 | `Python.Python.3.11` | Recomendado; o uv também gerencia o runtime do motor |

## Fluxo do motor

1. Clonar o repositório oficial.
2. Criar `config.toml` a partir do exemplo.
3. Executar `uv python install 3.11`.
4. Executar `uv sync --frozen`.
5. Registrar `.venv\\Scripts\\python.exe` na integração do motor.
6. Validar os arquivos e iniciar a API.

## Limites

A renderização de um vídeo real ainda exige que o usuário configure os provedores necessários no `config.toml` ou na interface do motor. O assistente não inventa nem armazena credenciais.

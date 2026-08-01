# Provedores reais de IA — Fase 20

A Fase 20 conecta OpenAI, Google Gemini, DeepSeek e Ollama ao Laboratório de IA.

## Segurança
- Chaves em `makeflux-vault.json`, protegidas pelo cofre da Fase 13.
- O frontend nunca recebe a chave após o salvamento.
- Logs usam a sanitização da Fase 18.

## Execução
O usuário escolhe um provedor ou o modo automático. Falhas, indisponibilidade e limite diário podem acionar fallback pela prioridade. Cada tentativa registra modelo, tokens, custo configurado, duração e correlação.

## Custos
Os valores por milhão de tokens são informados pelo usuário, pois preços podem mudar. O MakeFlux calcula uma estimativa local a partir do uso retornado pelo provedor; isso não substitui a cobrança oficial.

## Ollama
O endpoint padrão é `http://127.0.0.1:11434` e o modelo inicial é `gemma3`. O modelo deve estar instalado no Ollama.

# MakeFlux Studio — Fase 5

## Laboratório de IA

Esta fase transforma a rota `/laboratorio-de-ia` em um ambiente controlado para testar instruções, comparar variações e reaproveitar resultados no estúdio de criação.

### Entregas

- cinco ferramentas: roteiros, prompts do sistema, ganchos, termos visuais e metadados;
- workspace persistente em `makeflux:workspace-laboratorio-ia:v1`;
- criação, edição, duplicação e exclusão de experimentos;
- parâmetros de modelo, idioma, plataforma, criatividade e número de variações;
- geração local simulada preservando as condições de comparação;
- métricas de clareza, engajamento, representabilidade visual e aderência;
- comparação A/B e seleção do melhor resultado;
- biblioteca de prompts com presets e favoritos;
- criação de presets a partir de experimentos próprios;
- transferência do resultado aprovado para `/criar-video`;
- testes e homologação automatizada da Fase 5.

A camada local foi isolada em `lib/laboratorio-ia-local.ts`. A Fase 9 substituirá o simulador por provedores reais sem reconstruir a interface.

# Homologação da Fase 7 — Templates

A Fase 7 cria a central de templates completos do MakeFlux Studio. Um template preserva roteiro, prompts, storyboard, narração, legendas, música e exportação em um único preset reutilizável.

## Executar a homologação

Na raiz do repositório:

```powershell
cd C:\projetos\makeFluxStudio
.\VALIDAR_FASE_ATUAL.cmd
```

A fase somente está consolidada quando o terminal exibir `FASE APROVADA`.

## Contratos validados

- rota estática `/templates`;
- templates oficiais iniciais;
- persistência `makeflux:workspace-templates:v1`;
- criação manual ou a partir de projetos;
- edição, favoritos, duplicação, arquivamento e exclusão segura;
- importação e exportação JSON;
- aplicação no estúdio por transferência de uso único;
- salvamento da configuração atual do estúdio como template;
- lint, TypeScript, testes, build Next.js, Rust, Tauri e instalador.

## Arquivos principais

```text
frontend/components/templates/
frontend/content/templates.ts
frontend/data/templates.ts
frontend/hooks/use-templates-locais.ts
frontend/lib/templates-locais.ts
frontend/types/templates.ts
frontend/test/fase-07-templates.test.mjs
```

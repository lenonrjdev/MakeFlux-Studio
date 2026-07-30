# MakeFlux Studio — Fase 3

A Fase 3 transforma **Projetos** em uma central persistente para organizar todo o trabalho criado no estúdio.

## Entregas

- Central de projetos com visualização em grade e lista.
- Busca por nome, tema e plataforma.
- Filtros por ativos, rascunhos, prontos, concluídos e arquivados.
- Ordenação por atualização, antiguidade, nome e progresso.
- Pastas virtuais reutilizáveis com criação, seleção e remoção segura.
- Favoritos, duplicação, movimentação entre pastas e arquivamento.
- Exclusão definitiva disponível somente para projetos arquivados.
- Painel lateral de detalhes com status, pasta, progresso e ações.
- Histórico de atividades do projeto.
- Versões manuais com restauração de configurações.
- Exportação individual do projeto em JSON.
- Persistência local versionada em `localStorage`.
- Migração automática do rascunho criado na Fase 2.
- Autosave com atraso controlado no estúdio de criação.
- Carregamento e continuação de projetos por `?projeto=<id>`.
- Página Início conectada aos projetos reais do armazenamento local.
- Métricas da página Início atualizadas com os estados reais.

## Fluxo de persistência

```text
Criar vídeo
  → cria ou carrega um projeto local
  → salva alterações automaticamente
  → salva versões manuais no histórico
  → continua disponível na Central de Projetos
```

## Limite desta fase

A persistência ainda é local e voltada à validação do frontend. Na integração desktop completa, o mesmo contrato será levado para SQLite, mantendo o armazenamento local como mecanismo de migração e recuperação.

## Executar

```bash
npm run dev
```

Aplicativo desktop:

```bash
npm run desktop
```

Validação:

```bash
npm run build
```

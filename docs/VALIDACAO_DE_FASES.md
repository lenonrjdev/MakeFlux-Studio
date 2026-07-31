# Validação automatizada do MakeFlux Studio

A partir da Fase 3, uma fase só deve ser considerada concluída depois que o script de aceitação terminar com o resultado **FASE APROVADA**.

## Comandos principais

Execute sempre na raiz `C:\projetos\makeFluxStudio`.

### 1. Diagnóstico do ambiente

```powershell
.\VALIDAR_AMBIENTE.cmd
```

Verifica a raiz Git única, Node.js, npm, estrutura do projeto e arquivos obrigatórios.

### 2. Validação rápida do frontend

```powershell
.\VALIDAR_FRONTEND.cmd
```

Executa:

- instalação de dependências quando necessária;
- ESLint sem avisos;
- TypeScript com `tsc --noEmit`;
- testes automatizados com Node Test Runner;
- build estático do Next.js;
- verificação das páginas geradas em `out`.

### 3. Validação do desktop sem gerar instalador

```powershell
.\VALIDAR_DESKTOP.cmd
```

Executa tudo do frontend e também:

- `cargo fmt --check`;
- `cargo check`;
- diagnóstico do Tauri 2.

### 4. Aceitação completa da fase atual

```powershell
.\VALIDAR_FASE_ATUAL.cmd
```

Este é o script oficial antes do commit. Além das validações anteriores, ele executa o build completo do Tauri e confirma que um instalador foi criado em:

```text
frontend\src-tauri\target\release\bundle
```

### 5. Revalidar uma fase específica

```powershell
.\VALIDAR_FASE_03.cmd
.\VALIDAR_FASE_04.cmd
.\VALIDAR_FASE_05.cmd
.\VALIDAR_FASE_06.cmd
.\VALIDAR_FASE_07.cmd
```

Cada comando usa o contrato imutável correspondente em `scripts/validacao/fases`.

## Relatórios

Cada execução cria logs e um resumo em:

```text
scripts\.validacao\fase-XX\<data-hora>\
```

O resultado mais recente também fica em:

```text
scripts\.validacao\ultimo-resultado.json
```

A pasta `scripts/.validacao` é ignorada pelo Git e guarda somente relatórios locais.

## Critério para concluir uma fase

A fase é aprovada somente quando todos estes blocos passam:

1. Estrutura do repositório e ausência de `.git` dentro de `frontend`.
2. Ferramentas mínimas instaladas.
3. Contrato de arquivos e rotas da fase.
4. Versões sincronizadas entre Next.js, Tauri e Cargo.
5. Ausência de arquivos sensíveis rastreados pelo Git.
6. Lint sem avisos.
7. TypeScript sem erros.
8. Testes automatizados aprovados.
9. Build estático Next.js aprovado e rotas exportadas.
10. Rust formatado e compilação nativa aprovada.
11. Diagnóstico Tauri aprovado.
12. Instalador desktop gerado no script de aceitação completa.

## Evolução nas próximas fases

Cada nova fase deve adicionar um manifesto próprio:

```text
scripts\validacao\fases\fase-05.json
scripts\validacao\fases\fase-06.json
...
```

Depois, `validar-fase-atual.ps1` passa a apontar para o manifesto mais recente. Os manifestos antigos permanecem disponíveis para regressão.


## Fase 6 — Biblioteca

Valida o acervo local, coleções, importação, sincronização com Produção e Laboratório de IA, transferência ao estúdio, rota exportada e aplicativo desktop.


## Fase 7 — Templates

Valida presets completos, criação a partir de projetos, persistência, importação/exportação JSON, transferência ao estúdio, rota exportada e aplicativo desktop.


## Fase 8 — Publicação

Execute `VALIDAR_FASE_08.cmd` ou `VALIDAR_FASE_ATUAL.cmd`. A homologação inclui contratos de publicação, metadados, calendário, integração com Produção, build Next.js e instalador Tauri.

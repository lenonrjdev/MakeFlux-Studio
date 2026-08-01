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
.\VALIDAR_FASE_08.cmd
.\VALIDAR_FASE_09.cmd
.\VALIDAR_FASE_10.cmd
.\VALIDAR_FASE_11.cmd
.\VALIDAR_FASE_12.cmd
.\VALIDAR_FASE_13.cmd
.\VALIDAR_FASE_14.cmd
.\VALIDAR_FASE_15.cmd
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

## Fase 9 — Integrações

Execute `VALIDAR_FASE_09.cmd` ou `VALIDAR_FASE_ATUAL.cmd`. A homologação inclui catálogo de provedores, modos de processamento, padrões por capacidade, persistência segura, diagnóstico demonstrativo, rota exportada e instalador Tauri.


## Fase 10 — Configurações

Valida perfil local, workspace, padrões de criação, desempenho, armazenamento, aparência global, backup JSON, restauração, bloqueio local por PIN e preferências de atualização. O manifesto oficial é `scripts/validacao/fases/fase-10.json`.

## Fase 11 — Central de ajuda

Valida onboarding, biblioteca de guias, perguntas frequentes, diagnóstico local, checklists de solução de problemas, sanitização do pacote de suporte, rota `/central-de-ajuda`, build estático e instalador Tauri. O manifesto oficial é `scripts/validacao/fases/fase-11.json`.


## Fase 12

A Fase 12 adiciona validação dos comandos Rust, adaptador REST, fila híbrida, detecção offline e atualização segura do MoneyPrinterTurbo. O manifesto oficial é `scripts/validacao/fases/fase-12.json`.


## Fase 13 — Qualidade e distribuição 1.0

Valida a migração para SQLite, o cofre criptografado, a telemetria local opcional, os testes de ponta a ponta, a rota `/qualidade`, a versão `1.0.0`, o build Tauri e o instalador desktop. O manifesto oficial é `scripts/validacao/fases/fase-13.json`.


## Fase 14 — Desempenho e grandes volumes

Valida a versão 1.1.0, schema SQLite v2, paginação, virtualização, lotes canceláveis, métricas, manutenção e build desktop completo.


## Fase 15 — Rotinas locais e notificações

Valida a versão 1.2.0, schema SQLite v3, rotinas persistentes, repetição, recuperação de pendências, histórico, central de notificações, plugin nativo do Tauri, rota `/rotinas` e instalador desktop completo.

## Fase 16 — OAuth e publicação real
Valida a rota `/canais`, o schema SQLite v4, o cofre de tokens, o callback loopback, os três adaptadores de publicação e a distribuição desktop 1.3.0.


## Fase 17 — Atualizações assinadas

Valida a versão 1.4.0, rota `/atualizacoes`, plugins updater/process, assinatura obrigatória, fluxo de download e instalação, rollback customizado e scripts seguros de release.


## Hotfix 1.4.1 — interface clara e exportações reais

Valida tema exclusivamente claro, migração de preferências antigas, criação de pasta de exportação, consolidação de arquivos reais do MoneyPrinterTurbo e ações de reprodução/localização no aplicativo desktop.

Comando principal:

```powershell
.\VALIDAR_FASE_ATUAL.cmd
```


## Fase 18 — Observabilidade e diagnóstico

Valida a rota `/observabilidade`, schema SQLite v5, sanitização, correlação, retenção, exportação de diagnóstico, captura global de erros, frontend e aplicativo desktop 1.5.0.

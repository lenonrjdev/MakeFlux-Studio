import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const raiz = dirname(dirname(fileURLToPath(import.meta.url)));
const ler = (caminho) => readFileSync(join(raiz, caminho), "utf8");

test("a Fase 8 possui todos os componentes da Central de Publicação", () => {
  const componentes = [
    "components/publicacao/central-publicacao.tsx",
    "components/publicacao/cabecalho-publicacao.tsx",
    "components/publicacao/resumo-publicacao.tsx",
    "components/publicacao/painel-canais-publicacao.tsx",
    "components/publicacao/barra-filtros-publicacao.tsx",
    "components/publicacao/grade-publicacoes.tsx",
    "components/publicacao/cartao-publicacao.tsx",
    "components/publicacao/calendario-publicacoes.tsx",
    "components/publicacao/painel-detalhes-publicacao.tsx",
    "components/publicacao/modal-criar-publicacao.tsx",
    "components/publicacao/estado-vazio-publicacao.tsx",
  ];
  for (const componente of componentes) assert.equal(existsSync(join(raiz, componente)), true, `Componente ausente: ${componente}`);
});

test("o workspace de Publicação possui contrato persistente versionado", () => {
  const fonte = ler("lib/publicacao-local.ts");
  assert.match(fonte, /CHAVE_WORKSPACE_PUBLICACAO\s*=\s*["']makeflux:workspace-publicacao:v1["']/);
  assert.match(fonte, /EVENTO_WORKSPACE_PUBLICACAO/);
  assert.match(fonte, /carregarWorkspacePublicacao/);
  assert.match(fonte, /salvarWorkspacePublicacao/);
  assert.match(fonte, /versao:\s*1/);
});

test("a Publicação cobre metadados, thumbnails, calendário, status e links", () => {
  const tipos = ler("types/publicacao.ts");
  for (const campo of ["titulo", "descricao", "hashtags", "chamadaParaAcao", "estiloThumbnail", "agendadaPara", "linkPublicado", "historico"]) assert.match(tipos, new RegExp(campo));
  for (const status of ["rascunho", "pronta", "agendada", "publicada", "falha", "arquivada"]) assert.match(tipos, new RegExp(status));
});

test("publicações podem ser criadas a partir da Produção", () => {
  const fonte = ler("lib/publicacao-local.ts");
  const central = ler("components/publicacao/central-publicacao.tsx");
  assert.match(fonte, /carregarWorkspaceProducao/);
  assert.match(fonte, /criarPublicacaoDeTarefaLocal/);
  assert.match(central, /tarefasDisponiveis/);
  assert.match(central, /tarefaInicialId/);
});

test("o módulo oferece geração assistida de metadados e planejamento", () => {
  const fonte = ler("lib/publicacao-local.ts");
  for (const operacao of ["gerarMetadadosPublicacaoLocal", "agendarPublicacaoLocal", "marcarPublicacaoComoPublicadaLocal", "duplicarPublicacaoLocal", "arquivarPublicacaoLocal", "excluirPublicacaoLocal"]) assert.match(fonte, new RegExp(`export function ${operacao}\\b`));
});

test("a página Publicação entrega a central real", () => {
  const pagina = ler("app/publicacao/page.tsx");
  assert.match(pagina, /CentralPublicacao/);
  assert.doesNotMatch(pagina, /PaginaEmConstrucao/);
});

test("a visualização inclui grade e calendário mensal", () => {
  const central = ler("components/publicacao/central-publicacao.tsx");
  const calendario = ler("components/publicacao/calendario-publicacoes.tsx");
  assert.match(central, /visualizacao === ["']calendario["']/);
  assert.match(calendario, /Array\.from\(\{ length: 42 \}/);
  assert.match(calendario, /aoMudarMes/);
});

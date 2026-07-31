import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const raiz = dirname(dirname(fileURLToPath(import.meta.url)));
const ler = (caminho) => readFileSync(join(raiz, caminho), "utf8");

test("a Fase 4 possui todos os componentes da Central de Produção", () => {
  const componentes = [
    "components/producao/central-producao.tsx",
    "components/producao/cabecalho-producao.tsx",
    "components/producao/resumo-producao.tsx",
    "components/producao/barra-filtros-producao.tsx",
    "components/producao/fila-renderizacao.tsx",
    "components/producao/cartao-tarefa-producao.tsx",
    "components/producao/painel-detalhes-tarefa.tsx",
    "components/producao/monitor-recursos.tsx",
    "components/producao/progresso-etapas.tsx",
    "components/producao/estado-vazio-producao.tsx",
  ];
  for (const componente of componentes) {
    assert.equal(existsSync(join(raiz, componente)), true, `Componente ausente: ${componente}`);
  }
});

test("o workspace de produção possui chave persistente e contrato versionado", () => {
  const fonte = ler("lib/producao-local.ts");
  assert.match(fonte, /CHAVE_WORKSPACE_PRODUCAO\s*=\s*["']makeflux:workspace-producao:v1["']/);
  assert.match(fonte, /versao:\s*1/);
  assert.match(fonte, /carregarWorkspaceProducao/);
  assert.match(fonte, /salvarWorkspaceProducao/);
});

test("a fila cobre controles operacionais e tratamento de falhas", () => {
  const fonte = ler("lib/producao-local.ts");
  for (const operacao of [
    "criarTarefaProducaoLocal",
    "alternarFilaProducaoLocal",
    "pausarTarefaProducaoLocal",
    "retomarTarefaProducaoLocal",
    "cancelarTarefaProducaoLocal",
    "tentarNovamenteTarefaProducaoLocal",
    "duplicarTarefaProducaoLocal",
    "alterarPrioridadeTarefaProducaoLocal",
    "simularErroTarefaProducaoLocal",
    "avancarSimulacaoProducaoLocal",
  ]) {
    assert.match(fonte, new RegExp(`export function ${operacao}\\b`), `Operação ausente: ${operacao}`);
  }
});

test("o fluxo do estúdio envia a configuração final para a produção", () => {
  const estudio = ler("components/criar-video/estudio-criacao-video.tsx");
  assert.match(estudio, /criarTarefaProducaoLocal/);
  assert.match(estudio, /router\.push\(`\/producao\?tarefa=/);
  assert.match(estudio, /Enviado para produção/);
});

test("a Central de Projetos também permite iniciar uma renderização", () => {
  const central = ler("components/projetos/central-projetos.tsx");
  const painel = ler("components/projetos/painel-detalhes-projeto.tsx");
  assert.match(central, /criarTarefaProducaoLocal/);
  assert.match(painel, /Enviar para produção/);
});

test("a página de produção entrega a Central de Produção real", () => {
  const pagina = ler("app/producao/page.tsx");
  assert.match(pagina, /CentralProducao/);
  assert.doesNotMatch(pagina, /PaginaEmConstrucao/);
});

test("o contrato de produção possui as oito etapas do motor", () => {
  const dados = ler("data/producao.ts");
  for (const etapa of [
    "roteiro",
    "termos-visuais",
    "materiais",
    "narracao",
    "legendas",
    "composicao",
    "renderizacao",
    "finalizacao",
  ]) {
    assert.match(dados, new RegExp(`["']${etapa}["']`), `Etapa ausente: ${etapa}`);
  }
});

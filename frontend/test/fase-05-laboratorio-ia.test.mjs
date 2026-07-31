import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const raiz = dirname(dirname(fileURLToPath(import.meta.url)));
const ler = (caminho) => readFileSync(join(raiz, caminho), "utf8");

test("a Fase 5 possui todos os componentes do Laboratório de IA", () => {
  const componentes = [
    "components/laboratorio-ia/central-laboratorio-ia.tsx",
    "components/laboratorio-ia/cabecalho-laboratorio-ia.tsx",
    "components/laboratorio-ia/resumo-laboratorio-ia.tsx",
    "components/laboratorio-ia/navegacao-ferramentas-laboratorio.tsx",
    "components/laboratorio-ia/historico-experimentos.tsx",
    "components/laboratorio-ia/painel-configuracao-experimento.tsx",
    "components/laboratorio-ia/painel-resultados-laboratorio.tsx",
    "components/laboratorio-ia/cartao-resultado-experimento.tsx",
    "components/laboratorio-ia/biblioteca-presets-prompts.tsx",
    "components/laboratorio-ia/estado-vazio-laboratorio.tsx",
  ];
  for (const componente of componentes) {
    assert.equal(existsSync(join(raiz, componente)), true, `Componente ausente: ${componente}`);
  }
});

test("o workspace do laboratório possui chave persistente e contrato versionado", () => {
  const fonte = ler("lib/laboratorio-ia-local.ts");
  assert.match(
    fonte,
    /CHAVE_WORKSPACE_LABORATORIO_IA\s*=\s*["']makeflux:workspace-laboratorio-ia:v1["']/,
  );
  assert.match(fonte, /versao:\s*1/);
  assert.match(fonte, /carregarWorkspaceLaboratorioIa/);
  assert.match(fonte, /salvarWorkspaceLaboratorioIa/);
});

test("o laboratório cobre criação, execução, comparação, presets e transferência", () => {
  const fonte = ler("lib/laboratorio-ia-local.ts");
  for (const operacao of [
    "criarExperimentoLaboratorioIaLocal",
    "atualizarExperimentoLaboratorioIaLocal",
    "executarExperimentoLaboratorioIaLocal",
    "selecionarMelhorResultadoLaboratorioIaLocal",
    "duplicarExperimentoLaboratorioIaLocal",
    "excluirExperimentoLaboratorioIaLocal",
    "aplicarPresetLaboratorioIaLocal",
    "salvarExperimentoComoPresetLocal",
    "prepararTransferenciaLaboratorioParaEstudio",
    "consumirTransferenciaLaboratorioParaEstudio",
  ]) {
    assert.match(fonte, new RegExp(`export function ${operacao}\\b`), `Operação ausente: ${operacao}`);
  }
});

test("as cinco ferramentas obrigatórias estão disponíveis", () => {
  const dados = ler("data/laboratorio-ia.ts");
  for (const ferramenta of [
    "roteiro",
    "prompt-sistema",
    "gancho",
    "termos-visuais",
    "metadados",
  ]) {
    assert.match(dados, new RegExp(`["']${ferramenta}["']`), `Ferramenta ausente: ${ferramenta}`);
  }
});

test("os resultados possuem métricas de comparação reproduzíveis", () => {
  const tipos = ler("types/laboratorio-ia.ts");
  const dados = ler("data/laboratorio-ia.ts");
  for (const metrica of ["clareza", "engajamento", "representabilidade", "aderencia"]) {
    assert.match(tipos, new RegExp(`${metrica}:\\s*number`));
    assert.match(dados, new RegExp(`["']${metrica}["']`));
  }
  assert.match(ler("components/laboratorio-ia/painel-resultados-laboratorio.tsx"), /Comparar lado a lado/);
});

test("a página do laboratório entrega a central real", () => {
  const pagina = ler("app/laboratorio-de-ia/page.tsx");
  assert.match(pagina, /CentralLaboratorioIa/);
  assert.doesNotMatch(pagina, /PaginaEmConstrucao/);
});

test("o estúdio consome resultados aprovados no laboratório", () => {
  const estudio = ler("components/criar-video/estudio-criacao-video.tsx");
  const central = ler("components/laboratorio-ia/central-laboratorio-ia.tsx");
  assert.match(estudio, /consumirTransferenciaLaboratorioParaEstudio/);
  assert.match(estudio, /origemLaboratorio/);
  assert.match(central, /prepararParaEstudio/);
  assert.match(central, /router\.push\(["']\/criar-video\?origem=laboratorio["']\)/);
});

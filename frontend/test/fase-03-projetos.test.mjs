import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const raiz = dirname(dirname(fileURLToPath(import.meta.url)));
const ler = (caminho) => readFileSync(join(raiz, caminho), "utf8");

test("a Fase 3 possui todos os componentes da Central de Projetos", () => {
  const componentes = [
    "components/projetos/central-projetos.tsx",
    "components/projetos/painel-pastas-projetos.tsx",
    "components/projetos/barra-filtros-projetos.tsx",
    "components/projetos/cartao-projeto-studio.tsx",
    "components/projetos/lista-projetos-studio.tsx",
    "components/projetos/painel-detalhes-projeto.tsx",
  ];
  for (const componente of componentes) {
    assert.equal(existsSync(join(raiz, componente)), true, `Componente ausente: ${componente}`);
  }
});

test("o workspace local usa chave e versao persistentes", () => {
  const fonte = ler("lib/projetos-locais.ts");
  assert.match(fonte, /CHAVE_WORKSPACE_PROJETOS\s*=\s*["']makeflux:workspace-projetos:v1["']/);
  assert.match(fonte, /versao:\s*1/);
  assert.match(fonte, /carregarWorkspaceProjetos/);
  assert.match(fonte, /salvarWorkspaceProjetos/);
});

test("o contrato da Fase 3 cobre autosave, versoes, pastas e recuperacao", () => {
  const fonte = ler("lib/projetos-locais.ts");
  for (const operacao of [
    "salvarConfiguracaoProjetoLocal",
    "criarVersaoProjetoLocal",
    "restaurarVersaoProjetoLocal",
    "criarPastaProjetoLocal",
    "moverProjetoParaPastaLocal",
    "removerPastaProjetoLocal",
    "duplicarProjetoLocal",
    "arquivarProjetoLocal",
    "exportarProjetoComoJson",
  ]) {
    assert.match(fonte, new RegExp(`export function ${operacao}\\b`), `Operacao ausente: ${operacao}`);
  }
});

test("o estudio de criacao carrega projetos por identificador e salva automaticamente", () => {
  const estudio = ler("components/criar-video/estudio-criacao-video.tsx");
  assert.match(estudio, /salvarConfiguracaoProjetoLocal/);
  assert.match(estudio, /obterProjetoLocal/);
  assert.match(estudio, /setTimeout/);
  assert.match(estudio, /projeto/);
});

test("a pagina de projetos entrega a Central de Projetos real", () => {
  const pagina = ler("app/projetos/page.tsx");
  assert.match(pagina, /CentralProjetos/);
});

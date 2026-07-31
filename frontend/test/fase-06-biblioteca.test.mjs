import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const raiz = dirname(dirname(fileURLToPath(import.meta.url)));
const ler = (caminho) => readFileSync(join(raiz, caminho), "utf8");

test("a Fase 6 possui todos os componentes da Biblioteca", () => {
  const componentes = [
    "components/biblioteca/central-biblioteca.tsx",
    "components/biblioteca/cabecalho-biblioteca.tsx",
    "components/biblioteca/resumo-biblioteca.tsx",
    "components/biblioteca/painel-colecoes-biblioteca.tsx",
    "components/biblioteca/barra-filtros-biblioteca.tsx",
    "components/biblioteca/grade-recursos-biblioteca.tsx",
    "components/biblioteca/cartao-recurso-biblioteca.tsx",
    "components/biblioteca/painel-detalhes-recurso.tsx",
    "components/biblioteca/estado-vazio-biblioteca.tsx",
  ];
  for (const componente of componentes) {
    assert.equal(existsSync(join(raiz, componente)), true, `Componente ausente: ${componente}`);
  }
});

test("o workspace da Biblioteca possui chave persistente e contrato versionado", () => {
  const fonte = ler("lib/biblioteca-local.ts");
  assert.match(fonte, /CHAVE_WORKSPACE_BIBLIOTECA\s*=\s*["']makeflux:workspace-biblioteca:v1["']/);
  assert.match(fonte, /versao:\s*1/);
  assert.match(fonte, /carregarWorkspaceBiblioteca/);
  assert.match(fonte, /salvarWorkspaceBiblioteca/);
});

test("a Biblioteca cobre importação, coleções, metadados e organização", () => {
  const fonte = ler("lib/biblioteca-local.ts");
  for (const operacao of [
    "importarArquivosBibliotecaLocal",
    "atualizarRecursoBibliotecaLocal",
    "alternarFavoritoRecursoBibliotecaLocal",
    "moverRecursoBibliotecaLocal",
    "duplicarRecursoBibliotecaLocal",
    "excluirRecursoBibliotecaLocal",
    "criarColecaoBibliotecaLocal",
    "removerColecaoBibliotecaLocal",
    "definirPastaRaizBibliotecaLocal",
  ]) {
    assert.match(fonte, new RegExp(`export function ${operacao}\\b`), `Operação ausente: ${operacao}`);
  }
});

test("todos os tipos obrigatórios de recurso estão representados", () => {
  const tipos = ler("types/biblioteca.ts");
  const dados = ler("data/biblioteca.ts");
  for (const tipo of ["video", "imagem", "musica", "narracao", "legenda", "fonte", "prompt", "exportacao"]) {
    assert.match(tipos, new RegExp(`["']${tipo}["']`), `Tipo ausente: ${tipo}`);
    assert.match(dados, new RegExp(`["']${tipo}["']`), `Categoria ausente: ${tipo}`);
  }
});

test("a Biblioteca sincroniza Produção e Laboratório de IA", () => {
  const fonte = ler("lib/biblioteca-local.ts");
  assert.match(fonte, /sincronizarExportacoesProducaoBibliotecaLocal/);
  assert.match(fonte, /carregarWorkspaceProducao/);
  assert.match(fonte, /sincronizarPromptsLaboratorioBibliotecaLocal/);
  assert.match(fonte, /carregarWorkspaceLaboratorioIa/);
});

test("o seletor reutilizável de pasta comunica a pasta escolhida ao módulo", () => {
  const hook = ler("hooks/use-seletor-pasta.ts");
  const botao = ler("components/ui/botao-selecionar-pasta.tsx");
  assert.match(hook, /aoSelecionar\?:\s*\(pasta:\s*string\)/);
  assert.match(hook, /aoSelecionar\?\.\(pastaSelecionada\)/);
  assert.match(botao, /aoSelecionar/);
});

test("a página Biblioteca entrega a central real", () => {
  const pagina = ler("app/biblioteca/page.tsx");
  assert.match(pagina, /CentralBiblioteca/);
  assert.doesNotMatch(pagina, /PaginaEmConstrucao/);
});

test("recursos da Biblioteca podem ser transferidos ao estúdio", () => {
  const biblioteca = ler("lib/biblioteca-local.ts");
  const estudio = ler("components/criar-video/estudio-criacao-video.tsx");
  assert.match(biblioteca, /prepararTransferenciaBibliotecaParaEstudio/);
  assert.match(biblioteca, /consumirTransferenciaBibliotecaParaEstudio/);
  assert.match(estudio, /aplicarTransferenciaBiblioteca/);
  assert.match(estudio, /origem === ["']biblioteca["']/);
  assert.match(estudio, /musicaLocal/);
  assert.match(estudio, /narracaoLocal/);
  assert.match(estudio, /legendaLocal/);
});

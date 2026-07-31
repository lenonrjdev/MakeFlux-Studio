import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const raiz = dirname(dirname(fileURLToPath(import.meta.url)));
const ler = (caminho) => readFileSync(join(raiz, caminho), "utf8");

test("a Fase 7 possui todos os componentes da Central de Templates", () => {
  const componentes = [
    "components/templates/central-templates.tsx",
    "components/templates/cabecalho-templates.tsx",
    "components/templates/resumo-templates.tsx",
    "components/templates/painel-categorias-templates.tsx",
    "components/templates/barra-filtros-templates.tsx",
    "components/templates/grade-templates.tsx",
    "components/templates/cartao-template.tsx",
    "components/templates/painel-detalhes-template.tsx",
    "components/templates/modal-criar-template.tsx",
    "components/templates/estado-vazio-templates.tsx",
  ];
  for (const componente of componentes) {
    assert.equal(existsSync(join(raiz, componente)), true, `Componente ausente: ${componente}`);
  }
});

test("o workspace de Templates possui contrato persistente versionado", () => {
  const fonte = ler("lib/templates-locais.ts");
  assert.match(fonte, /CHAVE_WORKSPACE_TEMPLATES\s*=\s*["']makeflux:workspace-templates:v1["']/);
  assert.match(fonte, /EVENTO_WORKSPACE_TEMPLATES/);
  assert.match(fonte, /carregarWorkspaceTemplates/);
  assert.match(fonte, /salvarWorkspaceTemplates/);
  assert.match(fonte, /versao:\s*1/);
});

test("a Fase 7 entrega os templates obrigatórios do produto", () => {
  const dados = ler("data/templates.ts");
  for (const template of [
    "Curiosidades rápidas",
    "Lista Top 5",
    "História sombria",
    "Notícia explicada",
    "Educativo clean",
    "Produto em destaque",
    "Documentário curto",
    "Dark Lo-fi",
  ]) {
    assert.match(dados, new RegExp(template.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("templates cobrem criação, edição, duplicação, arquivamento, importação e exportação", () => {
  const fonte = ler("lib/templates-locais.ts");
  for (const operacao of [
    "criarTemplateLocal",
    "criarTemplateDeProjetoLocal",
    "atualizarTemplateLocal",
    "alternarFavoritoTemplateLocal",
    "duplicarTemplateLocal",
    "alterarStatusTemplateLocal",
    "excluirTemplateLocal",
    "exportarTemplateComoJson",
    "importarTemplateDeJson",
  ]) {
    assert.match(fonte, new RegExp(`export function ${operacao}\\b`), `Operação ausente: ${operacao}`);
  }
});

test("templates preservam a configuração completa do estúdio", () => {
  const tipos = ler("types/templates.ts");
  const fonte = ler("lib/templates-locais.ts");
  assert.match(tipos, /configuracao:\s*ConfiguracaoCriacaoVideo/);
  assert.match(fonte, /copiarConfiguracao/);
  const configuracao = ler("types/criar-video.ts");
  for (const campo of ["promptRoteiro", "systemPrompt", "fonteMateriais", "provedorVoz", "presetLegenda", "musica", "qualidade", "codificador"]) {
    assert.match(configuracao, new RegExp(campo));
  }
});

test("a página Templates entrega a central real", () => {
  const pagina = ler("app/templates/page.tsx");
  assert.match(pagina, /CentralTemplates/);
  assert.doesNotMatch(pagina, /PaginaEmConstrucao/);
});

test("templates podem ser aplicados ao estúdio por transferência de uso único", () => {
  const templates = ler("lib/templates-locais.ts");
  const estudio = ler("components/criar-video/estudio-criacao-video.tsx");
  assert.match(templates, /CHAVE_TRANSFERENCIA_TEMPLATE\s*=\s*["']makeflux:transferencia-template:v1["']/);
  assert.match(templates, /prepararTransferenciaTemplateParaEstudio/);
  assert.match(templates, /consumirTransferenciaTemplateParaEstudio/);
  assert.match(estudio, /aplicarTransferenciaTemplate/);
  assert.match(estudio, /origem === ["']template["']/);
});

test("o estúdio permite salvar a configuração atual como template", () => {
  const estudio = ler("components/criar-video/estudio-criacao-video.tsx");
  const cabecalho = ler("components/criar-video/cabecalho-projeto-video.tsx");
  assert.match(estudio, /salvarComoTemplate/);
  assert.match(estudio, /criarTemplateLocal/);
  assert.match(cabecalho, /Salvar como template/);
});

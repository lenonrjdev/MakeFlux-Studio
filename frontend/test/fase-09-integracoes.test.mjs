import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const raiz = dirname(dirname(fileURLToPath(import.meta.url)));
const ler = (caminho) => readFileSync(join(raiz, caminho), "utf8");

test("a Fase 9 possui todos os componentes da Central de Integrações", () => {
  const componentes = [
    "components/integracoes/central-integracoes.tsx",
    "components/integracoes/cabecalho-integracoes.tsx",
    "components/integracoes/resumo-integracoes.tsx",
    "components/integracoes/painel-modo-processamento.tsx",
    "components/integracoes/painel-categorias-integracoes.tsx",
    "components/integracoes/barra-filtros-integracoes.tsx",
    "components/integracoes/grade-integracoes.tsx",
    "components/integracoes/cartao-integracao.tsx",
    "components/integracoes/painel-detalhes-integracao.tsx",
    "components/integracoes/estado-vazio-integracoes.tsx",
  ];
  for (const componente of componentes) {
    assert.equal(existsSync(join(raiz, componente)), true, `Componente ausente: ${componente}`);
  }
});

test("o workspace de Integrações possui contrato persistente versionado", () => {
  const fonte = ler("lib/integracoes-local.ts");
  assert.match(fonte, /CHAVE_WORKSPACE_INTEGRACOES\s*=\s*["']makeflux:workspace-integracoes:v1["']/);
  assert.match(fonte, /EVENTO_WORKSPACE_INTEGRACOES/);
  assert.match(fonte, /carregarWorkspaceIntegracoes/);
  assert.match(fonte, /salvarWorkspaceIntegracoes/);
  assert.match(fonte, /versao:\s*1/);
});

test("o catálogo cobre motor, IA, mídia, voz, legendas, sistema e publicação", () => {
  const fonte = ler("lib/integracoes-local.ts");
  for (const id of [
    "moneyprinter-turbo",
    "openai",
    "ollama",
    "pexels",
    "pixabay",
    "biblioteca-local",
    "edge-tts",
    "chatterbox",
    "whisper",
    "ffmpeg",
    "youtube",
    "instagram",
    "tiktok",
  ]) {
    assert.match(fonte, new RegExp(`id:\\s*["']${id}["']`));
  }
});

test("as credenciais completas não são persistidas no workspace", () => {
  const tipos = ler("types/integracoes.ts");
  const fonte = ler("lib/integracoes-local.ts");
  assert.match(tipos, /credencialConfigurada/);
  assert.match(tipos, /credencialMascara/);
  assert.doesNotMatch(tipos, /apiKey:\s*string/);
  assert.match(fonte, /credencial\.slice\(-4\)/);
  assert.match(fonte, /O valor completo não é persistido/);
});

test("a Fase 9 oferece modos online, híbrido e offline com provedores padrão", () => {
  const tipos = ler("types/integracoes.ts");
  const fonte = ler("lib/integracoes-local.ts");
  const painel = ler("components/integracoes/painel-modo-processamento.tsx");
  for (const modo of ["online", "hibrido", "offline"]) assert.match(tipos, new RegExp(modo));
  assert.match(fonte, /definirModoProcessamentoLocal/);
  assert.match(fonte, /definirIntegracaoPadraoLocal/);
  assert.match(fonte, /integracaoCompativelComModo/);
  assert.match(painel, /capacidadesPrincipais/);
});

test("o módulo possui teste individual, diagnóstico geral e restauração", () => {
  const fonte = ler("lib/integracoes-local.ts");
  for (const operacao of [
    "testarIntegracaoLocal",
    "testarTodasIntegracoesLocais",
    "atualizarIntegracaoLocal",
    "limparCredencialIntegracaoLocal",
    "alternarIntegracaoAtivaLocal",
    "restaurarIntegracaoLocal",
    "restaurarCatalogoIntegracoesLocal",
  ]) {
    assert.match(fonte, new RegExp(`export (?:async )?function ${operacao}\\b`));
  }
});

test("a página Integrações entrega a central real", () => {
  const pagina = ler("app/integracoes/page.tsx");
  assert.match(pagina, /CentralIntegracoes/);
  assert.doesNotMatch(pagina, /PaginaEmConstrucao/);
});

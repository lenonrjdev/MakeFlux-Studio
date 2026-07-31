import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const raiz = dirname(dirname(fileURLToPath(import.meta.url)));
const ler = (caminho) => readFileSync(join(raiz, caminho), "utf8");

test("a Fase 11 possui a Central de ajuda completa", () => {
  const arquivos = [
    "components/ajuda/central-ajuda.tsx",
    "components/ajuda/navegacao-central-ajuda.tsx",
    "components/ajuda/painel-primeiros-passos.tsx",
    "components/ajuda/biblioteca-guias.tsx",
    "components/ajuda/painel-diagnostico.tsx",
    "components/ajuda/painel-solucao-problemas.tsx",
    "components/ajuda/painel-suporte.tsx",
    "components/ajuda/painel-novidades.tsx",
  ];
  for (const arquivo of arquivos) assert.equal(existsSync(join(raiz, arquivo)), true, `Arquivo ausente: ${arquivo}`);
});

test("o progresso da ajuda é persistente e versionado", () => {
  const fonte = ler("lib/ajuda-local.ts");
  assert.match(fonte, /CHAVE_WORKSPACE_AJUDA\s*=\s*["']makeflux:workspace-ajuda:v1["']/);
  assert.match(fonte, /EVENTO_WORKSPACE_AJUDA/);
  assert.match(fonte, /onboardingConcluido/);
  assert.match(fonte, /guiasFavoritos/);
  assert.match(fonte, /problemasResolvidos/);
});

test("o onboarding cobre as etapas fundamentais do produto", () => {
  const dados = ler("data/ajuda.ts");
  for (const etapa of ["configurar-workspace", "configurar-integracoes", "criar-primeiro-video", "acompanhar-producao", "planejar-publicacao"]) {
    assert.match(dados, new RegExp(etapa));
  }
});

test("o diagnóstico verifica workspace, integrações, armazenamento e segurança", () => {
  const fonte = ler("lib/ajuda-local.ts");
  for (const contrato of ["executarDiagnosticoLocal", "moneyprinter-turbo", "ffmpeg", "localStorage", "__TAURI_INTERNALS__", "crypto?.subtle"]) {
    assert.match(fonte, new RegExp(contrato.replaceAll("?", "\\?")));
  }
});

test("o pacote de suporte remove dados sensíveis", () => {
  const fonte = ler("lib/ajuda-local.ts");
  assert.match(fonte, /formato:\s*["']makeflux-support["']/);
  assert.match(fonte, /sanitizarValor/);
  assert.match(fonte, /credencial\|secret\|token/);
  assert.match(fonte, /pinHash/);
  assert.match(fonte, /C:\\\\Users/);
});

test("a solução de problemas possui checklists e rotas relacionadas", () => {
  const dados = ler("data/ajuda.ts");
  for (const problema of ["motor-nao-detectado", "ffmpeg-indisponivel", "audio-ausente", "armazenamento-cheio"]) {
    assert.match(dados, new RegExp(problema));
  }
  assert.match(dados, /rotaRelacionada/);
  assert.match(dados, /passos:/);
});


test("os atalhos da ajuda abrem seções específicas de Configurações", () => {
  const central = ler("components/configuracoes/central-configuracoes.tsx");
  const pagina = ler("app/configuracoes/page.tsx");
  assert.match(central, /useSearchParams/);
  assert.match(central, /normalizarSecaoConfiguracoes/);
  assert.match(pagina, /Suspense/);
});

test("a página Central de ajuda entrega o módulo real", () => {
  const pagina = ler("app/central-de-ajuda/page.tsx");
  assert.match(pagina, /CentralAjuda/);
  assert.match(pagina, /Suspense/);
  assert.doesNotMatch(pagina, /PaginaEmConstrucao/);
});

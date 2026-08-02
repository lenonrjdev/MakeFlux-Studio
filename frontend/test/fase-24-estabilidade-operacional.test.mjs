import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const raiz = dirname(dirname(fileURLToPath(import.meta.url)));
const projeto = dirname(raiz);
const ler = (caminho) => readFileSync(join(raiz, caminho), "utf8");
const lerProjeto = (caminho) => readFileSync(join(projeto, caminho), "utf8");

const obrigatorios = [
  "app/estabilidade/page.tsx",
  "components/estabilidade/central-estabilidade-operacional.tsx",
  "components/estabilidade/provedor-estabilidade-aplicacao.tsx",
  "components/estabilidade/painel-modo-seguro.tsx",
  "components/estabilidade/painel-validacao-estabilidade.tsx",
  "components/estabilidade/painel-recuperacao-estabilidade.tsx",
  "components/estabilidade/painel-incidentes-estabilidade.tsx",
  "hooks/use-estabilidade-operacional.ts",
  "lib/estabilidade-nativa.ts",
  "types/estabilidade.ts",
  "src-tauri/src/commands/estabilidade.rs",
  "test/fase-24-estabilidade-operacional.test.mjs",
];

test("a Fase 24 possui a Central de Estabilidade Operacional", () => {
  for (const arquivo of obrigatorios) {
    assert.equal(existsSync(join(raiz, arquivo)), true, `Arquivo ausente: ${arquivo}`);
  }
});

test("a versão 1.10.0 permanece sincronizada", () => {
  const raizPackage = JSON.parse(lerProjeto("package.json"));
  const packageFrontend = JSON.parse(ler("package.json"));
  const tauri = JSON.parse(ler("src-tauri/tauri.conf.json"));
  const cargo = ler("src-tauri/Cargo.toml");
  assert.equal(raizPackage.version, "1.10.0");
  assert.equal(packageFrontend.version, "1.10.0");
  assert.equal(tauri.version, "1.10.0");
  assert.match(cargo, /version = "1\.10\.0"/);
});

test("o SQLite evolui para schema v10 com sessões, incidentes e reparos", () => {
  const dados = ler("src-tauri/src/commands/dados.rs");
  for (const termo of [
    "estado_estabilidade",
    "incidentes_estabilidade",
    "reparos_estabilidade",
    "idx_incidentes_estabilidade_criado",
    "PRAGMA user_version = 10",
    "estabilidade v10",
  ]) assert.match(dados, new RegExp(termo));
});

test("o startup detecta encerramento inesperado e ativa modo seguro após recorrência", () => {
  const rust = ler("src-tauri/src/commands/estabilidade.rs");
  const lib = ler("src-tauri/src/lib.rs");
  assert.match(rust, /registrar_inicio_aplicacao/);
  assert.match(rust, /falhas >= 3/);
  assert.match(rust, /encerramento-inesperado/);
  assert.match(lib, /registrar_inicio_aplicacao\(app\.handle\(\)\)/);
  assert.match(lib, /if !modo_seguro/);
  assert.match(lib, /registrar_saida_limpa\(janela\.app_handle\(\)\)/);
});

test("a sessão é persistida e pode ser restaurada globalmente", () => {
  const provedor = ler("components/estabilidade/provedor-estabilidade-aplicacao.tsx");
  const layout = ler("app/layout.tsx");
  assert.match(provedor, /registrarSessaoEstabilidade/);
  assert.match(provedor, /Restaurar sessão/);
  assert.match(provedor, /descartarRestauracaoEstabilidade/);
  assert.match(layout, /ProvedorEstabilidadeAplicacao/);
});

test("incidentes globais são sanitizados e registrados localmente", () => {
  const provedor = ler("components/observabilidade/provedor-observabilidade.tsx");
  const rust = ler("src-tauri/src/commands/estabilidade.rs");
  assert.match(provedor, /registrarIncidenteEstabilidade/);
  assert.match(provedor, /erro-global/);
  assert.match(provedor, /promessa-rejeitada/);
  assert.match(rust, /\[REDACTED\]/);
  assert.match(rust, /USERPROFILE/);
});

test("o reparo cria backup antes de REINDEX e nunca apaga o original", () => {
  const rust = ler("src-tauri/src/commands/estabilidade.rs");
  const indiceBackup = rust.indexOf("fs::copy(&caminho, &backup)");
  const indiceReindex = rust.indexOf('execute_batch("REINDEX; PRAGMA optimize;")');
  assert.ok(indiceBackup >= 0);
  assert.ok(indiceReindex > indiceBackup);
  assert.match(rust, /Nenhum arquivo original foi apagado/);
  assert.match(rust, /PRAGMA wal_checkpoint\(FULL\)/);
  assert.match(rust, /PRAGMA quick_check/);
});

test("a limpeza é restrita a caches aprovados", () => {
  const rust = ler("src-tauri/src/commands/estabilidade.rs");
  assert.match(rust, /caminhos_cache_permitidos/);
  assert.match(rust, /join\("cache"\)/);
  assert.match(rust, /join\("Cache"\)/);
  assert.match(rust, /projetos, exportações, banco e cofre foram preservados/i);
  assert.doesNotMatch(rust, /remove_dir_all/);
});

test("a rota de estabilidade integra navegação, cabeçalho e catálogo", () => {
  assert.match(ler("data/navegacao.ts"), /\/estabilidade/);
  assert.match(ler("content/modulos.ts"), /"\/estabilidade"/);
  assert.match(ler("components/layout/cabecalho-aplicacao.tsx"), /"\/estabilidade"/);
});

test("a interface permanece exclusivamente clara", () => {
  const central = ler("components/estabilidade/central-estabilidade-operacional.tsx");
  const componentes = obrigatorios
    .filter((arquivo) => arquivo.includes("components/estabilidade"))
    .map(ler)
    .join("\n");
  assert.match(central, /bg-\[#f3f5f6\]/);
  assert.doesNotMatch(componentes, /dark:/);
});

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const raiz = dirname(dirname(fileURLToPath(import.meta.url)));
const projeto = dirname(raiz);
const ler = (caminho) => readFileSync(join(raiz, caminho), "utf8");
const lerProjeto = (caminho) => readFileSync(join(projeto, caminho), "utf8");

const arquivos = [
  "app/atualizacoes/page.tsx",
  "components/atualizacoes/central-atualizacoes.tsx",
  "components/atualizacoes/painel-atualizacao-disponivel.tsx",
  "components/atualizacoes/painel-progresso-atualizacao.tsx",
  "components/atualizacoes/painel-seguranca-atualizador.tsx",
  "hooks/use-atualizador-assinado.ts",
  "lib/atualizador-assinado.ts",
  "types/atualizador.ts",
  "src-tauri/src/commands/atualizador.rs",
];

test("a Fase 17 possui a Central de Atualizações Assinadas", () => {
  for (const arquivo of arquivos) assert.equal(existsSync(join(raiz, arquivo)), true, `Arquivo ausente: ${arquivo}`);
});

test("o plugin oficial de updater e o processo de relaunch estão registrados", () => {
  const cargo = ler("src-tauri/Cargo.toml");
  const lib = ler("src-tauri/src/lib.rs");
  const capacidade = ler("src-tauri/capabilities/default.json");
  assert.match(cargo, /tauri-plugin-updater = "2"/);
  assert.match(cargo, /tauri-plugin-process = "2"/);
  assert.match(lib, /tauri_plugin_updater::Builder::new\(\)\.build\(\)/);
  assert.match(lib, /tauri_plugin_process::init\(\)/);
  assert.match(capacidade, /updater:default/);
  assert.match(capacidade, /process:default/);
});

test("o fluxo cobre verificação, download, assinatura, instalação e reinício", () => {
  const biblioteca = ler("lib/atualizador-assinado.ts");
  assert.match(biblioteca, /check\(/);
  assert.match(biblioteca, /update\.download/);
  assert.match(biblioteca, /update\.install/);
  assert.match(biblioteca, /relaunch/);
  assert.match(biblioteca, /assinaturaObrigatoria/);
});

test("o rollback usa alvo customizado e permite downgrade somente de forma explícita", () => {
  const hook = ler("hooks/use-atualizador-assinado.ts");
  const biblioteca = ler("lib/atualizador-assinado.ts");
  assert.match(hook, /rollback-\$\{alvoCanal\}/);
  assert.match(biblioteca, /allowDowngrades: rollback/);
});

test("a preparação da release mantém a chave privada fora do repositório", () => {
  const script = lerProjeto("scripts/atualizador/preparar-atualizacao-assinada.ps1");
  assert.match(script, /TAURI_SIGNING_PRIVATE_KEY/);
  assert.match(script, /createUpdaterArtifacts/);
  assert.match(script, /latest\.json/);
  assert.match(script, /checksums\.sha256/);
  assert.doesNotMatch(script, /BEGIN.*PRIVATE KEY/s);
});

test("o build normal não exige a chave privada do atualizador", () => {
  const tauri = JSON.parse(ler("src-tauri/tauri.conf.json"));
  assert.notEqual(tauri.bundle?.createUpdaterArtifacts, true);
  assert.equal(existsSync(join(raiz, "src-tauri/tauri.updater.conf.example.json")), true);
});

test("a versão do atualizador permanece sincronizada com o aplicativo", () => {
  const pacote = JSON.parse(ler("package.json"));
  const tauri = JSON.parse(ler("src-tauri/tauri.conf.json"));
  const cargo = ler("src-tauri/Cargo.toml");
  assert.equal(pacote.version, tauri.version);
  assert.ok(cargo.includes(`version = "${pacote.version}"`));
});

test("a rota de atualizações está integrada à navegação", () => {
  assert.match(ler("data/navegacao.ts"), /href: "\/atualizacoes"/);
  assert.match(ler("components/layout/cabecalho-aplicacao.tsx"), /"\/atualizacoes": "Atualizações assinadas"/);
});

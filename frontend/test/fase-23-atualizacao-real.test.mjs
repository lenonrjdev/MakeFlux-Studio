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
  "components/atualizacoes/painel-homologacao-atualizacao.tsx",
  "components/atualizacoes/provedor-homologacao-atualizador.tsx",
  "hooks/use-atualizador-assinado.ts",
  "lib/atualizador-assinado.ts",
  "types/atualizador.ts",
  "src-tauri/src/commands/atualizador.rs",
  "test/fase-23-atualizacao-real.test.mjs",
];

test("a Fase 23 possui a homologação da atualização real", () => {
  for (const arquivo of obrigatorios) {
    assert.equal(existsSync(join(raiz, arquivo)), true, `Arquivo ausente: ${arquivo}`);
  }
});

test("as versões permanecem sincronizadas após a Fase 23", () => {
  const raizPackage = JSON.parse(lerProjeto("package.json"));
  const packageFrontend = JSON.parse(ler("package.json"));
  const tauri = JSON.parse(ler("src-tauri/tauri.conf.json"));
  const cargo = ler("src-tauri/Cargo.toml");
  assert.equal(packageFrontend.version, raizPackage.version);
  assert.equal(tauri.version, raizPackage.version);
  assert.match(cargo, new RegExp(`version = "${raizPackage.version.replaceAll(".", "\\.")}"`));
  assert.match(raizPackage.version, /^1\.(?:9\.1|10\.0)$/);
});

test("o SQLite evolui para schema v9 com checkpoint e histórico nativo", () => {
  const dados = ler("src-tauri/src/commands/dados.rs");
  for (const termo of [
    "historico_atualizacoes_reais",
    "checkpoint_atualizacao",
    "idx_historico_atualizacoes_iniciado",
    "PRAGMA user_version = 10",
    "atualizações reais v9",
  ]) assert.match(dados, new RegExp(termo));
});

test("a instalação cria checkpoint antes de chamar update.install", () => {
  const hook = ler("hooks/use-atualizador-assinado.ts");
  const indiceCheckpoint = hook.indexOf("prepararCheckpointAtualizacao");
  const indiceInstalacao = hook.indexOf("instalarPacoteAtualizacao(update)");
  assert.ok(indiceCheckpoint >= 0);
  assert.ok(indiceInstalacao > indiceCheckpoint);
  assert.match(hook, /A versão .* já está instalada|reinstalação foi bloqueada/);
});

test("o checkpoint valida WAL, integridade, snapshot, hash, cofre e registros", () => {
  const rust = ler("src-tauri/src/commands/atualizador.rs");
  for (const termo of [
    "PRAGMA wal_checkpoint(FULL)",
    "PRAGMA quick_check",
    "sha256_arquivo",
    "update-checkpoints",
    "workspace_registros_antes",
    "cofre_existia_antes",
    "reconciliar_checkpoint_pos_atualizacao",
    "confirmada-legado",
    "checkpoint_previo",
  ]) assert.match(rust, new RegExp(termo.replace(/[()]/g, "\\$&")));
});

test("a confirmação pós-reinício é executada no startup nativo", () => {
  const lib = ler("src-tauri/src/lib.rs");
  assert.match(lib, /reconciliar_checkpoint_pos_atualizacao\(app\.handle\(\)\)/);
  for (const comando of [
    "preparar_checkpoint_atualizacao",
    "registrar_transicao_legada_atualizacao",
    "confirmar_pos_atualizacao",
    "descartar_checkpoint_atualizacao",
    "consultar_homologacao_atualizador",
  ]) assert.match(lib, new RegExp(comando));
});


test("a transição 1.9.0 para 1.9.1 é reconciliada ao iniciar qualquer rota", () => {
  const provedor = ler("components/atualizacoes/provedor-homologacao-atualizador.tsx");
  const layout = ler("app/layout.tsx");
  const biblioteca = ler("lib/atualizador-assinado.ts");
  assert.match(provedor, /reconciliarTransicaoLegadaAtualizadorFrontend/);
  assert.match(layout, /ProvedorHomologacaoAtualizador/);
  assert.match(biblioteca, /registrarTransicaoLegadaAtualizacao/);
  assert.match(biblioteca, /metadadosLocais\.versaoAtual !== runtime\.versaoAtual/);
});

test("os canais estável e beta usam alvos assinados separados", () => {
  const hook = ler("hooks/use-atualizador-assinado.ts");
  const script = lerProjeto("scripts/atualizador/preparar-atualizacao-assinada.ps1");
  assert.match(hook, /beta-\$\{runtime\.alvo\}/);
  assert.match(hook, /rollback-\$\{alvoCanal\}/);
  assert.match(script, /beta-\$alvo/);
  assert.match(script, /rollback-\$chaveCanal/);
});

test("o preparador 1.9.1 incorpora o manifesto 1.9.0 para rollback", () => {
  const script = lerProjeto("scripts/atualizador/preparar-atualizacao-1.9.1.ps1");
  assert.match(script, /releases\/download\/v1\.9\.0\/latest\.json/);
  assert.match(script, /rollbackEstavel\.version -ne "1\.9\.0"/);
  assert.match(script, /rollback-beta-\$alvo\.json/);
  assert.match(script, /dist\\updater-v1\.9\.1/);
});


test("o rollback usa manifesto próprio com a versão anterior anunciada", () => {
  const script = lerProjeto("scripts/atualizador/preparar-atualizacao-assinada.ps1");
  assert.match(script, /latest\/download\/\{\{target\}\}\.json/);
  assert.match(script, /Salvar-ManifestoEstatico/);
  assert.match(script, /-VersaoManifesto \$versaoAnterior/);
  assert.match(script, /\$alvoRollback = "rollback-\$chaveCanal"/);
  assert.match(script, /compatibilidade com instalações anteriores/i);
});

test("a interface da atualização real permanece exclusivamente clara", () => {
  const painel = ler("components/atualizacoes/painel-homologacao-atualizacao.tsx");
  const central = ler("components/atualizacoes/central-atualizacoes.tsx");
  assert.match(painel, /bg-white/);
  assert.match(central, /bg-\[#f7f8f9\]/);
  assert.doesNotMatch(painel + central, /dark:/);
});

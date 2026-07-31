import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const raiz = dirname(dirname(fileURLToPath(import.meta.url)));
const ler = (caminho) => readFileSync(join(raiz, caminho), "utf8");

test("a Fase 13 possui a Central de qualidade e distribuição", () => {
  const arquivos = [
    "app/qualidade/page.tsx",
    "components/qualidade/central-qualidade.tsx",
    "components/qualidade/cabecalho-qualidade.tsx",
    "components/qualidade/resumo-qualidade.tsx",
    "components/qualidade/painel-migracao-sqlite.tsx",
    "components/qualidade/painel-cofre-credenciais.tsx",
    "components/qualidade/painel-telemetria-local.tsx",
    "components/qualidade/painel-distribuicao.tsx",
    "components/qualidade/painel-qualidade-e2e.tsx",
    "components/qualidade/provedor-persistencia-nativa.tsx",
    "lib/persistencia-nativa.ts",
    "lib/cofre-nativo.ts",
    "lib/telemetria-local.ts",
    "types/qualidade.ts",
  ];
  for (const arquivo of arquivos) {
    assert.equal(existsSync(join(raiz, arquivo)), true, `Arquivo ausente: ${arquivo}`);
  }
});

test("a versão 1.0 permanece sincronizada no frontend e aplicativo desktop", () => {
  const pacote = JSON.parse(ler("package.json"));
  const tauri = JSON.parse(ler("src-tauri/tauri.conf.json"));
  const cargo = ler("src-tauri/Cargo.toml");
  assert.equal(pacote.version, "1.0.0");
  assert.equal(tauri.version, "1.0.0");
  assert.match(cargo, /version\s*=\s*"1\.0\.0"/);
});

test("o SQLite possui schema versionado e migração idempotente", () => {
  const fonte = ler("src-tauri/src/commands/dados.rs");
  for (const contrato of [
    "workspace_store",
    "schema_migrations",
    "telemetria_local",
    "ON CONFLICT\\(chave\\) DO UPDATE",
    "PRAGMA journal_mode = WAL",
    "migrar_workspace_sqlite",
  ]) {
    assert.match(fonte, new RegExp(contrato));
  }
});

test("a migração preserva o localStorage como fallback seguro", () => {
  const persistencia = ler("lib/persistencia-nativa.ts");
  assert.match(persistencia, /coletarRegistrosMakeFlux/);
  assert.match(persistencia, /hidratarLocalStorageDoSqlite/);
  assert.match(persistencia, /startsWith\(PREFIXO_MAKEFLUX\)/);
  const provedor = ler("components/qualidade/provedor-persistencia-nativa.tsx");
  assert.match(provedor, /15_000/);
  assert.match(provedor, /fallback seguro/);
});

test("o cofre usa derivação de chave, cifra autenticada e limpeza de memória", () => {
  const fonte = ler("src-tauri/src/commands/cofre.rs");
  for (const contrato of [
    "Argon2",
    "ChaCha20Poly1305",
    "OsRng",
    "zeroize",
    "makeflux-vault.json",
    "Senha mestra inválida",
  ]) {
    assert.match(fonte, new RegExp(contrato));
  }
});

test("a telemetria é local, opcional e desativada por padrão", () => {
  const fonte = ler("lib/telemetria-local.ts");
  assert.match(fonte, /ativa: false/);
  assert.match(fonte, /registrar_telemetria_local/);
  assert.doesNotMatch(fonte, /fetch\(|https?:\/\//);
  const painel = ler("components/qualidade/painel-telemetria-local.tsx");
  assert.match(painel, /Nenhum dado é enviado pela internet/);
});

test("os comandos nativos da Fase 13 estão registrados no Tauri", () => {
  const fonte = ler("src-tauri/src/lib.rs");
  for (const comando of [
    "status_banco_local",
    "migrar_workspace_sqlite",
    "listar_registros_sqlite",
    "registrar_telemetria_local",
    "status_cofre",
    "inicializar_cofre",
    "desbloquear_cofre",
    "salvar_segredo_cofre",
  ]) {
    assert.match(fonte, new RegExp(comando));
  }
});

test("a distribuição 1.0 possui manifesto, checksums e fluxo de assinatura externo", () => {
  const preparar = ler("../scripts/distribuicao/preparar-distribuicao-v1.ps1");
  assert.match(preparar, /Get-FileHash/);
  assert.match(preparar, /release-manifest\.json/);
  assert.match(preparar, /checksums\.sha256/);
  const assinar = ler("../scripts/distribuicao/assinar-instaladores-windows.ps1");
  assert.match(assinar, /signtool/);
  assert.match(assinar, /MAKEFLUX_CERTIFICATE_PATH/);
});

test("a rota de qualidade está integrada à navegação e ao cabeçalho", () => {
  assert.match(ler("data/navegacao.ts"), /href:\s*"\/qualidade"/);
  assert.match(ler("components/layout/cabecalho-aplicacao.tsx"), /"\/qualidade": "Qualidade e distribuição"/);
  assert.match(ler("app/layout.tsx"), /ProvedorPersistenciaNativa/);
});

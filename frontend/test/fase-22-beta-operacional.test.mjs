import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import test from "node:test";

const ler = (arquivo) => readFileSync(new URL(`../${arquivo}`, import.meta.url), "utf8");

const obrigatorios = [
  "app/beta/page.tsx",
  "components/beta/central-beta-operacional.tsx",
  "components/beta/painel-portoes-beta.tsx",
  "components/beta/painel-checklist-beta.tsx",
  "components/beta/painel-artefatos-beta.tsx",
  "hooks/use-beta-operacional.ts",
  "lib/beta-nativa.ts",
  "types/beta.ts",
  "src-tauri/src/commands/beta.rs",
];

test("a Fase 22 possui a Central de Beta Operacional completa", () => {
  for (const arquivo of obrigatorios) assert.equal(existsSync(new URL(`../${arquivo}`, import.meta.url)), true, arquivo);
});

test("a homologação possui portões, evidências, snapshot e relatório", () => {
  const rust = ler("src-tauri/src/commands/beta.rs");
  for (const termo of ["PRAGMA quick_check", "sessoes_beta", "checks_beta", "criar_snapshot_beta", "exportar_relatorio_beta", "checksum_sha256"]) {
    assert.match(rust, new RegExp(termo));
  }
});

test("o checklist cobre os fluxos críticos da release candidate", () => {
  const rust = ler("src-tauri/src/commands/beta.rs");
  for (const termo of ["maquina-limpa", "video-real", "backup-restauracao", "atualizacao-rollback", "publicacao-real", "desinstalacao"]) {
    assert.match(rust, new RegExp(termo));
  }
});

test("a navegação e o catálogo registram a rota beta", () => {
  assert.match(ler("data/navegacao.ts"), /href: "\/beta"/);
  assert.match(ler("content/modulos.ts"), /"\/beta"/);
  assert.match(ler("components/layout/cabecalho-aplicacao.tsx"), /"\/beta"/);
});

test("o schema local avança para a versão 8", () => {
  const dados = ler("src-tauri/src/commands/dados.rs");
  assert.match(dados, /CREATE TABLE IF NOT EXISTS sessoes_beta/);
  assert.match(dados, /CREATE TABLE IF NOT EXISTS checks_beta/);
  assert.match(dados, /PRAGMA user_version = (?:8|9)/);
});

test("a interface da Fase 22 permanece clara", () => {
  const central = ler("components/beta/central-beta-operacional.tsx");
  assert.match(central, /bg-\[#f3f5f6\]/);
  assert.doesNotMatch(central, /dark:/);
});


test("a fase prepara uma release candidate com checksum", () => {
  const script = readFileSync(new URL("../../scripts/beta/preparar-release-candidate.ps1", import.meta.url), "utf8");
  assert.match(script, /release-candidate\.json/);
  assert.match(script, /Get-FileHash/);
  assert.match(script, /validar-fase-(?:22|atual)\.ps1/);
});

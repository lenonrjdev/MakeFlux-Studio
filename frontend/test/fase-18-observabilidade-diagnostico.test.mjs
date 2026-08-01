
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const raiz = path.resolve(import.meta.dirname, "..");
const ler = (arquivo) => fs.readFileSync(path.join(raiz, arquivo), "utf8");

test("a Fase 18 possui a Central de Observabilidade", () => {
  for (const arquivo of [
    "app/observabilidade/page.tsx",
    "components/observabilidade/central-observabilidade.tsx",
    "components/observabilidade/tabela-logs.tsx",
    "components/observabilidade/painel-detalhes-log.tsx",
    "components/observabilidade/painel-retencao-exportacao.tsx",
    "hooks/use-observabilidade-nativa.ts",
    "lib/observabilidade-nativa.ts",
    "lib/logger-estruturado.ts",
    "types/observabilidade.ts",
  ]) assert.equal(fs.existsSync(path.join(raiz, arquivo)), true, arquivo);
});

test("o schema v5 persiste logs, correlações e índices", () => {
  const dados = ler("src-tauri/src/commands/dados.rs");
  assert.match(dados, /CREATE TABLE IF NOT EXISTS logs_estruturados/);
  assert.match(dados, /correlacao_id/);
  assert.match(dados, /idx_logs_correlacao/);
  assert.match(dados, /user_version = 5/);
});

test("a observabilidade sanitiza segredos antes da persistência", () => {
  const nativo = ler("src-tauri/src/commands/observabilidade.rs");
  for (const termo of ["authorization", "client_secret", "private_key", "[REDACTED]", "sanitizar_contexto"]) assert.match(nativo, new RegExp(termo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
});

test("o diagnóstico exportado é sanitizado e revelável", () => {
  const nativo = ler("src-tauri/src/commands/observabilidade.rs");
  assert.match(nativo, /exportar_pacote_diagnostico/);
  assert.match(nativo, /"sanitizado": true/);
  assert.match(nativo, /revelar_pacote_diagnostico/);
});

test("erros globais e navegação são registrados pelo provedor", () => {
  const provedor = ler("components/observabilidade/provedor-observabilidade.tsx");
  assert.match(provedor, /unhandledrejection/);
  assert.match(provedor, /frontend\.erro_global/);
  assert.match(provedor, /navegacao\.rota/);
});

test("a linha 1.5+ permanece sincronizada", () => {
  const pacote = JSON.parse(ler("package.json"));
  const tauri = JSON.parse(ler("src-tauri/tauri.conf.json"));
  const cargo = ler("src-tauri/Cargo.toml").match(/version = "([^"]+)"/)?.[1];
  assert.equal(pacote.version, tauri.version);
  assert.equal(pacote.version, cargo);
  assert.ok(Number(pacote.version.split(".")[1]) >= 5);
});

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const raiz = dirname(dirname(fileURLToPath(import.meta.url)));
const ler = (caminho) => readFileSync(join(raiz, caminho), "utf8");

test("a Fase 15 possui a Central de rotinas e notificações", () => {
  for (const arquivo of [
    "app/rotinas/page.tsx",
    "components/rotinas/central-rotinas.tsx",
    "components/rotinas/lista-rotinas.tsx",
    "components/rotinas/editor-rotina.tsx",
    "components/rotinas/historico-rotinas.tsx",
    "components/rotinas/central-notificacoes-compacta.tsx",
    "components/rotinas/painel-notificacoes.tsx",
    "hooks/use-rotinas-nativas.ts",
    "lib/rotinas-nativas.ts",
    "types/rotinas.ts",
    "src-tauri/src/commands/rotinas.rs",
  ]) assert.equal(existsSync(join(raiz, arquivo)), true, `Arquivo ausente: ${arquivo}`);
});

test("a versão 1.2.0 está sincronizada", () => {
  const pacote = JSON.parse(ler("package.json"));
  const tauri = JSON.parse(ler("src-tauri/tauri.conf.json"));
  assert.equal(pacote.version, "1.2.0");
  assert.equal(tauri.version, "1.2.0");
  assert.match(ler("src-tauri/Cargo.toml"), /version\s*=\s*"1\.2\.0"/);
});

test("o schema v3 persiste rotinas, execuções e notificações", () => {
  const fonte = ler("src-tauri/src/commands/dados.rs");
  for (const contrato of ["rotinas_agendadas", "execucoes_rotinas", "notificacoes_locais", "idx_rotinas_proxima", "PRAGMA user_version = 3"]) assert.match(fonte, new RegExp(contrato));
});

test("o agendador nativo recupera pendências e limita disparos", () => {
  const fonte = ler("src-tauri/src/commands/rotinas.rs");
  for (const contrato of ["iniciar_worker_rotinas", "LIMITE_RECUPERACAO", "processar_pendentes_interno", "Duration::from_secs\\(1\\)", "proxima_execucao_em <="]) assert.match(fonte, new RegExp(contrato));
});

test("as frequências cobrem execução única, diária, semanal, mensal e intervalo", () => {
  const fonte = ler("src-tauri/src/commands/rotinas.rs");
  for (const frequencia of ["uma-vez", "diaria", "semanal", "mensal", "intervalo"]) assert.match(fonte, new RegExp(frequencia));
  assert.match(fonte, /clamp\(5, 10_080\)/);
});

test("as ações locais são restritas e possuem histórico", () => {
  const fonte = ler("src-tauri/src/commands/rotinas.rs");
  for (const acao of ["checkpoint-wal", "otimizar-banco", "verificar-integridade", "limpar-telemetria", "relatorio-workspace", "execucoes_rotinas"]) assert.match(fonte, new RegExp(acao));
  assert.doesNotMatch(fonte, /Command::new|powershell|cmd\.exe/);
});

test("notificações usam o plugin oficial e também ficam na central interna", () => {
  assert.match(ler("src-tauri/Cargo.toml"), /tauri-plugin-notification/);
  assert.match(ler("src-tauri/src/lib.rs"), /tauri_plugin_notification::init/);
  assert.match(ler("src-tauri/src/commands/rotinas.rs"), /NotificationExt/);
  assert.match(ler("components/layout/cabecalho-aplicacao.tsx"), /CentralNotificacoesCompacta/);
  assert.match(ler("src-tauri/capabilities/default.json"), /notification:default/);
});

test("a rota de rotinas integra navegação, cabeçalho e comandos Tauri", () => {
  assert.match(ler("data/navegacao.ts"), /href:\s*"\/rotinas"/);
  assert.match(ler("components/layout/cabecalho-aplicacao.tsx"), /"\/rotinas": "Rotinas e notificações"/);
  const lib = ler("src-tauri/src/lib.rs");
  for (const comando of ["listar_rotinas_agendadas", "salvar_rotina_agendada", "executar_rotina_agora", "listar_notificacoes_locais", "status_agendador_rotinas"]) assert.match(lib, new RegExp(comando));
});

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const raiz = dirname(dirname(fileURLToPath(import.meta.url)));
const ler = (caminho) => readFileSync(join(raiz, caminho), "utf8");

test("a Fase 12 possui o adaptador nativo completo", () => {
  const arquivos = [
    "lib/runtime-nativo.ts",
    "lib/motor-moneyprinter.ts",
    "lib/sincronizacao-producao-moneyprinter.ts",
    "hooks/use-runtime-nativo.ts",
    "types/runtime-nativo.ts",
    "types/motor-moneyprinter.ts",
    "components/integracoes/painel-runtime-nativo.tsx",
    "src-tauri/src/models.rs",
    "src-tauri/src/state.rs",
    "src-tauri/src/commands/capacidades.rs",
    "src-tauri/src/commands/http.rs",
    "src-tauri/src/commands/moneyprinter.rs",
    "src-tauri/src/commands/processo.rs",
    "src-tauri/src/commands/atualizacao.rs",
  ];
  for (const arquivo of arquivos) assert.equal(existsSync(join(raiz, arquivo)), true, `Arquivo ausente: ${arquivo}`);
});

test("o backend registra comandos Tauri para capacidades, motor e atualização", () => {
  const fonte = ler("src-tauri/src/lib.rs");
  for (const comando of [
    "detectar_capacidades_sistema",
    "verificar_moneyprinter",
    "criar_video_moneyprinter",
    "consultar_tarefa_moneyprinter",
    "iniciar_motor_moneyprinter",
    "parar_motor_moneyprinter",
    "verificar_atualizacao_motor",
    "atualizar_motor_seguro",
    "rollback_motor_seguro",
  ]) assert.match(fonte, new RegExp(comando));
});

test("o adaptador usa o contrato REST v1 do MoneyPrinterTurbo", () => {
  const rust = ler("src-tauri/src/commands/moneyprinter.rs");
  assert.match(rust, /\/api\/v1\/videos/);
  assert.match(rust, /\/api\/v1\/tasks\/\{task_id\}/);
  assert.match(rust, /\/openapi\.json/);
  const payload = ler("lib/motor-moneyprinter.ts");
  for (const campo of ["video_subject", "video_script", "video_aspect", "video_source", "voice_name", "subtitle_enabled", "bgm_volume"]) {
    assert.match(payload, new RegExp(campo));
  }
});

test("o modo offline detecta dependências reais do computador", () => {
  const fonte = ler("src-tauri/src/commands/capacidades.rs");
  for (const contrato of ["python", "ffmpeg", "git", "uv", "total_memory", "detectar_gpu", "modo_offline_pronto"]) {
    assert.match(fonte, new RegExp(contrato));
  }
});

test("a fila distingue simulação de execução real", () => {
  const tipos = ler("types/producao.ts");
  assert.match(tipos, /ModoExecucaoProducao/);
  assert.match(tipos, /moneyprinter/);
  assert.match(tipos, /motorTarefaId/);
  const sincronizacao = ler("lib/sincronizacao-producao-moneyprinter.ts");
  assert.match(sincronizacao, /criarVideoMoneyPrinter/);
  assert.match(sincronizacao, /consultarTarefaMoneyPrinter/);
  assert.match(sincronizacao, /concluirTarefaMotorLocal/);
});

test("a atualização do motor protege alterações locais e cria rollback", () => {
  const fonte = ler("src-tauri/src/commands/atualizacao.rs");
  assert.match(fonte, /status.*--porcelain/s);
  assert.match(fonte, /merge.*--ff-only/s);
  assert.match(fonte, /makeflux-backup-/);
  assert.match(fonte, /rollback\.json/);
  assert.match(fonte, /reset.*--hard/s);
});

test("a central de integrações exibe o runtime nativo", () => {
  const central = ler("components/integracoes/central-integracoes.tsx");
  assert.match(central, /PainelRuntimeNativo/);
  const painel = ler("components/integracoes/painel-runtime-nativo.tsx");
  assert.match(painel, /Modo offline/);
  assert.match(painel, /Iniciar motor/);
  assert.match(painel, /Atualizar com backup/);
  assert.match(painel, /Rollback/);
});

test("o diagnóstico da ajuda consulta capacidades nativas", () => {
  const fonte = ler("lib/ajuda-local.ts");
  assert.match(fonte, /detectarCapacidadesSistema/);
  assert.match(fonte, /verificarMoneyPrinter/);
  assert.match(fonte, /API real do MoneyPrinterTurbo/);
});

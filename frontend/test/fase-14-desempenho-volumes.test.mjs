import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const raiz = dirname(dirname(fileURLToPath(import.meta.url)));
const ler = (caminho) => readFileSync(join(raiz, caminho), "utf8");

test("a Fase 14 possui a Central de desempenho e grandes volumes", () => {
  for (const arquivo of [
    "app/desempenho/page.tsx",
    "components/desempenho/central-desempenho.tsx",
    "components/desempenho/explorador-registros.tsx",
    "components/desempenho/lista-virtual-registros.tsx",
    "components/desempenho/painel-operacoes-lote.tsx",
    "components/desempenho/painel-manutencao-banco.tsx",
    "hooks/use-desempenho-nativo.ts",
    "lib/desempenho-nativo.ts",
    "types/desempenho.ts",
    "src-tauri/src/commands/desempenho.rs",
  ]) assert.equal(existsSync(join(raiz, arquivo)), true, `Arquivo ausente: ${arquivo}`);
});

test("a versão 1.1.0 está sincronizada", () => {
  const pacote = JSON.parse(ler("package.json"));
  const tauri = JSON.parse(ler("src-tauri/tauri.conf.json"));
  assert.equal(pacote.version, "1.1.0");
  assert.equal(tauri.version, "1.1.0");
  assert.match(ler("src-tauri/Cargo.toml"), /version\s*=\s*"1\.1\.0"/);
});

test("o schema v2 possui índices, métricas e operações persistentes", () => {
  const dados = ler("src-tauri/src/commands/dados.rs");
  for (const contrato of ["metricas_consulta", "operacoes_lote", "manutencao_banco", "idx_workspace_store_atualizado", "PRAGMA user_version = 2"]) assert.match(dados, new RegExp(contrato));
});

test("a consulta nativa é paginada, filtrável e instrumentada", () => {
  const fonte = ler("src-tauri/src/commands/desempenho.rs");
  for (const contrato of ["listar_registros_paginados", "LIMIT \\?4 OFFSET \\?5", "metricas_consulta", "proximo_cursor", "duracao_ms"]) assert.match(fonte, new RegExp(contrato));
});

test("operações em lote suportam blocos, progresso e cancelamento", () => {
  const fonte = ler("src-tauri/src/commands/desempenho.rs");
  for (const contrato of ["spawn_blocking", "AtomicBool", "cancelar_operacao_lote", "processados", "transaction", "cancelada"]) assert.match(fonte, new RegExp(contrato));
});

test("a manutenção cobre checkpoint, otimização e compactação protegida", () => {
  const fonte = ler("src-tauri/src/commands/desempenho.rs");
  for (const contrato of ["wal_checkpoint", "PRAGMA optimize", "VACUUM", "Compactação bloqueada"]) assert.match(fonte, new RegExp(contrato));
});

test("a interface usa virtualização sem dependência externa", () => {
  const lista = ler("components/desempenho/lista-virtual-registros.tsx");
  assert.match(lista, /ALTURA_LINHA/);
  assert.match(lista, /translateY/);
  assert.match(lista, /slice\(inicio, fim\)/);
});

test("a rota de desempenho integra navegação, cabeçalho e contratos Tauri", () => {
  assert.match(ler("data/navegacao.ts"), /href:\s*"\/desempenho"/);
  assert.match(ler("components/layout/cabecalho-aplicacao.tsx"), /"\/desempenho": "Desempenho e grandes volumes"/);
  const lib = ler("src-tauri/src/lib.rs");
  for (const comando of ["consultar_status_desempenho", "listar_registros_paginados", "iniciar_operacao_lote", "cancelar_operacao_lote", "executar_manutencao_banco"]) assert.match(lib, new RegExp(comando));
});

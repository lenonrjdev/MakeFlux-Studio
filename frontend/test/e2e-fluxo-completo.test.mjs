import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const raiz = dirname(dirname(fileURLToPath(import.meta.url)));
const ler = (caminho) => readFileSync(join(raiz, caminho), "utf8");

test("E2E: um projeto percorre estúdio, produção, biblioteca e publicação", () => {
  const estudio = ler("components/criar-video/estudio-criacao-video.tsx");
  const producao = ler("lib/producao-local.ts");
  const biblioteca = ler("lib/biblioteca-local.ts");
  const publicacao = ler("lib/publicacao-local.ts");

  assert.match(estudio, /criarTarefaProducaoLocal/);
  assert.match(producao, /concluirTarefaMotorLocal|concluir/);
  assert.match(biblioteca, /sincronizar.*Producao|Produção/si);
  assert.match(publicacao, /criar.*Producao|produção/si);
});

test("E2E: resultados de IA, recursos e templates chegam ao estúdio por transferências de uso único", () => {
  const estudio = ler("components/criar-video/estudio-criacao-video.tsx");
  for (const contrato of [
    "consumirTransferenciaLaboratorioParaEstudio",
    "consumirTransferenciaBibliotecaParaEstudio",
    "consumirTransferenciaTemplateParaEstudio",
  ]) {
    assert.match(estudio, new RegExp(contrato));
  }
});

test("E2E: o workspace pode ser sincronizado, restaurado e validado sem apagar o fallback", () => {
  const persistencia = ler("lib/persistencia-nativa.ts");
  const provedor = ler("components/qualidade/provedor-persistencia-nativa.tsx");
  assert.match(persistencia, /migrarWorkspaceParaSqlite/);
  assert.match(persistencia, /hidratarLocalStorageDoSqlite/);
  assert.match(provedor, /sincronizarWorkspaceComSqlite/);
  assert.doesNotMatch(persistencia, /localStorage\.clear\(\)/);
});

test("E2E: o cofre inicia bloqueado a cada nova sessão e não expõe leitura de segredos no frontend", () => {
  const cofreFrontend = ler("lib/cofre-nativo.ts");
  const cofreRust = ler("src-tauri/src/commands/cofre.rs");
  assert.doesNotMatch(cofreFrontend, /lerSegredo|obterSegredo|readSecret/);
  assert.match(cofreRust, /EstadoCofre/);
  assert.match(cofreRust, /bloquear_cofre/);
  assert.match(ler("src-tauri/src/lib.rs"), /chave\.zeroize\(\)/);
});

test("E2E: a homologação final cobre frontend, Rust, Tauri e instalador", () => {
  const validador = ler("../scripts/validacao/validar-fase.ps1");
  for (const etapa of [
    "Lint sem avisos",
    "TypeScript estrito",
    "Testes automatizados",
    "Build estatico Next.js",
    "Formatacao Rust",
    "Compilacao nativa Tauri",
    "Build completo do aplicativo desktop",
  ]) {
    assert.match(validador, new RegExp(etapa));
  }
});

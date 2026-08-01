import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const raiz = dirname(dirname(fileURLToPath(import.meta.url)));
const ler = (caminho) => readFileSync(join(raiz, caminho), "utf8");

test("o Hotfix 1.4.1 possui os arquivos da interface clara e das exportações", () => {
  for (const arquivo of [
    "components/producao/painel-arquivos-tarefa.tsx",
    "lib/exportacoes-nativas.ts",
    "src-tauri/src/commands/exportacoes.rs",
  ]) {
    assert.equal(existsSync(join(raiz, arquivo)), true, `Arquivo ausente: ${arquivo}`);
  }
});

test("a aplicação usa somente o tema claro oficial", () => {
  const layout = ler("app/layout.tsx");
  const estilos = ler("app/globals.css");
  const configuracoes = ler("lib/configuracoes-locais.ts");
  const provedor = ler("components/configuracoes/provedor-configuracoes.tsx");
  const tipos = ler("types/configuracoes.ts");

  assert.match(layout, /data-aparencia="claro"/);
  assert.match(estilos, /color-scheme:\s*light only/);
  assert.doesNotMatch(estilos, /data-aparencia="escuro"/);
  assert.doesNotMatch(estilos, /prefers-color-scheme:\s*dark/);
  assert.match(configuracoes, /tema:\s*"claro"/);
  assert.match(configuracoes, /aparencia:\s*\{[^}]*tema:\s*"claro"/s);
  assert.doesNotMatch(provedor, /matchMedia\([^)]*prefers-color-scheme/);
  assert.match(provedor, /dataset\.aparencia = "claro"/);
  assert.match(tipos, /AparenciaAplicacao = "claro"/);
  assert.doesNotMatch(tipos, /AparenciaAplicacao[^\n]*escuro/);
});

test("o modo simulação não fabrica arquivos de vídeo", () => {
  const producao = ler("lib/producao-local.ts");
  assert.match(producao, /Modo simulação — nenhum arquivo será criado/);
  assert.match(producao, /Simulação concluída\. Nenhum vídeo ou arquivo foi criado\./);
  assert.doesNotMatch(producao, /criarArquivosConcluidos/);
});

test("a produção real prepara e consolida arquivos em uma pasta permanente", () => {
  const sincronizacao = ler("lib/sincronizacao-producao-moneyprinter.ts");
  const ponte = ler("lib/exportacoes-nativas.ts");
  const rust = ler("src-tauri/src/commands/exportacoes.rs");
  const libRust = ler("src-tauri/src/lib.rs");

  assert.match(sincronizacao, /prepararPastaExportacao/);
  assert.match(sincronizacao, /consolidarArquivosExportacao/);
  assert.match(sincronizacao, /atualizarPastaSaidaTarefaLocal/);
  assert.match(ponte, /preparar_pasta_exportacao/);
  assert.match(ponte, /consolidar_arquivos_exportacao/);
  assert.match(rust, /video_dir\(\)/);
  assert.match(rust, /create_dir_all/);
  assert.match(rust, /fs::copy/);
  assert.match(libRust, /commands::exportacoes::preparar_pasta_exportacao/);
  assert.match(libRust, /commands::exportacoes::consolidar_arquivos_exportacao/);
});

test("a Produção oferece reprodução e acesso aos arquivos gerados", () => {
  const painel = ler("components/producao/painel-arquivos-tarefa.tsx");
  const detalhes = ler("components/producao/painel-detalhes-tarefa.tsx");
  const rust = ler("src-tauri/src/commands/exportacoes.rs");

  assert.match(painel, /Reproduzir/);
  assert.match(painel, /Abrir pasta/);
  assert.match(painel, /Mostrar na pasta/);
  assert.match(detalhes, /PainelArquivosTarefa/);
  assert.match(rust, /open_path/);
  assert.match(rust, /reveal_item_in_dir/);
});

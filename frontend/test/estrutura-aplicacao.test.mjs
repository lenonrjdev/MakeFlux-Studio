import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const raiz = dirname(dirname(fileURLToPath(import.meta.url)));
const ler = (caminho) => readFileSync(join(raiz, caminho), "utf8");

function listarArquivos(diretorio, extensao) {
  const base = join(raiz, diretorio);
  const encontrados = [];
  for (const entrada of readdirSync(base, { withFileTypes: true })) {
    const absoluto = join(base, entrada.name);
    if (entrada.isDirectory()) {
      encontrados.push(...listarArquivos(relative(raiz, absoluto), extensao));
    } else if (entrada.name.endsWith(extensao)) {
      encontrados.push(absoluto);
    }
  }
  return encontrados;
}

test("as rotas essenciais da aplicacao existem", () => {
  const rotas = [
    "app/page.tsx",
    "app/criar-video/page.tsx",
    "app/projetos/page.tsx",
    "app/producao/page.tsx",
    "app/laboratorio-de-ia/page.tsx",
    "app/biblioteca/page.tsx",
    "app/templates/page.tsx",
    "app/publicacao/page.tsx",
    "app/integracoes/page.tsx",
    "app/configuracoes/page.tsx",
    "app/central-de-ajuda/page.tsx",
  ];
  for (const rota of rotas) {
    assert.equal(existsSync(join(raiz, rota)), true, `Rota ausente: ${rota}`);
  }
});

test("as versoes do frontend e do aplicativo desktop permanecem sincronizadas", () => {
  const pacote = JSON.parse(ler("package.json"));
  const tauri = JSON.parse(ler("src-tauri/tauri.conf.json"));
  const cargo = ler("src-tauri/Cargo.toml");
  const versaoCargo = cargo.match(/\[package\][\s\S]*?\nversion\s*=\s*"([^"]+)"/)?.[1];
  assert.equal(pacote.version, tauri.version);
  assert.equal(pacote.version, versaoCargo);
});

test("a navegacao contem os modulos obrigatorios do produto", () => {
  const navegacao = ler("data/navegacao.ts");
  for (const rota of [
    "/",
    "/criar-video",
    "/projetos",
    "/producao",
    "/laboratorio-de-ia",
    "/biblioteca",
    "/templates",
    "/publicacao",
    "/integracoes",
    "/configuracoes",
    "/central-de-ajuda",
  ]) {
    assert.match(navegacao, new RegExp(`href:\\s*[\"']${rota.replaceAll("/", "\\/")}[\"']`));
  }
});

test("nenhum componente importa o icone Waveform incompatível", () => {
  const componentes = listarArquivos("components", ".tsx");
  const invalidos = componentes.filter((arquivo) => /import\s*\{[^}]*\bWaveform\b[^}]*\}\s*from\s*["']lucide-react["']/.test(readFileSync(arquivo, "utf8")));
  assert.deepEqual(invalidos, []);
});

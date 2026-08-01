
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import test from "node:test";

const ler = (caminho) => readFile(new URL(`../${caminho}`, import.meta.url), "utf8");

const arquivos = [
  "app/instalacao/page.tsx",
  "components/instalacao/central-instalacao-assistida.tsx",
  "hooks/use-instalacao-assistida.ts",
  "lib/instalacao-nativa.ts",
  "types/instalacao.ts",
  "src-tauri/src/commands/instalacao.rs",
];

test("a Fase 19 possui a Central de Instalação Assistida completa", async () => {
  await Promise.all(arquivos.map((arquivo) => access(new URL(`../${arquivo}`, import.meta.url))));
});

test("a navegação e o cabeçalho expõem a rota de instalação", async () => {
  const [navegacao, cabecalho, modulos] = await Promise.all([
    ler("data/navegacao.ts"),
    ler("components/layout/cabecalho-aplicacao.tsx"),
    ler("content/modulos.ts"),
  ]);
  for (const conteudo of [navegacao, cabecalho, modulos]) assert.match(conteudo, /\/instalacao/);
});

test("o instalador nativo usa somente uma lista branca de pacotes WinGet", async () => {
  const rust = await ler("src-tauri/src/commands/instalacao.rs");
  for (const pacote of ["Git.Git", "Python.Python.3.11", "Gyan.FFmpeg", "astral-sh.uv", "ImageMagick.ImageMagick"]) assert.match(rust, new RegExp(pacote.replaceAll(".", "\\.")));
  assert.match(rust, /Dependência não autorizada/);
  assert.match(rust, /--disable-interactivity/);
});

test("o MoneyPrinterTurbo é clonado do repositório oficial e sincronizado pelo uv", async () => {
  const rust = await ler("src-tauri/src/commands/instalacao.rs");
  assert.match(rust, /harry0703\/MoneyPrinterTurbo\.git/);
  assert.match(rust, /"python", "install", "3\.11"/);
  assert.match(rust, /"sync", "--frozen"/);
  assert.match(rust, /config\.example\.toml/);
});

test("o workspace cria pastas permanentes para os principais dados", async () => {
  const rust = await ler("src-tauri/src/commands/instalacao.rs");
  for (const pasta of ["Motores", "Projetos", "Exportacoes", "Cache", "Modelos", "Logs"]) assert.match(rust, new RegExp(`join\\(\"${pasta}\"\\)`));
});

test("a instalação registra os caminhos do motor nas integrações", async () => {
  const [hook, integracoes] = await Promise.all([ler("hooks/use-instalacao-assistida.ts"), ler("lib/integracoes-local.ts")]);
  assert.match(hook, /configurarMoneyPrinterInstaladoLocal/);
  assert.match(integracoes, /pythonExecutavel/);
  assert.match(integracoes, /MoneyPrinterTurbo instalado pelo assistente/);
});

test("a linha 1.6+ permanece sincronizada", async () => {
  const [pkgTexto, cargoTexto, tauriTexto] = await Promise.all([ler("package.json"), ler("src-tauri/Cargo.toml"), ler("src-tauri/tauri.conf.json")]);
  const pkg = JSON.parse(pkgTexto);
  const tauri = JSON.parse(tauriTexto);
  const cargo = cargoTexto.match(/version = "([^"]+)"/)?.[1];
  assert.equal(pkg.version, tauri.version);
  assert.equal(pkg.version, cargo);
  assert.ok(Number(pkg.version.split(".")[1]) >= 6);
});

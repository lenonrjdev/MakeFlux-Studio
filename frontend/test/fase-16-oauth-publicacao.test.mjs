import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const raiz = dirname(dirname(fileURLToPath(import.meta.url)));
const ler = (caminho) => readFileSync(join(raiz, caminho), "utf8");

const arquivos = [
  "app/canais/page.tsx",
  "components/canais-publicacao/central-canais-publicacao.tsx",
  "components/canais-publicacao/modal-oauth-canal.tsx",
  "components/canais-publicacao/painel-publicar-canal.tsx",
  "hooks/use-canais-publicacao.ts",
  "lib/canais-publicacao-nativos.ts",
  "types/canais-publicacao.ts",
  "src-tauri/src/commands/oauth.rs",
  "src-tauri/src/commands/publicacao_social.rs",
];

test("a Fase 16 possui a central de contas e canais", () => {
  for (const arquivo of arquivos) assert.equal(existsSync(join(raiz, arquivo)), true, `Arquivo ausente: ${arquivo}`);
});

test("o OAuth usa state, PKCE, callback local e navegador externo", () => {
  const oauth = ler("src-tauri/src/commands/oauth.rs");
  for (const contrato of ["code_challenge", "code_verifier", "127.0.0.1:47891", "state", "open_url"]) assert.match(oauth, new RegExp(contrato));
});

test("tokens OAuth são enviados ao cofre e não ao localStorage", () => {
  const oauth = ler("src-tauri/src/commands/oauth.rs");
  assert.match(oauth, /salvar_segredo_interno/);
  assert.doesNotMatch(oauth, /localStorage/);
});

test("a publicação real cobre YouTube, Instagram e TikTok", () => {
  const publicacao = ler("src-tauri/src/commands/publicacao_social.rs");
  assert.match(publicacao, /uploadType=resumable/);
  assert.match(publicacao, /media_publish/);
  assert.match(publicacao, /post\/publish\/video\/init/);
});

test("o schema atual preserva conexões e envios da v4", () => {
  const dados = ler("src-tauri/src/commands/dados.rs");
  assert.match(dados, /conexoes_publicacao/);
  assert.match(dados, /envios_publicacao/);
  assert.match(dados, /user_version = (?:[4-9]|10)/);
});

test("as versões do frontend e do aplicativo desktop permanecem sincronizadas após a Fase 16", () => {
  const pacote = JSON.parse(ler("package.json"));
  const tauri = JSON.parse(ler("src-tauri/tauri.conf.json"));
  const cargo = ler("src-tauri/Cargo.toml");
  assert.equal(pacote.version, tauri.version);
  assert.ok(cargo.includes(`version = "${pacote.version}"`));
});

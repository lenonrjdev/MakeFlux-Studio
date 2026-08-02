import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const ler = (arquivo) => readFileSync(new URL(`../${arquivo}`, import.meta.url), "utf8");

test("a Fase 21 integra a Central de Distribuição robusta", () => {
  assert.match(ler("app/distribuicao/page.tsx"), /CentralDistribuicaoRobusta/);
  assert.match(ler("data/navegacao.ts"), /\/distribuicao/);
  assert.match(ler("components/layout/cabecalho-aplicacao.tsx"), /\/distribuicao/);
});

test("o Cloudinary usa upload em blocos e mantém credenciais no cofre", () => {
  const rust = ler("src-tauri/src/commands/armazenamento_publicacao.rs");
  assert.match(rust, /armazenamento:cloudinary/);
  assert.match(rust, /salvar_segredo_interno/);
  assert.match(rust, /X-Unique-Upload-Id/);
  assert.match(rust, /Content-Range/);
  assert.match(rust, /secure_url/);
  assert.match(rust, /signature/);
  assert.match(rust, /resources\/video\/upload/);
});

test("o YouTube possui sessão retomável, consulta de offset e upload em blocos", () => {
  const rust = ler("src-tauri/src/commands/publicacao_social.rs");
  assert.match(rust, /uploadType=resumable/);
  assert.match(rust, /bytes \*\//);
  assert.match(rust, /status\.as_u16\(\) == 308/);
  assert.match(rust, /CONTENT_RANGE/);
  assert.match(rust, /sessao_upload_url/);
});

test("o Instagram hospeda, acompanha o contêiner e publica somente quando finalizado", () => {
  const rust = ler("src-tauri/src/commands/publicacao_social.rs");
  assert.match(rust, /hospedar_video_temporario/);
  assert.match(rust, /status_code,status/);
  assert.match(rust, /FINISHED/);
  assert.match(rust, /media_publish/);
  assert.match(rust, /remover_ativo_temporario_interno/);
});

test("o TikTok usa FILE_UPLOAD, opções do criador e acompanhamento de status", () => {
  const rust = ler("src-tauri/src/commands/publicacao_social.rs");
  assert.match(rust, /creator_info\/query/);
  assert.match(rust, /FILE_UPLOAD/);
  assert.match(rust, /total_chunk_count/);
  assert.match(rust, /status\/fetch/);
  assert.match(rust, /consentimento_tiktok/);
});

test("tokens de YouTube, Instagram e TikTok podem ser renovados", () => {
  const rust = ler("src-tauri/src/commands/oauth.rs");
  assert.match(rust, /oauth-app:/);
  assert.match(rust, /oauth2\.googleapis\.com\/token/);
  assert.match(rust, /open\.tiktokapis\.com\/v2\/oauth\/token/);
  assert.match(rust, /graph\.instagram\.com\/refresh_access_token/);
  assert.match(rust, /renovar_token_canal_publicacao/);
});

test("a fila possui tentativas, cancelamento, repetição e recuperação", () => {
  const rust = ler("src-tauri/src/commands/publicacao_social.rs");
  for (const trecho of [
    "MAX_TENTATIVAS",
    "aguardando-nova-tentativa",
    "cancelar_envio_publicacao",
    "repetir_envio_publicacao",
    "recuperar_envios_interrompidos",
  ]) assert.match(rust, new RegExp(trecho));
});

test("o SQLite evolui para schema v7", () => {
  const dados = ler("src-tauri/src/commands/dados.rs");
  assert.match(dados, /configuracoes_armazenamento_publicacao/);
  assert.match(dados, /ativos_temporarios_publicacao/);
  assert.match(dados, /fila_publicacao_v2/);
  assert.match(dados, /PRAGMA user_version = (?:7|8|9)/);
});

test("a interface permanece clara e não persiste segredos no frontend", () => {
  const central = ler("components/distribuicao/central-distribuicao-robusta.tsx");
  const nativo = ler("lib/distribuicao-nativa.ts");
  assert.match(central, /bg-\[#f7f8f9\]/);
  assert.doesNotMatch(central, /dark:/);
  assert.doesNotMatch(nativo, /localStorage|sessionStorage/);
});

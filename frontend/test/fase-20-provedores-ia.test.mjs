import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const ler = (arquivo) => readFileSync(new URL(`../${arquivo}`, import.meta.url), "utf8");
test("a Fase 20 expõe os quatro provedores reais", () => { const dados=ler("data/provedores-ia.ts"); for (const id of ["openai","gemini","deepseek","ollama"]) assert.match(dados,new RegExp(`id: "${id}"`)); });
test("o backend integra Responses, GenerateContent, Chat Completions e Ollama chat", () => { const rust=ler("src-tauri/src/commands/provedores_ia.rs"); for (const trecho of ["/responses","generateContent","/chat/completions","/api/chat"]) assert.match(rust,new RegExp(trecho.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"))); });
test("credenciais de IA usam somente o cofre interno", () => { const rust=ler("src-tauri/src/commands/provedores_ia.rs"); assert.match(rust,/salvar_segredo_interno/); assert.match(rust,/ler_segredo_interno/); assert.doesNotMatch(ler("lib/provedores-ia-nativos.ts"),/localStorage/); });
test("execução real suporta fallback, limite diário e cancelamento", () => { const rust=ler("src-tauri/src/commands/provedores_ia.rs"); assert.match(rust,/permitir_fallback/); assert.match(rust,/limite_diario_requisicoes/); assert.match(rust,/cancelar_execucao_ia/); assert.match(rust,/tokio::select!/); });
test("o SQLite evolui para schema v6", () => { const dados=ler("src-tauri/src/commands/dados.rs"); assert.match(dados,/provedores_ia/); assert.match(dados,/execucoes_ia/); assert.match(dados,/VALUES \(6, \?1, \?2\)/); assert.match(dados,/PRAGMA user_version = (?:[6-9]|10)/); });
test("o Laboratório distingue execução real de demonstração", () => { const tipos=ler("types/laboratorio-ia.ts"); const hook=ler("hooks/use-laboratorio-ia-local.ts"); assert.match(tipos,/"real" \| "demonstracao"/); assert.match(hook,/executarExperimentoIaReal/); assert.match(hook,/executarExperimentoLaboratorioIaLocal/); });
test("a central de provedores integra rota e navegação", () => { assert.match(ler("app/provedores-ia/page.tsx"),/CentralProvedoresIa/); assert.match(ler("data/navegacao.ts"),/\/provedores-ia/); assert.match(ler("components/layout/cabecalho-aplicacao.tsx"),/\/provedores-ia/); });

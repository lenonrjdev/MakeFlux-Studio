
import { registrarLogEstruturado } from "@/lib/observabilidade-nativa";
import type { EntradaLogEstruturado, NivelLog, OrigemLog } from "@/types/observabilidade";

let contadorCorrelacao = 0;

export function criarCorrelacaoId(prefixo = "fluxo") {
  contadorCorrelacao += 1;
  return `${prefixo}-${Date.now().toString(36)}-${contadorCorrelacao.toString(36)}`;
}

export function obterCorrelacaoSessao() {
  if (typeof window === "undefined") return "sessao-servidor";
  const chave = "makeflux:correlacao-sessao:v1";
  const existente = window.sessionStorage.getItem(chave);
  if (existente) return existente;
  const novo = criarCorrelacaoId("sessao");
  window.sessionStorage.setItem(chave, novo);
  return novo;
}

export async function registrarEventoTecnico(
  evento: string,
  mensagem: string,
  opcoes: {
    nivel?: NivelLog;
    origem?: OrigemLog;
    correlacaoId?: string;
    contexto?: EntradaLogEstruturado["contexto"];
  } = {},
) {
  try {
    return await registrarLogEstruturado({
      nivel: opcoes.nivel ?? "info",
      origem: opcoes.origem ?? "frontend",
      evento,
      mensagem,
      correlacaoId: opcoes.correlacaoId ?? obterCorrelacaoSessao(),
      contexto: opcoes.contexto ?? {},
    });
  } catch {
    return null;
  }
}

export async function executarComObservabilidade<T>(
  evento: string,
  operacao: (correlacaoId: string) => Promise<T>,
  opcoes: { origem?: OrigemLog; contexto?: Record<string, unknown>; correlacaoId?: string } = {},
) {
  const correlacaoId = opcoes.correlacaoId ?? criarCorrelacaoId(evento.replace(/[^a-z0-9]+/gi, "-"));
  const inicio = performance.now();
  await registrarEventoTecnico(`${evento}.inicio`, "Execução iniciada.", {
    origem: opcoes.origem,
    correlacaoId,
    contexto: opcoes.contexto,
  });
  try {
    const resultado = await operacao(correlacaoId);
    await registrarEventoTecnico(`${evento}.sucesso`, "Execução concluída.", {
      origem: opcoes.origem,
      correlacaoId,
      contexto: { ...opcoes.contexto, duracaoMs: Math.round(performance.now() - inicio) },
    });
    return resultado;
  } catch (causa) {
    await registrarEventoTecnico(`${evento}.falha`, causa instanceof Error ? causa.message : String(causa), {
      nivel: "erro",
      origem: opcoes.origem,
      correlacaoId,
      contexto: { ...opcoes.contexto, duracaoMs: Math.round(performance.now() - inicio) },
    });
    throw causa;
  }
}

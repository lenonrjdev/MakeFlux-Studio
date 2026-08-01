
import { invoke } from "@tauri-apps/api/core";

import { logsDemonstrativos } from "@/data/observabilidade";
import { emAmbienteTauri } from "@/lib/runtime-nativo";
import type {
  EntradaLogEstruturado,
  FiltrosLogs,
  LogEstruturado,
  ResultadoExportacaoDiagnostico,
  ResultadoLimpezaLogs,
  ResumoObservabilidade,
} from "@/types/observabilidade";

const CHAVE_LOGS_WEB = "makeflux:observabilidade-web:v1";

function lerWeb() {
  if (typeof window === "undefined") return logsDemonstrativos;
  try {
    const valor = window.localStorage.getItem(CHAVE_LOGS_WEB);
    return valor ? (JSON.parse(valor) as LogEstruturado[]) : logsDemonstrativos;
  } catch {
    return logsDemonstrativos;
  }
}

function salvarWeb(logs: LogEstruturado[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CHAVE_LOGS_WEB, JSON.stringify(logs.slice(0, 500)));
  }
}

function serializarContexto(contexto: EntradaLogEstruturado["contexto"]) {
  if (typeof contexto === "string") return contexto;
  if (!contexto) return "{}";
  try {
    return JSON.stringify(contexto);
  } catch {
    return JSON.stringify({ detalhe: "Contexto não serializável." });
  }
}

export async function registrarLogEstruturado(entrada: EntradaLogEstruturado) {
  const normalizada = { ...entrada, contexto: serializarContexto(entrada.contexto), criadoEm: entrada.criadoEm ?? Date.now() };
  if (emAmbienteTauri()) return invoke<LogEstruturado>("registrar_log_estruturado", { entrada: normalizada });
  const log: LogEstruturado = {
    id: `log-web-${normalizada.criadoEm}-${Math.random().toString(36).slice(2, 8)}`,
    nivel: normalizada.nivel,
    origem: normalizada.origem,
    evento: normalizada.evento,
    mensagem: normalizada.mensagem,
    correlacaoId: normalizada.correlacaoId,
    contexto: normalizada.contexto,
    criadoEm: normalizada.criadoEm,
  };
  salvarWeb([log, ...lerWeb()]);
  return log;
}

export async function listarLogsEstruturados(filtros: FiltrosLogs) {
  if (emAmbienteTauri()) return invoke<LogEstruturado[]>("listar_logs_estruturados", { filtros });
  const termo = filtros.termo.trim().toLowerCase();
  return lerWeb()
    .filter((log) => filtros.nivel === "todos" || log.nivel === filtros.nivel)
    .filter((log) => filtros.origem === "todas" || log.origem === filtros.origem)
    .filter((log) => !filtros.correlacaoId || log.correlacaoId.includes(filtros.correlacaoId))
    .filter((log) => !termo || `${log.evento} ${log.mensagem} ${log.contexto}`.toLowerCase().includes(termo))
    .slice(0, filtros.limite);
}

export async function consultarResumoObservabilidade(): Promise<ResumoObservabilidade> {
  if (emAmbienteTauri()) return invoke<ResumoObservabilidade>("consultar_resumo_observabilidade");
  const logs = lerWeb();
  const limite24h = Date.now() - 86_400_000;
  return {
    disponivel: false,
    schemaVersao: 6,
    totalLogs: logs.length,
    erros24h: logs.filter((log) => log.nivel === "erro" && log.criadoEm >= limite24h).length,
    avisos24h: logs.filter((log) => log.nivel === "aviso" && log.criadoEm >= limite24h).length,
    correlacoes24h: new Set(logs.filter((log) => log.criadoEm >= limite24h).map((log) => log.correlacaoId)).size,
    ultimoErroEm: logs.find((log) => log.nivel === "erro")?.criadoEm ?? null,
    tamanhoAproximadoBytes: new Blob([JSON.stringify(logs)]).size,
    retencaoDias: 30,
    caminhoBanco: "Prévia web",
    mensagem: "Registros demonstrativos da prévia web.",
  };
}

export async function limparLogsEstruturados(retencaoDias: number): Promise<ResultadoLimpezaLogs> {
  if (emAmbienteTauri()) return invoke<ResultadoLimpezaLogs>("limpar_logs_estruturados", { retencaoDias });
  const limiteEm = Date.now() - Math.max(1, retencaoDias) * 86_400_000;
  const atuais = lerWeb();
  const restantes = atuais.filter((log) => log.criadoEm >= limiteEm);
  salvarWeb(restantes);
  return { removidos: atuais.length - restantes.length, restantes: restantes.length, limiteEm, mensagem: "Retenção aplicada na prévia web." };
}

export async function exportarPacoteDiagnostico(limite = 2_000): Promise<ResultadoExportacaoDiagnostico> {
  if (!emAmbienteTauri()) throw new Error("A exportação do diagnóstico exige o aplicativo desktop.");
  return invoke<ResultadoExportacaoDiagnostico>("exportar_pacote_diagnostico", { limite });
}

export async function revelarPacoteDiagnostico(caminho: string) {
  if (!emAmbienteTauri()) throw new Error("Esta ação exige o aplicativo desktop.");
  return invoke<void>("revelar_pacote_diagnostico", { caminho });
}


export type NivelLog = "debug" | "info" | "aviso" | "erro";
export type OrigemLog = "frontend" | "rust" | "moneyprinter" | "provedor" | "publicacao" | "sistema";

export interface EntradaLogEstruturado {
  nivel: NivelLog;
  origem: OrigemLog;
  evento: string;
  mensagem: string;
  correlacaoId: string;
  contexto?: Record<string, unknown> | string | null;
  criadoEm?: number;
}

export interface LogEstruturado {
  id: string;
  nivel: NivelLog;
  origem: OrigemLog;
  evento: string;
  mensagem: string;
  correlacaoId: string;
  contexto: string;
  criadoEm: number;
}

export interface FiltrosLogs {
  nivel: NivelLog | "todos";
  origem: OrigemLog | "todas";
  termo: string;
  correlacaoId: string;
  limite: number;
}

export interface ResumoObservabilidade {
  disponivel: boolean;
  schemaVersao: number;
  totalLogs: number;
  erros24h: number;
  avisos24h: number;
  correlacoes24h: number;
  ultimoErroEm: number | null;
  tamanhoAproximadoBytes: number;
  retencaoDias: number;
  caminhoBanco: string;
  mensagem: string;
}

export interface ResultadoLimpezaLogs {
  removidos: number;
  restantes: number;
  limiteEm: number;
  mensagem: string;
}

export interface ResultadoExportacaoDiagnostico {
  caminho: string;
  registros: number;
  tamanhoBytes: number;
  criadoEm: number;
  mensagem: string;
}

export interface CorrelacaoResumo {
  id: string;
  total: number;
  erros: number;
  primeiroEm: number;
  ultimoEm: number;
  ultimoEvento: string;
}

export type StatusValidacaoEstabilidade = "saudavel" | "atencao" | "critico";

export interface StatusEstabilidade {
  disponivel: boolean;
  modoSeguro: boolean;
  falhasConsecutivas: number;
  execucaoAnteriorInesperada: boolean;
  restauracaoPendente: boolean;
  rotaUltimaSessao: string;
  sessaoAtualizadaEm: number | null;
  ultimaSaidaLimpaEm: number | null;
  bancoIntegro: boolean;
  cacheBytes: number;
  incidentes24h: number;
  ultimoIncidenteEm: number | null;
  caminhoBanco: string;
  mensagem: string;
}

export interface EntradaSessaoEstabilidade {
  rota: string;
  contexto?: Record<string, unknown> | null;
}

export interface EntradaIncidenteEstabilidade {
  origem: string;
  categoria: string;
  mensagem: string;
  contexto?: Record<string, unknown> | null;
  correlacaoId?: string | null;
}

export interface IncidenteEstabilidade {
  id: string;
  origem: string;
  categoria: string;
  mensagem: string;
  contexto: string;
  correlacaoId: string;
  criadoEm: number;
  recuperado: boolean;
}

export interface ItemValidacaoEstabilidade {
  id: string;
  titulo: string;
  status: StatusValidacaoEstabilidade;
  detalhe: string;
  caminho: string | null;
  acaoRecomendada: string;
}

export interface ResultadoValidacaoEstabilidade {
  itens: ItemValidacaoEstabilidade[];
  bloqueios: number;
  avisos: number;
  executadoEm: number;
  mensagem: string;
}

export interface ResultadoReparoBanco {
  sucesso: boolean;
  alterado: boolean;
  integridadeAntes: string;
  integridadeDepois: string;
  backupPath: string;
  criadoEm: number;
  mensagem: string;
}

export interface ResultadoLimpezaCache {
  arquivosRemovidos: number;
  bytesLiberados: number;
  caminhosInspecionados: string[];
  retencaoDias: number;
  executadoEm: number;
  mensagem: string;
}

export interface ResultadoExportacaoEstabilidade {
  caminho: string;
  incidentes: number;
  tamanhoBytes: number;
  criadoEm: number;
  mensagem: string;
}

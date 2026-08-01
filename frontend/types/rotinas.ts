export type TipoRotina =
  | "lembrete"
  | "checkpoint-wal"
  | "otimizar-banco"
  | "verificar-integridade"
  | "limpar-telemetria"
  | "relatorio-workspace";

export type FrequenciaRotina = "uma-vez" | "diaria" | "semanal" | "mensal" | "intervalo";
export type StatusExecucaoRotina = "executando" | "concluida" | "falha";
export type NivelNotificacao = "informacao" | "sucesso" | "atencao" | "erro";

export interface RotinaAgendada {
  id: string;
  nome: string;
  descricao: string;
  tipo: TipoRotina;
  frequencia: FrequenciaRotina;
  intervaloMinutos: number | null;
  proximaExecucaoEm: number | null;
  ativa: boolean;
  notificar: boolean;
  parametros: string;
  criadoEm: number;
  atualizadoEm: number;
  ultimaExecucaoEm: number | null;
  ultimoStatus: string | null;
}

export interface EntradaRotinaAgendada {
  id?: string;
  nome: string;
  descricao: string;
  tipo: TipoRotina;
  frequencia: FrequenciaRotina;
  intervaloMinutos?: number | null;
  proximaExecucaoEm?: number | null;
  ativa: boolean;
  notificar: boolean;
  parametros: string;
}

export interface ExecucaoRotina {
  id: string;
  rotinaId: string;
  rotinaNome: string;
  status: StatusExecucaoRotina;
  iniciadaEm: number;
  concluidaEm: number | null;
  duracaoMs: number;
  mensagem: string;
}

export interface NotificacaoLocal {
  id: string;
  titulo: string;
  corpo: string;
  nivel: NivelNotificacao;
  rota: string | null;
  lida: boolean;
  criadaEm: number;
}

export interface StatusAgendadorRotinas {
  disponivel: boolean;
  workerAtivo: boolean;
  ultimoCicloEm: number | null;
  rotinasAtivas: number;
  rotinasPendentes: number;
  notificacoesNaoLidas: number;
  proximaExecucaoEm: number | null;
  mensagem: string;
}

export interface ResultadoProcessamentoRotinas {
  verificadas: number;
  executadas: number;
  falhas: number;
  mensagem: string;
}

export type StatusDesempenhoBanco = {
  disponivel: boolean;
  schemaVersao: number;
  registrosWorkspace: number;
  registrosTelemetria: number;
  tamanhoBancoBytes: number;
  tamanhoWalBytes: number;
  paginas: number;
  paginasLivres: number;
  tamanhoPagina: number;
  fragmentacaoPercentual: number;
  consultasLentas: number;
  operacoesAtivas: number;
  ultimaManutencaoEm: number | null;
  mensagem: string;
};

export type RegistroPaginado = {
  chave: string;
  origem: string;
  atualizadoEm: number;
  tamanhoBytes: number;
  previa: string;
};

export type PaginaRegistros = {
  itens: RegistroPaginado[];
  total: number;
  proximoCursor: string | null;
  duracaoMs: number;
};

export type FiltroRegistros = {
  termo?: string;
  origem?: string;
  limite?: number;
  cursor?: string | null;
  ordem?: "chave-asc" | "recentes" | "maiores";
};

export type TipoOperacaoLote = "gerar-dados-teste" | "remover-dados-teste" | "reindexar";
export type StatusOperacaoLote = "aguardando" | "processando" | "concluida" | "cancelada" | "erro";

export type OperacaoLote = {
  id: string;
  tipo: TipoOperacaoLote;
  status: StatusOperacaoLote;
  total: number;
  processados: number;
  afetados: number;
  iniciadoEm: number;
  atualizadoEm: number;
  mensagem: string;
};

export type SolicitacaoOperacaoLote = {
  tipo: TipoOperacaoLote;
  quantidade?: number;
  tamanhoPayload?: number;
};

export type ResultadoManutencao = {
  sucesso: boolean;
  acao: "otimizar" | "checkpoint" | "compactar";
  antesBytes: number;
  depoisBytes: number;
  duracaoMs: number;
  mensagem: string;
};

export type MetricasSessaoDesempenho = {
  paginasCarregadas: number;
  registrosVisualizados: number;
  ultimaConsultaMs: number;
  maiorConsultaMs: number;
};

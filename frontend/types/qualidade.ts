export type RegistroPersistenciaLocal = {
  chave: string;
  valor: string;
  atualizadoEm: number;
  origem: string;
};

export type StatusBancoLocal = {
  disponivel: boolean;
  caminho: string;
  registros: number;
  bytesAproximados: number;
  ultimaMigracaoEm: number | null;
  mensagem: string;
};

export type ResultadoMigracaoSqlite = StatusBancoLocal & {
  migrados: number;
  ignorados: number;
};

export type StatusCofreNativo = {
  disponivel: boolean;
  inicializado: boolean;
  desbloqueado: boolean;
  caminho: string;
  quantidadeSegredos: number;
  mensagem: string;
};

export type SegredoCofreResumo = {
  chave: string;
  atualizadoEm: number;
};

export type EventoTelemetriaLocal = {
  id: string;
  categoria: "navegacao" | "desempenho" | "erro" | "qualidade";
  nome: string;
  detalhes: string;
  criadoEm: number;
};

export type PreferenciasTelemetriaLocal = {
  ativa: boolean;
  reterDias: number;
  atualizadoEm: string;
};

export type ItemProntidaoDistribuicao = {
  id: string;
  titulo: string;
  descricao: string;
  status: "aprovado" | "atencao" | "pendente";
};

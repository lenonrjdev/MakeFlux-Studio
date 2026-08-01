export type StatusPortaoBeta = "aprovado" | "atencao" | "bloqueado";
export type StatusSessaoBeta = "em-andamento" | "aprovada" | "encerrada";

export type PortaoBeta = {
  id: string;
  titulo: string;
  detalhe: string;
  status: StatusPortaoBeta;
  obrigatorio: boolean;
  automatico: true;
};

export type CheckBeta = {
  id: string;
  categoria: string;
  titulo: string;
  descricao: string;
  obrigatorio: boolean;
  concluido: boolean;
  evidencia: string;
  atualizadoEm: number;
};

export type SessaoBeta = {
  id: string;
  nome: string;
  alvo: string;
  status: StatusSessaoBeta;
  score: number;
  iniciadoEm: number;
  finalizadoEm: number | null;
  mensagem: string;
};

export type PainelBetaOperacional = {
  sessao: SessaoBeta | null;
  portoes: PortaoBeta[];
  checklist: CheckBeta[];
  score: number;
  apto: boolean;
  bloqueios: number;
  avisos: number;
  atualizadoEm: number;
  mensagem: string;
};

export type EntradaSessaoBeta = {
  nome: string;
  alvo: string;
};

export type EntradaCheckBeta = {
  checkId: string;
  concluido: boolean;
  evidencia: string;
};

export type ArtefatoBeta = {
  caminho: string;
  tamanhoBytes: number;
  criadoEm: number;
  checksumSha256: string | null;
  mensagem: string;
};

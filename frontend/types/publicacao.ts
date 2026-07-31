export type PlataformaPublicacao = "youtube-shorts" | "instagram-reels" | "tiktok" | "youtube";

export type StatusPublicacao =
  | "rascunho"
  | "pronta"
  | "agendada"
  | "publicada"
  | "falha"
  | "arquivada";

export type FiltroPublicacoes =
  | "todas"
  | "rascunhos"
  | "prontas"
  | "agendadas"
  | "publicadas"
  | "falhas"
  | "arquivadas"
  | PlataformaPublicacao;

export type OrdenacaoPublicacoes = "recentes" | "antigas" | "titulo-az" | "agendamento";
export type VisualizacaoPublicacoes = "grade" | "calendario";
export type EstiloThumbnail = "contraste" | "clean" | "cinematografica" | "texto-grande";

export type EventoPublicacao = {
  id: string;
  tipo: "criada" | "metadados" | "agendada" | "publicada" | "falha" | "duplicada" | "arquivada";
  descricao: string;
  criadoEm: string;
};

export type PublicacaoStudio = {
  id: string;
  projetoId: string | null;
  tarefaId: string | null;
  nome: string;
  plataforma: PlataformaPublicacao;
  status: StatusPublicacao;
  titulo: string;
  descricao: string;
  hashtags: string[];
  chamadaParaAcao: string;
  estiloThumbnail: EstiloThumbnail;
  textoThumbnail: string;
  corThumbnail: string;
  caminhoVideo: string;
  nomeArquivo: string;
  duracao: string;
  formato: string;
  agendadaPara: string | null;
  publicadaEm: string | null;
  linkPublicado: string;
  favorito: boolean;
  criadoEm: string;
  atualizadoEm: string;
  historico: EventoPublicacao[];
};

export type WorkspacePublicacao = {
  versao: 1;
  publicacoes: PublicacaoStudio[];
};

export type DadosCriarPublicacao = {
  projetoId?: string | null;
  tarefaId?: string | null;
  plataforma: PlataformaPublicacao;
  nome?: string;
};

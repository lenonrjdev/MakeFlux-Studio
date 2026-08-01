export type ProvedorCanalPublicacao = "youtube" | "instagram" | "tiktok";
export type StatusConexaoCanal = "conectada" | "expirada" | "atencao";
export type StatusEnvioSocial = "preparando" | "enviando" | "processando" | "publicada" | "falha";

export type ConexaoCanalPublicacao = {
  provedor: ProvedorCanalPublicacao;
  contaId: string;
  contaNome: string;
  escopos: string[];
  status: StatusConexaoCanal;
  expiraEm: number | null;
  conectadaEm: number;
  atualizadaEm: number;
  detalhes: string;
};

export type InicioOauthPublicacao = {
  sessaoId: string;
  provedor: ProvedorCanalPublicacao;
  urlAutorizacao: string;
  redirectUri: string;
  expiraEm: number;
};

export type ResultadoOauthPublicacao = {
  concluido: boolean;
  pendente: boolean;
  mensagem: string;
  conexao: ConexaoCanalPublicacao | null;
};

export type CredenciaisAplicativoCanal = {
  provedor: ProvedorCanalPublicacao;
  clientId: string;
  clientSecret: string;
};

export type EntradaPublicacaoSocial = {
  provedor: ProvedorCanalPublicacao;
  publicacaoId: string;
  titulo: string;
  descricao: string;
  hashtags: string[];
  caminhoVideo?: string | null;
  mediaUrl?: string | null;
  contaId?: string | null;
  privacidade?: "publica" | "nao-listada" | "privada";
};

export type EnvioPublicacaoSocial = {
  id: string;
  publicacaoId: string;
  provedor: ProvedorCanalPublicacao;
  status: StatusEnvioSocial;
  progresso: number;
  remotoId: string | null;
  link: string | null;
  criadoEm: number;
  atualizadoEm: number;
  mensagem: string;
};

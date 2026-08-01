export type ConfiguracaoArmazenamentoPublicacao = {
  provedor: "cloudinary";
  cloudName: string;
  apiKeyConfigurada: boolean;
  apiSecretConfigurado: boolean;
  tamanhoBlocoMb: number;
  retencaoHoras: number;
  limpezaAutomatica: boolean;
  status: "nao-configurado" | "configurado" | "pronto" | "falha";
  ultimaVerificacaoEm: number | null;
  mensagem: string;
};

export type EntradaConfiguracaoArmazenamento = {
  cloudName: string;
  apiKey?: string | null;
  apiSecret?: string | null;
  tamanhoBlocoMb: number;
  retencaoHoras: number;
  limpezaAutomatica: boolean;
};

export type AtivoTemporarioPublicacao = {
  id: string;
  provedor: "cloudinary";
  publicId: string;
  urlPublica: string;
  caminhoLocal: string;
  status: "enviando" | "disponivel" | "falha" | "cancelado" | "removido";
  bytes: number;
  criadoEm: number;
  atualizadoEm: number;
  expiraEm: number;
  removidoEm: number | null;
  mensagem: string;
  correlacaoId: string;
};

export type ResultadoLimpezaAtivos = {
  analisados: number;
  removidos: number;
  falhas: number;
  mensagem: string;
};

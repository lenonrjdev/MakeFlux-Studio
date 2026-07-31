export type IdEtapaCriacao =
  | "ideia"
  | "roteiro"
  | "cenas"
  | "narracao"
  | "legendas"
  | "musica"
  | "exportacao";

export type ModoCriacao = "rapido" | "assistido" | "avancado";
export type PlataformaVideo = "shorts" | "reels" | "tiktok" | "youtube";
export type FormatoVideo = "9:16" | "16:9" | "1:1";
export type ObjetivoVideo = "informar" | "educar" | "entreter" | "promover";

export type CenaVideo = {
  id: number;
  titulo: string;
  trecho: string;
  termo: string;
  duracao: number;
  origem: string;
  arquivoLocal?: string;
};

export type ConfiguracaoCriacaoVideo = {
  nomeProjeto: string;
  tema: string;
  objetivo: ObjetivoVideo;
  publico: string;
  plataforma: PlataformaVideo;
  idioma: string;
  duracao: string;
  formato: FormatoVideo;
  modo: ModoCriacao;
  modeloIa: string;
  promptRoteiro: string;
  systemPrompt: string;
  roteiro: string;
  fonteMateriais: string;
  correspondenciaNarrativa: boolean;
  cenas: CenaVideo[];
  provedorVoz: string;
  voz: string;
  velocidadeVoz: number;
  volumeVoz: number;
  narracaoLocal?: { nome: string; caminho: string };
  legendasAtivas: boolean;
  presetLegenda: string;
  posicaoLegenda: string;
  tamanhoLegenda: number;
  legendaLocal?: { nome: string; caminho: string };
  musicaAtiva: boolean;
  musica: string;
  volumeMusica: number;
  musicaLocal?: { nome: string; caminho: string };
  qualidade: string;
  codificador: string;
  quantidadeVersoes: number;
};

export type AtualizarConfiguracaoVideo = <K extends keyof ConfiguracaoCriacaoVideo>(
  campo: K,
  valor: ConfiguracaoCriacaoVideo[K],
) => void;

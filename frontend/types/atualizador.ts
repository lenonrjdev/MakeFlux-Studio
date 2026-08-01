export type StatusFluxoAtualizacao =
  | "ocioso"
  | "verificando"
  | "disponivel"
  | "baixando"
  | "pronto"
  | "instalando"
  | "concluido"
  | "erro";

export type TipoOperacaoAtualizador = "verificacao" | "download" | "instalacao" | "rollback";
export type ResultadoOperacaoAtualizador = "sucesso" | "aviso" | "erro";

export type StatusAtualizadorNativo = {
  versaoAtual: string;
  alvo: string;
  configurado: boolean;
  endpoint: string | null;
  assinaturaObrigatoria: true;
};

export type MetadadosAtualizacaoAssinada = {
  versao: string;
  versaoAtual: string;
  notas: string;
  publicadaEm: string | null;
  rollback: boolean;
  alvo: string;
};

export type RegistroHistoricoAtualizador = {
  id: string;
  operacao: TipoOperacaoAtualizador;
  resultado: ResultadoOperacaoAtualizador;
  mensagem: string;
  versao: string | null;
  criadoEm: string;
};

export type WorkspaceAtualizador = {
  versao: 1;
  status: StatusFluxoAtualizacao;
  canal: "estavel" | "antecipado";
  progresso: number;
  bytesBaixados: number;
  totalBytes: number;
  mensagem: string;
  ultimaVerificacaoEm: string | null;
  atualizacao: MetadadosAtualizacaoAssinada | null;
  historico: RegistroHistoricoAtualizador[];
  atualizadoEm: string;
};

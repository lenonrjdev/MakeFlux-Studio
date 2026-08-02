export type StatusFluxoAtualizacao =
  | "ocioso"
  | "verificando"
  | "disponivel"
  | "baixando"
  | "pronto"
  | "preparando"
  | "instalando"
  | "concluido"
  | "erro";

export type CanalAtualizacao = "estavel" | "beta";
export type TipoOperacaoAtualizador = "verificacao" | "download" | "instalacao" | "rollback" | "confirmacao";
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

export type RegistroAtualizacaoReal = {
  id: string;
  versaoOrigem: string;
  versaoDestino: string;
  canal: CanalAtualizacao;
  tipo: "atualizacao" | "rollback";
  status: string;
  bancoIntegroAntes: boolean;
  bancoIntegroDepois: boolean | null;
  workspaceRegistrosAntes: number;
  workspaceRegistrosDepois: number | null;
  bancoBytesAntes: number;
  bancoBytesDepois: number | null;
  bancoSha256Antes: string;
  bancoSha256Depois: string | null;
  cofreExistiaAntes: boolean;
  cofreExisteDepois: boolean | null;
  snapshotPath: string;
  iniciadaEm: number;
  concluidaEm: number | null;
  mensagem: string;
  checkpointPrevio: boolean;
};

export type PainelHomologacaoAtualizador = {
  versaoAtual: string;
  checkpointPendente: RegistroAtualizacaoReal | null;
  ultimaOperacao: RegistroAtualizacaoReal | null;
  historico: RegistroAtualizacaoReal[];
  dadosPreservados: boolean | null;
  rollbackDisponivel: boolean;
  atualizadoEm: number;
};

export type WorkspaceAtualizador = {
  versao: 2;
  status: StatusFluxoAtualizacao;
  canal: CanalAtualizacao;
  progresso: number;
  bytesBaixados: number;
  totalBytes: number;
  mensagem: string;
  ultimaVerificacaoEm: string | null;
  atualizacao: MetadadosAtualizacaoAssinada | null;
  historico: RegistroHistoricoAtualizador[];
  atualizadoEm: string;
};

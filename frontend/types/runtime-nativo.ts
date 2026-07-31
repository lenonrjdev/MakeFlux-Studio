export type ExecutavelDetectado = {
  nome: string;
  disponivel: boolean;
  caminho: string | null;
  versao: string | null;
};

export type CapacidadesSistema = {
  sistemaOperacional: string;
  arquitetura: string;
  nucleosLogicos: number;
  memoriaTotalMb: number;
  gpu: string | null;
  python: ExecutavelDetectado;
  ffmpeg: ExecutavelDetectado;
  git: ExecutavelDetectado;
  uv: ExecutavelDetectado;
  modoOfflinePronto: boolean;
  detectadoEm: string;
};

export type RespostaHttpNativa = {
  sucesso: boolean;
  status: number;
  latenciaMs: number;
  corpo: unknown;
  mensagem: string;
};

export type EstadoMotorNativo = {
  executando: boolean;
  pid: number | null;
  diretorio: string | null;
  iniciadoEm: string | null;
  log: string | null;
};

export type DiagnosticoMoneyPrinter = {
  disponivel: boolean;
  endpoint: string;
  latenciaMs: number;
  versao: string | null;
  tituloApi: string | null;
  mensagem: string;
};

export type RegistroRollbackMotor = {
  commit: string;
  branch: string;
  criadoEm: string;
  branchBackup: string;
};

export type EstadoRepositorioMotor = {
  valido: boolean;
  diretorio: string;
  branch: string;
  commitAtual: string;
  remoto: string | null;
  limpo: boolean;
  commitsPendentes: number;
  atualizacaoDisponivel: boolean;
  rollbackDisponivel: boolean;
  rollback: RegistroRollbackMotor | null;
  mensagem: string;
};

export type ResultadoAtualizacaoMotor = {
  sucesso: boolean;
  commitAnterior: string;
  commitAtual: string;
  branchBackup: string | null;
  mensagem: string;
};


export type IdDependenciaInstalacao = "git" | "python" | "ffmpeg" | "uv" | "imagemagick";

export type DependenciaInstalacao = {
  id: IdDependenciaInstalacao;
  nome: string;
  obrigatoria: boolean;
  disponivel: boolean;
  caminho: string | null;
  versao: string | null;
  pacoteWinget: string;
  mensagem: string;
};

export type EstruturaWorkspaceInstalacao = {
  raiz: string;
  motores: string;
  projetos: string;
  exportacoes: string;
  cache: string;
  modelos: string;
  logs: string;
  criada: boolean;
};

export type DiagnosticoInstalacaoAssistida = {
  desktop: boolean;
  windows: boolean;
  wingetDisponivel: boolean;
  wingetVersao: string | null;
  dependencias: DependenciaInstalacao[];
  workspace: EstruturaWorkspaceInstalacao | null;
  diretorioMoneyPrinter: string | null;
  moneyPrinterDetectado: boolean;
  ambientePythonPronto: boolean;
  configCriada: boolean;
  prontoParaMotor: boolean;
  prontoParaProducao: boolean;
  mensagem: string;
  detectadoEm: number;
};

export type ResultadoOperacaoInstalacao = {
  sucesso: boolean;
  operacao: string;
  mensagem: string;
  detalhes: string;
  caminho: string | null;
  reinicioRecomendado: boolean;
};

export type ResultadoInstalacaoMoneyPrinter = ResultadoOperacaoInstalacao & {
  diretorio: string;
  pythonExecutavel: string;
  config: string;
  clonado: boolean;
  ambienteSincronizado: boolean;
};

export type ValidacaoMoneyPrinterAssistida = {
  valido: boolean;
  diretorio: string;
  pythonExecutavel: string | null;
  pythonVersao: string | null;
  mainPy: boolean;
  pyproject: boolean;
  uvLock: boolean;
  config: boolean;
  ffmpeg: boolean;
  imageMagick: boolean;
  mensagem: string;
};

export type EtapaInstalacao = "diagnostico" | "workspace" | "dependencias" | "motor" | "homologacao";

export type RegistroInstalacao = {
  id: string;
  tipo: "info" | "sucesso" | "aviso" | "erro";
  mensagem: string;
  criadoEm: number;
};

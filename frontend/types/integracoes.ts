export type CategoriaIntegracao =
  | "motor"
  | "inteligencia-artificial"
  | "midia"
  | "voz"
  | "legendas"
  | "sistema"
  | "publicacao";

export type StatusIntegracao = "conectada" | "nao-configurada" | "atencao" | "indisponivel";
export type TipoExecucaoIntegracao = "nuvem" | "local" | "hibrida";
export type ModoProcessamento = "online" | "hibrido" | "offline";

export type CapacidadeIntegracao =
  | "motor-video"
  | "roteiro"
  | "termos-visuais"
  | "metadados"
  | "materiais"
  | "narracao"
  | "legendas"
  | "renderizacao"
  | "publicacao";

export type FiltroIntegracoes =
  | "todas"
  | "conectadas"
  | "nao-configuradas"
  | "atencao"
  | "locais"
  | "nuvem";

export type OrdenacaoIntegracoes = "categoria" | "nome" | "status" | "recentes";

export type TipoCampoIntegracao = "texto" | "segredo" | "selecao" | "numero" | "interruptor";

export type OpcaoCampoIntegracao = {
  valor: string;
  rotulo: string;
};

export type CampoConfiguracaoIntegracao = {
  id: string;
  rotulo: string;
  descricao?: string;
  tipo: TipoCampoIntegracao;
  placeholder?: string;
  opcoes?: OpcaoCampoIntegracao[];
  minimo?: number;
  maximo?: number;
  passo?: number;
  sensivel?: boolean;
};

export type EventoIntegracao = {
  id: string;
  tipo: "configurada" | "testada" | "ativada" | "desativada" | "padrao" | "falha" | "restaurada";
  descricao: string;
  criadoEm: string;
};

export type IntegracaoStudio = {
  id: string;
  nome: string;
  fornecedor: string;
  categoria: CategoriaIntegracao;
  descricao: string;
  execucao: TipoExecucaoIntegracao;
  status: StatusIntegracao;
  ativa: boolean;
  instalada: boolean;
  requerInternet: boolean;
  requerCredencial: boolean;
  credencialConfigurada: boolean;
  credencialMascara: string;
  endpoint: string;
  versao: string;
  modelo: string;
  capacidades: CapacidadeIntegracao[];
  configuracoes: Record<string, string | number | boolean>;
  campos: CampoConfiguracaoIntegracao[];
  ultimaVerificacaoEm: string | null;
  latenciaMs: number | null;
  mensagemStatus: string;
  atualizadoEm: string;
  historico: EventoIntegracao[];
};

export type PadroesIntegracoes = Partial<Record<CapacidadeIntegracao, string>>;

export type WorkspaceIntegracoes = {
  versao: 1;
  modoProcessamento: ModoProcessamento;
  integracoes: IntegracaoStudio[];
  padroes: PadroesIntegracoes;
  ultimoDiagnosticoEm: string | null;
};

export type ResultadoTesteIntegracao = {
  sucesso: boolean;
  status: StatusIntegracao;
  mensagem: string;
  latenciaMs: number | null;
};

export type AtualizacaoIntegracao = {
  endpoint?: string;
  modelo?: string;
  configuracoes?: Record<string, string | number | boolean>;
  credencial?: string;
};

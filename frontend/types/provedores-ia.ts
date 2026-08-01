export type IdProvedorIa = "openai" | "gemini" | "deepseek" | "ollama";
export type StatusProvedorIa =
  | "pronto"
  | "nao-testado"
  | "indisponivel"
  | "credencial-pendente"
  | "desativado";

export type ConfiguracaoProvedorIa = {
  id: IdProvedorIa;
  nome: string;
  descricao: string;
  endpoint: string;
  modelo: string;
  habilitado: boolean;
  prioridade: number;
  timeoutSegundos: number;
  limiteDiarioRequisicoes: number;
  maxTokensSaida: number;
  temperaturaPadrao: number;
  custoEntradaMilhao: number;
  custoSaidaMilhao: number;
  requerCredencial: boolean;
  credencialConfigurada: boolean;
  status: StatusProvedorIa;
  mensagem: string;
  ultimaVerificacaoEm: number | null;
  latenciaMs: number | null;
  requisicoesHoje: number;
  tokensEntradaHoje: number;
  tokensSaidaHoje: number;
  custoEstimadoHoje: number;
};

export type EntradaConfiguracaoProvedorIa = Pick<
  ConfiguracaoProvedorIa,
  | "id"
  | "endpoint"
  | "modelo"
  | "habilitado"
  | "prioridade"
  | "timeoutSegundos"
  | "limiteDiarioRequisicoes"
  | "maxTokensSaida"
  | "temperaturaPadrao"
  | "custoEntradaMilhao"
  | "custoSaidaMilhao"
>;

export type ResultadoTesteProvedorIa = {
  sucesso: boolean;
  provedor: IdProvedorIa;
  modelo: string;
  latenciaMs: number;
  mensagem: string;
  resposta: string;
};

export type SolicitacaoExperimentoIa = {
  requisicaoId: string;
  experimentoId: string;
  tipo: string;
  tema: string;
  publico: string;
  plataforma: string;
  idioma: string;
  promptSistema: string;
  promptUsuario: string;
  quantidadeVariacoes: number;
  temperatura: number;
  maxTokensSaida: number;
  provedorPreferido: IdProvedorIa | null;
  permitirFallback: boolean;
};

export type VariacaoIaReal = {
  id: string;
  indice: number;
  conteudo: string;
  provedor: IdProvedorIa;
  modelo: string;
  tokensEntrada: number;
  tokensSaida: number;
  custoEstimado: number;
  duracaoMs: number;
  tentativa: number;
};

export type ResultadoExecucaoIa = {
  requisicaoId: string;
  experimentoId: string;
  status: "concluido" | "cancelado";
  variacoes: VariacaoIaReal[];
  provedoresTentados: IdProvedorIa[];
  fallbackUtilizado: boolean;
  duracaoMs: number;
  mensagem: string;
};

export type RegistroExecucaoIa = {
  id: string;
  experimentoId: string;
  provedor: IdProvedorIa;
  modelo: string;
  status: "concluido" | "falha" | "cancelado";
  tokensEntrada: number;
  tokensSaida: number;
  custoEstimado: number;
  duracaoMs: number;
  mensagem: string;
  correlacaoId: string;
  criadoEm: number;
};

export type ResumoUsoIa = {
  schemaVersao: 6;
  provedoresAtivos: number;
  provedoresProntos: number;
  requisicoesHoje: number;
  tokensEntradaHoje: number;
  tokensSaidaHoje: number;
  custoEstimadoHoje: number;
  execucoesRecentes: number;
  mensagem: string;
};

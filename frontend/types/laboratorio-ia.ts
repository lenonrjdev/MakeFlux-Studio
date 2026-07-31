export type TipoFerramentaLaboratorio =
  | "roteiro"
  | "prompt-sistema"
  | "gancho"
  | "termos-visuais"
  | "metadados";

export type StatusExperimentoLaboratorio = "rascunho" | "processando" | "concluido" | "erro";

export type PontuacoesResultadoLaboratorio = {
  clareza: number;
  engajamento: number;
  representabilidade: number;
  aderencia: number;
};

export type ResultadoExperimentoLaboratorio = {
  id: string;
  titulo: string;
  conteudo: string;
  resumo: string;
  duracaoEstimada: string;
  palavras: number;
  pontuacoes: PontuacoesResultadoLaboratorio;
  criadoEm: string;
};

export type ExperimentoLaboratorio = {
  id: string;
  nome: string;
  tipo: TipoFerramentaLaboratorio;
  tema: string;
  publico: string;
  plataforma: string;
  idioma: string;
  modelo: string;
  promptSistema: string;
  promptUsuario: string;
  quantidadeVariacoes: number;
  temperatura: number;
  status: StatusExperimentoLaboratorio;
  resultados: ResultadoExperimentoLaboratorio[];
  melhorResultadoId?: string;
  observacoes: string;
  criadoEm: string;
  atualizadoEm: string;
};

export type PresetPromptLaboratorio = {
  id: string;
  nome: string;
  descricao: string;
  tipo: TipoFerramentaLaboratorio;
  promptSistema: string;
  promptUsuario: string;
  favorito: boolean;
};

export type WorkspaceLaboratorioIa = {
  versao: 1;
  experimentos: ExperimentoLaboratorio[];
  presets: PresetPromptLaboratorio[];
};

export type ConfiguracaoNovoExperimento = Pick<
  ExperimentoLaboratorio,
  | "nome"
  | "tipo"
  | "tema"
  | "publico"
  | "plataforma"
  | "idioma"
  | "modelo"
  | "promptSistema"
  | "promptUsuario"
  | "quantidadeVariacoes"
  | "temperatura"
  | "observacoes"
>;

export type TransferenciaLaboratorioEstudio = {
  versao: 1;
  experimentoId: string;
  tipo: TipoFerramentaLaboratorio;
  tema: string;
  modelo: string;
  promptSistema: string;
  promptUsuario: string;
  conteudo: string;
  criadoEm: string;
};

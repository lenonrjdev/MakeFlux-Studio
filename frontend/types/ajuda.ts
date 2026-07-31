export type SecaoAjuda =
  | "visao-geral"
  | "primeiros-passos"
  | "guias"
  | "diagnostico"
  | "solucao-problemas"
  | "suporte"
  | "novidades";

export type CategoriaGuia =
  | "primeiros-passos"
  | "criacao"
  | "producao"
  | "recursos"
  | "distribuicao"
  | "sistema";

export type NivelGuia = "iniciante" | "intermediario" | "avancado";
export type StatusDiagnostico = "aguardando" | "verificando" | "aprovado" | "atencao" | "erro";
export type CategoriaDiagnostico = "aplicativo" | "armazenamento" | "integracoes" | "seguranca" | "workspace";

export type EtapaOnboarding = {
  id: string;
  titulo: string;
  descricao: string;
  rota: string;
  acao: string;
  ordem: number;
};

export type GuiaAjuda = {
  id: string;
  titulo: string;
  resumo: string;
  categoria: CategoriaGuia;
  nivel: NivelGuia;
  tempoMinutos: number;
  tags: string[];
  rotaRelacionada?: string;
  destaque?: boolean;
  passos: Array<{ titulo: string; descricao: string }>;
};

export type PerguntaFrequente = {
  id: string;
  pergunta: string;
  resposta: string;
  categoria: CategoriaGuia;
};

export type ProblemaConhecido = {
  id: string;
  titulo: string;
  sintoma: string;
  causaProvavel: string;
  categoria: "motor" | "ia" | "midia" | "voz" | "legendas" | "renderizacao" | "armazenamento";
  gravidade: "baixa" | "media" | "alta";
  rotaRelacionada?: string;
  passos: string[];
};

export type ItemDiagnostico = {
  id: string;
  titulo: string;
  descricao: string;
  categoria: CategoriaDiagnostico;
  status: StatusDiagnostico;
  detalhes: string;
  rotaCorrecao?: string;
};

export type ResultadoDiagnostico = {
  executadoEm: string;
  statusGeral: "aprovado" | "atencao" | "erro";
  itens: ItemDiagnostico[];
  resumo: {
    aprovados: number;
    atencoes: number;
    erros: number;
  };
};

export type VersaoNovidade = {
  versao: string;
  titulo: string;
  data: string;
  atual: boolean;
  itens: string[];
};

export type WorkspaceAjuda = {
  versao: 1;
  onboardingConcluido: boolean;
  etapasConcluidas: string[];
  guiasVisualizados: string[];
  guiasFavoritos: string[];
  problemasResolvidos: string[];
  novidadesLidas: string[];
  ultimoDiagnostico: ResultadoDiagnostico | null;
  atualizadoEm: string;
};

export type PacoteSuporteMakeFlux = {
  produto: "MakeFlux Studio";
  formato: "makeflux-support";
  versao: 1;
  criadoEm: string;
  aplicativo: {
    versao: string;
    ambiente: string;
    idioma: string;
    userAgent: string;
    tauriDetectado: boolean;
  };
  diagnostico: ResultadoDiagnostico;
  armazenamento: Array<{ chave: string; bytes: number }>;
  configuracoes: Record<string, unknown>;
  integracoes: Array<Record<string, unknown>>;
  logs: string[];
};

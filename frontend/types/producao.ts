export type StatusTarefaProducao =
  | "na-fila"
  | "processando"
  | "pausada"
  | "concluida"
  | "erro"
  | "cancelada";

export type FiltroTarefasProducao =
  | "todas"
  | "em-andamento"
  | "na-fila"
  | "concluidas"
  | "erros"
  | "canceladas";

export type PrioridadeTarefaProducao = "baixa" | "normal" | "alta";

export type IdEtapaProducao =
  | "roteiro"
  | "termos-visuais"
  | "materiais"
  | "narracao"
  | "legendas"
  | "composicao"
  | "renderizacao"
  | "finalizacao";

export type StatusEtapaProducao = "pendente" | "processando" | "concluida" | "erro";

export type EtapaTarefaProducao = {
  id: IdEtapaProducao;
  titulo: string;
  status: StatusEtapaProducao;
  progresso: number;
  iniciadoEm?: string;
  concluidoEm?: string;
};

export type LogTarefaProducao = {
  id: string;
  nivel: "info" | "sucesso" | "aviso" | "erro";
  mensagem: string;
  criadoEm: string;
};

export type ArquivoTarefaProducao = {
  id: string;
  nome: string;
  tipo: "video" | "audio" | "legenda" | "log";
  tamanho: string;
  caminho: string;
};

export type ErroTarefaProducao = {
  titulo: string;
  descricao: string;
  causaProvavel: string;
  acaoSugerida: string;
  codigoTecnico?: string;
};

export type ModoExecucaoProducao = "simulada" | "moneyprinter";

export type TarefaProducao = {
  id: string;
  projetoId: string;
  nome: string;
  descricao: string;
  status: StatusTarefaProducao;
  prioridade: PrioridadeTarefaProducao;
  etapaAtual: IdEtapaProducao;
  progresso: number;
  etapas: EtapaTarefaProducao[];
  formato: string;
  qualidade: string;
  proporcao: string;
  quantidadeVersoes: number;
  codificador: string;
  duracaoEstimada: string;
  tempoEstimadoSegundos: number;
  tempoDecorridoSegundos: number;
  criadaEm: string;
  atualizadaEm: string;
  iniciadaEm?: string;
  concluidaEm?: string;
  pastaSaida: string;
  modoExecucao: ModoExecucaoProducao;
  motorTarefaId?: string;
  motorEndpoint?: string;
  ultimaSincronizacaoEm?: string;
  logs: LogTarefaProducao[];
  arquivos: ArquivoTarefaProducao[];
  erro?: ErroTarefaProducao;
};

export type WorkspaceProducao = {
  versao: 1;
  filaPausada: boolean;
  tarefas: TarefaProducao[];
};

export type RecursosSistemaProducao = {
  cpu: number;
  ram: number;
  ramTotal: number;
  gpu: number;
  vram: number;
  vramTotal: number;
  disco: number;
  codificador: string;
  motor: "Pronto" | "Ocupado" | "Pausado";
};

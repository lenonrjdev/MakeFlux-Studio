import type {
  FiltroTarefasProducao,
  IdEtapaProducao,
  PrioridadeTarefaProducao,
  StatusTarefaProducao,
} from "@/types/producao";

export const etapasProducao: Array<{ id: IdEtapaProducao; titulo: string }> = [
  { id: "roteiro", titulo: "Preparar roteiro" },
  { id: "termos-visuais", titulo: "Gerar termos visuais" },
  { id: "materiais", titulo: "Organizar materiais" },
  { id: "narracao", titulo: "Gerar narração" },
  { id: "legendas", titulo: "Sincronizar legendas" },
  { id: "composicao", titulo: "Compor cenas" },
  { id: "renderizacao", titulo: "Renderizar vídeo" },
  { id: "finalizacao", titulo: "Finalizar arquivos" },
];

export const filtrosProducao: Array<{ id: FiltroTarefasProducao; titulo: string }> = [
  { id: "todas", titulo: "Todas" },
  { id: "em-andamento", titulo: "Em andamento" },
  { id: "na-fila", titulo: "Na fila" },
  { id: "concluidas", titulo: "Concluídas" },
  { id: "erros", titulo: "Com erro" },
  { id: "canceladas", titulo: "Canceladas" },
];

export const rotulosStatusTarefa: Record<StatusTarefaProducao, string> = {
  "na-fila": "Na fila",
  processando: "Processando",
  pausada: "Pausada",
  concluida: "Concluída",
  erro: "Com erro",
  cancelada: "Cancelada",
};

export const tonsStatusTarefa: Record<
  StatusTarefaProducao,
  "verde" | "neutro" | "laranja" | "vermelho" | "azul"
> = {
  "na-fila": "neutro",
  processando: "azul",
  pausada: "laranja",
  concluida: "verde",
  erro: "vermelho",
  cancelada: "neutro",
};

export const rotulosPrioridade: Record<PrioridadeTarefaProducao, string> = {
  baixa: "Baixa",
  normal: "Normal",
  alta: "Alta",
};

export const pesosPrioridade: Record<PrioridadeTarefaProducao, number> = {
  baixa: 1,
  normal: 2,
  alta: 3,
};

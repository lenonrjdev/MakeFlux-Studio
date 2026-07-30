import type { ConfiguracaoCriacaoVideo, IdEtapaCriacao } from "@/types/criar-video";

export type StatusProjeto = "Rascunho" | "Em produção" | "Pronto para renderizar" | "Concluído";

export type ProjetoRecente = {
  id: string;
  titulo: string;
  descricao: string;
  iniciais: string;
  status: StatusProjeto;
  formato: string;
  duracao: string;
  atualizadoEm: string;
  progresso: number;
  destaque?: string;
};

export type StatusProjetoStudio = "rascunho" | "em-edicao" | "pronto" | "concluido" | "arquivado";
export type TipoEventoProjeto =
  | "criado"
  | "autosave"
  | "versao"
  | "restaurado"
  | "duplicado"
  | "movido"
  | "status"
  | "exportado";

export type PastaProjetoStudio = {
  id: string;
  nome: string;
  criadaEm: string;
  fixa?: boolean;
};

export type EventoProjetoStudio = {
  id: string;
  tipo: TipoEventoProjeto;
  descricao: string;
  criadoEm: string;
};

export type VersaoProjetoStudio = {
  id: string;
  numero: number;
  nome: string;
  criadaEm: string;
  etapa: IdEtapaCriacao;
  configuracao: ConfiguracaoCriacaoVideo;
};

export type ProjetoStudio = {
  id: string;
  nome: string;
  descricao: string;
  status: StatusProjetoStudio;
  favorito: boolean;
  pastaId: string | null;
  etapaAtual: IdEtapaCriacao;
  progresso: number;
  criadoEm: string;
  atualizadoEm: string;
  ultimaAberturaEm: string;
  configuracao: ConfiguracaoCriacaoVideo;
  versoes: VersaoProjetoStudio[];
  historico: EventoProjetoStudio[];
};

export type WorkspaceProjetos = {
  versao: 1;
  projetos: ProjetoStudio[];
  pastas: PastaProjetoStudio[];
};

export type FiltroStatusProjetos =
  | "todos"
  | "ativos"
  | "rascunhos"
  | "prontos"
  | "concluidos"
  | "arquivados";

export type OrdenacaoProjetos = "recentes" | "antigos" | "nome-az" | "progresso";
export type VisualizacaoProjetos = "grade" | "lista";

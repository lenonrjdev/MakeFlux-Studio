import type { ConfiguracaoCriacaoVideo } from "@/types/criar-video";

export type CategoriaTemplate =
  | "curiosidades"
  | "lista"
  | "historia"
  | "noticia"
  | "educativo"
  | "promocional"
  | "documentario"
  | "dark-lofi"
  | "personalizado";

export type StatusTemplate = "ativo" | "rascunho" | "arquivado";
export type OrigemTemplate = "sistema" | "projeto" | "manual" | "importado";
export type VisualizacaoTemplates = "grade" | "lista";
export type OrdenacaoTemplates = "recentes" | "nome-az" | "mais-usados" | "favoritos";
export type FiltroTemplates = "todos" | "favoritos" | "sistema" | "meus" | "arquivados" | CategoriaTemplate;

export type TemplateStudio = {
  id: string;
  nome: string;
  descricao: string;
  categoria: CategoriaTemplate;
  status: StatusTemplate;
  origem: OrigemTemplate;
  sistema: boolean;
  favorito: boolean;
  tags: string[];
  corDestaque: string;
  configuracao: ConfiguracaoCriacaoVideo;
  usos: number;
  projetoOrigemId?: string;
  criadoEm: string;
  atualizadoEm: string;
};

export type WorkspaceTemplates = {
  versao: 1;
  templates: TemplateStudio[];
};

export type TransferenciaTemplateEstudio = {
  versao: 1;
  templateId: string;
  nome: string;
  configuracao: ConfiguracaoCriacaoVideo;
  criadoEm: string;
};

export type ImportacaoTemplate = {
  versao: 1;
  template: Omit<TemplateStudio, "id" | "sistema" | "origem" | "usos" | "criadoEm" | "atualizadoEm">;
};

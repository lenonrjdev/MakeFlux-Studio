export type TipoRecursoBiblioteca =
  | "video"
  | "imagem"
  | "musica"
  | "narracao"
  | "legenda"
  | "fonte"
  | "prompt"
  | "exportacao";

export type OrigemRecursoBiblioteca = "local" | "producao" | "laboratorio" | "sistema";
export type StatusRecursoBiblioteca = "disponivel" | "processando" | "ausente";
export type VisualizacaoBiblioteca = "grade" | "lista";
export type OrdenacaoBiblioteca = "recentes" | "antigos" | "nome-az" | "maiores" | "mais-usados";

export type RecursoBiblioteca = {
  id: string;
  referenciaExterna?: string;
  nome: string;
  tipo: TipoRecursoBiblioteca;
  descricao: string;
  conteudo?: string;
  extensao: string;
  mimeType: string;
  tamanhoBytes: number;
  tamanhoRotulo: string;
  duracao?: string;
  dimensoes?: string;
  caminho: string;
  origem: OrigemRecursoBiblioteca;
  status: StatusRecursoBiblioteca;
  colecaoId?: string;
  tags: string[];
  favorito: boolean;
  usos: number;
  projetoIds: string[];
  criadoEm: string;
  atualizadoEm: string;
};

export type ColecaoBiblioteca = {
  id: string;
  nome: string;
  descricao: string;
  sistema: boolean;
  criadoEm: string;
};

export type WorkspaceBiblioteca = {
  versao: 1;
  pastaRaiz: string;
  recursos: RecursoBiblioteca[];
  colecoes: ColecaoBiblioteca[];
};

export type FiltroTipoBiblioteca = "todos" | TipoRecursoBiblioteca;
export type SelecaoColecaoBiblioteca = "todos" | "favoritos" | "recentes" | "sem-colecao" | string;

export type ArquivoImportacaoBiblioteca = {
  nome: string;
  tamanho: number;
  tipoMime: string;
  atualizadoEm?: number;
  caminho?: string;
};

export type TransferenciaBibliotecaEstudio = {
  versao: 1;
  recursoId: string;
  tipo: TipoRecursoBiblioteca;
  nome: string;
  caminho: string;
  descricao: string;
  conteudo?: string;
  criadoEm: string;
};

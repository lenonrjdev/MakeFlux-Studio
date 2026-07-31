import type { StatusDesempenhoBanco } from "@/types/desempenho";

export const statusDesempenhoDemonstrativo: StatusDesempenhoBanco = {
  disponivel: false,
  schemaVersao: 2,
  registrosWorkspace: 12_480,
  registrosTelemetria: 318,
  tamanhoBancoBytes: 84_934_656,
  tamanhoWalBytes: 2_097_152,
  paginas: 20_736,
  paginasLivres: 420,
  tamanhoPagina: 4096,
  fragmentacaoPercentual: 2.03,
  consultasLentas: 1,
  operacoesAtivas: 0,
  ultimaManutencaoEm: null,
  mensagem: "Prévia demonstrativa de um workspace de grande volume.",
};

export const recomendacoesDesempenho = [
  {
    id: "paginacao",
    titulo: "Use paginação nativa",
    descricao: "Listagens consultam somente o lote visível e evitam carregar o workspace inteiro na memória.",
  },
  {
    id: "checkpoint",
    titulo: "Faça checkpoint do WAL",
    descricao: "Depois de lotes extensos, consolide o arquivo de escrita para reduzir espaço temporário.",
  },
  {
    id: "compactacao",
    titulo: "Compacte com critério",
    descricao: "VACUUM é indicado quando a fragmentação permanece alta e não há produção em andamento.",
  },
] as const;

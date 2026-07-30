import type { FiltroStatusProjetos, OrdenacaoProjetos, PastaProjetoStudio, StatusProjetoStudio } from "@/types/projeto";

export const pastasProjetosIniciais: PastaProjetoStudio[] = [
  { id: "conteudo-recorrente", nome: "Conteúdo recorrente", criadaEm: "2026-07-30T09:00:00.000Z", fixa: true },
  { id: "experimentos", nome: "Experimentos", criadaEm: "2026-07-30T09:00:00.000Z", fixa: true },
  { id: "marcas-e-clientes", nome: "Marcas e clientes", criadaEm: "2026-07-30T09:00:00.000Z", fixa: true },
];

export const filtrosStatusProjetos: Array<{ id: FiltroStatusProjetos; titulo: string }> = [
  { id: "todos", titulo: "Todos" },
  { id: "ativos", titulo: "Ativos" },
  { id: "rascunhos", titulo: "Rascunhos" },
  { id: "prontos", titulo: "Prontos" },
  { id: "concluidos", titulo: "Concluídos" },
  { id: "arquivados", titulo: "Arquivados" },
];

export const opcoesOrdenacaoProjetos: Array<{ id: OrdenacaoProjetos; titulo: string }> = [
  { id: "recentes", titulo: "Atualizados recentemente" },
  { id: "antigos", titulo: "Mais antigos" },
  { id: "nome-az", titulo: "Nome de A a Z" },
  { id: "progresso", titulo: "Maior progresso" },
];

export const rotulosStatusProjeto: Record<StatusProjetoStudio, string> = {
  rascunho: "Rascunho",
  "em-edicao": "Em edição",
  pronto: "Pronto para renderizar",
  concluido: "Concluído",
  arquivado: "Arquivado",
};

export const tonsStatusProjeto: Record<StatusProjetoStudio, "verde" | "neutro" | "laranja"> = {
  rascunho: "laranja",
  "em-edicao": "verde",
  pronto: "verde",
  concluido: "neutro",
  arquivado: "neutro",
};

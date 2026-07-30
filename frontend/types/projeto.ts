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

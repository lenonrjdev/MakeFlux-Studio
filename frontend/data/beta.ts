import type { CheckBeta, PainelBetaOperacional, PortaoBeta } from "@/types/beta";

export const portoesBetaDemonstracao: PortaoBeta[] = [
  { id: "banco", titulo: "Banco local", detalhe: "SQLite aguardando o aplicativo desktop.", status: "atencao", obrigatorio: true, automatico: true },
  { id: "workspace", titulo: "Workspace", detalhe: "Permissões de gravação não verificadas.", status: "atencao", obrigatorio: true, automatico: true },
  { id: "cofre", titulo: "Cofre", detalhe: "Estado do cofre não verificado.", status: "atencao", obrigatorio: true, automatico: true },
  { id: "producao", titulo: "Produção real", detalhe: "Nenhuma exportação foi inspecionada.", status: "atencao", obrigatorio: true, automatico: true },
];

export const checklistBetaDemonstracao: CheckBeta[] = [];

export const painelBetaDemonstracao: PainelBetaOperacional = {
  sessao: null,
  portoes: portoesBetaDemonstracao,
  checklist: checklistBetaDemonstracao,
  score: 0,
  apto: false,
  bloqueios: 0,
  avisos: portoesBetaDemonstracao.length,
  atualizadoEm: 0,
  mensagem: "Abra o aplicativo desktop para iniciar uma sessão beta.",
};

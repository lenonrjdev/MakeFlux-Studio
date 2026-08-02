import { CheckCircle2, CircleAlert, Download, History, RefreshCw, RotateCcw, ShieldCheck } from "lucide-react";

import type { StatusFluxoAtualizacao } from "@/types/atualizador";

export const rotulosStatusAtualizador: Record<StatusFluxoAtualizacao, string> = {
  ocioso: "Aguardando",
  verificando: "Verificando",
  disponivel: "Disponível",
  baixando: "Baixando",
  pronto: "Pronto para instalar",
  preparando: "Criando checkpoint",
  instalando: "Instalando",
  concluido: "Concluído",
  erro: "Atenção",
};

export const iconesResumoAtualizador = {
  versao: CheckCircle2,
  assinatura: ShieldCheck,
  verificacao: RefreshCw,
  historico: History,
  download: Download,
  rollback: RotateCcw,
  aviso: CircleAlert,
} as const;

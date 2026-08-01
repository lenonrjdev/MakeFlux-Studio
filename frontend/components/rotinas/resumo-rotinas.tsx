import { Bell, CheckCircle2, Clock3, Cpu } from "lucide-react";

import type { StatusAgendadorRotinas } from "@/types/rotinas";

function formatarData(valor: number | null) {
  if (!valor) return "Sem agendamento";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(valor));
}

export function ResumoRotinas({ status }: { status: StatusAgendadorRotinas | null }) {
  const itens = [
    { titulo: "Agendador", valor: status?.workerAtivo ? "Ativo" : "Prévia", detalhe: status?.mensagem ?? "Carregando estado...", icone: Cpu },
    { titulo: "Rotinas ativas", valor: String(status?.rotinasAtivas ?? 0), detalhe: `${status?.rotinasPendentes ?? 0} pendente(s)`, icone: CheckCircle2 },
    { titulo: "Próxima execução", valor: formatarData(status?.proximaExecucaoEm ?? null), detalhe: "Recuperação automática ao reabrir", icone: Clock3 },
    { titulo: "Não lidas", valor: String(status?.notificacoesNaoLidas ?? 0), detalhe: "Central persistente", icone: Bell },
  ];
  return <section className="grid grid-cols-4 gap-3">{itens.map((item) => <article key={item.titulo} className="rounded-md border border-[#e2e7e6] bg-white p-3.5"><div className="flex items-center gap-2 text-[8px] font-medium uppercase tracking-[0.08em] text-[#8a9392]"><item.icone className="size-3.5 text-[#268a76]" />{item.titulo}</div><strong className="mt-2 block text-[13px] font-semibold text-[#303737]">{item.valor}</strong><span className="mt-1 block truncate text-[7.5px] text-[#929a99]">{item.detalhe}</span></article>)}</section>;
}

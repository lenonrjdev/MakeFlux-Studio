import { CheckCircle2, CircleX, History } from "lucide-react";

import type { ExecucaoRotina } from "@/types/rotinas";

function formatar(valor: number) { return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "medium" }).format(new Date(valor)); }

export function HistoricoRotinas({ execucoes }: { execucoes: ExecucaoRotina[] }) {
  return <section className="rounded-md border border-[#e1e7e6] bg-white p-4"><div className="flex items-center gap-2 text-[10px] font-semibold text-[#303737]"><History className="size-3.5 text-[#268a76]" /> Histórico de execuções</div><div className="mt-3 space-y-2">{execucoes.length === 0 && <div className="rounded-md border border-dashed border-[#dfe5e4] px-3 py-7 text-center text-[8.5px] text-[#929a99]">Nenhuma execução registrada.</div>}{execucoes.slice(0, 12).map((item) => <article key={item.id} className="flex items-start gap-2 rounded-md border border-[#e8eceb] px-3 py-2.5">{item.status === "concluida" ? <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-[#24846f]" /> : <CircleX className="mt-0.5 size-3.5 shrink-0 text-[#b45151]" />}<div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><strong className="truncate text-[8.5px] font-medium text-[#3c4443]">{item.rotinaNome}</strong><span className="shrink-0 text-[7px] text-[#9aa1a0]">{formatar(item.iniciadaEm)}</span></div><p className="mt-1 text-[7.5px] leading-4 text-[#818a89]">{item.mensagem}</p><span className="mt-1 block text-[7px] text-[#a0a6a5]">{item.duracaoMs.toLocaleString("pt-BR")} ms</span></div></article>)}</div></section>;
}

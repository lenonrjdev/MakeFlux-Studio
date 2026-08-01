import { Bell, CheckCheck, Trash2 } from "lucide-react";

import { Botao } from "@/components/ui/botao";
import type { NotificacaoLocal } from "@/types/rotinas";

function formatar(valor: number) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(valor));
}

export function PainelNotificacoes({ notificacoes, aoLer, aoLerTodas, aoLimparLidas }: { notificacoes: NotificacaoLocal[]; aoLer: (id: string) => Promise<void>; aoLerTodas: () => Promise<void>; aoLimparLidas: () => Promise<void> }) {
  return (
    <section className="rounded-md border border-[#e1e7e6] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold text-[#303737]"><Bell className="size-3.5 text-[#268a76]" /> Central de notificações</div>
          <p className="mt-1 text-[8px] text-[#929a99]">Alertas persistentes continuam disponíveis mesmo quando o aviso do sistema não puder ser exibido.</p>
        </div>
        <div className="flex gap-2"><Botao className="h-7 px-2 text-[8px]" onClick={() => void aoLerTodas()}><CheckCheck className="size-3" /> Marcar lidas</Botao><Botao className="h-7 px-2 text-[8px]" onClick={() => void aoLimparLidas()}><Trash2 className="size-3" /> Limpar lidas</Botao></div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {notificacoes.length === 0 && <div className="col-span-2 rounded-md border border-dashed border-[#dfe5e4] px-3 py-7 text-center text-[8.5px] text-[#929a99]">Nenhuma notificação registrada.</div>}
        {notificacoes.slice(0, 10).map((item) => <button key={item.id} type="button" onClick={() => void aoLer(item.id)} className={`rounded-md border px-3 py-2.5 text-left ${item.lida ? "border-[#e8eceb] bg-white" : "border-[#d7e9e4] bg-[#f1f8f6]"}`}><div className="flex items-start justify-between gap-2"><strong className="text-[8.5px] font-medium text-[#38403f]">{item.titulo}</strong><span className="shrink-0 text-[6.5px] text-[#9ca3a2]">{formatar(item.criadaEm)}</span></div><p className="mt-1.5 line-clamp-2 text-[7.5px] leading-3.5 text-[#7d8685]">{item.corpo}</p><span className="mt-1.5 block text-[6.5px] uppercase tracking-[0.08em] text-[#8d9695]">{item.nivel} · {item.lida ? "lida" : "nova"}</span></button>)}
      </div>
    </section>
  );
}

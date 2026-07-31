import { CalendarDays, Plus, Send } from "lucide-react";

import { Botao } from "@/components/ui/botao";
import { conteudoPublicacao } from "@/content/publicacao";

export function CabecalhoPublicacao({ total, agendadas, aoCriar }: { total: number; agendadas: number; aoCriar: () => void }) {
  return (
    <header className="border-b border-[#e3e8e7] bg-white px-8 py-5">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.1em] text-[#1d8b74]">
            <Send className="size-3" /> Distribuição
          </div>
          <h1 className="mt-2 text-[22px] font-semibold tracking-[-0.035em] text-[#252a2b]">{conteudoPublicacao.titulo}</h1>
          <p className="mt-1.5 max-w-[650px] text-[10px] leading-5 text-[#788181]">{conteudoPublicacao.descricao}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-9 items-center gap-2 rounded-md border border-[#e0e5e4] bg-[#fafbfb] px-3 text-[9px] text-[#687171]">
            <CalendarDays className="size-3.5 text-[#1e8c75]" />
            {agendadas} agendadas · {total} no total
          </div>
          <Botao variante="primario" onClick={aoCriar}>
            <Plus className="size-3.5" /> {conteudoPublicacao.novo}
          </Botao>
        </div>
      </div>
    </header>
  );
}

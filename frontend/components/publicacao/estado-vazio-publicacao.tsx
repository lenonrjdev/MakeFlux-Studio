import { CalendarDays, RotateCcw } from "lucide-react";

import { Botao } from "@/components/ui/botao";
import { conteudoPublicacao } from "@/content/publicacao";

export function EstadoVazioPublicacao({ aoLimpar, aoCriar }: { aoLimpar: () => void; aoCriar: () => void }) {
  return (
    <section className="flex min-h-[360px] flex-col items-center justify-center rounded-md border border-dashed border-[#dbe2e0] bg-white px-8 text-center">
      <span className="grid size-11 place-items-center rounded-full bg-[#edf7f4] text-[#1c806b]"><CalendarDays className="size-5" /></span>
      <h3 className="mt-4 text-[12px] font-semibold text-[#353b3b]">{conteudoPublicacao.vazioTitulo}</h3>
      <p className="mt-1.5 max-w-[390px] text-[8.5px] leading-4 text-[#858d8d]">{conteudoPublicacao.vazioDescricao}</p>
      <div className="mt-4 flex gap-2"><Botao onClick={aoLimpar}><RotateCcw className="size-3.5" /> Limpar filtros</Botao><Botao variante="primario" onClick={aoCriar}><CalendarDays className="size-3.5" /> Criar publicação</Botao></div>
    </section>
  );
}

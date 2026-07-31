import { CalendarDays, CheckCircle2, Clock3, FileText } from "lucide-react";

import type { PublicacaoStudio } from "@/types/publicacao";

export function ResumoPublicacao({ publicacoes }: { publicacoes: PublicacaoStudio[] }) {
  const itens = [
    { titulo: "Rascunhos", valor: publicacoes.filter((item) => item.status === "rascunho").length, detalhe: "Em preparação", icone: FileText },
    { titulo: "Prontas", valor: publicacoes.filter((item) => item.status === "pronta").length, detalhe: "Aguardando distribuição", icone: CheckCircle2 },
    { titulo: "Agendadas", valor: publicacoes.filter((item) => item.status === "agendada").length, detalhe: "Próximas publicações", icone: CalendarDays },
    { titulo: "Publicadas", valor: publicacoes.filter((item) => item.status === "publicada").length, detalhe: "Histórico concluído", icone: Clock3 },
  ];

  return (
    <section className="grid grid-cols-4 overflow-hidden rounded-md border border-[#e0e5e4] bg-white">
      {itens.map((item, indice) => {
        const Icone = item.icone;
        return (
          <article key={item.titulo} className={`flex items-center gap-3 px-4 py-3 ${indice > 0 ? "border-l border-[#e7ebea]" : ""}`}>
            <span className="grid size-8 place-items-center rounded-md bg-[#edf7f4] text-[#1b806b]"><Icone className="size-3.5" /></span>
            <div>
              <p className="text-[8px] text-[#7c8585]">{item.titulo}</p>
              <div className="mt-0.5 flex items-baseline gap-2"><strong className="text-[17px] tracking-[-0.04em] text-[#293030]">{item.valor}</strong><span className="text-[7px] text-[#9aa1a1]">{item.detalhe}</span></div>
            </div>
          </article>
        );
      })}
    </section>
  );
}

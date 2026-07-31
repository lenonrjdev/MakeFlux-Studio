import { ChevronLeft, ChevronRight } from "lucide-react";

import { plataformasPublicacao } from "@/data/publicacao";
import type { PublicacaoStudio } from "@/types/publicacao";

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function CalendarioPublicacoes({ publicacoes, mes, aoMudarMes, aoSelecionar }: { publicacoes: PublicacaoStudio[]; mes: Date; aoMudarMes: (data: Date) => void; aoSelecionar: (id: string) => void }) {
  const primeiroDia = new Date(mes.getFullYear(), mes.getMonth(), 1);
  const inicio = new Date(mes.getFullYear(), mes.getMonth(), 1 - primeiroDia.getDay());
  const dias = Array.from({ length: 42 }, (_, indice) => new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + indice));
  const tituloMes = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(mes);

  function publicacoesDoDia(dia: Date) {
    return publicacoes.filter((publicacao) => {
      const origem = publicacao.agendadaPara || publicacao.publicadaEm;
      if (!origem) return false;
      const data = new Date(origem);
      return data.getFullYear() === dia.getFullYear() && data.getMonth() === dia.getMonth() && data.getDate() === dia.getDate();
    });
  }

  return (
    <section className="overflow-hidden rounded-md border border-[#e0e5e4] bg-white">
      <header className="flex items-center justify-between border-b border-[#e7ebea] px-4 py-3">
        <button type="button" onClick={() => aoMudarMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1))} className="foco-acessivel grid size-7 place-items-center rounded-md text-[#717a7a] hover:bg-[#f2f4f4]" aria-label="Mês anterior"><ChevronLeft className="size-4" /></button>
        <h3 className="text-[10px] font-semibold capitalize text-[#343a3a]">{tituloMes}</h3>
        <button type="button" onClick={() => aoMudarMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1))} className="foco-acessivel grid size-7 place-items-center rounded-md text-[#717a7a] hover:bg-[#f2f4f4]" aria-label="Próximo mês"><ChevronRight className="size-4" /></button>
      </header>
      <div className="grid grid-cols-7 border-b border-[#e7ebea] bg-[#fafbfb]">{diasSemana.map((dia) => <div key={dia} className="border-r border-[#edf0ef] px-2 py-2 text-center text-[6.5px] font-semibold uppercase tracking-[0.06em] text-[#8f9696] last:border-r-0">{dia}</div>)}</div>
      <div className="grid grid-cols-7">
        {dias.map((dia) => {
          const itens = publicacoesDoDia(dia);
          const foraDoMes = dia.getMonth() !== mes.getMonth();
          return (
            <div key={dia.toISOString()} className="min-h-[98px] border-b border-r border-[#edf0ef] p-1.5 [&:nth-child(7n)]:border-r-0">
              <span className={`text-[7px] ${foraDoMes ? "text-[#c0c5c5]" : "text-[#707979]"}`}>{dia.getDate()}</span>
              <div className="mt-1 space-y-1">
                {itens.slice(0, 3).map((publicacao) => {
                  const plataforma = plataformasPublicacao.find((item) => item.id === publicacao.plataforma) ?? plataformasPublicacao[0];
                  return <button key={publicacao.id} type="button" onClick={() => aoSelecionar(publicacao.id)} className="foco-acessivel block w-full truncate rounded px-1.5 py-1 text-left text-[6px] font-medium text-white" style={{ backgroundColor: plataforma.cor }}>{new Date((publicacao.agendadaPara || publicacao.publicadaEm) as string).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} · {publicacao.nome}</button>;
                })}
                {itens.length > 3 && <span className="block text-[6px] text-[#899191]">+{itens.length - 3} itens</span>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

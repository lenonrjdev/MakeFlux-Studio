
import { Check } from "lucide-react";

import { etapasInstalacao } from "@/data/instalacao";
import type { EtapaInstalacao } from "@/types/instalacao";

export function EtapasInstalacao({ etapa, progresso, aoSelecionar }: { etapa: EtapaInstalacao; progresso: number; aoSelecionar: (etapa: EtapaInstalacao) => void }) {
  const atual = etapasInstalacao.findIndex((item) => item.id === etapa);
  return (
    <aside className="rounded-md border border-[#e0e6e5] bg-white p-4">
      <div className="flex items-center justify-between"><strong className="text-[10px] text-[#303738]">Progresso da preparação</strong><span className="text-[9px] font-semibold text-[#27806d]">{progresso}%</span></div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#edf1f0]"><div className="h-full rounded-full bg-[#24977e] transition-all" style={{ width: `${progresso}%` }} /></div>
      <nav className="mt-4 space-y-1.5">
        {etapasInstalacao.map((item, indice) => {
          const Icone = item.icone;
          const concluida = indice < atual;
          const ativa = item.id === etapa;
          return <button key={item.id} type="button" onClick={() => aoSelecionar(item.id)} className={`foco-acessivel flex w-full items-start gap-3 rounded-md border px-3 py-3 text-left transition ${ativa ? "border-[#cce4dd] bg-[#f0f8f5]" : "border-transparent hover:bg-[#f7f9f9]"}`}><span className={`grid size-7 shrink-0 place-items-center rounded-md ${ativa || concluida ? "bg-[#dff1eb] text-[#227562]" : "bg-[#f0f3f3] text-[#7b8586]"}`}>{concluida ? <Check className="size-3.5" /> : <Icone className="size-3.5" />}</span><span><strong className="block text-[9px] text-[#374041]">{item.titulo}</strong><span className="mt-0.5 block text-[7.5px] leading-4 text-[#8a9293]">{item.descricao}</span></span></button>;
        })}
      </nav>
    </aside>
  );
}

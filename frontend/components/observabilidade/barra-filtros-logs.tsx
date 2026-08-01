
import { Filter, Search } from "lucide-react";

import { niveisLog, origensLog } from "@/data/observabilidade";
import type { FiltrosLogs, NivelLog, OrigemLog } from "@/types/observabilidade";

export function BarraFiltrosLogs({ filtros, aoAlterar }: { filtros: FiltrosLogs; aoAlterar: (filtros: FiltrosLogs) => void }) {
  return (
    <div className="flex items-center gap-2 border-b border-[#e7ebea] bg-white px-3 py-2.5">
      <Filter className="size-3.5 text-[#7e8886]" />
      <select value={filtros.nivel} onChange={(evento) => aoAlterar({ ...filtros, nivel: evento.target.value as NivelLog | "todos" })} className="h-8 rounded-md border border-[#dde4e2] bg-white px-2 text-[9px] text-[#4f5857]">
        {niveisLog.map((item) => <option key={item.id} value={item.id}>{item.titulo}</option>)}
      </select>
      <select value={filtros.origem} onChange={(evento) => aoAlterar({ ...filtros, origem: evento.target.value as OrigemLog | "todas" })} className="h-8 rounded-md border border-[#dde4e2] bg-white px-2 text-[9px] text-[#4f5857]">
        {origensLog.map((item) => <option key={item.id} value={item.id}>{item.titulo}</option>)}
      </select>
      <label className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#929a99]" /><input value={filtros.termo} onChange={(evento) => aoAlterar({ ...filtros, termo: evento.target.value })} placeholder="Buscar evento, mensagem ou contexto" className="h-8 w-full rounded-md border border-[#dde4e2] bg-[#fafbfb] pl-8 pr-3 text-[9px] text-[#3e4645] outline-none focus:border-[#8fc8bb] focus:bg-white" /></label>
      <input value={filtros.correlacaoId} onChange={(evento) => aoAlterar({ ...filtros, correlacaoId: evento.target.value })} placeholder="ID de correlação" className="h-8 w-[190px] rounded-md border border-[#dde4e2] bg-[#fafbfb] px-3 text-[9px] text-[#3e4645] outline-none focus:border-[#8fc8bb] focus:bg-white" />
    </div>
  );
}

import { CalendarDays, LayoutGrid, Search } from "lucide-react";

import { conteudoPublicacao } from "@/content/publicacao";
import type { OrdenacaoPublicacoes, VisualizacaoPublicacoes } from "@/types/publicacao";

export function BarraFiltrosPublicacao({
  busca,
  ordenacao,
  visualizacao,
  total,
  aoBuscar,
  aoOrdenar,
  aoMudarVisualizacao,
}: {
  busca: string;
  ordenacao: OrdenacaoPublicacoes;
  visualizacao: VisualizacaoPublicacoes;
  total: number;
  aoBuscar: (valor: string) => void;
  aoOrdenar: (valor: OrdenacaoPublicacoes) => void;
  aoMudarVisualizacao: (valor: VisualizacaoPublicacoes) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-[#e0e5e4] bg-white p-2.5">
      <label className="relative min-w-0 flex-1">
        <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#99a0a0]" />
        <input value={busca} onChange={(evento) => aoBuscar(evento.target.value)} placeholder={conteudoPublicacao.buscaPlaceholder} className="h-8 w-full rounded-md border border-[#e1e6e5] bg-[#fafbfb] pl-8 pr-3 text-[8.5px] outline-none placeholder:text-[#a2a8a8] focus:border-[#a8d3c9]" />
      </label>
      <select value={ordenacao} onChange={(evento) => aoOrdenar(evento.target.value as OrdenacaoPublicacoes)} className="h-8 rounded-md border border-[#e1e6e5] bg-white px-2.5 text-[8px] text-[#586161] outline-none">
        <option value="recentes">Mais recentes</option>
        <option value="antigas">Mais antigas</option>
        <option value="titulo-az">Título A–Z</option>
        <option value="agendamento">Próximo agendamento</option>
      </select>
      <span className="px-1 text-[7.5px] text-[#8e9696]">{total} itens</span>
      <div className="flex rounded-md border border-[#e1e6e5] p-0.5">
        <button type="button" onClick={() => aoMudarVisualizacao("grade")} className={`foco-acessivel grid size-7 place-items-center rounded ${visualizacao === "grade" ? "bg-[#eaf5f2] text-[#187360]" : "text-[#7c8585] hover:bg-[#f2f4f4]"}`} aria-label="Visualização em grade"><LayoutGrid className="size-3.5" /></button>
        <button type="button" onClick={() => aoMudarVisualizacao("calendario")} className={`foco-acessivel grid size-7 place-items-center rounded ${visualizacao === "calendario" ? "bg-[#eaf5f2] text-[#187360]" : "text-[#7c8585] hover:bg-[#f2f4f4]"}`} aria-label="Visualização em calendário"><CalendarDays className="size-3.5" /></button>
      </div>
    </div>
  );
}

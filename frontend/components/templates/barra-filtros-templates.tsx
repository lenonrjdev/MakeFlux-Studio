import { Grid2X2, List, Search, SlidersHorizontal } from "lucide-react";

import { juntarClasses } from "@/lib/classes";
import type { OrdenacaoTemplates, VisualizacaoTemplates } from "@/types/templates";

export function BarraFiltrosTemplates({
  busca,
  ordenacao,
  visualizacao,
  total,
  aoBuscar,
  aoOrdenar,
  aoMudarVisualizacao,
}: {
  busca: string;
  ordenacao: OrdenacaoTemplates;
  visualizacao: VisualizacaoTemplates;
  total: number;
  aoBuscar: (valor: string) => void;
  aoOrdenar: (valor: OrdenacaoTemplates) => void;
  aoMudarVisualizacao: (valor: VisualizacaoTemplates) => void;
}) {
  return (
    <div className="painel-superficie flex items-center gap-2 rounded-md p-2">
      <label className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-md border border-[#dfe5e4] bg-white px-3 text-[#788182] focus-within:border-[#9fcfc4]">
        <Search className="size-3.5 shrink-0" />
        <input
          value={busca}
          onChange={(evento) => aoBuscar(evento.target.value)}
          placeholder="Buscar templates por nome, categoria ou tag"
          className="min-w-0 flex-1 bg-transparent text-[9px] text-[#303637] outline-none placeholder:text-[#a0a7a8]"
        />
      </label>

      <label className="flex h-9 items-center gap-2 rounded-md border border-[#dfe5e4] bg-white px-2.5 text-[#70797a]">
        <SlidersHorizontal className="size-3.5" />
        <select
          value={ordenacao}
          onChange={(evento) => aoOrdenar(evento.target.value as OrdenacaoTemplates)}
          className="bg-transparent pr-2 text-[8.5px] outline-none"
        >
          <option value="recentes">Atualizados recentemente</option>
          <option value="nome-az">Nome de A a Z</option>
          <option value="mais-usados">Mais utilizados</option>
          <option value="favoritos">Favoritos primeiro</option>
        </select>
      </label>

      <span className="shrink-0 px-1 text-[8px] tabular-nums text-[#909899]">{total} resultados</span>

      <div className="flex rounded-md border border-[#dfe5e4] bg-white p-0.5">
        {([
          ["grade", Grid2X2, "Grade"],
          ["lista", List, "Lista"],
        ] as const).map(([id, Icone, rotulo]) => (
          <button
            key={id}
            type="button"
            aria-label={`Visualização em ${rotulo.toLowerCase()}`}
            title={rotulo}
            onClick={() => aoMudarVisualizacao(id)}
            className={juntarClasses(
              "foco-acessivel grid size-7 place-items-center rounded text-[#7a8384] transition",
              visualizacao === id && "bg-[#edf6f4] text-[#287765]",
            )}
          >
            <Icone className="size-3.5" />
          </button>
        ))}
      </div>
    </div>
  );
}

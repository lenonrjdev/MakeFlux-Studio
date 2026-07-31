"use client";

import { ArrowDownUp, Grid2X2, List, Search, SlidersHorizontal } from "lucide-react";

import { filtrosStatusProjetos, opcoesOrdenacaoProjetos } from "@/data/projetos";
import { juntarClasses } from "@/lib/classes";
import type { FiltroStatusProjetos, OrdenacaoProjetos, VisualizacaoProjetos } from "@/types/projeto";

export function BarraFiltrosProjetos({
  busca,
  filtro,
  ordenacao,
  visualizacao,
  total,
  aoBuscar,
  aoFiltrar,
  aoOrdenar,
  aoMudarVisualizacao,
}: {
  busca: string;
  filtro: FiltroStatusProjetos;
  ordenacao: OrdenacaoProjetos;
  visualizacao: VisualizacaoProjetos;
  total: number;
  aoBuscar: (valor: string) => void;
  aoFiltrar: (valor: FiltroStatusProjetos) => void;
  aoOrdenar: (valor: OrdenacaoProjetos) => void;
  aoMudarVisualizacao: (valor: VisualizacaoProjetos) => void;
}) {
  return (
    <div className="painel-superficie rounded-md">
      <div className="flex items-center justify-between gap-4 border-b border-[#e7ebeb] px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <label className="relative block w-[260px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#8d9596]" />
            <input
              type="search"
              value={busca}
              onChange={(evento) => aoBuscar(evento.target.value)}
              placeholder="Buscar projetos"
              className="foco-acessivel h-8 w-full rounded-md border border-[#e0e5e5] bg-white pl-8 pr-3 text-[9.5px] placeholder:text-[#a0a6a7]"
            />
          </label>

          <div className="relative">
            <ArrowDownUp className="pointer-events-none absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-[#7e8687]" />
            <select
              value={ordenacao}
              onChange={(evento) => aoOrdenar(evento.target.value as OrdenacaoProjetos)}
              className="foco-acessivel h-8 appearance-none rounded-md border border-[#dfe4e4] bg-white pl-7 pr-7 text-[9px] text-[#5e6667]"
            >
              {opcoesOrdenacaoProjetos.map((opcao) => (
                <option key={opcao.id} value={opcao.id}>
                  {opcao.titulo}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="mr-1 text-[8.5px] text-[#8e9596]">{total} resultado{total === 1 ? "" : "s"}</span>
          <div className="flex rounded-md border border-[#dfe4e4] bg-white p-0.5">
            <button
              type="button"
              onClick={() => aoMudarVisualizacao("grade")}
              aria-label="Visualizar em grade"
              className={juntarClasses(
                "foco-acessivel grid size-7 place-items-center rounded text-[#737b7c]",
                visualizacao === "grade" ? "bg-[#edf3f1] text-[#1c7c69]" : "hover:bg-[#f4f6f6]",
              )}
            >
              <Grid2X2 className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => aoMudarVisualizacao("lista")}
              aria-label="Visualizar em lista"
              className={juntarClasses(
                "foco-acessivel grid size-7 place-items-center rounded text-[#737b7c]",
                visualizacao === "lista" ? "bg-[#edf3f1] text-[#1c7c69]" : "hover:bg-[#f4f6f6]",
              )}
            >
              <List className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5 px-4">
        <SlidersHorizontal className="size-3 text-[#8c9495]" />
        {filtrosStatusProjetos.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => aoFiltrar(item.id)}
            className={juntarClasses(
              "foco-acessivel relative py-3 text-[8.5px] font-medium uppercase tracking-[0.045em]",
              filtro === item.id ? "text-[#1a806c]" : "text-[#7d8586] hover:text-[#303637]",
            )}
          >
            {item.titulo}
            {filtro === item.id && <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[#299a84]" />}
          </button>
        ))}
      </div>
    </div>
  );
}

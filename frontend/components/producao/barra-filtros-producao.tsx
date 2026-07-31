"use client";

import { Search, SlidersHorizontal } from "lucide-react";

import { filtrosProducao } from "@/data/producao";
import type { FiltroTarefasProducao } from "@/types/producao";

export function BarraFiltrosProducao({
  filtro,
  busca,
  total,
  aoFiltrar,
  aoBuscar,
}: {
  filtro: FiltroTarefasProducao;
  busca: string;
  total: number;
  aoFiltrar: (filtro: FiltroTarefasProducao) => void;
  aoBuscar: (busca: string) => void;
}) {
  return (
    <div className="painel-superficie flex items-center justify-between gap-5 rounded-md px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-1">
        {filtrosProducao.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => aoFiltrar(item.id)}
            className={`foco-acessivel inline-flex h-8 items-center rounded-md px-2.5 text-[8.5px] font-medium transition ${
              filtro === item.id
                ? "bg-[#e8f4f1] text-[#1e7f6b]"
                : "text-[#727a7b] hover:bg-[#f2f4f4] hover:text-[#313637]"
            }`}
          >
            {item.titulo}
          </button>
        ))}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#e2e6e6] bg-[#fafbfb] px-2.5 text-[8px] text-[#858d8e]">
          <SlidersHorizontal className="size-3" /> {total} tarefas
        </span>
        <label className="relative block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#8e9697]" />
          <input
            value={busca}
            onChange={(evento) => aoBuscar(evento.target.value)}
            placeholder="Buscar tarefa ou projeto"
            className="foco-acessivel h-8 w-[230px] rounded-md border border-[#dfe4e4] bg-white pl-8 pr-3 text-[9px] text-[#4b5253] placeholder:text-[#a0a6a7]"
          />
        </label>
      </div>
    </div>
  );
}

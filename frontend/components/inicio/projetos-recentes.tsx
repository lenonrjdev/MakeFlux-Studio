"use client";

import { ListFilter, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import { conteudoInicio } from "@/content/inicio";
import { projetosRecentes } from "@/data/projetos-recentes";

import { CartaoProjeto } from "./cartao-projeto";

const filtros = ["Todos", "Ativos", "Rascunhos", "Concluídos"];

export function ProjetosRecentes() {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("Todos");

  const projetosFiltrados = useMemo(() => {
    return projetosRecentes.filter((projeto) => {
      const correspondeBusca = projeto.titulo.toLowerCase().includes(busca.toLowerCase());
      const correspondeFiltro =
        filtro === "Todos" ||
        (filtro === "Ativos" && ["Em produção", "Pronto para renderizar"].includes(projeto.status)) ||
        (filtro === "Rascunhos" && projeto.status === "Rascunho") ||
        (filtro === "Concluídos" && projeto.status === "Concluído");

      return correspondeBusca && correspondeFiltro;
    });
  }, [busca, filtro]);

  return (
    <section>
      <div className="flex items-end justify-between gap-6 border-b border-[#e2e6e6] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.04em] text-[#252a2b]">
              {conteudoInicio.tituloProjetos}
            </h2>
            <span className="rounded-full bg-[#dff1ec] px-1.5 py-0.5 text-[8px] font-semibold text-[#1c7e6a]">
              {projetosRecentes.length}
            </span>
          </div>
          <p className="mt-1 text-[9px] text-[#8b9293]">{conteudoInicio.descricaoProjetos}</p>
        </div>

        <div className="flex items-center gap-2">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#8d9596]" />
            <input
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
              placeholder="Buscar projetos"
              className="foco-acessivel h-8 w-[205px] rounded-md border border-[#e0e5e5] bg-white pl-8 pr-3 text-[10px] placeholder:text-[#a0a6a7]"
            />
          </label>
          <button className="foco-acessivel inline-flex h-8 items-center gap-1.5 rounded-md border border-[#dfe4e4] bg-white px-2.5 text-[9px] font-medium text-[#606869] hover:bg-[#f7f9f9]">
            <ListFilter className="size-3" />
            Recentes
          </button>
          <button className="foco-acessivel inline-flex h-8 items-center gap-1.5 rounded-md border border-[#dfe4e4] bg-white px-2.5 text-[9px] font-medium text-[#606869] hover:bg-[#f7f9f9]">
            <SlidersHorizontal className="size-3" />
            Filtros
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-5 border-b border-[#e6eaea]">
        {filtros.map((item) => (
          <button
            key={item}
            onClick={() => setFiltro(item)}
            className={`foco-acessivel relative pb-2.5 text-[8.5px] font-medium uppercase tracking-[0.04em] ${
              filtro === item ? "text-[#1a806c]" : "text-[#7d8586] hover:text-[#303637]"
            }`}
          >
            {item}
            {filtro === item && <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[#299a84]" />}
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3.5">
        {projetosFiltrados.map((projeto) => (
          <CartaoProjeto key={projeto.id} projeto={projeto} />
        ))}
      </div>

      {projetosFiltrados.length === 0 && (
        <div className="painel-superficie mt-3 rounded-md px-6 py-12 text-center text-[11px] text-[#7d8586]">
          Nenhum projeto encontrado para este filtro.
        </div>
      )}
    </section>
  );
}

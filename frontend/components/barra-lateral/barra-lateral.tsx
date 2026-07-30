"use client";

import { LogOut, Search } from "lucide-react";
import Link from "next/link";

import { atalhosRodape, gruposNavegacao } from "@/data/navegacao";

import { ItemNavegacaoBarra } from "./item-navegacao";
import { Marca } from "../ui/marca";

export function BarraLateral() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[218px] flex-col border-r border-[#e4e8e8] bg-white px-3.5 py-3.5">
      <div className="px-1.5 pb-4 pt-0.5">
        <Marca />
      </div>

      <label className="relative block">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#8b9394]" />
        <input
          type="search"
          placeholder="Buscar"
          className="foco-acessivel h-8 w-full rounded-md border border-transparent bg-[#f1f4f4] pl-8 pr-3 text-[11px] text-[#333839] placeholder:text-[#919899] focus:border-[#cfd8d6] focus:bg-white"
        />
      </label>

      <nav className="mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto pr-0.5">
        {gruposNavegacao.map((grupo) => (
          <section key={grupo.titulo}>
            <h2 className="mb-1.5 px-2.5 text-[9px] font-medium text-[#9ca2a3]">{grupo.titulo}</h2>
            <div className="space-y-0.5">
              {grupo.itens.map((item) => (
                <ItemNavegacaoBarra key={item.titulo} item={item} />
              ))}
            </div>
          </section>
        ))}
      </nav>

      <div className="mt-3 border-t border-[#edf0f0] pt-3">
        <div className="space-y-0.5">
          {atalhosRodape.map(({ titulo, href, icone: Icone }) => (
            <Link
              key={titulo}
              href={href}
              className="foco-acessivel flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[11px] text-[#697172] hover:bg-[#f2f4f4] hover:text-[#252a2b]"
            >
              <Icone className="size-3.5" />
              {titulo}
            </Link>
          ))}
          <button className="foco-acessivel flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[11px] text-[#697172] hover:bg-[#f2f4f4] hover:text-[#252a2b]">
            <LogOut className="size-3.5" />
            Sair do aplicativo
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2.5 rounded-md border border-[#e7eaea] p-2.5">
          <div className="grid size-7 shrink-0 place-items-center rounded-full bg-[#e7f3ef] text-[10px] font-semibold text-[#1b7966]">
            LA
          </div>
          <div className="min-w-0 flex-1">
            <strong className="block truncate text-[10.5px] font-medium">Lenon Alexandre</strong>
            <span className="block truncate text-[9px] text-[#949b9c]">Workspace local</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

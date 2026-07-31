import type { ChangeEvent } from "react";
import { CircleHelp, Search } from "lucide-react";

import { conteudoAjuda } from "@/content/ajuda";

export function CabecalhoCentralAjuda({ busca, aoBuscar }: { busca: string; aoBuscar: (valor: string) => void }) {
  return (
    <header className="border-b border-[#e2e7e6] bg-white px-8 py-5">
      <div className="flex items-start justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.06em] text-[#1f8c76]">
            <CircleHelp className="size-3.5" />
            Aprendizado e suporte
          </div>
          <h1 className="mt-2 text-[22px] font-semibold tracking-[-0.035em] text-[#202526]">{conteudoAjuda.titulo}</h1>
          <p className="mt-1.5 max-w-[700px] text-[10.5px] leading-5 text-[#747c7d]">{conteudoAjuda.descricao}</p>
        </div>
        <label className="flex h-10 w-[330px] shrink-0 items-center gap-2 rounded-md border border-[#dfe5e4] bg-[#fafbfb] px-3 text-[#8a9192] focus-within:border-[#9ccfc3] focus-within:bg-white">
          <Search className="size-3.5" />
          <input
            value={busca}
            onChange={(evento: ChangeEvent<HTMLInputElement>) => aoBuscar(evento.target.value)}
            placeholder={conteudoAjuda.buscaPlaceholder}
            className="min-w-0 flex-1 bg-transparent text-[10px] text-[#303637] outline-none placeholder:text-[#a1a7a8]"
          />
        </label>
      </div>
    </header>
  );
}

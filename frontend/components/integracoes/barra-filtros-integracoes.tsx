import { Search, SlidersHorizontal } from "lucide-react";

import { filtrosIntegracoes } from "@/data/integracoes";
import type { FiltroIntegracoes, OrdenacaoIntegracoes } from "@/types/integracoes";

export function BarraFiltrosIntegracoes({
  busca,
  filtro,
  ordenacao,
  total,
  aoBuscar,
  aoFiltrar,
  aoOrdenar,
}: {
  busca: string;
  filtro: FiltroIntegracoes;
  ordenacao: OrdenacaoIntegracoes;
  total: number;
  aoBuscar: (valor: string) => void;
  aoFiltrar: (filtro: FiltroIntegracoes) => void;
  aoOrdenar: (ordenacao: OrdenacaoIntegracoes) => void;
}) {
  return (
    <div className="painel-superficie flex items-center gap-2 rounded-md p-2.5">
      <label className="relative min-w-[210px] flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#98a0a1]" />
        <input
          value={busca}
          onChange={(evento) => aoBuscar(evento.target.value)}
          placeholder="Buscar integração, fornecedor ou capacidade"
          className="foco-acessivel h-8 w-full rounded-md border border-[#dfe5e4] bg-[#fafbfb] pl-8 pr-3 text-[8.5px] text-[#424a4b] placeholder:text-[#a0a7a7]"
        />
      </label>
      <div className="hidden items-center gap-1 xl:flex">
        {filtrosIntegracoes.slice(0, 4).map((item) => {
          const Icone = item.icone;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => aoFiltrar(item.id)}
              className={`foco-acessivel flex h-8 items-center gap-1.5 rounded-md px-2 text-[7.5px] transition ${filtro === item.id ? "bg-[#eaf5f2] text-[#287562]" : "text-[#7a8485] hover:bg-[#f2f5f5]"}`}
            >
              <Icone className="size-3" /> {item.titulo}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-1.5 rounded-md border border-[#e0e5e4] bg-[#fafbfb] px-2">
        <SlidersHorizontal className="size-3 text-[#8a9394]" />
        <select
          value={ordenacao}
          onChange={(evento) => aoOrdenar(evento.target.value as OrdenacaoIntegracoes)}
          className="foco-acessivel h-8 bg-transparent text-[8px] text-[#697273] outline-none"
        >
          <option value="categoria">Por categoria</option>
          <option value="nome">Nome A–Z</option>
          <option value="status">Por status</option>
          <option value="recentes">Atualizadas recentemente</option>
        </select>
      </div>
      <span className="min-w-14 text-right text-[7.5px] tabular-nums text-[#92999a]">{total} itens</span>
    </div>
  );
}

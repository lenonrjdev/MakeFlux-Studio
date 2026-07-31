import { RotateCcw } from "lucide-react";

import { categoriasIntegracoes } from "@/data/integracoes";
import type { CategoriaIntegracao, IntegracaoStudio } from "@/types/integracoes";

export function PainelCategoriasIntegracoes({
  integracoes,
  selecionada,
  aoSelecionar,
  aoRestaurarCatalogo,
}: {
  integracoes: IntegracaoStudio[];
  selecionada: CategoriaIntegracao | "todas";
  aoSelecionar: (categoria: CategoriaIntegracao | "todas") => void;
  aoRestaurarCatalogo: () => void;
}) {
  return (
    <aside className="painel-superficie sticky top-[78px] overflow-hidden rounded-md">
      <div className="border-b border-[#e7ebea] px-3.5 py-3">
        <strong className="text-[9px] font-semibold text-[#303637]">Categorias</strong>
        <p className="mt-1 text-[7.5px] leading-4 text-[#92999a]">Organize os provedores por função.</p>
      </div>
      <nav className="space-y-0.5 p-2" aria-label="Categorias de integrações">
        {categoriasIntegracoes.map((categoria) => {
          const Icone = categoria.icone;
          const total = categoria.id === "todas"
            ? integracoes.length
            : integracoes.filter((item) => item.categoria === categoria.id).length;
          const ativa = selecionada === categoria.id;
          return (
            <button
              key={categoria.id}
              type="button"
              onClick={() => aoSelecionar(categoria.id)}
              className={`foco-acessivel flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition ${ativa ? "bg-[#eaf5f2] text-[#257460]" : "text-[#667071] hover:bg-[#f4f6f6]"}`}
            >
              <Icone className="size-3.5 shrink-0" />
              <span className="min-w-0 flex-1">
                <strong className="block truncate text-[8.5px] font-medium">{categoria.titulo}</strong>
                <span className="mt-0.5 block truncate text-[7px] opacity-70">{categoria.descricao}</span>
              </span>
              <span className="text-[7px] tabular-nums opacity-65">{total}</span>
            </button>
          );
        })}
      </nav>
      <div className="border-t border-[#e7ebea] p-2.5">
        <button
          type="button"
          onClick={aoRestaurarCatalogo}
          className="foco-acessivel flex w-full items-center justify-center gap-1.5 rounded-md border border-[#e1e6e5] bg-white px-2 py-2 text-[8px] text-[#747d7e] hover:bg-[#f7f9f9]"
        >
          <RotateCcw className="size-3.5" /> Restaurar catálogo
        </button>
      </div>
    </aside>
  );
}

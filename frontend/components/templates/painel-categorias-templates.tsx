import { Archive, Boxes, LockKeyhole, Sparkles, Star } from "lucide-react";

import { categoriasTemplates } from "@/data/templates";
import { juntarClasses } from "@/lib/classes";
import type { FiltroTemplates, TemplateStudio } from "@/types/templates";

export function PainelCategoriasTemplates({
  templates,
  selecionado,
  aoSelecionar,
}: {
  templates: TemplateStudio[];
  selecionado: FiltroTemplates;
  aoSelecionar: (filtro: FiltroTemplates) => void;
}) {
  const principais = [
    { id: "todos" as const, titulo: "Todos os templates", icone: Boxes, total: templates.length },
    { id: "favoritos" as const, titulo: "Favoritos", icone: Star, total: templates.filter((item) => item.favorito).length },
    { id: "sistema" as const, titulo: "Templates do sistema", icone: LockKeyhole, total: templates.filter((item) => item.sistema).length },
    { id: "meus" as const, titulo: "Meus templates", icone: Sparkles, total: templates.filter((item) => !item.sistema && item.status !== "arquivado").length },
    { id: "arquivados" as const, titulo: "Arquivados", icone: Archive, total: templates.filter((item) => item.status === "arquivado").length },
  ];

  return (
    <aside className="painel-superficie sticky top-[78px] rounded-md p-2.5">
      <p className="px-2 pb-2 pt-1 text-[7.5px] font-semibold uppercase tracking-[0.08em] text-[#959d9d]">Visualizações</p>
      <div className="space-y-0.5">
        {principais.map((item) => {
          const Icone = item.icone;
          return (
            <button key={item.id} type="button" onClick={() => aoSelecionar(item.id)} className={juntarClasses("foco-acessivel flex h-9 w-full items-center gap-2.5 rounded-md px-2 text-left transition", selecionado === item.id ? "bg-[#edf7f4] text-[#287966]" : "text-[#697273] hover:bg-[#f3f5f5]")}>
              <Icone className="size-3.5" />
              <span className="min-w-0 flex-1 truncate text-[8.5px] font-medium">{item.titulo}</span>
              <span className="text-[7.5px] tabular-nums text-[#9aa1a2]">{item.total}</span>
            </button>
          );
        })}
      </div>

      <div className="my-3 border-t border-[#e9edec]" />
      <p className="px-2 pb-2 text-[7.5px] font-semibold uppercase tracking-[0.08em] text-[#959d9d]">Categorias</p>
      <div className="space-y-0.5">
        {categoriasTemplates.map((categoria) => {
          const Icone = categoria.icone;
          const total = templates.filter((item) => item.categoria === categoria.id && item.status !== "arquivado").length;
          return (
            <button key={categoria.id} type="button" onClick={() => aoSelecionar(categoria.id)} className={juntarClasses("foco-acessivel flex min-h-9 w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition", selecionado === categoria.id ? "bg-[#edf7f4] text-[#287966]" : "text-[#697273] hover:bg-[#f3f5f5]")}>
              <Icone className="size-3.5 shrink-0" />
              <span className="min-w-0 flex-1"><strong className="block truncate text-[8.5px] font-medium">{categoria.titulo}</strong><small className="mt-0.5 block truncate text-[7px] text-[#9aa1a2]">{categoria.descricao}</small></span>
              <span className="text-[7.5px] tabular-nums text-[#9aa1a2]">{total}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

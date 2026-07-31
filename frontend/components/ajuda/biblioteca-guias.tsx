import { BookOpenText, Clock3, Star } from "lucide-react";

import type { CategoriaGuia, GuiaAjuda } from "@/types/ajuda";

const categorias: Array<{ id: CategoriaGuia | "todas"; titulo: string }> = [
  { id: "todas", titulo: "Todos" },
  { id: "primeiros-passos", titulo: "Primeiros passos" },
  { id: "criacao", titulo: "Criação" },
  { id: "producao", titulo: "Produção" },
  { id: "recursos", titulo: "Recursos" },
  { id: "distribuicao", titulo: "Distribuição" },
  { id: "sistema", titulo: "Sistema" },
];

export function BibliotecaGuias({
  guias,
  categoria,
  favoritos,
  visualizados,
  aoMudarCategoria,
  aoAbrir,
  aoFavoritar,
}: {
  guias: GuiaAjuda[];
  categoria: CategoriaGuia | "todas";
  favoritos: string[];
  visualizados: string[];
  aoMudarCategoria: (categoria: CategoriaGuia | "todas") => void;
  aoAbrir: (guia: GuiaAjuda) => void;
  aoFavoritar: (id: string) => void;
}) {
  return (
    <section className="rounded-md border border-[#e2e7e6] bg-white">
      <header className="border-b border-[#edf0f0] px-5 py-4">
        <h2 className="text-[12px] font-semibold text-[#252a2b]">Biblioteca de guias</h2>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {categorias.map((item) => (
            <button key={item.id} type="button" onClick={() => aoMudarCategoria(item.id)} className={`rounded-md border px-2.5 py-1.5 text-[9px] font-medium ${categoria === item.id ? "border-[#b9dcd4] bg-[#edf7f4] text-[#247965]" : "border-[#e1e5e5] text-[#727a7b] hover:bg-[#f7f9f9]"}`}>
              {item.titulo}
            </button>
          ))}
        </div>
      </header>
      {guias.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <BookOpenText className="mx-auto size-7 text-[#b6bdbc]" />
          <p className="mt-3 text-[10px] font-medium text-[#5d6566]">Nenhum guia encontrado</p>
          <p className="mt-1 text-[9px] text-[#9aa1a2]">Ajuste a busca ou escolha outra categoria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 p-4">
          {guias.map((guia) => {
            const favorito = favoritos.includes(guia.id);
            const visualizado = visualizados.includes(guia.id);
            return (
              <article key={guia.id} className="group rounded-md border border-[#e4e8e7] bg-white p-4 transition hover:border-[#bdd8d2] hover:shadow-[0_8px_24px_rgba(31,58,52,.06)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-8 items-center justify-center rounded-md bg-[#f0f6f4] text-[#397b6d]"><BookOpenText className="size-4" /></div>
                  <button type="button" onClick={() => aoFavoritar(guia.id)} aria-label={favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"} className={`p-1 ${favorito ? "text-[#d09237]" : "text-[#c1c7c6] hover:text-[#8c9495]"}`}>
                    <Star className={`size-3.5 ${favorito ? "fill-current" : ""}`} />
                  </button>
                </div>
                <h3 className="mt-3 text-[11px] font-semibold leading-4 text-[#2c3233]">{guia.titulo}</h3>
                <p className="mt-1.5 line-clamp-2 text-[9px] leading-4 text-[#858d8e]">{guia.resumo}</p>
                <div className="mt-3 flex items-center gap-2 text-[8.5px] text-[#9aa1a2]">
                  <span className="flex items-center gap-1"><Clock3 className="size-3" /> {guia.tempoMinutos} min</span>
                  <span>·</span>
                  <span className="capitalize">{guia.nivel}</span>
                  {visualizado && <span className="ml-auto text-[#438273]">Consultado</span>}
                </div>
                <button type="button" onClick={() => aoAbrir(guia)} className="mt-3 w-full rounded-md border border-[#dfe5e4] py-2 text-[9px] font-medium text-[#566061] transition group-hover:border-[#aed2c9] group-hover:text-[#247965]">
                  Abrir guia
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

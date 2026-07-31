"use client";

import {
  Captions,
  Copy,
  FileText,
  Image,
  Mic2,
  MoreHorizontal,
  Music2,
  PackageCheck,
  Star,
  Trash2,
  Type,
  Video,
} from "lucide-react";
import { useState } from "react";

import { juntarClasses } from "@/lib/classes";
import type { ColecaoBiblioteca, RecursoBiblioteca } from "@/types/biblioteca";

const iconesTipo = {
  video: Video,
  imagem: Image,
  musica: Music2,
  narracao: Mic2,
  legenda: Captions,
  fonte: Type,
  prompt: FileText,
  exportacao: PackageCheck,
} as const;

const fundosTipo = {
  video: "from-[#dce8e6] to-[#edf2f1] text-[#43766b]",
  imagem: "from-[#e7e2dc] to-[#f5f1ec] text-[#8a684b]",
  musica: "from-[#e2e5ee] to-[#f2f3f8] text-[#677390]",
  narracao: "from-[#e4e8df] to-[#f2f5ef] text-[#687d56]",
  legenda: "from-[#e8e4ee] to-[#f5f2f8] text-[#78688e]",
  fonte: "from-[#e8e8e8] to-[#f6f6f6] text-[#656b6c]",
  prompt: "from-[#dfe9e7] to-[#f0f6f4] text-[#397868]",
  exportacao: "from-[#d8e8e3] to-[#edf7f4] text-[#297b68]",
} as const;

export function CartaoRecursoBiblioteca({
  recurso,
  colecoes,
  modoLista,
  aoSelecionar,
  aoFavoritar,
  aoDuplicar,
  aoExcluir,
  aoMover,
}: {
  recurso: RecursoBiblioteca;
  colecoes: ColecaoBiblioteca[];
  modoLista?: boolean;
  aoSelecionar: () => void;
  aoFavoritar: () => void;
  aoDuplicar: () => void;
  aoExcluir: () => void;
  aoMover: (colecaoId?: string) => void;
}) {
  const [menuAberto, setMenuAberto] = useState(false);
  const Icone = iconesTipo[recurso.tipo];
  const colecao = colecoes.find((item) => item.id === recurso.colecaoId);

  return (
    <article
      className={juntarClasses(
        "painel-superficie group relative overflow-visible rounded-md transition hover:border-[#cfd8d6] hover:shadow-[0_5px_18px_rgba(25,40,36,.06)]",
        modoLista && "grid grid-cols-[72px_minmax(0,1fr)_120px_110px_105px_54px] items-center gap-3 px-3 py-2.5",
      )}
    >
      <button
        type="button"
        onClick={aoSelecionar}
        className={juntarClasses(
          "foco-acessivel block text-left",
          modoLista ? "contents" : "w-full",
        )}
      >
        <div
          className={juntarClasses(
            "relative grid place-items-center overflow-hidden bg-gradient-to-br",
            fundosTipo[recurso.tipo],
            modoLista ? "h-12 w-[72px] rounded" : "h-[132px] rounded-t-md",
          )}
        >
          <Icone className={modoLista ? "size-5" : "size-8"} strokeWidth={1.4} />
          {!modoLista && recurso.duracao && (
            <span className="absolute bottom-2 right-2 rounded bg-[#1e2525]/75 px-1.5 py-0.5 text-[7px] font-medium text-white">
              {recurso.duracao}
            </span>
          )}
          {!modoLista && (
            <span className="absolute left-2 top-2 rounded border border-white/60 bg-white/85 px-1.5 py-0.5 text-[7px] font-medium uppercase tracking-[0.04em] text-[#5e6967]">
              {recurso.extensao}
            </span>
          )}
        </div>

        <div className={juntarClasses(modoLista ? "min-w-0" : "px-3 pb-3 pt-2.5")}>
          <strong className="block truncate text-[10px] font-semibold text-[#2e3435]">{recurso.nome}</strong>
          <span className="mt-1 block truncate text-[8px] text-[#8a9293]">
            {modoLista ? recurso.descricao : colecao?.nome ?? "Sem coleção"}
          </span>
          {!modoLista && (
            <div className="mt-2 flex items-center justify-between gap-2 text-[7.5px] text-[#919899]">
              <span>{recurso.tamanhoRotulo}</span>
              <span>{recurso.usos} usos</span>
            </div>
          )}
        </div>

        {modoLista && (
          <>
            <span className="truncate text-[8px] text-[#7f8889]">{colecao?.nome ?? "Sem coleção"}</span>
            <span className="text-[8px] text-[#7f8889]">{recurso.tamanhoRotulo}</span>
            <span className="text-[8px] text-[#7f8889]">{recurso.origem}</span>
          </>
        )}
      </button>

      <div className={juntarClasses("absolute z-20 flex items-center gap-1", modoLista ? "right-3 top-1/2 -translate-y-1/2" : "right-2 top-2")}>
        <button
          type="button"
          aria-label={recurso.favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          onClick={aoFavoritar}
          className={juntarClasses(
            "foco-acessivel grid size-7 place-items-center rounded border bg-white/95 shadow-sm",
            recurso.favorito
              ? "border-[#d8cfa9] text-[#b6902e]"
              : "border-[#dfe4e3] text-[#8a9293] opacity-0 group-hover:opacity-100",
          )}
        >
          <Star className={juntarClasses("size-3.5", recurso.favorito && "fill-current")} />
        </button>
        <button
          type="button"
          aria-label="Mais ações"
          onClick={() => setMenuAberto((atual) => !atual)}
          className="foco-acessivel grid size-7 place-items-center rounded border border-[#dfe4e3] bg-white/95 text-[#7d8687] opacity-0 shadow-sm group-hover:opacity-100"
        >
          <MoreHorizontal className="size-3.5" />
        </button>
      </div>

      {menuAberto && (
        <div className="absolute right-2 top-10 z-40 w-48 rounded-md border border-[#dfe4e3] bg-white p-1.5 shadow-[0_12px_35px_rgba(20,29,27,.14)]">
          <button
            type="button"
            onClick={() => { aoDuplicar(); setMenuAberto(false); }}
            className="foco-acessivel flex w-full items-center gap-2 rounded px-2.5 py-2 text-[8.5px] text-[#5d6667] hover:bg-[#f3f6f5]"
          >
            <Copy className="size-3.5" /> Duplicar referência
          </button>
          <div className="my-1 border-t border-[#edf0ef]" />
          <span className="block px-2.5 pb-1 pt-1 text-[7px] font-semibold uppercase tracking-[0.06em] text-[#9aa1a2]">
            Mover para
          </span>
          <button
            type="button"
            onClick={() => { aoMover(undefined); setMenuAberto(false); }}
            className="foco-acessivel block w-full rounded px-2.5 py-1.5 text-left text-[8.5px] text-[#5d6667] hover:bg-[#f3f6f5]"
          >
            Sem coleção
          </button>
          {colecoes.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => { aoMover(item.id); setMenuAberto(false); }}
              className="foco-acessivel block w-full truncate rounded px-2.5 py-1.5 text-left text-[8.5px] text-[#5d6667] hover:bg-[#f3f6f5]"
            >
              {item.nome}
            </button>
          ))}
          <div className="my-1 border-t border-[#edf0ef]" />
          <button
            type="button"
            onClick={() => { aoExcluir(); setMenuAberto(false); }}
            className="foco-acessivel flex w-full items-center gap-2 rounded px-2.5 py-2 text-[8.5px] text-[#aa5046] hover:bg-[#fff2f0]"
          >
            <Trash2 className="size-3.5" /> Excluir da biblioteca
          </button>
        </div>
      )}
    </article>
  );
}

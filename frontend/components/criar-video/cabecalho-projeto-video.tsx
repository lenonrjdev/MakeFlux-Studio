import { ChevronLeft, MoreVertical, Save } from "lucide-react";
import Link from "next/link";

import { Botao } from "@/components/ui/botao";
import { SeloStatus } from "@/components/ui/selo-status";
import { conteudoCriarVideo } from "@/content/criar-video";

export function CabecalhoProjetoVideo({
  nomeProjeto,
  modo,
  aoSalvar,
}: {
  nomeProjeto: string;
  modo: string;
  aoSalvar: () => void;
}) {
  return (
    <div className="border-b border-[#e4e8e8] bg-[#f7f8f9] px-8 pt-5">
      <Link
        href="/projetos"
        className="foco-acessivel mb-4 inline-flex items-center gap-1 rounded text-[10px] text-[#697172] hover:text-[#202526]"
      >
        <ChevronLeft className="size-3" />
        {conteudoCriarVideo.breadcrumb}
      </Link>

      <div className="flex items-start justify-between gap-8">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="truncate text-[19px] font-semibold tracking-[-0.025em] text-[#171a1b]">
              {nomeProjeto || conteudoCriarVideo.titulo}
            </h1>
            <span className="rounded border border-[#dce1e1] bg-white px-2 py-1 text-[9px] font-medium text-[#687071]">
              {conteudoCriarVideo.etiqueta}
            </span>
          </div>
          <p className="mt-2 max-w-[720px] text-[11.5px] leading-5 text-[#747c7d]">
            {conteudoCriarVideo.descricao}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <SeloStatus texto={conteudoCriarVideo.statusRascunho} tom="neutro" />
          <SeloStatus texto={`Modo ${modo}`} />
          <Botao onClick={aoSalvar} className="h-8 px-3">
            <Save className="size-3.5" />
            {conteudoCriarVideo.acaoSalvar}
          </Botao>
          <button
            type="button"
            aria-label="Mais opções do projeto"
            className="foco-acessivel grid size-8 place-items-center rounded-md border border-[#dfe4e4] bg-white text-[#6a7273] hover:bg-[#f7f9f9]"
          >
            <MoreVertical className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

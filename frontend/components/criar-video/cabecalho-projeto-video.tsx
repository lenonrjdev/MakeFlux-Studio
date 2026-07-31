import { Check, ChevronLeft, LayoutTemplate, Loader2, MoreVertical, Save } from "lucide-react";
import Link from "next/link";

import { Botao } from "@/components/ui/botao";
import { SeloStatus } from "@/components/ui/selo-status";
import { conteudoCriarVideo } from "@/content/criar-video";

type EstadoSalvamento = "carregando" | "salvando" | "salvo" | "erro";

export function CabecalhoProjetoVideo({
  nomeProjeto,
  modo,
  estadoSalvamento,
  salvoEm,
  aoSalvar,
  aoSalvarComoTemplate,
}: {
  nomeProjeto: string;
  modo: string;
  estadoSalvamento: EstadoSalvamento;
  salvoEm?: string;
  aoSalvar: () => void;
  aoSalvarComoTemplate: () => void;
}) {
  const textoAutosave =
    estadoSalvamento === "carregando"
      ? "Carregando projeto"
      : estadoSalvamento === "salvando"
        ? "Salvando alterações"
        : estadoSalvamento === "erro"
          ? "Falha ao salvar"
          : salvoEm
            ? `Salvo às ${salvoEm}`
            : "Salvamento automático ativo";

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
          <span
            className={`mt-2 inline-flex items-center gap-1.5 text-[8.5px] ${
              estadoSalvamento === "erro" ? "text-[#ae5353]" : "text-[#8a9293]"
            }`}
          >
            {estadoSalvamento === "salvando" || estadoSalvamento === "carregando" ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Check className="size-3 text-[#27917c]" />
            )}
            {textoAutosave}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <SeloStatus texto="Projeto local" tom="neutro" />
          <SeloStatus texto={`Modo ${modo}`} />
          <Botao onClick={aoSalvarComoTemplate} className="h-8 px-3" disabled={estadoSalvamento === "carregando"}>
            <LayoutTemplate className="size-3.5" />
            Salvar como template
          </Botao>
          <Botao onClick={aoSalvar} className="h-8 px-3" disabled={estadoSalvamento === "carregando"}>
            <Save className="size-3.5" />
            Salvar versão
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

"use client";

import { Check, Clock3, Heart, MoreHorizontal, Play, Sparkles } from "lucide-react";
import Link from "next/link";

import { SeloStatus } from "@/components/ui/selo-status";
import { rotulosStatusProjeto, tonsStatusProjeto } from "@/data/projetos";
import { formatarDataProjeto } from "@/lib/projetos-locais";
import type { ProjetoStudio } from "@/types/projeto";

export function CartaoProjeto({ projeto, aoFavoritar }: { projeto: ProjetoStudio; aoFavoritar: () => void }) {
  const concluido = projeto.status === "concluido";
  const iniciais = projeto.nome
    .split(/\s+/)
    .slice(0, 2)
    .map((palavra) => palavra[0])
    .join("")
    .toUpperCase();

  return (
    <article className="painel-superficie flex min-h-[206px] flex-col rounded-md p-4 transition hover:-translate-y-0.5 hover:border-[#d8dddd] hover:shadow-[0_5px_18px_rgba(27,36,34,.06)]">
      <div className="flex items-start gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-[#e7f3ef] text-[10px] font-semibold text-[#1a7865] ring-1 ring-[#d9e8e4]">
          {iniciais || "MF"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-[12px] font-semibold tracking-[-0.01em] text-[#242829]">{projeto.nome}</h3>
            <Link href="/projetos" aria-label="Abrir opções do projeto" className="foco-acessivel -mr-1 grid size-6 shrink-0 place-items-center rounded-md text-[#909798] hover:bg-[#f1f3f3]">
              <MoreHorizontal className="size-3.5" />
            </Link>
          </div>
          <p className="mt-1 line-clamp-1 text-[9.5px] text-[#858c8d]">{projeto.descricao}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 divide-x divide-[#e7ebeb] rounded-md border border-[#e5e9e9] bg-[#fafbfb] py-2.5">
        <div className="px-3">
          <span className="block text-[9.5px] font-medium text-[#333839]">{projeto.configuracao.formato} · {projeto.configuracao.qualidade.split(" · ")[0]}</span>
          <span className="mt-1 block text-[7.5px] uppercase tracking-[0.05em] text-[#9aa1a2]">Formato de saída</span>
        </div>
        <div className="px-3">
          <span className="block text-[9.5px] font-medium text-[#333839]">{projeto.configuracao.duracao}</span>
          <span className="mt-1 block text-[7.5px] uppercase tracking-[0.05em] text-[#9aa1a2]">Duração estimada</span>
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-1.5 flex items-center justify-between text-[8.5px]">
          <SeloStatus texto={rotulosStatusProjeto[projeto.status]} tom={tonsStatusProjeto[projeto.status]} />
          <span className="text-[#909798]">{projeto.progresso}%</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-[#edf0f0]">
          <div className="h-full rounded-full bg-[#2a9a84]" style={{ width: `${projeto.progresso}%` }} />
        </div>
      </div>

      <div className="mt-auto flex items-center gap-2 pt-3">
        <button
          type="button"
          onClick={aoFavoritar}
          className={`foco-acessivel inline-flex h-8 flex-1 items-center justify-center gap-2 rounded-md border px-2.5 text-[9px] font-medium transition ${
            projeto.favorito ? "border-[#efd9d4] bg-[#fff7f5] text-[#b45e50]" : "border-[#dfe4e4] bg-white text-[#606869] hover:bg-[#f7f9f9]"
          }`}
        >
          <Heart className={`size-3 ${projeto.favorito ? "fill-current" : ""}`} />
          {projeto.favorito ? "Favorito" : "Favoritar"}
        </button>
        <Link
          href={`/criar-video?projeto=${encodeURIComponent(projeto.id)}`}
          className={`foco-acessivel inline-flex h-8 flex-1 items-center justify-center gap-2 rounded-md border px-2.5 text-[9px] font-medium transition ${
            concluido ? "border-[#dfe4e4] bg-white text-[#606869] hover:bg-[#f7f9f9]" : "border-[#18806c] bg-[#1f9b83] text-white hover:bg-[#18866f]"
          }`}
        >
          {concluido ? <Play className="size-3" /> : <Sparkles className="size-3" />}
          {concluido ? "Visualizar" : "Continuar"}
        </Link>
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-[#eff1f1] pt-2 text-[8.5px] text-[#8e9596]">
        <span className="inline-flex items-center gap-1">
          {concluido ? <Check className="size-3 text-[#28947f]" /> : <Clock3 className="size-3" />}
          Etapa {projeto.etapaAtual}
        </span>
        <span>{formatarDataProjeto(projeto.atualizadoEm)}</span>
      </div>
    </article>
  );
}

"use client";

import { Archive, Clock3, Copy, Download, Heart, MoreHorizontal, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";

import { SeloStatus } from "@/components/ui/selo-status";
import { rotulosStatusProjeto, tonsStatusProjeto } from "@/data/projetos";
import { formatarDataProjeto } from "@/lib/projetos-locais";
import type { PastaProjetoStudio, ProjetoStudio } from "@/types/projeto";

export function ListaProjetosStudio({
  projetos,
  pastas,
  aoSelecionar,
  aoFavoritar,
  aoDuplicar,
  aoArquivar,
  aoExcluir,
  aoExportar,
}: {
  projetos: ProjetoStudio[];
  pastas: PastaProjetoStudio[];
  aoSelecionar: (projeto: ProjetoStudio) => void;
  aoFavoritar: (id: string) => void;
  aoDuplicar: (id: string) => void;
  aoArquivar: (id: string, arquivado: boolean) => void;
  aoExcluir: (id: string) => void;
  aoExportar: (projeto: ProjetoStudio) => void;
}) {
  return (
    <div className="painel-superficie overflow-hidden rounded-md">
      <div className="grid grid-cols-[minmax(260px,1.6fr)_150px_150px_110px_120px_56px] items-center border-b border-[#e4e8e8] bg-[#fafbfb] px-4 py-2.5 text-[7.5px] font-medium uppercase tracking-[0.06em] text-[#92999a]">
        <span>Projeto</span>
        <span>Pasta</span>
        <span>Status</span>
        <span>Progresso</span>
        <span>Atualização</span>
        <span />
      </div>

      <div className="divide-y divide-[#edf0f0]">
        {projetos.map((projeto) => {
          const pasta = pastas.find((item) => item.id === projeto.pastaId);
          const arquivado = projeto.status === "arquivado";
          return (
            <div
              key={projeto.id}
              className="grid grid-cols-[minmax(260px,1.6fr)_150px_150px_110px_120px_56px] items-center px-4 py-3 hover:bg-[#fafcfc]"
            >
              <button type="button" onClick={() => aoSelecionar(projeto)} className="foco-acessivel flex min-w-0 items-center gap-3 rounded text-left">
                <div className="grid size-9 shrink-0 place-items-center rounded-md border border-[#dce4e2] bg-[#edf3f1] text-[9px] font-semibold text-[#2b7869]">
                  {projeto.configuracao.formato}
                </div>
                <div className="min-w-0">
                  <strong className="block truncate text-[10px] font-semibold text-[#303536]">{projeto.nome}</strong>
                  <span className="mt-1 block truncate text-[8px] text-[#8c9495]">{projeto.descricao}</span>
                </div>
              </button>

              <span className="truncate pr-3 text-[8.5px] text-[#747c7d]">{pasta?.nome ?? "Sem pasta"}</span>
              <div><SeloStatus texto={rotulosStatusProjeto[projeto.status]} tom={tonsStatusProjeto[projeto.status]} /></div>
              <div className="pr-5">
                <div className="mb-1 flex items-center justify-between text-[7.5px] text-[#8d9596]"><span>{projeto.progresso}%</span></div>
                <div className="h-1 overflow-hidden rounded-full bg-[#edf0f0]"><div className="h-full rounded-full bg-[#2a9a84]" style={{ width: `${projeto.progresso}%` }} /></div>
              </div>
              <span className="flex items-center gap-1 text-[8px] text-[#8d9596]"><Clock3 className="size-3" />{formatarDataProjeto(projeto.atualizadoEm)}</span>

              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() => aoFavoritar(projeto.id)}
                  aria-label="Favoritar projeto"
                  className={`foco-acessivel grid size-7 place-items-center rounded-md ${projeto.favorito ? "text-[#b45e50]" : "text-[#9aa1a2] hover:bg-[#f1f4f4]"}`}
                >
                  <Heart className={`size-3.5 ${projeto.favorito ? "fill-current" : ""}`} />
                </button>
                <details className="relative">
                  <summary className="foco-acessivel grid size-7 cursor-pointer list-none place-items-center rounded-md text-[#899192] hover:bg-[#f1f4f4] [&::-webkit-details-marker]:hidden">
                    <MoreHorizontal className="size-3.5" />
                  </summary>
                  <div className="absolute right-0 top-8 z-40 w-[178px] rounded-md border border-[#dfe4e4] bg-white p-1.5 shadow-[0_12px_35px_rgba(20,29,27,.14)]">
                    {!arquivado && (
                      <Link href={`/criar-video?projeto=${encodeURIComponent(projeto.id)}`} className="flex items-center gap-2 rounded px-2.5 py-2 text-[9px] text-[#596162] hover:bg-[#f2f5f4]">
                        <Sparkles className="size-3.5" /> Continuar edição
                      </Link>
                    )}
                    <button type="button" onClick={() => aoDuplicar(projeto.id)} className="flex w-full items-center gap-2 rounded px-2.5 py-2 text-left text-[9px] text-[#596162] hover:bg-[#f2f5f4]">
                      <Copy className="size-3.5" /> Duplicar
                    </button>
                    <button type="button" onClick={() => aoExportar(projeto)} className="flex w-full items-center gap-2 rounded px-2.5 py-2 text-left text-[9px] text-[#596162] hover:bg-[#f2f5f4]">
                      <Download className="size-3.5" /> Exportar JSON
                    </button>
                    <button type="button" onClick={() => aoArquivar(projeto.id, arquivado)} className="flex w-full items-center gap-2 rounded px-2.5 py-2 text-left text-[9px] text-[#785f50] hover:bg-[#faf4ef]">
                      <Archive className="size-3.5" /> {arquivado ? "Restaurar" : "Arquivar"}
                    </button>
                    {arquivado && (
                      <button type="button" onClick={() => aoExcluir(projeto.id)} className="flex w-full items-center gap-2 rounded px-2.5 py-2 text-left text-[9px] text-[#a04d4d] hover:bg-[#fbefef]">
                        <Trash2 className="size-3.5" /> Excluir
                      </button>
                    )}
                  </div>
                </details>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

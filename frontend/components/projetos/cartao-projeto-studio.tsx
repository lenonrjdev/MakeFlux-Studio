"use client";

import {
  Archive,
  Clock3,
  Copy,
  Download,
  FolderInput,
  Heart,
  History,
  MoreHorizontal,
  Play,
  Sparkles,
  Trash2,
} from "lucide-react";
import Link from "next/link";

import { SeloStatus } from "@/components/ui/selo-status";
import { plataformasVideo } from "@/data/criar-video";
import { rotulosStatusProjeto, tonsStatusProjeto } from "@/data/projetos";
import { formatarDataProjeto } from "@/lib/projetos-locais";
import type { PastaProjetoStudio, ProjetoStudio } from "@/types/projeto";

function MiniaturaProjeto({ projeto }: { projeto: ProjetoStudio }) {
  const formato = projeto.configuracao.formato;
  const proporcao = formato === "9:16" ? "aspect-[16/8]" : formato === "1:1" ? "aspect-[16/8]" : "aspect-video";
  const plataforma = plataformasVideo.find((item) => item.id === projeto.configuracao.plataforma)?.titulo;

  return (
    <div className={`relative overflow-hidden rounded-t-md border-b border-[#e7ebeb] bg-[#e8edec] ${proporcao}`}>
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#eef3f2_0%,#dbe5e2_55%,#edf1f0_100%)]" />
      <div className="absolute -right-7 -top-9 size-28 rounded-full border border-white/60 bg-white/45" />
      <div className="absolute bottom-3 left-3 right-3 rounded-md border border-white/70 bg-white/82 px-3 py-2 shadow-sm backdrop-blur-sm">
        <span className="block text-[7px] font-medium uppercase tracking-[0.08em] text-[#73807d]">{plataforma}</span>
        <strong className="mt-1 block line-clamp-1 text-[10px] font-semibold text-[#25302e]">{projeto.configuracao.tema || projeto.nome}</strong>
      </div>
      <span className="absolute left-3 top-3 rounded border border-white/70 bg-white/80 px-2 py-1 text-[7.5px] font-medium text-[#53605d] backdrop-blur-sm">
        {formato}
      </span>
    </div>
  );
}

export function CartaoProjetoStudio({
  projeto,
  pastas,
  aoSelecionar,
  aoFavoritar,
  aoDuplicar,
  aoArquivar,
  aoExcluir,
  aoMover,
  aoExportar,
}: {
  projeto: ProjetoStudio;
  pastas: PastaProjetoStudio[];
  aoSelecionar: () => void;
  aoFavoritar: () => void;
  aoDuplicar: () => void;
  aoArquivar: () => void;
  aoExcluir: () => void;
  aoMover: (pastaId: string | null) => void;
  aoExportar: () => void;
}) {
  const pasta = pastas.find((item) => item.id === projeto.pastaId);
  const arquivado = projeto.status === "arquivado";

  return (
    <article className="painel-superficie group overflow-hidden rounded-md transition hover:-translate-y-0.5 hover:border-[#d5dcda] hover:shadow-[0_8px_24px_rgba(24,35,32,.07)]">
      <MiniaturaProjeto projeto={projeto} />

      <div className="p-3.5">
        <div className="flex items-start gap-2">
          <button type="button" onClick={aoSelecionar} className="foco-acessivel min-w-0 flex-1 rounded text-left">
            <h3 className="line-clamp-1 text-[11.5px] font-semibold tracking-[-0.015em] text-[#262b2c]">{projeto.nome}</h3>
            <p className="mt-1 line-clamp-2 min-h-7 text-[8.5px] leading-3.5 text-[#858d8e]">{projeto.descricao}</p>
          </button>

          <details className="relative shrink-0">
            <summary className="foco-acessivel grid size-7 cursor-pointer list-none place-items-center rounded-md text-[#8b9293] hover:bg-[#f1f4f4] [&::-webkit-details-marker]:hidden">
              <MoreHorizontal className="size-3.5" />
            </summary>
            <div className="absolute right-0 top-8 z-30 w-[190px] rounded-md border border-[#dfe4e4] bg-white p-1.5 shadow-[0_12px_35px_rgba(20,29,27,.14)]">
              <button type="button" onClick={aoSelecionar} className="flex w-full items-center gap-2 rounded px-2.5 py-2 text-left text-[9px] text-[#596162] hover:bg-[#f2f5f4]">
                <History className="size-3.5" /> Ver detalhes e versões
              </button>
              <button type="button" onClick={aoDuplicar} className="flex w-full items-center gap-2 rounded px-2.5 py-2 text-left text-[9px] text-[#596162] hover:bg-[#f2f5f4]">
                <Copy className="size-3.5" /> Duplicar projeto
              </button>
              <button type="button" onClick={aoExportar} className="flex w-full items-center gap-2 rounded px-2.5 py-2 text-left text-[9px] text-[#596162] hover:bg-[#f2f5f4]">
                <Download className="size-3.5" /> Exportar arquivo JSON
              </button>
              <div className="my-1 border-t border-[#edf0f0]" />
              <label className="flex items-center gap-2 rounded px-2.5 py-2 text-[9px] text-[#596162] hover:bg-[#f2f5f4]">
                <FolderInput className="size-3.5" />
                <select
                  value={projeto.pastaId ?? ""}
                  onChange={(evento) => aoMover(evento.target.value || null)}
                  className="min-w-0 flex-1 bg-transparent text-[9px] outline-none"
                >
                  <option value="">Sem pasta</option>
                  {pastas.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nome}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" onClick={aoArquivar} className="flex w-full items-center gap-2 rounded px-2.5 py-2 text-left text-[9px] text-[#785f50] hover:bg-[#faf4ef]">
                <Archive className="size-3.5" /> {arquivado ? "Restaurar como rascunho" : "Arquivar projeto"}
              </button>
              {arquivado && (
                <button type="button" onClick={aoExcluir} className="flex w-full items-center gap-2 rounded px-2.5 py-2 text-left text-[9px] text-[#a04d4d] hover:bg-[#fbefef]">
                  <Trash2 className="size-3.5" /> Excluir definitivamente
                </button>
              )}
            </div>
          </details>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <SeloStatus texto={rotulosStatusProjeto[projeto.status]} tom={tonsStatusProjeto[projeto.status]} />
          <button
            type="button"
            onClick={aoFavoritar}
            aria-label={projeto.favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            className={`foco-acessivel grid size-7 place-items-center rounded-md border transition ${
              projeto.favorito
                ? "border-[#efd9d4] bg-[#fff7f5] text-[#b45e50]"
                : "border-[#e3e7e7] bg-white text-[#92999a] hover:text-[#b45e50]"
            }`}
          >
            <Heart className={`size-3.5 ${projeto.favorito ? "fill-current" : ""}`} />
          </button>
        </div>

        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between text-[8px] text-[#8c9495]">
            <span>Progresso do projeto</span>
            <strong className="font-medium text-[#5f6768]">{projeto.progresso}%</strong>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-[#edf0f0]">
            <div className="h-full rounded-full bg-[#2a9a84]" style={{ width: `${projeto.progresso}%` }} />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-[#edf0f0] pt-3">
          <div className="min-w-0 text-[8px] text-[#8e9596]">
            <span className="flex items-center gap-1">
              <Clock3 className="size-3" /> {formatarDataProjeto(projeto.atualizadoEm)}
            </span>
            <span className="mt-1 block max-w-[130px] truncate">{pasta?.nome ?? "Sem pasta"}</span>
          </div>
          {!arquivado && (
            <Link
              href={`/criar-video?projeto=${encodeURIComponent(projeto.id)}`}
              className="foco-acessivel inline-flex h-8 items-center gap-1.5 rounded-md border border-[#18806c] bg-[#1f9b83] px-2.5 text-[9px] font-medium text-white shadow-sm hover:bg-[#18866f]"
            >
              {projeto.status === "concluido" ? <Play className="size-3" /> : <Sparkles className="size-3" />}
              {projeto.status === "concluido" ? "Abrir" : "Continuar"}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

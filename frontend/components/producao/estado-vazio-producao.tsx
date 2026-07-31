import { Clapperboard, FolderKanban, Sparkles } from "lucide-react";
import Link from "next/link";

import { conteudoProducao } from "@/content/producao";

export function EstadoVazioProducao() {
  return (
    <div className="painel-superficie flex min-h-[360px] flex-col items-center justify-center rounded-md px-6 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-[#edf4f2] text-[#6c7f7a]">
        <Clapperboard className="size-5" />
      </span>
      <h2 className="mt-4 text-[11px] font-semibold text-[#303637]">{conteudoProducao.vazioTitulo}</h2>
      <p className="mt-1 max-w-[390px] text-[8.5px] leading-4 text-[#858d8e]">{conteudoProducao.vazioDescricao}</p>
      <div className="mt-4 flex items-center gap-2">
        <Link href="/projetos?status=prontos" className="foco-acessivel inline-flex h-9 items-center gap-2 rounded-md border border-[#dfe4e4] bg-white px-3 text-[9px] font-medium text-[#5f6768] hover:bg-[#f7f9f9]"><FolderKanban className="size-3.5" /> Ver projetos prontos</Link>
        <Link href="/criar-video" className="foco-acessivel inline-flex h-9 items-center gap-2 rounded-md border border-[#18806c] bg-[#1f9b83] px-3 text-[9px] font-medium text-white hover:bg-[#18866f]"><Sparkles className="size-3.5" /> Criar vídeo</Link>
      </div>
    </div>
  );
}

import { KeyRound, RadioTower } from "lucide-react";

import { conteudoCanaisPublicacao } from "@/content/canais-publicacao";

export function CabecalhoCanais({ conectadas }: { conectadas: number }) {
  return <header className="border-b border-[#e1e6e5] bg-white px-8 py-5"><div className="flex items-start justify-between"><div><div className="flex items-center gap-2 text-[7px] font-semibold uppercase tracking-[0.09em] text-[#2d8b76]"><RadioTower className="size-3" /> Fase 16 · OAuth</div><h1 className="mt-2 text-[21px] font-semibold tracking-[-0.04em] text-[#252b2b]">{conteudoCanaisPublicacao.titulo}</h1><p className="mt-1 max-w-2xl text-[9px] leading-4 text-[#808989]">{conteudoCanaisPublicacao.descricao}</p></div><div className="flex items-center gap-2 rounded-md border border-[#dbe6e3] bg-[#f3faf8] px-3 py-2 text-[8px] text-[#2a7565]"><KeyRound className="size-3.5" /> {conectadas} conta(s) conectada(s)</div></div></header>;
}

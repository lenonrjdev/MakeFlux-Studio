import { RefreshCw, ShieldCheck } from "lucide-react";

import { conteudoAtualizador } from "@/content/atualizador";

export function CabecalhoAtualizacoes({ versao }: { versao: string }) {
  return (
    <header className="border-b border-[#e1e6e5] bg-white px-8 py-5">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[7px] font-semibold uppercase tracking-[0.09em] text-[#2d8b76]">
            <ShieldCheck className="size-3" /> Fase 17 · distribuição segura
          </div>
          <h1 className="mt-2 text-[23px] font-semibold tracking-[-0.045em] text-[#2b3132]">{conteudoAtualizador.titulo}</h1>
          <p className="mt-1 max-w-[720px] text-[9px] leading-5 text-[#81898a]">{conteudoAtualizador.descricao}</p>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-[#dfe7e4] bg-[#f8fbfa] px-3 py-2 text-[8px] text-[#64706e]">
          <RefreshCw className="size-3.5 text-[#278b76]" /> Versão instalada <strong className="text-[#2f3736]">v{versao}</strong>
        </div>
      </div>
    </header>
  );
}

import { CheckCircle2, ShieldCheck } from "lucide-react";

import { SeloStatus } from "@/components/ui/selo-status";
import { conteudoQualidade } from "@/content/qualidade";

export function CabecalhoQualidade() {
  return (
    <header className="border-b border-[#e3e8e7] bg-white px-8 py-5">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.1em] text-[#1d8b74]">
            <ShieldCheck className="size-3" /> Sistema
          </div>
          <h1 className="mt-2 text-[22px] font-semibold tracking-[-0.035em] text-[#252a2b]">
            {conteudoQualidade.titulo}
          </h1>
          <p className="mt-1.5 max-w-[720px] text-[10px] leading-5 text-[#788181]">
            {conteudoQualidade.descricao}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SeloStatus texto="Versão 1.0.0" tom="verde" />
          <span className="flex h-9 items-center gap-2 rounded-md border border-[#dfe7e5] bg-[#f7faf9] px-3 text-[9px] text-[#527068]">
            <CheckCircle2 className="size-3.5 text-[#1f9078]" />
            Release candidate local
          </span>
        </div>
      </div>
    </header>
  );
}

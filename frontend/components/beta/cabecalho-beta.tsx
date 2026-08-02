import { BadgeCheck, RefreshCw } from "lucide-react";

import { Botao } from "@/components/ui/botao";
import { SeloStatus } from "@/components/ui/selo-status";
import { conteudoBeta } from "@/content/beta";

export function CabecalhoBeta({ score, carregando, aoAtualizar }: { score: number; carregando: boolean; aoAtualizar: () => void }) {
  return (
    <header className="border-b border-[#e3e8e7] bg-white px-8 py-5">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.1em] text-[#1d8b74]"><BadgeCheck className="size-3" /> Homologação</div>
          <h1 className="mt-2 text-[22px] font-semibold tracking-[-0.035em] text-[#252a2b]">{conteudoBeta.titulo}</h1>
          <p className="mt-1.5 max-w-[760px] text-[10px] leading-5 text-[#788181]">{conteudoBeta.descricao}</p>
        </div>
        <div className="flex items-center gap-2">
          <SeloStatus texto={`Prontidão ${score}%`} tom={score >= 85 ? "verde" : "neutro"} />
          <SeloStatus texto="Linha 1.9.x" tom="verde" />
          <Botao variante="primario" onClick={aoAtualizar} disabled={carregando}><RefreshCw className={`size-3.5 ${carregando ? "animate-spin" : ""}`} /> Atualizar</Botao>
        </div>
      </div>
    </header>
  );
}

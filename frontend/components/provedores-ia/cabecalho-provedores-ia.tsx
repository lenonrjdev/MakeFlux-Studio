import { BrainCircuit, RefreshCw, ShieldCheck } from "lucide-react";

import { Botao } from "@/components/ui/botao";
import { SeloStatus } from "@/components/ui/selo-status";
import { conteudoProvedoresIa } from "@/content/provedores-ia";

export function CabecalhoProvedoresIa({ aoAtualizar }: { aoAtualizar: () => void }) {
  return (
    <header className="border-b border-[#e3e8e7] bg-white px-8 py-5">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.1em] text-[#1d8b74]">
            <BrainCircuit className="size-3" /> Inteligência artificial
          </div>
          <h1 className="mt-2 text-[22px] font-semibold tracking-[-0.035em] text-[#252a2b]">{conteudoProvedoresIa.titulo}</h1>
          <p className="mt-1.5 max-w-[780px] text-[10px] leading-5 text-[#788181]">{conteudoProvedoresIa.descricao}</p>
        </div>
        <div className="flex items-center gap-2">
          <SeloStatus texto="Versão 1.7.0" tom="verde" />
          <SeloStatus texto="Cofre criptografado" tom="neutro" />
          <Botao variante="primario" onClick={aoAtualizar}><RefreshCw className="size-3.5" /> Atualizar</Botao>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-md border border-[#dce9e5] bg-[#f4faf8] px-3 py-2 text-[8px] text-[#55736c]">
        <ShieldCheck className="size-3.5 text-[#25806b]" /> {conteudoProvedoresIa.cofre}
      </div>
    </header>
  );
}

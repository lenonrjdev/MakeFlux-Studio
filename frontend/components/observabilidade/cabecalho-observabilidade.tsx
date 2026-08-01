
import { Activity, RefreshCw, TestTube2 } from "lucide-react";

import { Botao } from "@/components/ui/botao";
import { SeloStatus } from "@/components/ui/selo-status";
import { conteudoObservabilidade } from "@/content/observabilidade";

export function CabecalhoObservabilidade({ aoAtualizar, aoTestar }: { aoAtualizar: () => void; aoTestar: () => Promise<unknown> }) {
  return (
    <header className="border-b border-[#e3e8e7] bg-white px-8 py-5">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.1em] text-[#1d8b74]"><Activity className="size-3" /> Sistema</div>
          <h1 className="mt-2 text-[22px] font-semibold tracking-[-0.035em] text-[#252a2b]">{conteudoObservabilidade.titulo}</h1>
          <p className="mt-1.5 max-w-[760px] text-[10px] leading-5 text-[#788181]">{conteudoObservabilidade.descricao}</p>
        </div>
        <div className="flex items-center gap-2">
          <SeloStatus texto="Versão 1.5.0" tom="verde" />
          <Botao onClick={() => void aoTestar()}><TestTube2 className="size-3.5" /> Registrar teste</Botao>
          <Botao variante="primario" onClick={aoAtualizar}><RefreshCw className="size-3.5" /> Atualizar</Botao>
        </div>
      </div>
    </header>
  );
}

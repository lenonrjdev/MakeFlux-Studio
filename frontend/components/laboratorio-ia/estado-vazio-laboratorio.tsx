"use client";

import { FlaskConical, Plus, Sparkles } from "lucide-react";

import { Botao } from "@/components/ui/botao";

export function EstadoVazioLaboratorio({ aoCriar }: { aoCriar: () => void }) {
  return (
    <section className="painel-superficie grid min-h-[520px] place-items-center rounded-md px-8 text-center">
      <div className="max-w-[430px]">
        <span className="mx-auto grid size-12 place-items-center rounded-lg border border-[#d6e5e1] bg-[#eff8f5] text-[#238771]">
          <FlaskConical className="size-5" />
        </span>
        <h2 className="mt-4 text-[14px] font-semibold tracking-[-0.02em] text-[#252a2b]">
          Crie um experimento controlado
        </h2>
        <p className="mt-2 text-[9px] leading-4 text-[#7e8788]">
          Escolha uma ferramenta, preserve o contexto e compare variações de roteiro, gancho, termos visuais, metadados ou prompts do sistema.
        </p>
        <Botao onClick={aoCriar} variante="primario" className="mt-4 h-9 px-4 text-[9px]">
          <Plus className="size-3.5" /> Criar primeiro experimento
        </Botao>
        <div className="mt-5 flex items-center justify-center gap-1.5 text-[7.5px] text-[#8c9495]">
          <Sparkles className="size-3 text-[#3a8a77]" /> Histórico, comparação A/B e envio para o estúdio incluídos.
        </div>
      </div>
    </section>
  );
}

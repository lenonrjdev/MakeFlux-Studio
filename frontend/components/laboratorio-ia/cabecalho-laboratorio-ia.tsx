"use client";

import { Beaker, FlaskConical, Plus, Sparkles } from "lucide-react";

import { Botao } from "@/components/ui/botao";
import { SeloStatus } from "@/components/ui/selo-status";
import { conteudoLaboratorioIa } from "@/content/laboratorio-ia";

export function CabecalhoLaboratorioIa({
  totalExperimentos,
  executando,
  aoCriar,
}: {
  totalExperimentos: number;
  executando: boolean;
  aoCriar: () => void;
}) {
  return (
    <section className="border-b border-[#e1e6e5] bg-white px-8 py-5">
      <div className="flex items-start justify-between gap-8">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-md border border-[#d6e5e1] bg-[#eff8f5] text-[#238771]">
            <FlaskConical className="size-4.5" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-[19px] font-semibold tracking-[-0.025em] text-[#171a1b]">
                {conteudoLaboratorioIa.titulo}
              </h1>
              <SeloStatus
                texto={executando ? "Gerando variações" : "Laboratório pronto"}
                tom={executando ? "azul" : "verde"}
              />
              <span className="rounded border border-[#dce1e1] bg-[#fafbfb] px-2 py-1 text-[8px] font-medium uppercase tracking-[0.05em] text-[#7b8384]">
                {conteudoLaboratorioIa.etiqueta}
              </span>
            </div>
            <p className="mt-2 max-w-[760px] text-[10.5px] leading-5 text-[#747c7d]">
              {conteudoLaboratorioIa.descricao}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#e0e5e5] bg-[#fafbfb] px-2.5 text-[8.5px] text-[#747c7d]">
            <Beaker className="size-3.5" /> {totalExperimentos} experimentos
          </span>
          <Botao onClick={aoCriar} variante="primario" className="h-8 px-3">
            <Plus className="size-3.5" />
            Novo experimento
          </Botao>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-md border border-[#dfe8e5] bg-[#f6faf9] px-3 py-2 text-[8.5px] text-[#668079]">
        <Sparkles className="size-3.5 text-[#2b8b76]" />
        Nesta fase, as respostas são simuladas localmente. A interface e os contratos já estão preparados para OpenAI, Ollama e outros provedores.
      </div>
    </section>
  );
}

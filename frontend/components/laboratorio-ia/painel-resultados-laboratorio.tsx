"use client";

import { Columns2, FlaskConical, List, LoaderCircle } from "lucide-react";

import type { ExperimentoLaboratorio } from "@/types/laboratorio-ia";

import { CartaoResultadoExperimento } from "./cartao-resultado-experimento";

export function PainelResultadosLaboratorio({
  experimento,
  executando,
  comparar,
  aoAlternarComparacao,
  aoSelecionarMelhor,
  aoUsarNoProjeto,
  aoCopiar,
}: {
  experimento: ExperimentoLaboratorio;
  executando: boolean;
  comparar: boolean;
  aoAlternarComparacao: () => void;
  aoSelecionarMelhor: (resultadoId: string) => void;
  aoUsarNoProjeto: (resultadoId: string) => void;
  aoCopiar: (conteudo: string) => void;
}) {
  return (
    <section className="painel-superficie overflow-hidden rounded-md">
      <header className="flex items-start justify-between gap-4 border-b border-[#e7ebeb] bg-[#fafbfb] px-4 py-3.5">
        <div>
          <h2 className="text-[10px] font-semibold text-[#303637]">Variações geradas</h2>
          <p className="mt-1 text-[8px] leading-3.5 text-[#8b9293]">
            Compare conteúdo e indicadores mantendo o mesmo contexto de entrada.
          </p>
        </div>
        <button
          type="button"
          onClick={aoAlternarComparacao}
          disabled={experimento.resultados.length < 2}
          className="foco-acessivel inline-flex h-7 items-center gap-1.5 rounded-md border border-[#dfe4e4] bg-white px-2 text-[7.5px] font-medium text-[#687071] hover:bg-[#f5f7f7] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {comparar ? <List className="size-3" /> : <Columns2 className="size-3" />}
          {comparar ? "Ver em lista" : "Comparar lado a lado"}
        </button>
      </header>

      <div className="p-4">
        {executando ? (
          <div className="grid min-h-[250px] place-items-center rounded-md border border-dashed border-[#d8e2df] bg-[#fafcfc] text-center">
            <div>
              <LoaderCircle className="mx-auto size-5 animate-spin text-[#2e8a75]" />
              <p className="mt-3 text-[9px] font-medium text-[#4b5553]">Preparando variações comparáveis</p>
              <p className="mt-1 text-[7.5px] text-[#8b9293]">Mantendo tema, modelo e parâmetros registrados.</p>
            </div>
          </div>
        ) : experimento.resultados.length === 0 ? (
          <div className="grid min-h-[250px] place-items-center rounded-md border border-dashed border-[#d8dfde] bg-[#fafbfb] text-center">
            <div className="max-w-[300px]">
              <span className="mx-auto grid size-10 place-items-center rounded-md border border-[#dfe5e4] bg-white text-[#7c8986]">
                <FlaskConical className="size-4" />
              </span>
              <p className="mt-3 text-[9px] font-medium text-[#4b5354]">O experimento ainda não foi executado</p>
              <p className="mt-1 text-[7.5px] leading-3.5 text-[#8b9293]">
                Revise os prompts e gere de duas a quatro variações para comparar sem alterar as condições do teste.
              </p>
            </div>
          </div>
        ) : (
          <div className={comparar ? "grid grid-cols-2 gap-3" : "space-y-3"}>
            {(comparar ? experimento.resultados.slice(0, 2) : experimento.resultados).map((resultado) => (
              <CartaoResultadoExperimento
                key={resultado.id}
                resultado={resultado}
                selecionado={experimento.melhorResultadoId === resultado.id}
                aoSelecionar={() => aoSelecionarMelhor(resultado.id)}
                aoUsarNoProjeto={() => aoUsarNoProjeto(resultado.id)}
                aoCopiar={() => aoCopiar(resultado.conteudo)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

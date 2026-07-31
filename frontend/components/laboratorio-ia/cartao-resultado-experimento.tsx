"use client";

import { ArrowUpRight, Check, Clipboard, Star } from "lucide-react";

import { indicadoresLaboratorio } from "@/data/laboratorio-ia";
import type { ResultadoExperimentoLaboratorio } from "@/types/laboratorio-ia";

export function CartaoResultadoExperimento({
  resultado,
  selecionado,
  aoSelecionar,
  aoUsarNoProjeto,
  aoCopiar,
}: {
  resultado: ResultadoExperimentoLaboratorio;
  selecionado: boolean;
  aoSelecionar: () => void;
  aoUsarNoProjeto: () => void;
  aoCopiar: () => void;
}) {
  return (
    <article
      className={`overflow-hidden rounded-md border bg-white transition ${
        selecionado ? "border-[#afd8ce] ring-1 ring-[#d9eee9]" : "border-[#e1e6e5] hover:border-[#d1d9d7]"
      }`}
    >
      <header className="flex items-start justify-between gap-4 border-b border-[#e8ebeb] bg-[#fafbfb] px-3.5 py-3">
        <div>
          <div className="flex items-center gap-2">
            <strong className="text-[9.5px] font-semibold text-[#303637]">{resultado.titulo}</strong>
            {selecionado && (
              <span className="inline-flex h-5 items-center gap-1 rounded border border-[#c5e2db] bg-[#eef8f5] px-1.5 text-[6.5px] font-medium text-[#1d7562]">
                <Star className="size-2.5 fill-current" /> Melhor resultado
              </span>
            )}
          </div>
          <p className="mt-1 text-[7.5px] text-[#8a9293]">{resultado.resumo}</p>
        </div>
        <div className="flex items-center gap-1.5 text-[7px] text-[#92999a]">
          <span>{resultado.palavras} palavras</span>
          <span>·</span>
          <span>{resultado.duracaoEstimada}</span>
        </div>
      </header>

      <div className="p-3.5">
        <div className="grid grid-cols-4 gap-2">
          {indicadoresLaboratorio.map((indicador) => {
            const Icone = indicador.icone;
            const valor = resultado.pontuacoes[indicador.id];
            return (
              <div key={indicador.id} className="rounded-md border border-[#e5e9e8] bg-[#fafbfb] px-2 py-2">
                <div className="flex items-center justify-between gap-1">
                  <Icone className="size-3 text-[#6f7d7a]" />
                  <strong className="text-[9px] font-semibold text-[#2f3736]">{valor}</strong>
                </div>
                <span className="mt-1 block text-[6.5px] text-[#92999a]">{indicador.titulo}</span>
                <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-[#e7ebea]">
                  <span className="block h-full rounded-full bg-[#55a691]" style={{ width: `${valor}%` }} />
                </span>
              </div>
            );
          })}
        </div>

        <pre className="mt-3 max-h-[280px] overflow-auto whitespace-pre-wrap rounded-md border border-[#e3e7e7] bg-[#fcfdfd] p-3 font-sans text-[8.5px] leading-4 text-[#4e5657]">
          {resultado.conteudo}
        </pre>
      </div>

      <footer className="flex items-center justify-between border-t border-[#e8ebeb] bg-[#fafbfb] px-3.5 py-2.5">
        <button
          type="button"
          onClick={aoSelecionar}
          className={`foco-acessivel inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-[7.5px] font-medium ${
            selecionado
              ? "bg-[#e8f5f1] text-[#1d7562]"
              : "text-[#677071] hover:bg-[#eef2f1] hover:text-[#287b68]"
          }`}
        >
          {selecionado ? <Check className="size-3" /> : <Star className="size-3" />}
          {selecionado ? "Resultado escolhido" : "Escolher como melhor"}
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={aoCopiar}
            className="foco-acessivel inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-[7.5px] font-medium text-[#677071] hover:bg-[#eef2f1]"
          >
            <Clipboard className="size-3" /> Copiar
          </button>
          <button
            type="button"
            onClick={aoUsarNoProjeto}
            className="foco-acessivel inline-flex h-7 items-center gap-1.5 rounded-md border border-[#18806c] bg-[#1f9b83] px-2.5 text-[7.5px] font-medium text-white hover:bg-[#18866f]"
          >
            Usar no projeto <ArrowUpRight className="size-3" />
          </button>
        </div>
      </footer>
    </article>
  );
}

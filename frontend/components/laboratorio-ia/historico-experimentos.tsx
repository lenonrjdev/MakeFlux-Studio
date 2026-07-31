"use client";

import { Copy, FlaskConical, MoreHorizontal, Plus, Trash2 } from "lucide-react";

import { ferramentasLaboratorio } from "@/data/laboratorio-ia";
import type { ExperimentoLaboratorio, TipoFerramentaLaboratorio } from "@/types/laboratorio-ia";

function rotuloStatus(status: ExperimentoLaboratorio["status"]) {
  const rotulos = {
    rascunho: "Rascunho",
    processando: "Gerando",
    concluido: "Concluído",
    erro: "Erro",
  } as const;
  return rotulos[status];
}

export function HistoricoExperimentos({
  experimentos,
  selecionadoId,
  ferramentaAtiva,
  aoSelecionar,
  aoCriar,
  aoDuplicar,
  aoExcluir,
}: {
  experimentos: ExperimentoLaboratorio[];
  selecionadoId: string | null;
  ferramentaAtiva: TipoFerramentaLaboratorio;
  aoSelecionar: (id: string) => void;
  aoCriar: () => void;
  aoDuplicar: (id: string) => void;
  aoExcluir: (id: string) => void;
}) {
  const filtrados = experimentos.filter((item) => item.tipo === ferramentaAtiva);
  const ferramenta = ferramentasLaboratorio.find((item) => item.id === ferramentaAtiva);

  return (
    <aside className="painel-superficie overflow-hidden rounded-md">
      <header className="flex items-center justify-between border-b border-[#e7ebeb] bg-[#fafbfb] px-3.5 py-3">
        <div>
          <h2 className="text-[9px] font-semibold text-[#303637]">Experimentos</h2>
          <p className="mt-0.5 text-[7.5px] text-[#92999a]">{ferramenta?.titulo}</p>
        </div>
        <button
          type="button"
          onClick={aoCriar}
          aria-label="Criar experimento"
          className="foco-acessivel grid size-7 place-items-center rounded-md border border-[#dbe4e1] bg-white text-[#287c69] hover:bg-[#f2f8f6]"
        >
          <Plus className="size-3.5" />
        </button>
      </header>

      <div className="max-h-[630px] space-y-1 overflow-y-auto p-2">
        {filtrados.length === 0 ? (
          <div className="px-3 py-10 text-center">
            <span className="mx-auto grid size-9 place-items-center rounded-md border border-dashed border-[#d9dfde] bg-[#fafbfb] text-[#8a9293]">
              <FlaskConical className="size-4" />
            </span>
            <p className="mt-3 text-[8.5px] font-medium text-[#555d5e]">Nenhum teste nesta ferramenta</p>
            <button
              type="button"
              onClick={aoCriar}
              className="foco-acessivel mt-2 text-[8px] font-medium text-[#23836f] hover:underline"
            >
              Criar primeiro experimento
            </button>
          </div>
        ) : (
          filtrados.map((experimento) => {
            const ativo = experimento.id === selecionadoId;
            return (
              <article
                key={experimento.id}
                className={`group rounded-md border p-2.5 transition ${
                  ativo
                    ? "border-[#bcded5] bg-[#edf8f5]"
                    : "border-transparent hover:border-[#e1e6e5] hover:bg-[#fafbfb]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => aoSelecionar(experimento.id)}
                  className="foco-acessivel block w-full text-left"
                >
                  <div className="flex items-start justify-between gap-2">
                    <strong className="line-clamp-2 text-[8.5px] font-semibold leading-3.5 text-[#303637]">
                      {experimento.nome}
                    </strong>
                    <MoreHorizontal className="size-3 shrink-0 text-[#a0a6a7]" />
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-[7.5px] leading-3 text-[#858d8e]">
                    {experimento.tema}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="rounded border border-black/[0.05] bg-white/80 px-1.5 py-0.5 text-[6.5px] font-medium text-[#657071]">
                      {rotuloStatus(experimento.status)}
                    </span>
                    <span className="text-[6.5px] text-[#9ba2a3]">{experimento.resultados.length} variações</span>
                  </div>
                </button>
                <div className={`mt-2 flex justify-end gap-1 ${ativo ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                  <button
                    type="button"
                    onClick={() => aoDuplicar(experimento.id)}
                    aria-label="Duplicar experimento"
                    className="foco-acessivel grid size-6 place-items-center rounded text-[#737b7c] hover:bg-white hover:text-[#277b68]"
                  >
                    <Copy className="size-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => aoExcluir(experimento.id)}
                    aria-label="Excluir experimento"
                    className="foco-acessivel grid size-6 place-items-center rounded text-[#737b7c] hover:bg-[#fff2f2] hover:text-[#ac5050]"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </aside>
  );
}

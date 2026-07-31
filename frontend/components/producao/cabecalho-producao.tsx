"use client";

import { CirclePause, CirclePlay, Clapperboard, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";

import { Botao } from "@/components/ui/botao";
import { SeloStatus } from "@/components/ui/selo-status";
import { conteudoProducao } from "@/content/producao";
import type { TarefaProducao } from "@/types/producao";

export function CabecalhoProducao({
  tarefas,
  filaPausada,
  aoAlternarFila,
  aoLimparFinalizadas,
}: {
  tarefas: TarefaProducao[];
  filaPausada: boolean;
  aoAlternarFila: () => void;
  aoLimparFinalizadas: () => void;
}) {
  const processando = tarefas.some((tarefa) => tarefa.status === "processando");
  const possuiFinalizadas = tarefas.some((tarefa) =>
    ["concluida", "cancelada"].includes(tarefa.status),
  );

  return (
    <section className="border-b border-[#e1e6e5] bg-white px-8 py-5">
      <div className="flex items-start justify-between gap-8">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-md border border-[#d6e5e1] bg-[#eff8f5] text-[#238771]">
            <Clapperboard className="size-4.5" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-[19px] font-semibold tracking-[-0.025em] text-[#171a1b]">
                {conteudoProducao.titulo}
              </h1>
              <SeloStatus
                texto={filaPausada ? "Fila pausada" : processando ? "Motor ocupado" : "Motor pronto"}
                tom={filaPausada ? "laranja" : processando ? "azul" : "verde"}
              />
              <span className="rounded border border-[#dce1e1] bg-[#fafbfb] px-2 py-1 text-[8px] font-medium uppercase tracking-[0.05em] text-[#7b8384]">
                {conteudoProducao.etiqueta}
              </span>
            </div>
            <p className="mt-2 max-w-[760px] text-[10.5px] leading-5 text-[#747c7d]">
              {conteudoProducao.descricao}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Botao
            onClick={aoLimparFinalizadas}
            disabled={!possuiFinalizadas}
            variante="fantasma"
            className="h-8 px-2.5"
          >
            <Trash2 className="size-3.5" />
            Limpar finalizadas
          </Botao>
          <Botao onClick={aoAlternarFila} className="h-8 px-3">
            {filaPausada ? <CirclePlay className="size-3.5" /> : <CirclePause className="size-3.5" />}
            {filaPausada ? "Retomar fila" : "Pausar fila"}
          </Botao>
          <Link
            href="/criar-video"
            className="foco-acessivel inline-flex h-8 items-center gap-1.5 rounded-md border border-[#18806c] bg-[#1f9b83] px-3 text-[9.5px] font-medium text-white shadow-sm hover:bg-[#18866f]"
          >
            <Sparkles className="size-3.5" />
            Novo vídeo
          </Link>
        </div>
      </div>
    </section>
  );
}

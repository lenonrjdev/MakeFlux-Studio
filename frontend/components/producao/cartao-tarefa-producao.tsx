"use client";

import {
  Ban,
  CirclePause,
  CirclePlay,
  Clock3,
  Copy,
  Eye,
  FileVideo2,
  MoreHorizontal,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { SeloStatus } from "@/components/ui/selo-status";
import { rotulosPrioridade, rotulosStatusTarefa, tonsStatusTarefa } from "@/data/producao";
import {
  formatarTempoProducao,
  rotuloEtapaAtual,
  statusPermitePausa,
  tempoRestanteTarefa,
} from "@/lib/producao-local";
import type { PrioridadeTarefaProducao, TarefaProducao } from "@/types/producao";

import { ProgressoEtapas } from "./progresso-etapas";

export function CartaoTarefaProducao({
  tarefa,
  aoSelecionar,
  aoPausar,
  aoRetomar,
  aoCancelar,
  aoTentarNovamente,
  aoDuplicar,
  aoExcluir,
  aoAlterarPrioridade,
}: {
  tarefa: TarefaProducao;
  aoSelecionar: () => void;
  aoPausar: () => void;
  aoRetomar: () => void;
  aoCancelar: () => void;
  aoTentarNovamente: () => void;
  aoDuplicar: () => void;
  aoExcluir: () => void;
  aoAlterarPrioridade: (prioridade: PrioridadeTarefaProducao) => void;
}) {
  const terminal = ["concluida", "cancelada"].includes(tarefa.status);
  const podeRetomar = ["pausada", "erro", "cancelada"].includes(tarefa.status);
  const restante = tempoRestanteTarefa(tarefa);

  return (
    <article className="painel-superficie rounded-md bg-white p-4 transition hover:border-[#d6dddd] hover:shadow-[0_5px_18px_rgba(27,36,34,.05)]">
      <div className="flex items-start gap-3.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-[#edf5f3] text-[#2c806f] ring-1 ring-[#dce8e5]">
          <FileVideo2 className="size-4" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <button type="button" onClick={aoSelecionar} className="foco-acessivel min-w-0 rounded text-left">
              <h3 className="truncate text-[11px] font-semibold tracking-[-0.015em] text-[#272c2d]">{tarefa.nome}</h3>
              <p className="mt-1 line-clamp-1 text-[8px] text-[#8a9293]">{tarefa.descricao}</p>
            </button>

            <div className="flex shrink-0 items-center gap-2">
              <SeloStatus texto={rotulosStatusTarefa[tarefa.status]} tom={tonsStatusTarefa[tarefa.status]} />
              <details className="relative">
                <summary className="foco-acessivel grid size-7 cursor-pointer list-none place-items-center rounded-md text-[#899192] hover:bg-[#f2f4f4] [&::-webkit-details-marker]:hidden">
                  <MoreHorizontal className="size-3.5" />
                </summary>
                <div className="absolute right-0 top-8 z-30 w-[195px] rounded-md border border-[#dfe4e4] bg-white p-1.5 shadow-[0_12px_35px_rgba(20,29,27,.14)]">
                  <button type="button" onClick={aoSelecionar} className="flex w-full items-center gap-2 rounded px-2.5 py-2 text-left text-[8.5px] text-[#596162] hover:bg-[#f2f5f4]"><Eye className="size-3.5" /> Ver detalhes</button>
                  <button type="button" onClick={aoDuplicar} className="flex w-full items-center gap-2 rounded px-2.5 py-2 text-left text-[8.5px] text-[#596162] hover:bg-[#f2f5f4]"><Copy className="size-3.5" /> Duplicar renderização</button>
                  <label className="flex items-center gap-2 rounded px-2.5 py-2 text-[8.5px] text-[#596162] hover:bg-[#f2f5f4]">
                    Prioridade
                    <select value={tarefa.prioridade} onChange={(evento) => aoAlterarPrioridade(evento.target.value as PrioridadeTarefaProducao)} className="min-w-0 flex-1 bg-transparent text-right text-[8px] outline-none">
                      {(["baixa", "normal", "alta"] as PrioridadeTarefaProducao[]).map((prioridade) => <option key={prioridade} value={prioridade}>{rotulosPrioridade[prioridade]}</option>)}
                    </select>
                  </label>
                  {terminal && <button type="button" onClick={aoExcluir} className="flex w-full items-center gap-2 rounded px-2.5 py-2 text-left text-[8.5px] text-[#a04d4d] hover:bg-[#fbefef]"><Trash2 className="size-3.5" /> Remover do histórico</button>}
                </div>
              </details>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-[1.25fr_1fr_1fr_1fr] divide-x divide-[#e7ebeb] rounded-md border border-[#e4e8e8] bg-[#fafbfb] py-2.5">
            <div className="px-3"><span className="block text-[7px] uppercase tracking-[0.055em] text-[#9aa1a2]">Etapa atual</span><strong className="mt-1 block truncate text-[8.5px] font-medium text-[#4b5253]">{rotuloEtapaAtual(tarefa.etapaAtual)}</strong></div>
            <div className="px-3"><span className="block text-[7px] uppercase tracking-[0.055em] text-[#9aa1a2]">Saída</span><strong className="mt-1 block text-[8.5px] font-medium text-[#4b5253]">{tarefa.formato} · {tarefa.qualidade.split(" · ")[0]}</strong></div>
            <div className="px-3"><span className="block text-[7px] uppercase tracking-[0.055em] text-[#9aa1a2]">Decorrido</span><strong className="mt-1 block text-[8.5px] font-medium text-[#4b5253]">{formatarTempoProducao(tarefa.tempoDecorridoSegundos)}</strong></div>
            <div className="px-3"><span className="block text-[7px] uppercase tracking-[0.055em] text-[#9aa1a2]">Restante</span><strong className="mt-1 block text-[8.5px] font-medium text-[#4b5253]">{tarefa.status === "concluida" ? "Concluído" : `~${formatarTempoProducao(restante)}`}</strong></div>
          </div>

          <div className="mt-3">
            <div className="mb-1.5 flex items-center justify-between text-[8px] text-[#838b8c]">
              <span className="inline-flex items-center gap-1.5"><Clock3 className="size-3" /> Prioridade {rotulosPrioridade[tarefa.prioridade].toLowerCase()} · {tarefa.modoExecucao === "moneyprinter" ? "Motor real" : "Simulação local"}</span>
              <strong className="font-medium text-[#4d5556]">{tarefa.progresso}%</strong>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#edf0f0]">
              <div className={`h-full rounded-full transition-[width] duration-500 ${tarefa.status === "erro" ? "bg-[#c65b5b]" : "bg-[#2a9a84]"}`} style={{ width: `${tarefa.progresso}%` }} />
            </div>
            <div className="mt-2"><ProgressoEtapas etapas={tarefa.etapas} compacto /></div>
          </div>

          <div className="mt-3 flex items-center justify-end gap-2 border-t border-[#edf0f0] pt-3">
            {statusPermitePausa(tarefa.status) && (
              <button type="button" onClick={aoPausar} className="foco-acessivel inline-flex h-8 items-center gap-1.5 rounded-md border border-[#dfe4e4] bg-white px-2.5 text-[8.5px] font-medium text-[#626a6b] hover:bg-[#f7f9f9]"><CirclePause className="size-3.5" /> Pausar</button>
            )}
            {podeRetomar && (
              <button type="button" onClick={tarefa.status === "erro" ? aoTentarNovamente : aoRetomar} className="foco-acessivel inline-flex h-8 items-center gap-1.5 rounded-md border border-[#dfe4e4] bg-white px-2.5 text-[8.5px] font-medium text-[#626a6b] hover:bg-[#f7f9f9]">
                {tarefa.status === "erro" ? <RotateCcw className="size-3.5" /> : <CirclePlay className="size-3.5" />}
                {tarefa.status === "erro" ? "Tentar novamente" : "Retomar"}
              </button>
            )}
            {!terminal && tarefa.status !== "cancelada" && (
              <button type="button" onClick={aoCancelar} className="foco-acessivel inline-flex h-8 items-center gap-1.5 rounded-md border border-transparent px-2.5 text-[8.5px] font-medium text-[#8b5d55] hover:bg-[#faf1ef]"><Ban className="size-3.5" /> Cancelar</button>
            )}
            <button type="button" onClick={aoSelecionar} className="foco-acessivel inline-flex h-8 items-center gap-1.5 rounded-md border border-[#18806c] bg-[#1f9b83] px-2.5 text-[8.5px] font-medium text-white hover:bg-[#18866f]"><Eye className="size-3.5" /> Detalhes</button>
          </div>
        </div>
      </div>
    </article>
  );
}

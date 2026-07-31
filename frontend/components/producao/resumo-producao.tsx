import { AlertTriangle, CheckCircle2, Clock3, ListVideo, PauseCircle } from "lucide-react";

import type { TarefaProducao } from "@/types/producao";

export function ResumoProducao({ tarefas }: { tarefas: TarefaProducao[] }) {
  const metricas = [
    {
      rotulo: "Em andamento",
      valor: tarefas.filter((tarefa) => tarefa.status === "processando").length,
      detalhe: "tarefa ativa agora",
      icone: ListVideo,
    },
    {
      rotulo: "Na fila",
      valor: tarefas.filter((tarefa) => tarefa.status === "na-fila").length,
      detalhe: "aguardando processamento",
      icone: Clock3,
    },
    {
      rotulo: "Pausadas",
      valor: tarefas.filter((tarefa) => tarefa.status === "pausada").length,
      detalhe: "podem ser retomadas",
      icone: PauseCircle,
    },
    {
      rotulo: "Concluídas",
      valor: tarefas.filter((tarefa) => tarefa.status === "concluida").length,
      detalhe: "arquivos disponíveis",
      icone: CheckCircle2,
    },
    {
      rotulo: "Com erro",
      valor: tarefas.filter((tarefa) => tarefa.status === "erro").length,
      detalhe: "precisam de atenção",
      icone: AlertTriangle,
    },
  ];

  return (
    <section className="painel-superficie grid grid-cols-5 divide-x divide-[#e7ebeb] overflow-hidden rounded-md">
      {metricas.map(({ rotulo, valor, detalhe, icone: Icone }) => (
        <div key={rotulo} className="bg-white px-4 py-3.5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <strong className="block text-[18px] font-semibold tracking-[-0.03em] text-[#24292a]">
                {valor}
              </strong>
              <span className="mt-0.5 block text-[8px] font-medium uppercase tracking-[0.055em] text-[#858d8e]">
                {rotulo}
              </span>
            </div>
            <span className="grid size-7 place-items-center rounded-md bg-[#f1f4f4] text-[#778081]">
              <Icone className="size-3.5" />
            </span>
          </div>
          <p className="mt-2 text-[7.5px] text-[#9aa1a2]">{detalhe}</p>
        </div>
      ))}
    </section>
  );
}

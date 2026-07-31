import { Activity, Cpu, Database, Gauge, HardDrive, ServerCog } from "lucide-react";

import { SeloStatus } from "@/components/ui/selo-status";
import { conteudoProducao } from "@/content/producao";
import type { RecursosSistemaProducao } from "@/types/producao";

function BarraRecurso({ valor }: { valor: number }) {
  return (
    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#edf0f0]">
      <div className="h-full rounded-full bg-[#2a9a84] transition-[width] duration-500" style={{ width: `${Math.min(valor, 100)}%` }} />
    </div>
  );
}

export function MonitorRecursos({ recursos }: { recursos: RecursosSistemaProducao }) {
  const itens = [
    { rotulo: "CPU", valor: recursos.cpu, detalhe: `${recursos.cpu}% em uso`, icone: Cpu },
    {
      rotulo: "Memória RAM",
      valor: Math.round((recursos.ram / recursos.ramTotal) * 100),
      detalhe: `${recursos.ram.toFixed(1)} de ${recursos.ramTotal} GB`,
      icone: Database,
    },
    { rotulo: "GPU", valor: recursos.gpu, detalhe: `${recursos.gpu}% em uso`, icone: Gauge },
    {
      rotulo: "Memória de vídeo",
      valor: Math.round((recursos.vram / recursos.vramTotal) * 100),
      detalhe: `${recursos.vram.toFixed(1)} de ${recursos.vramTotal} GB`,
      icone: Activity,
    },
    { rotulo: "Disco", valor: recursos.disco, detalhe: `${recursos.disco} MB/s`, icone: HardDrive },
  ];

  return (
    <aside className="painel-superficie rounded-md bg-white p-4">
      <div className="flex items-start justify-between gap-4 border-b border-[#edf0f0] pb-3">
        <div>
          <h2 className="flex items-center gap-2 text-[10.5px] font-semibold text-[#303637]">
            <ServerCog className="size-3.5 text-[#71807c]" />
            {conteudoProducao.recursosTitulo}
          </h2>
          <p className="mt-1 text-[8px] leading-3.5 text-[#919899]">{conteudoProducao.recursosDescricao}</p>
        </div>
        <SeloStatus
          texto={recursos.motor}
          tom={recursos.motor === "Ocupado" ? "azul" : recursos.motor === "Pausado" ? "laranja" : "verde"}
        />
      </div>

      <div className="mt-2 divide-y divide-[#edf0f0]">
        {itens.map(({ rotulo, valor, detalhe, icone: Icone }) => (
          <div key={rotulo} className="py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="grid size-7 shrink-0 place-items-center rounded-md bg-[#f2f4f4] text-[#747d7e]">
                  <Icone className="size-3.5" />
                </span>
                <div className="min-w-0">
                  <strong className="block text-[8.5px] font-medium text-[#4a5152]">{rotulo}</strong>
                  <span className="mt-0.5 block truncate text-[7.5px] text-[#92999a]">{detalhe}</span>
                </div>
              </div>
              <span className="text-[9px] font-semibold text-[#394041]">{valor}%</span>
            </div>
            <BarraRecurso valor={valor} />
          </div>
        ))}
      </div>

      <div className="mt-2 rounded-md border border-[#e1e6e5] bg-[#fafbfb] p-3">
        <span className="block text-[7px] font-medium uppercase tracking-[0.06em] text-[#9aa1a2]">Codificador ativo</span>
        <strong className="mt-1.5 block text-[8.5px] font-medium leading-4 text-[#4c5455]">{recursos.codificador}</strong>
      </div>

      <p className="mt-3 text-[7.5px] leading-3.5 text-[#969d9e]">{conteudoProducao.avisoSimulacao}</p>
    </aside>
  );
}

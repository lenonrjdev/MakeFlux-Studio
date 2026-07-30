"use client";

import { Archive, Bot, CheckCircle2, Cpu, FolderRoot, Mic2, Video } from "lucide-react";

import { BotaoSelecionarPasta } from "@/components/ui/botao-selecionar-pasta";
import { conteudoInicio } from "@/content/inicio";
import { useProjetosLocais } from "@/hooks/use-projetos-locais";

const detalhes = [
  { rotulo: "Modelo de IA", valor: "OpenAI · modo híbrido", icone: Bot },
  { rotulo: "Voz padrão", valor: "Português (Brasil)", icone: Mic2 },
  { rotulo: "Renderização", valor: "Automática · GPU", icone: Cpu },
];

export function ResumoEstudio() {
  const { projetos } = useProjetosLocais();
  const metricas = [
    { rotulo: "Projetos", valor: projetos.filter((item) => item.status !== "arquivado").length, icone: FolderRoot },
    { rotulo: "Em edição", valor: projetos.filter((item) => item.status === "em-edicao").length, icone: Video },
    { rotulo: "Prontos", valor: projetos.filter((item) => item.status === "pronto").length, icone: CheckCircle2 },
    { rotulo: "Concluídos", valor: projetos.filter((item) => item.status === "concluido").length, icone: CheckCircle2 },
    { rotulo: "Arquivados", valor: projetos.filter((item) => item.status === "arquivado").length, icone: Archive },
  ];

  return (
    <section className="painel-superficie overflow-hidden rounded-md">
      <div className="grid grid-cols-5 divide-x divide-[#e7ebeb] bg-[#f4f6f6]">
        {metricas.map(({ rotulo, valor, icone: Icone }) => (
          <div key={rotulo} className="px-5 py-4">
            <div className="flex items-center justify-between gap-3"><strong className="text-[18px] font-semibold tracking-[-0.03em] text-[#1d2122]">{valor}</strong><Icone className="size-4 text-[#98a0a1]" strokeWidth={1.6} /></div>
            <span className="mt-1 block text-[8.5px] font-medium uppercase tracking-[0.05em] text-[#868e8f]">{rotulo}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_1fr_1fr_1.55fr] divide-x divide-[#edf0f0] px-1 py-4">
        {detalhes.map(({ rotulo, valor, icone: Icone }) => (
          <div key={rotulo} className="flex items-start gap-2.5 px-4">
            <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-[#f1f4f4] text-[#6d7576]"><Icone className="size-3.5" /></span>
            <div className="min-w-0"><span className="block text-[8px] font-medium uppercase tracking-[0.06em] text-[#9aa1a2]">{rotulo}</span><strong className="mt-1 block truncate text-[10px] font-medium text-[#333839]">{valor}</strong></div>
          </div>
        ))}

        <div className="flex items-center justify-between gap-4 px-4">
          <div className="flex min-w-0 items-start gap-2.5">
            <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-[#f1f4f4] text-[#6d7576]"><FolderRoot className="size-3.5" /></span>
            <div className="min-w-0"><span className="block text-[8px] font-medium uppercase tracking-[0.06em] text-[#9aa1a2]">{conteudoInicio.pastaPadrao}</span><p className="mt-1 line-clamp-2 text-[9px] leading-4 text-[#747c7d]">{conteudoInicio.descricaoPasta}</p></div>
          </div>
          <BotaoSelecionarPasta />
        </div>
      </div>
    </section>
  );
}

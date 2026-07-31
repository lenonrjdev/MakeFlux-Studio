import { Activity, BookOpenText, CheckCircle2, ListChecks } from "lucide-react";

import type { WorkspaceAjuda } from "@/types/ajuda";

export function ResumoAjuda({ workspace, totalGuias }: { workspace: WorkspaceAjuda; totalGuias: number }) {
  const progresso = Math.round((workspace.etapasConcluidas.length / 6) * 100);
  const diagnostico = workspace.ultimoDiagnostico;
  const itens = [
    {
      titulo: "Onboarding",
      valor: `${progresso}%`,
      detalhe: `${workspace.etapasConcluidas.length} de 6 etapas`,
      icone: ListChecks,
    },
    {
      titulo: "Guias consultados",
      valor: String(workspace.guiasVisualizados.length),
      detalhe: `${totalGuias} disponíveis`,
      icone: BookOpenText,
    },
    {
      titulo: "Problemas resolvidos",
      valor: String(workspace.problemasResolvidos.length),
      detalhe: "checklist pessoal",
      icone: CheckCircle2,
    },
    {
      titulo: "Último diagnóstico",
      valor: diagnostico ? diagnostico.statusGeral : "Pendente",
      detalhe: diagnostico ? new Date(diagnostico.executadoEm).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "ainda não executado",
      icone: Activity,
    },
  ];

  return (
    <section className="grid grid-cols-4 overflow-hidden rounded-md border border-[#e2e7e6] bg-white">
      {itens.map((item, indice) => {
        const Icone = item.icone;
        return (
          <div key={item.titulo} className={`flex items-center gap-3 px-4 py-3.5 ${indice ? "border-l border-[#edf0f0]" : ""}`}>
            <span className="flex size-8 items-center justify-center rounded-md bg-[#edf7f4] text-[#257c6a]">
              <Icone className="size-4" />
            </span>
            <div>
              <p className="text-[8.5px] font-medium uppercase tracking-[0.045em] text-[#8b9293]">{item.titulo}</p>
              <p className="mt-0.5 text-[13px] font-semibold capitalize text-[#293031]">{item.valor}</p>
              <p className="mt-0.5 text-[8.5px] text-[#9ba1a2]">{item.detalhe}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}

import { CheckCircle2, FlaskConical, Layers3, Star } from "lucide-react";

import type { ExperimentoLaboratorio, PresetPromptLaboratorio } from "@/types/laboratorio-ia";

export function ResumoLaboratorioIa({
  experimentos,
  presets,
}: {
  experimentos: ExperimentoLaboratorio[];
  presets: PresetPromptLaboratorio[];
}) {
  const concluidos = experimentos.filter((item) => item.status === "concluido").length;
  const variacoes = experimentos.reduce((total, item) => total + item.resultados.length, 0);
  const favoritos = presets.filter((item) => item.favorito).length;
  const metricas = [
    { titulo: "Experimentos", valor: experimentos.length, detalhe: "histórico local", icone: FlaskConical },
    { titulo: "Concluídos", valor: concluidos, detalhe: "prontos para comparar", icone: CheckCircle2 },
    { titulo: "Variações", valor: variacoes, detalhe: "resultados preservados", icone: Layers3 },
    { titulo: "Prompts favoritos", valor: favoritos, detalhe: "presets fixados", icone: Star },
  ];

  return (
    <div className="grid grid-cols-4 overflow-hidden rounded-md border border-[#e1e6e5] bg-white shadow-[0_1px_2px_rgba(20,29,27,.03)]">
      {metricas.map((metrica, indice) => {
        const Icone = metrica.icone;
        return (
          <div
            key={metrica.titulo}
            className={`flex items-center gap-3 px-4 py-3 ${indice > 0 ? "border-l border-[#e8ebeb]" : ""}`}
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-md border border-[#e0e7e5] bg-[#f6faf9] text-[#378270]">
              <Icone className="size-3.5" />
            </span>
            <div>
              <span className="text-[8px] font-medium uppercase tracking-[0.04em] text-[#8b9293]">
                {metrica.titulo}
              </span>
              <div className="mt-0.5 flex items-baseline gap-1.5">
                <strong className="text-[17px] font-semibold tracking-[-0.025em] text-[#252a2b]">
                  {metrica.valor}
                </strong>
                <span className="text-[7.5px] text-[#9aa1a2]">{metrica.detalhe}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

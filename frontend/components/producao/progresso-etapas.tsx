import { Check, Circle, LoaderCircle, TriangleAlert } from "lucide-react";

import type { EtapaTarefaProducao } from "@/types/producao";

export function ProgressoEtapas({ etapas, compacto = false }: { etapas: EtapaTarefaProducao[]; compacto?: boolean }) {
  if (compacto) {
    return (
      <div className="grid grid-cols-8 gap-1">
        {etapas.map((etapa) => (
          <div
            key={etapa.id}
            title={`${etapa.titulo}: ${etapa.status}`}
            className={`h-1.5 rounded-full ${
              etapa.status === "concluida"
                ? "bg-[#2a9a84]"
                : etapa.status === "processando"
                  ? "bg-[#72b8aa]"
                  : etapa.status === "erro"
                    ? "bg-[#c95f5f]"
                    : "bg-[#e7ebeb]"
            }`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {etapas.map((etapa, indice) => {
        const Icone =
          etapa.status === "concluida"
            ? Check
            : etapa.status === "processando"
              ? LoaderCircle
              : etapa.status === "erro"
                ? TriangleAlert
                : Circle;
        return (
          <div key={etapa.id} className="relative flex items-start gap-3 rounded-md px-2 py-2">
            {indice < etapas.length - 1 && (
              <span className="absolute left-[16px] top-[27px] h-[17px] w-px bg-[#e1e6e5]" />
            )}
            <span
              className={`relative z-10 grid size-5 shrink-0 place-items-center rounded-full border ${
                etapa.status === "concluida"
                  ? "border-[#b9ddd4] bg-[#eaf7f3] text-[#238671]"
                  : etapa.status === "processando"
                    ? "border-[#bdd8e4] bg-[#eef7fa] text-[#3d7e96]"
                    : etapa.status === "erro"
                      ? "border-[#ebcaca] bg-[#fff1f1] text-[#b84f4f]"
                      : "border-[#e0e5e5] bg-white text-[#a2a8a9]"
              }`}
            >
              <Icone className={`size-3 ${etapa.status === "processando" ? "animate-spin" : ""}`} />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-center justify-between gap-3">
                <strong className="text-[8.5px] font-medium text-[#4a5152]">{etapa.titulo}</strong>
                <span className="text-[7.5px] text-[#959c9d]">
                  {etapa.status === "processando" ? `${etapa.progresso}%` : etapa.status}
                </span>
              </div>
              {etapa.status === "processando" && (
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[#edf0f0]">
                  <div className="h-full rounded-full bg-[#559f91]" style={{ width: `${etapa.progresso}%` }} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

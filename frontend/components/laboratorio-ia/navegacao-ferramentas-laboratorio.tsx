"use client";

import { ferramentasLaboratorio } from "@/data/laboratorio-ia";
import type { TipoFerramentaLaboratorio } from "@/types/laboratorio-ia";

export function NavegacaoFerramentasLaboratorio({
  ativa,
  totais,
  aoSelecionar,
}: {
  ativa: TipoFerramentaLaboratorio;
  totais: Record<TipoFerramentaLaboratorio, number>;
  aoSelecionar: (tipo: TipoFerramentaLaboratorio) => void;
}) {
  return (
    <nav className="grid grid-cols-5 gap-2">
      {ferramentasLaboratorio.map((ferramenta) => {
        const Icone = ferramenta.icone;
        const selecionada = ativa === ferramenta.id;
        return (
          <button
            key={ferramenta.id}
            type="button"
            onClick={() => aoSelecionar(ferramenta.id)}
            className={`foco-acessivel flex min-w-0 items-center gap-2.5 rounded-md border px-3 py-2.5 text-left transition ${
              selecionada
                ? "border-[#bcded5] bg-[#edf8f5] text-[#176e5d] shadow-[0_1px_2px_rgba(26,99,83,.05)]"
                : "border-[#e1e6e5] bg-white text-[#626a6b] hover:border-[#d2d9d8] hover:bg-[#fafbfb]"
            }`}
          >
            <span
              className={`grid size-7 shrink-0 place-items-center rounded-md border ${
                selecionada
                  ? "border-[#c4e2da] bg-white text-[#21836f]"
                  : "border-[#e2e6e6] bg-[#f8f9f9] text-[#7d8586]"
              }`}
            >
              <Icone className="size-3.5" />
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block truncate text-[9px] font-semibold">{ferramenta.titulo}</strong>
              <span className="mt-0.5 block truncate text-[7.5px] opacity-75">{ferramenta.descricao}</span>
            </span>
            <span className="grid size-5 shrink-0 place-items-center rounded bg-white/80 text-[7.5px] font-semibold ring-1 ring-black/[0.05]">
              {totais[ferramenta.id]}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

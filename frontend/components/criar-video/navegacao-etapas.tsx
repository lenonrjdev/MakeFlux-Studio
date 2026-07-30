"use client";

import { Check } from "lucide-react";

import { etapasCriacaoVideo } from "@/data/criar-video";
import { juntarClasses } from "@/lib/classes";
import type { IdEtapaCriacao } from "@/types/criar-video";

export function NavegacaoEtapas({
  etapaAtual,
  aoSelecionar,
}: {
  etapaAtual: IdEtapaCriacao;
  aoSelecionar: (etapa: IdEtapaCriacao) => void;
}) {
  const indiceAtual = etapasCriacaoVideo.findIndex((etapa) => etapa.id === etapaAtual);

  return (
    <nav className="mt-5 grid grid-cols-7 border-t border-[#e6eaea]" aria-label="Etapas de criação do vídeo">
      {etapasCriacaoVideo.map((etapa, indice) => {
        const ativa = etapa.id === etapaAtual;
        const concluida = indice < indiceAtual;
        const Icone = etapa.icone;

        return (
          <button
            key={etapa.id}
            type="button"
            onClick={() => aoSelecionar(etapa.id)}
            className={juntarClasses(
              "foco-acessivel relative flex min-w-0 items-center gap-2.5 border-r border-[#e8ebeb] px-3 py-3 text-left transition last:border-r-0",
              ativa ? "bg-white" : "hover:bg-white/70",
            )}
          >
            <span
              className={juntarClasses(
                "grid size-7 shrink-0 place-items-center rounded-md border",
                ativa && "border-[#bcded6] bg-[#eaf7f3] text-[#1d816d]",
                concluida && "border-[#cfe5df] bg-white text-[#278f79]",
                !ativa && !concluida && "border-[#e1e5e5] bg-[#f3f5f5] text-[#92999a]",
              )}
            >
              {concluida ? <Check className="size-3.5" strokeWidth={2.2} /> : <Icone className="size-3.5" strokeWidth={1.8} />}
            </span>
            <span className="min-w-0">
              <strong
                className={juntarClasses(
                  "block truncate text-[9.5px] font-medium",
                  ativa ? "text-[#1f2525]" : "text-[#606869]",
                )}
              >
                {etapa.titulo}
              </strong>
              <span className="mt-0.5 block truncate text-[7.5px] text-[#9aa1a2]">{etapa.resumo}</span>
            </span>
            {ativa && <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[#299a84]" />}
          </button>
        );
      })}
    </nav>
  );
}

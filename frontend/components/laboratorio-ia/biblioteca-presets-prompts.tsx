"use client";

import { Bookmark, Check, Star } from "lucide-react";

import type {
  PresetPromptLaboratorio,
  TipoFerramentaLaboratorio,
} from "@/types/laboratorio-ia";

export function BibliotecaPresetsPrompts({
  presets,
  ferramentaAtiva,
  presetAplicadoId,
  aoAplicar,
  aoFavoritar,
}: {
  presets: PresetPromptLaboratorio[];
  ferramentaAtiva: TipoFerramentaLaboratorio;
  presetAplicadoId: string | null;
  aoAplicar: (preset: PresetPromptLaboratorio) => void;
  aoFavoritar: (id: string) => void;
}) {
  const filtrados = presets
    .filter((preset) => preset.tipo === ferramentaAtiva)
    .sort((a, b) => Number(b.favorito) - Number(a.favorito));

  return (
    <aside className="painel-superficie overflow-hidden rounded-md">
      <header className="border-b border-[#e7ebeb] bg-[#fafbfb] px-3.5 py-3">
        <div className="flex items-center gap-2">
          <Bookmark className="size-3.5 text-[#398471]" />
          <h2 className="text-[9px] font-semibold text-[#303637]">Biblioteca de prompts</h2>
        </div>
        <p className="mt-1 text-[7.5px] leading-3.5 text-[#92999a]">
          Use um preset como ponto de partida e ajuste sem alterar o original.
        </p>
      </header>

      <div className="max-h-[630px] space-y-2 overflow-y-auto p-2.5">
        {filtrados.length === 0 ? (
          <div className="py-8 text-center text-[8px] text-[#8b9293]">
            Nenhum preset disponível para esta ferramenta.
          </div>
        ) : (
          filtrados.map((preset) => {
            const aplicado = presetAplicadoId === preset.id;
            return (
              <article
                key={preset.id}
                className={`rounded-md border p-2.5 transition ${
                  aplicado ? "border-[#bcded5] bg-[#eef8f5]" : "border-[#e3e7e7] bg-white hover:border-[#d2d9d8]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <strong className="block truncate text-[8.5px] font-semibold text-[#353a3b]">
                      {preset.nome}
                    </strong>
                    <p className="mt-1 text-[7.5px] leading-3 text-[#858d8e]">{preset.descricao}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => aoFavoritar(preset.id)}
                    aria-label={preset.favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                    className={`foco-acessivel grid size-6 shrink-0 place-items-center rounded hover:bg-[#f3f5f5] ${
                      preset.favorito ? "text-[#d49a35]" : "text-[#a0a6a7]"
                    }`}
                  >
                    <Star className={`size-3 ${preset.favorito ? "fill-current" : ""}`} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => aoAplicar(preset)}
                  className={`foco-acessivel mt-2.5 inline-flex h-7 w-full items-center justify-center gap-1.5 rounded-md border text-[7.5px] font-medium transition ${
                    aplicado
                      ? "border-[#b7dcd3] bg-white text-[#1c7965]"
                      : "border-[#dfe4e4] bg-[#fafbfb] text-[#687071] hover:bg-[#f2f6f5] hover:text-[#257863]"
                  }`}
                >
                  {aplicado ? <Check className="size-3" /> : <Bookmark className="size-3" />}
                  {aplicado ? "Aplicado ao experimento" : "Aplicar preset"}
                </button>
              </article>
            );
          })
        )}
      </div>
    </aside>
  );
}

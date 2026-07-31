import { LayoutTemplate, Plus, RotateCcw } from "lucide-react";

import { Botao } from "@/components/ui/botao";
import { conteudoTemplates } from "@/content/templates";

export function EstadoVazioTemplates({ aoLimpar, aoCriar }: { aoLimpar: () => void; aoCriar: () => void }) {
  return (
    <div className="painel-superficie grid min-h-[360px] place-items-center rounded-md p-8 text-center">
      <div className="max-w-[340px]">
        <span className="mx-auto grid size-11 place-items-center rounded-md border border-[#dfe7e5] bg-[#f7faf9] text-[#5d8279]">
          <LayoutTemplate className="size-5" />
        </span>
        <h2 className="mt-4 text-[12px] font-semibold text-[#303536]">{conteudoTemplates.vazioTitulo}</h2>
        <p className="mt-2 text-[9px] leading-4 text-[#858e8f]">{conteudoTemplates.vazioDescricao}</p>
        <div className="mt-4 flex justify-center gap-2">
          <Botao onClick={aoLimpar}>
            <RotateCcw className="size-3.5" /> Limpar filtros
          </Botao>
          <Botao variante="primario" onClick={aoCriar}>
            <Plus className="size-3.5" /> Criar template
          </Botao>
        </div>
      </div>
    </div>
  );
}

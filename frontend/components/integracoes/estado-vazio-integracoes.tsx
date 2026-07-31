import { PlugZap, RotateCcw } from "lucide-react";

import { conteudoIntegracoes } from "@/content/integracoes";

export function EstadoVazioIntegracoes({ aoLimpar }: { aoLimpar: () => void }) {
  return (
    <div className="painel-superficie grid min-h-[320px] place-items-center rounded-md p-8 text-center">
      <div>
        <div className="mx-auto grid size-12 place-items-center rounded-full border border-[#dce6e3] bg-[#f2f8f6] text-[#287762]">
          <PlugZap className="size-5" />
        </div>
        <h2 className="mt-4 text-[12px] font-semibold text-[#323839]">{conteudoIntegracoes.estadoVazioTitulo}</h2>
        <p className="mx-auto mt-1.5 max-w-[340px] text-[8.5px] leading-4 text-[#8a9293]">{conteudoIntegracoes.estadoVazioDescricao}</p>
        <button type="button" onClick={aoLimpar} className="foco-acessivel mt-4 inline-flex h-8 items-center gap-1.5 rounded-md border border-[#dce3e2] bg-white px-3 text-[8px] font-medium text-[#667071] hover:bg-[#f7f9f9]">
          <RotateCcw className="size-3.5" /> Limpar filtros
        </button>
      </div>
    </div>
  );
}

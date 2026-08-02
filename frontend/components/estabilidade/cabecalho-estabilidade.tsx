import { RefreshCw, ShieldAlert } from "lucide-react";

import { Botao } from "@/components/ui/botao";
import { conteudoEstabilidade } from "@/content/estabilidade";

export function CabecalhoEstabilidade({
  carregando,
  aoAtualizar,
}: {
  carregando: boolean;
  aoAtualizar: () => void;
}) {
  return (
    <header className="flex items-center justify-between border-b border-[#e3e8e7] bg-white px-8 py-5">
      <div className="flex items-start gap-3">
        <span className="grid size-9 place-items-center rounded-md border border-[#dce8e4] bg-[#f4faf7] text-[#267864]">
          <ShieldAlert className="size-4" />
        </span>
        <div>
          <h1 className="text-[16px] font-semibold tracking-[-0.025em] text-[#2f3637]">
            {conteudoEstabilidade.titulo}
          </h1>
          <p className="mt-1 max-w-[760px] text-[8.5px] leading-4 text-[#7e8788]">
            {conteudoEstabilidade.descricao}
          </p>
        </div>
      </div>
      <Botao onClick={aoAtualizar} disabled={carregando} className="h-8 text-[9px]">
        <RefreshCw className={`size-3.5 ${carregando ? "animate-spin" : ""}`} />
        Atualizar diagnóstico
      </Botao>
    </header>
  );
}

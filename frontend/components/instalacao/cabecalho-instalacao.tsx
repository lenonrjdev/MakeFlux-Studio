
import { RefreshCw, ShieldCheck } from "lucide-react";

import { Botao } from "@/components/ui/botao";
import { conteudoInstalacao } from "@/content/instalacao";

export function CabecalhoInstalacao({ carregando, aoDiagnosticar }: { carregando: boolean; aoDiagnosticar: () => void }) {
  return (
    <header className="flex items-center justify-between border-b border-[#e4e9e8] bg-white px-8 py-5">
      <div>
        <div className="flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#27806d]"><ShieldCheck className="size-3.5" /> Preparação do ambiente</div>
        <h1 className="mt-2 text-[22px] font-semibold tracking-[-0.035em] text-[#252b2c]">{conteudoInstalacao.titulo}</h1>
        <p className="mt-1 max-w-3xl text-[11px] leading-5 text-[#70797a]">{conteudoInstalacao.descricao}</p>
      </div>
      <Botao onClick={aoDiagnosticar} disabled={carregando}><RefreshCw className={`size-3.5 ${carregando ? "animate-spin" : ""}`} /> Verificar novamente</Botao>
    </header>
  );
}

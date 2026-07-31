import { CheckCircle2, Settings2 } from "lucide-react";

import { conteudoConfiguracoes } from "@/content/configuracoes";

export function CabecalhoConfiguracoes({ atualizadoEm }: { atualizadoEm: string }) {
  return (
    <header className="border-b border-[#e2e7e6] bg-white px-8 py-5">
      <div className="flex items-start justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.06em] text-[#1f8c76]">
            <Settings2 className="size-3.5" />
            Preferências do aplicativo
          </div>
          <h1 className="mt-2 text-[22px] font-semibold tracking-[-0.035em] text-[#202526]">{conteudoConfiguracoes.titulo}</h1>
          <p className="mt-1.5 max-w-[690px] text-[10.5px] leading-5 text-[#747c7d]">{conteudoConfiguracoes.descricao}</p>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-[#dce8e5] bg-[#f1f8f6] px-3 py-2 text-[9px] text-[#347565]">
          <CheckCircle2 className="size-3.5" />
          Salvo localmente
          <span className="text-[#84a29b]">· {new Date(atualizadoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      </div>
    </header>
  );
}

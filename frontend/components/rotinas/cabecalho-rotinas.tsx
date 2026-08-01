import { BellRing, Plus } from "lucide-react";

import { Botao } from "@/components/ui/botao";
import { conteudoRotinas } from "@/content/rotinas";

export function CabecalhoRotinas({ aoCriar, aoTestar }: { aoCriar: () => void; aoTestar: () => Promise<void> }) {
  return (
    <header className="flex items-center justify-between border-b border-[#e3e8e7] bg-white px-8 py-5">
      <div>
        <h1 className="text-[17px] font-semibold tracking-[-0.02em] text-[#282f2f]">{conteudoRotinas.titulo}</h1>
        <p className="mt-1 text-[9px] text-[#848d8c]">{conteudoRotinas.descricao}</p>
      </div>
      <div className="flex items-center gap-2">
        <Botao onClick={() => void aoTestar()}><BellRing className="size-3.5" /> Testar notificação</Botao>
        <Botao variante="primario" onClick={aoCriar}><Plus className="size-3.5" /> Nova rotina</Botao>
      </div>
    </header>
  );
}

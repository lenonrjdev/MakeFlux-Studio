import { CheckCircle2, Clock3, ExternalLink, Star, X } from "lucide-react";
import Link from "next/link";
import type { MouseEvent } from "react";

import { Botao } from "@/components/ui/botao";
import type { GuiaAjuda } from "@/types/ajuda";

export function PainelGuia({
  guia,
  favorito,
  aoFechar,
  aoFavoritar,
}: {
  guia: GuiaAjuda;
  favorito: boolean;
  aoFechar: () => void;
  aoFavoritar: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-[#17201f]/25" onMouseDown={(evento: MouseEvent<HTMLDivElement>) => { if (evento.currentTarget === evento.target) aoFechar(); }}>
      <aside className="h-full w-[520px] overflow-y-auto border-l border-[#dfe5e4] bg-white shadow-[-14px_0_45px_rgba(20,31,29,.12)]">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#e8eceb] bg-white px-5 py-4">
          <div>
            <div className="flex items-center gap-2 text-[8.5px] font-semibold uppercase tracking-[0.05em] text-[#2d806e]">
              <Clock3 className="size-3" /> {guia.tempoMinutos} minutos · {guia.nivel}
            </div>
            <h2 className="mt-2 text-[17px] font-semibold tracking-[-0.025em] text-[#252b2c]">{guia.titulo}</h2>
            <p className="mt-1.5 text-[9.5px] leading-4 text-[#848c8d]">{guia.resumo}</p>
          </div>
          <button type="button" onClick={aoFechar} className="rounded-md p-2 text-[#8e9697] hover:bg-[#f3f5f5]"><X className="size-4" /></button>
        </header>
        <div className="space-y-5 p-5">
          <div className="flex flex-wrap gap-1.5">
            {guia.tags.map((tag) => <span key={tag} className="rounded-md bg-[#f0f4f3] px-2 py-1 text-[8.5px] text-[#657071]">#{tag}</span>)}
          </div>
          <ol className="space-y-3">
            {guia.passos.map((passo, indice) => (
              <li key={passo.titulo} className="flex gap-3 rounded-md border border-[#e4e8e7] p-4">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#eaf6f2] text-[9px] font-semibold text-[#267b69]">{indice + 1}</span>
                <div>
                  <h3 className="text-[10.5px] font-semibold text-[#323839]">{passo.titulo}</h3>
                  <p className="mt-1 text-[9px] leading-4 text-[#858d8e]">{passo.descricao}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="rounded-md border border-[#d8e7e3] bg-[#f4faf8] p-4 text-[9px] leading-4 text-[#4e726a]">
            <div className="flex items-center gap-2 font-semibold"><CheckCircle2 className="size-3.5" /> Guia registrado como consultado</div>
            <p className="mt-1">Seu progresso fica salvo localmente na Central de ajuda.</p>
          </div>
          <div className="flex gap-2">
            <Botao className="flex-1" onClick={aoFavoritar}><Star className={`size-3.5 ${favorito ? "fill-current text-[#cc8e35]" : ""}`} /> {favorito ? "Remover favorito" : "Favoritar guia"}</Botao>
            {guia.rotaRelacionada && <Link href={guia.rotaRelacionada} className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md border border-[#18806c] bg-[#1f9b83] px-3.5 text-[10px] font-medium text-white hover:bg-[#18866f]">Abrir módulo <ExternalLink className="size-3.5" /></Link>}
          </div>
        </div>
      </aside>
    </div>
  );
}

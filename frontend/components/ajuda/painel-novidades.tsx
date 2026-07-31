import { CheckCircle2, Sparkles } from "lucide-react";

import { novidadesMakeFlux } from "@/data/ajuda";

export function PainelNovidades({ lidas, aoMarcarLida }: { lidas: string[]; aoMarcarLida: (versao: string) => void }) {
  return (
    <section className="rounded-md border border-[#e2e7e6] bg-white">
      <header className="border-b border-[#edf0f0] px-5 py-4"><div className="flex items-center gap-2"><Sparkles className="size-4 text-[#317b6c]" /><h2 className="text-[12px] font-semibold text-[#252a2b]">Novidades do MakeFlux Studio</h2></div><p className="mt-1 text-[9.5px] text-[#8b9293]">Resumo das mudanças importantes em cada versão.</p></header>
      <div className="divide-y divide-[#edf0f0]">
        {novidadesMakeFlux.map((versao) => {
          const lida = lidas.includes(versao.versao);
          return (
            <article key={versao.versao} className="px-5 py-4">
              <div className="flex items-start gap-4">
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-md border text-[9px] font-semibold ${versao.atual ? "border-[#b9dcd4] bg-[#edf8f5] text-[#227965]" : "border-[#e1e5e5] bg-[#f7f8f8] text-[#757d7e]"}`}>v{versao.versao}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2"><h3 className="text-[11px] font-semibold text-[#343a3b]">{versao.titulo}</h3>{versao.atual && <span className="rounded-md bg-[#eaf7f3] px-2 py-0.5 text-[7.5px] font-semibold uppercase text-[#247a67]">Atual</span>}</div>
                  <p className="mt-1 text-[8.5px] text-[#9aa1a2]">{new Date(`${versao.data}T12:00:00`).toLocaleDateString("pt-BR")}</p>
                  <ul className="mt-3 space-y-1.5">{versao.itens.map((item) => <li key={item} className="flex items-start gap-2 text-[9px] leading-4 text-[#6f7879]"><CheckCircle2 className="mt-0.5 size-3 shrink-0 text-[#4c8a7b]" />{item}</li>)}</ul>
                </div>
                {!lida && <button type="button" onClick={() => aoMarcarLida(versao.versao)} className="rounded-md border border-[#dfe5e4] px-2.5 py-1.5 text-[8.5px] font-medium text-[#667071] hover:bg-[#f7f9f9]">Marcar como lida</button>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

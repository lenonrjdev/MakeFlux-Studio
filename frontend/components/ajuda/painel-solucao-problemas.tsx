import { Check, ChevronRight, CircleAlert, ExternalLink, Wrench } from "lucide-react";
import Link from "next/link";

import type { ProblemaConhecido } from "@/types/ajuda";

export function PainelSolucaoProblemas({
  problemas,
  resolvidos,
  abertoId,
  aoAbrir,
  aoAlternarResolvido,
}: {
  problemas: ProblemaConhecido[];
  resolvidos: string[];
  abertoId: string | null;
  aoAbrir: (id: string) => void;
  aoAlternarResolvido: (id: string) => void;
}) {
  return (
    <section className="rounded-md border border-[#e2e7e6] bg-white">
      <header className="border-b border-[#edf0f0] px-5 py-4">
        <div className="flex items-center gap-2"><Wrench className="size-4 text-[#317b6c]" /><h2 className="text-[12px] font-semibold text-[#252a2b]">Solução guiada de problemas</h2></div>
        <p className="mt-1 text-[9.5px] text-[#8b9293]">Escolha o sintoma e siga a sequência antes de repetir a produção.</p>
      </header>
      {problemas.length === 0 ? (
        <div className="px-5 py-14 text-center"><CircleAlert className="mx-auto size-7 text-[#b5bcbb]" /><p className="mt-3 text-[10px] font-medium text-[#626a6b]">Nenhum problema encontrado para esta busca.</p></div>
      ) : (
        <div className="divide-y divide-[#edf0f0]">
          {problemas.map((problema) => {
            const aberto = abertoId === problema.id;
            const resolvido = resolvidos.includes(problema.id);
            return (
              <article key={problema.id}>
                <button type="button" onClick={() => aoAbrir(problema.id)} className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-[#fbfcfc]">
                  <span className={`flex size-8 shrink-0 items-center justify-center rounded-md border ${resolvido ? "border-[#c9e3dc] bg-[#edf8f5] text-[#267965]" : problema.gravidade === "alta" ? "border-[#eccdcd] bg-[#fff4f4] text-[#a85252]" : "border-[#eadbcf] bg-[#fbf5f0] text-[#9b6638]"}`}>
                    {resolvido ? <Check className="size-4" /> : <CircleAlert className="size-4" />}
                  </span>
                  <span className="min-w-0 flex-1"><span className="block text-[10.5px] font-semibold text-[#343a3b]">{problema.titulo}</span><span className="mt-1 block text-[9px] text-[#8c9495]">{problema.sintoma}</span></span>
                  <span className={`rounded-md px-2 py-1 text-[8px] font-medium ${resolvido ? "bg-[#edf8f5] text-[#287765]" : "bg-[#f2f4f4] text-[#778081]"}`}>{resolvido ? "Resolvido" : problema.categoria}</span>
                  <ChevronRight className={`size-3.5 text-[#aeb5b5] transition ${aberto ? "rotate-90" : ""}`} />
                </button>
                {aberto && (
                  <div className="border-t border-[#edf0f0] bg-[#fafcfc] px-5 py-4 pl-16">
                    <div className="rounded-md border border-[#e2e7e6] bg-white p-3.5">
                      <p className="text-[8px] font-semibold uppercase tracking-[0.05em] text-[#8b9394]">Causa provável</p>
                      <p className="mt-1 text-[9.5px] leading-4 text-[#596263]">{problema.causaProvavel}</p>
                    </div>
                    <ol className="mt-3 space-y-2">
                      {problema.passos.map((passo, indice) => <li key={passo} className="flex items-start gap-2.5 text-[9px] leading-4 text-[#667071]"><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#eaf5f2] text-[8px] font-semibold text-[#2b7968]">{indice + 1}</span>{passo}</li>)}
                    </ol>
                    <div className="mt-4 flex gap-2">
                      <button type="button" onClick={() => aoAlternarResolvido(problema.id)} className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-[9px] font-medium ${resolvido ? "border-[#dfe5e4] bg-white text-[#697172]" : "border-[#1f8c76] bg-[#1f9b83] text-white"}`}><Check className="size-3" /> {resolvido ? "Marcar como pendente" : "Marcar como resolvido"}</button>
                      {problema.rotaRelacionada && <Link href={problema.rotaRelacionada} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#dfe5e4] bg-white px-3 text-[9px] font-medium text-[#626a6b] hover:bg-[#f6f8f8]">Abrir área relacionada <ExternalLink className="size-3" /></Link>}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

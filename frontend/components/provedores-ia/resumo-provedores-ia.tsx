import { Activity, BadgeDollarSign, BrainCircuit, Coins } from "lucide-react";

import type { ResumoUsoIa } from "@/types/provedores-ia";

export function ResumoProvedoresIa({ resumo }: { resumo: ResumoUsoIa | null }) {
  const itens = [
    { titulo: "Provedores prontos", valor: resumo ? `${resumo.provedoresProntos}/${resumo.provedoresAtivos}` : "—", icone: BrainCircuit },
    { titulo: "Requisições hoje", valor: resumo?.requisicoesHoje.toLocaleString("pt-BR") ?? "—", icone: Activity },
    { titulo: "Tokens hoje", valor: resumo ? (resumo.tokensEntradaHoje + resumo.tokensSaidaHoje).toLocaleString("pt-BR") : "—", icone: Coins },
    { titulo: "Custo estimado", valor: resumo ? resumo.custoEstimadoHoje.toLocaleString("pt-BR", { style: "currency", currency: "USD" }) : "—", icone: BadgeDollarSign },
  ];
  return <section className="grid grid-cols-4 gap-3">{itens.map((item) => { const Icone=item.icone; return <article key={item.titulo} className="rounded-md border border-[#e1e7e6] bg-white px-4 py-3.5"><div className="flex items-center justify-between"><span className="text-[8px] text-[#818a8b]">{item.titulo}</span><Icone className="size-3.5 text-[#398775]" /></div><strong className="mt-2 block text-[17px] font-semibold tracking-[-0.03em] text-[#293031]">{item.valor}</strong></article>; })}</section>;
}

import { ArrowDown, Route } from "lucide-react";

import { conteudoProvedoresIa } from "@/content/provedores-ia";
import type { ConfiguracaoProvedorIa } from "@/types/provedores-ia";

export function PainelFallbackIa({ provedores }: { provedores: ConfiguracaoProvedorIa[] }) {
  const ativos = [...provedores].filter((item) => item.habilitado).sort((a, b) => a.prioridade - b.prioridade);
  return <section className="rounded-md border border-[#e1e7e6] bg-white p-4"><div className="flex items-center gap-2"><Route className="size-3.5 text-[#2d806d]" /><h2 className="text-[10px] font-semibold text-[#303637]">Ordem de fallback</h2></div><p className="mt-1.5 text-[8px] leading-4 text-[#818a8b]">{conteudoProvedoresIa.fallback}</p><div className="mt-3 space-y-1.5">{ativos.map((item, indice) => <div key={item.id}>{indice > 0 && <ArrowDown className="mx-auto mb-1 size-3 text-[#b1b8b7]" />}<div className="flex items-center justify-between rounded-md border border-[#e5e9e8] bg-[#fafbfb] px-3 py-2"><span className="text-[8px] font-medium text-[#4a5253]">{item.prioridade}. {item.nome}</span><span className="text-[7px] text-[#8b9394]">{item.modelo}</span></div></div>)}</div></section>;
}

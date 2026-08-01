
import { Link2 } from "lucide-react";

import { conteudoObservabilidade } from "@/content/observabilidade";
import type { CorrelacaoResumo } from "@/types/observabilidade";

export function PainelCorrelacoes({ correlacoes, aoFiltrar }: { correlacoes: CorrelacaoResumo[]; aoFiltrar: (id: string) => void }) {
  return <section className="rounded-md border border-[#e1e7e6] bg-white p-4"><div className="flex items-center gap-2 text-[10px] font-semibold text-[#303737]"><Link2 className="size-3.5 text-[#268a76]" /> Execuções correlacionadas</div><p className="mt-2 text-[8px] leading-4 text-[#818a89]">{conteudoObservabilidade.correlacao}</p><div className="mt-3 space-y-1.5">{correlacoes.length === 0 ? <p className="rounded-md bg-[#f6f8f7] px-3 py-3 text-[8px] text-[#87908f]">Nenhuma correlação nos filtros atuais.</p> : correlacoes.map((item) => <button key={item.id} type="button" onClick={() => aoFiltrar(item.id)} className="w-full rounded-md border border-[#e7ebea] px-3 py-2 text-left hover:bg-[#f7faf9]"><span className="block truncate font-mono text-[7.5px] text-[#4e6f67]">{item.id}</span><span className="mt-1 flex items-center justify-between text-[7.5px] text-[#8b9492]"><span>{item.total} evento(s) · {item.erros} erro(s)</span><span>{item.ultimoEvento}</span></span></button>)}</div></section>;
}

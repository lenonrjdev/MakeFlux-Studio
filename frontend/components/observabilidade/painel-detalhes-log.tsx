
import { Clipboard, FileJson } from "lucide-react";

import { Botao } from "@/components/ui/botao";
import type { LogEstruturado } from "@/types/observabilidade";

function contextoFormatado(contexto: string) {
  try { return JSON.stringify(JSON.parse(contexto), null, 2); } catch { return contexto || "{}"; }
}

export function PainelDetalhesLog({ log }: { log: LogEstruturado | null }) {
  if (!log) return <section className="rounded-md border border-[#e1e7e6] bg-white p-4"><div className="text-[10px] font-semibold text-[#303737]">Detalhes do registro</div><p className="mt-3 text-[8px] leading-4 text-[#899290]">Selecione um evento para inspecionar seu contexto sanitizado.</p></section>;
  const copiar = () => navigator.clipboard.writeText(JSON.stringify(log, null, 2));
  return <section className="rounded-md border border-[#e1e7e6] bg-white p-4"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-[10px] font-semibold text-[#303737]"><FileJson className="size-3.5 text-[#268a76]" /> Detalhes do registro</div><Botao variante="fantasma" className="h-7 px-2 text-[8px]" onClick={() => void copiar()}><Clipboard className="size-3" /> Copiar</Botao></div><dl className="mt-3 grid grid-cols-[92px_minmax(0,1fr)] gap-x-3 gap-y-2 text-[8px]"><dt className="text-[#8a9391]">Evento</dt><dd className="break-all font-medium text-[#3f4847]">{log.evento}</dd><dt className="text-[#8a9391]">Mensagem</dt><dd className="leading-4 text-[#5e6866]">{log.mensagem}</dd><dt className="text-[#8a9391]">Correlação</dt><dd className="break-all font-mono text-[7.5px] text-[#557069]">{log.correlacaoId}</dd><dt className="text-[#8a9391]">Origem</dt><dd className="text-[#5e6866]">{log.origem}</dd></dl><pre className="mt-3 max-h-[260px] overflow-auto rounded-md border border-[#e6ebea] bg-[#f7f9f8] p-3 text-[7.5px] leading-4 text-[#53605d]">{contextoFormatado(log.contexto)}</pre></section>;
}

import { PlayCircle, RotateCcw } from "lucide-react";

import { Botao } from "@/components/ui/botao";
import { conteudoRotinas } from "@/content/rotinas";
import type { StatusAgendadorRotinas } from "@/types/rotinas";

export function PainelAgendador({ status, aoProcessar }: { status: StatusAgendadorRotinas | null; aoProcessar: () => Promise<unknown> }) {
  return <section className="rounded-md border border-[#e1e7e6] bg-white p-4"><div className="flex items-center gap-2 text-[10px] font-semibold text-[#303737]"><RotateCcw className="size-3.5 text-[#268a76]" /> Recuperação e continuidade</div><p className="mt-2 text-[8px] leading-4 text-[#818a89]">{conteudoRotinas.explicacaoRecuperacao}</p><div className="mt-3 rounded-md bg-[#f4f7f6] px-3 py-2 text-[7.5px] leading-4 text-[#6f7877]">Último ciclo: {status?.ultimoCicloEm ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "medium" }).format(new Date(status.ultimoCicloEm)) : "ainda não executado"}</div><Botao className="mt-3 w-full" onClick={() => void aoProcessar()}><PlayCircle className="size-3.5" /> Processar pendentes agora</Botao></section>;
}

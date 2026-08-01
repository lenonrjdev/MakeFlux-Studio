
"use client";

import { Download, FolderOpen, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";

import { Botao } from "@/components/ui/botao";
import { conteudoObservabilidade } from "@/content/observabilidade";
import type { ResultadoExportacaoDiagnostico } from "@/types/observabilidade";

export function PainelRetencaoExportacao({ exportacao, aoLimpar, aoExportar, aoRevelar }: { exportacao: ResultadoExportacaoDiagnostico | null; aoLimpar: (dias: number) => Promise<unknown>; aoExportar: () => Promise<unknown>; aoRevelar: () => Promise<unknown> }) {
  const [dias, setDias] = useState(30);
  return <section className="rounded-md border border-[#e1e7e6] bg-white p-4"><div className="flex items-center gap-2 text-[10px] font-semibold text-[#303737]"><ShieldCheck className="size-3.5 text-[#268a76]" /> Retenção e pacote de suporte</div><p className="mt-2 text-[8px] leading-4 text-[#818a89]">{conteudoObservabilidade.privacidade}</p><label className="mt-3 block text-[7.5px] font-medium uppercase tracking-[0.08em] text-[#87918f]">Retenção local</label><div className="mt-1.5 flex gap-2"><select value={dias} onChange={(evento) => setDias(Number(evento.target.value))} className="h-8 min-w-0 flex-1 rounded-md border border-[#dde4e2] bg-white px-2 text-[9px] text-[#4f5857]"><option value={7}>7 dias</option><option value={30}>30 dias</option><option value={90}>90 dias</option></select><Botao onClick={() => void aoLimpar(dias)}><Trash2 className="size-3.5" /> Aplicar</Botao></div><Botao variante="primario" className="mt-3 w-full" onClick={() => void aoExportar()}><Download className="size-3.5" /> Exportar diagnóstico sanitizado</Botao>{exportacao && <div className="mt-3 rounded-md border border-[#dbe8e4] bg-[#f1f8f6] p-3"><strong className="block truncate text-[8px] font-medium text-[#3f5e56]">{exportacao.caminho}</strong><span className="mt-1 block text-[7.5px] text-[#75827f]">{exportacao.registros} registros · {Math.ceil(exportacao.tamanhoBytes / 1024)} KB</span><Botao variante="fantasma" className="mt-2 h-7 w-full text-[8px]" onClick={() => void aoRevelar()}><FolderOpen className="size-3" /> Mostrar na pasta</Botao></div>}</section>;
}

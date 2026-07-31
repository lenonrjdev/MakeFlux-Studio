"use client";

import { BarChart3, Database, Download, RotateCcw } from "lucide-react";
import { useState } from "react";

import { Botao } from "@/components/ui/botao";
import { recomendacoesDesempenho } from "@/data/desempenho";
import type { ResultadoManutencao, StatusDesempenhoBanco } from "@/types/desempenho";

export function PainelManutencaoBanco({ status, aoExecutar }: { status: StatusDesempenhoBanco | null; aoExecutar: (acao: ResultadoManutencao["acao"]) => Promise<ResultadoManutencao> }) {
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  async function executar(acao: ResultadoManutencao["acao"]) { setOcupado(true); try { const resultado = await aoExecutar(acao); setMensagem(`${resultado.mensagem} (${resultado.duracaoMs.toFixed(0)} ms)`); } finally { setOcupado(false); } }
  return (
    <section className="rounded-md border border-[#e1e7e6] bg-white p-4">
      <div className="flex items-center gap-2 text-[10px] font-semibold text-[#303737]"><Database className="size-3.5 text-[#1d8b74]" /> Manutenção segura</div>
      <p className="mt-1 text-[8.5px] leading-4 text-[#87908f]">Checkpoint e otimização podem ser executados durante o uso. Compactação exige que não haja operação em lote ativa.</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Botao disabled={ocupado} onClick={() => void executar("checkpoint")}><Download className="size-3.5" /> Checkpoint WAL</Botao>
        <Botao disabled={ocupado} onClick={() => void executar("otimizar")}><BarChart3 className="size-3.5" /> Otimizar índices</Botao>
        <Botao disabled={ocupado || (status?.operacoesAtivas ?? 0) > 0} onClick={() => void executar("compactar")}><RotateCcw className="size-3.5" /> Compactar banco</Botao>
      </div>
      {mensagem && <div role="status" className="mt-3 rounded-md border border-[#dceae6] bg-[#f2f8f6] px-3 py-2 text-[8.5px] text-[#397263]">{mensagem}</div>}
      <div className="mt-4 space-y-2">
        {recomendacoesDesempenho.map((item) => <article key={item.id} className="rounded-md border border-[#edf0ef] px-3 py-2"><strong className="text-[8.5px] font-medium text-[#4b5554]">{item.titulo}</strong><p className="mt-0.5 text-[8px] leading-4 text-[#8b9392]">{item.descricao}</p></article>)}
      </div>
    </section>
  );
}

"use client";

import { Ban, Database, FlaskConical, LoaderCircle, RefreshCw } from "lucide-react";
import { useState } from "react";

import { Botao } from "@/components/ui/botao";
import type { OperacaoLote, SolicitacaoOperacaoLote } from "@/types/desempenho";

export function PainelOperacoesLote({ operacoes, aoIniciar, aoCancelar }: { operacoes: OperacaoLote[]; aoIniciar: (solicitacao: SolicitacaoOperacaoLote) => Promise<OperacaoLote>; aoCancelar: (id: string) => Promise<void> }) {
  const [quantidade, setQuantidade] = useState(10_000);
  const [executando, setExecutando] = useState(false);

  async function iniciar(tipo: SolicitacaoOperacaoLote["tipo"]) {
    setExecutando(true);
    try { await aoIniciar({ tipo, quantidade, tamanhoPayload: 384 }); } finally { setExecutando(false); }
  }

  return (
    <section className="rounded-md border border-[#e1e7e6] bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div><div className="flex items-center gap-2 text-[10px] font-semibold text-[#303737]"><FlaskConical className="size-3.5 text-[#1d8b74]" /> Operações em lote</div><p className="mt-1 text-[8.5px] leading-4 text-[#87908f]">Execute cargas controladas em blocos transacionais, acompanhe progresso e cancele sem corromper o banco.</p></div>
        <input type="number" min={100} max={100_000} step={100} value={quantidade} onChange={(evento) => setQuantidade(Number(evento.target.value))} className="foco-acessivel h-8 w-28 rounded-md border border-[#dfe5e4] px-2 text-right text-[9px]" />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Botao variante="primario" disabled={executando} onClick={() => void iniciar("gerar-dados-teste")}>{executando ? <LoaderCircle className="size-3.5 animate-spin" /> : <Database className="size-3.5" />} Gerar carga</Botao>
        <Botao disabled={executando} onClick={() => void iniciar("remover-dados-teste")}><Ban className="size-3.5" /> Remover carga</Botao>
        <Botao disabled={executando} onClick={() => void iniciar("reindexar")}><RefreshCw className="size-3.5" /> Reindexar</Botao>
      </div>
      <div className="mt-4 space-y-2">
        {operacoes.length === 0 && <div className="rounded-md border border-dashed border-[#dfe5e4] px-3 py-6 text-center text-[8.5px] text-[#909897]">Nenhuma operação executada nesta instalação.</div>}
        {operacoes.slice(0, 5).map((item) => {
          const percentual = item.total > 0 ? Math.min(100, (item.processados / item.total) * 100) : item.status === "concluida" ? 100 : 0;
          const ativa = item.status === "aguardando" || item.status === "processando";
          return <article key={item.id} className="rounded-md border border-[#e7ebea] px-3 py-2.5">
            <div className="flex items-center justify-between gap-3"><div><strong className="text-[9px] font-medium text-[#394140]">{item.tipo.replaceAll("-", " ")}</strong><span className="ml-2 text-[8px] text-[#8b9392]">{item.mensagem}</span></div>{ativa && <button type="button" onClick={() => void aoCancelar(item.id)} className="text-[8px] font-medium text-[#b34f4f]">Cancelar</button>}</div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#edf1f0]"><div className="h-full rounded-full bg-[#25977f] transition-[width]" style={{ width: `${percentual}%` }} /></div>
            <div className="mt-1.5 flex justify-between text-[7.5px] text-[#909897]"><span>{item.processados.toLocaleString("pt-BR")} / {item.total.toLocaleString("pt-BR")}</span><span>{item.status}</span></div>
          </article>;
        })}
      </div>
    </section>
  );
}

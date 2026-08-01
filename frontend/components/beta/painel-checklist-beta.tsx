"use client";

import { Check, LoaderCircle } from "lucide-react";
import { useState } from "react";

import { Botao } from "@/components/ui/botao";
import type { CheckBeta, EntradaCheckBeta } from "@/types/beta";

function ItemCheck({ item, ocupada, aoAtualizar }: { item: CheckBeta; ocupada: boolean; aoAtualizar: (entrada: EntradaCheckBeta) => Promise<unknown> }) {
  const [evidencia, setEvidencia] = useState(item.evidencia);
  return <div className="border-b border-[#edf0ef] px-4 py-3 last:border-b-0"><div className="flex items-start gap-3"><button type="button" aria-label={`Marcar ${item.titulo}`} onClick={() => void aoAtualizar({ checkId: item.id, concluido: !item.concluido, evidencia })} disabled={ocupada} className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded border ${item.concluido ? "border-[#2d917b] bg-[#2d917b] text-white" : "border-[#cfd6d5] bg-white text-transparent"}`}><Check className="size-3" /></button><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><strong className="text-[9px] text-[#3c4546]">{item.titulo}</strong><span className="rounded bg-[#f0f3f2] px-1.5 py-0.5 text-[6px] uppercase tracking-[0.07em] text-[#7e8788]">{item.categoria}</span>{item.obrigatorio && <span className="text-[6.5px] text-[#98713a]">Obrigatório</span>}</div><p className="mt-1 text-[7.5px] leading-4 text-[#7c8586]">{item.descricao}</p><div className="mt-2 flex gap-2"><input value={evidencia} onChange={(evento) => setEvidencia(evento.target.value)} placeholder="Caminho, versão, conta, resultado ou observação" className="foco-acessivel h-8 flex-1 rounded-md border border-[#dfe5e4] px-2.5 text-[8px] text-[#4a5354]" /><Botao className="h-8" onClick={() => void aoAtualizar({ checkId: item.id, concluido: item.concluido, evidencia })} disabled={ocupada}>{ocupada ? <LoaderCircle className="size-3 animate-spin" /> : "Salvar evidência"}</Botao></div></div></div></div>;
}

export function PainelChecklistBeta({ itens, operacao, aoAtualizar }: { itens: CheckBeta[]; operacao: string | null; aoAtualizar: (entrada: EntradaCheckBeta) => Promise<unknown> }) {
  return <section className="rounded-md border border-[#e0e6e5] bg-white"><div className="border-b border-[#e7ebea] px-5 py-4"><h2 className="text-[12px] font-semibold text-[#303738]">Testes manuais e evidências</h2><p className="mt-1 text-[8px] text-[#7f8889]">Execute em condições reais. Marcar sem testar reduz a confiabilidade da release.</p></div>{itens.length ? <div>{itens.map((item) => <ItemCheck key={item.id} item={item} ocupada={operacao === `check:${item.id}`} aoAtualizar={aoAtualizar} />)}</div> : <div className="p-5 text-[8.5px] text-[#80898a]">Inicie uma sessão para carregar o checklist de homologação.</div>}</section>;
}

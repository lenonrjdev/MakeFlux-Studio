import { AlertTriangle, CheckCircle2, ClipboardCheck, ShieldCheck } from "lucide-react";

import type { PainelBetaOperacional } from "@/types/beta";

export function ResumoBeta({ painel }: { painel: PainelBetaOperacional | null }) {
  const obrigatorios = painel?.checklist.filter((item) => item.obrigatorio) ?? [];
  const concluidos = obrigatorios.filter((item) => item.concluido).length;
  const cards = [
    { titulo: "Prontidão", valor: `${painel?.score ?? 0}%`, detalhe: painel?.apto ? "Apta para release candidate" : "Homologação em andamento", icone: ShieldCheck, ok: Boolean(painel?.apto) },
    { titulo: "Portões críticos", valor: `${painel?.bloqueios ?? 0} bloqueios`, detalhe: `${painel?.avisos ?? 0} avisos técnicos`, icone: AlertTriangle, ok: (painel?.bloqueios ?? 0) === 0 },
    { titulo: "Testes manuais", valor: `${concluidos}/${obrigatorios.length}`, detalhe: "Evidências obrigatórias", icone: ClipboardCheck, ok: obrigatorios.length > 0 && concluidos === obrigatorios.length },
    { titulo: "Sessão", valor: painel?.sessao?.status === "aprovada" ? "Aprovada" : painel?.sessao ? "Em andamento" : "Não iniciada", detalhe: painel?.sessao?.alvo ?? "Defina a máquina e o cenário", icone: CheckCircle2, ok: painel?.sessao?.status === "aprovada" },
  ];
  return <section className="grid grid-cols-4 gap-3">{cards.map((card) => { const Icone = card.icone; return <article key={card.titulo} className="rounded-md border border-[#e0e6e5] bg-white p-4"><div className="flex items-center justify-between"><span className="text-[8px] font-medium text-[#838c8d]">{card.titulo}</span><Icone className={`size-3.5 ${card.ok ? "text-[#27806d]" : "text-[#9ba3a4]"}`} /></div><strong className="mt-2 block text-[14px] tracking-[-0.025em] text-[#303738]">{card.valor}</strong><span className="mt-1 block text-[7.5px] leading-4 text-[#8a9293]">{card.detalhe}</span></article>; })}</section>;
}

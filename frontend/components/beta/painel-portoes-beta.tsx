import { AlertTriangle, CheckCircle2, CircleX, Cpu } from "lucide-react";

import type { PortaoBeta } from "@/types/beta";

const visual = {
  aprovado: { icone: CheckCircle2, classe: "border-[#d7e8e3] bg-[#f5faf8] text-[#277561]", rotulo: "Aprovado" },
  atencao: { icone: AlertTriangle, classe: "border-[#eadfc7] bg-[#fffaf1] text-[#8a6b32]", rotulo: "Atenção" },
  bloqueado: { icone: CircleX, classe: "border-[#ead3d3] bg-[#fcf5f5] text-[#9a4e4e]", rotulo: "Bloqueado" },
};

export function PainelPortoesBeta({ portoes }: { portoes: PortaoBeta[] }) {
  return <section className="rounded-md border border-[#e0e6e5] bg-white"><div className="flex items-center gap-2 border-b border-[#e7ebea] px-5 py-4"><Cpu className="size-3.5 text-[#278a76]" /><div><h2 className="text-[12px] font-semibold text-[#303738]">Portões automáticos</h2><p className="mt-1 text-[8px] text-[#7f8889]">Verificações repetíveis executadas pelo runtime nativo.</p></div></div><div className="grid grid-cols-2 gap-3 p-5">{portoes.map((portao) => { const item = visual[portao.status]; const Icone = item.icone; return <article key={portao.id} className={`rounded-md border p-3 ${item.classe}`}><div className="flex items-start justify-between gap-3"><div><strong className="text-[9px]">{portao.titulo}</strong><p className="mt-1 text-[7.5px] leading-4 opacity-85">{portao.detalhe}</p></div><Icone className="size-3.5 shrink-0" /></div><div className="mt-2 flex items-center gap-2 text-[6.5px] uppercase tracking-[0.08em]"><span>{item.rotulo}</span><span>·</span><span>{portao.obrigatorio ? "Obrigatório" : "Recomendado"}</span></div></article>; })}</div></section>;
}

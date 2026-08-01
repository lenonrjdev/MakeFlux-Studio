import { CheckCircle2, History, ServerCog, ShieldCheck } from "lucide-react";

import type { StatusAtualizadorNativo, WorkspaceAtualizador } from "@/types/atualizador";

export function ResumoAtualizacoes({ workspace, runtime }: { workspace: WorkspaceAtualizador; runtime: StatusAtualizadorNativo | null }) {
  const itens = [
    { titulo: "Versão instalada", valor: runtime?.versaoAtual ?? "—", icone: CheckCircle2 },
    { titulo: "Alvo do pacote", valor: runtime?.alvo ?? "Detectando", icone: ServerCog },
    { titulo: "Assinatura", valor: "Obrigatória", icone: ShieldCheck },
    { titulo: "Eventos", valor: workspace.historico.length.toString(), icone: History },
  ];
  return (
    <section className="grid grid-cols-4 gap-3">
      {itens.map(({ titulo, valor, icone: Icone }) => (
        <div key={titulo} className="rounded-md border border-[#e1e7e6] bg-white px-4 py-3">
          <div className="flex items-center justify-between"><span className="text-[7.5px] text-[#858e8d]">{titulo}</span><Icone className="size-3.5 text-[#2c8d78]" /></div>
          <strong className="mt-2 block truncate text-[15px] font-semibold tracking-[-0.035em] text-[#303737]">{valor}</strong>
        </div>
      ))}
    </section>
  );
}

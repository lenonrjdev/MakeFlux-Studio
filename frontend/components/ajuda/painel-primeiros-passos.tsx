import { Check, ChevronRight, Circle, RotateCcw } from "lucide-react";
import Link from "next/link";

import { Botao } from "@/components/ui/botao";
import { etapasOnboarding } from "@/data/ajuda";
import type { WorkspaceAjuda } from "@/types/ajuda";

export function PainelPrimeirosPassos({
  workspace,
  aoAlternar,
  aoConcluir,
  aoReiniciar,
}: {
  workspace: WorkspaceAjuda;
  aoAlternar: (id: string) => void;
  aoConcluir: () => void;
  aoReiniciar: () => void;
}) {
  const progresso = Math.round((workspace.etapasConcluidas.length / etapasOnboarding.length) * 100);
  return (
    <section className="rounded-md border border-[#e2e7e6] bg-white">
      <header className="flex items-center justify-between gap-4 border-b border-[#edf0f0] px-5 py-4">
        <div>
          <h2 className="text-[12px] font-semibold text-[#252a2b]">Primeiros passos</h2>
          <p className="mt-1 text-[9.5px] text-[#8b9293]">Conclua o fluxo básico para deixar o estúdio preparado.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-medium text-[#397a6b]">{progresso}% concluído</span>
          {workspace.etapasConcluidas.length > 0 && (
            <Botao variante="fantasma" className="h-8 px-2.5 text-[9px]" onClick={aoReiniciar}>
              <RotateCcw className="size-3" /> Reiniciar
            </Botao>
          )}
        </div>
      </header>
      <div className="h-1 bg-[#edf1f0]">
        <div className="h-full bg-[#26977f] transition-all" style={{ width: `${progresso}%` }} />
      </div>
      <div className="divide-y divide-[#edf0f0]">
        {etapasOnboarding.map((etapa) => {
          const concluida = workspace.etapasConcluidas.includes(etapa.id);
          return (
            <div key={etapa.id} className="flex items-center gap-3 px-5 py-3.5">
              <button
                type="button"
                aria-label={concluida ? `Desmarcar ${etapa.titulo}` : `Concluir ${etapa.titulo}`}
                onClick={() => aoAlternar(etapa.id)}
                className={`flex size-6 shrink-0 items-center justify-center rounded-full border transition ${concluida ? "border-[#24947c] bg-[#24947c] text-white" : "border-[#d8dfde] bg-white text-[#c1c8c7] hover:border-[#80bdae]"}`}
              >
                {concluida ? <Check className="size-3.5" /> : <Circle className="size-2" />}
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-semibold text-[#9aa1a2]">{String(etapa.ordem).padStart(2, "0")}</span>
                  <h3 className={`text-[10.5px] font-medium ${concluida ? "text-[#6c7475] line-through" : "text-[#2f3536]"}`}>{etapa.titulo}</h3>
                </div>
                <p className="mt-1 text-[9px] leading-4 text-[#92999a]">{etapa.descricao}</p>
              </div>
              <Link href={etapa.rota} className="flex h-8 items-center gap-1.5 rounded-md border border-[#e0e5e4] px-2.5 text-[9px] font-medium text-[#626a6b] hover:bg-[#f7f9f9]">
                {etapa.acao} <ChevronRight className="size-3" />
              </Link>
            </div>
          );
        })}
      </div>
      {!workspace.onboardingConcluido && workspace.etapasConcluidas.length >= 4 && (
        <div className="border-t border-[#edf0f0] bg-[#f8fbfa] px-5 py-3 text-right">
          <Botao variante="primario" onClick={aoConcluir}>Marcar onboarding como concluído</Botao>
        </div>
      )}
    </section>
  );
}

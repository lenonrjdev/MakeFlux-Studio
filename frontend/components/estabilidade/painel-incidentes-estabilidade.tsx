import { CheckCircle2, Siren } from "lucide-react";

import { Botao } from "@/components/ui/botao";
import type { IncidenteEstabilidade } from "@/types/estabilidade";

function dataHora(valor: number) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(valor));
}

export function PainelIncidentesEstabilidade({
  incidentes,
  operacao,
  aoRecuperar,
}: {
  incidentes: IncidenteEstabilidade[];
  operacao: string | null;
  aoRecuperar: (id: string) => void;
}) {
  return (
    <section className="rounded-md border border-[#e0e6e5] bg-white">
      <div className="flex items-center gap-2 border-b border-[#e7ebea] px-5 py-4">
        <Siren className="size-3.5 text-[#278a76]" />
        <div>
          <h2 className="text-[12px] font-semibold text-[#303738]">Incidentes recentes</h2>
          <p className="mt-1 text-[8px] text-[#7f8889]">Falhas sanitizadas e encerramentos inesperados registrados localmente.</p>
        </div>
      </div>
      <div className="divide-y divide-[#edf0ef]">
        {incidentes.slice(0, 12).map((incidente) => (
          <article key={incidente.id} className="flex items-start justify-between gap-4 px-5 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <strong className="text-[8.5px] text-[#3b4243]">{incidente.categoria}</strong>
                <span className="text-[6.5px] uppercase tracking-[0.08em] text-[#9aa1a2]">{incidente.origem}</span>
                {incidente.recuperado && <span className="text-[6.5px] text-[#287663]">Recuperado</span>}
              </div>
              <p className="mt-1 line-clamp-2 text-[7.5px] leading-4 text-[#747d7e]">{incidente.mensagem}</p>
              <span className="mt-1 block text-[6.5px] text-[#a0a7a8]">{dataHora(incidente.criadoEm)} · {incidente.correlacaoId}</span>
            </div>
            {!incidente.recuperado && (
              <Botao
                onClick={() => aoRecuperar(incidente.id)}
                disabled={operacao === `incidente:${incidente.id}`}
                className="h-7 shrink-0 px-2 text-[7px]"
              >
                <CheckCircle2 className="size-3" />
                Marcar resolvido
              </Botao>
            )}
          </article>
        ))}
        {incidentes.length === 0 && (
          <div className="px-5 py-10 text-center text-[8px] text-[#8b9394]">Nenhum incidente foi registrado.</div>
        )}
      </div>
    </section>
  );
}

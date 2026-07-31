import { AlertTriangle, CheckCircle2, Clock3, Layers3 } from "lucide-react";

import type { StatusDesempenhoBanco } from "@/types/desempenho";

export function PainelMetricasBanco({ status }: { status: StatusDesempenhoBanco | null }) {
  const saudavel = (status?.fragmentacaoPercentual ?? 0) < 15 && (status?.consultasLentas ?? 0) < 10;
  return (
    <section className="rounded-md border border-[#e1e7e6] bg-white p-4">
      <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-[10px] font-semibold text-[#303737]"><Layers3 className="size-3.5 text-[#1d8b74]" /> Saúde do banco</div>{saudavel ? <CheckCircle2 className="size-4 text-[#208c74]" /> : <AlertTriangle className="size-4 text-[#b68434]" />}</div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-md bg-[#f7f9f9] p-3"><span className="text-[7.5px] uppercase tracking-[0.07em] text-[#929a99]">Schema</span><strong className="mt-1 block text-[15px] text-[#37403f]">v{status?.schemaVersao ?? 2}</strong></div>
        <div className="rounded-md bg-[#f7f9f9] p-3"><span className="text-[7.5px] uppercase tracking-[0.07em] text-[#929a99]">Consultas lentas</span><strong className="mt-1 block text-[15px] text-[#37403f]">{status?.consultasLentas ?? 0}</strong></div>
        <div className="rounded-md bg-[#f7f9f9] p-3"><span className="text-[7.5px] uppercase tracking-[0.07em] text-[#929a99]">Telemetria</span><strong className="mt-1 block text-[15px] text-[#37403f]">{status?.registrosTelemetria ?? 0}</strong></div>
        <div className="rounded-md bg-[#f7f9f9] p-3"><span className="text-[7.5px] uppercase tracking-[0.07em] text-[#929a99]">Operações ativas</span><strong className="mt-1 block text-[15px] text-[#37403f]">{status?.operacoesAtivas ?? 0}</strong></div>
      </div>
      <div className="mt-3 flex items-start gap-2 rounded-md border border-[#e5ebe9] px-3 py-2.5 text-[8.5px] leading-4 text-[#74807e]"><Clock3 className="mt-0.5 size-3.5 shrink-0 text-[#1d8b74]" />{status?.mensagem ?? "Coletando métricas nativas..."}</div>
    </section>
  );
}

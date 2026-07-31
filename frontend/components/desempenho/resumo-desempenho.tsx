import { Activity, Database, Gauge, List } from "lucide-react";

import type { MetricasSessaoDesempenho, StatusDesempenhoBanco } from "@/types/desempenho";

function formatarBytes(valor: number) {
  if (valor < 1024) return `${valor} B`;
  if (valor < 1024 ** 2) return `${(valor / 1024).toFixed(1)} KB`;
  if (valor < 1024 ** 3) return `${(valor / 1024 ** 2).toFixed(1)} MB`;
  return `${(valor / 1024 ** 3).toFixed(2)} GB`;
}

export function ResumoDesempenho({ status, metricas }: { status: StatusDesempenhoBanco | null; metricas: MetricasSessaoDesempenho }) {
  const itens = [
    { titulo: "Registros", valor: (status?.registrosWorkspace ?? 0).toLocaleString("pt-BR"), detalhe: "workspace SQLite", icone: List },
    { titulo: "Banco + WAL", valor: formatarBytes((status?.tamanhoBancoBytes ?? 0) + (status?.tamanhoWalBytes ?? 0)), detalhe: `${status?.paginas ?? 0} páginas`, icone: Database },
    { titulo: "Fragmentação", valor: `${(status?.fragmentacaoPercentual ?? 0).toFixed(1)}%`, detalhe: `${status?.paginasLivres ?? 0} páginas livres`, icone: Gauge },
    { titulo: "Consulta atual", valor: `${metricas.ultimaConsultaMs.toFixed(1)} ms`, detalhe: `${metricas.paginasCarregadas} páginas na sessão`, icone: Activity },
  ];

  return (
    <section className="grid grid-cols-4 gap-3">
      {itens.map(({ titulo, valor, detalhe, icone: Icone }) => (
        <article key={titulo} className="rounded-md border border-[#e1e7e6] bg-white px-4 py-3.5">
          <div className="flex items-center justify-between text-[8px] font-semibold uppercase tracking-[0.08em] text-[#8a9392]">
            {titulo}<Icone className="size-3.5 text-[#1d8b74]" />
          </div>
          <strong className="mt-2 block text-[19px] font-semibold tracking-[-0.04em] text-[#293031]">{valor}</strong>
          <span className="mt-1 block text-[8.5px] text-[#899191]">{detalhe}</span>
        </article>
      ))}
    </section>
  );
}

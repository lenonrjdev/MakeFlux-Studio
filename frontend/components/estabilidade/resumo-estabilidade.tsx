import { AlertTriangle, Database, HardDrive, ShieldCheck } from "lucide-react";

import type { StatusEstabilidade } from "@/types/estabilidade";

function tamanho(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

export function ResumoEstabilidade({ status }: { status: StatusEstabilidade | null }) {
  const cards = [
    {
      titulo: "Estado do runtime",
      valor: status?.modoSeguro ? "Modo seguro" : "Operação normal",
      detalhe: status?.mensagem ?? "Carregando o estado nativo.",
      icone: ShieldCheck,
      ok: !status?.modoSeguro,
    },
    {
      titulo: "SQLite",
      valor: status?.bancoIntegro ? "Íntegro" : "Requer reparo",
      detalhe: status?.caminhoBanco ?? "Banco ainda não consultado.",
      icone: Database,
      ok: Boolean(status?.bancoIntegro),
    },
    {
      titulo: "Incidentes em 24h",
      valor: String(status?.incidentes24h ?? 0),
      detalhe: `${status?.falhasConsecutivas ?? 0} encerramento(s) inesperado(s) consecutivo(s)`,
      icone: AlertTriangle,
      ok: (status?.incidentes24h ?? 0) === 0,
    },
    {
      titulo: "Caches gerenciados",
      valor: tamanho(status?.cacheBytes ?? 0),
      detalhe: "Somente pastas aprovadas para limpeza segura",
      icone: HardDrive,
      ok: (status?.cacheBytes ?? 0) < 10 * 1024 ** 3,
    },
  ];

  return (
    <section className="grid grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icone = card.icone;
        return (
          <article key={card.titulo} className="rounded-md border border-[#e0e6e5] bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-medium text-[#838c8d]">{card.titulo}</span>
              <Icone className={`size-3.5 ${card.ok ? "text-[#27806d]" : "text-[#9a6546]"}`} />
            </div>
            <strong className="mt-2 block text-[14px] tracking-[-0.025em] text-[#303738]">
              {card.valor}
            </strong>
            <span className="mt-1 line-clamp-2 block text-[7.5px] leading-4 text-[#8a9293]">
              {card.detalhe}
            </span>
          </article>
        );
      })}
    </section>
  );
}

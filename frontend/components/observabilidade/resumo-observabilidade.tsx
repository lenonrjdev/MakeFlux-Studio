
import { AlertTriangle, Database, Link2, ShieldAlert } from "lucide-react";

import type { ResumoObservabilidade } from "@/types/observabilidade";

function formatarBytes(bytes: number) {
  if (!bytes) return "0 KB";
  const unidades = ["B", "KB", "MB", "GB"];
  const indice = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), unidades.length - 1);
  return `${(bytes / 1024 ** indice).toFixed(indice === 0 ? 0 : 1)} ${unidades[indice]}`;
}

export function ResumoObservabilidade({ resumo }: { resumo: ResumoObservabilidade | null }) {
  const itens = [
    { titulo: "Registros", valor: String(resumo?.totalLogs ?? 0), detalhe: formatarBytes(resumo?.tamanhoAproximadoBytes ?? 0), icone: Database },
    { titulo: "Erros em 24h", valor: String(resumo?.erros24h ?? 0), detalhe: resumo?.ultimoErroEm ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(resumo.ultimoErroEm)) : "Nenhum erro recente", icone: ShieldAlert },
    { titulo: "Avisos em 24h", valor: String(resumo?.avisos24h ?? 0), detalhe: "Eventos que pedem atenção", icone: AlertTriangle },
    { titulo: "Correlações", valor: String(resumo?.correlacoes24h ?? 0), detalhe: `Retenção de ${resumo?.retencaoDias ?? 30} dias`, icone: Link2 },
  ];
  return <section className="grid grid-cols-4 gap-3">{itens.map((item) => <article key={item.titulo} className="rounded-md border border-[#e2e7e6] bg-white p-3.5"><div className="flex items-center gap-2 text-[8px] font-medium uppercase tracking-[0.08em] text-[#8a9392]"><item.icone className="size-3.5 text-[#268a76]" />{item.titulo}</div><strong className="mt-2 block text-[13px] font-semibold text-[#303737]">{item.valor}</strong><span className="mt-1 block truncate text-[7.5px] text-[#929a99]">{item.detalhe}</span></article>)}</section>;
}

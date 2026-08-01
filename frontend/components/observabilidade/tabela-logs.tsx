
import { AlertCircle, AlertTriangle, Bug, Info } from "lucide-react";

import type { LogEstruturado } from "@/types/observabilidade";

const apresentacao = {
  debug: { icone: Bug, classe: "bg-[#f0f2f2] text-[#697271]", rotulo: "Debug" },
  info: { icone: Info, classe: "bg-[#e9f4f1] text-[#267d6b]", rotulo: "Info" },
  aviso: { icone: AlertTriangle, classe: "bg-[#fbf4e8] text-[#9a6a2f]", rotulo: "Aviso" },
  erro: { icone: AlertCircle, classe: "bg-[#f9ecec] text-[#a84e4e]", rotulo: "Erro" },
} as const;

function formatarData(valor: number) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "medium" }).format(new Date(valor));
}

export function TabelaLogs({ logs, selecionadoId, carregando, aoSelecionar }: { logs: LogEstruturado[]; selecionadoId: string | null; carregando: boolean; aoSelecionar: (id: string) => void }) {
  if (carregando && logs.length === 0) return <div className="grid min-h-[380px] place-items-center bg-white text-[9px] text-[#8a9392]">Carregando registros técnicos...</div>;
  if (logs.length === 0) return <div className="grid min-h-[380px] place-items-center bg-white text-center"><div><strong className="text-[11px] text-[#4a5352]">Nenhum registro encontrado</strong><p className="mt-1 text-[8px] text-[#909897]">Ajuste os filtros ou registre um evento de teste.</p></div></div>;
  return (
    <div className="max-h-[560px] overflow-auto bg-white">
      <table className="w-full border-collapse text-left">
        <thead className="sticky top-0 z-10 bg-[#f7f9f8] text-[7.5px] font-medium uppercase tracking-[0.08em] text-[#8a9392]"><tr><th className="px-3 py-2.5">Nível</th><th className="px-3 py-2.5">Evento</th><th className="px-3 py-2.5">Origem</th><th className="px-3 py-2.5">Correlação</th><th className="px-3 py-2.5 text-right">Data</th></tr></thead>
        <tbody>{logs.map((log) => { const item = apresentacao[log.nivel]; const Icone = item.icone; const ativo = log.id === selecionadoId; return <tr key={log.id} onClick={() => aoSelecionar(log.id)} className={`cursor-pointer border-t border-[#edf0ef] text-[8.5px] transition ${ativo ? "bg-[#edf7f4]" : "hover:bg-[#f8faf9]"}`}><td className="px-3 py-2.5"><span className={`inline-flex items-center gap-1 rounded px-1.5 py-1 ${item.classe}`}><Icone className="size-3" />{item.rotulo}</span></td><td className="max-w-[340px] px-3 py-2.5"><strong className="block truncate font-medium text-[#3b4443]">{log.evento}</strong><span className="mt-0.5 block truncate text-[#899190]">{log.mensagem}</span></td><td className="px-3 py-2.5 text-[#65706e]">{log.origem}</td><td className="max-w-[180px] px-3 py-2.5 font-mono text-[7.5px] text-[#6e7876]"><span className="block truncate">{log.correlacaoId}</span></td><td className="whitespace-nowrap px-3 py-2.5 text-right text-[#7f8987]">{formatarData(log.criadoEm)}</td></tr>; })}</tbody>
      </table>
    </div>
  );
}

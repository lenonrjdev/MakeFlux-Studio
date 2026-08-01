import { CheckCircle2, CircleAlert, History, Trash2 } from "lucide-react";

import { Botao } from "@/components/ui/botao";
import type { RegistroHistoricoAtualizador } from "@/types/atualizador";

export function HistoricoAtualizacoes({ historico, aoLimpar }: { historico: RegistroHistoricoAtualizador[]; aoLimpar: () => void }) {
  return (
    <section className="rounded-md border border-[#e1e7e6] bg-white p-4">
      <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-[10px] font-semibold text-[#303737]"><History className="size-3.5 text-[#278a76]" /> Histórico local</div><Botao variante="fantasma" className="h-7 px-2 text-[8px]" disabled={!historico.length} onClick={aoLimpar}><Trash2 className="size-3" /> Limpar</Botao></div>
      <div className="mt-3 max-h-[330px] space-y-2 overflow-y-auto pr-1">
        {!historico.length && <div className="rounded-md bg-[#f7f9f9] px-3 py-5 text-center text-[8px] text-[#899190]">Nenhuma operação registrada.</div>}
        {historico.map((item) => <div key={item.id} className="flex items-start gap-2 rounded-md border border-[#edf0f0] px-3 py-2.5">{item.resultado === "sucesso" ? <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-[#278a76]" /> : <CircleAlert className={`mt-0.5 size-3.5 shrink-0 ${item.resultado === "erro" ? "text-[#bf5b50]" : "text-[#a67a35]"}`} />}<div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><strong className="truncate text-[8px] capitalize text-[#3b4242]">{item.operacao}{item.versao ? ` · ${item.versao}` : ""}</strong><span className="shrink-0 text-[6.5px] text-[#a0a7a6]">{new Date(item.criadoEm).toLocaleString("pt-BR")}</span></div><p className="mt-1 text-[7.5px] leading-4 text-[#7a8382]">{item.mensagem}</p></div></div>)}
      </div>
    </section>
  );
}

import { Activity, CheckCircle2, CircleAlert, CircleX, ExternalLink, LoaderCircle, Play } from "lucide-react";
import Link from "next/link";

import { Botao } from "@/components/ui/botao";
import type { ResultadoDiagnostico, StatusDiagnostico } from "@/types/ajuda";

const estilos: Record<StatusDiagnostico, { texto: string; classe: string; icone: typeof Activity }> = {
  aguardando: { texto: "Aguardando", classe: "border-[#e0e4e4] bg-[#f7f8f8] text-[#6f7778]", icone: Activity },
  verificando: { texto: "Verificando", classe: "border-[#cddfe7] bg-[#f0f7fa] text-[#3d7890]", icone: LoaderCircle },
  aprovado: { texto: "Aprovado", classe: "border-[#cbe5de] bg-[#edf8f5] text-[#17715f]", icone: CheckCircle2 },
  atencao: { texto: "Atenção", classe: "border-[#eadbcf] bg-[#fbf5f0] text-[#9d6034]", icone: CircleAlert },
  erro: { texto: "Erro", classe: "border-[#eccdcd] bg-[#fff3f3] text-[#a84e4e]", icone: CircleX },
};

export function PainelDiagnostico({ resultado, diagnosticando, aoExecutar }: { resultado: ResultadoDiagnostico | null; diagnosticando: boolean; aoExecutar: () => void }) {
  return (
    <section className="rounded-md border border-[#e2e7e6] bg-white">
      <header className="flex items-start justify-between gap-5 border-b border-[#edf0f0] px-5 py-4">
        <div>
          <h2 className="text-[12px] font-semibold text-[#252a2b]">Diagnóstico do ambiente</h2>
          <p className="mt-1 max-w-[650px] text-[9.5px] leading-4 text-[#8b9293]">Verifica a integridade do workspace, armazenamento, integrações, runtime desktop e recursos de segurança. Nenhuma credencial é enviada.</p>
        </div>
        <Botao variante="primario" disabled={diagnosticando} onClick={aoExecutar}>
          {diagnosticando ? <LoaderCircle className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
          {diagnosticando ? "Verificando..." : resultado ? "Executar novamente" : "Executar diagnóstico"}
        </Botao>
      </header>
      {diagnosticando && !resultado ? (
        <div className="space-y-3 p-5">
          {[1, 2, 3, 4, 5].map((item) => <div key={item} className="h-[64px] animate-pulse rounded-md bg-[#f2f5f4]" />)}
        </div>
      ) : !resultado ? (
        <div className="px-5 py-14 text-center">
          <Activity className="mx-auto size-8 text-[#aeb6b5]" />
          <h3 className="mt-3 text-[11px] font-semibold text-[#555e5f]">Nenhum diagnóstico executado</h3>
          <p className="mt-1 text-[9px] text-[#949c9d]">A verificação acontece somente neste computador.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 border-b border-[#edf0f0] bg-[#fbfcfc]">
            <div className="px-4 py-3"><p className="text-[8px] uppercase tracking-[0.05em] text-[#969d9e]">Estado geral</p><p className="mt-1 text-[11px] font-semibold capitalize text-[#303637]">{resultado.statusGeral}</p></div>
            <div className="border-l border-[#edf0f0] px-4 py-3"><p className="text-[8px] uppercase tracking-[0.05em] text-[#969d9e]">Aprovados</p><p className="mt-1 text-[11px] font-semibold text-[#27806d]">{resultado.resumo.aprovados}</p></div>
            <div className="border-l border-[#edf0f0] px-4 py-3"><p className="text-[8px] uppercase tracking-[0.05em] text-[#969d9e]">Atenções</p><p className="mt-1 text-[11px] font-semibold text-[#9b6937]">{resultado.resumo.atencoes}</p></div>
            <div className="border-l border-[#edf0f0] px-4 py-3"><p className="text-[8px] uppercase tracking-[0.05em] text-[#969d9e]">Executado</p><p className="mt-1 text-[9.5px] font-medium text-[#4e5657]">{new Date(resultado.executadoEm).toLocaleString("pt-BR")}</p></div>
          </div>
          <div className="divide-y divide-[#edf0f0]">
            {resultado.itens.map((registro) => {
              const estilo = estilos[registro.status];
              const Icone = estilo.icone;
              return (
                <div key={registro.id} className="flex items-start gap-3 px-5 py-3.5">
                  <span className={`flex size-8 shrink-0 items-center justify-center rounded-md border ${estilo.classe}`}><Icone className={`size-4 ${registro.status === "verificando" ? "animate-spin" : ""}`} /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2"><h3 className="text-[10px] font-semibold text-[#343a3b]">{registro.titulo}</h3><span className={`rounded-md border px-1.5 py-0.5 text-[7.5px] font-semibold uppercase ${estilo.classe}`}>{estilo.texto}</span></div>
                    <p className="mt-1 text-[8.5px] text-[#92999a]">{registro.descricao}</p>
                    <p className="mt-1 text-[9px] leading-4 text-[#697172]">{registro.detalhes}</p>
                  </div>
                  {registro.rotaCorrecao && <Link href={registro.rotaCorrecao} className="flex h-8 items-center gap-1.5 rounded-md border border-[#e0e5e4] px-2.5 text-[8.5px] font-medium text-[#5f6869] hover:bg-[#f7f9f9]">Corrigir <ExternalLink className="size-3" /></Link>}
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

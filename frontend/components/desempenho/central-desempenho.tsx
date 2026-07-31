"use client";

import { AlertTriangle } from "lucide-react";

import { conteudoDesempenho } from "@/content/desempenho";
import { useDesempenhoNativo } from "@/hooks/use-desempenho-nativo";
import { emAmbienteTauri } from "@/lib/runtime-nativo";

import { CabecalhoDesempenho } from "./cabecalho-desempenho";
import { ExploradorRegistros } from "./explorador-registros";
import { PainelManutencaoBanco } from "./painel-manutencao-banco";
import { PainelMetricasBanco } from "./painel-metricas-banco";
import { PainelOperacoesLote } from "./painel-operacoes-lote";
import { ResumoDesempenho } from "./resumo-desempenho";

export function CentralDesempenho() {
  const desempenho = useDesempenhoNativo();
  return (
    <div className="min-h-[calc(100vh-62px)] bg-[#f7f8f9]">
      <CabecalhoDesempenho />
      <div className="space-y-4 px-8 py-5">
        {!emAmbienteTauri() && <div className="rounded-md border border-[#eadfca] bg-[#fbf7ef] px-4 py-3 text-[9px] leading-5 text-[#866d46]">{conteudoDesempenho.avisoWeb}</div>}
        {desempenho.erro && <div className="flex items-start gap-2 rounded-md border border-[#ebd5d5] bg-[#fbf5f5] px-4 py-3 text-[9px] text-[#9a4d4d]"><AlertTriangle className="mt-0.5 size-3.5 shrink-0" />{desempenho.erro}</div>}
        <ResumoDesempenho status={desempenho.status} metricas={desempenho.metricas} />
        <div className="grid grid-cols-[minmax(0,1.55fr)_340px] items-start gap-4">
          <ExploradorRegistros pagina={desempenho.pagina} carregando={desempenho.carregando} aoConsultar={desempenho.consultar} />
          <div className="space-y-4"><PainelMetricasBanco status={desempenho.status} /><PainelManutencaoBanco status={desempenho.status} aoExecutar={desempenho.executarManutencao} /></div>
        </div>
        <PainelOperacoesLote operacoes={desempenho.operacoes} aoIniciar={desempenho.iniciarLote} aoCancelar={desempenho.cancelarLote} />
      </div>
    </div>
  );
}

"use client";

import { AlertTriangle } from "lucide-react";

import { useCanaisPublicacao } from "@/hooks/use-canais-publicacao";
import { useDistribuicaoRobusta } from "@/hooks/use-distribuicao-robusta";
import { emAmbienteTauri } from "@/lib/runtime-nativo";

import { CabecalhoDistribuicao } from "./cabecalho-distribuicao";
import { PainelArmazenamentoTemporario } from "./painel-armazenamento-temporario";
import { PainelAtivosTemporarios } from "./painel-ativos-temporarios";
import { PainelFilaPublicacao } from "./painel-fila-publicacao";
import { PainelSaudeTokens } from "./painel-saude-tokens";
import { ResumoDistribuicao } from "./resumo-distribuicao";

export function CentralDistribuicaoRobusta() {
  const distribuicao = useDistribuicaoRobusta();
  const canais = useCanaisPublicacao();
  const filaAtiva = canais.envios.filter((item) => !["publicada", "falha", "cancelada", "interrompida"].includes(item.status)).length;

  return (
    <div className="min-h-[calc(100vh-62px)] bg-[#f7f8f9]">
      <CabecalhoDistribuicao filaAtiva={filaAtiva} />
      <div className="space-y-4 px-8 py-5">
        {!emAmbienteTauri() && <div className="flex items-start gap-2 rounded-md border border-[#eadfc7] bg-[#fff9ec] px-3 py-2.5 text-[8px] leading-4 text-[#80642e]"><AlertTriangle className="mt-0.5 size-3.5 shrink-0" /> Armazenamento, tokens e uploads em blocos exigem o aplicativo desktop.</div>}
        <ResumoDistribuicao configuracao={distribuicao.configuracao} ativos={distribuicao.ativos} envios={canais.envios} />
        <div className="grid grid-cols-[minmax(0,1.15fr)_minmax(360px,.85fr)] items-start gap-4">
          {distribuicao.configuracao ? <PainelArmazenamentoTemporario configuracao={distribuicao.configuracao} aoSalvar={distribuicao.salvar} aoTestar={distribuicao.testar} /> : <div className="h-64 animate-pulse rounded-md border border-[#e0e6e5] bg-white" />}
          <PainelSaudeTokens conexoes={canais.conexoes} aoRenovar={canais.renovarToken} />
        </div>
        <div className="grid grid-cols-[minmax(0,1.25fr)_minmax(330px,.75fr)] items-start gap-4">
          <PainelFilaPublicacao envios={canais.envios} aoCancelar={canais.cancelarEnvio} aoRepetir={canais.repetirEnvio} />
          <PainelAtivosTemporarios ativos={distribuicao.ativos} aoRemover={distribuicao.remover} aoLimpar={distribuicao.limpar} />
        </div>
      </div>
    </div>
  );
}

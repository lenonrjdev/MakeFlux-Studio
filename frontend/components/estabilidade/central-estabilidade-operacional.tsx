"use client";

import { AlertTriangle, Info } from "lucide-react";

import { conteudoEstabilidade } from "@/content/estabilidade";
import { useEstabilidadeOperacional } from "@/hooks/use-estabilidade-operacional";
import { emAmbienteTauri } from "@/lib/runtime-nativo";

import { CabecalhoEstabilidade } from "./cabecalho-estabilidade";
import { PainelIncidentesEstabilidade } from "./painel-incidentes-estabilidade";
import { PainelModoSeguro } from "./painel-modo-seguro";
import { PainelRecuperacaoEstabilidade } from "./painel-recuperacao-estabilidade";
import { PainelValidacaoEstabilidade } from "./painel-validacao-estabilidade";
import { ResumoEstabilidade } from "./resumo-estabilidade";

export function CentralEstabilidadeOperacional() {
  const estabilidade = useEstabilidadeOperacional();
  return (
    <div className="min-h-[calc(100vh-62px)] bg-[#f3f5f6]">
      <CabecalhoEstabilidade
        carregando={estabilidade.operacao === "recarregar"}
        aoAtualizar={() => void estabilidade.recarregar()}
      />
      <div className="space-y-4 px-8 py-5">
        {!emAmbienteTauri() && (
          <div className="flex items-start gap-2 rounded-md border border-[#eadfca] bg-[#fffaf0] px-4 py-3 text-[9px] leading-5 text-[#866d46]">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            {conteudoEstabilidade.avisoWeb}
          </div>
        )}
        {estabilidade.erro && (
          <div className="flex items-start gap-2 rounded-md border border-[#ebd5d5] bg-[#fbf5f5] px-4 py-3 text-[9px] text-[#9a4d4d]">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            {estabilidade.erro}
          </div>
        )}
        <ResumoEstabilidade status={estabilidade.status} />
        <div className="grid grid-cols-[minmax(0,1.15fr)_minmax(360px,.85fr)] items-start gap-4">
          <PainelValidacaoEstabilidade
            validacao={estabilidade.validacao}
            operacao={estabilidade.operacao}
            aoValidar={() => void estabilidade.validar()}
          />
          <div className="space-y-4">
            <PainelModoSeguro
              status={estabilidade.status}
              operacao={estabilidade.operacao}
              aoAlternar={(ativo) => void estabilidade.alternarModoSeguro(ativo)}
            />
            <PainelRecuperacaoEstabilidade
              operacao={estabilidade.operacao}
              reparo={estabilidade.reparo}
              limpeza={estabilidade.limpeza}
              relatorio={estabilidade.relatorio}
              aoReparar={() => void estabilidade.reparar()}
              aoLimpar={(dias) => void estabilidade.limparCache(dias)}
              aoExportar={() => void estabilidade.exportar()}
              aoRevelar={(caminho) => void estabilidade.revelar(caminho)}
            />
          </div>
        </div>
        <PainelIncidentesEstabilidade
          incidentes={estabilidade.incidentes}
          operacao={estabilidade.operacao}
          aoRecuperar={(id) => void estabilidade.marcarRecuperado(id)}
        />
        <div className="rounded-md border border-[#dce8e4] bg-[#f5faf8] px-4 py-3 text-[8px] leading-4 text-[#426d63]">
          {conteudoEstabilidade.notaSeguranca}
        </div>
      </div>
    </div>
  );
}

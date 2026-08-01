"use client";

import { AlertTriangle, Info } from "lucide-react";

import { conteudoBeta } from "@/content/beta";
import { useBetaOperacional } from "@/hooks/use-beta-operacional";
import { emAmbienteTauri } from "@/lib/runtime-nativo";

import { CabecalhoBeta } from "./cabecalho-beta";
import { PainelArtefatosBeta } from "./painel-artefatos-beta";
import { PainelChecklistBeta } from "./painel-checklist-beta";
import { PainelPortoesBeta } from "./painel-portoes-beta";
import { PainelSessaoBeta } from "./painel-sessao-beta";
import { ResumoBeta } from "./resumo-beta";

export function CentralBetaOperacional() {
  const beta = useBetaOperacional();
  const painel = beta.painel;
  return <div className="min-h-[calc(100vh-62px)] bg-[#f3f5f6]"><CabecalhoBeta score={painel?.score ?? 0} carregando={beta.operacao === "recarregar"} aoAtualizar={() => void beta.recarregar()} /><div className="space-y-4 px-8 py-5">{!emAmbienteTauri() && <div className="flex items-start gap-2 rounded-md border border-[#eadfca] bg-[#fffaf0] px-4 py-3 text-[9px] leading-5 text-[#866d46]"><Info className="mt-0.5 size-3.5 shrink-0" />{conteudoBeta.avisoWeb}</div>}{beta.erro && <div className="flex items-start gap-2 rounded-md border border-[#ebd5d5] bg-[#fbf5f5] px-4 py-3 text-[9px] text-[#9a4d4d]"><AlertTriangle className="mt-0.5 size-3.5 shrink-0" />{beta.erro}</div>}<ResumoBeta painel={painel} /><div className="grid grid-cols-[minmax(0,1.1fr)_minmax(360px,.9fr)] items-start gap-4"><PainelPortoesBeta portoes={painel?.portoes ?? []} /><div className="space-y-4"><PainelSessaoBeta sessao={painel?.sessao ?? null} operacao={beta.operacao} apto={Boolean(painel?.apto)} aoIniciar={beta.iniciar} aoFinalizar={beta.finalizar} /><PainelArtefatosBeta artefato={beta.ultimoArtefato} operacao={beta.operacao} sessaoAtiva={Boolean(painel?.sessao)} aoSnapshot={beta.snapshot} aoExportar={beta.exportar} aoRevelar={beta.revelar} /></div></div><PainelChecklistBeta itens={painel?.checklist ?? []} operacao={beta.operacao} aoAtualizar={beta.atualizarCheck} /><div className="rounded-md border border-[#dce8e4] bg-[#f5faf8] px-4 py-3 text-[8px] leading-4 text-[#426d63]">{conteudoBeta.orientacao}</div></div></div>;
}

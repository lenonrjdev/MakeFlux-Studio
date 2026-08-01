
"use client";

import { AlertTriangle } from "lucide-react";

import { conteudoObservabilidade } from "@/content/observabilidade";
import { useObservabilidadeNativa } from "@/hooks/use-observabilidade-nativa";
import { emAmbienteTauri } from "@/lib/runtime-nativo";

import { BarraFiltrosLogs } from "./barra-filtros-logs";
import { CabecalhoObservabilidade } from "./cabecalho-observabilidade";
import { PainelCorrelacoes } from "./painel-correlacoes";
import { PainelDetalhesLog } from "./painel-detalhes-log";
import { PainelRetencaoExportacao } from "./painel-retencao-exportacao";
import { ResumoObservabilidade } from "./resumo-observabilidade";
import { TabelaLogs } from "./tabela-logs";

export function CentralObservabilidade() {
  const observabilidade = useObservabilidadeNativa();
  return <div className="min-h-[calc(100vh-62px)] bg-[#f3f5f6]"><CabecalhoObservabilidade aoAtualizar={() => void observabilidade.recarregar()} aoTestar={observabilidade.registrarTeste} /><div className="space-y-4 px-8 py-5">{!emAmbienteTauri() && <div className="rounded-md border border-[#eadfca] bg-[#fbf7ef] px-4 py-3 text-[9px] leading-5 text-[#866d46]">{conteudoObservabilidade.avisoWeb}</div>}{observabilidade.erro && <div className="flex items-start gap-2 rounded-md border border-[#ebd5d5] bg-[#fbf5f5] px-4 py-3 text-[9px] text-[#9a4d4d]"><AlertTriangle className="mt-0.5 size-3.5 shrink-0" />{observabilidade.erro}</div>}<ResumoObservabilidade resumo={observabilidade.resumo} /><div className="grid grid-cols-[minmax(0,1.55fr)_340px] items-start gap-4"><section className="overflow-hidden rounded-md border border-[#e1e7e6] bg-white"><BarraFiltrosLogs filtros={observabilidade.filtros} aoAlterar={observabilidade.alterarFiltros} /><TabelaLogs logs={observabilidade.logs} selecionadoId={observabilidade.selecionado?.id ?? null} carregando={observabilidade.carregando} aoSelecionar={observabilidade.selecionar} /></section><div className="space-y-4"><PainelDetalhesLog log={observabilidade.selecionado} /><PainelCorrelacoes correlacoes={observabilidade.correlacoes} aoFiltrar={(id) => observabilidade.alterarFiltros({ ...observabilidade.filtros, correlacaoId: id })} /><PainelRetencaoExportacao exportacao={observabilidade.exportacao} aoLimpar={observabilidade.limpar} aoExportar={observabilidade.exportar} aoRevelar={observabilidade.revelar} /></div></div></div></div>;
}

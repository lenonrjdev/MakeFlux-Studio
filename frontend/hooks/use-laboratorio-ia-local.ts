"use client";

import { useCallback, useEffect, useState } from "react";

import {
  aplicarPresetLaboratorioIaLocal, atualizarExperimentoLaboratorioIaLocal, carregarWorkspaceLaboratorioIa,
  concluirExperimentoLaboratorioIaRealLocal, criarConfiguracaoExperimentoPadrao, criarExperimentoLaboratorioIaLocal,
  duplicarExperimentoLaboratorioIaLocal, EVENTO_WORKSPACE_LABORATORIO_IA, executarExperimentoLaboratorioIaLocal,
  excluirExperimentoLaboratorioIaLocal, marcarExperimentoErroLocal, marcarExperimentoProcessandoLocal,
  prepararTransferenciaLaboratorioParaEstudio, registrarRequisicaoExperimentoLocal, salvarExperimentoComoPresetLocal,
  selecionarMelhorResultadoLaboratorioIaLocal, alternarFavoritoPresetLaboratorioIaLocal,
} from "@/lib/laboratorio-ia-local";
import { cancelarExecucaoIa, executarExperimentoIaReal } from "@/lib/provedores-ia-nativos";
import { emAmbienteTauri } from "@/lib/runtime-nativo";
import type { ConfiguracaoNovoExperimento, PresetPromptLaboratorio, TipoFerramentaLaboratorio, WorkspaceLaboratorioIa } from "@/types/laboratorio-ia";

const workspaceVazio: WorkspaceLaboratorioIa = { versao: 2, experimentos: [], presets: [] };
function criarRequisicaoId() { return `req-ia-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`; }

export function useLaboratorioIaLocal() {
  const [workspace, setWorkspace] = useState<WorkspaceLaboratorioIa>(workspaceVazio);
  const [carregado, setCarregado] = useState(false);
  const [executandoId, setExecutandoId] = useState<string | null>(null);
  const [requisicaoAtivaId, setRequisicaoAtivaId] = useState<string | null>(null);
  const [ultimoErro, setUltimoErro] = useState<string | null>(null);
  const recarregar = useCallback(() => { setWorkspace(carregarWorkspaceLaboratorioIa()); setCarregado(true); }, []);
  useEffect(() => { const temporizador=window.setTimeout(recarregar,0); window.addEventListener(EVENTO_WORKSPACE_LABORATORIO_IA,recarregar); window.addEventListener("storage",recarregar); return()=>{window.clearTimeout(temporizador);window.removeEventListener(EVENTO_WORKSPACE_LABORATORIO_IA,recarregar);window.removeEventListener("storage",recarregar);}; },[recarregar]);

  const executar = useCallback(async (id: string) => {
    const experimento = carregarWorkspaceLaboratorioIa().experimentos.find((item) => item.id === id);
    if (!experimento) return null;
    setUltimoErro(null); setExecutandoId(id); marcarExperimentoProcessandoLocal(id);
    if (experimento.modoExecucao === "demonstracao" || !emAmbienteTauri()) {
      await new Promise<void>((resolve) => window.setTimeout(resolve, 700));
      const resultado = executarExperimentoLaboratorioIaLocal(id); setExecutandoId(null); return resultado;
    }
    const requisicaoId=criarRequisicaoId(); setRequisicaoAtivaId(requisicaoId); registrarRequisicaoExperimentoLocal(id,requisicaoId);
    try {
      const execucao=await executarExperimentoIaReal({ requisicaoId, experimentoId:id, tipo:experimento.tipo, tema:experimento.tema,
        publico:experimento.publico, plataforma:experimento.plataforma, idioma:experimento.idioma,
        promptSistema:experimento.promptSistema, promptUsuario:experimento.promptUsuario,
        quantidadeVariacoes:experimento.quantidadeVariacoes, temperatura:experimento.temperatura,
        maxTokensSaida:experimento.maxTokensSaida,
        provedorPreferido:experimento.provedorPreferido === "automatico" ? null : experimento.provedorPreferido,
        permitirFallback:experimento.permitirFallback });
      return concluirExperimentoLaboratorioIaRealLocal(id,execucao);
    } catch (causa) {
      const mensagem=causa instanceof Error ? causa.message : String(causa); setUltimoErro(mensagem); marcarExperimentoErroLocal(id,mensagem); return null;
    } finally { setExecutandoId(null); setRequisicaoAtivaId(null); }
  },[]);

  const cancelar = useCallback(async () => { if (!requisicaoAtivaId) return false; return cancelarExecucaoIa(requisicaoAtivaId); },[requisicaoAtivaId]);
  return { workspace, experimentos:workspace.experimentos, presets:workspace.presets, carregado, executandoId, requisicaoAtivaId, ultimoErro,
    criar:useCallback((tipo?:TipoFerramentaLaboratorio)=>criarExperimentoLaboratorioIaLocal(criarConfiguracaoExperimentoPadrao(tipo)),[]),
    atualizar:useCallback((id:string,alteracoes:Partial<ConfiguracaoNovoExperimento>)=>atualizarExperimentoLaboratorioIaLocal(id,alteracoes),[]),
    executar,cancelar,
    selecionarMelhor:useCallback((experimentoId:string,resultadoId:string)=>selecionarMelhorResultadoLaboratorioIaLocal(experimentoId,resultadoId),[]),
    duplicar:useCallback((id:string)=>duplicarExperimentoLaboratorioIaLocal(id),[]), excluir:useCallback((id:string)=>excluirExperimentoLaboratorioIaLocal(id),[]),
    aplicarPreset:useCallback((experimentoId:string,preset:PresetPromptLaboratorio)=>aplicarPresetLaboratorioIaLocal(experimentoId,preset),[]),
    alternarFavoritoPreset:useCallback((id:string)=>alternarFavoritoPresetLaboratorioIaLocal(id),[]),
    salvarComoPreset:useCallback((experimentoId:string)=>salvarExperimentoComoPresetLocal(experimentoId),[]),
    prepararParaEstudio:useCallback((experimentoId:string,resultadoId:string)=>prepararTransferenciaLaboratorioParaEstudio(experimentoId,resultadoId),[]),
  };
}

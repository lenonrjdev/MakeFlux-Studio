"use client";

import { useCallback, useEffect, useState } from "react";

import {
  aplicarPresetLaboratorioIaLocal,
  atualizarExperimentoLaboratorioIaLocal,
  carregarWorkspaceLaboratorioIa,
  criarConfiguracaoExperimentoPadrao,
  criarExperimentoLaboratorioIaLocal,
  duplicarExperimentoLaboratorioIaLocal,
  EVENTO_WORKSPACE_LABORATORIO_IA,
  executarExperimentoLaboratorioIaLocal,
  excluirExperimentoLaboratorioIaLocal,
  marcarExperimentoProcessandoLocal,
  prepararTransferenciaLaboratorioParaEstudio,
  salvarExperimentoComoPresetLocal,
  selecionarMelhorResultadoLaboratorioIaLocal,
  alternarFavoritoPresetLaboratorioIaLocal,
} from "@/lib/laboratorio-ia-local";
import type {
  ConfiguracaoNovoExperimento,
  PresetPromptLaboratorio,
  TipoFerramentaLaboratorio,
  WorkspaceLaboratorioIa,
} from "@/types/laboratorio-ia";

const workspaceVazio: WorkspaceLaboratorioIa = { versao: 1, experimentos: [], presets: [] };

export function useLaboratorioIaLocal() {
  const [workspace, setWorkspace] = useState<WorkspaceLaboratorioIa>(workspaceVazio);
  const [carregado, setCarregado] = useState(false);
  const [executandoId, setExecutandoId] = useState<string | null>(null);

  const recarregar = useCallback(() => {
    setWorkspace(carregarWorkspaceLaboratorioIa());
    setCarregado(true);
  }, []);

  useEffect(() => {
    const temporizadorInicial = window.setTimeout(recarregar, 0);
    window.addEventListener(EVENTO_WORKSPACE_LABORATORIO_IA, recarregar);
    window.addEventListener("storage", recarregar);
    return () => {
      window.clearTimeout(temporizadorInicial);
      window.removeEventListener(EVENTO_WORKSPACE_LABORATORIO_IA, recarregar);
      window.removeEventListener("storage", recarregar);
    };
  }, [recarregar]);

  const executar = useCallback((id: string) => {
    marcarExperimentoProcessandoLocal(id);
    setExecutandoId(id);
    window.setTimeout(() => {
      executarExperimentoLaboratorioIaLocal(id);
      setExecutandoId((atual) => (atual === id ? null : atual));
    }, 900);
  }, []);

  return {
    workspace,
    experimentos: workspace.experimentos,
    presets: workspace.presets,
    carregado,
    executandoId,
    criar: useCallback((tipo?: TipoFerramentaLaboratorio) => {
      return criarExperimentoLaboratorioIaLocal(criarConfiguracaoExperimentoPadrao(tipo));
    }, []),
    atualizar: useCallback(
      (id: string, alteracoes: Partial<ConfiguracaoNovoExperimento>) =>
        atualizarExperimentoLaboratorioIaLocal(id, alteracoes),
      [],
    ),
    executar,
    selecionarMelhor: useCallback(
      (experimentoId: string, resultadoId: string) =>
        selecionarMelhorResultadoLaboratorioIaLocal(experimentoId, resultadoId),
      [],
    ),
    duplicar: useCallback((id: string) => duplicarExperimentoLaboratorioIaLocal(id), []),
    excluir: useCallback((id: string) => excluirExperimentoLaboratorioIaLocal(id), []),
    aplicarPreset: useCallback(
      (experimentoId: string, preset: PresetPromptLaboratorio) =>
        aplicarPresetLaboratorioIaLocal(experimentoId, preset),
      [],
    ),
    alternarFavoritoPreset: useCallback(
      (id: string) => alternarFavoritoPresetLaboratorioIaLocal(id),
      [],
    ),
    salvarComoPreset: useCallback(
      (experimentoId: string) => salvarExperimentoComoPresetLocal(experimentoId),
      [],
    ),
    prepararParaEstudio: useCallback(
      (experimentoId: string, resultadoId: string) =>
        prepararTransferenciaLaboratorioParaEstudio(experimentoId, resultadoId),
      [],
    ),
  };
}

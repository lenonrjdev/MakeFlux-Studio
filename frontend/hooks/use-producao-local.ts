"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  avancarSimulacaoProducaoLocal,
  alterarPrioridadeTarefaProducaoLocal,
  alternarFilaProducaoLocal,
  cancelarTarefaProducaoLocal,
  carregarWorkspaceProducao,
  duplicarTarefaProducaoLocal,
  EVENTO_WORKSPACE_PRODUCAO,
  excluirTarefaProducaoLocal,
  limparTarefasFinalizadasLocal,
  pausarTarefaProducaoLocal,
  retomarTarefaProducaoLocal,
  simularErroTarefaProducaoLocal,
  tentarNovamenteTarefaProducaoLocal,
} from "@/lib/producao-local";
import type {
  PrioridadeTarefaProducao,
  RecursosSistemaProducao,
  WorkspaceProducao,
} from "@/types/producao";

const workspaceVazio: WorkspaceProducao = { versao: 1, filaPausada: false, tarefas: [] };

export function useProducaoLocal() {
  const [workspace, setWorkspace] = useState<WorkspaceProducao>(workspaceVazio);
  const [carregado, setCarregado] = useState(false);

  const recarregar = useCallback(() => {
    setWorkspace(carregarWorkspaceProducao());
    setCarregado(true);
  }, []);

  useEffect(() => {
    const temporizadorInicial = window.setTimeout(recarregar, 0);
    const temporizadorProducao = window.setInterval(avancarSimulacaoProducaoLocal, 1800);
    window.addEventListener(EVENTO_WORKSPACE_PRODUCAO, recarregar);
    window.addEventListener("storage", recarregar);
    return () => {
      window.clearTimeout(temporizadorInicial);
      window.clearInterval(temporizadorProducao);
      window.removeEventListener(EVENTO_WORKSPACE_PRODUCAO, recarregar);
      window.removeEventListener("storage", recarregar);
    };
  }, [recarregar]);

  const recursos = useMemo<RecursosSistemaProducao>(() => {
    const processando = workspace.tarefas.find((tarefa) => tarefa.status === "processando");
    const fila = workspace.tarefas.filter((tarefa) => tarefa.status === "na-fila").length;
    const fator = processando ? Math.max(processando.progresso, 20) : 0;
    return {
      cpu: processando ? Math.min(88, 38 + Math.round(fator * 0.42)) : fila > 0 ? 18 : 6,
      ram: processando ? 7.6 : fila > 0 ? 4.2 : 2.8,
      ramTotal: 16,
      gpu: processando ? Math.min(96, 52 + Math.round(fator * 0.4)) : 3,
      vram: processando ? 4.8 : 0.7,
      vramTotal: 8,
      disco: processando ? 64 : 12,
      codificador: processando?.codificador ?? "Aguardando tarefa",
      motor: workspace.filaPausada ? "Pausado" : processando ? "Ocupado" : "Pronto",
    };
  }, [workspace]);

  return {
    workspace,
    tarefas: workspace.tarefas,
    filaPausada: workspace.filaPausada,
    recursos,
    carregado,
    alternarFila: useCallback(() => alternarFilaProducaoLocal(), []),
    pausar: useCallback((id: string) => pausarTarefaProducaoLocal(id), []),
    retomar: useCallback((id: string) => retomarTarefaProducaoLocal(id), []),
    cancelar: useCallback((id: string) => cancelarTarefaProducaoLocal(id), []),
    tentarNovamente: useCallback((id: string) => tentarNovamenteTarefaProducaoLocal(id), []),
    duplicar: useCallback((id: string) => duplicarTarefaProducaoLocal(id), []),
    excluir: useCallback((id: string) => excluirTarefaProducaoLocal(id), []),
    limparFinalizadas: useCallback(() => limparTarefasFinalizadasLocal(), []),
    alterarPrioridade: useCallback(
      (id: string, prioridade: PrioridadeTarefaProducao) =>
        alterarPrioridadeTarefaProducaoLocal(id, prioridade),
      [],
    ),
    simularErro: useCallback((id: string) => simularErroTarefaProducaoLocal(id), []),
  };
}

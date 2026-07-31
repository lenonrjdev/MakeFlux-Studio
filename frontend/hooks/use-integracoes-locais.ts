"use client";

import { useCallback, useEffect, useState } from "react";

import {
  alternarIntegracaoAtivaLocal,
  atualizarIntegracaoLocal,
  carregarWorkspaceIntegracoes,
  definirIntegracaoPadraoLocal,
  definirModoProcessamentoLocal,
  EVENTO_WORKSPACE_INTEGRACOES,
  limparCredencialIntegracaoLocal,
  restaurarCatalogoIntegracoesLocal,
  restaurarIntegracaoLocal,
  testarIntegracaoLocal,
  testarTodasIntegracoesLocais,
} from "@/lib/integracoes-local";
import type {
  AtualizacaoIntegracao,
  CapacidadeIntegracao,
  ModoProcessamento,
  WorkspaceIntegracoes,
} from "@/types/integracoes";

const workspaceVazio: WorkspaceIntegracoes = {
  versao: 1,
  modoProcessamento: "hibrido",
  integracoes: [],
  padroes: {},
  ultimoDiagnosticoEm: null,
};

export function useIntegracoesLocais() {
  const [workspace, setWorkspace] = useState<WorkspaceIntegracoes>(workspaceVazio);
  const [carregado, setCarregado] = useState(false);
  const [testandoIds, setTestandoIds] = useState<string[]>([]);
  const [diagnosticandoTudo, setDiagnosticandoTudo] = useState(false);

  const recarregar = useCallback(() => {
    setWorkspace(carregarWorkspaceIntegracoes());
    setCarregado(true);
  }, []);

  useEffect(() => {
    const temporizadorInicial = window.setTimeout(recarregar, 0);
    window.addEventListener(EVENTO_WORKSPACE_INTEGRACOES, recarregar);
    window.addEventListener("storage", recarregar);
    return () => {
      window.clearTimeout(temporizadorInicial);
      window.removeEventListener(EVENTO_WORKSPACE_INTEGRACOES, recarregar);
      window.removeEventListener("storage", recarregar);
    };
  }, [recarregar]);

  const testar = useCallback(async (id: string) => {
    setTestandoIds((atuais) => (atuais.includes(id) ? atuais : [...atuais, id]));
    try {
      return await testarIntegracaoLocal(id);
    } finally {
      setTestandoIds((atuais) => atuais.filter((item) => item !== id));
    }
  }, []);

  const testarTudo = useCallback(async () => {
    setDiagnosticandoTudo(true);
    try {
      return await testarTodasIntegracoesLocais();
    } finally {
      setDiagnosticandoTudo(false);
    }
  }, []);

  return {
    workspace,
    integracoes: workspace.integracoes,
    padroes: workspace.padroes,
    modoProcessamento: workspace.modoProcessamento,
    carregado,
    testandoIds,
    diagnosticandoTudo,
    definirModo: useCallback((modo: ModoProcessamento) => definirModoProcessamentoLocal(modo), []),
    atualizar: useCallback((id: string, dados: AtualizacaoIntegracao) => atualizarIntegracaoLocal(id, dados), []),
    limparCredencial: useCallback((id: string) => limparCredencialIntegracaoLocal(id), []),
    alternarAtiva: useCallback((id: string) => alternarIntegracaoAtivaLocal(id), []),
    definirPadrao: useCallback((capacidade: CapacidadeIntegracao, id: string) => definirIntegracaoPadraoLocal(capacidade, id), []),
    testar,
    testarTudo,
    restaurar: useCallback((id: string) => restaurarIntegracaoLocal(id), []),
    restaurarCatalogo: useCallback(() => restaurarCatalogoIntegracoesLocal(), []),
  };
}

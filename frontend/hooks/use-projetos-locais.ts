"use client";

import { useCallback, useEffect, useState } from "react";

import {
  alterarStatusProjetoLocal,
  alternarFavoritoProjetoLocal,
  arquivarProjetoLocal,
  carregarWorkspaceProjetos,
  criarPastaProjetoLocal,
  criarProjetoLocal,
  criarVersaoProjetoLocal,
  duplicarProjetoLocal,
  EVENTO_WORKSPACE_PROJETOS,
  excluirProjetoLocal,
  exportarProjetoComoJson,
  moverProjetoParaPastaLocal,
  removerPastaProjetoLocal,
  restaurarVersaoProjetoLocal,
} from "@/lib/projetos-locais";
import type { ConfiguracaoCriacaoVideo } from "@/types/criar-video";
import type { ProjetoStudio, StatusProjetoStudio, WorkspaceProjetos } from "@/types/projeto";

const workspaceVazio: WorkspaceProjetos = { versao: 1, projetos: [], pastas: [] };

export function useProjetosLocais() {
  const [workspace, setWorkspace] = useState<WorkspaceProjetos>(workspaceVazio);
  const [carregado, setCarregado] = useState(false);

  const recarregar = useCallback(() => {
    setWorkspace(carregarWorkspaceProjetos());
    setCarregado(true);
  }, []);

  useEffect(() => {
    const temporizadorInicial = window.setTimeout(recarregar, 0);
    window.addEventListener(EVENTO_WORKSPACE_PROJETOS, recarregar);
    window.addEventListener("storage", recarregar);
    return () => {
      window.clearTimeout(temporizadorInicial);
      window.removeEventListener(EVENTO_WORKSPACE_PROJETOS, recarregar);
      window.removeEventListener("storage", recarregar);
    };
  }, [recarregar]);

  return {
    workspace,
    projetos: workspace.projetos,
    pastas: workspace.pastas,
    carregado,
    criarProjeto: useCallback((configuracao?: ConfiguracaoCriacaoVideo) => criarProjetoLocal(configuracao), []),
    alternarFavorito: useCallback((id: string) => alternarFavoritoProjetoLocal(id), []),
    duplicarProjeto: useCallback((id: string) => duplicarProjetoLocal(id), []),
    arquivarProjeto: useCallback((id: string) => arquivarProjetoLocal(id), []),
    excluirProjeto: useCallback((id: string) => excluirProjetoLocal(id), []),
    alterarStatus: useCallback((id: string, status: StatusProjetoStudio) => alterarStatusProjetoLocal(id, status), []),
    criarPasta: useCallback((nome: string) => criarPastaProjetoLocal(nome), []),
    removerPasta: useCallback((id: string) => removerPastaProjetoLocal(id), []),
    moverProjeto: useCallback((id: string, pastaId: string | null) => moverProjetoParaPastaLocal(id, pastaId), []),
    criarVersao: useCallback((id: string, nome?: string) => criarVersaoProjetoLocal(id, nome), []),
    restaurarVersao: useCallback((projetoId: string, versaoId: string) => restaurarVersaoProjetoLocal(projetoId, versaoId), []),
    exportarProjeto: useCallback((projeto: ProjetoStudio) => exportarProjetoComoJson(projeto), []),
  };
}

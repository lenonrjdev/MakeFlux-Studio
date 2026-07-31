"use client";

import { useCallback, useEffect, useState } from "react";

import {
  agendarPublicacaoLocal,
  alternarFavoritoPublicacaoLocal,
  arquivarPublicacaoLocal,
  atualizarPublicacaoLocal,
  carregarWorkspacePublicacao,
  criarPublicacaoDeTarefaLocal,
  criarPublicacaoLocal,
  duplicarPublicacaoLocal,
  EVENTO_WORKSPACE_PUBLICACAO,
  excluirPublicacaoLocal,
  gerarMetadadosPublicacaoLocal,
  marcarPublicacaoComoPublicadaLocal,
} from "@/lib/publicacao-local";
import type {
  DadosCriarPublicacao,
  PlataformaPublicacao,
  PublicacaoStudio,
  WorkspacePublicacao,
} from "@/types/publicacao";

const workspaceVazio: WorkspacePublicacao = { versao: 1, publicacoes: [] };

export function usePublicacoesLocais() {
  const [workspace, setWorkspace] = useState<WorkspacePublicacao>(workspaceVazio);
  const [carregado, setCarregado] = useState(false);

  const recarregar = useCallback(() => {
    setWorkspace(carregarWorkspacePublicacao());
    setCarregado(true);
  }, []);

  useEffect(() => {
    const temporizadorInicial = window.setTimeout(recarregar, 0);
    window.addEventListener(EVENTO_WORKSPACE_PUBLICACAO, recarregar);
    window.addEventListener("storage", recarregar);
    return () => {
      window.clearTimeout(temporizadorInicial);
      window.removeEventListener(EVENTO_WORKSPACE_PUBLICACAO, recarregar);
      window.removeEventListener("storage", recarregar);
    };
  }, [recarregar]);

  return {
    workspace,
    publicacoes: workspace.publicacoes,
    carregado,
    criar: useCallback((dados: DadosCriarPublicacao) => criarPublicacaoLocal(dados), []),
    criarDeTarefa: useCallback((tarefaId: string, plataforma: PlataformaPublicacao) => criarPublicacaoDeTarefaLocal(tarefaId, plataforma), []),
    atualizar: useCallback((id: string, alteracoes: Partial<Omit<PublicacaoStudio, "id" | "criadoEm" | "historico">>) => atualizarPublicacaoLocal(id, alteracoes), []),
    gerarMetadados: useCallback((id: string) => gerarMetadadosPublicacaoLocal(id), []),
    agendar: useCallback((id: string, data: string) => agendarPublicacaoLocal(id, data), []),
    marcarPublicada: useCallback((id: string, link: string) => marcarPublicacaoComoPublicadaLocal(id, link), []),
    alternarFavorito: useCallback((id: string) => alternarFavoritoPublicacaoLocal(id), []),
    duplicar: useCallback((id: string) => duplicarPublicacaoLocal(id), []),
    arquivar: useCallback((id: string) => arquivarPublicacaoLocal(id), []),
    excluir: useCallback((id: string) => excluirPublicacaoLocal(id), []),
  };
}

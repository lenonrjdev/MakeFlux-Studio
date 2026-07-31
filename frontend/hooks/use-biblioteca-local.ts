"use client";

import { useCallback, useEffect, useState } from "react";

import {
  alternarFavoritoRecursoBibliotecaLocal,
  atualizarRecursoBibliotecaLocal,
  carregarWorkspaceBiblioteca,
  criarColecaoBibliotecaLocal,
  definirPastaRaizBibliotecaLocal,
  duplicarRecursoBibliotecaLocal,
  EVENTO_WORKSPACE_BIBLIOTECA,
  excluirRecursoBibliotecaLocal,
  importarArquivosBibliotecaLocal,
  moverRecursoBibliotecaLocal,
  prepararTransferenciaBibliotecaParaEstudio,
  removerColecaoBibliotecaLocal,
  sincronizarExportacoesProducaoBibliotecaLocal,
  sincronizarPromptsLaboratorioBibliotecaLocal,
} from "@/lib/biblioteca-local";
import type {
  ArquivoImportacaoBiblioteca,
  RecursoBiblioteca,
  TipoRecursoBiblioteca,
  WorkspaceBiblioteca,
} from "@/types/biblioteca";

const workspaceVazio: WorkspaceBiblioteca = {
  versao: 1,
  pastaRaiz: "Biblioteca local do MakeFlux Studio",
  recursos: [],
  colecoes: [],
};

export function useBibliotecaLocal() {
  const [workspace, setWorkspace] = useState<WorkspaceBiblioteca>(workspaceVazio);
  const [carregado, setCarregado] = useState(false);

  const recarregar = useCallback(() => {
    setWorkspace(carregarWorkspaceBiblioteca());
    setCarregado(true);
  }, []);

  useEffect(() => {
    const temporizadorInicial = window.setTimeout(() => {
      sincronizarExportacoesProducaoBibliotecaLocal();
      sincronizarPromptsLaboratorioBibliotecaLocal();
      recarregar();
    }, 0);
    window.addEventListener(EVENTO_WORKSPACE_BIBLIOTECA, recarregar);
    window.addEventListener("storage", recarregar);
    return () => {
      window.clearTimeout(temporizadorInicial);
      window.removeEventListener(EVENTO_WORKSPACE_BIBLIOTECA, recarregar);
      window.removeEventListener("storage", recarregar);
    };
  }, [recarregar]);

  return {
    workspace,
    recursos: workspace.recursos,
    colecoes: workspace.colecoes,
    pastaRaiz: workspace.pastaRaiz,
    carregado,
    importarArquivos: useCallback(
      (
        arquivos: ArquivoImportacaoBiblioteca[],
        colecaoId?: string,
        tipoForcado?: TipoRecursoBiblioteca,
      ) => importarArquivosBibliotecaLocal(arquivos, colecaoId, tipoForcado),
      [],
    ),
    atualizarRecurso: useCallback(
      (
        id: string,
        alteracoes: Partial<
          Pick<RecursoBiblioteca, "nome" | "descricao" | "colecaoId" | "tags" | "status">
        >,
      ) => atualizarRecursoBibliotecaLocal(id, alteracoes),
      [],
    ),
    alternarFavorito: useCallback((id: string) => alternarFavoritoRecursoBibliotecaLocal(id), []),
    moverRecurso: useCallback((id: string, colecaoId?: string) => moverRecursoBibliotecaLocal(id, colecaoId), []),
    duplicarRecurso: useCallback((id: string) => duplicarRecursoBibliotecaLocal(id), []),
    excluirRecurso: useCallback((id: string) => excluirRecursoBibliotecaLocal(id), []),
    criarColecao: useCallback((nome: string, descricao?: string) => criarColecaoBibliotecaLocal(nome, descricao), []),
    removerColecao: useCallback((id: string) => removerColecaoBibliotecaLocal(id), []),
    definirPastaRaiz: useCallback((pasta: string) => definirPastaRaizBibliotecaLocal(pasta), []),
    sincronizar: useCallback(() => {
      const producao = sincronizarExportacoesProducaoBibliotecaLocal();
      const prompts = sincronizarPromptsLaboratorioBibliotecaLocal();
      return { producao, prompts };
    }, []),
    prepararParaEstudio: useCallback((id: string) => prepararTransferenciaBibliotecaParaEstudio(id), []),
  };
}

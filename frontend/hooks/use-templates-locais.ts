"use client";

import { useCallback, useEffect, useState } from "react";

import {
  alterarStatusTemplateLocal,
  alternarFavoritoTemplateLocal,
  atualizarTemplateLocal,
  carregarWorkspaceTemplates,
  criarTemplateDeProjetoLocal,
  criarTemplateLocal,
  duplicarTemplateLocal,
  EVENTO_WORKSPACE_TEMPLATES,
  excluirTemplateLocal,
  exportarTemplateComoJson,
  importarTemplateDeJson,
  prepararTransferenciaTemplateParaEstudio,
} from "@/lib/templates-locais";
import type { ConfiguracaoCriacaoVideo } from "@/types/criar-video";
import type {
  CategoriaTemplate,
  StatusTemplate,
  TemplateStudio,
  WorkspaceTemplates,
} from "@/types/templates";

const workspaceVazio: WorkspaceTemplates = { versao: 1, templates: [] };

export function useTemplatesLocais() {
  const [workspace, setWorkspace] = useState<WorkspaceTemplates>(workspaceVazio);
  const [carregado, setCarregado] = useState(false);

  const recarregar = useCallback(() => {
    setWorkspace(carregarWorkspaceTemplates());
    setCarregado(true);
  }, []);

  useEffect(() => {
    const temporizadorInicial = window.setTimeout(recarregar, 0);
    window.addEventListener(EVENTO_WORKSPACE_TEMPLATES, recarregar);
    window.addEventListener("storage", recarregar);
    return () => {
      window.clearTimeout(temporizadorInicial);
      window.removeEventListener(EVENTO_WORKSPACE_TEMPLATES, recarregar);
      window.removeEventListener("storage", recarregar);
    };
  }, [recarregar]);

  return {
    workspace,
    templates: workspace.templates,
    carregado,
    criarTemplate: useCallback(
      (dados: {
        nome: string;
        descricao?: string;
        categoria?: CategoriaTemplate;
        tags?: string[];
        corDestaque?: string;
        configuracao?: ConfiguracaoCriacaoVideo;
        projetoOrigemId?: string;
      }) => criarTemplateLocal(dados),
      [],
    ),
    criarDeProjeto: useCallback((projetoId: string, nome?: string) => criarTemplateDeProjetoLocal(projetoId, nome), []),
    atualizarTemplate: useCallback(
      (
        id: string,
        alteracoes: Partial<
          Pick<
            TemplateStudio,
            "nome" | "descricao" | "categoria" | "status" | "tags" | "corDestaque" | "configuracao"
          >
        >,
      ) => atualizarTemplateLocal(id, alteracoes),
      [],
    ),
    alternarFavorito: useCallback((id: string) => alternarFavoritoTemplateLocal(id), []),
    duplicarTemplate: useCallback((id: string) => duplicarTemplateLocal(id), []),
    alterarStatus: useCallback((id: string, status: StatusTemplate) => alterarStatusTemplateLocal(id, status), []),
    excluirTemplate: useCallback((id: string) => excluirTemplateLocal(id), []),
    prepararParaEstudio: useCallback((id: string) => prepararTransferenciaTemplateParaEstudio(id), []),
    exportarTemplate: useCallback((template: TemplateStudio) => exportarTemplateComoJson(template), []),
    importarTemplate: useCallback((conteudo: string) => importarTemplateDeJson(conteudo), []),
  };
}

"use client";

import { useCallback, useEffect, useState } from "react";

import {
  alternarEtapaOnboardingLocal,
  alternarGuiaFavoritoLocal,
  alternarProblemaResolvidoLocal,
  carregarAjudaLocal,
  concluirOnboardingLocal,
  EVENTO_WORKSPACE_AJUDA,
  executarDiagnosticoLocal,
  marcarNovidadeLidaLocal,
  registrarGuiaVisualizadoLocal,
  reiniciarOnboardingLocal,
} from "@/lib/ajuda-local";
import type { WorkspaceAjuda } from "@/types/ajuda";

export function useAjudaLocal() {
  const [workspace, setWorkspace] = useState<WorkspaceAjuda | null>(null);
  const [diagnosticando, setDiagnosticando] = useState(false);

  const recarregar = useCallback(() => setWorkspace(carregarAjudaLocal()), []);

  useEffect(() => {
    recarregar();
    window.addEventListener(EVENTO_WORKSPACE_AJUDA, recarregar);
    window.addEventListener("storage", recarregar);
    return () => {
      window.removeEventListener(EVENTO_WORKSPACE_AJUDA, recarregar);
      window.removeEventListener("storage", recarregar);
    };
  }, [recarregar]);

  const executarDiagnostico = useCallback(async () => {
    setDiagnosticando(true);
    try {
      return await executarDiagnosticoLocal();
    } finally {
      setDiagnosticando(false);
      recarregar();
    }
  }, [recarregar]);

  return {
    workspace,
    carregado: workspace !== null,
    diagnosticando,
    alternarEtapa: (id: string) => setWorkspace(alternarEtapaOnboardingLocal(id)),
    concluirOnboarding: () => setWorkspace(concluirOnboardingLocal()),
    reiniciarOnboarding: () => setWorkspace(reiniciarOnboardingLocal()),
    registrarGuia: (id: string) => setWorkspace(registrarGuiaVisualizadoLocal(id)),
    alternarFavorito: (id: string) => setWorkspace(alternarGuiaFavoritoLocal(id)),
    alternarProblemaResolvido: (id: string) => setWorkspace(alternarProblemaResolvidoLocal(id)),
    marcarNovidadeLida: (versao: string) => setWorkspace(marcarNovidadeLidaLocal(versao)),
    executarDiagnostico,
  };
}

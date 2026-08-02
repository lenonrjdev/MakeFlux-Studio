
"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";

import { registrarIncidenteEstabilidade } from "@/lib/estabilidade-nativa";
import { obterCorrelacaoSessao, registrarEventoTecnico } from "@/lib/logger-estruturado";

export function ProvedorObservabilidade({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      void registrarEventoTecnico("navegacao.rota", "Rota aberta no aplicativo.", {
        contexto: { rota: pathname },
      });
    }, 0);
    return () => window.clearTimeout(temporizador);
  }, [pathname]);

  useEffect(() => {
    const correlacaoId = obterCorrelacaoSessao();
    const aoErro = (evento: ErrorEvent) => {
      const mensagem = evento.message || "Erro não tratado na interface.";
      const contexto = { arquivo: evento.filename, linha: evento.lineno, coluna: evento.colno };
      void registrarEventoTecnico("frontend.erro_global", mensagem, {
        nivel: "erro",
        correlacaoId,
        contexto,
      });
      void registrarIncidenteEstabilidade({
        origem: "frontend",
        categoria: "erro-global",
        mensagem,
        correlacaoId,
        contexto,
      });
    };
    const aoRejeitar = (evento: PromiseRejectionEvent) => {
      const mensagem = evento.reason instanceof Error ? evento.reason.message : String(evento.reason ?? "Promessa rejeitada sem detalhe.");
      void registrarEventoTecnico("frontend.promessa_rejeitada", mensagem, {
        nivel: "erro",
        correlacaoId,
      });
      void registrarIncidenteEstabilidade({
        origem: "frontend",
        categoria: "promessa-rejeitada",
        mensagem,
        correlacaoId,
      });
    };
    window.addEventListener("error", aoErro);
    window.addEventListener("unhandledrejection", aoRejeitar);
    return () => {
      window.removeEventListener("error", aoErro);
      window.removeEventListener("unhandledrejection", aoRejeitar);
    };
  }, []);

  return children;
}

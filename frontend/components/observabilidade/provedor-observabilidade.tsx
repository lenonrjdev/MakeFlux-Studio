
"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";

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
      void registrarEventoTecnico("frontend.erro_global", evento.message || "Erro não tratado na interface.", {
        nivel: "erro",
        correlacaoId,
        contexto: { arquivo: evento.filename, linha: evento.lineno, coluna: evento.colno },
      });
    };
    const aoRejeitar = (evento: PromiseRejectionEvent) => {
      const mensagem = evento.reason instanceof Error ? evento.reason.message : String(evento.reason ?? "Promessa rejeitada sem detalhe.");
      void registrarEventoTecnico("frontend.promessa_rejeitada", mensagem, {
        nivel: "erro",
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

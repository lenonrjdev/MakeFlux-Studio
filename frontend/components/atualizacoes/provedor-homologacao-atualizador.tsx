"use client";

import { type ReactNode, useEffect } from "react";

import { registrarEventoTecnico } from "@/lib/logger-estruturado";
import { reconciliarTransicaoLegadaAtualizadorFrontend } from "@/lib/atualizador-assinado";

export function ProvedorHomologacaoAtualizador({ children }: { children: ReactNode }) {
  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      void reconciliarTransicaoLegadaAtualizadorFrontend().catch((erro) => {
        const mensagem = erro instanceof Error ? erro.message : String(erro);
        return registrarEventoTecnico(
          "atualizador.reconciliacao_inicial_falhou",
          mensagem,
          { nivel: "aviso", origem: "sistema" },
        );
      });
    }, 0);

    return () => window.clearTimeout(temporizador);
  }, []);

  return children;
}

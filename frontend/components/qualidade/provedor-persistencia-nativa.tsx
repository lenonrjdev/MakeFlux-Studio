"use client";

import { useEffect, useState, type ReactNode } from "react";

import {
  hidratarLocalStorageDoSqlite,
  sincronizarWorkspaceComSqlite,
} from "@/lib/persistencia-nativa";
import { emAmbienteTauri } from "@/lib/runtime-nativo";

export function ProvedorPersistenciaNativa({ children }: { children: ReactNode }) {
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    let ativo = true;

    const sincronizar = async () => {
      try {
        await hidratarLocalStorageDoSqlite();
        await sincronizarWorkspaceComSqlite();
      } catch {
        // O localStorage permanece como fallback seguro quando o banco não está disponível.
      }
    };

    const inicial = window.setTimeout(() => {
      const preparar = async () => {
        if (emAmbienteTauri()) await sincronizar();
        if (ativo) setPronto(true);
      };
      void preparar();
    }, 0);

    const recorrente = window.setInterval(() => {
      if (emAmbienteTauri()) void sincronizar();
    }, 15_000);
    const aoOcultar = () => {
      if (document.visibilityState === "hidden" && emAmbienteTauri()) void sincronizar();
    };

    document.addEventListener("visibilitychange", aoOcultar);
    return () => {
      ativo = false;
      window.clearTimeout(inicial);
      window.clearInterval(recorrente);
      document.removeEventListener("visibilitychange", aoOcultar);
    };
  }, []);

  if (!pronto) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7f8f9] text-[10px] text-[#7c8585]">
        Preparando o workspace local...
      </div>
    );
  }

  return children;
}

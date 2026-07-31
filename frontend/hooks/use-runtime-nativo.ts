"use client";

import { useCallback, useEffect, useState } from "react";

import {
  consultarEstadoMotorMoneyPrinter,
  detectarCapacidadesSistema,
  emAmbienteTauri,
} from "@/lib/runtime-nativo";
import type { CapacidadesSistema, EstadoMotorNativo } from "@/types/runtime-nativo";

export function useRuntimeNativo() {
  const [capacidades, setCapacidades] = useState<CapacidadesSistema | null>(null);
  const [motor, setMotor] = useState<EstadoMotorNativo | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const desktop = emAmbienteTauri();

  const detectar = useCallback(async () => {
    if (!desktop) return null;
    setCarregando(true);
    setErro(null);
    try {
      const [proximasCapacidades, proximoMotor] = await Promise.all([
        detectarCapacidadesSistema(),
        consultarEstadoMotorMoneyPrinter(),
      ]);
      setCapacidades(proximasCapacidades);
      setMotor(proximoMotor);
      return proximasCapacidades;
    } catch (falha) {
      const mensagem = falha instanceof Error ? falha.message : String(falha);
      setErro(mensagem);
      return null;
    } finally {
      setCarregando(false);
    }
  }, [desktop]);

  useEffect(() => {
    if (!desktop) return;
    const inicial = window.setTimeout(detectar, 0);
    const atualizacao = window.setInterval(async () => {
      try {
        setMotor(await consultarEstadoMotorMoneyPrinter());
      } catch {
        // O diagnóstico manual continuará disponível se o processo estiver encerrando.
      }
    }, 4_000);
    return () => {
      window.clearTimeout(inicial);
      window.clearInterval(atualizacao);
    };
  }, [desktop, detectar]);

  return {
    desktop,
    capacidades,
    motor,
    carregando,
    erro,
    detectar,
    definirMotor: setMotor,
    definirErro: setErro,
  };
}

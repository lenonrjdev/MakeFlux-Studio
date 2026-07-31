import { invoke } from "@tauri-apps/api/core";

import { emAmbienteTauri } from "@/lib/runtime-nativo";
import type { EventoTelemetriaLocal, PreferenciasTelemetriaLocal } from "@/types/qualidade";

export const CHAVE_TELEMETRIA_LOCAL = "makeflux:telemetria-local:v1";

export function carregarPreferenciasTelemetria(): PreferenciasTelemetriaLocal {
  if (typeof window === "undefined") {
    return { ativa: false, reterDias: 30, atualizadoEm: new Date(0).toISOString() };
  }
  try {
    const salvo = window.localStorage.getItem(CHAVE_TELEMETRIA_LOCAL);
    if (!salvo) throw new Error("sem preferencias");
    const dados = JSON.parse(salvo) as Partial<PreferenciasTelemetriaLocal>;
    return {
      ativa: Boolean(dados.ativa),
      reterDias: Math.max(1, Math.min(365, Number(dados.reterDias ?? 30))),
      atualizadoEm: String(dados.atualizadoEm ?? new Date().toISOString()),
    };
  } catch {
    return { ativa: false, reterDias: 30, atualizadoEm: new Date().toISOString() };
  }
}

export function salvarPreferenciasTelemetria(
  dados: Partial<PreferenciasTelemetriaLocal>,
): PreferenciasTelemetriaLocal {
  const atuais = carregarPreferenciasTelemetria();
  const proximas = {
    ...atuais,
    ...dados,
    atualizadoEm: new Date().toISOString(),
  };
  window.localStorage.setItem(CHAVE_TELEMETRIA_LOCAL, JSON.stringify(proximas));
  return proximas;
}

export async function registrarEventoTelemetriaLocal(
  categoria: EventoTelemetriaLocal["categoria"],
  nome: string,
  detalhes = "",
) {
  const preferencias = carregarPreferenciasTelemetria();
  if (!preferencias.ativa || !emAmbienteTauri()) return false;
  await invoke("registrar_telemetria_local", {
    evento: {
      id: crypto.randomUUID(),
      categoria,
      nome,
      detalhes,
      criadoEm: Date.now(),
    },
  });
  return true;
}

export function listarTelemetriaLocal() {
  if (!emAmbienteTauri()) return Promise.resolve([] as EventoTelemetriaLocal[]);
  return invoke<EventoTelemetriaLocal[]>("listar_telemetria_local");
}

export function limparTelemetriaLocal() {
  if (!emAmbienteTauri()) return Promise.resolve(0);
  return invoke<number>("limpar_telemetria_local");
}

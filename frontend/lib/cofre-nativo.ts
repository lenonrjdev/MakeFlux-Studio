import { invoke } from "@tauri-apps/api/core";

import { emAmbienteTauri } from "@/lib/runtime-nativo";
import type { SegredoCofreResumo, StatusCofreNativo } from "@/types/qualidade";

function invocarCofre<T>(comando: string, argumentos?: Record<string, unknown>) {
  if (!emAmbienteTauri()) {
    throw new Error("O cofre criptografado exige o aplicativo desktop.");
  }
  return invoke<T>(comando, argumentos);
}

export function consultarStatusCofre() {
  return invocarCofre<StatusCofreNativo>("status_cofre");
}

export function inicializarCofre(senha: string) {
  return invocarCofre<StatusCofreNativo>("inicializar_cofre", { senha });
}

export function desbloquearCofre(senha: string) {
  return invocarCofre<StatusCofreNativo>("desbloquear_cofre", { senha });
}

export function bloquearCofre() {
  return invocarCofre<StatusCofreNativo>("bloquear_cofre");
}

export function listarSegredosCofre() {
  return invocarCofre<SegredoCofreResumo[]>("listar_segredos_cofre");
}

export function salvarSegredoCofre(chave: string, valor: string) {
  return invocarCofre<StatusCofreNativo>("salvar_segredo_cofre", { chave, valor });
}

export function removerSegredoCofre(chave: string) {
  return invocarCofre<StatusCofreNativo>("remover_segredo_cofre", { chave });
}

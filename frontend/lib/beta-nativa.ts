import { invoke } from "@tauri-apps/api/core";

import { painelBetaDemonstracao } from "@/data/beta";
import { emAmbienteTauri } from "@/lib/runtime-nativo";
import type {
  ArtefatoBeta,
  EntradaCheckBeta,
  EntradaSessaoBeta,
  PainelBetaOperacional,
} from "@/types/beta";

function exigirDesktop() {
  if (!emAmbienteTauri()) {
    throw new Error("A homologação beta completa exige o aplicativo desktop.");
  }
}

export async function consultarBetaOperacional() {
  if (!emAmbienteTauri()) return painelBetaDemonstracao;
  return invoke<PainelBetaOperacional>("consultar_beta_operacional");
}

export async function iniciarSessaoBeta(entrada: EntradaSessaoBeta) {
  exigirDesktop();
  return invoke<PainelBetaOperacional>("iniciar_sessao_beta", { entrada });
}

export async function atualizarCheckBeta(entrada: EntradaCheckBeta) {
  exigirDesktop();
  return invoke<PainelBetaOperacional>("atualizar_check_beta", { entrada });
}

export async function finalizarSessaoBeta() {
  exigirDesktop();
  return invoke<PainelBetaOperacional>("finalizar_sessao_beta");
}

export async function exportarRelatorioBeta() {
  exigirDesktop();
  return invoke<ArtefatoBeta>("exportar_relatorio_beta");
}

export async function criarSnapshotBeta() {
  exigirDesktop();
  return invoke<ArtefatoBeta>("criar_snapshot_beta");
}

export async function revelarArtefatoBeta(caminho: string) {
  exigirDesktop();
  return invoke<boolean>("revelar_artefato_beta", { caminho });
}

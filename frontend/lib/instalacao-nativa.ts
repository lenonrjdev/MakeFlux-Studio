
import { invoke } from "@tauri-apps/api/core";

import { emAmbienteTauri } from "@/lib/runtime-nativo";
import type {
  DiagnosticoInstalacaoAssistida,
  EstruturaWorkspaceInstalacao,
  IdDependenciaInstalacao,
  ResultadoInstalacaoMoneyPrinter,
  ResultadoOperacaoInstalacao,
  ValidacaoMoneyPrinterAssistida,
} from "@/types/instalacao";

function exigirDesktop() {
  if (!emAmbienteTauri()) throw new Error("Este recurso exige o aplicativo desktop do MakeFlux Studio.");
}

export async function diagnosticarInstalacaoAssistida(raizWorkspace?: string) {
  exigirDesktop();
  return invoke<DiagnosticoInstalacaoAssistida>("diagnosticar_instalacao_assistida", {
    raizWorkspace: raizWorkspace?.trim() || null,
  });
}

export async function prepararWorkspaceAssistido(raizWorkspace?: string) {
  exigirDesktop();
  return invoke<EstruturaWorkspaceInstalacao>("preparar_workspace_assistido", {
    raizWorkspace: raizWorkspace?.trim() || null,
  });
}

export async function instalarDependenciaAssistida(dependencia: IdDependenciaInstalacao) {
  exigirDesktop();
  return invoke<ResultadoOperacaoInstalacao>("instalar_dependencia_assistida", { dependencia });
}

export async function instalarMoneyPrinterAssistido(raizWorkspace: string) {
  exigirDesktop();
  return invoke<ResultadoInstalacaoMoneyPrinter>("instalar_moneyprinter_assistido", { raizWorkspace });
}

export async function validarMoneyPrinterAssistido(diretorio: string) {
  exigirDesktop();
  return invoke<ValidacaoMoneyPrinterAssistida>("validar_moneyprinter_assistido", { diretorio });
}

export async function abrirPastaInstalacaoAssistida(caminho: string) {
  exigirDesktop();
  return invoke<void>("abrir_pasta_instalacao_assistida", { caminho });
}

import { invoke } from "@tauri-apps/api/core";

import type {
  CapacidadesSistema,
  DiagnosticoMoneyPrinter,
  EstadoMotorNativo,
  EstadoRepositorioMotor,
  RespostaHttpNativa,
  ResultadoAtualizacaoMotor,
} from "@/types/runtime-nativo";

export function emAmbienteTauri() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

async function invocarNativo<T>(comando: string, argumentos?: Record<string, unknown>) {
  if (!emAmbienteTauri()) {
    throw new Error("Este recurso exige o aplicativo desktop do MakeFlux Studio.");
  }
  return invoke<T>(comando, argumentos);
}

export function detectarCapacidadesSistema() {
  return invocarNativo<CapacidadesSistema>("detectar_capacidades_sistema");
}

export function testarHttpNativo({
  url,
  metodo = "GET",
  corpo,
  timeoutMs = 12_000,
  permitirRemoto = false,
}: {
  url: string;
  metodo?: string;
  corpo?: unknown;
  timeoutMs?: number;
  permitirRemoto?: boolean;
}) {
  return invocarNativo<RespostaHttpNativa>("testar_http_nativo", {
    solicitacao: { url, metodo, corpo, timeoutMs, permitirRemoto },
  });
}

export function verificarMoneyPrinter(base: string) {
  return invocarNativo<DiagnosticoMoneyPrinter>("verificar_moneyprinter", { base });
}

export function iniciarMotorMoneyPrinter({
  diretorio,
  python,
  argumentos = [],
}: {
  diretorio: string;
  python?: string;
  argumentos?: string[];
}) {
  return invocarNativo<EstadoMotorNativo>("iniciar_motor_moneyprinter", {
    solicitacao: { diretorio, python, argumentos },
  });
}

export function consultarEstadoMotorMoneyPrinter() {
  return invocarNativo<EstadoMotorNativo>("status_motor_moneyprinter");
}

export function pararMotorMoneyPrinter() {
  return invocarNativo<EstadoMotorNativo>("parar_motor_moneyprinter");
}

export function inspecionarRepositorioMotor(diretorio: string) {
  return invocarNativo<EstadoRepositorioMotor>("inspecionar_repositorio_motor", { diretorio });
}

export function verificarAtualizacaoMotor(diretorio: string) {
  return invocarNativo<EstadoRepositorioMotor>("verificar_atualizacao_motor", { diretorio });
}

export function atualizarMotorSeguro(diretorio: string) {
  return invocarNativo<ResultadoAtualizacaoMotor>("atualizar_motor_seguro", { diretorio });
}

export function rollbackMotorSeguro(diretorio: string) {
  return invocarNativo<ResultadoAtualizacaoMotor>("rollback_motor_seguro", { diretorio });
}

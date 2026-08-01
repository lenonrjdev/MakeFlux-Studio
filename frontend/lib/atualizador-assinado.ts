import { invoke } from "@tauri-apps/api/core";
import { relaunch } from "@tauri-apps/plugin-process";
import { check, type DownloadEvent, type Update } from "@tauri-apps/plugin-updater";

import { emAmbienteTauri } from "@/lib/runtime-nativo";
import type {
  MetadadosAtualizacaoAssinada,
  RegistroHistoricoAtualizador,
  StatusAtualizadorNativo,
  WorkspaceAtualizador,
} from "@/types/atualizador";

export const CHAVE_WORKSPACE_ATUALIZADOR = "makeflux:workspace-atualizador:v1";
export const EVENTO_WORKSPACE_ATUALIZADOR = "makeflux:workspace-atualizador-atualizado";

function agoraIso() {
  return new Date().toISOString();
}

function gerarId(prefixo: string) {
  return `${prefixo}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function criarWorkspaceAtualizadorPadrao(): WorkspaceAtualizador {
  return {
    versao: 1,
    status: "ocioso",
    canal: "estavel",
    progresso: 0,
    bytesBaixados: 0,
    totalBytes: 0,
    mensagem: "Nenhuma verificação executada nesta sessão.",
    ultimaVerificacaoEm: null,
    atualizacao: null,
    historico: [],
    atualizadoEm: agoraIso(),
  };
}

export function carregarWorkspaceAtualizador(): WorkspaceAtualizador {
  if (typeof window === "undefined") return criarWorkspaceAtualizadorPadrao();
  const salvo = window.localStorage.getItem(CHAVE_WORKSPACE_ATUALIZADOR);
  if (!salvo) return criarWorkspaceAtualizadorPadrao();
  try {
    const valor = JSON.parse(salvo) as Partial<WorkspaceAtualizador>;
    const padrao = criarWorkspaceAtualizadorPadrao();
    return {
      ...padrao,
      ...valor,
      versao: 1,
      historico: Array.isArray(valor.historico) ? valor.historico.slice(0, 50) : [],
    };
  } catch {
    return criarWorkspaceAtualizadorPadrao();
  }
}

export function salvarWorkspaceAtualizador(workspace: WorkspaceAtualizador) {
  const atualizado = { ...workspace, atualizadoEm: agoraIso() };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CHAVE_WORKSPACE_ATUALIZADOR, JSON.stringify(atualizado));
    window.dispatchEvent(new CustomEvent(EVENTO_WORKSPACE_ATUALIZADOR));
  }
  return atualizado;
}

export function criarRegistroHistoricoAtualizador(
  entrada: Omit<RegistroHistoricoAtualizador, "id" | "criadoEm">,
): RegistroHistoricoAtualizador {
  return { ...entrada, id: gerarId("update"), criadoEm: agoraIso() };
}

export async function consultarStatusAtualizadorNativo() {
  if (!emAmbienteTauri()) {
    return {
      versaoAtual: "1.4.0",
      alvo: "preview-web",
      configurado: false,
      endpoint: null,
      assinaturaObrigatoria: true,
    } satisfies StatusAtualizadorNativo;
  }
  return invoke<StatusAtualizadorNativo>("status_atualizador_nativo");
}

function metadadosDaAtualizacao(
  update: Update,
  alvo: string,
  rollback: boolean,
): MetadadosAtualizacaoAssinada {
  return {
    versao: update.version,
    versaoAtual: update.currentVersion,
    notas: update.body ?? "Esta versão não possui notas de lançamento.",
    publicadaEm: update.date ?? null,
    rollback,
    alvo,
  };
}

export async function verificarAtualizacaoAssinada({
  alvo,
  rollback = false,
}: {
  alvo?: string;
  rollback?: boolean;
}) {
  if (!emAmbienteTauri()) throw new Error("A verificação assinada exige o aplicativo desktop.");
  const opcoes = alvo
    ? { timeout: 30_000, allowDowngrades: rollback, target: alvo }
    : { timeout: 30_000, allowDowngrades: rollback };
  const update = await check(opcoes);
  if (!update) return { update: null, metadados: null };
  return {
    update,
    metadados: metadadosDaAtualizacao(update, alvo ?? "padrão", rollback),
  };
}

export async function verificarAtualizacaoRapida() {
  const runtime = await consultarStatusAtualizadorNativo();
  const verificadoEm = agoraIso();
  if (!runtime.configurado) {
    return {
      verificadoEm,
      atualizacaoDisponivel: false,
      mensagem: "Este build não possui endpoint e chave pública de atualização configurados.",
    };
  }
  const resultado = await verificarAtualizacaoAssinada({});
  if (!resultado.update || !resultado.metadados) {
    return {
      verificadoEm,
      atualizacaoDisponivel: false,
      mensagem: `O MakeFlux Studio ${runtime.versaoAtual} já está atualizado.`,
    };
  }
  const versao = resultado.metadados.versao;
  await resultado.update.close();
  return {
    verificadoEm,
    atualizacaoDisponivel: true,
    mensagem: `A versão ${versao} está disponível na Central de Atualizações.`,
  };
}

export function baixarPacoteAtualizacao(
  update: Update,
  aoProgresso: (evento: DownloadEvent) => void,
) {
  return update.download(aoProgresso, { timeout: 15 * 60 * 1_000 });
}

export function instalarPacoteAtualizacao(update: Update) {
  return update.install();
}

export function reiniciarAposAtualizacao() {
  return relaunch();
}

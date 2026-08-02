import { invoke } from "@tauri-apps/api/core";
import { relaunch } from "@tauri-apps/plugin-process";
import { check, type DownloadEvent, type Update } from "@tauri-apps/plugin-updater";

import { emAmbienteTauri } from "@/lib/runtime-nativo";
import type {
  CanalAtualizacao,
  MetadadosAtualizacaoAssinada,
  PainelHomologacaoAtualizador,
  RegistroAtualizacaoReal,
  RegistroHistoricoAtualizador,
  StatusAtualizadorNativo,
  WorkspaceAtualizador,
} from "@/types/atualizador";

export const CHAVE_WORKSPACE_ATUALIZADOR = "makeflux:workspace-atualizador:v2";
export const EVENTO_WORKSPACE_ATUALIZADOR = "makeflux:workspace-atualizador-atualizado";
const CHAVE_ANTIGA_WORKSPACE_ATUALIZADOR = "makeflux:workspace-atualizador:v1";

function agoraIso() {
  return new Date().toISOString();
}

function gerarId(prefixo: string) {
  return `${prefixo}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function criarWorkspaceAtualizadorPadrao(): WorkspaceAtualizador {
  return {
    versao: 2,
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

function normalizarCanal(valor: unknown): CanalAtualizacao {
  return valor === "beta" || valor === "antecipado" ? "beta" : "estavel";
}

export function carregarWorkspaceAtualizador(): WorkspaceAtualizador {
  if (typeof window === "undefined") return criarWorkspaceAtualizadorPadrao();
  const salvo = window.localStorage.getItem(CHAVE_WORKSPACE_ATUALIZADOR)
    ?? window.localStorage.getItem(CHAVE_ANTIGA_WORKSPACE_ATUALIZADOR);
  if (!salvo) return criarWorkspaceAtualizadorPadrao();
  try {
    const valor = JSON.parse(salvo) as Partial<WorkspaceAtualizador> & { canal?: unknown };
    const padrao = criarWorkspaceAtualizadorPadrao();
    return {
      ...padrao,
      ...valor,
      versao: 2,
      canal: normalizarCanal(valor.canal),
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
    window.localStorage.removeItem(CHAVE_ANTIGA_WORKSPACE_ATUALIZADOR);
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
      versaoAtual: "1.9.1",
      alvo: "preview-web",
      configurado: false,
      endpoint: null,
      assinaturaObrigatoria: true,
    } satisfies StatusAtualizadorNativo;
  }
  return invoke<StatusAtualizadorNativo>("status_atualizador_nativo");
}

export async function consultarHomologacaoAtualizador() {
  if (!emAmbienteTauri()) {
    return {
      versaoAtual: "1.9.1",
      checkpointPendente: null,
      ultimaOperacao: null,
      historico: [],
      dadosPreservados: null,
      rollbackDisponivel: false,
      atualizadoEm: Date.now(),
    } satisfies PainelHomologacaoAtualizador;
  }
  return invoke<PainelHomologacaoAtualizador>("consultar_homologacao_atualizador");
}


export async function reconciliarTransicaoLegadaAtualizadorFrontend() {
  if (!emAmbienteTauri()) return consultarHomologacaoAtualizador();

  const workspace = carregarWorkspaceAtualizador();
  const runtime = await consultarStatusAtualizadorNativo();
  let painel = await consultarHomologacaoAtualizador();
  const metadadosLocais = workspace.atualizacao;
  const instalacaoLegada = workspace.historico.some((item) =>
    item.operacao === "instalacao"
    && item.resultado === "sucesso"
    && item.versao === runtime.versaoAtual,
  );

  if (
    !painel.ultimaOperacao
    && instalacaoLegada
    && metadadosLocais
    && metadadosLocais.versao === runtime.versaoAtual
    && metadadosLocais.versaoAtual !== runtime.versaoAtual
  ) {
    await registrarTransicaoLegadaAtualizacao({
      versaoOrigem: metadadosLocais.versaoAtual,
      versaoDestino: metadadosLocais.versao,
      canal: workspace.canal,
    });
    painel = await consultarHomologacaoAtualizador();
  }

  return painel;
}

export function prepararCheckpointAtualizacao({
  versaoDestino,
  canal,
  rollback,
}: {
  versaoDestino: string;
  canal: CanalAtualizacao;
  rollback: boolean;
}) {
  return invoke<RegistroAtualizacaoReal>("preparar_checkpoint_atualizacao", {
    entrada: { versaoDestino, canal, rollback },
  });
}

export function registrarTransicaoLegadaAtualizacao({
  versaoOrigem,
  versaoDestino,
  canal,
}: {
  versaoOrigem: string;
  versaoDestino: string;
  canal: CanalAtualizacao;
}) {
  return invoke<RegistroAtualizacaoReal>("registrar_transicao_legada_atualizacao", {
    entrada: { versaoOrigem, versaoDestino, canal },
  });
}

export function confirmarPosAtualizacao() {
  return invoke<RegistroAtualizacaoReal | null>("confirmar_pos_atualizacao");
}

export function descartarCheckpointAtualizacao() {
  return invoke<void>("descartar_checkpoint_atualizacao");
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
  const resultado = await verificarAtualizacaoAssinada({ alvo: runtime.alvo });
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

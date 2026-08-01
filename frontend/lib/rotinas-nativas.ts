import { invoke } from "@tauri-apps/api/core";

import { rotinasDemonstrativas } from "@/data/rotinas";
import { emAmbienteTauri } from "@/lib/runtime-nativo";
import type {
  EntradaRotinaAgendada,
  ExecucaoRotina,
  NotificacaoLocal,
  ResultadoProcessamentoRotinas,
  RotinaAgendada,
  StatusAgendadorRotinas,
} from "@/types/rotinas";

const CHAVE_ROTINAS_WEB = "makeflux:workspace-rotinas-web:v1";
const CHAVE_NOTIFICACOES_WEB = "makeflux:notificacoes-web:v1";

function invocar<T>(comando: string, argumentos?: Record<string, unknown>) {
  if (!emAmbienteTauri()) throw new Error("Esta operação exige o aplicativo desktop.");
  return invoke<T>(comando, argumentos);
}

function lerWeb<T>(chave: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const valor = window.localStorage.getItem(chave);
    return valor ? (JSON.parse(valor) as T) : fallback;
  } catch {
    return fallback;
  }
}

function salvarWeb<T>(chave: string, valor: T) {
  if (typeof window !== "undefined") window.localStorage.setItem(chave, JSON.stringify(valor));
}

export async function listarRotinasAgendadas() {
  if (emAmbienteTauri()) return invocar<RotinaAgendada[]>("listar_rotinas_agendadas");
  return lerWeb(CHAVE_ROTINAS_WEB, rotinasDemonstrativas);
}

export async function salvarRotinaAgendada(entrada: EntradaRotinaAgendada) {
  if (emAmbienteTauri()) return invocar<RotinaAgendada>("salvar_rotina_agendada", { entrada });
  const atuais = await listarRotinasAgendadas();
  const agora = Date.now();
  const id = entrada.id ?? `rotina-web-${agora}`;
  const anterior = atuais.find((item) => item.id === id);
  const rotina: RotinaAgendada = {
    ...entrada,
    id,
    intervaloMinutos: entrada.intervaloMinutos ?? null,
    proximaExecucaoEm: entrada.proximaExecucaoEm ?? agora + 60_000,
    criadoEm: anterior?.criadoEm ?? agora,
    atualizadoEm: agora,
    ultimaExecucaoEm: anterior?.ultimaExecucaoEm ?? null,
    ultimoStatus: anterior?.ultimoStatus ?? null,
  };
  salvarWeb(CHAVE_ROTINAS_WEB, [rotina, ...atuais.filter((item) => item.id !== id)]);
  return rotina;
}

export async function alterarStatusRotina(id: string, ativa: boolean) {
  if (emAmbienteTauri()) return invocar<RotinaAgendada>("alterar_status_rotina", { id, ativa });
  const atuais = await listarRotinasAgendadas();
  const rotina = atuais.find((item) => item.id === id);
  if (!rotina) throw new Error("Rotina não encontrada.");
  const atualizada = { ...rotina, ativa, atualizadoEm: Date.now() };
  salvarWeb(CHAVE_ROTINAS_WEB, atuais.map((item) => (item.id === id ? atualizada : item)));
  return atualizada;
}

export async function removerRotinaAgendada(id: string) {
  if (emAmbienteTauri()) return invocar<boolean>("remover_rotina_agendada", { id });
  const atuais = await listarRotinasAgendadas();
  salvarWeb(CHAVE_ROTINAS_WEB, atuais.filter((item) => item.id !== id));
  return true;
}

export async function executarRotinaAgora(id: string) {
  if (emAmbienteTauri()) return invocar<ExecucaoRotina>("executar_rotina_agora", { id });
  const agora = Date.now();
  const rotinas = await listarRotinasAgendadas();
  const rotina = rotinas.find((item) => item.id === id);
  if (!rotina) throw new Error("Rotina não encontrada.");
  const execucao: ExecucaoRotina = {
    id: `execucao-web-${agora}`,
    rotinaId: id,
    rotinaNome: rotina.nome,
    status: "concluida",
    iniciadaEm: agora,
    concluidaEm: agora + 8,
    duracaoMs: 8,
    mensagem: "Rotina demonstrativa concluída na prévia web.",
  };
  const notificacoes = await listarNotificacoesLocais();
  salvarWeb(CHAVE_NOTIFICACOES_WEB, [{ id: `notificacao-web-${agora}`, titulo: rotina.nome, corpo: execucao.mensagem, nivel: "sucesso", rota: "/rotinas", lida: false, criadaEm: agora }, ...notificacoes]);
  return execucao;
}

export async function listarExecucoesRotinas(rotinaId?: string) {
  if (emAmbienteTauri()) return invocar<ExecucaoRotina[]>("listar_execucoes_rotinas", { rotinaId: rotinaId ?? null });
  return [];
}

export async function consultarStatusAgendador() {
  if (emAmbienteTauri()) return invocar<StatusAgendadorRotinas>("status_agendador_rotinas");
  const rotinas = await listarRotinasAgendadas();
  const notificacoes = await listarNotificacoesLocais();
  return {
    disponivel: false,
    workerAtivo: false,
    ultimoCicloEm: null,
    rotinasAtivas: rotinas.filter((item) => item.ativa).length,
    rotinasPendentes: 0,
    notificacoesNaoLidas: notificacoes.filter((item) => !item.lida).length,
    proximaExecucaoEm: rotinas.filter((item) => item.ativa && item.proximaExecucaoEm).map((item) => item.proximaExecucaoEm as number).sort((a, b) => a - b)[0] ?? null,
    mensagem: "Agendador demonstrativo disponível somente enquanto esta aba estiver aberta.",
  } satisfies StatusAgendadorRotinas;
}

export async function processarRotinasPendentes() {
  if (emAmbienteTauri()) return invocar<ResultadoProcessamentoRotinas>("processar_rotinas_pendentes");
  return { verificadas: 0, executadas: 0, falhas: 0, mensagem: "Nenhuma rotina pendente na prévia web." } satisfies ResultadoProcessamentoRotinas;
}

export async function listarNotificacoesLocais() {
  if (emAmbienteTauri()) return invocar<NotificacaoLocal[]>("listar_notificacoes_locais");
  return lerWeb(CHAVE_NOTIFICACOES_WEB, [] as NotificacaoLocal[]);
}

export async function marcarNotificacaoLida(id: string) {
  if (emAmbienteTauri()) return invocar<boolean>("marcar_notificacao_lida", { id });
  const atuais = await listarNotificacoesLocais();
  salvarWeb(CHAVE_NOTIFICACOES_WEB, atuais.map((item) => (item.id === id ? { ...item, lida: true } : item)));
  return true;
}

export async function marcarTodasNotificacoesLidas() {
  if (emAmbienteTauri()) return invocar<number>("marcar_todas_notificacoes_lidas");
  const atuais = await listarNotificacoesLocais();
  salvarWeb(CHAVE_NOTIFICACOES_WEB, atuais.map((item) => ({ ...item, lida: true })));
  return atuais.filter((item) => !item.lida).length;
}

export async function removerNotificacoesLidas() {
  if (emAmbienteTauri()) return invocar<number>("remover_notificacoes_lidas");
  const atuais = await listarNotificacoesLocais();
  const lidas = atuais.filter((item) => item.lida).length;
  salvarWeb(CHAVE_NOTIFICACOES_WEB, atuais.filter((item) => !item.lida));
  return lidas;
}

export async function solicitarPermissaoNotificacoes() {
  if (!emAmbienteTauri()) return false;
  const notificacoes = await import("@tauri-apps/plugin-notification");
  if (await notificacoes.isPermissionGranted()) return true;
  return (await notificacoes.requestPermission()) === "granted";
}

export async function enviarNotificacaoTeste() {
  if (!emAmbienteTauri()) return false;
  return invocar<boolean>("enviar_notificacao_teste");
}

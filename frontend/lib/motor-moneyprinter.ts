import { invoke } from "@tauri-apps/api/core";

import { carregarWorkspaceIntegracoes } from "@/lib/integracoes-local";
import { emAmbienteTauri } from "@/lib/runtime-nativo";
import type { ConfiguracaoCriacaoVideo } from "@/types/criar-video";
import type {
  EstadoTarefaMoneyPrinter,
  PayloadMoneyPrinter,
  RespostaMoneyPrinter,
} from "@/types/motor-moneyprinter";

function limitar(valor: number, minimo: number, maximo: number) {
  return Math.min(maximo, Math.max(minimo, valor));
}

function fonteMateriais(fonte: string): PayloadMoneyPrinter["video_source"] {
  const normalizada = fonte.toLowerCase();
  if (normalizada.includes("pixabay")) return "pixabay";
  if (normalizada.includes("local") || normalizada.includes("biblioteca")) return "local";
  return "pexels";
}

function idiomaMoneyPrinter(idioma: string) {
  const normalizado = idioma.toLowerCase();
  if (normalizado.includes("portugu")) return "pt-BR";
  if (normalizado.includes("ingl") || normalizado.includes("english")) return "en-US";
  if (normalizado.includes("espan")) return "es-ES";
  return idioma || "pt-BR";
}

function posicaoLegenda(posicao: string) {
  const normalizada = posicao.toLowerCase();
  if (normalizada.includes("top") || normalizada.includes("superior")) return "top";
  if (normalizada.includes("center") || normalizada.includes("centro")) return "center";
  return "bottom";
}

export function criarPayloadMoneyPrinter(
  configuracao: ConfiguracaoCriacaoVideo,
  threads = 2,
): PayloadMoneyPrinter {
  const materiaisLocais = configuracao.cenas
    .filter((cena) => Boolean(cena.arquivoLocal))
    .map((cena) => ({
      provider: "local" as const,
      url: cena.arquivoLocal ?? "",
      duration: cena.duracao,
    }));
  const fonte = materiaisLocais.length > 0 ? "local" : fonteMateriais(configuracao.fonteMateriais);

  return {
    video_subject: configuracao.tema.trim(),
    video_script: configuracao.roteiro.trim(),
    video_terms: configuracao.cenas.map((cena) => cena.termo.trim()).filter(Boolean).join(", "),
    video_aspect: configuracao.formato,
    video_concat_mode: configuracao.correspondenciaNarrativa ? "sequential" : "random",
    video_clip_duration: limitar(
      Math.round(configuracao.cenas.reduce((total, cena) => total + cena.duracao, 0) / Math.max(configuracao.cenas.length, 1)),
      2,
      12,
    ),
    video_count: limitar(configuracao.quantidadeVersoes, 1, 5),
    video_source: fonte,
    video_materials: materiaisLocais.length > 0 ? materiaisLocais : null,
    video_language: idiomaMoneyPrinter(configuracao.idioma),
    voice_name: configuracao.voz,
    voice_volume: limitar(configuracao.volumeVoz, 0, 1),
    voice_rate: limitar(configuracao.velocidadeVoz, 0.5, 2),
    ...(configuracao.narracaoLocal?.caminho
      ? { custom_audio_file: configuracao.narracaoLocal.caminho }
      : {}),
    bgm_type: !configuracao.musicaAtiva
      ? ""
      : configuracao.musicaLocal?.caminho
        ? "custom"
        : "random",
    bgm_file: configuracao.musicaLocal?.caminho ?? "",
    bgm_volume: limitar(configuracao.volumeMusica, 0, 1),
    subtitle_enabled: configuracao.legendasAtivas && !configuracao.narracaoLocal?.caminho,
    subtitle_position: posicaoLegenda(configuracao.posicaoLegenda),
    custom_position: 70,
    font_name: "MicrosoftYaHeiNormal.ttc",
    text_fore_color: "#FFFFFF",
    text_background_color: "transparent",
    font_size: limitar(configuracao.tamanhoLegenda, 24, 100),
    stroke_color: "#000000",
    stroke_width: 1.5,
    n_threads: limitar(threads, 1, 32),
    paragraph_number: 1,
  };
}

export function obterConfiguracaoMoneyPrinter() {
  const workspace = carregarWorkspaceIntegracoes();
  const integracao = workspace.integracoes.find((item) => item.id === "moneyprinter-turbo");
  if (!integracao) return null;
  return {
    endpoint: integracao.endpoint || "http://127.0.0.1:8080",
    ativa: integracao.ativa,
    conectada: integracao.status === "conectada",
    diretorio: String(integracao.configuracoes.diretorioProjeto ?? ""),
    python: String(integracao.configuracoes.pythonExecutavel ?? "python"),
    threads: Number(integracao.configuracoes.threads ?? 2),
  };
}

export function motorRealDisponivel() {
  const configuracao = obterConfiguracaoMoneyPrinter();
  return Boolean(emAmbienteTauri() && configuracao?.ativa && configuracao.conectada);
}

export async function criarVideoMoneyPrinter(
  endpoint: string,
  configuracao: ConfiguracaoCriacaoVideo,
  threads = 2,
) {
  if (!emAmbienteTauri()) throw new Error("O motor real exige o aplicativo desktop.");
  return invoke<RespostaMoneyPrinter>("criar_video_moneyprinter", {
    solicitacao: {
      endpoint,
      payload: criarPayloadMoneyPrinter(configuracao, threads),
      timeoutMs: 120_000,
    },
  });
}

export async function consultarTarefaMoneyPrinter(endpoint: string, taskId: string) {
  const resposta = await invoke<RespostaMoneyPrinter>("consultar_tarefa_moneyprinter", {
    base: endpoint,
    taskId,
  });
  return { resposta, tarefa: normalizarEstadoTarefaMoneyPrinter(resposta.dados) };
}

export function excluirTarefaMoneyPrinter(endpoint: string, taskId: string) {
  return invoke<RespostaMoneyPrinter>("excluir_tarefa_moneyprinter", {
    base: endpoint,
    taskId,
  });
}

export function normalizarEstadoTarefaMoneyPrinter(dados: Record<string, unknown>): EstadoTarefaMoneyPrinter {
  const valorNumero = (chave: string, padrao: number) => {
    const valor = dados[chave];
    return typeof valor === "number" && Number.isFinite(valor) ? valor : padrao;
  };
  const listaTexto = (chave: string) => {
    const valor = dados[chave];
    return Array.isArray(valor) ? valor.filter((item): item is string => typeof item === "string") : [];
  };
  const texto = (chave: string) => (typeof dados[chave] === "string" ? String(dados[chave]) : null);

  return {
    state: valorNumero("state", 4),
    progress: limitar(valorNumero("progress", 0), 0, 100),
    videos: listaTexto("videos"),
    combinedVideos: listaTexto("combined_videos"),
    audioFile: texto("audio_file"),
    subtitleFile: texto("subtitle_file"),
    error: texto("error") ?? texto("error_message"),
  };
}

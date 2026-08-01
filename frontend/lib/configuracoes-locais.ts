import { categoriasChavesWorkspace } from "@/data/configuracoes";
import type {
  AparenciaAplicacao,
  PacoteBackupMakeFlux,
  ResultadoImportacaoBackup,
  SecaoConfiguracoes,
  UsoArmazenamentoLocal,
  WorkspaceConfiguracoes,
} from "@/types/configuracoes";

export const CHAVE_WORKSPACE_CONFIGURACOES = "makeflux:workspace-configuracoes:v1";
export const EVENTO_WORKSPACE_CONFIGURACOES = "makeflux:workspace-configuracoes-atualizado";
export const EVENTO_BLOQUEAR_APLICACAO = "makeflux:bloquear-aplicacao";

const CHAVES_TRANSFERENCIA = [
  "makeflux:transferencia-laboratorio:v1",
  "makeflux:transferencia-biblioteca:v1",
  "makeflux:transferencia-template:v1",
];

function agoraIso() {
  return new Date().toISOString();
}

export function criarConfiguracoesPadrao(): WorkspaceConfiguracoes {
  return {
    versao: 1,
    perfil: {
      nome: "Lenon Alexandre",
      email: "",
      autorMetadados: "Lenon Alexandre",
      idioma: "pt-BR",
      fotoDataUrl: "",
    },
    workspace: {
      nome: "Workspace local",
      pastaPrincipal: "",
      pastaExportacoes: "",
      pastaCache: "",
      pastaModelos: "",
      padraoNomeArquivo: "{projeto}-{data}-{versao}",
      organizarPorProjeto: true,
      abrirUltimoProjeto: true,
    },
    padroes: {
      idioma: "pt-BR",
      plataforma: "youtube-shorts",
      formato: "9:16",
      duracaoSegundos: 45,
      modoCriacao: "assistido",
      modeloIa: "openai",
      voz: "pt-BR-AntonioNeural",
      presetLegenda: "shorts-dinamica",
      qualidade: "1080p",
      codificador: "automatico",
    },
    desempenho: {
      processamento: "automatico",
      codificador: "automatico",
      threads: 8,
      tarefasSimultaneas: 1,
      limiteFila: 10,
      limiteRamGb: 8,
      prioridadeProcesso: "normal",
      pausarEmBateria: true,
      reduzirPreviaDuranteRenderizacao: true,
    },
    armazenamento: {
      limiteCacheGb: 12,
      retencaoTemporariosDias: 14,
      limparTemporariosAutomaticamente: true,
      manterExportacoes: true,
      avisarEspacoLivreGb: 8,
    },
    aparencia: {
      tema: "claro",
      densidade: "confortavel",
      escala: "100",
      reduzirAnimacoes: false,
      altoContraste: false,
      sidebarCompacta: false,
    },
    backup: {
      automatico: false,
      frequencia: "semanal",
      pastaDestino: "",
      incluirProjetos: true,
      incluirBiblioteca: true,
      incluirIntegracoes: true,
      incluirHistoricos: true,
      ultimoBackupEm: null,
    },
    seguranca: {
      bloqueioAtivo: false,
      pinHash: "",
      bloquearAposMinutos: 15,
      ocultarCaminhosRecentes: false,
      removerDadosSensiveisDosLogs: true,
      confirmarExclusoesDefinitivas: true,
    },
    atualizacoes: {
      canal: "estavel",
      verificarAutomaticamente: true,
      baixarAutomaticamente: false,
      incluirMotor: true,
      permitirRollback: true,
      ultimaVerificacaoEm: null,
      versaoAplicativo: "1.5.0",
      versaoMotor: "não detectado",
    },
    atualizadoEm: agoraIso(),
  };
}

function mesclarWorkspace(valor: Partial<WorkspaceConfiguracoes>): WorkspaceConfiguracoes {
  const padrao = criarConfiguracoesPadrao();
  return {
    ...padrao,
    ...valor,
    perfil: { ...padrao.perfil, ...valor.perfil },
    workspace: { ...padrao.workspace, ...valor.workspace },
    padroes: { ...padrao.padroes, ...valor.padroes },
    desempenho: { ...padrao.desempenho, ...valor.desempenho },
    armazenamento: { ...padrao.armazenamento, ...valor.armazenamento },
    aparencia: { ...padrao.aparencia, ...valor.aparencia, tema: "claro" },
    backup: { ...padrao.backup, ...valor.backup },
    seguranca: { ...padrao.seguranca, ...valor.seguranca },
    atualizacoes: { ...padrao.atualizacoes, ...valor.atualizacoes, versaoAplicativo: "1.5.0" },
    versao: 1,
  };
}

export function carregarConfiguracoesLocais(): WorkspaceConfiguracoes {
  if (typeof window === "undefined") return criarConfiguracoesPadrao();
  const salvo = window.localStorage.getItem(CHAVE_WORKSPACE_CONFIGURACOES);
  if (!salvo) {
    const inicial = criarConfiguracoesPadrao();
    salvarConfiguracoesLocais(inicial);
    return inicial;
  }

  try {
    return mesclarWorkspace(JSON.parse(salvo) as Partial<WorkspaceConfiguracoes>);
  } catch {
    const recuperado = criarConfiguracoesPadrao();
    salvarConfiguracoesLocais(recuperado);
    return recuperado;
  }
}

export function salvarConfiguracoesLocais(workspace: WorkspaceConfiguracoes) {
  const normalizado = mesclarWorkspace(workspace);
  if (typeof window === "undefined") return normalizado;
  const atualizado = { ...normalizado, atualizadoEm: agoraIso() };
  window.localStorage.setItem(CHAVE_WORKSPACE_CONFIGURACOES, JSON.stringify(atualizado));
  window.dispatchEvent(new CustomEvent(EVENTO_WORKSPACE_CONFIGURACOES));
  return atualizado;
}

export function atualizarSecaoConfiguracoesLocal<T extends SecaoConfiguracoes>(
  secao: T,
  dados: Partial<WorkspaceConfiguracoes[T]>,
) {
  const workspace = carregarConfiguracoesLocais();
  const atualizado = {
    ...workspace,
    [secao]: { ...(workspace[secao] as object), ...dados },
  } as WorkspaceConfiguracoes;
  return salvarConfiguracoesLocais(atualizado);
}

export function restaurarSecaoConfiguracoesLocal(secao: SecaoConfiguracoes) {
  const atual = carregarConfiguracoesLocais();
  const padrao = criarConfiguracoesPadrao();
  return salvarConfiguracoesLocais({ ...atual, [secao]: padrao[secao] });
}

export function restaurarTodasConfiguracoesLocais() {
  return salvarConfiguracoesLocais(criarConfiguracoesPadrao());
}

function tamanhoTextoEmBytes(texto: string) {
  return new TextEncoder().encode(texto).byteLength;
}

export function medirUsoArmazenamentoLocal(): UsoArmazenamentoLocal {
  if (typeof window === "undefined") return { totalBytes: 0, itens: [] };
  const itens: UsoArmazenamentoLocal["itens"] = [];
  for (let indice = 0; indice < window.localStorage.length; indice += 1) {
    const chave = window.localStorage.key(indice);
    if (!chave) continue;
    const valor = window.localStorage.getItem(chave) ?? "";
    const bytes = tamanhoTextoEmBytes(chave) + tamanhoTextoEmBytes(valor);
    itens.push({ chave, bytes, categoria: categoriasChavesWorkspace[chave] ?? "Preferências e cache" });
  }
  itens.sort((a, b) => b.bytes - a.bytes);
  return { totalBytes: itens.reduce((total, item) => total + item.bytes, 0), itens };
}

export function limparDadosTemporariosLocais() {
  if (typeof window === "undefined") return 0;
  let removidos = 0;
  for (const chave of CHAVES_TRANSFERENCIA) {
    if (window.localStorage.getItem(chave) !== null) {
      window.localStorage.removeItem(chave);
      removidos += 1;
    }
  }
  return removidos;
}

function chavePermitidaNoBackup(chave: string, workspace: WorkspaceConfiguracoes) {
  if (chave === CHAVE_WORKSPACE_CONFIGURACOES) return true;
  if (chave === "makeflux:workspace-projetos:v1" || chave === "makeflux:workspace-producao:v1") {
    return workspace.backup.incluirProjetos;
  }
  if (chave === "makeflux:workspace-biblioteca:v1") return workspace.backup.incluirBiblioteca;
  if (chave === "makeflux:workspace-integracoes:v1") return workspace.backup.incluirIntegracoes;
  if (["makeflux:workspace-laboratorio-ia:v1", "makeflux:workspace-publicacao:v1"].includes(chave)) {
    return workspace.backup.incluirHistoricos;
  }
  return chave.startsWith("makeflux:workspace-templates");
}

export function criarPacoteBackupLocal(): PacoteBackupMakeFlux {
  const workspace = carregarConfiguracoesLocais();
  const dados: Record<string, string> = {};
  if (typeof window !== "undefined") {
    for (let indice = 0; indice < window.localStorage.length; indice += 1) {
      const chave = window.localStorage.key(indice);
      if (!chave || !chavePermitidaNoBackup(chave, workspace)) continue;
      const valor = window.localStorage.getItem(chave);
      if (valor !== null) dados[chave] = valor;
    }
  }
  return { produto: "MakeFlux Studio", formato: "makeflux-backup", versao: 1, criadoEm: agoraIso(), dados };
}

export function baixarBackupLocal() {
  const pacote = criarPacoteBackupLocal();
  const conteudo = JSON.stringify(pacote, null, 2);
  const blob = new Blob([conteudo], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const ancora = document.createElement("a");
  ancora.href = url;
  ancora.download = `makeflux-studio-backup-${pacote.criadoEm.slice(0, 10)}.json`;
  document.body.appendChild(ancora);
  ancora.click();
  ancora.remove();
  URL.revokeObjectURL(url);
  atualizarSecaoConfiguracoesLocal("backup", { ultimoBackupEm: pacote.criadoEm });
  return pacote;
}

export function importarBackupLocal(conteudo: string, substituir = false): ResultadoImportacaoBackup {
  if (typeof window === "undefined") return { sucesso: false, mensagem: "Importação indisponível.", chavesImportadas: 0 };
  try {
    const pacote = JSON.parse(conteudo) as PacoteBackupMakeFlux;
    if (pacote.produto !== "MakeFlux Studio" || pacote.formato !== "makeflux-backup" || pacote.versao !== 1) {
      return { sucesso: false, mensagem: "Este arquivo não é um backup compatível do MakeFlux Studio.", chavesImportadas: 0 };
    }
    if (!pacote.dados || typeof pacote.dados !== "object") {
      return { sucesso: false, mensagem: "O backup não contém dados válidos.", chavesImportadas: 0 };
    }
    if (substituir) {
      for (const chave of Object.keys(categoriasChavesWorkspace)) window.localStorage.removeItem(chave);
    }
    let total = 0;
    for (const [chave, valor] of Object.entries(pacote.dados)) {
      if (!chave.startsWith("makeflux:") || typeof valor !== "string") continue;
      JSON.parse(valor);
      window.localStorage.setItem(chave, valor);
      total += 1;
    }
    window.dispatchEvent(new CustomEvent(EVENTO_WORKSPACE_CONFIGURACOES));
    window.dispatchEvent(new StorageEvent("storage"));
    return { sucesso: true, mensagem: `${total} áreas do workspace foram restauradas.`, chavesImportadas: total };
  } catch {
    return { sucesso: false, mensagem: "Não foi possível ler o arquivo de backup.", chavesImportadas: 0 };
  }
}

export async function gerarHashPinLocal(pin: string) {
  const bytes = new TextEncoder().encode(`makeflux-studio:${pin}`);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash)).map((item) => item.toString(16).padStart(2, "0")).join("");
}

export async function configurarPinLocal(pin: string) {
  const pinHash = await gerarHashPinLocal(pin);
  atualizarSecaoConfiguracoesLocal("seguranca", { pinHash, bloqueioAtivo: true });
  return pinHash;
}

export function removerPinLocal() {
  return atualizarSecaoConfiguracoesLocal("seguranca", { pinHash: "", bloqueioAtivo: false });
}

export async function validarPinLocal(pin: string, hashEsperado: string) {
  if (!hashEsperado) return true;
  return (await gerarHashPinLocal(pin)) === hashEsperado;
}

export function solicitarBloqueioAplicacao() {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(EVENTO_BLOQUEAR_APLICACAO));
}

export function resolverTemaAparencia(tema: AparenciaAplicacao): "claro" {
  void tema;
  return "claro";
}

export async function verificarAtualizacoesLocal() {
  const { verificarAtualizacaoRapida } = await import("@/lib/atualizador-assinado");
  try {
    const resultado = await verificarAtualizacaoRapida();
    atualizarSecaoConfiguracoesLocal("atualizacoes", { ultimaVerificacaoEm: resultado.verificadoEm });
    return resultado;
  } catch (erro) {
    const verificadoEm = agoraIso();
    atualizarSecaoConfiguracoesLocal("atualizacoes", { ultimaVerificacaoEm: verificadoEm });
    return {
      verificadoEm,
      atualizacaoDisponivel: false,
      mensagem: erro instanceof Error ? erro.message : "Não foi possível consultar o atualizador assinado.",
    };
  }
}

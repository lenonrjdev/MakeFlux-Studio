import { configuracaoInicialVideo } from "@/data/criar-video";
import { pastasProjetosIniciais } from "@/data/projetos";
import type { ConfiguracaoCriacaoVideo, IdEtapaCriacao } from "@/types/criar-video";
import type {
  EventoProjetoStudio,
  PastaProjetoStudio,
  ProjetoStudio,
  StatusProjetoStudio,
  VersaoProjetoStudio,
  WorkspaceProjetos,
} from "@/types/projeto";

export const CHAVE_WORKSPACE_PROJETOS = "makeflux:workspace-projetos:v1";
export const EVENTO_WORKSPACE_PROJETOS = "makeflux:workspace-projetos-atualizado";
const CHAVE_RASCUNHO_FASE_2 = "makeflux:rascunho-criar-video-fase-2";

function criarId(prefixo: string) {
  const identificador =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return `${prefixo}-${identificador}`;
}

export function copiarConfiguracao(configuracao: ConfiguracaoCriacaoVideo): ConfiguracaoCriacaoVideo {
  return JSON.parse(JSON.stringify(configuracao)) as ConfiguracaoCriacaoVideo;
}

function criarEvento(tipo: EventoProjetoStudio["tipo"], descricao: string, criadoEm = new Date().toISOString()) {
  return { id: criarId("evento"), tipo, descricao, criadoEm } satisfies EventoProjetoStudio;
}

function criarVersaoInicial(
  configuracao: ConfiguracaoCriacaoVideo,
  etapa: IdEtapaCriacao,
  criadaEm: string,
): VersaoProjetoStudio {
  return {
    id: criarId("versao"),
    numero: 1,
    nome: "Versão inicial",
    criadaEm,
    etapa,
    configuracao: copiarConfiguracao(configuracao),
  };
}

function criarProjetoBase({
  configuracao,
  status = "rascunho",
  pastaId = null,
  etapaAtual = "ideia",
  progresso = 8,
  favorito = false,
  atualizadoEm,
}: {
  configuracao: ConfiguracaoCriacaoVideo;
  status?: StatusProjetoStudio;
  pastaId?: string | null;
  etapaAtual?: IdEtapaCriacao;
  progresso?: number;
  favorito?: boolean;
  atualizadoEm?: string;
}): ProjetoStudio {
  const agora = atualizadoEm ?? new Date().toISOString();
  const nome = configuracao.nomeProjeto.trim() || "Novo vídeo sem título";

  return {
    id: criarId("projeto"),
    nome,
    descricao: configuracao.tema.trim() || "Projeto de vídeo ainda sem briefing definido.",
    status,
    favorito,
    pastaId,
    etapaAtual,
    progresso,
    criadoEm: agora,
    atualizadoEm: agora,
    ultimaAberturaEm: agora,
    configuracao: copiarConfiguracao(configuracao),
    versoes: [criarVersaoInicial(configuracao, etapaAtual, agora)],
    historico: [criarEvento("criado", "Projeto criado no MakeFlux Studio.", agora)],
  };
}

function criarProjetosDemonstrativos(): ProjetoStudio[] {
  const produtividade: ConfiguracaoCriacaoVideo = {
    ...copiarConfiguracao(configuracaoInicialVideo),
    nomeProjeto: "5 hábitos que sabotam sua produtividade",
    tema: "Hábitos silenciosos que prejudicam o foco durante o trabalho.",
    roteiro:
      "Você pode estar perdendo horas sem perceber. Notificações, tarefas abertas e pausas sem intenção quebram seu foco. Escolha uma prioridade, bloqueie interrupções e conclua antes de começar algo novo.",
  };

  const negocios: ConfiguracaoCriacaoVideo = {
    ...copiarConfiguracao(configuracaoInicialVideo),
    nomeProjeto: "Como a IA ajuda pequenos negócios",
    tema: "Aplicações práticas de inteligência artificial para empresas locais.",
    plataforma: "reels",
    duracao: "60 segundos",
  };

  const darkLofi: ConfiguracaoCriacaoVideo = {
    ...copiarConfiguracao(configuracaoInicialVideo),
    nomeProjeto: "Uma noite criando sem parar",
    tema: "Narrativa melancólica sobre um criador trabalhando durante a madrugada.",
    formato: "16:9",
    plataforma: "youtube",
    modeloIa: "Ollama · modelo local",
  };

  const primeiro = criarProjetoBase({
    configuracao: produtividade,
    status: "pronto",
    pastaId: "conteudo-recorrente",
    etapaAtual: "exportacao",
    progresso: 92,
    favorito: true,
    atualizadoEm: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
  });
  primeiro.historico.unshift(criarEvento("status", "Projeto preparado para renderização.", primeiro.atualizadoEm));

  const segundo = criarProjetoBase({
    configuracao: negocios,
    status: "em-edicao",
    pastaId: "marcas-e-clientes",
    etapaAtual: "cenas",
    progresso: 46,
    atualizadoEm: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  });

  const terceiro = criarProjetoBase({
    configuracao: darkLofi,
    status: "rascunho",
    pastaId: "experimentos",
    etapaAtual: "roteiro",
    progresso: 24,
    atualizadoEm: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
  });

  return [primeiro, segundo, terceiro];
}

function criarWorkspaceInicial(): WorkspaceProjetos {
  const projetos = criarProjetosDemonstrativos();

  if (typeof window !== "undefined") {
    const rascunhoAnterior = window.localStorage.getItem(CHAVE_RASCUNHO_FASE_2);
    if (rascunhoAnterior) {
      try {
        const configuracao = {
          ...copiarConfiguracao(configuracaoInicialVideo),
          ...(JSON.parse(rascunhoAnterior) as Partial<ConfiguracaoCriacaoVideo>),
        };
        const migrado = criarProjetoBase({ configuracao, status: "rascunho", etapaAtual: "ideia", progresso: 10 });
        migrado.historico.unshift(criarEvento("autosave", "Rascunho da Fase 2 migrado para Projetos."));
        projetos.unshift(migrado);
        window.localStorage.removeItem(CHAVE_RASCUNHO_FASE_2);
      } catch {
        window.localStorage.removeItem(CHAVE_RASCUNHO_FASE_2);
      }
    }
  }

  return { versao: 1, projetos, pastas: pastasProjetosIniciais.map((pasta) => ({ ...pasta })) };
}

function validarWorkspace(valor: unknown): valor is WorkspaceProjetos {
  if (!valor || typeof valor !== "object") return false;
  const workspace = valor as Partial<WorkspaceProjetos>;
  return workspace.versao === 1 && Array.isArray(workspace.projetos) && Array.isArray(workspace.pastas);
}

export function carregarWorkspaceProjetos(): WorkspaceProjetos {
  if (typeof window === "undefined") return { versao: 1, projetos: [], pastas: [] };

  const armazenado = window.localStorage.getItem(CHAVE_WORKSPACE_PROJETOS);
  if (armazenado) {
    try {
      const workspace = JSON.parse(armazenado) as unknown;
      if (validarWorkspace(workspace)) return workspace;
    } catch {
      window.localStorage.removeItem(CHAVE_WORKSPACE_PROJETOS);
    }
  }

  const inicial = criarWorkspaceInicial();
  salvarWorkspaceProjetos(inicial);
  return inicial;
}

export function salvarWorkspaceProjetos(workspace: WorkspaceProjetos) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHAVE_WORKSPACE_PROJETOS, JSON.stringify(workspace));
  window.dispatchEvent(new CustomEvent(EVENTO_WORKSPACE_PROJETOS));
}

function transformarWorkspace(transformador: (workspace: WorkspaceProjetos) => WorkspaceProjetos) {
  const atual = carregarWorkspaceProjetos();
  const proximo = transformador(atual);
  salvarWorkspaceProjetos(proximo);
  return proximo;
}

export function obterProjetoLocal(id: string) {
  return carregarWorkspaceProjetos().projetos.find((projeto) => projeto.id === id) ?? null;
}

export function calcularProgressoProjeto(etapa: IdEtapaCriacao, configuracao: ConfiguracaoCriacaoVideo) {
  const progressoEtapa: Record<IdEtapaCriacao, number> = {
    ideia: 12,
    roteiro: 28,
    cenas: 45,
    narracao: 60,
    legendas: 72,
    musica: 84,
    exportacao: 94,
  };
  let progresso = progressoEtapa[etapa];
  if (configuracao.tema.trim()) progresso += 2;
  if (configuracao.roteiro.trim()) progresso += 3;
  if (configuracao.cenas.length > 0) progresso += 1;
  return Math.min(progresso, 99);
}

export function criarProjetoLocal(configuracao = copiarConfiguracao(configuracaoInicialVideo)) {
  const projeto = criarProjetoBase({ configuracao });
  transformarWorkspace((workspace) => ({ ...workspace, projetos: [projeto, ...workspace.projetos] }));
  return projeto;
}

export function salvarConfiguracaoProjetoLocal({
  id,
  configuracao,
  etapaAtual,
  status,
  registrarAutosave = true,
}: {
  id: string;
  configuracao: ConfiguracaoCriacaoVideo;
  etapaAtual: IdEtapaCriacao;
  status?: StatusProjetoStudio;
  registrarAutosave?: boolean;
}) {
  const agora = new Date().toISOString();
  let atualizado: ProjetoStudio | null = null;

  transformarWorkspace((workspace) => ({
    ...workspace,
    projetos: workspace.projetos.map((projeto) => {
      if (projeto.id !== id) return projeto;
      const ultimoAutosave = projeto.historico.find((evento) => evento.tipo === "autosave");
      const deveRegistrar =
        registrarAutosave &&
        (!ultimoAutosave || new Date(agora).getTime() - new Date(ultimoAutosave.criadoEm).getTime() > 1000 * 60 * 10);
      atualizado = {
        ...projeto,
        nome: configuracao.nomeProjeto.trim() || "Novo vídeo sem título",
        descricao: configuracao.tema.trim() || "Projeto de vídeo ainda sem briefing definido.",
        configuracao: copiarConfiguracao(configuracao),
        etapaAtual,
        status: status ?? (projeto.status === "arquivado" ? "rascunho" : projeto.status),
        progresso: calcularProgressoProjeto(etapaAtual, configuracao),
        atualizadoEm: agora,
        ultimaAberturaEm: agora,
        historico: deveRegistrar
          ? [criarEvento("autosave", "Alterações salvas automaticamente.", agora), ...projeto.historico].slice(0, 80)
          : projeto.historico,
      };
      return atualizado;
    }),
  }));

  return atualizado;
}

export function criarVersaoProjetoLocal(id: string, nome?: string) {
  let versaoCriada: VersaoProjetoStudio | null = null;
  transformarWorkspace((workspace) => ({
    ...workspace,
    projetos: workspace.projetos.map((projeto) => {
      if (projeto.id !== id) return projeto;
      const agora = new Date().toISOString();
      versaoCriada = {
        id: criarId("versao"),
        numero: (projeto.versoes[0]?.numero ?? 0) + 1,
        nome: nome?.trim() || `Versão ${(projeto.versoes[0]?.numero ?? 0) + 1}`,
        criadaEm: agora,
        etapa: projeto.etapaAtual,
        configuracao: copiarConfiguracao(projeto.configuracao),
      };
      return {
        ...projeto,
        atualizadoEm: agora,
        versoes: [versaoCriada, ...projeto.versoes].slice(0, 20),
        historico: [criarEvento("versao", `${versaoCriada.nome} salva no histórico.`, agora), ...projeto.historico].slice(0, 80),
      };
    }),
  }));
  return versaoCriada;
}

export function restaurarVersaoProjetoLocal(projetoId: string, versaoId: string) {
  let restaurado: ProjetoStudio | null = null;
  transformarWorkspace((workspace) => ({
    ...workspace,
    projetos: workspace.projetos.map((projeto) => {
      if (projeto.id !== projetoId) return projeto;
      const versao = projeto.versoes.find((item) => item.id === versaoId);
      if (!versao) return projeto;
      const agora = new Date().toISOString();
      restaurado = {
        ...projeto,
        nome: versao.configuracao.nomeProjeto,
        descricao: versao.configuracao.tema || projeto.descricao,
        configuracao: copiarConfiguracao(versao.configuracao),
        etapaAtual: versao.etapa,
        status: "em-edicao",
        progresso: calcularProgressoProjeto(versao.etapa, versao.configuracao),
        atualizadoEm: agora,
        historico: [criarEvento("restaurado", `${versao.nome} restaurada.`, agora), ...projeto.historico].slice(0, 80),
      };
      return restaurado;
    }),
  }));
  return restaurado;
}

export function alternarFavoritoProjetoLocal(id: string) {
  transformarWorkspace((workspace) => ({
    ...workspace,
    projetos: workspace.projetos.map((projeto) =>
      projeto.id === id ? { ...projeto, favorito: !projeto.favorito, atualizadoEm: new Date().toISOString() } : projeto,
    ),
  }));
}

export function duplicarProjetoLocal(id: string) {
  const original = obterProjetoLocal(id);
  if (!original) return null;
  const agora = new Date().toISOString();
  const duplicado = criarProjetoBase({
    configuracao: { ...copiarConfiguracao(original.configuracao), nomeProjeto: `${original.nome} — cópia` },
    status: "rascunho",
    pastaId: original.pastaId,
    etapaAtual: original.etapaAtual,
    progresso: original.progresso,
    atualizadoEm: agora,
  });
  duplicado.historico = [criarEvento("duplicado", `Projeto duplicado de “${original.nome}”.`, agora), ...duplicado.historico];
  transformarWorkspace((workspace) => ({ ...workspace, projetos: [duplicado, ...workspace.projetos] }));
  return duplicado;
}

export function alterarStatusProjetoLocal(id: string, status: StatusProjetoStudio) {
  transformarWorkspace((workspace) => ({
    ...workspace,
    projetos: workspace.projetos.map((projeto) => {
      if (projeto.id !== id) return projeto;
      const agora = new Date().toISOString();
      return {
        ...projeto,
        status,
        progresso: status === "concluido" ? 100 : projeto.progresso,
        atualizadoEm: agora,
        historico: [criarEvento("status", `Status alterado para ${status}.`, agora), ...projeto.historico].slice(0, 80),
      };
    }),
  }));
}

export function arquivarProjetoLocal(id: string) {
  alterarStatusProjetoLocal(id, "arquivado");
}

export function excluirProjetoLocal(id: string) {
  transformarWorkspace((workspace) => ({
    ...workspace,
    projetos: workspace.projetos.filter((projeto) => projeto.id !== id),
  }));
}

export function criarPastaProjetoLocal(nome: string) {
  const pasta: PastaProjetoStudio = {
    id: criarId("pasta"),
    nome: nome.trim(),
    criadaEm: new Date().toISOString(),
  };
  transformarWorkspace((workspace) => ({ ...workspace, pastas: [...workspace.pastas, pasta] }));
  return pasta;
}

export function moverProjetoParaPastaLocal(id: string, pastaId: string | null) {
  transformarWorkspace((workspace) => ({
    ...workspace,
    projetos: workspace.projetos.map((projeto) => {
      if (projeto.id !== id) return projeto;
      const agora = new Date().toISOString();
      return {
        ...projeto,
        pastaId,
        atualizadoEm: agora,
        historico: [criarEvento("movido", "Projeto movido para outra pasta.", agora), ...projeto.historico].slice(0, 80),
      };
    }),
  }));
}

export function removerPastaProjetoLocal(id: string) {
  transformarWorkspace((workspace) => ({
    ...workspace,
    pastas: workspace.pastas.filter((pasta) => pasta.id !== id || pasta.fixa),
    projetos: workspace.projetos.map((projeto) => (projeto.pastaId === id ? { ...projeto, pastaId: null } : projeto)),
  }));
}

export function exportarProjetoComoJson(projeto: ProjetoStudio) {
  if (typeof window === "undefined") return;
  const arquivo = new Blob([JSON.stringify(projeto, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${projeto.nome.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "projeto"}.makeflux.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function formatarDataProjeto(data: string) {
  const valor = new Date(data);
  const agora = new Date();
  const diferenca = agora.getTime() - valor.getTime();
  const minutos = Math.floor(diferenca / 60000);
  if (minutos < 1) return "Agora";
  if (minutos < 60) return `Há ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `Há ${horas}h`;
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(valor);
}

import { carregarWorkspaceProducao } from "@/lib/producao-local";
import { carregarWorkspaceProjetos } from "@/lib/projetos-locais";
import type {
  DadosCriarPublicacao,
  EventoPublicacao,
  PlataformaPublicacao,
  PublicacaoStudio,
  StatusPublicacao,
  WorkspacePublicacao,
} from "@/types/publicacao";

export const CHAVE_WORKSPACE_PUBLICACAO = "makeflux:workspace-publicacao:v1";
export const EVENTO_WORKSPACE_PUBLICACAO = "makeflux:workspace-publicacao-atualizado";

function gerarId(prefixo: string) {
  return `${prefixo}-${crypto.randomUUID()}`;
}

function copiarPublicacao(publicacao: PublicacaoStudio): PublicacaoStudio {
  return JSON.parse(JSON.stringify(publicacao)) as PublicacaoStudio;
}

function criarEvento(tipo: EventoPublicacao["tipo"], descricao: string, criadoEm = new Date().toISOString()): EventoPublicacao {
  return { id: gerarId("evento"), tipo, descricao, criadoEm };
}

function hashtagsPadrao(plataforma: PlataformaPublicacao) {
  const base = ["makeflux", "criacaodeconteudo", "video", "inteligenciaartificial"];
  if (plataforma === "youtube" || plataforma === "youtube-shorts") return [...base, "youtube", "shorts"];
  if (plataforma === "instagram-reels") return [...base, "reels", "instagram"];
  return [...base, "tiktok", "paravoce"];
}

function criarPublicacoesDemonstrativas(): PublicacaoStudio[] {
  const agora = new Date();
  const amanha = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1, 18, 30);
  const anterior = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - 3, 16, 0);
  const criadoEm = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - 5, 10, 0).toISOString();

  return [
    {
      id: "publicacao-demo-agendada",
      projetoId: null,
      tarefaId: null,
      nome: "5 hábitos para produzir melhor",
      plataforma: "instagram-reels",
      status: "agendada",
      titulo: "5 hábitos que mudam sua produtividade",
      descricao: "Pequenas mudanças de rotina que ajudam a produzir mais sem transformar o dia em uma corrida.",
      hashtags: ["produtividade", "rotina", "reels", "criadores"],
      chamadaParaAcao: "Qual desses hábitos você já pratica?",
      estiloThumbnail: "contraste",
      textoThumbnail: "PRODUZA MELHOR",
      corThumbnail: "#1f9b83",
      caminhoVideo: "C:\\MakeFlux Studio\\exports\\habitos-produtividade.mp4",
      nomeArquivo: "habitos-produtividade.mp4",
      duracao: "00:42",
      formato: "9:16",
      agendadaPara: amanha.toISOString(),
      publicadaEm: null,
      linkPublicado: "",
      favorito: true,
      criadoEm,
      atualizadoEm: criadoEm,
      historico: [
        criarEvento("criada", "Publicação criada a partir de um vídeo concluído.", criadoEm),
        criarEvento("agendada", "Publicação agendada para o próximo ciclo de conteúdo.", criadoEm),
      ],
    },
    {
      id: "publicacao-demo-publicada",
      projetoId: null,
      tarefaId: null,
      nome: "IA para pequenos negócios",
      plataforma: "youtube-shorts",
      status: "publicada",
      titulo: "3 usos de IA que todo pequeno negócio deveria conhecer",
      descricao: "Exemplos simples para automatizar tarefas, atender clientes e entender dados.",
      hashtags: ["ia", "negocios", "shorts", "automacao"],
      chamadaParaAcao: "Salve para testar depois.",
      estiloThumbnail: "texto-grande",
      textoThumbnail: "IA NO NEGÓCIO",
      corThumbnail: "#d5a23f",
      caminhoVideo: "C:\\MakeFlux Studio\\exports\\ia-negocios.mp4",
      nomeArquivo: "ia-negocios.mp4",
      duracao: "00:38",
      formato: "9:16",
      agendadaPara: null,
      publicadaEm: anterior.toISOString(),
      linkPublicado: "https://www.youtube.com/shorts/exemplo",
      favorito: false,
      criadoEm,
      atualizadoEm: anterior.toISOString(),
      historico: [
        criarEvento("criada", "Publicação criada.", criadoEm),
        criarEvento("publicada", "Link da publicação registrado.", anterior.toISOString()),
      ],
    },
  ];
}

function criarWorkspaceInicial(): WorkspacePublicacao {
  return { versao: 1, publicacoes: criarPublicacoesDemonstrativas() };
}

function validarWorkspace(valor: unknown): valor is WorkspacePublicacao {
  if (!valor || typeof valor !== "object") return false;
  const workspace = valor as Partial<WorkspacePublicacao>;
  return workspace.versao === 1 && Array.isArray(workspace.publicacoes);
}

export function carregarWorkspacePublicacao(): WorkspacePublicacao {
  if (typeof window === "undefined") return { versao: 1, publicacoes: [] };
  const salvo = window.localStorage.getItem(CHAVE_WORKSPACE_PUBLICACAO);
  if (!salvo) {
    const inicial = criarWorkspaceInicial();
    salvarWorkspacePublicacao(inicial);
    return inicial;
  }
  try {
    const valor: unknown = JSON.parse(salvo);
    if (validarWorkspace(valor)) return valor;
  } catch {
    // Abaixo, recuperamos um workspace íntegro sem interromper a aplicação.
  }
  const recuperado = criarWorkspaceInicial();
  salvarWorkspacePublicacao(recuperado);
  return recuperado;
}

export function salvarWorkspacePublicacao(workspace: WorkspacePublicacao) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHAVE_WORKSPACE_PUBLICACAO, JSON.stringify(workspace));
  window.dispatchEvent(new CustomEvent(EVENTO_WORKSPACE_PUBLICACAO));
}

function transformarWorkspace(transformador: (workspace: WorkspacePublicacao) => WorkspacePublicacao) {
  const atual = carregarWorkspacePublicacao();
  const proximo = transformador(atual);
  salvarWorkspacePublicacao(proximo);
  return proximo;
}

function encontrarOrigem(dados: DadosCriarPublicacao) {
  const projetos = carregarWorkspaceProjetos().projetos;
  const tarefas = carregarWorkspaceProducao().tarefas;
  const tarefa = dados.tarefaId ? tarefas.find((item) => item.id === dados.tarefaId) : null;
  const projetoId = dados.projetoId ?? tarefa?.projetoId ?? null;
  const projeto = projetoId ? projetos.find((item) => item.id === projetoId) : null;
  const arquivoVideo = tarefa?.arquivos.find((arquivo) => arquivo.tipo === "video");
  return { tarefa, projeto, arquivoVideo, projetoId };
}

export function criarPublicacaoLocal(dados: DadosCriarPublicacao) {
  const origem = encontrarOrigem(dados);
  const agora = new Date().toISOString();
  const tema = origem.projeto?.configuracao.tema || origem.tarefa?.descricao || dados.nome || "Novo conteúdo";
  const nome = dados.nome || origem.projeto?.nome || origem.tarefa?.nome || "Nova publicação";
  const titulo = tema.length > 82 ? `${tema.slice(0, 79)}...` : tema;
  const publicacao: PublicacaoStudio = {
    id: gerarId("publicacao"),
    projetoId: origem.projetoId,
    tarefaId: origem.tarefa?.id ?? null,
    nome,
    plataforma: dados.plataforma,
    status: origem.tarefa?.status === "concluida" ? "pronta" : "rascunho",
    titulo,
    descricao: origem.projeto?.configuracao.roteiro.slice(0, 220) || `Conteúdo preparado para ${nome}.`,
    hashtags: hashtagsPadrao(dados.plataforma),
    chamadaParaAcao: "Comente o que você achou e salve para ver depois.",
    estiloThumbnail: "contraste",
    textoThumbnail: nome.toUpperCase().slice(0, 34),
    corThumbnail: "#1f9b83",
    caminhoVideo: origem.arquivoVideo?.caminho ?? "",
    nomeArquivo: origem.arquivoVideo?.nome ?? "",
    duracao: origem.tarefa?.duracaoEstimada ?? origem.projeto?.configuracao.duracao ?? "",
    formato: origem.tarefa?.proporcao ?? origem.projeto?.configuracao.formato ?? "9:16",
    agendadaPara: null,
    publicadaEm: null,
    linkPublicado: "",
    favorito: false,
    criadoEm: agora,
    atualizadoEm: agora,
    historico: [criarEvento("criada", origem.tarefa ? "Publicação criada a partir da Produção." : "Rascunho de publicação criado.", agora)],
  };
  transformarWorkspace((workspace) => ({ ...workspace, publicacoes: [publicacao, ...workspace.publicacoes] }));
  return copiarPublicacao(publicacao);
}

export function criarPublicacaoDeTarefaLocal(tarefaId: string, plataforma: PlataformaPublicacao) {
  const existente = carregarWorkspacePublicacao().publicacoes.find(
    (publicacao) => publicacao.tarefaId === tarefaId && publicacao.plataforma === plataforma && publicacao.status !== "arquivada",
  );
  if (existente) return copiarPublicacao(existente);
  return criarPublicacaoLocal({ tarefaId, plataforma });
}

export function atualizarPublicacaoLocal(id: string, alteracoes: Partial<Omit<PublicacaoStudio, "id" | "criadoEm" | "historico">>) {
  let atualizada: PublicacaoStudio | null = null;
  transformarWorkspace((workspace) => ({
    ...workspace,
    publicacoes: workspace.publicacoes.map((publicacao) => {
      if (publicacao.id !== id) return publicacao;
      const agora = new Date().toISOString();
      atualizada = {
        ...publicacao,
        ...alteracoes,
        atualizadoEm: agora,
        historico: [...publicacao.historico, criarEvento("metadados", "Metadados e apresentação atualizados.", agora)],
      };
      return atualizada;
    }),
  }));
  return atualizada ? copiarPublicacao(atualizada) : null;
}

export function gerarMetadadosPublicacaoLocal(id: string) {
  const workspace = carregarWorkspacePublicacao();
  const publicacao = workspace.publicacoes.find((item) => item.id === id);
  if (!publicacao) return null;
  const nomeLimpo = publicacao.nome.replace(/[-_]+/g, " ").trim();
  return atualizarPublicacaoLocal(id, {
    titulo: `${nomeLimpo}: veja o que realmente faz diferença`,
    descricao: `Descubra os pontos principais de ${nomeLimpo.toLowerCase()} em um vídeo direto, visual e fácil de acompanhar.`,
    hashtags: hashtagsPadrao(publicacao.plataforma),
    chamadaParaAcao: "Qual ponto mais chamou sua atenção? Conte nos comentários.",
    status: publicacao.caminhoVideo ? "pronta" : publicacao.status,
  });
}

export function agendarPublicacaoLocal(id: string, agendadaPara: string) {
  let atualizada: PublicacaoStudio | null = null;
  transformarWorkspace((workspace) => ({
    ...workspace,
    publicacoes: workspace.publicacoes.map((publicacao) => {
      if (publicacao.id !== id) return publicacao;
      const agora = new Date().toISOString();
      atualizada = {
        ...publicacao,
        status: "agendada",
        agendadaPara,
        atualizadoEm: agora,
        historico: [...publicacao.historico, criarEvento("agendada", `Publicação agendada para ${new Date(agendadaPara).toLocaleString("pt-BR")}.`, agora)],
      };
      return atualizada;
    }),
  }));
  return atualizada ? copiarPublicacao(atualizada) : null;
}

export function marcarPublicacaoComoPublicadaLocal(id: string, linkPublicado: string) {
  let atualizada: PublicacaoStudio | null = null;
  transformarWorkspace((workspace) => ({
    ...workspace,
    publicacoes: workspace.publicacoes.map((publicacao) => {
      if (publicacao.id !== id) return publicacao;
      const agora = new Date().toISOString();
      atualizada = {
        ...publicacao,
        status: "publicada",
        linkPublicado,
        publicadaEm: agora,
        agendadaPara: null,
        atualizadoEm: agora,
        historico: [...publicacao.historico, criarEvento("publicada", "Publicação marcada como concluída e link registrado.", agora)],
      };
      return atualizada;
    }),
  }));
  return atualizada ? copiarPublicacao(atualizada) : null;
}

export function alterarStatusPublicacaoLocal(id: string, status: StatusPublicacao) {
  return atualizarPublicacaoLocal(id, {
    status,
    agendadaPara: status === "agendada" ? undefined : null,
  });
}

export function alternarFavoritoPublicacaoLocal(id: string) {
  const atual = carregarWorkspacePublicacao().publicacoes.find((item) => item.id === id);
  return atual ? atualizarPublicacaoLocal(id, { favorito: !atual.favorito }) : null;
}

export function duplicarPublicacaoLocal(id: string) {
  const original = carregarWorkspacePublicacao().publicacoes.find((item) => item.id === id);
  if (!original) return null;
  const agora = new Date().toISOString();
  const duplicada: PublicacaoStudio = {
    ...copiarPublicacao(original),
    id: gerarId("publicacao"),
    nome: `${original.nome} — cópia`,
    status: "rascunho",
    agendadaPara: null,
    publicadaEm: null,
    linkPublicado: "",
    favorito: false,
    criadoEm: agora,
    atualizadoEm: agora,
    historico: [criarEvento("duplicada", `Criada a partir de “${original.nome}”.`, agora)],
  };
  transformarWorkspace((workspace) => ({ ...workspace, publicacoes: [duplicada, ...workspace.publicacoes] }));
  return copiarPublicacao(duplicada);
}

export function arquivarPublicacaoLocal(id: string) {
  const atual = carregarWorkspacePublicacao().publicacoes.find((item) => item.id === id);
  if (!atual) return null;
  const status: StatusPublicacao = atual.status === "arquivada" ? "rascunho" : "arquivada";
  return atualizarPublicacaoLocal(id, { status });
}

export function excluirPublicacaoLocal(id: string) {
  transformarWorkspace((workspace) => ({
    ...workspace,
    publicacoes: workspace.publicacoes.filter((publicacao) => publicacao.id !== id),
  }));
}

export function formatarDataPublicacao(data: string | null) {
  if (!data) return "Sem data";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(data));
}

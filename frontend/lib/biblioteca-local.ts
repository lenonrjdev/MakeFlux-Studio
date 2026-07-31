import {
  colecoesBibliotecaIniciais,
  extensoesPorTipoBiblioteca,
  recursosBibliotecaIniciais,
} from "@/data/biblioteca";
import { carregarWorkspaceLaboratorioIa } from "@/lib/laboratorio-ia-local";
import { carregarWorkspaceProducao } from "@/lib/producao-local";
import type {
  ArquivoImportacaoBiblioteca,
  ColecaoBiblioteca,
  RecursoBiblioteca,
  TipoRecursoBiblioteca,
  TransferenciaBibliotecaEstudio,
  WorkspaceBiblioteca,
} from "@/types/biblioteca";

export const CHAVE_WORKSPACE_BIBLIOTECA = "makeflux:workspace-biblioteca:v1";
export const EVENTO_WORKSPACE_BIBLIOTECA = "makeflux:workspace-biblioteca-atualizado";
export const CHAVE_TRANSFERENCIA_BIBLIOTECA = "makeflux:transferencia-biblioteca:v1";

const workspaceInicial: WorkspaceBiblioteca = {
  versao: 1,
  pastaRaiz: "Biblioteca local do MakeFlux Studio",
  recursos: recursosBibliotecaIniciais,
  colecoes: colecoesBibliotecaIniciais,
};

function copiarWorkspace(workspace: WorkspaceBiblioteca): WorkspaceBiblioteca {
  return JSON.parse(JSON.stringify(workspace)) as WorkspaceBiblioteca;
}

function criarId(prefixo: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefixo}-${crypto.randomUUID()}`;
  }
  return `${prefixo}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizarWorkspace(valor: unknown): WorkspaceBiblioteca {
  if (!valor || typeof valor !== "object") return copiarWorkspace(workspaceInicial);
  const candidato = valor as Partial<WorkspaceBiblioteca>;
  if (candidato.versao !== 1 || !Array.isArray(candidato.recursos) || !Array.isArray(candidato.colecoes)) {
    return copiarWorkspace(workspaceInicial);
  }
  return {
    versao: 1,
    pastaRaiz: candidato.pastaRaiz || workspaceInicial.pastaRaiz,
    recursos: candidato.recursos,
    colecoes: candidato.colecoes,
  };
}

export function carregarWorkspaceBiblioteca(): WorkspaceBiblioteca {
  if (typeof window === "undefined") return copiarWorkspace(workspaceInicial);
  const salvo = window.localStorage.getItem(CHAVE_WORKSPACE_BIBLIOTECA);
  if (!salvo) return copiarWorkspace(workspaceInicial);
  try {
    return copiarWorkspace(normalizarWorkspace(JSON.parse(salvo)));
  } catch {
    return copiarWorkspace(workspaceInicial);
  }
}

export function salvarWorkspaceBiblioteca(workspace: WorkspaceBiblioteca) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHAVE_WORKSPACE_BIBLIOTECA, JSON.stringify(workspace));
  window.dispatchEvent(new CustomEvent(EVENTO_WORKSPACE_BIBLIOTECA));
}

function transformarWorkspace(
  transformacao: (workspace: WorkspaceBiblioteca) => WorkspaceBiblioteca,
) {
  const proximo = transformacao(carregarWorkspaceBiblioteca());
  salvarWorkspaceBiblioteca(proximo);
  return proximo;
}

function extensaoDoArquivo(nome: string) {
  return nome.includes(".") ? nome.split(".").pop()?.toLowerCase() ?? "arquivo" : "arquivo";
}

function inferirTipoRecurso(nome: string, tipoMime = ""): TipoRecursoBiblioteca {
  const extensao = extensaoDoArquivo(nome);
  if (tipoMime.startsWith("video/") || extensoesPorTipoBiblioteca.video.includes(extensao)) return "video";
  if (tipoMime.startsWith("image/") || extensoesPorTipoBiblioteca.imagem.includes(extensao)) return "imagem";
  if (tipoMime.startsWith("font/") || extensoesPorTipoBiblioteca.fonte.includes(extensao)) return "fonte";
  if (extensoesPorTipoBiblioteca.legenda.includes(extensao)) return "legenda";
  if (tipoMime.startsWith("audio/") || extensoesPorTipoBiblioteca.musica.includes(extensao)) return "musica";
  if (extensoesPorTipoBiblioteca.prompt.includes(extensao)) return "prompt";
  return "video";
}

export function formatarTamanhoBiblioteca(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} GB`;
}

export function importarArquivosBibliotecaLocal(
  arquivos: ArquivoImportacaoBiblioteca[],
  colecaoId?: string,
  tipoForcado?: TipoRecursoBiblioteca,
) {
  const agora = new Date().toISOString();
  const recursos: RecursoBiblioteca[] = arquivos.map((arquivo) => {
    const tipo = tipoForcado ?? inferirTipoRecurso(arquivo.nome, arquivo.tipoMime);
    const extensao = extensaoDoArquivo(arquivo.nome);
    return {
      id: criarId("recurso"),
      nome: arquivo.nome.replace(new RegExp(`\\.${extensao}$`, "i"), ""),
      tipo,
      descricao: "Arquivo importado para a biblioteca local.",
      extensao,
      mimeType: arquivo.tipoMime || "application/octet-stream",
      tamanhoBytes: arquivo.tamanho,
      tamanhoRotulo: formatarTamanhoBiblioteca(arquivo.tamanho),
      caminho: arquivo.caminho || `Biblioteca/${arquivo.nome}`,
      origem: "local",
      status: "disponivel",
      colecaoId,
      tags: [tipo, extensao],
      favorito: false,
      usos: 0,
      projetoIds: [],
      criadoEm: agora,
      atualizadoEm: agora,
    };
  });

  transformarWorkspace((workspace) => ({
    ...workspace,
    recursos: [...recursos, ...workspace.recursos],
  }));
  return recursos;
}

export function atualizarRecursoBibliotecaLocal(
  id: string,
  alteracoes: Partial<Pick<RecursoBiblioteca, "nome" | "descricao" | "colecaoId" | "tags" | "status">>,
) {
  let resultado: RecursoBiblioteca | null = null;
  transformarWorkspace((workspace) => ({
    ...workspace,
    recursos: workspace.recursos.map((recurso) => {
      if (recurso.id !== id) return recurso;
      resultado = { ...recurso, ...alteracoes, atualizadoEm: new Date().toISOString() };
      return resultado;
    }),
  }));
  return resultado;
}

export function alternarFavoritoRecursoBibliotecaLocal(id: string) {
  let resultado: RecursoBiblioteca | null = null;
  transformarWorkspace((workspace) => ({
    ...workspace,
    recursos: workspace.recursos.map((recurso) => {
      if (recurso.id !== id) return recurso;
      resultado = { ...recurso, favorito: !recurso.favorito, atualizadoEm: new Date().toISOString() };
      return resultado;
    }),
  }));
  return resultado;
}

export function moverRecursoBibliotecaLocal(id: string, colecaoId?: string) {
  return atualizarRecursoBibliotecaLocal(id, { colecaoId });
}

export function duplicarRecursoBibliotecaLocal(id: string) {
  const original = carregarWorkspaceBiblioteca().recursos.find((recurso) => recurso.id === id);
  if (!original) return null;
  const agora = new Date().toISOString();
  const duplicado: RecursoBiblioteca = {
    ...original,
    id: criarId("recurso"),
    referenciaExterna: undefined,
    nome: `${original.nome} · cópia`,
    favorito: false,
    usos: 0,
    projetoIds: [],
    criadoEm: agora,
    atualizadoEm: agora,
  };
  transformarWorkspace((workspace) => ({
    ...workspace,
    recursos: [duplicado, ...workspace.recursos],
  }));
  return duplicado;
}

export function excluirRecursoBibliotecaLocal(id: string) {
  transformarWorkspace((workspace) => ({
    ...workspace,
    recursos: workspace.recursos.filter((recurso) => recurso.id !== id),
  }));
}

export function criarColecaoBibliotecaLocal(nome: string, descricao = "") {
  const colecao: ColecaoBiblioteca = {
    id: criarId("colecao"),
    nome: nome.trim() || "Nova coleção",
    descricao: descricao.trim() || "Coleção personalizada da biblioteca.",
    sistema: false,
    criadoEm: new Date().toISOString(),
  };
  transformarWorkspace((workspace) => ({
    ...workspace,
    colecoes: [...workspace.colecoes, colecao],
  }));
  return colecao;
}

export function removerColecaoBibliotecaLocal(id: string) {
  transformarWorkspace((workspace) => ({
    ...workspace,
    colecoes: workspace.colecoes.filter((colecao) => colecao.id !== id || colecao.sistema),
    recursos: workspace.recursos.map((recurso) =>
      recurso.colecaoId === id ? { ...recurso, colecaoId: undefined } : recurso,
    ),
  }));
}

export function definirPastaRaizBibliotecaLocal(pastaRaiz: string) {
  transformarWorkspace((workspace) => ({ ...workspace, pastaRaiz }));
}

function tipoArquivoProducao(tipo: "video" | "audio" | "legenda" | "log"): TipoRecursoBiblioteca | null {
  if (tipo === "video") return "exportacao";
  if (tipo === "audio") return "narracao";
  if (tipo === "legenda") return "legenda";
  return null;
}

export function sincronizarExportacoesProducaoBibliotecaLocal() {
  const workspace = carregarWorkspaceBiblioteca();
  const referencias = new Set(workspace.recursos.map((recurso) => recurso.referenciaExterna).filter(Boolean));
  const adicionados: RecursoBiblioteca[] = [];

  for (const tarefa of carregarWorkspaceProducao().tarefas) {
    if (tarefa.status !== "concluida") continue;
    for (const arquivo of tarefa.arquivos) {
      const tipo = tipoArquivoProducao(arquivo.tipo);
      const referenciaExterna = `producao:${tarefa.id}:${arquivo.id}`;
      if (!tipo || referencias.has(referenciaExterna)) continue;
      const extensao = extensaoDoArquivo(arquivo.nome);
      const tamanhoNumerico = Number.parseFloat(arquivo.tamanho.replace(",", ".")) || 0;
      const tamanhoBytes = arquivo.tamanho.toLowerCase().includes("mb")
        ? Math.round(tamanhoNumerico * 1024 * 1024)
        : Math.round(tamanhoNumerico * 1024);
      adicionados.push({
        id: criarId("recurso"),
        referenciaExterna,
        nome: tipo === "exportacao" ? tarefa.nome : arquivo.nome.replace(new RegExp(`\\.${extensao}$`, "i"), ""),
        tipo,
        descricao: `Arquivo gerado pela produção “${tarefa.nome}”.`,
        extensao,
        mimeType: tipo === "legenda" ? "application/x-subrip" : tipo === "narracao" ? "audio/mpeg" : "video/mp4",
        tamanhoBytes,
        tamanhoRotulo: arquivo.tamanho,
        duracao: tarefa.duracaoEstimada,
        dimensoes: tipo === "exportacao" ? tarefa.qualidade : undefined,
        caminho: arquivo.caminho,
        origem: "producao",
        status: "disponivel",
        tags: [tipo, tarefa.formato, tarefa.qualidade],
        favorito: false,
        usos: 0,
        projetoIds: [tarefa.projetoId],
        criadoEm: tarefa.concluidaEm ?? tarefa.atualizadaEm,
        atualizadoEm: tarefa.concluidaEm ?? tarefa.atualizadaEm,
      });
      referencias.add(referenciaExterna);
    }
  }

  if (adicionados.length > 0) {
    salvarWorkspaceBiblioteca({ ...workspace, recursos: [...adicionados, ...workspace.recursos] });
  }
  return adicionados;
}

export function sincronizarPromptsLaboratorioBibliotecaLocal() {
  const workspace = carregarWorkspaceBiblioteca();
  const referencias = new Set(workspace.recursos.map((recurso) => recurso.referenciaExterna).filter(Boolean));
  const agora = new Date().toISOString();
  const adicionados: RecursoBiblioteca[] = [];

  for (const preset of carregarWorkspaceLaboratorioIa().presets) {
    const referenciaExterna = `laboratorio:preset:${preset.id}`;
    if (referencias.has(referenciaExterna)) continue;
    adicionados.push({
      id: criarId("recurso"),
      referenciaExterna,
      nome: preset.nome,
      tipo: "prompt",
      descricao: preset.descricao,
      conteudo: `${preset.promptSistema}\n\n${preset.promptUsuario}`.trim(),
      extensao: "prompt",
      mimeType: "text/plain",
      tamanhoBytes: preset.promptSistema.length + preset.promptUsuario.length,
      tamanhoRotulo: formatarTamanhoBiblioteca(preset.promptSistema.length + preset.promptUsuario.length),
      caminho: `Laboratório/Prompts/${preset.id}`,
      origem: "laboratorio",
      status: "disponivel",
      tags: [preset.tipo, "prompt", "laboratório"],
      favorito: preset.favorito,
      usos: 0,
      projetoIds: [],
      criadoEm: agora,
      atualizadoEm: agora,
    });
    referencias.add(referenciaExterna);
  }

  if (adicionados.length > 0) {
    salvarWorkspaceBiblioteca({ ...workspace, recursos: [...adicionados, ...workspace.recursos] });
  }
  return adicionados;
}

export function prepararTransferenciaBibliotecaParaEstudio(recursoId: string) {
  if (typeof window === "undefined") return null;
  const recurso = carregarWorkspaceBiblioteca().recursos.find((item) => item.id === recursoId);
  if (!recurso || recurso.tipo === "exportacao" || recurso.tipo === "fonte") return null;

  const transferencia: TransferenciaBibliotecaEstudio = {
    versao: 1,
    recursoId: recurso.id,
    tipo: recurso.tipo,
    nome: recurso.nome,
    caminho: recurso.caminho,
    descricao: recurso.descricao,
    conteudo: recurso.conteudo,
    criadoEm: new Date().toISOString(),
  };
  window.localStorage.setItem(CHAVE_TRANSFERENCIA_BIBLIOTECA, JSON.stringify(transferencia));

  transformarWorkspace((workspace) => ({
    ...workspace,
    recursos: workspace.recursos.map((item) =>
      item.id === recurso.id
        ? { ...item, usos: item.usos + 1, atualizadoEm: new Date().toISOString() }
        : item,
    ),
  }));
  return transferencia;
}

export function consumirTransferenciaBibliotecaParaEstudio() {
  if (typeof window === "undefined") return null;
  const salvo = window.localStorage.getItem(CHAVE_TRANSFERENCIA_BIBLIOTECA);
  if (!salvo) return null;
  window.localStorage.removeItem(CHAVE_TRANSFERENCIA_BIBLIOTECA);
  try {
    const transferencia = JSON.parse(salvo) as TransferenciaBibliotecaEstudio;
    return transferencia.versao === 1 ? transferencia : null;
  } catch {
    return null;
  }
}

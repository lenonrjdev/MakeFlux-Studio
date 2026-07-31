import { configuracaoInicialVideo } from "@/data/criar-video";
import { criarTemplatesSistema } from "@/data/templates";
import { copiarConfiguracao, obterProjetoLocal } from "@/lib/projetos-locais";
import type { ConfiguracaoCriacaoVideo } from "@/types/criar-video";
import type {
  CategoriaTemplate,
  ImportacaoTemplate,
  StatusTemplate,
  TemplateStudio,
  TransferenciaTemplateEstudio,
  WorkspaceTemplates,
} from "@/types/templates";

export const CHAVE_WORKSPACE_TEMPLATES = "makeflux:workspace-templates:v1";
export const EVENTO_WORKSPACE_TEMPLATES = "makeflux:workspace-templates-atualizado";
export const CHAVE_TRANSFERENCIA_TEMPLATE = "makeflux:transferencia-template:v1";

function criarId(prefixo: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefixo}-${crypto.randomUUID()}`;
  }
  return `${prefixo}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function copiarTemplate(template: TemplateStudio): TemplateStudio {
  return {
    ...template,
    tags: [...template.tags],
    configuracao: copiarConfiguracao(template.configuracao),
  };
}

function workspaceInicial(): WorkspaceTemplates {
  return { versao: 1, templates: criarTemplatesSistema().map(copiarTemplate) };
}

function normalizarWorkspace(valor: unknown): WorkspaceTemplates {
  if (!valor || typeof valor !== "object") return workspaceInicial();
  const recebido = valor as Partial<WorkspaceTemplates>;
  const existentes = Array.isArray(recebido.templates) ? recebido.templates : [];
  const sistemasAtuais = criarTemplatesSistema();
  const mapaExistentes = new Map(existentes.map((template) => [template.id, template]));

  const sistemas = sistemasAtuais.map((template) => {
    const anterior = mapaExistentes.get(template.id);
    return copiarTemplate({
      ...template,
      favorito: anterior?.favorito ?? template.favorito,
      usos: anterior?.usos ?? template.usos,
      criadoEm: anterior?.criadoEm ?? template.criadoEm,
      atualizadoEm: anterior?.atualizadoEm ?? template.atualizadoEm,
    });
  });
  const personalizados = existentes
    .filter((template) => !template.sistema && !sistemasAtuais.some((sistema) => sistema.id === template.id))
    .map((template) => copiarTemplate(template));

  return { versao: 1, templates: [...sistemas, ...personalizados] };
}

export function carregarWorkspaceTemplates(): WorkspaceTemplates {
  if (typeof window === "undefined") return workspaceInicial();
  const salvo = window.localStorage.getItem(CHAVE_WORKSPACE_TEMPLATES);
  if (!salvo) {
    const inicial = workspaceInicial();
    salvarWorkspaceTemplates(inicial);
    return inicial;
  }
  try {
    const normalizado = normalizarWorkspace(JSON.parse(salvo));
    if (JSON.stringify(normalizado) !== salvo) salvarWorkspaceTemplates(normalizado);
    return normalizado;
  } catch {
    const inicial = workspaceInicial();
    salvarWorkspaceTemplates(inicial);
    return inicial;
  }
}

export function salvarWorkspaceTemplates(workspace: WorkspaceTemplates) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHAVE_WORKSPACE_TEMPLATES, JSON.stringify(workspace));
  window.dispatchEvent(new CustomEvent(EVENTO_WORKSPACE_TEMPLATES));
}

function transformarWorkspace(
  transformar: (workspace: WorkspaceTemplates) => WorkspaceTemplates,
): WorkspaceTemplates {
  const proximo = transformar(carregarWorkspaceTemplates());
  salvarWorkspaceTemplates(proximo);
  return proximo;
}

export function obterTemplateLocal(id: string): TemplateStudio | null {
  return carregarWorkspaceTemplates().templates.find((template) => template.id === id) ?? null;
}

export function criarTemplateLocal({
  nome,
  descricao,
  categoria = "personalizado",
  tags = [],
  corDestaque = "#1f9b83",
  configuracao = configuracaoInicialVideo,
  projetoOrigemId,
}: {
  nome: string;
  descricao?: string;
  categoria?: CategoriaTemplate;
  tags?: string[];
  corDestaque?: string;
  configuracao?: ConfiguracaoCriacaoVideo;
  projetoOrigemId?: string;
}): TemplateStudio {
  const agora = new Date().toISOString();
  const template: TemplateStudio = {
    id: criarId("template"),
    nome: nome.trim() || "Novo template",
    descricao: descricao?.trim() || "Template personalizado do MakeFlux Studio.",
    categoria,
    status: "ativo",
    origem: projetoOrigemId ? "projeto" : "manual",
    sistema: false,
    favorito: false,
    tags: Array.from(new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))),
    corDestaque,
    configuracao: copiarConfiguracao(configuracao),
    usos: 0,
    projetoOrigemId,
    criadoEm: agora,
    atualizadoEm: agora,
  };
  transformarWorkspace((workspace) => ({ ...workspace, templates: [template, ...workspace.templates] }));
  return template;
}

export function criarTemplateDeProjetoLocal(projetoId: string, nome?: string): TemplateStudio | null {
  const projeto = obterProjetoLocal(projetoId);
  if (!projeto) return null;
  return criarTemplateLocal({
    nome: nome?.trim() || projeto.nome,
    descricao: `Criado a partir do projeto “${projeto.nome}”.`,
    categoria: "personalizado",
    tags: [projeto.configuracao.plataforma, projeto.configuracao.formato, projeto.configuracao.objetivo],
    configuracao: projeto.configuracao,
    projetoOrigemId: projeto.id,
  });
}

export function atualizarTemplateLocal(
  id: string,
  alteracoes: Partial<
    Pick<
      TemplateStudio,
      "nome" | "descricao" | "categoria" | "status" | "tags" | "corDestaque" | "configuracao"
    >
  >,
): TemplateStudio | null {
  let resultado: TemplateStudio | null = null;
  transformarWorkspace((workspace) => ({
    ...workspace,
    templates: workspace.templates.map((template) => {
      if (template.id !== id) return template;
      resultado = copiarTemplate({
        ...template,
        ...alteracoes,
        configuracao: alteracoes.configuracao
          ? copiarConfiguracao(alteracoes.configuracao)
          : template.configuracao,
        tags: alteracoes.tags ? [...alteracoes.tags] : template.tags,
        atualizadoEm: new Date().toISOString(),
      });
      return resultado;
    }),
  }));
  return resultado;
}

export function alternarFavoritoTemplateLocal(id: string): TemplateStudio | null {
  let resultado: TemplateStudio | null = null;
  transformarWorkspace((workspace) => ({
    ...workspace,
    templates: workspace.templates.map((template) => {
      if (template.id !== id) return template;
      resultado = { ...template, favorito: !template.favorito, atualizadoEm: new Date().toISOString() };
      return resultado;
    }),
  }));
  return resultado;
}

export function duplicarTemplateLocal(id: string): TemplateStudio | null {
  const original = obterTemplateLocal(id);
  if (!original) return null;
  const agora = new Date().toISOString();
  const duplicado: TemplateStudio = copiarTemplate({
    ...original,
    id: criarId("template"),
    nome: `${original.nome} · cópia`,
    origem: "manual",
    sistema: false,
    favorito: false,
    status: "ativo",
    usos: 0,
    projetoOrigemId: undefined,
    criadoEm: agora,
    atualizadoEm: agora,
  });
  transformarWorkspace((workspace) => ({ ...workspace, templates: [duplicado, ...workspace.templates] }));
  return duplicado;
}

export function alterarStatusTemplateLocal(id: string, status: StatusTemplate): TemplateStudio | null {
  return atualizarTemplateLocal(id, { status });
}

export function excluirTemplateLocal(id: string): boolean {
  const template = obterTemplateLocal(id);
  if (!template || template.sistema) return false;
  transformarWorkspace((workspace) => ({
    ...workspace,
    templates: workspace.templates.filter((item) => item.id !== id),
  }));
  return true;
}

export function prepararTransferenciaTemplateParaEstudio(id: string): TransferenciaTemplateEstudio | null {
  if (typeof window === "undefined") return null;
  const template = obterTemplateLocal(id);
  if (!template || template.status === "arquivado") return null;
  const transferencia: TransferenciaTemplateEstudio = {
    versao: 1,
    templateId: template.id,
    nome: template.nome,
    configuracao: copiarConfiguracao(template.configuracao),
    criadoEm: new Date().toISOString(),
  };
  window.localStorage.setItem(CHAVE_TRANSFERENCIA_TEMPLATE, JSON.stringify(transferencia));
  transformarWorkspace((workspace) => ({
    ...workspace,
    templates: workspace.templates.map((item) =>
      item.id === id
        ? { ...item, usos: item.usos + 1, atualizadoEm: new Date().toISOString() }
        : item,
    ),
  }));
  return transferencia;
}

export function consumirTransferenciaTemplateParaEstudio(): TransferenciaTemplateEstudio | null {
  if (typeof window === "undefined") return null;
  const salvo = window.localStorage.getItem(CHAVE_TRANSFERENCIA_TEMPLATE);
  if (!salvo) return null;
  window.localStorage.removeItem(CHAVE_TRANSFERENCIA_TEMPLATE);
  try {
    const transferencia = JSON.parse(salvo) as TransferenciaTemplateEstudio;
    if (transferencia.versao !== 1 || !transferencia.templateId || !transferencia.configuracao) return null;
    return {
      ...transferencia,
      configuracao: copiarConfiguracao(transferencia.configuracao),
    };
  } catch {
    return null;
  }
}

export function exportarTemplateComoJson(template: TemplateStudio): string {
  const exportacao: ImportacaoTemplate = {
    versao: 1,
    template: {
      nome: template.nome,
      descricao: template.descricao,
      categoria: template.categoria,
      status: template.status,
      favorito: template.favorito,
      tags: [...template.tags],
      corDestaque: template.corDestaque,
      configuracao: copiarConfiguracao(template.configuracao),
      projetoOrigemId: template.projetoOrigemId,
    },
  };
  return JSON.stringify(exportacao, null, 2);
}

export function importarTemplateDeJson(conteudo: string): TemplateStudio | null {
  try {
    const importacao = JSON.parse(conteudo) as ImportacaoTemplate;
    if (importacao.versao !== 1 || !importacao.template?.nome || !importacao.template.configuracao) {
      return null;
    }
    const template = criarTemplateLocal({
      nome: importacao.template.nome,
      descricao: importacao.template.descricao,
      categoria: importacao.template.categoria,
      tags: importacao.template.tags,
      corDestaque: importacao.template.corDestaque,
      configuracao: importacao.template.configuracao,
    });
    return atualizarTemplateLocal(template.id, {
      status: importacao.template.status === "arquivado" ? "rascunho" : importacao.template.status,
    });
  } catch {
    return null;
  }
}

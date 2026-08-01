import { presetsLaboratorioIniciais } from "@/data/laboratorio-ia";
import type {
  ConfiguracaoNovoExperimento,
  ExperimentoLaboratorio,
  PresetPromptLaboratorio,
  ResultadoExperimentoLaboratorio,
  TipoFerramentaLaboratorio,
  TransferenciaLaboratorioEstudio,
  WorkspaceLaboratorioIa,
} from "@/types/laboratorio-ia";

export const CHAVE_WORKSPACE_LABORATORIO_IA = "makeflux:workspace-laboratorio-ia:v1";
export const EVENTO_WORKSPACE_LABORATORIO_IA = "makeflux:workspace-laboratorio-ia-atualizado";
export const CHAVE_TRANSFERENCIA_LABORATORIO = "makeflux:transferencia-laboratorio:v1";

const workspaceVazio: WorkspaceLaboratorioIa = {
  versao: 2,
  experimentos: [],
  presets: presetsLaboratorioIniciais,
};

function criarId(prefixo: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefixo}-${crypto.randomUUID()}`;
  }
  return `${prefixo}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function copiarWorkspace(workspace: WorkspaceLaboratorioIa): WorkspaceLaboratorioIa {
  return JSON.parse(JSON.stringify(workspace)) as WorkspaceLaboratorioIa;
}

function normalizarExperimento(experimento: ExperimentoLaboratorio): ExperimentoLaboratorio {
  return {
    ...experimento,
    modoExecucao: experimento.modoExecucao ?? "real",
    provedorPreferido: experimento.provedorPreferido ?? "automatico",
    permitirFallback: experimento.permitirFallback ?? true,
    maxTokensSaida: experimento.maxTokensSaida ?? 2400,
    resultados: Array.isArray(experimento.resultados)
      ? experimento.resultados.map((resultado) => ({ ...resultado, origem: resultado.origem ?? "demonstracao" }))
      : [],
  };
}

function normalizarWorkspace(valor: unknown): WorkspaceLaboratorioIa {
  if (!valor || typeof valor !== "object") return workspaceVazio;
  const candidato = valor as { versao?: number; experimentos?: ExperimentoLaboratorio[]; presets?: PresetPromptLaboratorio[] };
  if (!Array.isArray(candidato.experimentos)) return workspaceVazio;
  return {
    versao: 2,
    experimentos: candidato.experimentos.map(normalizarExperimento),
    presets: Array.isArray(candidato.presets) && candidato.presets.length > 0 ? candidato.presets : presetsLaboratorioIniciais,
  };
}

export function carregarWorkspaceLaboratorioIa(): WorkspaceLaboratorioIa {
  if (typeof window === "undefined") return copiarWorkspace(workspaceVazio);
  const salvo = window.localStorage.getItem(CHAVE_WORKSPACE_LABORATORIO_IA);
  if (!salvo) return copiarWorkspace(workspaceVazio);
  try {
    return copiarWorkspace(normalizarWorkspace(JSON.parse(salvo)));
  } catch {
    return copiarWorkspace(workspaceVazio);
  }
}

export function salvarWorkspaceLaboratorioIa(workspace: WorkspaceLaboratorioIa) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHAVE_WORKSPACE_LABORATORIO_IA, JSON.stringify(workspace));
  window.dispatchEvent(new CustomEvent(EVENTO_WORKSPACE_LABORATORIO_IA));
}

function transformarWorkspace(
  transformacao: (workspace: WorkspaceLaboratorioIa) => WorkspaceLaboratorioIa,
) {
  const proximo = transformacao(carregarWorkspaceLaboratorioIa());
  salvarWorkspaceLaboratorioIa(proximo);
  return proximo;
}

export function criarConfiguracaoExperimentoPadrao(
  tipo: TipoFerramentaLaboratorio = "roteiro",
): ConfiguracaoNovoExperimento {
  const preset = presetsLaboratorioIniciais.find((item) => item.tipo === tipo) ?? presetsLaboratorioIniciais[0];
  return {
    nome: "Novo experimento",
    tipo,
    tema: "Como a inteligência artificial pode simplificar tarefas repetitivas",
    publico: "Pessoas interessadas em produtividade e tecnologia",
    plataforma: "YouTube Shorts",
    idioma: "Português (Brasil)",
    modelo: "Configuração do provedor",
    promptSistema: preset.promptSistema,
    promptUsuario: preset.promptUsuario,
    quantidadeVariacoes: 3,
    temperatura: 0.7,
    observacoes: "",
    modoExecucao: "real",
    provedorPreferido: "automatico",
    permitirFallback: true,
    maxTokensSaida: 2400,
  };
}

export function criarExperimentoLaboratorioIaLocal(
  configuracao = criarConfiguracaoExperimentoPadrao(),
) {
  const agora = new Date().toISOString();
  const experimento: ExperimentoLaboratorio = {
    id: criarId("experimento"),
    ...configuracao,
    status: "rascunho",
    resultados: [],
    criadoEm: agora,
    atualizadoEm: agora,
  };
  transformarWorkspace((workspace) => ({
    ...workspace,
    experimentos: [experimento, ...workspace.experimentos],
  }));
  return experimento;
}

export function obterExperimentoLaboratorioIaLocal(id: string) {
  return carregarWorkspaceLaboratorioIa().experimentos.find((item) => item.id === id) ?? null;
}

export function atualizarExperimentoLaboratorioIaLocal(
  id: string,
  alteracoes: Partial<ConfiguracaoNovoExperimento>,
) {
  let resultado: ExperimentoLaboratorio | null = null;
  transformarWorkspace((workspace) => ({
    ...workspace,
    experimentos: workspace.experimentos.map((experimento) => {
      if (experimento.id !== id) return experimento;
      resultado = {
        ...experimento,
        ...alteracoes,
        status: experimento.status === "processando" ? "processando" : "rascunho",
        atualizadoEm: new Date().toISOString(),
      };
      return resultado;
    }),
  }));
  return resultado;
}

function textoRoteiro(tema: string, indice: number) {
  const aberturas = [
    "Você provavelmente repete esta tarefa todos os dias sem perceber quanto tempo ela consome.",
    "Existe uma forma simples de recuperar parte do seu dia usando inteligência artificial.",
    "O problema não é falta de produtividade: é continuar fazendo manualmente o que já pode ser automatizado.",
    "Antes de abrir mais uma planilha, observe quantas etapas da sua rotina seguem sempre o mesmo padrão.",
  ];
  const fechamentos = [
    "Comece escolhendo uma única tarefa repetitiva e transforme o processo antes de automatizar o restante.",
    "A melhor automação não elimina seu trabalho: ela devolve tempo para decisões que realmente precisam de você.",
    "Teste em pequena escala, revise o resultado e só então transforme o fluxo em um novo padrão.",
    "A pergunta agora é simples: qual tarefa da sua rotina merece ser automatizada primeiro?",
  ];
  return `${aberturas[indice % aberturas.length]}\n\nNo tema “${tema}”, o primeiro passo é identificar entradas, regras e resultado esperado. Depois, a IA pode organizar informações, criar uma primeira versão e sinalizar pontos que ainda precisam de revisão humana.\n\nIsso reduz retrabalho, mantém o processo consistente e deixa as decisões importantes sob seu controle.\n\n${fechamentos[indice % fechamentos.length]}`;
}

function textoGancho(tema: string, indice: number) {
  const ganchos = [
    `Você pode estar gastando horas com “${tema}” sem precisar.`,
    `O detalhe que quase ninguém percebe em “${tema}” é justamente o que mais consome tempo.`,
    `Antes de repetir essa tarefa mais uma vez, veja como “${tema}” pode funcionar de outro jeito.`,
    `Não é sobre trabalhar mais rápido: é parar de repetir manualmente cada etapa de “${tema}”.`,
  ];
  return ganchos[indice % ganchos.length];
}

function textoTermosVisuais(tema: string, indice: number) {
  const conjuntos = [
    [
      "professional reviewing repetitive tasks at desk",
      "artificial intelligence workflow dashboard close up",
      "automated data organization on computer screen",
      "focused creator reviewing generated content",
      "calm productive workspace final scene",
    ],
    [
      "busy office worker switching between applications",
      "digital automation flow connecting work steps",
      "AI assistant organizing documents and notes",
      "human checking automated result before approval",
      "person gaining time and closing laptop",
    ],
    [
      "manual repetitive process paperwork overhead",
      "technology interface simplifying daily workflow",
      "structured information cards moving automatically",
      "creative professional making final decision",
      "organized desk successful productivity concept",
    ],
  ];
  return `Tema de referência: ${tema}\n\n${conjuntos[indice % conjuntos.length]
    .map((termo, posicao) => `${String(posicao + 1).padStart(2, "0")}. ${termo}`)
    .join("\n")}`;
}

function textoMetadados(tema: string, indice: number) {
  const titulos = [
    "Automatize tarefas repetitivas sem perder o controle",
    "Como usar IA para recuperar tempo na rotina",
    "O primeiro processo que você deveria automatizar",
    "Pare de repetir manualmente estas etapas",
  ];
  return `Título\n${titulos[indice % titulos.length]}\n\nDescrição\nEntenda como organizar “${tema}” em um fluxo simples, automatizar a primeira versão e manter a revisão humana nas decisões importantes.\n\nChamada\nQual tarefa você automatizaria primeiro?\n\nHashtags\n#InteligenciaArtificial #Produtividade #Automacao #Tecnologia #FluxoDeTrabalho`;
}

function textoPromptSistema(tema: string, indice: number) {
  const enfoques = [
    "clareza, precisão e representabilidade visual",
    "linguagem natural, ritmo curto e responsabilidade editorial",
    "objetividade, consistência e separação entre fatos e inferências",
    "retenção responsável, frases curtas e aplicação prática",
  ];
  return `Você é um especialista em criação de vídeos curtos sobre ${tema}. Priorize ${enfoques[indice % enfoques.length]}. Não invente dados, evite introduções genéricas, preserve o idioma solicitado e produza respostas que possam ser convertidas em cenas concretas. Quando houver limitação ou ausência de contexto, sinalize isso claramente.`;
}

function gerarConteudo(tipo: TipoFerramentaLaboratorio, tema: string, indice: number) {
  switch (tipo) {
    case "gancho":
      return textoGancho(tema, indice);
    case "termos-visuais":
      return textoTermosVisuais(tema, indice);
    case "metadados":
      return textoMetadados(tema, indice);
    case "prompt-sistema":
      return textoPromptSistema(tema, indice);
    case "roteiro":
      return textoRoteiro(tema, indice);
  }
}

function gerarPontuacao(base: number, deslocamento: number) {
  return Math.min(98, Math.max(68, base + deslocamento));
}

function criarResultados(experimento: ExperimentoLaboratorio) {
  const agora = new Date().toISOString();
  return Array.from({ length: experimento.quantidadeVariacoes }, (_, indice) => {
    const conteudo = gerarConteudo(experimento.tipo, experimento.tema, indice);
    const palavras = conteudo.trim().split(/\s+/).length;
    const base = 78 + ((indice * 5 + experimento.tema.length) % 10);
    const resultado: ResultadoExperimentoLaboratorio = {
      id: criarId("resultado"),
      titulo: `Variação ${String.fromCharCode(65 + indice)}`,
      conteudo,
      resumo:
        indice === 0
          ? "Equilibrada e direta"
          : indice === 1
            ? "Mais provocativa"
            : indice === 2
              ? "Mais didática"
              : "Alternativa experimental",
      duracaoEstimada: experimento.tipo === "roteiro" ? `${Math.max(18, Math.round(palavras / 2.6))}s` : "—",
      palavras,
      pontuacoes: {
        clareza: gerarPontuacao(base, 5 - indice),
        engajamento: gerarPontuacao(base, indice * 2),
        representabilidade: gerarPontuacao(base, experimento.tipo === "termos-visuais" ? 10 : 2),
        aderencia: gerarPontuacao(base, 4),
      },
      criadoEm: agora,
      origem: "demonstracao",
    };
    return resultado;
  });
}

export function marcarExperimentoProcessandoLocal(id: string) {
  transformarWorkspace((workspace) => ({
    ...workspace,
    experimentos: workspace.experimentos.map((experimento) =>
      experimento.id === id
        ? { ...experimento, status: "processando", atualizadoEm: new Date().toISOString() }
        : experimento,
    ),
  }));
}

export function executarExperimentoLaboratorioIaLocal(id: string) {
  let executado: ExperimentoLaboratorio | null = null;
  transformarWorkspace((workspace) => ({
    ...workspace,
    experimentos: workspace.experimentos.map((experimento) => {
      if (experimento.id !== id) return experimento;
      const resultados = criarResultados(experimento);
      executado = {
        ...experimento,
        status: "concluido",
        resultados,
        melhorResultadoId: resultados[0]?.id,
        atualizadoEm: new Date().toISOString(),
      };
      return executado;
    }),
  }));
  return executado;
}

export function concluirExperimentoLaboratorioIaRealLocal(
  id: string,
  execucao: import("@/types/provedores-ia").ResultadoExecucaoIa,
) {
  let concluido: ExperimentoLaboratorio | null = null;
  transformarWorkspace((workspace) => ({
    ...workspace,
    experimentos: workspace.experimentos.map((experimento) => {
      if (experimento.id !== id) return experimento;
      const agora = new Date().toISOString();
      const resultados: ResultadoExperimentoLaboratorio[] = execucao.variacoes.map((item, indice) => {
        const palavras = item.conteudo.trim().split(/\s+/).filter(Boolean).length;
        return {
          id: item.id,
          titulo: `Variação ${String.fromCharCode(65 + indice)}`,
          conteudo: item.conteudo,
          resumo: item.tentativa > 1 ? "Concluída por fallback" : "Resposta real do provedor",
          duracaoEstimada: experimento.tipo === "roteiro" ? `${Math.max(18, Math.round(palavras / 2.6))}s` : "—",
          palavras,
          pontuacoes: { clareza: 85, engajamento: 84, representabilidade: 82, aderencia: 88 },
          criadoEm: agora,
          origem: "real",
          provedor: item.provedor,
          modeloReal: item.modelo,
          tokensEntrada: item.tokensEntrada,
          tokensSaida: item.tokensSaida,
          custoEstimado: item.custoEstimado,
          duracaoMs: item.duracaoMs,
          tentativa: item.tentativa,
        };
      });
      concluido = {
        ...experimento,
        status: resultados.length > 0 ? "concluido" : "erro",
        resultados,
        melhorResultadoId: resultados[0]?.id,
        ultimaMensagem: execucao.mensagem,
        requisicaoId: undefined,
        atualizadoEm: agora,
      };
      return concluido;
    }),
  }));
  return concluido;
}

export function marcarExperimentoErroLocal(id: string, mensagem: string) {
  transformarWorkspace((workspace) => ({
    ...workspace,
    experimentos: workspace.experimentos.map((experimento) => experimento.id === id ? {
      ...experimento, status: "erro", ultimaMensagem: mensagem, requisicaoId: undefined,
      atualizadoEm: new Date().toISOString(),
    } : experimento),
  }));
}

export function registrarRequisicaoExperimentoLocal(id: string, requisicaoId: string) {
  transformarWorkspace((workspace) => ({
    ...workspace,
    experimentos: workspace.experimentos.map((experimento) => experimento.id === id ? {
      ...experimento, requisicaoId, status: "processando", ultimaMensagem: "Executando com provedor real.",
      atualizadoEm: new Date().toISOString(),
    } : experimento),
  }));
}

export function selecionarMelhorResultadoLaboratorioIaLocal(
  experimentoId: string,
  resultadoId: string,
) {
  transformarWorkspace((workspace) => ({
    ...workspace,
    experimentos: workspace.experimentos.map((experimento) =>
      experimento.id === experimentoId
        ? { ...experimento, melhorResultadoId: resultadoId, atualizadoEm: new Date().toISOString() }
        : experimento,
    ),
  }));
}

export function duplicarExperimentoLaboratorioIaLocal(id: string) {
  const original = obterExperimentoLaboratorioIaLocal(id);
  if (!original) return null;
  const agora = new Date().toISOString();
  const duplicado: ExperimentoLaboratorio = {
    ...JSON.parse(JSON.stringify(original)),
    id: criarId("experimento"),
    nome: `${original.nome} · cópia`,
    status: "rascunho",
    resultados: [],
    melhorResultadoId: undefined,
    criadoEm: agora,
    atualizadoEm: agora,
  };
  transformarWorkspace((workspace) => ({
    ...workspace,
    experimentos: [duplicado, ...workspace.experimentos],
  }));
  return duplicado;
}

export function excluirExperimentoLaboratorioIaLocal(id: string) {
  transformarWorkspace((workspace) => ({
    ...workspace,
    experimentos: workspace.experimentos.filter((experimento) => experimento.id !== id),
  }));
}

export function aplicarPresetLaboratorioIaLocal(
  experimentoId: string,
  preset: PresetPromptLaboratorio,
) {
  return atualizarExperimentoLaboratorioIaLocal(experimentoId, {
    tipo: preset.tipo,
    promptSistema: preset.promptSistema,
    promptUsuario: preset.promptUsuario,
  });
}

export function alternarFavoritoPresetLaboratorioIaLocal(id: string) {
  transformarWorkspace((workspace) => ({
    ...workspace,
    presets: workspace.presets.map((preset) =>
      preset.id === id ? { ...preset, favorito: !preset.favorito } : preset,
    ),
  }));
}

export function salvarExperimentoComoPresetLocal(experimentoId: string) {
  const experimento = obterExperimentoLaboratorioIaLocal(experimentoId);
  if (!experimento) return null;
  const preset: PresetPromptLaboratorio = {
    id: criarId("preset"),
    nome: experimento.nome,
    descricao: `Preset criado a partir do experimento “${experimento.nome}”.`,
    tipo: experimento.tipo,
    promptSistema: experimento.promptSistema,
    promptUsuario: experimento.promptUsuario,
    favorito: true,
  };
  transformarWorkspace((workspace) => ({
    ...workspace,
    presets: [preset, ...workspace.presets],
  }));
  return preset;
}

export function prepararTransferenciaLaboratorioParaEstudio(
  experimentoId: string,
  resultadoId: string,
) {
  if (typeof window === "undefined") return null;
  const experimento = obterExperimentoLaboratorioIaLocal(experimentoId);
  const resultado = experimento?.resultados.find((item) => item.id === resultadoId);
  if (!experimento || !resultado) return null;
  const transferencia: TransferenciaLaboratorioEstudio = {
    versao: 1,
    experimentoId,
    tipo: experimento.tipo,
    tema: experimento.tema,
    modelo: experimento.modelo,
    promptSistema: experimento.promptSistema,
    promptUsuario: experimento.promptUsuario,
    conteudo: resultado.conteudo,
    criadoEm: new Date().toISOString(),
  };
  window.localStorage.setItem(CHAVE_TRANSFERENCIA_LABORATORIO, JSON.stringify(transferencia));
  return transferencia;
}

export function consumirTransferenciaLaboratorioParaEstudio() {
  if (typeof window === "undefined") return null;
  const salvo = window.localStorage.getItem(CHAVE_TRANSFERENCIA_LABORATORIO);
  if (!salvo) return null;
  window.localStorage.removeItem(CHAVE_TRANSFERENCIA_LABORATORIO);
  try {
    const transferencia = JSON.parse(salvo) as TransferenciaLaboratorioEstudio;
    return transferencia.versao === 1 ? transferencia : null;
  } catch {
    return null;
  }
}

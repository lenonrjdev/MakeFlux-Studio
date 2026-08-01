import { emAmbienteTauri, detectarCapacidadesSistema, testarHttpNativo, verificarMoneyPrinter } from "@/lib/runtime-nativo";

import type {
  AtualizacaoIntegracao,
  CapacidadeIntegracao,
  CampoConfiguracaoIntegracao,
  EventoIntegracao,
  IntegracaoStudio,
  ModoProcessamento,
  ResultadoTesteIntegracao,
  StatusIntegracao,
  WorkspaceIntegracoes,
} from "@/types/integracoes";

export const CHAVE_WORKSPACE_INTEGRACOES = "makeflux:workspace-integracoes:v1";
export const EVENTO_WORKSPACE_INTEGRACOES = "makeflux:workspace-integracoes-atualizado";

function gerarId(prefixo: string) {
  return `${prefixo}-${crypto.randomUUID()}`;
}

function agoraIso() {
  return new Date().toISOString();
}

function criarEvento(
  tipo: EventoIntegracao["tipo"],
  descricao: string,
  criadoEm = agoraIso(),
): EventoIntegracao {
  return { id: gerarId("evento-integracao"), tipo, descricao, criadoEm };
}

function copiarIntegracao(integracao: IntegracaoStudio): IntegracaoStudio {
  return JSON.parse(JSON.stringify(integracao)) as IntegracaoStudio;
}

function copiarWorkspace(workspace: WorkspaceIntegracoes): WorkspaceIntegracoes {
  return JSON.parse(JSON.stringify(workspace)) as WorkspaceIntegracoes;
}

const campoEndpoint = (
  placeholder: string,
  descricao = "Endereço usado pelo MakeFlux Studio para alcançar o serviço.",
): CampoConfiguracaoIntegracao => ({
  id: "endpoint",
  rotulo: "Endpoint",
  descricao,
  tipo: "texto",
  placeholder,
});

const campoCredencial = (rotulo = "Chave da API"): CampoConfiguracaoIntegracao => ({
  id: "credencial",
  rotulo,
  descricao: "O valor completo não é persistido no localStorage.",
  tipo: "segredo",
  placeholder: "Cole a credencial para confirmar a configuração",
  sensivel: true,
});

function criarIntegracao(
  dados: Omit<IntegracaoStudio, "atualizadoEm" | "historico" | "ultimaVerificacaoEm" | "latenciaMs"> & {
    mensagemInicial?: string;
  },
): IntegracaoStudio {
  const criadoEm = agoraIso();
  const { mensagemInicial, ...integracao } = dados;
  return {
    ...integracao,
    mensagemStatus: mensagemInicial ?? integracao.mensagemStatus,
    atualizadoEm: criadoEm,
    ultimaVerificacaoEm: null,
    latenciaMs: null,
    historico: [criarEvento("configurada", "Integração adicionada ao catálogo do MakeFlux Studio.", criadoEm)],
  };
}

function criarCatalogoInicial(): IntegracaoStudio[] {
  return [
    criarIntegracao({
      id: "moneyprinter-turbo",
      nome: "MoneyPrinterTurbo",
      fornecedor: "harry0703 / comunidade",
      categoria: "motor",
      descricao: "Motor principal responsável por roteiro, materiais, voz, legendas e composição do vídeo.",
      execucao: "local",
      status: "atencao",
      ativa: true,
      instalada: false,
      requerInternet: false,
      requerCredencial: false,
      credencialConfigurada: true,
      credencialMascara: "Não necessária",
      endpoint: "http://127.0.0.1:8080",
      versao: "Não detectada",
      modelo: "API FastAPI",
      capacidades: ["motor-video"],
      configuracoes: { timeout: 120, tarefasSimultaneas: 1, iniciarComAplicativo: true, diretorioProjeto: "", pythonExecutavel: "python", threads: 2, branchAtualizacao: "main" },
      campos: [
        campoEndpoint("http://127.0.0.1:8080"),
        { id: "diretorioProjeto", rotulo: "Pasta do MoneyPrinterTurbo", descricao: "Diretório que contém main.py e o repositório Git do motor.", tipo: "texto", placeholder: "C:\\Ferramentas\\MoneyPrinterTurbo" },
        { id: "pythonExecutavel", rotulo: "Python", descricao: "Executável usado para iniciar main.py.", tipo: "texto", placeholder: "python" },
        { id: "threads", rotulo: "Threads de renderização", tipo: "numero", minimo: 1, maximo: 32, passo: 1 },
        { id: "branchAtualizacao", rotulo: "Branch de atualização", tipo: "texto", placeholder: "main" },
        { id: "timeout", rotulo: "Timeout", descricao: "Tempo máximo de espera em segundos.", tipo: "numero", minimo: 10, maximo: 600, passo: 10 },
        { id: "tarefasSimultaneas", rotulo: "Tarefas simultâneas", tipo: "numero", minimo: 1, maximo: 8, passo: 1 },
        { id: "iniciarComAplicativo", rotulo: "Iniciar com o aplicativo", tipo: "interruptor" },
      ],
      mensagemStatus: "Motor cadastrado. Use o diagnóstico nativo para detectar a API real.",
    }),
    criarIntegracao({
      id: "openai",
      nome: "OpenAI",
      fornecedor: "OpenAI",
      categoria: "inteligencia-artificial",
      descricao: "Geração de roteiros, termos visuais, ganchos e metadados com modelos em nuvem.",
      execucao: "nuvem",
      status: "nao-configurada",
      ativa: true,
      instalada: true,
      requerInternet: true,
      requerCredencial: true,
      credencialConfigurada: false,
      credencialMascara: "Nenhuma credencial",
      endpoint: "https://api.openai.com/v1",
      versao: "API compatível",
      modelo: "gpt-4.1-mini",
      capacidades: ["roteiro", "termos-visuais", "metadados"],
      configuracoes: { temperatura: 0.7, maxTokens: 2400 },
      campos: [
        campoCredencial(),
        campoEndpoint("https://api.openai.com/v1"),
        { id: "modelo", rotulo: "Modelo padrão", tipo: "texto", placeholder: "gpt-4.1-mini" },
        { id: "temperatura", rotulo: "Criatividade", tipo: "numero", minimo: 0, maximo: 2, passo: 0.1 },
        { id: "maxTokens", rotulo: "Limite de tokens", tipo: "numero", minimo: 256, maximo: 32000, passo: 128 },
      ],
      mensagemStatus: "Adicione sua chave para usar modelos da OpenAI.",
    }),
    criarIntegracao({
      id: "ollama",
      nome: "Ollama",
      fornecedor: "Ollama",
      categoria: "inteligencia-artificial",
      descricao: "Executa modelos de linguagem localmente para roteiro e metadados sem enviar conteúdo à nuvem.",
      execucao: "local",
      status: "atencao",
      ativa: true,
      instalada: false,
      requerInternet: false,
      requerCredencial: false,
      credencialConfigurada: true,
      credencialMascara: "Não necessária",
      endpoint: "http://127.0.0.1:11434",
      versao: "Não detectada",
      modelo: "qwen3:8b",
      capacidades: ["roteiro", "termos-visuais", "metadados"],
      configuracoes: { contexto: 8192, manterCarregado: true },
      campos: [
        campoEndpoint("http://127.0.0.1:11434"),
        { id: "modelo", rotulo: "Modelo local", tipo: "texto", placeholder: "qwen3:8b" },
        { id: "contexto", rotulo: "Janela de contexto", tipo: "numero", minimo: 1024, maximo: 131072, passo: 1024 },
        { id: "manterCarregado", rotulo: "Manter modelo carregado", tipo: "interruptor" },
      ],
      mensagemStatus: "Serviço local ainda não foi detectado.",
    }),
    criarIntegracao({
      id: "gemini",
      nome: "Google Gemini",
      fornecedor: "Google",
      categoria: "inteligencia-artificial",
      descricao: "Alternativa em nuvem para geração de texto, análise e metadados.",
      execucao: "nuvem",
      status: "nao-configurada",
      ativa: false,
      instalada: true,
      requerInternet: true,
      requerCredencial: true,
      credencialConfigurada: false,
      credencialMascara: "Nenhuma credencial",
      endpoint: "https://generativelanguage.googleapis.com",
      versao: "API",
      modelo: "gemini-2.5-flash",
      capacidades: ["roteiro", "termos-visuais", "metadados"],
      configuracoes: { temperatura: 0.7 },
      campos: [campoCredencial("Chave do Gemini"), { id: "modelo", rotulo: "Modelo padrão", tipo: "texto", placeholder: "gemini-2.5-flash" }],
      mensagemStatus: "Provedor opcional não configurado.",
    }),
    criarIntegracao({
      id: "deepseek",
      nome: "DeepSeek",
      fornecedor: "DeepSeek",
      categoria: "inteligencia-artificial",
      descricao: "Provedor compatível com API OpenAI para roteiros e experimentos de prompts.",
      execucao: "nuvem",
      status: "nao-configurada",
      ativa: false,
      instalada: true,
      requerInternet: true,
      requerCredencial: true,
      credencialConfigurada: false,
      credencialMascara: "Nenhuma credencial",
      endpoint: "https://api.deepseek.com",
      versao: "API",
      modelo: "deepseek-chat",
      capacidades: ["roteiro", "termos-visuais", "metadados"],
      configuracoes: { temperatura: 0.7 },
      campos: [campoCredencial("Chave do DeepSeek"), campoEndpoint("https://api.deepseek.com"), { id: "modelo", rotulo: "Modelo padrão", tipo: "texto", placeholder: "deepseek-chat" }],
      mensagemStatus: "Provedor opcional não configurado.",
    }),
    criarIntegracao({
      id: "pexels",
      nome: "Pexels",
      fornecedor: "Pexels",
      categoria: "midia",
      descricao: "Busca vídeos e imagens de apoio para compor as cenas do projeto.",
      execucao: "nuvem",
      status: "nao-configurada",
      ativa: true,
      instalada: true,
      requerInternet: true,
      requerCredencial: true,
      credencialConfigurada: false,
      credencialMascara: "Nenhuma credencial",
      endpoint: "https://api.pexels.com",
      versao: "API",
      modelo: "Busca de mídia",
      capacidades: ["materiais"],
      configuracoes: { orientacao: "portrait", resultados: 12 },
      campos: [campoCredencial("Chave do Pexels"), { id: "orientacao", rotulo: "Orientação padrão", tipo: "selecao", opcoes: [{ valor: "portrait", rotulo: "Vertical" }, { valor: "landscape", rotulo: "Horizontal" }, { valor: "square", rotulo: "Quadrada" }] }, { id: "resultados", rotulo: "Resultados por busca", tipo: "numero", minimo: 4, maximo: 80, passo: 4 }],
      mensagemStatus: "Adicione uma chave para pesquisar materiais.",
    }),
    criarIntegracao({
      id: "pixabay",
      nome: "Pixabay",
      fornecedor: "Pixabay",
      categoria: "midia",
      descricao: "Fonte alternativa de vídeos e imagens para o storyboard.",
      execucao: "nuvem",
      status: "nao-configurada",
      ativa: false,
      instalada: true,
      requerInternet: true,
      requerCredencial: true,
      credencialConfigurada: false,
      credencialMascara: "Nenhuma credencial",
      endpoint: "https://pixabay.com/api",
      versao: "API",
      modelo: "Busca de mídia",
      capacidades: ["materiais"],
      configuracoes: { resultados: 12 },
      campos: [campoCredencial("Chave do Pixabay"), { id: "resultados", rotulo: "Resultados por busca", tipo: "numero", minimo: 4, maximo: 80, passo: 4 }],
      mensagemStatus: "Fonte opcional não configurada.",
    }),
    criarIntegracao({
      id: "coverr",
      nome: "Coverr",
      fornecedor: "Coverr",
      categoria: "midia",
      descricao: "Catálogo adicional de vídeos de apoio compatível com o motor.",
      execucao: "nuvem",
      status: "nao-configurada",
      ativa: false,
      instalada: true,
      requerInternet: true,
      requerCredencial: true,
      credencialConfigurada: false,
      credencialMascara: "Nenhuma credencial",
      endpoint: "https://api.coverr.co",
      versao: "API",
      modelo: "Busca de vídeos",
      capacidades: ["materiais"],
      configuracoes: { resultados: 12 },
      campos: [campoCredencial("Chave do Coverr"), { id: "resultados", rotulo: "Resultados por busca", tipo: "numero", minimo: 4, maximo: 80, passo: 4 }],
      mensagemStatus: "Fonte opcional não configurada.",
    }),
    criarIntegracao({
      id: "biblioteca-local",
      nome: "Biblioteca local",
      fornecedor: "MakeFlux Studio",
      categoria: "midia",
      descricao: "Usa vídeos, imagens, músicas e arquivos já organizados no computador.",
      execucao: "local",
      status: "conectada",
      ativa: true,
      instalada: true,
      requerInternet: false,
      requerCredencial: false,
      credencialConfigurada: true,
      credencialMascara: "Não necessária",
      endpoint: "Biblioteca do workspace",
      versao: "v1",
      modelo: "Acervo local",
      capacidades: ["materiais"],
      configuracoes: { indexacaoAutomatica: true, evitarRepetidos: true },
      campos: [
        { id: "indexacaoAutomatica", rotulo: "Indexação automática", tipo: "interruptor" },
        { id: "evitarRepetidos", rotulo: "Evitar materiais repetidos", tipo: "interruptor" },
      ],
      mensagemStatus: "Biblioteca local pronta para uso.",
    }),
    criarIntegracao({
      id: "edge-tts",
      nome: "Edge TTS",
      fornecedor: "Microsoft Edge",
      categoria: "voz",
      descricao: "Narração online sem chave de API, com várias vozes e idiomas.",
      execucao: "nuvem",
      status: "conectada",
      ativa: true,
      instalada: true,
      requerInternet: true,
      requerCredencial: false,
      credencialConfigurada: true,
      credencialMascara: "Não necessária",
      endpoint: "Serviço Edge TTS",
      versao: "Gerenciada pelo motor",
      modelo: "pt-BR-FranciscaNeural",
      capacidades: ["narracao"],
      configuracoes: { voz: "pt-BR-FranciscaNeural", velocidade: 1, volume: 1 },
      campos: [
        { id: "voz", rotulo: "Voz padrão", tipo: "texto", placeholder: "pt-BR-FranciscaNeural" },
        { id: "velocidade", rotulo: "Velocidade", tipo: "numero", minimo: 0.5, maximo: 2, passo: 0.05 },
        { id: "volume", rotulo: "Volume", tipo: "numero", minimo: 0, maximo: 1, passo: 0.05 },
      ],
      mensagemStatus: "Disponível quando houver conexão com a internet.",
    }),
    criarIntegracao({
      id: "elevenlabs",
      nome: "ElevenLabs",
      fornecedor: "ElevenLabs",
      categoria: "voz",
      descricao: "Vozes premium em nuvem com maior naturalidade e controle.",
      execucao: "nuvem",
      status: "nao-configurada",
      ativa: false,
      instalada: true,
      requerInternet: true,
      requerCredencial: true,
      credencialConfigurada: false,
      credencialMascara: "Nenhuma credencial",
      endpoint: "https://api.elevenlabs.io",
      versao: "API",
      modelo: "eleven_multilingual_v2",
      capacidades: ["narracao"],
      configuracoes: { voiceId: "", estabilidade: 0.5 },
      campos: [campoCredencial("Chave da ElevenLabs"), { id: "voiceId", rotulo: "ID da voz", tipo: "texto", placeholder: "voice_id" }, { id: "modelo", rotulo: "Modelo", tipo: "texto", placeholder: "eleven_multilingual_v2" }, { id: "estabilidade", rotulo: "Estabilidade", tipo: "numero", minimo: 0, maximo: 1, passo: 0.05 }],
      mensagemStatus: "Provedor premium não configurado.",
    }),
    criarIntegracao({
      id: "chatterbox",
      nome: "Chatterbox local",
      fornecedor: "Resemble AI / comunidade",
      categoria: "voz",
      descricao: "Síntese de voz local para operar sem serviços externos.",
      execucao: "local",
      status: "atencao",
      ativa: false,
      instalada: false,
      requerInternet: false,
      requerCredencial: false,
      credencialConfigurada: true,
      credencialMascara: "Não necessária",
      endpoint: "http://127.0.0.1:8004",
      versao: "Não detectada",
      modelo: "Chatterbox",
      capacidades: ["narracao"],
      configuracoes: { dispositivo: "auto" },
      campos: [campoEndpoint("http://127.0.0.1:8004"), { id: "dispositivo", rotulo: "Dispositivo", tipo: "selecao", opcoes: [{ valor: "auto", rotulo: "Automático" }, { valor: "cuda", rotulo: "GPU NVIDIA" }, { valor: "cpu", rotulo: "CPU" }] }],
      mensagemStatus: "Servidor local ainda não foi detectado.",
    }),
    criarIntegracao({
      id: "whisper",
      nome: "Faster Whisper",
      fornecedor: "SYSTRAN / comunidade",
      categoria: "legendas",
      descricao: "Transcrição e sincronização local de legendas com modelos Whisper.",
      execucao: "local",
      status: "conectada",
      ativa: true,
      instalada: true,
      requerInternet: false,
      requerCredencial: false,
      credencialConfigurada: true,
      credencialMascara: "Não necessária",
      endpoint: "Modelos locais",
      versao: "large-v3-turbo",
      modelo: "large-v3-turbo",
      capacidades: ["legendas"],
      configuracoes: { dispositivo: "auto", computeType: "auto", idioma: "pt" },
      campos: [
        { id: "modelo", rotulo: "Modelo Whisper", tipo: "selecao", opcoes: [{ valor: "small", rotulo: "Small" }, { valor: "medium", rotulo: "Medium" }, { valor: "large-v3-turbo", rotulo: "Large v3 Turbo" }, { valor: "large-v3", rotulo: "Large v3" }] },
        { id: "dispositivo", rotulo: "Dispositivo", tipo: "selecao", opcoes: [{ valor: "auto", rotulo: "Automático" }, { valor: "cuda", rotulo: "GPU NVIDIA" }, { valor: "cpu", rotulo: "CPU" }] },
        { id: "computeType", rotulo: "Precisão", tipo: "selecao", opcoes: [{ valor: "auto", rotulo: "Automática" }, { valor: "float16", rotulo: "Float 16" }, { valor: "int8", rotulo: "Int 8" }] },
      ],
      mensagemStatus: "Modelo local registrado e pronto para validação nativa.",
    }),
    criarIntegracao({
      id: "edge-timestamps",
      nome: "Timestamps do Edge",
      fornecedor: "MoneyPrinterTurbo",
      categoria: "legendas",
      descricao: "Usa as marcações temporais da própria narração para gerar legendas rapidamente.",
      execucao: "hibrida",
      status: "conectada",
      ativa: true,
      instalada: true,
      requerInternet: true,
      requerCredencial: false,
      credencialConfigurada: true,
      credencialMascara: "Não necessária",
      endpoint: "Integrado ao Edge TTS",
      versao: "Interna",
      modelo: "Timestamps",
      capacidades: ["legendas"],
      configuracoes: { palavrasPorLinha: 8 },
      campos: [{ id: "palavrasPorLinha", rotulo: "Palavras por linha", tipo: "numero", minimo: 2, maximo: 18, passo: 1 }],
      mensagemStatus: "Disponível junto com a narração Edge TTS.",
    }),
    criarIntegracao({
      id: "ffmpeg",
      nome: "FFmpeg",
      fornecedor: "FFmpeg",
      categoria: "sistema",
      descricao: "Composição, conversão e codificação dos vídeos no computador.",
      execucao: "local",
      status: "conectada",
      ativa: true,
      instalada: true,
      requerInternet: false,
      requerCredencial: false,
      credencialConfigurada: true,
      credencialMascara: "Não necessária",
      endpoint: "ffmpeg",
      versao: "Detectada pelo ambiente",
      modelo: "Codificador automático",
      capacidades: ["renderizacao"],
      configuracoes: { codificador: "auto", threads: 0, preset: "medium" },
      campos: [
        { id: "endpoint", rotulo: "Executável", tipo: "texto", placeholder: "ffmpeg" },
        { id: "codificador", rotulo: "Codificador", tipo: "selecao", opcoes: [{ valor: "auto", rotulo: "Automático" }, { valor: "libx264", rotulo: "CPU — libx264" }, { valor: "h264_nvenc", rotulo: "NVIDIA NVENC" }, { valor: "h264_qsv", rotulo: "Intel Quick Sync" }, { valor: "h264_amf", rotulo: "AMD AMF" }] },
        { id: "threads", rotulo: "Threads", tipo: "numero", minimo: 0, maximo: 64, passo: 1 },
        { id: "preset", rotulo: "Preset", tipo: "selecao", opcoes: [{ valor: "fast", rotulo: "Rápido" }, { valor: "medium", rotulo: "Equilibrado" }, { valor: "slow", rotulo: "Qualidade" }] },
      ],
      mensagemStatus: "Executável disponível para renderização local.",
    }),
    criarIntegracao({
      id: "youtube",
      nome: "YouTube",
      fornecedor: "Google",
      categoria: "publicacao",
      descricao: "Publicação futura de vídeos e Shorts diretamente pelo MakeFlux Studio.",
      execucao: "nuvem",
      status: "nao-configurada",
      ativa: false,
      instalada: true,
      requerInternet: true,
      requerCredencial: true,
      credencialConfigurada: false,
      credencialMascara: "Conta não conectada",
      endpoint: "YouTube Data API",
      versao: "v3",
      modelo: "OAuth 2.0",
      capacidades: ["publicacao"],
      configuracoes: { canal: "", privacidade: "private" },
      campos: [campoCredencial("Credencial OAuth"), { id: "canal", rotulo: "Canal", tipo: "texto", placeholder: "Nome ou ID do canal" }, { id: "privacidade", rotulo: "Privacidade padrão", tipo: "selecao", opcoes: [{ valor: "private", rotulo: "Privado" }, { valor: "unlisted", rotulo: "Não listado" }, { valor: "public", rotulo: "Público" }] }],
      mensagemStatus: "Canal ainda não conectado.",
    }),
    criarIntegracao({
      id: "instagram",
      nome: "Instagram",
      fornecedor: "Meta",
      categoria: "publicacao",
      descricao: "Preparação para publicar Reels por uma conta profissional conectada.",
      execucao: "nuvem",
      status: "nao-configurada",
      ativa: false,
      instalada: true,
      requerInternet: true,
      requerCredencial: true,
      credencialConfigurada: false,
      credencialMascara: "Conta não conectada",
      endpoint: "Instagram Graph API",
      versao: "Graph API",
      modelo: "Token de acesso",
      capacidades: ["publicacao"],
      configuracoes: { conta: "" },
      campos: [campoCredencial("Token da Meta"), { id: "conta", rotulo: "Conta profissional", tipo: "texto", placeholder: "ID da conta" }],
      mensagemStatus: "Conta profissional ainda não conectada.",
    }),
    criarIntegracao({
      id: "tiktok",
      nome: "TikTok",
      fornecedor: "TikTok",
      categoria: "publicacao",
      descricao: "Preparação para publicar vídeos por uma conta autorizada.",
      execucao: "nuvem",
      status: "nao-configurada",
      ativa: false,
      instalada: true,
      requerInternet: true,
      requerCredencial: true,
      credencialConfigurada: false,
      credencialMascara: "Conta não conectada",
      endpoint: "TikTok Content Posting API",
      versao: "API",
      modelo: "OAuth 2.0",
      capacidades: ["publicacao"],
      configuracoes: { conta: "" },
      campos: [campoCredencial("Credencial OAuth"), { id: "conta", rotulo: "Conta", tipo: "texto", placeholder: "Usuário ou ID" }],
      mensagemStatus: "Conta ainda não conectada.",
    }),
  ];
}

function criarWorkspaceInicial(): WorkspaceIntegracoes {
  return {
    versao: 1,
    modoProcessamento: "hibrido",
    integracoes: criarCatalogoInicial(),
    padroes: {
      "motor-video": "moneyprinter-turbo",
      roteiro: "openai",
      "termos-visuais": "openai",
      metadados: "openai",
      materiais: "pexels",
      narracao: "edge-tts",
      legendas: "whisper",
      renderizacao: "ffmpeg",
      publicacao: "youtube",
    },
    ultimoDiagnosticoEm: null,
  };
}

function validarWorkspace(valor: unknown): valor is WorkspaceIntegracoes {
  if (!valor || typeof valor !== "object") return false;
  const workspace = valor as Partial<WorkspaceIntegracoes>;
  return (
    workspace.versao === 1 &&
    typeof workspace.modoProcessamento === "string" &&
    Array.isArray(workspace.integracoes) &&
    Boolean(workspace.padroes)
  );
}

function migrarWorkspaceIntegracoes(workspace: WorkspaceIntegracoes): WorkspaceIntegracoes {
  const catalogo = criarCatalogoInicial();
  const salvasPorId = new Map(workspace.integracoes.map((integracao) => [integracao.id, integracao]));
  const integracoes = catalogo.map((padrao) => {
    const salva = salvasPorId.get(padrao.id);
    if (!salva) return padrao;
    return {
      ...padrao,
      ...salva,
      configuracoes: { ...padrao.configuracoes, ...salva.configuracoes },
      campos: padrao.campos,
      capacidades: padrao.capacidades,
      historico: Array.isArray(salva.historico) ? salva.historico : padrao.historico,
    };
  });
  return { ...workspace, versao: 1, integracoes };
}

export function carregarWorkspaceIntegracoes(): WorkspaceIntegracoes {
  if (typeof window === "undefined") return criarWorkspaceInicial();
  const salvo = window.localStorage.getItem(CHAVE_WORKSPACE_INTEGRACOES);
  if (!salvo) {
    const inicial = criarWorkspaceInicial();
    salvarWorkspaceIntegracoes(inicial);
    return inicial;
  }
  try {
    const valor: unknown = JSON.parse(salvo);
    if (validarWorkspace(valor)) {
      const migrado = migrarWorkspaceIntegracoes(valor);
      if (JSON.stringify(migrado) !== JSON.stringify(valor)) salvarWorkspaceIntegracoes(migrado);
      return copiarWorkspace(migrado);
    }
  } catch {
    // Um catálogo íntegro é restaurado abaixo.
  }
  const recuperado = criarWorkspaceInicial();
  salvarWorkspaceIntegracoes(recuperado);
  return recuperado;
}

export function salvarWorkspaceIntegracoes(workspace: WorkspaceIntegracoes) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHAVE_WORKSPACE_INTEGRACOES, JSON.stringify(workspace));
  window.dispatchEvent(new CustomEvent(EVENTO_WORKSPACE_INTEGRACOES));
}

function transformarWorkspace(
  transformador: (workspace: WorkspaceIntegracoes) => WorkspaceIntegracoes,
) {
  const atual = carregarWorkspaceIntegracoes();
  const proximo = transformador(atual);
  salvarWorkspaceIntegracoes(proximo);
  return copiarWorkspace(proximo);
}

function atualizarIntegracaoInterna(
  workspace: WorkspaceIntegracoes,
  id: string,
  transformador: (integracao: IntegracaoStudio) => IntegracaoStudio,
) {
  return {
    ...workspace,
    integracoes: workspace.integracoes.map((integracao) =>
      integracao.id === id ? transformador(integracao) : integracao,
    ),
  };
}

export function definirModoProcessamentoLocal(modo: ModoProcessamento) {
  return transformarWorkspace((workspace) => ({ ...workspace, modoProcessamento: modo }));
}

export function atualizarIntegracaoLocal(id: string, atualizacao: AtualizacaoIntegracao) {
  const credencial = atualizacao.credencial?.trim() ?? "";
  return transformarWorkspace((workspace) =>
    atualizarIntegracaoInterna(workspace, id, (integracao) => {
      const credencialConfigurada = credencial ? true : integracao.credencialConfigurada;
      const credencialMascara = credencial
        ? `••••••••${credencial.slice(-4)}`
        : integracao.credencialMascara;
      const status: StatusIntegracao = integracao.requerCredencial && !credencialConfigurada
        ? "nao-configurada"
        : integracao.status === "nao-configurada"
          ? "atencao"
          : integracao.status;
      const atualizadoEm = agoraIso();
      return {
        ...integracao,
        endpoint: atualizacao.endpoint ?? integracao.endpoint,
        modelo: atualizacao.modelo ?? integracao.modelo,
        configuracoes: { ...integracao.configuracoes, ...(atualizacao.configuracoes ?? {}) },
        credencialConfigurada,
        credencialMascara,
        status,
        mensagemStatus: credencial
          ? "Credencial confirmada. Execute um teste para validar a conexão."
          : "Configuração atualizada. Execute um teste para confirmar o serviço.",
        atualizadoEm,
        historico: [
          ...integracao.historico,
          criarEvento("configurada", "Configuração da integração atualizada.", atualizadoEm),
        ],
      };
    }),
  );
}

export function limparCredencialIntegracaoLocal(id: string) {
  return transformarWorkspace((workspace) =>
    atualizarIntegracaoInterna(workspace, id, (integracao) => {
      const atualizadoEm = agoraIso();
      return {
        ...integracao,
        credencialConfigurada: !integracao.requerCredencial,
        credencialMascara: integracao.requerCredencial ? "Nenhuma credencial" : "Não necessária",
        status: integracao.requerCredencial ? "nao-configurada" : integracao.status,
        mensagemStatus: integracao.requerCredencial
          ? "Credencial removida do perfil local."
          : integracao.mensagemStatus,
        atualizadoEm,
        historico: [
          ...integracao.historico,
          criarEvento("configurada", "Credencial removida do perfil local.", atualizadoEm),
        ],
      };
    }),
  );
}

export function alternarIntegracaoAtivaLocal(id: string) {
  return transformarWorkspace((workspace) =>
    atualizarIntegracaoInterna(workspace, id, (integracao) => {
      const ativa = !integracao.ativa;
      const atualizadoEm = agoraIso();
      return {
        ...integracao,
        ativa,
        atualizadoEm,
        historico: [
          ...integracao.historico,
          criarEvento(ativa ? "ativada" : "desativada", ativa ? "Integração ativada." : "Integração desativada.", atualizadoEm),
        ],
      };
    }),
  );
}

export function definirIntegracaoPadraoLocal(
  capacidade: CapacidadeIntegracao,
  integracaoId: string,
) {
  return transformarWorkspace((workspace) => {
    const existe = workspace.integracoes.some(
      (integracao) =>
        integracao.id === integracaoId && integracao.capacidades.includes(capacidade),
    );
    if (!existe) return workspace;
    const atualizadoEm = agoraIso();
    return {
      ...workspace,
      padroes: { ...workspace.padroes, [capacidade]: integracaoId },
      integracoes: workspace.integracoes.map((integracao) =>
        integracao.id === integracaoId
          ? {
              ...integracao,
              atualizadoEm,
              historico: [
                ...integracao.historico,
                criarEvento("padrao", `Definida como padrão para ${capacidade}.`, atualizadoEm),
              ],
            }
          : integracao,
      ),
    };
  });
}

export function integracaoCompativelComModo(
  integracao: IntegracaoStudio,
  modo: ModoProcessamento,
) {
  if (modo === "offline") return !integracao.requerInternet;
  return true;
}

function calcularResultadoTesteDemonstrativo(
  integracao: IntegracaoStudio,
  modo: ModoProcessamento,
): ResultadoTesteIntegracao {
  if (!integracao.ativa) {
    return { sucesso: false, status: "atencao", mensagem: "Ative a integração antes de executar o teste.", latenciaMs: null };
  }
  if (!integracaoCompativelComModo(integracao, modo)) {
    return { sucesso: false, status: "indisponivel", mensagem: "A integração depende de internet e o modo Offline está ativo.", latenciaMs: null };
  }
  if (integracao.requerCredencial && !integracao.credencialConfigurada) {
    return { sucesso: false, status: "nao-configurada", mensagem: "Configure uma credencial antes de testar a conexão.", latenciaMs: null };
  }
  if (integracao.execucao === "local" && !integracao.instalada) {
    return { sucesso: false, status: "atencao", mensagem: "O serviço local ainda não foi detectado neste computador.", latenciaMs: null };
  }
  return {
    sucesso: true,
    status: "conectada",
    mensagem: integracao.execucao === "local" ? "Serviço local pronto no perfil atual." : "Configuração lógica aprovada; o segredo permanece fora do navegador.",
    latenciaMs: null,
  };
}

async function calcularResultadoTesteNativo(
  integracao: IntegracaoStudio,
  modo: ModoProcessamento,
): Promise<ResultadoTesteIntegracao> {
  const preValidacao = calcularResultadoTesteDemonstrativo(integracao, modo);
  if (!preValidacao.sucesso && !["moneyprinter-turbo", "ollama", "ffmpeg"].includes(integracao.id)) return preValidacao;
  if (!emAmbienteTauri()) return preValidacao;

  try {
    if (integracao.id === "moneyprinter-turbo") {
      const diagnostico = await verificarMoneyPrinter(integracao.endpoint);
      return {
        sucesso: diagnostico.disponivel,
        status: diagnostico.disponivel ? "conectada" : "atencao",
        mensagem: diagnostico.mensagem,
        latenciaMs: diagnostico.latenciaMs,
      };
    }
    if (integracao.id === "ollama") {
      const resposta = await testarHttpNativo({ url: `${integracao.endpoint.replace(/\/$/, "")}/api/tags`, timeoutMs: 8_000 });
      return { sucesso: resposta.sucesso, status: resposta.sucesso ? "conectada" : "atencao", mensagem: resposta.mensagem, latenciaMs: resposta.latenciaMs };
    }
    if (integracao.id === "ffmpeg") {
      const capacidades = await detectarCapacidadesSistema();
      return {
        sucesso: capacidades.ffmpeg.disponivel,
        status: capacidades.ffmpeg.disponivel ? "conectada" : "atencao",
        mensagem: capacidades.ffmpeg.disponivel ? `FFmpeg detectado em ${capacidades.ffmpeg.caminho ?? "PATH"}.` : "FFmpeg não foi encontrado no PATH do sistema.",
        latenciaMs: null,
      };
    }
    if (integracao.execucao === "local" && /^https?:\/\//.test(integracao.endpoint)) {
      const resposta = await testarHttpNativo({ url: integracao.endpoint, timeoutMs: 8_000 });
      return { sucesso: resposta.sucesso, status: resposta.sucesso ? "conectada" : "atencao", mensagem: resposta.mensagem, latenciaMs: resposta.latenciaMs };
    }
    return preValidacao;
  } catch (falha) {
    return {
      sucesso: false,
      status: "atencao",
      mensagem: falha instanceof Error ? falha.message : String(falha),
      latenciaMs: null,
    };
  }
}

export async function testarIntegracaoLocal(id: string) {
  const workspace = carregarWorkspaceIntegracoes();
  const integracao = workspace.integracoes.find((item) => item.id === id);
  if (!integracao) return null;
  const resultado = await calcularResultadoTesteNativo(integracao, workspace.modoProcessamento);
  const verificadoEm = agoraIso();
  transformarWorkspace((atual) =>
    atualizarIntegracaoInterna(atual, id, (item) => ({
      ...item,
      instalada: item.execucao !== "local" ? item.instalada : resultado.sucesso || item.instalada,
      status: resultado.status,
      ultimaVerificacaoEm: verificadoEm,
      latenciaMs: resultado.latenciaMs,
      mensagemStatus: resultado.mensagem,
      atualizadoEm: verificadoEm,
      historico: [
        ...item.historico,
        criarEvento(resultado.sucesso ? "testada" : "falha", resultado.mensagem, verificadoEm),
      ],
    })),
  );
  return resultado;
}

export async function testarTodasIntegracoesLocais() {
  const workspace = carregarWorkspaceIntegracoes();
  const ativas = workspace.integracoes.filter((integracao) => integracao.ativa);
  const resultados: Array<{ id: string; resultado: ResultadoTesteIntegracao }> = [];
  for (const integracao of ativas) {
    const resultado = await testarIntegracaoLocal(integracao.id);
    if (resultado) resultados.push({ id: integracao.id, resultado });
  }
  transformarWorkspace((atual) => ({ ...atual, ultimoDiagnosticoEm: agoraIso() }));
  return resultados;
}

export function restaurarIntegracaoLocal(id: string) {
  const padrao = criarCatalogoInicial().find((integracao) => integracao.id === id);
  if (!padrao) return null;
  const restaurada = {
    ...padrao,
    historico: [
      ...padrao.historico,
      criarEvento("restaurada", "Configuração restaurada para os padrões do MakeFlux Studio."),
    ],
  };
  transformarWorkspace((workspace) => ({
    ...workspace,
    integracoes: workspace.integracoes.map((integracao) =>
      integracao.id === id ? restaurada : integracao,
    ),
  }));
  return copiarIntegracao(restaurada);
}

export function restaurarCatalogoIntegracoesLocal() {
  const atual = carregarWorkspaceIntegracoes();
  const restaurado = criarWorkspaceInicial();
  restaurado.modoProcessamento = atual.modoProcessamento;
  salvarWorkspaceIntegracoes(restaurado);
  return copiarWorkspace(restaurado);
}

export function configurarMoneyPrinterInstaladoLocal({
  diretorio,
  pythonExecutavel,
}: {
  diretorio: string;
  pythonExecutavel: string;
}) {
  const workspace = carregarWorkspaceIntegracoes();
  const agora = agoraIso();
  workspace.integracoes = workspace.integracoes.map((integracao) => {
    if (integracao.id !== "moneyprinter-turbo") return integracao;
    return {
      ...integracao,
      instalada: true,
      status: "atencao" as const,
      versao: integracao.versao === "Não detectada" ? "Ambiente local instalado" : integracao.versao,
      configuracoes: {
        ...integracao.configuracoes,
        diretorioProjeto: diretorio,
        pythonExecutavel,
      },
      mensagemStatus: "Motor instalado. Inicie a API para concluir a homologação.",
      atualizadoEm: agora,
      historico: [
        criarEvento("configurada", "MoneyPrinterTurbo instalado pelo assistente do MakeFlux Studio.", agora),
        ...integracao.historico,
      ].slice(0, 50),
    };
  });
  salvarWorkspaceIntegracoes(workspace);
  return workspace;
}


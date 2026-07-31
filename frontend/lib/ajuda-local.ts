import { detectarCapacidadesSistema, emAmbienteTauri, verificarMoneyPrinter } from "@/lib/runtime-nativo";

import type {
  ItemDiagnostico,
  PacoteSuporteMakeFlux,
  ResultadoDiagnostico,
  WorkspaceAjuda,
} from "@/types/ajuda";

export const CHAVE_WORKSPACE_AJUDA = "makeflux:workspace-ajuda:v1";
export const EVENTO_WORKSPACE_AJUDA = "makeflux:workspace-ajuda-atualizado";

const CHAVE_CONFIGURACOES = "makeflux:workspace-configuracoes:v1";
const CHAVE_INTEGRACOES = "makeflux:workspace-integracoes:v1";
const CHAVE_PROJETOS = "makeflux:workspace-projetos:v1";

function agoraIso() {
  return new Date().toISOString();
}

function criarWorkspaceAjudaPadrao(): WorkspaceAjuda {
  return {
    versao: 1,
    onboardingConcluido: false,
    etapasConcluidas: [],
    guiasVisualizados: [],
    guiasFavoritos: [],
    problemasResolvidos: [],
    novidadesLidas: [],
    ultimoDiagnostico: null,
    atualizadoEm: agoraIso(),
  };
}

function listaUnica(valores: string[] | undefined) {
  return Array.from(new Set((valores ?? []).filter(Boolean)));
}

function mesclarWorkspaceAjuda(valor: Partial<WorkspaceAjuda>): WorkspaceAjuda {
  const padrao = criarWorkspaceAjudaPadrao();
  return {
    ...padrao,
    ...valor,
    versao: 1,
    etapasConcluidas: listaUnica(valor.etapasConcluidas),
    guiasVisualizados: listaUnica(valor.guiasVisualizados),
    guiasFavoritos: listaUnica(valor.guiasFavoritos),
    problemasResolvidos: listaUnica(valor.problemasResolvidos),
    novidadesLidas: listaUnica(valor.novidadesLidas),
  };
}

export function carregarAjudaLocal(): WorkspaceAjuda {
  if (typeof window === "undefined") return criarWorkspaceAjudaPadrao();
  const salvo = window.localStorage.getItem(CHAVE_WORKSPACE_AJUDA);
  if (!salvo) {
    const inicial = criarWorkspaceAjudaPadrao();
    salvarAjudaLocal(inicial);
    return inicial;
  }
  try {
    return mesclarWorkspaceAjuda(JSON.parse(salvo) as Partial<WorkspaceAjuda>);
  } catch {
    const recuperado = criarWorkspaceAjudaPadrao();
    salvarAjudaLocal(recuperado);
    return recuperado;
  }
}

export function salvarAjudaLocal(workspace: WorkspaceAjuda) {
  if (typeof window === "undefined") return workspace;
  const atualizado = { ...workspace, atualizadoEm: agoraIso() };
  window.localStorage.setItem(CHAVE_WORKSPACE_AJUDA, JSON.stringify(atualizado));
  window.dispatchEvent(new CustomEvent(EVENTO_WORKSPACE_AJUDA));
  return atualizado;
}

export function alternarEtapaOnboardingLocal(id: string) {
  const workspace = carregarAjudaLocal();
  const existe = workspace.etapasConcluidas.includes(id);
  const etapasConcluidas = existe
    ? workspace.etapasConcluidas.filter((item) => item !== id)
    : [...workspace.etapasConcluidas, id];
  return salvarAjudaLocal({ ...workspace, etapasConcluidas, onboardingConcluido: etapasConcluidas.length >= 6 });
}

export function concluirOnboardingLocal() {
  const workspace = carregarAjudaLocal();
  const etapasConcluidas = [
    "conhecer-interface",
    "configurar-workspace",
    "configurar-integracoes",
    "criar-primeiro-video",
    "acompanhar-producao",
    "planejar-publicacao",
  ];
  return salvarAjudaLocal({ ...workspace, etapasConcluidas, onboardingConcluido: true });
}

export function reiniciarOnboardingLocal() {
  const workspace = carregarAjudaLocal();
  return salvarAjudaLocal({ ...workspace, etapasConcluidas: [], onboardingConcluido: false });
}

export function registrarGuiaVisualizadoLocal(id: string) {
  const workspace = carregarAjudaLocal();
  if (workspace.guiasVisualizados.includes(id)) return workspace;
  return salvarAjudaLocal({ ...workspace, guiasVisualizados: [...workspace.guiasVisualizados, id] });
}

export function alternarGuiaFavoritoLocal(id: string) {
  const workspace = carregarAjudaLocal();
  const guiasFavoritos = workspace.guiasFavoritos.includes(id)
    ? workspace.guiasFavoritos.filter((item) => item !== id)
    : [...workspace.guiasFavoritos, id];
  return salvarAjudaLocal({ ...workspace, guiasFavoritos });
}

export function alternarProblemaResolvidoLocal(id: string) {
  const workspace = carregarAjudaLocal();
  const problemasResolvidos = workspace.problemasResolvidos.includes(id)
    ? workspace.problemasResolvidos.filter((item) => item !== id)
    : [...workspace.problemasResolvidos, id];
  return salvarAjudaLocal({ ...workspace, problemasResolvidos });
}

export function marcarNovidadeLidaLocal(versao: string) {
  const workspace = carregarAjudaLocal();
  if (workspace.novidadesLidas.includes(versao)) return workspace;
  return salvarAjudaLocal({ ...workspace, novidadesLidas: [...workspace.novidadesLidas, versao] });
}

function lerJsonLocal<T>(chave: string): { valor: T | null; erro: boolean } {
  if (typeof window === "undefined") return { valor: null, erro: false };
  const salvo = window.localStorage.getItem(chave);
  if (!salvo) return { valor: null, erro: false };
  try {
    return { valor: JSON.parse(salvo) as T, erro: false };
  } catch {
    return { valor: null, erro: true };
  }
}

function medirLocalStorage() {
  if (typeof window === "undefined") return { totalBytes: 0, itens: [] as Array<{ chave: string; bytes: number }> };
  const codificador = new TextEncoder();
  const itens: Array<{ chave: string; bytes: number }> = [];
  for (let indice = 0; indice < window.localStorage.length; indice += 1) {
    const chave = window.localStorage.key(indice);
    if (!chave?.startsWith("makeflux:")) continue;
    const valor = window.localStorage.getItem(chave) ?? "";
    itens.push({ chave, bytes: codificador.encode(chave).byteLength + codificador.encode(valor).byteLength });
  }
  return { totalBytes: itens.reduce((total, item) => total + item.bytes, 0), itens };
}

function item(
  id: string,
  titulo: string,
  descricao: string,
  categoria: ItemDiagnostico["categoria"],
  status: ItemDiagnostico["status"],
  detalhes: string,
  rotaCorrecao?: string,
): ItemDiagnostico {
  return { id, titulo, descricao, categoria, status, detalhes, rotaCorrecao };
}

type ConfiguracoesMinimas = {
  workspace?: { nome?: string; pastaPrincipal?: string; pastaExportacoes?: string };
  backup?: { ultimoBackupEm?: string | null };
  seguranca?: { pinHash?: string; removerDadosSensiveisDosLogs?: boolean };
  perfil?: { idioma?: string; fotoDataUrl?: string };
};

type IntegracoesMinimas = {
  integracoes?: Array<{
    id?: string;
    nome?: string;
    status?: string;
    ativa?: boolean;
    instalada?: boolean;
    credencialConfigurada?: boolean;
    credencialMascara?: string;
    endpoint?: string;
    configuracoes?: Record<string, unknown>;
  }>;
};

type ProjetosMinimos = { projetos?: unknown[] };

export async function executarDiagnosticoLocal(): Promise<ResultadoDiagnostico> {
  await new Promise<void>((resolver) => window.setTimeout(resolver, 650));
  const itens: ItemDiagnostico[] = [];

  try {
    const chaveTeste = "makeflux:diagnostico:teste";
    window.localStorage.setItem(chaveTeste, "ok");
    window.localStorage.removeItem(chaveTeste);
    itens.push(item("persistencia", "Persistência local", "Leitura e gravação do workspace.", "armazenamento", "aprovado", "O armazenamento local respondeu corretamente."));
  } catch {
    itens.push(item("persistencia", "Persistência local", "Leitura e gravação do workspace.", "armazenamento", "erro", "O navegador bloqueou o armazenamento local."));
  }

  const configuracoes = lerJsonLocal<ConfiguracoesMinimas>(CHAVE_CONFIGURACOES);
  if (configuracoes.erro) {
    itens.push(item("configuracoes", "Configurações", "Integridade das preferências locais.", "workspace", "erro", "O registro de configurações está corrompido.", "/configuracoes"));
  } else if (!configuracoes.valor) {
    itens.push(item("configuracoes", "Configurações", "Integridade das preferências locais.", "workspace", "atencao", "As configurações ainda não foram inicializadas.", "/configuracoes"));
  } else {
    const pastaPrincipal = configuracoes.valor.workspace?.pastaPrincipal?.trim();
    itens.push(item(
      "configuracoes",
      "Configurações",
      "Integridade das preferências locais.",
      "workspace",
      pastaPrincipal ? "aprovado" : "atencao",
      pastaPrincipal ? "Workspace configurado e legível." : "Defina a pasta principal antes da produção real.",
      pastaPrincipal ? undefined : "/configuracoes?secao=workspace",
    ));
  }

  const projetos = lerJsonLocal<ProjetosMinimos>(CHAVE_PROJETOS);
  if (projetos.erro) {
    itens.push(item("projetos", "Projetos", "Integridade do catálogo de projetos.", "workspace", "erro", "O catálogo de projetos não pôde ser interpretado.", "/projetos"));
  } else {
    const quantidade = projetos.valor?.projetos?.length ?? 0;
    itens.push(item("projetos", "Projetos", "Integridade do catálogo de projetos.", "workspace", "aprovado", `${quantidade} projeto(s) registrado(s) no workspace.`));
  }

  const integracoes = lerJsonLocal<IntegracoesMinimas>(CHAVE_INTEGRACOES);
  if (integracoes.erro) {
    itens.push(item("integracoes", "Catálogo de integrações", "Provedores e configurações do motor.", "integracoes", "erro", "O catálogo de integrações está corrompido.", "/integracoes"));
  } else if (!integracoes.valor?.integracoes?.length) {
    itens.push(item("integracoes", "Catálogo de integrações", "Provedores e configurações do motor.", "integracoes", "atencao", "Abra Integrações para inicializar o catálogo.", "/integracoes"));
  } else {
    const ativas = integracoes.valor.integracoes.filter((integracao) => integracao.ativa).length;
    const conectadas = integracoes.valor.integracoes.filter((integracao) => integracao.ativa && integracao.status === "conectada").length;
    itens.push(item(
      "integracoes",
      "Catálogo de integrações",
      "Provedores e configurações do motor.",
      "integracoes",
      conectadas > 0 ? "aprovado" : "atencao",
      `${ativas} integração(ões) ativa(s) e ${conectadas} confirmada(s) como conectada(s).`,
      conectadas > 0 ? undefined : "/integracoes",
    ));

    for (const id of ["moneyprinter-turbo", "ffmpeg"] as const) {
      const integracao = integracoes.valor.integracoes.find((registro) => registro.id === id);
      const nome = id === "moneyprinter-turbo" ? "MoneyPrinterTurbo" : "FFmpeg";
      const pronta = Boolean(integracao?.ativa && (integracao.status === "conectada" || integracao.instalada));
      itens.push(item(
        id,
        nome,
        `Disponibilidade do ${nome} para o processamento local.`,
        "integracoes",
        pronta ? "aprovado" : "atencao",
        pronta ? `${nome} está marcado como disponível.` : `${nome} ainda requer confirmação pelo adaptador nativo.`,
        pronta ? undefined : "/integracoes",
      ));
    }
  }

  const armazenamento = medirLocalStorage();
  const limiteAtencao = 4 * 1024 * 1024;
  itens.push(item(
    "uso-armazenamento",
    "Uso do armazenamento",
    "Volume de dados persistidos pela interface.",
    "armazenamento",
    armazenamento.totalBytes > limiteAtencao ? "atencao" : "aprovado",
    `${(armazenamento.totalBytes / 1024).toFixed(1)} KB usados por dados do MakeFlux Studio.`,
    armazenamento.totalBytes > limiteAtencao ? "/configuracoes?secao=armazenamento" : undefined,
  ));

  const tauriDetectado = emAmbienteTauri();
  itens.push(item(
    "ambiente-desktop",
    "Ambiente desktop",
    "Detecção do runtime Tauri.",
    "aplicativo",
    tauriDetectado ? "aprovado" : "atencao",
    tauriDetectado ? "Runtime desktop Tauri detectado." : "Executando na prévia web; recursos nativos ficam limitados.",
  ));

  if (tauriDetectado) {
    try {
      const capacidades = await detectarCapacidadesSistema();
      itens.push(item(
        "runtime-offline",
        "Runtime offline",
        "Python, FFmpeg e recursos do computador.",
        "aplicativo",
        capacidades.modoOfflinePronto ? "aprovado" : "atencao",
        capacidades.modoOfflinePronto
          ? `Python e FFmpeg detectados; ${capacidades.nucleosLogicos} threads e ${Math.round(capacidades.memoriaTotalMb / 1024)} GB de RAM disponíveis.`
          : "Python ou FFmpeg não foi detectado pelo backend nativo.",
        capacidades.modoOfflinePronto ? undefined : "/integracoes",
      ));
    } catch (falha) {
      itens.push(item("runtime-offline", "Runtime offline", "Python, FFmpeg e recursos do computador.", "aplicativo", "erro", falha instanceof Error ? falha.message : String(falha), "/integracoes"));
    }

    const moneyPrinter = integracoes.valor?.integracoes?.find((registro) => registro.id === "moneyprinter-turbo");
    if (moneyPrinter?.endpoint) {
      try {
        const diagnosticoMotor = await verificarMoneyPrinter(moneyPrinter.endpoint);
        itens.push(item(
          "api-moneyprinter-real",
          "API real do MoneyPrinterTurbo",
          "OpenAPI e resposta do endpoint local.",
          "integracoes",
          diagnosticoMotor.disponivel ? "aprovado" : "atencao",
          diagnosticoMotor.mensagem,
          diagnosticoMotor.disponivel ? undefined : "/integracoes",
        ));
      } catch (falha) {
        itens.push(item("api-moneyprinter-real", "API real do MoneyPrinterTurbo", "OpenAPI e resposta do endpoint local.", "integracoes", "atencao", falha instanceof Error ? falha.message : String(falha), "/integracoes"));
      }
    }
  }

  const webCryptoDisponivel = Boolean(globalThis.crypto?.subtle);
  itens.push(item(
    "seguranca",
    "Recursos de segurança",
    "Disponibilidade de Web Crypto para PIN e hashes.",
    "seguranca",
    webCryptoDisponivel ? "aprovado" : "erro",
    webCryptoDisponivel ? "Web Crypto disponível." : "Web Crypto não está disponível neste ambiente.",
    webCryptoDisponivel ? undefined : "/configuracoes?secao=seguranca",
  ));

  const aprovados = itens.filter((registro) => registro.status === "aprovado").length;
  const atencoes = itens.filter((registro) => registro.status === "atencao").length;
  const erros = itens.filter((registro) => registro.status === "erro").length;
  const resultado: ResultadoDiagnostico = {
    executadoEm: agoraIso(),
    statusGeral: erros ? "erro" : atencoes ? "atencao" : "aprovado",
    itens,
    resumo: { aprovados, atencoes, erros },
  };
  const workspace = carregarAjudaLocal();
  salvarAjudaLocal({ ...workspace, ultimoDiagnostico: resultado });
  return resultado;
}

function sanitizarTexto(texto: string) {
  return texto
    .replace(/C:\\Users\\[^\\]+/gi, "%USERPROFILE%")
    .replace(/\/home\/[^/]+/gi, "$HOME")
    .replace(/([?&](?:key|token|secret|api_key)=)[^&\s]+/gi, "$1[REMOVIDO]")
    .replace(/(?:sk|pk)-[A-Za-z0-9_-]{12,}/g, "[CREDENCIAL_REMOVIDA]");
}

function sanitizarValor(valor: unknown, chave = ""): unknown {
  if (/credencial|secret|token|api.?key|pinHash|fotoDataUrl/i.test(chave)) return "[REMOVIDO]";
  if (typeof valor === "string") return sanitizarTexto(valor);
  if (Array.isArray(valor)) return valor.map((item) => sanitizarValor(item));
  if (valor && typeof valor === "object") {
    return Object.fromEntries(Object.entries(valor).map(([nome, conteudo]) => [nome, sanitizarValor(conteudo, nome)]));
  }
  return valor;
}

export function criarPacoteSuporteLocal(diagnostico?: ResultadoDiagnostico): PacoteSuporteMakeFlux {
  const resultado = diagnostico ?? carregarAjudaLocal().ultimoDiagnostico;
  if (!resultado) throw new Error("Execute o diagnóstico antes de gerar o pacote de suporte.");
  const configuracoes = lerJsonLocal<Record<string, unknown>>(CHAVE_CONFIGURACOES).valor ?? {};
  const configuracoesSanitizadas = sanitizarValor(configuracoes) as Record<string, unknown>;
  const perfil = configuracoesSanitizadas.perfil;
  if (perfil && typeof perfil === "object" && !Array.isArray(perfil)) {
    const idioma = (perfil as Record<string, unknown>).idioma;
    configuracoesSanitizadas.perfil = { idioma: typeof idioma === "string" ? idioma : "não informado" };
  }
  const integracoes = lerJsonLocal<IntegracoesMinimas>(CHAVE_INTEGRACOES).valor?.integracoes ?? [];
  const armazenamento = medirLocalStorage().itens;
  return {
    produto: "MakeFlux Studio",
    formato: "makeflux-support",
    versao: 1,
    criadoEm: agoraIso(),
    aplicativo: {
      versao: "0.12.0",
      ambiente: "__TAURI_INTERNALS__" in window ? "tauri" : "web",
      idioma: navigator.language,
      userAgent: sanitizarTexto(navigator.userAgent),
      tauriDetectado: "__TAURI_INTERNALS__" in window,
    },
    diagnostico: resultado,
    armazenamento,
    configuracoes: configuracoesSanitizadas,
    integracoes: integracoes.map((integracao) => sanitizarValor({
      id: integracao.id,
      nome: integracao.nome,
      status: integracao.status,
      ativa: integracao.ativa,
      instalada: integracao.instalada,
      credencialConfigurada: integracao.credencialConfigurada,
      endpoint: integracao.endpoint,
      configuracoes: integracao.configuracoes,
    }) as Record<string, unknown>),
    logs: [
      `[${resultado.executadoEm}] Diagnóstico geral: ${resultado.statusGeral}.`,
      `[${resultado.executadoEm}] ${resultado.resumo.aprovados} aprovado(s), ${resultado.resumo.atencoes} atenção(ões), ${resultado.resumo.erros} erro(s).`,
      "Credenciais, PIN, foto local e caminhos pessoais foram removidos ou mascarados.",
    ],
  };
}

export function baixarPacoteSuporteLocal(diagnostico?: ResultadoDiagnostico) {
  const pacote = criarPacoteSuporteLocal(diagnostico);
  const blob = new Blob([JSON.stringify(pacote, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const ancora = document.createElement("a");
  ancora.href = url;
  ancora.download = `makeflux-suporte-${pacote.criadoEm.slice(0, 10)}.json`;
  document.body.appendChild(ancora);
  ancora.click();
  ancora.remove();
  URL.revokeObjectURL(url);
  return pacote;
}

export function copiarResumoDiagnosticoLocal(resultado: ResultadoDiagnostico) {
  const linhas = [
    `MakeFlux Studio 0.12.0 — diagnóstico ${resultado.statusGeral}`,
    `Executado em: ${new Date(resultado.executadoEm).toLocaleString("pt-BR")}`,
    `Aprovados: ${resultado.resumo.aprovados} | Atenções: ${resultado.resumo.atencoes} | Erros: ${resultado.resumo.erros}`,
    "",
    ...resultado.itens.map((registro) => `[${registro.status.toUpperCase()}] ${registro.titulo}: ${registro.detalhes}`),
  ];
  return navigator.clipboard.writeText(linhas.join("\n"));
}

import { etapasProducao, pesosPrioridade } from "@/data/producao";
import { obterConfiguracaoMoneyPrinter, motorRealDisponivel } from "@/lib/motor-moneyprinter";
import { carregarConfiguracoesLocais } from "@/lib/configuracoes-locais";
import { alterarStatusProjetoLocal } from "@/lib/projetos-locais";
import type { ProjetoStudio } from "@/types/projeto";
import type {
  ArquivoTarefaProducao,
  EtapaTarefaProducao,
  IdEtapaProducao,
  LogTarefaProducao,
  PrioridadeTarefaProducao,
  StatusTarefaProducao,
  TarefaProducao,
  WorkspaceProducao,
} from "@/types/producao";

export const CHAVE_WORKSPACE_PRODUCAO = "makeflux:workspace-producao:v1";
export const EVENTO_WORKSPACE_PRODUCAO = "makeflux:workspace-producao-atualizado";

const workspaceVazio: WorkspaceProducao = {
  versao: 1,
  filaPausada: false,
  tarefas: [],
};

function criarId(prefixo: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefixo}-${crypto.randomUUID()}`;
  }
  return `${prefixo}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function copiarTarefa(tarefa: TarefaProducao): TarefaProducao {
  return JSON.parse(JSON.stringify(tarefa)) as TarefaProducao;
}

function criarLog(
  mensagem: string,
  nivel: LogTarefaProducao["nivel"] = "info",
  criadoEm = new Date().toISOString(),
): LogTarefaProducao {
  return { id: criarId("log"), nivel, mensagem, criadoEm };
}

function criarEtapas(): EtapaTarefaProducao[] {
  return etapasProducao.map((etapa) => ({
    ...etapa,
    status: "pendente",
    progresso: 0,
  }));
}

function normalizarWorkspace(valor: unknown): WorkspaceProducao {
  if (!valor || typeof valor !== "object") return workspaceVazio;
  const candidato = valor as Partial<WorkspaceProducao>;
  if (candidato.versao !== 1 || !Array.isArray(candidato.tarefas)) return workspaceVazio;
  return {
    versao: 1,
    filaPausada: Boolean(candidato.filaPausada),
    tarefas: candidato.tarefas.map((tarefa) => ({
      ...copiarTarefa(tarefa),
      modoExecucao: tarefa.modoExecucao === "moneyprinter" ? "moneyprinter" : "simulada",
    })),
  };
}

export function carregarWorkspaceProducao(): WorkspaceProducao {
  if (typeof window === "undefined") return workspaceVazio;
  const salvo = window.localStorage.getItem(CHAVE_WORKSPACE_PRODUCAO);
  if (!salvo) return workspaceVazio;
  try {
    return normalizarWorkspace(JSON.parse(salvo));
  } catch {
    return workspaceVazio;
  }
}

export function salvarWorkspaceProducao(workspace: WorkspaceProducao) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHAVE_WORKSPACE_PRODUCAO, JSON.stringify(workspace));
  window.dispatchEvent(new CustomEvent(EVENTO_WORKSPACE_PRODUCAO));
}

function transformarWorkspace(
  transformacao: (workspace: WorkspaceProducao) => WorkspaceProducao,
) {
  const atual = carregarWorkspaceProducao();
  const proximo = transformacao(atual);
  salvarWorkspaceProducao(proximo);
  return proximo;
}

function atualizarTarefa(
  id: string,
  atualizacao: (tarefa: TarefaProducao) => TarefaProducao,
): TarefaProducao | null {
  let resultado: TarefaProducao | null = null;
  transformarWorkspace((workspace) => ({
    ...workspace,
    tarefas: workspace.tarefas.map((tarefa) => {
      if (tarefa.id !== id) return tarefa;
      resultado = atualizacao(copiarTarefa(tarefa));
      return resultado;
    }),
  }));
  return resultado;
}

function calcularTempoEstimado(projeto: ProjetoStudio) {
  const cenas = Math.max(projeto.configuracao.cenas.length, 1);
  const versoes = Math.max(projeto.configuracao.quantidadeVersoes, 1);
  return 55 + cenas * 12 + versoes * 28;
}

export function criarTarefaProducaoLocal(
  projeto: ProjetoStudio,
  prioridade: PrioridadeTarefaProducao = "normal",
) {
  const existente = carregarWorkspaceProducao().tarefas.find(
    (tarefa) =>
      tarefa.projetoId === projeto.id &&
      !["concluida", "erro", "cancelada"].includes(tarefa.status),
  );
  if (existente) return existente;

  const agora = new Date().toISOString();
  const configuracaoMotor = obterConfiguracaoMoneyPrinter();
  const configuracoes = carregarConfiguracoesLocais();
  const usarMotorReal = motorRealDisponivel();
  const tarefa: TarefaProducao = {
    id: criarId("tarefa"),
    projetoId: projeto.id,
    nome: projeto.nome,
    descricao: projeto.descricao,
    status: "na-fila",
    prioridade,
    etapaAtual: "roteiro",
    progresso: 0,
    etapas: criarEtapas(),
    formato: projeto.configuracao.formato,
    qualidade: projeto.configuracao.qualidade,
    proporcao: projeto.configuracao.formato,
    quantidadeVersoes: projeto.configuracao.quantidadeVersoes,
    codificador: projeto.configuracao.codificador,
    duracaoEstimada: projeto.configuracao.duracao,
    tempoEstimadoSegundos: calcularTempoEstimado(projeto),
    tempoDecorridoSegundos: 0,
    criadaEm: agora,
    atualizadaEm: agora,
    pastaSaida: usarMotorReal
      ? configuracoes.workspace.pastaExportacoes || "Vídeos\\MakeFlux Studio\\Exportacoes"
      : "Modo simulação — nenhum arquivo será criado",
    modoExecucao: usarMotorReal ? "moneyprinter" : "simulada",
    motorEndpoint: usarMotorReal ? configuracaoMotor?.endpoint : undefined,
    logs: [
      criarLog(
        usarMotorReal
          ? "Tarefa adicionada à fila real do MoneyPrinterTurbo."
          : "Tarefa adicionada à fila de produção simulada.",
        "sucesso",
        agora,
      ),
    ],
    arquivos: [],
  };

  transformarWorkspace((workspace) => ({
    ...workspace,
    tarefas: [tarefa, ...workspace.tarefas],
  }));
  alterarStatusProjetoLocal(projeto.id, "pronto");
  return tarefa;
}

export function obterTarefaProducaoLocal(id: string) {
  return carregarWorkspaceProducao().tarefas.find((tarefa) => tarefa.id === id) ?? null;
}

export function alternarFilaProducaoLocal() {
  return transformarWorkspace((workspace) => ({
    ...workspace,
    filaPausada: !workspace.filaPausada,
  })).filaPausada;
}

export function pausarTarefaProducaoLocal(id: string) {
  return atualizarTarefa(id, (tarefa) => ({
    ...tarefa,
    status: "pausada",
    atualizadaEm: new Date().toISOString(),
    logs: [criarLog("Processamento pausado pelo usuário.", "aviso"), ...tarefa.logs].slice(0, 120),
  }));
}

export function retomarTarefaProducaoLocal(id: string) {
  return atualizarTarefa(id, (tarefa) => ({
    ...tarefa,
    status:
      tarefa.modoExecucao === "moneyprinter" && tarefa.motorTarefaId
        ? "processando"
        : "na-fila",
    atualizadaEm: new Date().toISOString(),
    erro: undefined,
    logs: [criarLog("Tarefa devolvida à fila para continuar.", "info"), ...tarefa.logs].slice(0, 120),
  }));
}

export function cancelarTarefaProducaoLocal(id: string) {
  return atualizarTarefa(id, (tarefa) => ({
    ...tarefa,
    status: "cancelada",
    atualizadaEm: new Date().toISOString(),
    logs: [criarLog("Tarefa cancelada pelo usuário.", "aviso"), ...tarefa.logs].slice(0, 120),
  }));
}

export function tentarNovamenteTarefaProducaoLocal(id: string) {
  return atualizarTarefa(id, (tarefa) => ({
    ...tarefa,
    status: "na-fila",
    progresso: 0,
    etapaAtual: "roteiro",
    etapas: criarEtapas(),
    tempoDecorridoSegundos: 0,
    iniciadaEm: undefined,
    concluidaEm: undefined,
    atualizadaEm: new Date().toISOString(),
    erro: undefined,
    arquivos: [],
    motorTarefaId: undefined,
    ultimaSincronizacaoEm: undefined,
    logs: [criarLog("Nova tentativa adicionada à fila.", "info"), ...tarefa.logs].slice(0, 120),
  }));
}

export function duplicarTarefaProducaoLocal(id: string) {
  const original = obterTarefaProducaoLocal(id);
  if (!original) return null;
  const agora = new Date().toISOString();
  const duplicada: TarefaProducao = {
    ...copiarTarefa(original),
    id: criarId("tarefa"),
    status: "na-fila",
    progresso: 0,
    etapaAtual: "roteiro",
    etapas: criarEtapas(),
    tempoDecorridoSegundos: 0,
    criadaEm: agora,
    atualizadaEm: agora,
    iniciadaEm: undefined,
    concluidaEm: undefined,
    erro: undefined,
    arquivos: [],
    motorTarefaId: undefined,
    ultimaSincronizacaoEm: undefined,
    logs: [criarLog("Nova renderização criada a partir da tarefa anterior.", "sucesso", agora)],
  };
  transformarWorkspace((workspace) => ({ ...workspace, tarefas: [duplicada, ...workspace.tarefas] }));
  return duplicada;
}

export function alterarPrioridadeTarefaProducaoLocal(
  id: string,
  prioridade: PrioridadeTarefaProducao,
) {
  return atualizarTarefa(id, (tarefa) => ({
    ...tarefa,
    prioridade,
    atualizadaEm: new Date().toISOString(),
    logs: [criarLog(`Prioridade alterada para ${prioridade}.`, "info"), ...tarefa.logs].slice(0, 120),
  }));
}

export function excluirTarefaProducaoLocal(id: string) {
  transformarWorkspace((workspace) => ({
    ...workspace,
    tarefas: workspace.tarefas.filter((tarefa) => tarefa.id !== id),
  }));
}

export function limparTarefasFinalizadasLocal() {
  transformarWorkspace((workspace) => ({
    ...workspace,
    tarefas: workspace.tarefas.filter(
      (tarefa) => !["concluida", "cancelada"].includes(tarefa.status),
    ),
  }));
}

export function simularErroTarefaProducaoLocal(id: string) {
  return atualizarTarefa(id, (tarefa) => ({
    ...tarefa,
    status: "erro",
    atualizadaEm: new Date().toISOString(),
    erro: {
      titulo: "Não foi possível concluir a narração",
      descricao: "O provedor de voz não respondeu durante o processamento desta etapa.",
      causaProvavel: "Conexão indisponível, voz incompatível ou limite temporário do provedor.",
      acaoSugerida: "Revise a voz do projeto e tente novamente a partir desta tarefa.",
      codigoTecnico: "VOICE_PROVIDER_UNAVAILABLE",
    },
    etapas: tarefa.etapas.map((etapa) =>
      etapa.id === tarefa.etapaAtual ? { ...etapa, status: "erro" } : etapa,
    ),
    logs: [criarLog("Falha simulada para validar o tratamento de erros.", "erro"), ...tarefa.logs].slice(0, 120),
  }));
}

function atualizarEtapasPorProgresso(
  etapas: EtapaTarefaProducao[],
  progresso: number,
  agora: string,
) {
  const tamanhoEtapa = 100 / etapas.length;
  const indiceAtual = Math.min(Math.floor(progresso / tamanhoEtapa), etapas.length - 1);
  return etapas.map((etapa, indice) => {
    if (progresso >= 100 || indice < indiceAtual) {
      return {
        ...etapa,
        status: "concluida" as const,
        progresso: 100,
        iniciadoEm: etapa.iniciadoEm ?? agora,
        concluidoEm: etapa.concluidoEm ?? agora,
      };
    }
    if (indice === indiceAtual) {
      const inicio = indice * tamanhoEtapa;
      return {
        ...etapa,
        status: "processando" as const,
        progresso: Math.max(1, Math.min(99, Math.round(((progresso - inicio) / tamanhoEtapa) * 100))),
        iniciadoEm: etapa.iniciadoEm ?? agora,
      };
    }
    return { ...etapa, status: "pendente" as const, progresso: 0 };
  });
}

function ordenarFila(a: TarefaProducao, b: TarefaProducao) {
  const prioridade = pesosPrioridade[b.prioridade] - pesosPrioridade[a.prioridade];
  if (prioridade !== 0) return prioridade;
  return new Date(a.criadaEm).getTime() - new Date(b.criadaEm).getTime();
}

export function avancarSimulacaoProducaoLocal() {
  const workspace = carregarWorkspaceProducao();
  if (workspace.filaPausada) return;

  const simuladas = workspace.tarefas.filter((tarefa) => tarefa.modoExecucao !== "moneyprinter");
  const ativa = simuladas.find((tarefa) => tarefa.status === "processando");
  const proxima = ativa ?? [...simuladas].filter((tarefa) => tarefa.status === "na-fila").sort(ordenarFila)[0];
  if (!proxima) return;

  const agora = new Date().toISOString();
  const incremento = proxima.status === "na-fila" ? 2 : 4;
  const novoProgresso = Math.min(100, proxima.progresso + incremento);
  const novasEtapas = atualizarEtapasPorProgresso(proxima.etapas, novoProgresso, agora);
  const novaEtapa = novasEtapas.find((etapa) => etapa.status === "processando")?.id ?? "finalizacao";
  const mudouEtapa = novaEtapa !== proxima.etapaAtual;
  const concluida = novoProgresso >= 100;

  atualizarTarefa(proxima.id, (tarefa) => ({
    ...tarefa,
    status: concluida ? "concluida" : "processando",
    progresso: novoProgresso,
    etapaAtual: novaEtapa,
    etapas: novasEtapas,
    tempoDecorridoSegundos: tarefa.tempoDecorridoSegundos + 4,
    iniciadaEm: tarefa.iniciadaEm ?? agora,
    concluidaEm: concluida ? agora : undefined,
    atualizadaEm: agora,
    arquivos: tarefa.arquivos,
    logs: concluida
      ? [criarLog("Simulação concluída. Nenhum vídeo ou arquivo foi criado.", "aviso", agora), ...tarefa.logs].slice(0, 120)
      : mudouEtapa
        ? [
            criarLog(
              `Etapa iniciada: ${etapasProducao.find((etapa) => etapa.id === novaEtapa)?.titulo ?? novaEtapa}.`,
              "info",
              agora,
            ),
            ...tarefa.logs,
          ].slice(0, 120)
        : tarefa.logs,
  }));

  if (concluida) alterarStatusProjetoLocal(proxima.projetoId, "concluido");
}

export function marcarTarefaEnviadaAoMotorLocal(
  id: string,
  motorTarefaId: string,
  endpoint: string,
) {
  const agora = new Date().toISOString();
  return atualizarTarefa(id, (tarefa) => ({
    ...tarefa,
    status: "processando",
    motorTarefaId,
    motorEndpoint: endpoint,
    iniciadaEm: tarefa.iniciadaEm ?? agora,
    atualizadaEm: agora,
    ultimaSincronizacaoEm: agora,
    logs: [criarLog(`Tarefa enviada ao MoneyPrinterTurbo: ${motorTarefaId}.`, "sucesso", agora), ...tarefa.logs].slice(0, 120),
  }));
}

export function atualizarProgressoMotorLocal(id: string, progresso: number) {
  const agora = new Date().toISOString();
  const normalizado = Math.max(0, Math.min(99, Math.round(progresso)));
  return atualizarTarefa(id, (tarefa) => {
    const etapas = atualizarEtapasPorProgresso(tarefa.etapas, normalizado, agora);
    return {
      ...tarefa,
      status: "processando",
      progresso: normalizado,
      etapaAtual: etapas.find((etapa) => etapa.status === "processando")?.id ?? tarefa.etapaAtual,
      etapas,
      tempoDecorridoSegundos: tarefa.tempoDecorridoSegundos + 2,
      atualizadaEm: agora,
      ultimaSincronizacaoEm: agora,
    };
  });
}

export function atualizarPastaSaidaTarefaLocal(id: string, pastaSaida: string) {
  const agora = new Date().toISOString();
  return atualizarTarefa(id, (tarefa) => ({
    ...tarefa,
    pastaSaida,
    atualizadaEm: agora,
    logs: [criarLog(`Pasta de exportação preparada: ${pastaSaida}`, "info", agora), ...tarefa.logs].slice(0, 120),
  }));
}

export function concluirTarefaMotorLocal(
  id: string,
  arquivos: Array<{ nome: string; tipo: ArquivoTarefaProducao["tipo"]; caminho: string; tamanho?: string }>,
  pastaSaida?: string,
) {
  const agora = new Date().toISOString();
  const tarefa = atualizarTarefa(id, (atual) => ({
    ...atual,
    status: "concluida",
    progresso: 100,
    etapaAtual: "finalizacao",
    etapas: atualizarEtapasPorProgresso(atual.etapas, 100, agora),
    concluidaEm: agora,
    atualizadaEm: agora,
    ultimaSincronizacaoEm: agora,
    pastaSaida: pastaSaida || atual.pastaSaida,
    arquivos: arquivos.map((arquivo) => ({ id: criarId("arquivo"), tamanho: arquivo.tamanho || "Arquivo gerado", ...arquivo })),
    logs: [criarLog("MoneyPrinterTurbo concluiu a tarefa e retornou os arquivos finais.", "sucesso", agora), ...atual.logs].slice(0, 120),
  }));
  if (tarefa) alterarStatusProjetoLocal(tarefa.projetoId, "concluido");
  return tarefa;
}

export function falharTarefaMotorLocal(id: string, mensagem: string) {
  const agora = new Date().toISOString();
  return atualizarTarefa(id, (tarefa) => ({
    ...tarefa,
    status: "erro",
    atualizadaEm: agora,
    ultimaSincronizacaoEm: agora,
    erro: {
      titulo: "O MoneyPrinterTurbo não concluiu a tarefa",
      descricao: mensagem,
      causaProvavel: "Falha no provedor configurado, dependência local ausente ou resposta inválida da API.",
      acaoSugerida: "Abra Integrações, execute o diagnóstico do motor e tente novamente.",
      codigoTecnico: "MONEYPRINTER_TASK_FAILED",
    },
    logs: [criarLog(mensagem, "erro", agora), ...tarefa.logs].slice(0, 120),
  }));
}

export function formatarTempoProducao(segundos: number) {
  const total = Math.max(0, Math.round(segundos));
  const minutos = Math.floor(total / 60);
  const restante = total % 60;
  return `${String(minutos).padStart(2, "0")}:${String(restante).padStart(2, "0")}`;
}

export function formatarHorarioProducao(data: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(data));
}

export function tempoRestanteTarefa(tarefa: TarefaProducao) {
  if (tarefa.status === "concluida") return 0;
  if (tarefa.progresso <= 0) return tarefa.tempoEstimadoSegundos;
  const estimadoTotal = tarefa.tempoDecorridoSegundos / (tarefa.progresso / 100);
  return Math.max(0, Math.round(estimadoTotal - tarefa.tempoDecorridoSegundos));
}

export function rotuloEtapaAtual(id: IdEtapaProducao) {
  return etapasProducao.find((etapa) => etapa.id === id)?.titulo ?? id;
}

export function statusPermitePausa(status: StatusTarefaProducao) {
  return status === "processando" || status === "na-fila";
}

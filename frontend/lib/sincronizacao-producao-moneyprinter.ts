import { pesosPrioridade } from "@/data/producao";
import { carregarConfiguracoesLocais } from "@/lib/configuracoes-locais";
import {
  consolidarArquivosExportacao,
  formatarTamanhoArquivo,
  prepararPastaExportacao,
} from "@/lib/exportacoes-nativas";
import {
  consultarTarefaMoneyPrinter,
  criarVideoMoneyPrinter,
  excluirTarefaMoneyPrinter,
  obterConfiguracaoMoneyPrinter,
} from "@/lib/motor-moneyprinter";
import {
  carregarWorkspaceProducao,
  concluirTarefaMotorLocal,
  falharTarefaMotorLocal,
  marcarTarefaEnviadaAoMotorLocal,
  atualizarProgressoMotorLocal,
  atualizarPastaSaidaTarefaLocal,
} from "@/lib/producao-local";
import { obterProjetoLocal } from "@/lib/projetos-locais";
import { registrarEventoTecnico } from "@/lib/logger-estruturado";
import type { EstadoTarefaMoneyPrinter } from "@/types/motor-moneyprinter";
import type { ArquivoTarefaProducao, TarefaProducao } from "@/types/producao";

let sincronizacaoEmCurso = false;
const falhasTransitórias = new Map<string, number>();

function texto(dados: Record<string, unknown>, chaves: string[]) {
  for (const chave of chaves) {
    const valor = dados[chave];
    if (typeof valor === "string" && valor.trim()) return valor;
  }
  return null;
}

function nomeArquivo(caminho: string) {
  return caminho.split(/[\\/]/).filter(Boolean).at(-1) ?? "arquivo-gerado";
}

function arquivosDaTarefa(tarefa: EstadoTarefaMoneyPrinter) {
  const arquivos: Array<{ nome: string; tipo: ArquivoTarefaProducao["tipo"]; caminho: string }> = [];
  for (const caminho of [...tarefa.videos, ...tarefa.combinedVideos]) {
    arquivos.push({ nome: nomeArquivo(caminho), tipo: "video", caminho });
  }
  if (tarefa.audioFile) arquivos.push({ nome: nomeArquivo(tarefa.audioFile), tipo: "audio", caminho: tarefa.audioFile });
  if (tarefa.subtitleFile) arquivos.push({ nome: nomeArquivo(tarefa.subtitleFile), tipo: "legenda", caminho: tarefa.subtitleFile });
  return arquivos;
}

async function enviarTarefa(tarefa: TarefaProducao) {
  const projeto = obterProjetoLocal(tarefa.projetoId);
  if (!projeto) {
    falharTarefaMotorLocal(tarefa.id, "O projeto vinculado à tarefa não foi encontrado.");
    return;
  }
  const configuracaoMotor = obterConfiguracaoMoneyPrinter();
  const endpoint = tarefa.motorEndpoint ?? configuracaoMotor?.endpoint;
  if (!endpoint) {
    falharTarefaMotorLocal(tarefa.id, "O endpoint do MoneyPrinterTurbo não está configurado.");
    return;
  }
  const configuracoes = carregarConfiguracoesLocais();
  const pasta = await prepararPastaExportacao({
    projeto,
    tarefa,
    pastaPreferida: configuracoes.workspace.pastaExportacoes,
    organizarPorProjeto: configuracoes.workspace.organizarPorProjeto,
  });
  atualizarPastaSaidaTarefaLocal(tarefa.id, pasta.caminho);

  await registrarEventoTecnico("moneyprinter.envio_inicio", "Tarefa enviada ao motor.", { origem: "moneyprinter", correlacaoId: tarefa.id, contexto: { projetoId: tarefa.projetoId, endpoint } });
  const resposta = await criarVideoMoneyPrinter(endpoint, projeto.configuracao, configuracaoMotor?.threads ?? 2);
  const taskId = texto(resposta.dados, ["task_id", "taskId", "id"]);
  if (!resposta.sucesso || !taskId) {
    falharTarefaMotorLocal(tarefa.id, resposta.mensagem || "A API não retornou o identificador da tarefa.");
    return;
  }
  marcarTarefaEnviadaAoMotorLocal(tarefa.id, taskId, endpoint);
  await registrarEventoTecnico("moneyprinter.envio_confirmado", "Motor confirmou a tarefa.", { origem: "moneyprinter", correlacaoId: tarefa.id, contexto: { taskId } });
}

async function consultarTarefa(tarefa: TarefaProducao) {
  if (!tarefa.motorTarefaId || !tarefa.motorEndpoint) return;
  const { resposta, tarefa: estado } = await consultarTarefaMoneyPrinter(tarefa.motorEndpoint, tarefa.motorTarefaId);
  if (!resposta.sucesso) throw new Error(resposta.mensagem);
  falhasTransitórias.delete(tarefa.id);

  if (estado.state === 1) {
    const arquivosOriginais = arquivosDaTarefa(estado);
    const configuracaoMotor = obterConfiguracaoMoneyPrinter();
    const consolidacao = await consolidarArquivosExportacao({
      pastaSaida: tarefa.pastaSaida,
      diretorioMotor: configuracaoMotor?.diretorio ?? "",
      arquivos: arquivosOriginais,
    });
    concluirTarefaMotorLocal(
      tarefa.id,
      consolidacao.arquivos.map((arquivo) => ({
        nome: arquivo.nome,
        tipo: arquivo.tipo,
        caminho: arquivo.caminho,
        tamanho: formatarTamanhoArquivo(arquivo.tamanhoBytes),
      })),
      consolidacao.pastaSaida,
    );
    await registrarEventoTecnico("moneyprinter.renderizacao_concluida", "Arquivos reais consolidados.", { origem: "moneyprinter", correlacaoId: tarefa.id, contexto: { arquivos: consolidacao.arquivos.length, pastaSaida: consolidacao.pastaSaida } });
    return;
  }
  if (estado.state === -1) {
    falharTarefaMotorLocal(tarefa.id, estado.error ?? resposta.mensagem ?? "A tarefa falhou no motor.");
    return;
  }
  atualizarProgressoMotorLocal(tarefa.id, estado.progress);
}

export async function sincronizarProducaoMoneyPrinterLocal() {
  if (sincronizacaoEmCurso || typeof window === "undefined") return;
  sincronizacaoEmCurso = true;
  try {
    const workspace = carregarWorkspaceProducao();
    if (workspace.filaPausada) return;
    const tarefaRemotaPausada = workspace.tarefas.some(
      (tarefa) =>
        tarefa.modoExecucao === "moneyprinter" &&
        tarefa.status === "pausada" &&
        Boolean(tarefa.motorTarefaId),
    );
    if (tarefaRemotaPausada) return;
    const reais = workspace.tarefas.filter(
      (tarefa) =>
        tarefa.modoExecucao === "moneyprinter" &&
        ["na-fila", "processando"].includes(tarefa.status),
    );
    const ativa = reais.find((tarefa) => tarefa.motorTarefaId && tarefa.status === "processando");
    const pendente = [...reais]
      .filter((tarefa) => !tarefa.motorTarefaId && tarefa.status === "na-fila")
      .sort((a, b) => {
        const prioridade = pesosPrioridade[b.prioridade] - pesosPrioridade[a.prioridade];
        return prioridade || a.criadaEm.localeCompare(b.criadaEm);
      })[0];
    const alvo = ativa ?? pendente;
    if (!alvo) return;

    try {
      if (alvo.motorTarefaId) await consultarTarefa(alvo);
      else await enviarTarefa(alvo);
    } catch (falha) {
      const tentativas = (falhasTransitórias.get(alvo.id) ?? 0) + 1;
      falhasTransitórias.set(alvo.id, tentativas);
      if (tentativas >= 3) {
        const mensagemFalha = falha instanceof Error ? falha.message : String(falha);
        falharTarefaMotorLocal(alvo.id, mensagemFalha);
        await registrarEventoTecnico("moneyprinter.sincronizacao_falhou", mensagemFalha, { nivel: "erro", origem: "moneyprinter", correlacaoId: alvo.id, contexto: { tentativas } });
        falhasTransitórias.delete(alvo.id);
      }
    }
  } finally {
    sincronizacaoEmCurso = false;
  }
}

export async function cancelarTarefaMoneyPrinterLocal(tarefa: TarefaProducao) {
  if (tarefa.modoExecucao !== "moneyprinter" || !tarefa.motorEndpoint || !tarefa.motorTarefaId) return;
  try {
    await excluirTarefaMoneyPrinter(tarefa.motorEndpoint, tarefa.motorTarefaId);
  } catch {
    // O cancelamento local continua válido mesmo se a API estiver indisponível.
  }
}

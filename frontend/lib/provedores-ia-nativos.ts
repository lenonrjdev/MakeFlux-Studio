import { invoke } from "@tauri-apps/api/core";

import { provedoresIaDemonstrativos } from "@/data/provedores-ia";
import { emAmbienteTauri } from "@/lib/runtime-nativo";
import type {
  ConfiguracaoProvedorIa,
  EntradaConfiguracaoProvedorIa,
  IdProvedorIa,
  RegistroExecucaoIa,
  ResultadoExecucaoIa,
  ResultadoTesteProvedorIa,
  ResumoUsoIa,
  SolicitacaoExperimentoIa,
} from "@/types/provedores-ia";

export async function listarProvedoresIa() {
  if (!emAmbienteTauri()) return structuredClone(provedoresIaDemonstrativos);
  return invoke<ConfiguracaoProvedorIa[]>("listar_provedores_ia");
}

export async function salvarConfiguracaoProvedorIa(configuracao: EntradaConfiguracaoProvedorIa) {
  if (!emAmbienteTauri()) return provedoresIaDemonstrativos.find((item) => item.id === configuracao.id)!;
  return invoke<ConfiguracaoProvedorIa>("salvar_configuracao_provedor_ia", { configuracao });
}

export async function salvarCredencialProvedorIa(provedor: IdProvedorIa, credencial: string) {
  if (!emAmbienteTauri()) throw new Error("O cofre de credenciais exige o aplicativo desktop.");
  return invoke<ConfiguracaoProvedorIa>("salvar_credencial_provedor_ia", { provedor, credencial });
}

export async function removerCredencialProvedorIa(provedor: IdProvedorIa) {
  if (!emAmbienteTauri()) throw new Error("O cofre de credenciais exige o aplicativo desktop.");
  return invoke<ConfiguracaoProvedorIa>("remover_credencial_provedor_ia", { provedor });
}

export async function testarProvedorIa(provedor: IdProvedorIa) {
  if (!emAmbienteTauri()) throw new Error("O teste real exige o aplicativo desktop.");
  return invoke<ResultadoTesteProvedorIa>("testar_provedor_ia", { provedor });
}

export async function executarExperimentoIaReal(solicitacao: SolicitacaoExperimentoIa) {
  if (!emAmbienteTauri()) throw new Error("A execução real exige o aplicativo desktop.");
  return invoke<ResultadoExecucaoIa>("executar_experimento_ia", { solicitacao });
}

export async function cancelarExecucaoIa(requisicaoId: string) {
  if (!emAmbienteTauri()) return false;
  return invoke<boolean>("cancelar_execucao_ia", { requisicaoId });
}

export async function listarExecucoesIa(limite = 100) {
  if (!emAmbienteTauri()) return [] as RegistroExecucaoIa[];
  return invoke<RegistroExecucaoIa[]>("listar_execucoes_ia", { limite });
}

export async function consultarResumoUsoIa(): Promise<ResumoUsoIa> {
  if (!emAmbienteTauri()) {
    return {
      schemaVersao: 6, provedoresAtivos: 4, provedoresProntos: 0, requisicoesHoje: 0,
      tokensEntradaHoje: 0, tokensSaidaHoje: 0, custoEstimadoHoje: 0, execucoesRecentes: 0,
      mensagem: "Prévia web sem execução real.",
    };
  }
  return invoke<ResumoUsoIa>("consultar_resumo_uso_ia");
}

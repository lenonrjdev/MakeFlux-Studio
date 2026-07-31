import { invoke } from "@tauri-apps/api/core";

import { statusDesempenhoDemonstrativo } from "@/data/desempenho";
import { emAmbienteTauri } from "@/lib/runtime-nativo";
import type {
  FiltroRegistros,
  OperacaoLote,
  PaginaRegistros,
  ResultadoManutencao,
  SolicitacaoOperacaoLote,
  StatusDesempenhoBanco,
} from "@/types/desempenho";

function invocar<T>(comando: string, argumentos?: Record<string, unknown>) {
  if (!emAmbienteTauri()) throw new Error("Esta operação exige o aplicativo desktop.");
  return invoke<T>(comando, argumentos);
}

export async function consultarStatusDesempenho() {
  if (!emAmbienteTauri()) return statusDesempenhoDemonstrativo;
  return invocar<StatusDesempenhoBanco>("consultar_status_desempenho");
}

export async function listarRegistrosPaginados(filtro: FiltroRegistros = {}) {
  if (!emAmbienteTauri()) {
    const itens = Array.from({ length: Math.min(filtro.limite ?? 50, 50) }, (_, indice) => ({
      chave: `makeflux:demonstracao:${String(indice + 1).padStart(4, "0")}`,
      origem: indice % 3 === 0 ? "projetos" : "localStorage",
      atualizadoEm: Date.UTC(2026, 6, 31, 18, indice % 60),
      tamanhoBytes: 640 + indice * 17,
      previa: "Registro demonstrativo usado somente na prévia web.",
    }));
    return { itens, total: 12_480, proximoCursor: "50", duracaoMs: 3.4 } satisfies PaginaRegistros;
  }
  return invocar<PaginaRegistros>("listar_registros_paginados", { filtro });
}

export function iniciarOperacaoLote(solicitacao: SolicitacaoOperacaoLote) {
  if (!emAmbienteTauri()) {
    const agora = Date.now();
    return Promise.resolve({
      id: `demonstracao-${agora}`,
      tipo: solicitacao.tipo,
      status: "concluida",
      total: solicitacao.quantidade ?? 1,
      processados: solicitacao.quantidade ?? 1,
      afetados: solicitacao.quantidade ?? 1,
      iniciadoEm: agora,
      atualizadoEm: agora,
      mensagem: "Operação demonstrativa concluída na prévia web.",
    } satisfies OperacaoLote);
  }
  return invocar<OperacaoLote>("iniciar_operacao_lote", { solicitacao });
}

export function cancelarOperacaoLote(id: string) {
  if (!emAmbienteTauri()) {
    const agora = Date.now();
    return Promise.resolve({
      id,
      tipo: "gerar-dados-teste",
      status: "cancelada",
      total: 0,
      processados: 0,
      afetados: 0,
      iniciadoEm: agora,
      atualizadoEm: agora,
      mensagem: "Operação demonstrativa cancelada.",
    } satisfies OperacaoLote);
  }
  return invocar<OperacaoLote>("cancelar_operacao_lote", { id });
}

export async function listarOperacoesLote() {
  if (!emAmbienteTauri()) return [] as OperacaoLote[];
  return invocar<OperacaoLote[]>("listar_operacoes_lote");
}

export function executarManutencaoBanco(acao: ResultadoManutencao["acao"]) {
  if (!emAmbienteTauri()) {
    return Promise.resolve({
      sucesso: true,
      acao,
      antesBytes: 84_934_656,
      depoisBytes: acao === "compactar" ? 81_788_928 : 84_934_656,
      duracaoMs: 42.7,
      mensagem: "Manutenção demonstrativa concluída na prévia web.",
    } satisfies ResultadoManutencao);
  }
  return invocar<ResultadoManutencao>("executar_manutencao_banco", { acao });
}

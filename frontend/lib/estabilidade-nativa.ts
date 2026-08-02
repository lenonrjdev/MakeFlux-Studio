import { invoke } from "@tauri-apps/api/core";

import { emAmbienteTauri } from "@/lib/runtime-nativo";
import type {
  EntradaIncidenteEstabilidade,
  EntradaSessaoEstabilidade,
  IncidenteEstabilidade,
  ResultadoExportacaoEstabilidade,
  ResultadoLimpezaCache,
  ResultadoReparoBanco,
  ResultadoValidacaoEstabilidade,
  StatusEstabilidade,
} from "@/types/estabilidade";

const demonstracao: StatusEstabilidade = {
  disponivel: false,
  modoSeguro: false,
  falhasConsecutivas: 0,
  execucaoAnteriorInesperada: false,
  restauracaoPendente: false,
  rotaUltimaSessao: "",
  sessaoAtualizadaEm: null,
  ultimaSaidaLimpaEm: null,
  bancoIntegro: true,
  cacheBytes: 0,
  incidentes24h: 0,
  ultimoIncidenteEm: null,
  caminhoBanco: "Disponível somente no aplicativo desktop",
  mensagem: "A camada de estabilidade completa exige o runtime Tauri.",
};

function exigirDesktop() {
  if (!emAmbienteTauri()) {
    throw new Error("Este recurso exige o aplicativo desktop do MakeFlux Studio.");
  }
}

export async function consultarEstabilidade() {
  if (!emAmbienteTauri()) return demonstracao;
  return invoke<StatusEstabilidade>("consultar_estabilidade");
}

export async function registrarSessaoEstabilidade(entrada: EntradaSessaoEstabilidade) {
  if (!emAmbienteTauri()) return demonstracao;
  return invoke<StatusEstabilidade>("registrar_sessao_estabilidade", { entrada });
}

export async function descartarRestauracaoEstabilidade() {
  exigirDesktop();
  return invoke<StatusEstabilidade>("descartar_restauracao_estabilidade");
}

export async function definirModoSeguro(ativo: boolean) {
  exigirDesktop();
  return invoke<StatusEstabilidade>("definir_modo_seguro", { ativo });
}

export async function registrarIncidenteEstabilidade(entrada: EntradaIncidenteEstabilidade) {
  if (!emAmbienteTauri()) return null;
  return invoke<IncidenteEstabilidade>("registrar_incidente_estabilidade", { entrada });
}

export async function listarIncidentesEstabilidade(limite = 100) {
  if (!emAmbienteTauri()) return [];
  return invoke<IncidenteEstabilidade[]>("listar_incidentes_estabilidade", { limite });
}

export async function marcarIncidenteRecuperado(incidenteId: string) {
  exigirDesktop();
  return invoke<IncidenteEstabilidade[]>("marcar_incidente_recuperado", { incidenteId });
}

export async function validarArquivosEstabilidade() {
  exigirDesktop();
  return invoke<ResultadoValidacaoEstabilidade>("validar_arquivos_estabilidade");
}

export async function repararBancoEstabilidade() {
  exigirDesktop();
  return invoke<ResultadoReparoBanco>("reparar_banco_estabilidade");
}

export async function limparCacheEstabilidade(retencaoDias = 7) {
  exigirDesktop();
  return invoke<ResultadoLimpezaCache>("limpar_cache_estabilidade", { retencaoDias });
}

export async function exportarRelatorioEstabilidade() {
  exigirDesktop();
  return invoke<ResultadoExportacaoEstabilidade>("exportar_relatorio_estabilidade");
}

export async function revelarArtefatoEstabilidade(caminho: string) {
  exigirDesktop();
  return invoke<void>("revelar_artefato_estabilidade", { caminho });
}

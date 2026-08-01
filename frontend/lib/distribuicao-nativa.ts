import { invoke } from "@tauri-apps/api/core";

import { emAmbienteTauri } from "@/lib/runtime-nativo";
import type {
  AtivoTemporarioPublicacao,
  ConfiguracaoArmazenamentoPublicacao,
  EntradaConfiguracaoArmazenamento,
  ResultadoLimpezaAtivos,
} from "@/types/distribuicao";

function exigirDesktop() {
  if (!emAmbienteTauri()) {
    throw new Error("A distribuição robusta exige o aplicativo desktop.");
  }
}

export async function consultarConfiguracaoArmazenamento() {
  if (!emAmbienteTauri()) {
    return {
      provedor: "cloudinary",
      cloudName: "",
      apiKeyConfigurada: false,
      apiSecretConfigurado: false,
      tamanhoBlocoMb: 8,
      retencaoHoras: 24,
      limpezaAutomatica: true,
      status: "nao-configurado",
      ultimaVerificacaoEm: null,
      mensagem: "Abra o aplicativo desktop para configurar o armazenamento.",
    } satisfies ConfiguracaoArmazenamentoPublicacao;
  }
  return invoke<ConfiguracaoArmazenamentoPublicacao>(
    "consultar_configuracao_armazenamento_publicacao",
  );
}

export async function salvarConfiguracaoArmazenamento(
  entrada: EntradaConfiguracaoArmazenamento,
) {
  exigirDesktop();
  return invoke<ConfiguracaoArmazenamentoPublicacao>(
    "salvar_configuracao_armazenamento_publicacao",
    { entrada },
  );
}

export async function testarConfiguracaoArmazenamento() {
  exigirDesktop();
  return invoke<ConfiguracaoArmazenamentoPublicacao>(
    "testar_armazenamento_publicacao",
  );
}

export async function listarAtivosTemporarios() {
  if (!emAmbienteTauri()) return [] satisfies AtivoTemporarioPublicacao[];
  return invoke<AtivoTemporarioPublicacao[]>(
    "listar_ativos_temporarios_publicacao",
  );
}

export async function removerAtivoTemporario(ativoId: string) {
  exigirDesktop();
  return invoke<boolean>("remover_ativo_temporario_publicacao", { ativoId });
}

export async function limparAtivosExpirados() {
  exigirDesktop();
  return invoke<ResultadoLimpezaAtivos>(
    "limpar_ativos_temporarios_expirados",
  );
}

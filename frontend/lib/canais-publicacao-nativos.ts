import { invoke } from "@tauri-apps/api/core";

import { emAmbienteTauri } from "@/lib/runtime-nativo";
import type {
  ConexaoCanalPublicacao,
  CredenciaisAplicativoCanal,
  EnvioPublicacaoSocial,
  EntradaPublicacaoSocial,
  InicioOauthPublicacao,
  ResultadoOauthPublicacao,
} from "@/types/canais-publicacao";

function exigirDesktop() {
  if (!emAmbienteTauri()) throw new Error("OAuth e publicação real exigem o aplicativo desktop.");
}

export async function listarConexoesCanais() {
  if (!emAmbienteTauri()) return [] satisfies ConexaoCanalPublicacao[];
  return invoke<ConexaoCanalPublicacao[]>("listar_conexoes_publicacao");
}

export async function iniciarOauthCanal(credenciais: CredenciaisAplicativoCanal) {
  exigirDesktop();
  return invoke<InicioOauthPublicacao>("iniciar_oauth_publicacao", {
    entrada: { provedor: credenciais.provedor, clientId: credenciais.clientId },
  });
}

export async function concluirOauthCanal(sessaoId: string, credenciais: CredenciaisAplicativoCanal) {
  exigirDesktop();
  return invoke<ResultadoOauthPublicacao>("concluir_oauth_publicacao", {
    entrada: {
      sessaoId,
      clientId: credenciais.clientId,
      clientSecret: credenciais.clientSecret || null,
    },
  });
}

export async function desconectarCanal(provedor: CredenciaisAplicativoCanal["provedor"]) {
  exigirDesktop();
  return invoke<boolean>("desconectar_canal_publicacao", { provedor });
}

export async function publicarEmCanal(entrada: EntradaPublicacaoSocial) {
  exigirDesktop();
  return invoke<EnvioPublicacaoSocial>("publicar_conteudo_social", { entrada });
}

export async function listarEnviosSociais() {
  if (!emAmbienteTauri()) return [] satisfies EnvioPublicacaoSocial[];
  return invoke<EnvioPublicacaoSocial[]>("listar_envios_publicacao");
}

use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StatusAtualizadorNativo {
    pub versao_atual: String,
    pub alvo: String,
    pub configurado: bool,
    pub endpoint: Option<String>,
    pub assinatura_obrigatoria: bool,
}

#[tauri::command]
pub fn status_atualizador_nativo() -> StatusAtualizadorNativo {
    StatusAtualizadorNativo {
        versao_atual: env!("CARGO_PKG_VERSION").to_owned(),
        alvo: tauri_plugin_updater::target().unwrap_or_else(|| "nao-suportado".to_owned()),
        configurado: option_env!("MAKEFLUX_ATUALIZADOR_CONFIGURADO").is_some(),
        endpoint: option_env!("MAKEFLUX_UPDATER_ENDPOINT").map(str::to_owned),
        assinatura_obrigatoria: true,
    }
}

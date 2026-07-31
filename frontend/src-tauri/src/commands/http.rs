use std::time::{Duration, Instant};

use reqwest::Method;
use serde_json::{json, Value};
use url::Url;

use crate::models::{RespostaHttpNativa, SolicitacaoHttp};

fn validar_url(url: &str, permitir_remoto: bool) -> Result<Url, String> {
    let analisada =
        Url::parse(url).map_err(|_| "O endereço informado não é uma URL válida.".to_owned())?;
    if !matches!(analisada.scheme(), "http" | "https") {
        return Err("Somente endereços HTTP ou HTTPS são permitidos.".to_owned());
    }
    if !permitir_remoto {
        let host = analisada
            .host_str()
            .unwrap_or_default()
            .to_ascii_lowercase();
        let local = matches!(host.as_str(), "localhost" | "127.0.0.1" | "::1");
        if !local {
            return Err("A chamada nativa está restrita a serviços locais.".to_owned());
        }
    }
    Ok(analisada)
}

pub async fn executar_http(solicitacao: SolicitacaoHttp) -> Result<RespostaHttpNativa, String> {
    let url = validar_url(
        &solicitacao.url,
        solicitacao.permitir_remoto.unwrap_or(false),
    )?;
    let metodo = solicitacao
        .metodo
        .as_deref()
        .unwrap_or("GET")
        .parse::<Method>()
        .map_err(|_| "Método HTTP inválido.".to_owned())?;
    let timeout =
        Duration::from_millis(solicitacao.timeout_ms.unwrap_or(12_000).clamp(500, 600_000));
    let cliente = reqwest::Client::builder()
        .timeout(timeout)
        .build()
        .map_err(|erro| format!("Falha ao preparar cliente HTTP: {erro}"))?;

    let inicio = Instant::now();
    let mut requisicao = cliente.request(metodo, url);
    if let Some(corpo) = solicitacao.corpo {
        requisicao = requisicao.json(&corpo);
    }
    let resposta = requisicao
        .send()
        .await
        .map_err(|erro| format!("Serviço indisponível: {erro}"))?;
    let status = resposta.status();
    let texto = resposta.text().await.unwrap_or_default();
    let corpo: Value = serde_json::from_str(&texto).unwrap_or_else(|_| json!({ "texto": texto }));

    Ok(RespostaHttpNativa {
        sucesso: status.is_success(),
        status: status.as_u16(),
        latencia_ms: inicio.elapsed().as_millis(),
        corpo,
        mensagem: if status.is_success() {
            "Serviço respondeu corretamente.".to_owned()
        } else {
            format!("O serviço respondeu com HTTP {}.", status.as_u16())
        },
    })
}

#[tauri::command]
pub async fn testar_http_nativo(
    solicitacao: SolicitacaoHttp,
) -> Result<RespostaHttpNativa, String> {
    executar_http(solicitacao).await
}

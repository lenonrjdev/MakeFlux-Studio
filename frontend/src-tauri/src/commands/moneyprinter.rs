use serde_json::Value;

use crate::{
    commands::http::executar_http,
    models::{
        DiagnosticoMoneyPrinter, RespostaMoneyPrinter, SolicitacaoHttp, SolicitacaoMoneyPrinter,
    },
};

fn endpoint(base: &str, caminho: &str) -> String {
    format!("{}{}", base.trim_end_matches('/'), caminho)
}

fn desempacotar(corpo: Value) -> (String, Value) {
    let mensagem = corpo
        .get("message")
        .and_then(Value::as_str)
        .unwrap_or("Resposta recebida do MoneyPrinterTurbo.")
        .to_owned();
    let dados = corpo.get("data").cloned().unwrap_or(corpo);
    (mensagem, dados)
}

#[tauri::command]
pub async fn verificar_moneyprinter(base: String) -> Result<DiagnosticoMoneyPrinter, String> {
    let resposta = executar_http(SolicitacaoHttp {
        url: endpoint(&base, "/openapi.json"),
        metodo: Some("GET".to_owned()),
        corpo: None,
        timeout_ms: Some(8_000),
        permitir_remoto: Some(false),
    })
    .await?;

    let titulo_api = resposta
        .corpo
        .pointer("/info/title")
        .and_then(Value::as_str)
        .map(str::to_owned);
    let versao = resposta
        .corpo
        .pointer("/info/version")
        .and_then(Value::as_str)
        .map(str::to_owned);

    Ok(DiagnosticoMoneyPrinter {
        disponivel: resposta.sucesso,
        endpoint: base,
        latencia_ms: resposta.latencia_ms,
        versao,
        titulo_api,
        mensagem: if resposta.sucesso {
            "API do MoneyPrinterTurbo detectada pelo OpenAPI.".to_owned()
        } else {
            resposta.mensagem
        },
    })
}

#[tauri::command]
pub async fn criar_video_moneyprinter(
    solicitacao: SolicitacaoMoneyPrinter,
) -> Result<RespostaMoneyPrinter, String> {
    let resposta = executar_http(SolicitacaoHttp {
        url: endpoint(&solicitacao.endpoint, "/api/v1/videos"),
        metodo: Some("POST".to_owned()),
        corpo: Some(solicitacao.payload),
        timeout_ms: Some(solicitacao.timeout_ms.unwrap_or(120_000)),
        permitir_remoto: Some(false),
    })
    .await?;
    let (mensagem, dados) = desempacotar(resposta.corpo);
    Ok(RespostaMoneyPrinter {
        sucesso: resposta.sucesso,
        status: resposta.status,
        mensagem,
        dados,
    })
}

#[tauri::command]
pub async fn consultar_tarefa_moneyprinter(
    base: String,
    task_id: String,
) -> Result<RespostaMoneyPrinter, String> {
    let resposta = executar_http(SolicitacaoHttp {
        url: endpoint(&base, &format!("/api/v1/tasks/{task_id}")),
        metodo: Some("GET".to_owned()),
        corpo: None,
        timeout_ms: Some(15_000),
        permitir_remoto: Some(false),
    })
    .await?;
    let (mensagem, dados) = desempacotar(resposta.corpo);
    Ok(RespostaMoneyPrinter {
        sucesso: resposta.sucesso,
        status: resposta.status,
        mensagem,
        dados,
    })
}

#[tauri::command]
pub async fn excluir_tarefa_moneyprinter(
    base: String,
    task_id: String,
) -> Result<RespostaMoneyPrinter, String> {
    let resposta = executar_http(SolicitacaoHttp {
        url: endpoint(&base, &format!("/api/v1/tasks/{task_id}")),
        metodo: Some("DELETE".to_owned()),
        corpo: None,
        timeout_ms: Some(15_000),
        permitir_remoto: Some(false),
    })
    .await?;
    let (mensagem, dados) = desempacotar(resposta.corpo);
    Ok(RespostaMoneyPrinter {
        sucesso: resposta.sucesso,
        status: resposta.status,
        mensagem,
        dados,
    })
}

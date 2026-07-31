use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ExecutavelDetectado {
    pub nome: String,
    pub disponivel: bool,
    pub caminho: Option<String>,
    pub versao: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CapacidadesSistema {
    pub sistema_operacional: String,
    pub arquitetura: String,
    pub nucleos_logicos: usize,
    pub memoria_total_mb: u64,
    pub gpu: Option<String>,
    pub python: ExecutavelDetectado,
    pub ffmpeg: ExecutavelDetectado,
    pub git: ExecutavelDetectado,
    pub uv: ExecutavelDetectado,
    pub modo_offline_pronto: bool,
    pub detectado_em: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SolicitacaoHttp {
    pub url: String,
    pub metodo: Option<String>,
    pub corpo: Option<Value>,
    pub timeout_ms: Option<u64>,
    pub permitir_remoto: Option<bool>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RespostaHttpNativa {
    pub sucesso: bool,
    pub status: u16,
    pub latencia_ms: u128,
    pub corpo: Value,
    pub mensagem: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EstadoMotor {
    pub executando: bool,
    pub pid: Option<u32>,
    pub diretorio: Option<String>,
    pub iniciado_em: Option<String>,
    pub log: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SolicitacaoIniciarMotor {
    pub diretorio: String,
    pub python: Option<String>,
    pub argumentos: Option<Vec<String>>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DiagnosticoMoneyPrinter {
    pub disponivel: bool,
    pub endpoint: String,
    pub latencia_ms: u128,
    pub versao: Option<String>,
    pub titulo_api: Option<String>,
    pub mensagem: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SolicitacaoMoneyPrinter {
    pub endpoint: String,
    pub payload: Value,
    pub timeout_ms: Option<u64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RespostaMoneyPrinter {
    pub sucesso: bool,
    pub status: u16,
    pub mensagem: String,
    pub dados: Value,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RegistroRollback {
    pub commit: String,
    pub branch: String,
    pub criado_em: String,
    pub branch_backup: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EstadoRepositorioMotor {
    pub valido: bool,
    pub diretorio: String,
    pub branch: String,
    pub commit_atual: String,
    pub remoto: Option<String>,
    pub limpo: bool,
    pub commits_pendentes: u32,
    pub atualizacao_disponivel: bool,
    pub rollback_disponivel: bool,
    pub rollback: Option<RegistroRollback>,
    pub mensagem: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ResultadoAtualizacaoMotor {
    pub sucesso: bool,
    pub commit_anterior: String,
    pub commit_atual: String,
    pub branch_backup: Option<String>,
    pub mensagem: String,
}

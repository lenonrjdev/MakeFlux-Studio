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

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RegistroPersistenciaEntrada {
    pub chave: String,
    pub valor: String,
    pub atualizado_em: u64,
    pub origem: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RegistroPersistenciaSaida {
    pub chave: String,
    pub valor: String,
    pub atualizado_em: u64,
    pub origem: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StatusBancoLocal {
    pub disponivel: bool,
    pub caminho: String,
    pub registros: u64,
    pub bytes_aproximados: u64,
    pub ultima_migracao_em: Option<u64>,
    pub mensagem: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ResultadoMigracaoSqlite {
    pub disponivel: bool,
    pub caminho: String,
    pub registros: u64,
    pub bytes_aproximados: u64,
    pub ultima_migracao_em: Option<u64>,
    pub mensagem: String,
    pub migrados: u64,
    pub ignorados: u64,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EventoTelemetriaLocal {
    pub id: String,
    pub categoria: String,
    pub nome: String,
    pub detalhes: String,
    pub criado_em: u64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StatusCofre {
    pub disponivel: bool,
    pub inicializado: bool,
    pub desbloqueado: bool,
    pub caminho: String,
    pub quantidade_segredos: usize,
    pub mensagem: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SegredoCofreResumo {
    pub chave: String,
    pub atualizado_em: u64,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FiltroRegistrosPaginados {
    pub termo: Option<String>,
    pub origem: Option<String>,
    pub limite: Option<u32>,
    pub cursor: Option<String>,
    pub ordem: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RegistroPaginado {
    pub chave: String,
    pub origem: String,
    pub atualizado_em: u64,
    pub tamanho_bytes: u64,
    pub previa: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaginaRegistros {
    pub itens: Vec<RegistroPaginado>,
    pub total: u64,
    pub proximo_cursor: Option<String>,
    pub duracao_ms: f64,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SolicitacaoOperacaoLote {
    pub tipo: String,
    pub quantidade: Option<u32>,
    pub tamanho_payload: Option<u32>,
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct OperacaoLote {
    pub id: String,
    pub tipo: String,
    pub status: String,
    pub total: u64,
    pub processados: u64,
    pub afetados: u64,
    pub iniciado_em: u64,
    pub atualizado_em: u64,
    pub mensagem: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StatusDesempenhoBanco {
    pub disponivel: bool,
    pub schema_versao: u32,
    pub registros_workspace: u64,
    pub registros_telemetria: u64,
    pub tamanho_banco_bytes: u64,
    pub tamanho_wal_bytes: u64,
    pub paginas: u64,
    pub paginas_livres: u64,
    pub tamanho_pagina: u64,
    pub fragmentacao_percentual: f64,
    pub consultas_lentas: u64,
    pub operacoes_ativas: u64,
    pub ultima_manutencao_em: Option<u64>,
    pub mensagem: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ResultadoManutencao {
    pub sucesso: bool,
    pub acao: String,
    pub antes_bytes: u64,
    pub depois_bytes: u64,
    pub duracao_ms: f64,
    pub mensagem: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RotinaAgendada {
    pub id: String,
    pub nome: String,
    pub descricao: String,
    #[serde(rename = "tipo")]
    pub tipo: String,
    pub frequencia: String,
    pub intervalo_minutos: Option<u32>,
    pub proxima_execucao_em: Option<u64>,
    pub ativa: bool,
    pub notificar: bool,
    pub parametros: String,
    pub criado_em: u64,
    pub atualizado_em: u64,
    pub ultima_execucao_em: Option<u64>,
    pub ultimo_status: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EntradaRotinaAgendada {
    pub id: Option<String>,
    pub nome: String,
    pub descricao: String,
    #[serde(rename = "tipo")]
    pub tipo_rotina: String,
    pub frequencia: String,
    pub intervalo_minutos: Option<u32>,
    pub proxima_execucao_em: Option<u64>,
    pub ativa: bool,
    pub notificar: bool,
    pub parametros: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ExecucaoRotina {
    pub id: String,
    pub rotina_id: String,
    pub rotina_nome: String,
    pub status: String,
    pub iniciada_em: u64,
    pub concluida_em: Option<u64>,
    pub duracao_ms: u64,
    pub mensagem: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct NotificacaoLocal {
    pub id: String,
    pub titulo: String,
    pub corpo: String,
    pub nivel: String,
    pub rota: Option<String>,
    pub lida: bool,
    pub criada_em: u64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StatusAgendadorRotinas {
    pub disponivel: bool,
    pub worker_ativo: bool,
    pub ultimo_ciclo_em: Option<u64>,
    pub rotinas_ativas: u64,
    pub rotinas_pendentes: u64,
    pub notificacoes_nao_lidas: u64,
    pub proxima_execucao_em: Option<u64>,
    pub mensagem: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ResultadoProcessamentoRotinas {
    pub verificadas: u64,
    pub executadas: u64,
    pub falhas: u64,
    pub mensagem: String,
}

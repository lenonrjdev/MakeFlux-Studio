use std::{
    sync::{
        atomic::{AtomicBool, Ordering},
        Arc,
    },
    time::{Duration, Instant, SystemTime, UNIX_EPOCH},
};

use reqwest::{Client, StatusCode};
use rusqlite::{params, OptionalExtension};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tauri::{AppHandle, State};

use crate::{
    commands::{
        cofre::{ler_segredo_interno, remover_segredo_interno, salvar_segredo_interno},
        dados::{abrir_banco, agora_millis},
        observabilidade::registrar_log_interno,
    },
    state::{EstadoCofre, EstadoRequisicoesIa},
};

const PROVEDORES: [&str; 4] = ["openai", "gemini", "deepseek", "ollama"];

#[derive(Debug, Clone)]
struct PadraoProvedor {
    id: &'static str,
    nome: &'static str,
    descricao: &'static str,
    endpoint: &'static str,
    modelo: &'static str,
    prioridade: i64,
    requer_credencial: bool,
}

fn padroes() -> [PadraoProvedor; 4] {
    [
        PadraoProvedor {
            id: "openai",
            nome: "OpenAI",
            descricao: "Responses API",
            endpoint: "https://api.openai.com/v1",
            modelo: "gpt-5-mini",
            prioridade: 1,
            requer_credencial: true,
        },
        PadraoProvedor {
            id: "gemini",
            nome: "Google Gemini",
            descricao: "GenerateContent API",
            endpoint: "https://generativelanguage.googleapis.com",
            modelo: "gemini-2.5-flash",
            prioridade: 2,
            requer_credencial: true,
        },
        PadraoProvedor {
            id: "deepseek",
            nome: "DeepSeek",
            descricao: "Chat Completions API",
            endpoint: "https://api.deepseek.com",
            modelo: "deepseek-chat",
            prioridade: 3,
            requer_credencial: true,
        },
        PadraoProvedor {
            id: "ollama",
            nome: "Ollama",
            descricao: "API local de chat",
            endpoint: "http://127.0.0.1:11434",
            modelo: "gemma3",
            prioridade: 4,
            requer_credencial: false,
        },
    ]
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EntradaConfiguracaoProvedorIa {
    id: String,
    endpoint: String,
    modelo: String,
    habilitado: bool,
    prioridade: u32,
    timeout_segundos: u32,
    limite_diario_requisicoes: u32,
    max_tokens_saida: u32,
    temperatura_padrao: f64,
    custo_entrada_milhao: f64,
    custo_saida_milhao: f64,
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ConfiguracaoProvedorIa {
    id: String,
    nome: String,
    descricao: String,
    endpoint: String,
    modelo: String,
    habilitado: bool,
    prioridade: u32,
    timeout_segundos: u32,
    limite_diario_requisicoes: u32,
    max_tokens_saida: u32,
    temperatura_padrao: f64,
    custo_entrada_milhao: f64,
    custo_saida_milhao: f64,
    requer_credencial: bool,
    credencial_configurada: bool,
    status: String,
    mensagem: String,
    ultima_verificacao_em: Option<u64>,
    latencia_ms: Option<f64>,
    requisicoes_hoje: u64,
    tokens_entrada_hoje: u64,
    tokens_saida_hoje: u64,
    custo_estimado_hoje: f64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ResultadoTesteProvedorIa {
    sucesso: bool,
    provedor: String,
    modelo: String,
    latencia_ms: f64,
    mensagem: String,
    resposta: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SolicitacaoExperimentoIa {
    requisicao_id: String,
    experimento_id: String,
    tipo: String,
    tema: String,
    publico: String,
    plataforma: String,
    idioma: String,
    prompt_sistema: String,
    prompt_usuario: String,
    quantidade_variacoes: u32,
    temperatura: f64,
    max_tokens_saida: u32,
    provedor_preferido: Option<String>,
    permitir_fallback: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VariacaoIaReal {
    id: String,
    indice: u32,
    conteudo: String,
    provedor: String,
    modelo: String,
    tokens_entrada: u64,
    tokens_saida: u64,
    custo_estimado: f64,
    duracao_ms: f64,
    tentativa: u32,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ResultadoExecucaoIa {
    requisicao_id: String,
    experimento_id: String,
    status: String,
    variacoes: Vec<VariacaoIaReal>,
    provedores_tentados: Vec<String>,
    fallback_utilizado: bool,
    duracao_ms: f64,
    mensagem: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RegistroExecucaoIa {
    id: String,
    experimento_id: String,
    provedor: String,
    modelo: String,
    status: String,
    tokens_entrada: u64,
    tokens_saida: u64,
    custo_estimado: f64,
    duracao_ms: f64,
    mensagem: String,
    correlacao_id: String,
    criado_em: u64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ResumoUsoIa {
    schema_versao: u32,
    provedores_ativos: u64,
    provedores_prontos: u64,
    requisicoes_hoje: u64,
    tokens_entrada_hoje: u64,
    tokens_saida_hoje: u64,
    custo_estimado_hoje: f64,
    execucoes_recentes: u64,
    mensagem: String,
}

struct RespostaModelo {
    conteudo: String,
    tokens_entrada: u64,
    tokens_saida: u64,
    modelo: String,
}

fn id_execucao(prefixo: &str) -> String {
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_nanos())
        .unwrap_or_default();
    format!("{prefixo}-{nanos}")
}
fn segredo_id(provedor: &str) -> String {
    format!("provedor-ia:{provedor}:api-key")
}
fn validar_provedor(provedor: &str) -> Result<(), String> {
    if PROVEDORES.contains(&provedor) {
        Ok(())
    } else {
        Err("Provedor de IA não reconhecido.".to_owned())
    }
}
fn inicio_dia_millis() -> u64 {
    let agora = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or_default();
    (agora / 86_400) * 86_400 * 1000
}
fn texto_erro(status: StatusCode, corpo: &str) -> String {
    let limpo = corpo.replace('\n', " ").replace('\r', " ");
    format!(
        "HTTP {}: {}",
        status.as_u16(),
        limpo.chars().take(480).collect::<String>()
    )
}
fn foi_cancelada(flag: &Arc<AtomicBool>) -> bool {
    flag.load(Ordering::SeqCst)
}
async fn aguardar_cancelamento(flag: Arc<AtomicBool>) {
    while !foi_cancelada(&flag) {
        tokio::time::sleep(Duration::from_millis(80)).await;
    }
}

fn garantir_configuracoes(app: &AppHandle) -> Result<(), String> {
    let conexao = abrir_banco(app)?;
    for padrao in padroes() {
        conexao.execute(
            "INSERT OR IGNORE INTO provedores_ia (id,endpoint,modelo,habilitado,prioridade,timeout_segundos,limite_diario_requisicoes,max_tokens_saida,temperatura,custo_entrada_milhao,custo_saida_milhao,ultima_verificacao_em,latencia_ms,ultimo_status,ultima_mensagem,atualizado_em) VALUES (?1,?2,?3,1,?4,60,0,2400,0.7,0,0,NULL,NULL,'nao-testado','Ainda não testado.',?5)",
            params![padrao.id, padrao.endpoint, padrao.modelo, padrao.prioridade, agora_millis() as i64],
        ).map_err(|e| format!("Falha ao preparar provedor {}: {e}", padrao.id))?;
    }
    Ok(())
}

fn credencial_configurada(app: &AppHandle, cofre: &EstadoCofre, id: &str, requerida: bool) -> bool {
    !requerida
        || ler_segredo_interno(app, cofre, &segredo_id(id))
            .map(|v| !v.trim().is_empty())
            .unwrap_or(false)
}

fn uso_hoje(app: &AppHandle, id: &str) -> Result<(u64, u64, u64, f64), String> {
    let conexao = abrir_banco(app)?;
    conexao.query_row(
        "SELECT COUNT(*),COALESCE(SUM(tokens_entrada),0),COALESCE(SUM(tokens_saida),0),COALESCE(SUM(custo_estimado),0) FROM execucoes_ia WHERE provedor=?1 AND status='concluido' AND criado_em>=?2",
        params![id, inicio_dia_millis() as i64],
        |linha| Ok((linha.get::<_, i64>(0)?.max(0) as u64, linha.get::<_, i64>(1)?.max(0) as u64, linha.get::<_, i64>(2)?.max(0) as u64, linha.get::<_, f64>(3)?.max(0.0))),
    ).map_err(|e| e.to_string())
}

fn carregar_configuracao(
    app: &AppHandle,
    cofre: &EstadoCofre,
    id: &str,
) -> Result<ConfiguracaoProvedorIa, String> {
    validar_provedor(id)?;
    garantir_configuracoes(app)?;
    let padrao = padroes()
        .into_iter()
        .find(|p| p.id == id)
        .ok_or_else(|| "Provedor sem padrão.".to_owned())?;
    let conexao = abrir_banco(app)?;
    let dados = conexao.query_row(
        "SELECT endpoint,modelo,habilitado,prioridade,timeout_segundos,limite_diario_requisicoes,max_tokens_saida,temperatura,custo_entrada_milhao,custo_saida_milhao,ultima_verificacao_em,latencia_ms,ultimo_status,ultima_mensagem FROM provedores_ia WHERE id=?1",
        params![id],
        |l| Ok((l.get::<_,String>(0)?,l.get::<_,String>(1)?,l.get::<_,i64>(2)?,l.get::<_,i64>(3)?,l.get::<_,i64>(4)?,l.get::<_,i64>(5)?,l.get::<_,i64>(6)?,l.get::<_,f64>(7)?,l.get::<_,f64>(8)?,l.get::<_,f64>(9)?,l.get::<_,Option<i64>>(10)?,l.get::<_,Option<f64>>(11)?,l.get::<_,String>(12)?,l.get::<_,String>(13)?)),
    ).map_err(|e| e.to_string())?;
    let credencial = credencial_configurada(app, cofre, id, padrao.requer_credencial);
    let (req, entrada, saida, custo) = uso_hoje(app, id)?;
    let status = if dados.2 != 1 {
        "desativado".to_owned()
    } else if padrao.requer_credencial && !credencial {
        "credencial-pendente".to_owned()
    } else {
        dados.12
    };
    Ok(ConfiguracaoProvedorIa {
        id: id.to_owned(),
        nome: padrao.nome.to_owned(),
        descricao: padrao.descricao.to_owned(),
        endpoint: dados.0,
        modelo: dados.1,
        habilitado: dados.2 == 1,
        prioridade: dados.3.max(1) as u32,
        timeout_segundos: dados.4.clamp(5, 300) as u32,
        limite_diario_requisicoes: dados.5.max(0) as u32,
        max_tokens_saida: dados.6.clamp(64, 64000) as u32,
        temperatura_padrao: dados.7.clamp(0.0, 2.0),
        custo_entrada_milhao: dados.8.max(0.0),
        custo_saida_milhao: dados.9.max(0.0),
        requer_credencial: padrao.requer_credencial,
        credencial_configurada: credencial,
        status,
        mensagem: dados.13,
        ultima_verificacao_em: dados.10.map(|v| v.max(0) as u64),
        latencia_ms: dados.11,
        requisicoes_hoje: req,
        tokens_entrada_hoje: entrada,
        tokens_saida_hoje: saida,
        custo_estimado_hoje: custo,
    })
}

fn listar_provedores_interno(
    app: &AppHandle,
    cofre: &EstadoCofre,
) -> Result<Vec<ConfiguracaoProvedorIa>, String> {
    garantir_configuracoes(app)?;
    let mut itens = Vec::new();
    for id in PROVEDORES {
        itens.push(carregar_configuracao(app, cofre, id)?);
    }
    itens.sort_by_key(|i| i.prioridade);
    Ok(itens)
}

#[tauri::command]
pub fn listar_provedores_ia(
    app: AppHandle,
    cofre: State<'_, EstadoCofre>,
) -> Result<Vec<ConfiguracaoProvedorIa>, String> {
    listar_provedores_interno(&app, &cofre)
}

#[tauri::command]
pub fn salvar_configuracao_provedor_ia(
    app: AppHandle,
    cofre: State<'_, EstadoCofre>,
    configuracao: EntradaConfiguracaoProvedorIa,
) -> Result<ConfiguracaoProvedorIa, String> {
    validar_provedor(&configuracao.id)?;
    let endpoint = configuracao.endpoint.trim().trim_end_matches('/');
    if !(endpoint.starts_with("https://")
        || endpoint.starts_with("http://127.0.0.1")
        || endpoint.starts_with("http://localhost"))
    {
        return Err("Use HTTPS para nuvem ou localhost para serviços locais.".to_owned());
    }
    if configuracao.modelo.trim().is_empty() {
        return Err("Informe o modelo do provedor.".to_owned());
    }
    garantir_configuracoes(&app)?;
    let conexao = abrir_banco(&app)?;
    conexao.execute("UPDATE provedores_ia SET endpoint=?2,modelo=?3,habilitado=?4,prioridade=?5,timeout_segundos=?6,limite_diario_requisicoes=?7,max_tokens_saida=?8,temperatura=?9,custo_entrada_milhao=?10,custo_saida_milhao=?11,atualizado_em=?12 WHERE id=?1",params![configuracao.id,endpoint,configuracao.modelo.trim(),if configuracao.habilitado{1}else{0},configuracao.prioridade.clamp(1,20) as i64,configuracao.timeout_segundos.clamp(5,300) as i64,configuracao.limite_diario_requisicoes as i64,configuracao.max_tokens_saida.clamp(64,64000) as i64,configuracao.temperatura_padrao.clamp(0.0,2.0),configuracao.custo_entrada_milhao.max(0.0),configuracao.custo_saida_milhao.max(0.0),agora_millis() as i64]).map_err(|e|format!("Falha ao salvar provedor: {e}"))?;
    carregar_configuracao(&app, &cofre, &configuracao.id)
}

#[tauri::command]
pub fn salvar_credencial_provedor_ia(
    app: AppHandle,
    cofre: State<'_, EstadoCofre>,
    provedor: String,
    credencial: String,
) -> Result<ConfiguracaoProvedorIa, String> {
    validar_provedor(&provedor)?;
    if provedor == "ollama" {
        return Err("Ollama local não utiliza chave neste conector.".to_owned());
    }
    if credencial.trim().len() < 8 {
        return Err("A credencial informada parece incompleta.".to_owned());
    }
    salvar_segredo_interno(&app, &cofre, &segredo_id(&provedor), credencial.trim())?;
    let conexao = abrir_banco(&app)?;
    conexao.execute("UPDATE provedores_ia SET ultimo_status='nao-testado',ultima_mensagem='Credencial salva. Execute o teste de conexão.',atualizado_em=?2 WHERE id=?1",params![provedor,agora_millis() as i64]).map_err(|e|e.to_string())?;
    carregar_configuracao(&app, &cofre, &provedor)
}

#[tauri::command]
pub fn remover_credencial_provedor_ia(
    app: AppHandle,
    cofre: State<'_, EstadoCofre>,
    provedor: String,
) -> Result<ConfiguracaoProvedorIa, String> {
    validar_provedor(&provedor)?;
    remover_segredo_interno(&app, &cofre, &segredo_id(&provedor))?;
    let conexao = abrir_banco(&app)?;
    conexao.execute("UPDATE provedores_ia SET ultimo_status='credencial-pendente',ultima_mensagem='Credencial removida.',atualizado_em=?2 WHERE id=?1",params![provedor,agora_millis() as i64]).map_err(|e|e.to_string())?;
    carregar_configuracao(&app, &cofre, &provedor)
}

async fn enviar_json_cancelavel(
    request: reqwest::RequestBuilder,
    flag: Arc<AtomicBool>,
) -> Result<(StatusCode, Value), String> {
    let envio = async {
        let resposta = request
            .send()
            .await
            .map_err(|e| format!("Falha de rede: {e}"))?;
        let status = resposta.status();
        let texto = resposta
            .text()
            .await
            .map_err(|e| format!("Falha ao ler resposta: {e}"))?;
        let valor =
            serde_json::from_str::<Value>(&texto).unwrap_or_else(|_| json!({"texto":texto}));
        Ok::<_, String>((status, valor))
    };
    tokio::select! {resultado=envio=>resultado,_=aguardar_cancelamento(flag)=>Err("Execução cancelada pelo usuário.".to_owned())}
}

fn texto_openai(v: &Value) -> String {
    v.get("output")
        .and_then(Value::as_array)
        .into_iter()
        .flatten()
        .flat_map(|o| {
            o.get("content")
                .and_then(Value::as_array)
                .into_iter()
                .flatten()
        })
        .filter_map(|c| c.get("text").and_then(Value::as_str))
        .collect::<Vec<_>>()
        .join("\n")
}

async fn chamar_provedor(
    app: &AppHandle,
    cofre: &EstadoCofre,
    config: &ConfiguracaoProvedorIa,
    sistema: &str,
    prompt: &str,
    temperatura: f64,
    max_tokens: u32,
    flag: Arc<AtomicBool>,
) -> Result<RespostaModelo, String> {
    if foi_cancelada(&flag) {
        return Err("Execução cancelada pelo usuário.".to_owned());
    }
    let client = Client::builder()
        .timeout(Duration::from_secs(config.timeout_segundos as u64))
        .user_agent("MakeFlux-Studio/1.7")
        .build()
        .map_err(|e| e.to_string())?;
    let endpoint = config.endpoint.trim_end_matches('/');
    let chave = if config.requer_credencial {
        Some(ler_segredo_interno(app, cofre, &segredo_id(&config.id))?)
    } else {
        None
    };
    let (request, parseador): (reqwest::RequestBuilder, &str) = match config.id.as_str() {
        "openai" => {
            let body = json!({"model":config.modelo,"instructions":sistema,"input":prompt,"max_output_tokens":max_tokens,"store":false});
            (
                client
                    .post(format!("{endpoint}/responses"))
                    .bearer_auth(chave.as_deref().unwrap_or_default())
                    .json(&body),
                "openai",
            )
        }
        "gemini" => {
            let body = json!({"systemInstruction":{"parts":[{"text":sistema}]},"contents":[{"role":"user","parts":[{"text":prompt}]}],"generationConfig":{"temperature":temperatura,"maxOutputTokens":max_tokens}});
            (
                client
                    .post(format!(
                        "{endpoint}/v1beta/models/{}:generateContent",
                        config.modelo
                    ))
                    .header("x-goog-api-key", chave.as_deref().unwrap_or_default())
                    .json(&body),
                "gemini",
            )
        }
        "deepseek" => {
            let body = json!({"model":config.modelo,"messages":[{"role":"system","content":sistema},{"role":"user","content":prompt}],"temperature":temperatura,"max_tokens":max_tokens,"stream":false});
            (
                client
                    .post(format!("{endpoint}/chat/completions"))
                    .bearer_auth(chave.as_deref().unwrap_or_default())
                    .json(&body),
                "deepseek",
            )
        }
        "ollama" => {
            let body = json!({"model":config.modelo,"messages":[{"role":"system","content":sistema},{"role":"user","content":prompt}],"stream":false,"options":{"temperature":temperatura,"num_predict":max_tokens}});
            (
                client.post(format!("{endpoint}/api/chat")).json(&body),
                "ollama",
            )
        }
        _ => return Err("Provedor não suportado.".to_owned()),
    };
    let (status, valor) = enviar_json_cancelavel(request, flag).await?;
    if !status.is_success() {
        return Err(texto_erro(status, &valor.to_string()));
    }
    let (conteudo, entrada, saida, modelo) = match parseador {
        "openai" => (
            texto_openai(&valor),
            valor
                .pointer("/usage/input_tokens")
                .and_then(Value::as_u64)
                .unwrap_or(0),
            valor
                .pointer("/usage/output_tokens")
                .and_then(Value::as_u64)
                .unwrap_or(0),
            valor
                .get("model")
                .and_then(Value::as_str)
                .unwrap_or(&config.modelo)
                .to_owned(),
        ),
        "gemini" => (
            valor
                .pointer("/candidates/0/content/parts/0/text")
                .and_then(Value::as_str)
                .unwrap_or_default()
                .to_owned(),
            valor
                .pointer("/usageMetadata/promptTokenCount")
                .and_then(Value::as_u64)
                .unwrap_or(0),
            valor
                .pointer("/usageMetadata/candidatesTokenCount")
                .and_then(Value::as_u64)
                .unwrap_or(0),
            valor
                .get("modelVersion")
                .and_then(Value::as_str)
                .unwrap_or(&config.modelo)
                .to_owned(),
        ),
        "deepseek" => (
            valor
                .pointer("/choices/0/message/content")
                .and_then(Value::as_str)
                .unwrap_or_default()
                .to_owned(),
            valor
                .pointer("/usage/prompt_tokens")
                .and_then(Value::as_u64)
                .unwrap_or(0),
            valor
                .pointer("/usage/completion_tokens")
                .and_then(Value::as_u64)
                .unwrap_or(0),
            valor
                .get("model")
                .and_then(Value::as_str)
                .unwrap_or(&config.modelo)
                .to_owned(),
        ),
        _ => (
            valor
                .pointer("/message/content")
                .and_then(Value::as_str)
                .unwrap_or_default()
                .to_owned(),
            valor
                .get("prompt_eval_count")
                .and_then(Value::as_u64)
                .unwrap_or(0),
            valor.get("eval_count").and_then(Value::as_u64).unwrap_or(0),
            valor
                .get("model")
                .and_then(Value::as_str)
                .unwrap_or(&config.modelo)
                .to_owned(),
        ),
    };
    if conteudo.trim().is_empty() {
        return Err("O provedor respondeu sem conteúdo textual.".to_owned());
    }
    Ok(RespostaModelo {
        conteudo,
        tokens_entrada: entrada,
        tokens_saida: saida,
        modelo,
    })
}

fn registrar_execucao(app: &AppHandle, r: &RegistroExecucaoIa) -> Result<(), String> {
    let c = abrir_banco(app)?;
    c.execute("INSERT INTO execucoes_ia (id,experimento_id,provedor,modelo,status,tokens_entrada,tokens_saida,custo_estimado,duracao_ms,mensagem,correlacao_id,criado_em) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12)",params![&r.id,&r.experimento_id,&r.provedor,&r.modelo,&r.status,r.tokens_entrada as i64,r.tokens_saida as i64,r.custo_estimado,r.duracao_ms,&r.mensagem,&r.correlacao_id,r.criado_em as i64]).map_err(|e|format!("Falha ao registrar execução de IA: {e}"))?;
    Ok(())
}
fn atualizar_teste(
    app: &AppHandle,
    provedor: &str,
    sucesso: bool,
    latencia: f64,
    mensagem: &str,
) -> Result<(), String> {
    let c = abrir_banco(app)?;
    c.execute("UPDATE provedores_ia SET ultima_verificacao_em=?2,latencia_ms=?3,ultimo_status=?4,ultima_mensagem=?5,atualizado_em=?2 WHERE id=?1",params![provedor,agora_millis() as i64,latencia,if sucesso{"pronto"}else{"indisponivel"},mensagem]).map_err(|e|e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn testar_provedor_ia(
    app: AppHandle,
    cofre: State<'_, EstadoCofre>,
    provedor: String,
) -> Result<ResultadoTesteProvedorIa, String> {
    let config = carregar_configuracao(&app, &cofre, &provedor)?;
    if !config.habilitado {
        return Err("Ative o provedor antes de testar.".to_owned());
    }
    let inicio = Instant::now();
    let resultado = chamar_provedor(
        &app,
        &cofre,
        &config,
        "Responda de forma objetiva.",
        "Responda somente: conexão confirmada",
        0.0,
        32,
        Arc::new(AtomicBool::new(false)),
    )
    .await;
    let latencia = inicio.elapsed().as_secs_f64() * 1000.0;
    match resultado {
        Ok(r) => {
            let m = "Conexão real confirmada.".to_owned();
            atualizar_teste(&app, &provedor, true, latencia, &m)?;
            Ok(ResultadoTesteProvedorIa {
                sucesso: true,
                provedor,
                modelo: r.modelo,
                latencia_ms: latencia,
                mensagem: m,
                resposta: r.conteudo,
            })
        }
        Err(e) => {
            let _ = atualizar_teste(&app, &provedor, false, latencia, &e);
            Err(e)
        }
    }
}

fn prompt_completo(s: &SolicitacaoExperimentoIa, indice: u32) -> String {
    format!("{}\n\nContexto do experimento:\n- Tipo: {}\n- Tema: {}\n- Público: {}\n- Plataforma: {}\n- Idioma: {}\n- Variação: {} de {}\n\nProduza somente o conteúdo final solicitado.",s.prompt_usuario,s.tipo,s.tema,s.publico,s.plataforma,s.idioma,indice+1,s.quantidade_variacoes)
}

#[tauri::command]
pub async fn executar_experimento_ia(
    app: AppHandle,
    cofre: State<'_, EstadoCofre>,
    estado: State<'_, EstadoRequisicoesIa>,
    solicitacao: SolicitacaoExperimentoIa,
) -> Result<ResultadoExecucaoIa, String> {
    if solicitacao.requisicao_id.trim().is_empty() {
        return Err("Identificador da requisição ausente.".to_owned());
    }
    if solicitacao.tema.trim().is_empty() || solicitacao.prompt_usuario.trim().is_empty() {
        return Err("Tema e instrução são obrigatórios.".to_owned());
    }
    let flag = Arc::new(AtomicBool::new(false));
    estado
        .0
        .lock()
        .map_err(|_| "Estado das requisições indisponível.".to_owned())?
        .insert(solicitacao.requisicao_id.clone(), flag.clone());
    let inicio_total = Instant::now();
    let resultado = executar_experimento_interno(&app, &cofre, &solicitacao, flag.clone()).await;
    if let Ok(mut mapa) = estado.0.lock() {
        mapa.remove(&solicitacao.requisicao_id);
    }
    let duracao = inicio_total.elapsed().as_secs_f64() * 1000.0;
    resultado.map(|mut r| {
        r.duracao_ms = duracao;
        r
    })
}

async fn executar_experimento_interno(
    app: &AppHandle,
    cofre: &EstadoCofre,
    s: &SolicitacaoExperimentoIa,
    flag: Arc<AtomicBool>,
) -> Result<ResultadoExecucaoIa, String> {
    let mut configs = listar_provedores_interno(app, cofre)?
        .into_iter()
        .filter(|p| p.habilitado && p.status != "credencial-pendente")
        .collect::<Vec<_>>();
    configs.sort_by_key(|p| p.prioridade);
    if let Some(preferido) = s.provedor_preferido.as_deref() {
        validar_provedor(preferido)?;
        configs.sort_by_key(|p| {
            if p.id == preferido {
                0
            } else {
                p.prioridade + 20
            }
        });
        if !s.permitir_fallback {
            configs.retain(|p| p.id == preferido);
        }
    }
    if configs.is_empty() {
        return Err(
            "Nenhum provedor real está ativo. Configure uma credencial ou o Ollama.".to_owned(),
        );
    }
    let correlacao = format!("ia-{}", s.requisicao_id);
    let _ = registrar_log_interno(
        app,
        "info",
        "provedor",
        "ia.experimento.iniciado",
        "Experimento real iniciado.",
        &correlacao,
        json!({"experimentoId":s.experimento_id,"variacoes":s.quantidade_variacoes}),
    );
    let mut variacoes = Vec::new();
    let mut tentados = Vec::new();
    let mut fallback = false;
    for indice in 0..s.quantidade_variacoes.clamp(1, 4) {
        if foi_cancelada(&flag) {
            break;
        }
        let mut sucesso = None;
        let mut erros = Vec::new();
        for (tentativa, config) in configs.iter().enumerate() {
            if foi_cancelada(&flag) {
                break;
            }
            if !tentados.contains(&config.id) {
                tentados.push(config.id.clone());
            }
            let (uso, _, _, _) = uso_hoje(app, &config.id)?;
            if config.limite_diario_requisicoes > 0
                && uso >= config.limite_diario_requisicoes as u64
            {
                erros.push(format!("{} atingiu o limite diário", config.nome));
                continue;
            }
            let inicio = Instant::now();
            let prompt = prompt_completo(s, indice);
            let max_tokens = s
                .max_tokens_saida
                .min(config.max_tokens_saida)
                .clamp(64, 64000);
            match chamar_provedor(
                app,
                cofre,
                config,
                &s.prompt_sistema,
                &prompt,
                s.temperatura,
                max_tokens,
                flag.clone(),
            )
            .await
            {
                Ok(r) => {
                    let duracao = inicio.elapsed().as_secs_f64() * 1000.0;
                    let custo = (r.tokens_entrada as f64 / 1_000_000.0)
                        * config.custo_entrada_milhao
                        + (r.tokens_saida as f64 / 1_000_000.0) * config.custo_saida_milhao;
                    let registro = RegistroExecucaoIa {
                        id: id_execucao("exec-ia"),
                        experimento_id: s.experimento_id.clone(),
                        provedor: config.id.clone(),
                        modelo: r.modelo.clone(),
                        status: "concluido".to_owned(),
                        tokens_entrada: r.tokens_entrada,
                        tokens_saida: r.tokens_saida,
                        custo_estimado: custo,
                        duracao_ms: duracao,
                        mensagem: format!("Variação {} concluída.", indice + 1),
                        correlacao_id: correlacao.clone(),
                        criado_em: agora_millis(),
                    };
                    registrar_execucao(app, &registro)?;
                    sucesso = Some(VariacaoIaReal {
                        id: id_execucao("variacao-ia"),
                        indice,
                        conteudo: r.conteudo,
                        provedor: config.id.clone(),
                        modelo: r.modelo,
                        tokens_entrada: r.tokens_entrada,
                        tokens_saida: r.tokens_saida,
                        custo_estimado: custo,
                        duracao_ms: duracao,
                        tentativa: (tentativa + 1) as u32,
                    });
                    if tentativa > 0 {
                        fallback = true;
                    }
                    break;
                }
                Err(e) => {
                    let duracao = inicio.elapsed().as_secs_f64() * 1000.0;
                    let registro = RegistroExecucaoIa {
                        id: id_execucao("exec-ia"),
                        experimento_id: s.experimento_id.clone(),
                        provedor: config.id.clone(),
                        modelo: config.modelo.clone(),
                        status: if foi_cancelada(&flag) {
                            "cancelado".to_owned()
                        } else {
                            "falha".to_owned()
                        },
                        tokens_entrada: 0,
                        tokens_saida: 0,
                        custo_estimado: 0.0,
                        duracao_ms: duracao,
                        mensagem: e.clone(),
                        correlacao_id: correlacao.clone(),
                        criado_em: agora_millis(),
                    };
                    let _ = registrar_execucao(app, &registro);
                    erros.push(format!("{}: {}", config.nome, e));
                    if !s.permitir_fallback {
                        break;
                    }
                }
            }
        }
        if let Some(item) = sucesso {
            variacoes.push(item);
        } else if foi_cancelada(&flag) {
            break;
        } else {
            return Err(format!(
                "Nenhum provedor concluiu a variação {}. {}",
                indice + 1,
                erros.join(" | ")
            ));
        }
    }
    let cancelado = foi_cancelada(&flag);
    let mensagem = if cancelado {
        "Execução cancelada. Resultados concluídos foram preservados."
    } else {
        "Experimento real concluído."
    }
    .to_owned();
    let _ = registrar_log_interno(
        app,
        if cancelado { "aviso" } else { "info" },
        "provedor",
        if cancelado {
            "ia.experimento.cancelado"
        } else {
            "ia.experimento.concluido"
        },
        &mensagem,
        &correlacao,
        json!({"variacoes":variacoes.len(),"fallback":fallback,"provedores":tentados}),
    );
    Ok(ResultadoExecucaoIa {
        requisicao_id: s.requisicao_id.clone(),
        experimento_id: s.experimento_id.clone(),
        status: if cancelado {
            "cancelado".to_owned()
        } else {
            "concluido".to_owned()
        },
        variacoes,
        provedores_tentados: tentados,
        fallback_utilizado: fallback,
        duracao_ms: 0.0,
        mensagem,
    })
}

#[tauri::command]
pub fn cancelar_execucao_ia(
    estado: State<'_, EstadoRequisicoesIa>,
    requisicao_id: String,
) -> Result<bool, String> {
    let mapa = estado
        .0
        .lock()
        .map_err(|_| "Estado das requisições indisponível.".to_owned())?;
    if let Some(flag) = mapa.get(&requisicao_id) {
        flag.store(true, Ordering::SeqCst);
        Ok(true)
    } else {
        Ok(false)
    }
}

#[tauri::command]
pub fn listar_execucoes_ia(
    app: AppHandle,
    limite: Option<u32>,
) -> Result<Vec<RegistroExecucaoIa>, String> {
    garantir_configuracoes(&app)?;
    let c = abrir_banco(&app)?;
    let mut q=c.prepare("SELECT id,experimento_id,provedor,modelo,status,tokens_entrada,tokens_saida,custo_estimado,duracao_ms,mensagem,correlacao_id,criado_em FROM execucoes_ia ORDER BY criado_em DESC LIMIT ?1").map_err(|e|e.to_string())?;
    let linhas = q
        .query_map(params![limite.unwrap_or(100).clamp(1, 1000) as i64], |l| {
            Ok(RegistroExecucaoIa {
                id: l.get(0)?,
                experimento_id: l.get(1)?,
                provedor: l.get(2)?,
                modelo: l.get(3)?,
                status: l.get(4)?,
                tokens_entrada: l.get::<_, i64>(5)?.max(0) as u64,
                tokens_saida: l.get::<_, i64>(6)?.max(0) as u64,
                custo_estimado: l.get(7)?,
                duracao_ms: l.get(8)?,
                mensagem: l.get(9)?,
                correlacao_id: l.get(10)?,
                criado_em: l.get::<_, i64>(11)?.max(0) as u64,
            })
        })
        .map_err(|e| e.to_string())?;
    linhas
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn consultar_resumo_uso_ia(
    app: AppHandle,
    cofre: State<'_, EstadoCofre>,
) -> Result<ResumoUsoIa, String> {
    let provedores = listar_provedores_interno(&app, &cofre)?;
    let ativos = provedores.iter().filter(|p| p.habilitado).count() as u64;
    let prontos = provedores.iter().filter(|p| p.status == "pronto").count() as u64;
    let requisicoes = provedores.iter().map(|p| p.requisicoes_hoje).sum();
    let entrada = provedores.iter().map(|p| p.tokens_entrada_hoje).sum();
    let saida = provedores.iter().map(|p| p.tokens_saida_hoje).sum();
    let custo = provedores.iter().map(|p| p.custo_estimado_hoje).sum();
    let c = abrir_banco(&app)?;
    let recentes = c
        .query_row(
            "SELECT COUNT(*) FROM execucoes_ia WHERE criado_em>=?1",
            params![agora_millis().saturating_sub(7 * 86_400_000) as i64],
            |l| l.get::<_, i64>(0),
        )
        .optional()
        .map_err(|e| e.to_string())?
        .unwrap_or(0)
        .max(0) as u64;
    Ok(ResumoUsoIa {
        schema_versao: 6,
        provedores_ativos: ativos,
        provedores_prontos: prontos,
        requisicoes_hoje: requisicoes,
        tokens_entrada_hoje: entrada,
        tokens_saida_hoje: saida,
        custo_estimado_hoje: custo,
        execucoes_recentes: recentes,
        mensagem: "Provedores reais e uso local disponíveis.".to_owned(),
    })
}

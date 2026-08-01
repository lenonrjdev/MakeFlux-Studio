use std::{
    fs::{self, File},
    io::{Read, Seek, SeekFrom},
    path::Path,
    sync::{
        atomic::{AtomicBool, Ordering},
        Arc,
    },
    thread,
    time::Duration,
};

use reqwest::blocking::{multipart, Client};
use rusqlite::{params, Row};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sha1::{Digest, Sha1};
use tauri::{AppHandle, State};

use crate::{
    commands::{
        cofre::{ler_segredo_interno, salvar_segredo_interno},
        dados::{abrir_banco, agora_millis},
        observabilidade::registrar_log_interno,
    },
    state::EstadoCofre,
};

const CHAVE_CREDENCIAIS: &str = "armazenamento:cloudinary";
const PROVEDOR: &str = "cloudinary";

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CredenciaisCloudinary {
    pub api_key: String,
    pub api_secret: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConfiguracaoArmazenamentoPublicacao {
    pub provedor: String,
    pub cloud_name: String,
    pub api_key_configurada: bool,
    pub api_secret_configurado: bool,
    pub tamanho_bloco_mb: u32,
    pub retencao_horas: u32,
    pub limpeza_automatica: bool,
    pub status: String,
    pub ultima_verificacao_em: Option<u64>,
    pub mensagem: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EntradaConfiguracaoArmazenamento {
    pub cloud_name: String,
    pub api_key: Option<String>,
    pub api_secret: Option<String>,
    pub tamanho_bloco_mb: u32,
    pub retencao_horas: u32,
    pub limpeza_automatica: bool,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AtivoTemporarioPublicacao {
    pub id: String,
    pub provedor: String,
    pub public_id: String,
    pub url_publica: String,
    pub caminho_local: String,
    pub status: String,
    pub bytes: u64,
    pub criado_em: u64,
    pub atualizado_em: u64,
    pub expira_em: u64,
    pub removido_em: Option<u64>,
    pub mensagem: String,
    pub correlacao_id: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ResultadoLimpezaAtivos {
    pub analisados: u64,
    pub removidos: u64,
    pub falhas: u64,
    pub mensagem: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EntradaUploadTemporario {
    pub caminho: String,
    pub correlacao_id: Option<String>,
}

fn mapear_configuracao(
    linha: &Row<'_>,
    credenciais: Option<&CredenciaisCloudinary>,
) -> rusqlite::Result<ConfiguracaoArmazenamentoPublicacao> {
    Ok(ConfiguracaoArmazenamentoPublicacao {
        provedor: PROVEDOR.to_owned(),
        cloud_name: linha.get(0)?,
        api_key_configurada: credenciais.is_some_and(|item| !item.api_key.trim().is_empty()),
        api_secret_configurado: credenciais.is_some_and(|item| !item.api_secret.trim().is_empty()),
        tamanho_bloco_mb: linha.get::<_, i64>(1)?.clamp(6, 64) as u32,
        retencao_horas: linha.get::<_, i64>(2)?.clamp(1, 720) as u32,
        limpeza_automatica: linha.get::<_, i64>(3)? != 0,
        status: linha.get(4)?,
        ultima_verificacao_em: linha
            .get::<_, Option<i64>>(5)?
            .map(|valor| valor.max(0) as u64),
        mensagem: linha.get(6)?,
    })
}

fn mapear_ativo(linha: &Row<'_>) -> rusqlite::Result<AtivoTemporarioPublicacao> {
    Ok(AtivoTemporarioPublicacao {
        id: linha.get(0)?,
        provedor: linha.get(1)?,
        public_id: linha.get(2)?,
        url_publica: linha.get(3)?,
        caminho_local: linha.get(4)?,
        status: linha.get(5)?,
        bytes: linha.get::<_, i64>(6)?.max(0) as u64,
        criado_em: linha.get::<_, i64>(7)?.max(0) as u64,
        atualizado_em: linha.get::<_, i64>(8)?.max(0) as u64,
        expira_em: linha.get::<_, i64>(9)?.max(0) as u64,
        removido_em: linha
            .get::<_, Option<i64>>(10)?
            .map(|valor| valor.max(0) as u64),
        mensagem: linha.get(11)?,
        correlacao_id: linha.get(12)?,
    })
}

pub(crate) fn carregar_credenciais_cloudinary(
    app: &AppHandle,
    estado: &EstadoCofre,
) -> Result<CredenciaisCloudinary, String> {
    let texto = ler_segredo_interno(app, estado, CHAVE_CREDENCIAIS)?;
    let credenciais: CredenciaisCloudinary = serde_json::from_str(&texto)
        .map_err(|erro| format!("Credenciais do armazenamento inválidas: {erro}"))?;
    if credenciais.api_key.trim().is_empty() || credenciais.api_secret.trim().is_empty() {
        return Err("Configure a API Key e o API Secret do Cloudinary.".to_owned());
    }
    Ok(credenciais)
}

pub(crate) fn carregar_configuracao_armazenamento(
    app: &AppHandle,
    estado: &EstadoCofre,
) -> Result<ConfiguracaoArmazenamentoPublicacao, String> {
    let credenciais = carregar_credenciais_cloudinary(app, estado).ok();
    let conexao = abrir_banco(app)?;
    conexao
        .query_row(
            "SELECT cloud_name, tamanho_bloco_mb, retencao_horas, limpeza_automatica, status, ultima_verificacao_em, mensagem FROM configuracoes_armazenamento_publicacao WHERE provedor = 'cloudinary'",
            [],
            |linha| mapear_configuracao(linha, credenciais.as_ref()),
        )
        .map_err(|_| "Configure o armazenamento temporário antes de publicar no Instagram.".to_owned())
}

fn cliente_http() -> Result<Client, String> {
    Client::builder()
        .timeout(Duration::from_secs(180))
        .build()
        .map_err(|erro| format!("Falha ao preparar cliente HTTP: {erro}"))
}

fn atualizar_ativo(
    app: &AppHandle,
    id: &str,
    status: &str,
    url_publica: Option<&str>,
    bytes: u64,
    mensagem: &str,
) -> Result<(), String> {
    abrir_banco(app)?
        .execute(
            "UPDATE ativos_temporarios_publicacao SET status=?2, url_publica=COALESCE(?3, url_publica), bytes=?4, atualizado_em=?5, mensagem=?6 WHERE id=?1",
            params![id, status, url_publica, bytes as i64, agora_millis() as i64, mensagem],
        )
        .map_err(|erro| format!("Falha ao atualizar ativo temporário: {erro}"))?;
    Ok(())
}

pub(crate) fn hospedar_video_temporario(
    app: &AppHandle,
    estado: &EstadoCofre,
    caminho: &str,
    correlacao_id: &str,
    cancelamento: Arc<AtomicBool>,
    progresso: &mut dyn FnMut(u32, u64, u64, &str),
) -> Result<AtivoTemporarioPublicacao, String> {
    let caminho_arquivo = Path::new(caminho);
    if !caminho_arquivo.is_file() {
        return Err("O vídeo local informado não foi encontrado.".to_owned());
    }
    let configuracao = carregar_configuracao_armazenamento(app, estado)?;
    if configuracao.cloud_name.trim().is_empty() {
        return Err("Informe o Cloud Name do Cloudinary.".to_owned());
    }
    let credenciais = carregar_credenciais_cloudinary(app, estado)?;
    let total = fs::metadata(caminho_arquivo)
        .map_err(|erro| format!("Falha ao ler o vídeo: {erro}"))?
        .len();
    if total == 0 {
        return Err("O arquivo de vídeo está vazio.".to_owned());
    }

    let agora = agora_millis();
    let id = format!("ativo-{agora}-{}", rand::random::<u32>());
    let public_id = format!("makeflux-temporarios/{id}");
    let expira_em = agora.saturating_add(configuracao.retencao_horas as u64 * 3_600_000);
    abrir_banco(app)?
        .execute(
            "INSERT INTO ativos_temporarios_publicacao (id, provedor, public_id, url_publica, caminho_local, status, bytes, criado_em, atualizado_em, expira_em, removido_em, mensagem, correlacao_id) VALUES (?1, 'cloudinary', ?2, '', ?3, 'enviando', 0, ?4, ?4, ?5, NULL, 'Preparando hospedagem temporária.', ?6)",
            params![id, public_id, caminho, agora as i64, expira_em as i64, correlacao_id],
        )
        .map_err(|erro| format!("Falha ao registrar ativo temporário: {erro}"))?;

    let endpoint = format!(
        "https://api.cloudinary.com/v1_1/{}/video/upload",
        configuracao.cloud_name.trim()
    );
    let tamanho_bloco = configuracao.tamanho_bloco_mb.clamp(6, 64) as u64 * 1024 * 1024;
    let upload_id = format!("makeflux-{agora}-{}", rand::random::<u64>());
    let timestamp = agora / 1_000;
    let parametros_assinatura = format!(
        "invalidate=true&overwrite=true&public_id={}&timestamp={}{}",
        public_id, timestamp, credenciais.api_secret
    );
    let mut assinador = Sha1::new();
    assinador.update(parametros_assinatura.as_bytes());
    let assinatura = format!("{:x}", assinador.finalize());
    let nome_arquivo = caminho_arquivo
        .file_name()
        .and_then(|nome| nome.to_str())
        .unwrap_or("video.mp4")
        .to_owned();
    let cliente = cliente_http()?;
    let mut arquivo =
        File::open(caminho_arquivo).map_err(|erro| format!("Falha ao abrir o vídeo: {erro}"))?;
    let mut inicio = 0_u64;
    let mut resposta_final: Option<Value> = None;

    while inicio < total {
        if cancelamento.load(Ordering::SeqCst) {
            atualizar_ativo(
                app,
                &id,
                "cancelado",
                None,
                inicio,
                "Hospedagem cancelada pelo usuário.",
            )?;
            return Err("Hospedagem temporária cancelada.".to_owned());
        }
        let fim_exclusivo = (inicio + tamanho_bloco).min(total);
        let tamanho = (fim_exclusivo - inicio) as usize;
        arquivo
            .seek(SeekFrom::Start(inicio))
            .map_err(|erro| format!("Falha ao posicionar o vídeo: {erro}"))?;
        let mut bloco = vec![0_u8; tamanho];
        arquivo
            .read_exact(&mut bloco)
            .map_err(|erro| format!("Falha ao ler bloco do vídeo: {erro}"))?;

        let mut ultimo_erro = String::new();
        let mut enviado = false;
        for tentativa in 1..=4 {
            let parte = multipart::Part::bytes(bloco.clone())
                .file_name(nome_arquivo.clone())
                .mime_str("application/octet-stream")
                .map_err(|erro| erro.to_string())?;
            let formulario = multipart::Form::new()
                .part("file", parte)
                .text("public_id", public_id.clone())
                .text("overwrite", "true")
                .text("invalidate", "true")
                .text("timestamp", timestamp.to_string())
                .text("api_key", credenciais.api_key.clone())
                .text("signature", assinatura.clone());
            let resposta = cliente
                .post(&endpoint)
                .header("X-Unique-Upload-Id", &upload_id)
                .header(
                    "Content-Range",
                    format!("bytes {}-{}/{}", inicio, fim_exclusivo - 1, total),
                )
                .multipart(formulario)
                .send();
            match resposta {
                Ok(resposta) => {
                    let status = resposta.status();
                    let valor: Value = resposta.json().unwrap_or(Value::Null);
                    if status.is_success() {
                        if fim_exclusivo == total {
                            resposta_final = Some(valor);
                        }
                        enviado = true;
                        break;
                    }
                    ultimo_erro = valor
                        .get("error")
                        .and_then(|item| item.get("message"))
                        .and_then(Value::as_str)
                        .unwrap_or("O Cloudinary recusou um bloco do vídeo.")
                        .to_owned();
                    if !status.is_server_error() && status.as_u16() != 429 {
                        break;
                    }
                }
                Err(erro) => ultimo_erro = erro.to_string(),
            }
            thread::sleep(Duration::from_secs(2_u64.pow(tentativa)));
        }
        if !enviado {
            atualizar_ativo(app, &id, "falha", None, inicio, &ultimo_erro)?;
            return Err(format!("Falha na hospedagem temporária: {ultimo_erro}"));
        }
        inicio = fim_exclusivo;
        let percentual = ((inicio.saturating_mul(100)) / total).min(100) as u32;
        let mensagem = format!("Hospedando vídeo: {percentual}% concluído.");
        atualizar_ativo(app, &id, "enviando", None, inicio, &mensagem)?;
        progresso(percentual, inicio, total, &mensagem);
    }

    let resposta = resposta_final
        .ok_or_else(|| "O Cloudinary não retornou a confirmação final do upload.".to_owned())?;
    let url_publica = resposta
        .get("secure_url")
        .and_then(Value::as_str)
        .ok_or_else(|| "O Cloudinary não retornou uma URL HTTPS pública.".to_owned())?
        .to_owned();
    let public_id_confirmado = resposta
        .get("public_id")
        .and_then(Value::as_str)
        .unwrap_or(&public_id)
        .to_owned();
    abrir_banco(app)?
        .execute(
            "UPDATE ativos_temporarios_publicacao SET public_id=?2, url_publica=?3, status='disponivel', bytes=?4, atualizado_em=?5, mensagem='Vídeo temporário disponível por HTTPS.' WHERE id=?1",
            params![id, public_id_confirmado, url_publica, total as i64, agora_millis() as i64],
        )
        .map_err(|erro| format!("Falha ao confirmar ativo temporário: {erro}"))?;
    let _ = registrar_log_interno(
        app,
        "info",
        "publicacao",
        "armazenamento.temporario.concluido",
        "Vídeo hospedado temporariamente.",
        correlacao_id,
        serde_json::json!({ "ativoId": id, "bytes": total, "expiraEm": expira_em }),
    );
    Ok(AtivoTemporarioPublicacao {
        id,
        provedor: PROVEDOR.to_owned(),
        public_id: public_id_confirmado,
        url_publica,
        caminho_local: caminho.to_owned(),
        status: "disponivel".to_owned(),
        bytes: total,
        criado_em: agora,
        atualizado_em: agora_millis(),
        expira_em,
        removido_em: None,
        mensagem: "Vídeo temporário disponível por HTTPS.".to_owned(),
        correlacao_id: correlacao_id.to_owned(),
    })
}

pub(crate) fn remover_ativo_temporario_interno(
    app: &AppHandle,
    estado: &EstadoCofre,
    ativo: &AtivoTemporarioPublicacao,
) -> Result<(), String> {
    if ativo.status == "removido" {
        return Ok(());
    }
    let configuracao = carregar_configuracao_armazenamento(app, estado)?;
    let credenciais = carregar_credenciais_cloudinary(app, estado)?;
    let endpoint = format!(
        "https://api.cloudinary.com/v1_1/{}/resources/video/upload",
        configuracao.cloud_name.trim()
    );
    let resposta = cliente_http()?
        .delete(endpoint)
        .basic_auth(&credenciais.api_key, Some(&credenciais.api_secret))
        .query(&[
            ("public_ids[]", ativo.public_id.as_str()),
            ("invalidate", "true"),
        ])
        .send()
        .map_err(|erro| format!("Falha ao remover mídia temporária: {erro}"))?;
    let status = resposta.status();
    let valor: Value = resposta.json().unwrap_or(Value::Null);
    let resultado = valor
        .get("deleted")
        .and_then(|item| item.get(&ativo.public_id))
        .and_then(Value::as_str)
        .unwrap_or("");
    if !status.is_success() || !matches!(resultado, "deleted" | "not_found") {
        return Err(valor
            .get("error")
            .and_then(|item| item.get("message"))
            .and_then(Value::as_str)
            .unwrap_or("O Cloudinary não confirmou a remoção.")
            .to_owned());
    }
    let agora = agora_millis();
    abrir_banco(app)?
        .execute(
            "UPDATE ativos_temporarios_publicacao SET status='removido', removido_em=?2, atualizado_em=?2, mensagem='Ativo temporário removido do armazenamento.' WHERE id=?1",
            params![ativo.id, agora as i64],
        )
        .map_err(|erro| format!("Falha ao registrar remoção: {erro}"))?;
    Ok(())
}

#[tauri::command]
pub fn consultar_configuracao_armazenamento_publicacao(
    app: AppHandle,
    estado: State<'_, EstadoCofre>,
) -> Result<ConfiguracaoArmazenamentoPublicacao, String> {
    carregar_configuracao_armazenamento(&app, estado.inner()).or_else(|_| {
        Ok(ConfiguracaoArmazenamentoPublicacao {
            provedor: PROVEDOR.to_owned(),
            cloud_name: String::new(),
            api_key_configurada: false,
            api_secret_configurado: false,
            tamanho_bloco_mb: 8,
            retencao_horas: 24,
            limpeza_automatica: true,
            status: "nao-configurado".to_owned(),
            ultima_verificacao_em: None,
            mensagem: "Configure o Cloudinary para hospedar Reels temporariamente.".to_owned(),
        })
    })
}

#[tauri::command]
pub fn salvar_configuracao_armazenamento_publicacao(
    app: AppHandle,
    estado: State<'_, EstadoCofre>,
    entrada: EntradaConfiguracaoArmazenamento,
) -> Result<ConfiguracaoArmazenamentoPublicacao, String> {
    let cloud_name = entrada.cloud_name.trim();
    if cloud_name.is_empty() {
        return Err("Informe o Cloud Name do Cloudinary.".to_owned());
    }
    let atuais = carregar_credenciais_cloudinary(&app, estado.inner()).ok();
    let api_key = entrada
        .api_key
        .as_deref()
        .map(str::trim)
        .filter(|valor| !valor.is_empty())
        .map(str::to_owned)
        .or_else(|| atuais.as_ref().map(|item| item.api_key.clone()))
        .ok_or_else(|| "Informe a API Key do Cloudinary.".to_owned())?;
    let api_secret = entrada
        .api_secret
        .as_deref()
        .map(str::trim)
        .filter(|valor| !valor.is_empty())
        .map(str::to_owned)
        .or_else(|| atuais.as_ref().map(|item| item.api_secret.clone()))
        .ok_or_else(|| "Informe o API Secret do Cloudinary.".to_owned())?;
    let credenciais = CredenciaisCloudinary {
        api_key,
        api_secret,
    };
    salvar_segredo_interno(
        &app,
        estado.inner(),
        CHAVE_CREDENCIAIS,
        &serde_json::to_string(&credenciais).map_err(|erro| erro.to_string())?,
    )?;
    let agora = agora_millis();
    abrir_banco(&app)?
        .execute(
            "INSERT INTO configuracoes_armazenamento_publicacao (provedor, cloud_name, tamanho_bloco_mb, retencao_horas, limpeza_automatica, status, ultima_verificacao_em, mensagem, atualizado_em) VALUES ('cloudinary', ?1, ?2, ?3, ?4, 'configurado', NULL, 'Configuração salva no cofre.', ?5) ON CONFLICT(provedor) DO UPDATE SET cloud_name=excluded.cloud_name, tamanho_bloco_mb=excluded.tamanho_bloco_mb, retencao_horas=excluded.retencao_horas, limpeza_automatica=excluded.limpeza_automatica, status='configurado', mensagem='Configuração salva no cofre.', atualizado_em=excluded.atualizado_em",
            params![cloud_name, entrada.tamanho_bloco_mb.clamp(6, 64) as i64, entrada.retencao_horas.clamp(1, 720) as i64, if entrada.limpeza_automatica { 1_i64 } else { 0_i64 }, agora as i64],
        )
        .map_err(|erro| format!("Falha ao salvar configuração: {erro}"))?;
    carregar_configuracao_armazenamento(&app, estado.inner())
}

#[tauri::command]
pub fn testar_armazenamento_publicacao(
    app: AppHandle,
    estado: State<'_, EstadoCofre>,
) -> Result<ConfiguracaoArmazenamentoPublicacao, String> {
    let configuracao = carregar_configuracao_armazenamento(&app, estado.inner())?;
    let credenciais = carregar_credenciais_cloudinary(&app, estado.inner())?;
    let endpoint = format!(
        "https://api.cloudinary.com/v1_1/{}/resources/video/upload?max_results=1",
        configuracao.cloud_name.trim()
    );
    let resposta = cliente_http()?
        .get(endpoint)
        .basic_auth(&credenciais.api_key, Some(&credenciais.api_secret))
        .send()
        .map_err(|erro| format!("Falha ao testar o Cloudinary: {erro}"))?;
    let agora = agora_millis();
    let (status, mensagem) = if resposta.status().is_success() {
        (
            "pronto",
            "Cloudinary autenticado e pronto para vídeos temporários.",
        )
    } else {
        ("falha", "O Cloudinary recusou as credenciais informadas.")
    };
    abrir_banco(&app)?
        .execute(
            "UPDATE configuracoes_armazenamento_publicacao SET status=?1, ultima_verificacao_em=?2, mensagem=?3, atualizado_em=?2 WHERE provedor='cloudinary'",
            params![status, agora as i64, mensagem],
        )
        .map_err(|erro| erro.to_string())?;
    if status == "falha" {
        return Err(mensagem.to_owned());
    }
    carregar_configuracao_armazenamento(&app, estado.inner())
}

#[tauri::command]
pub fn enviar_ativo_temporario_publicacao(
    app: AppHandle,
    estado: State<'_, EstadoCofre>,
    entrada: EntradaUploadTemporario,
) -> Result<AtivoTemporarioPublicacao, String> {
    let correlacao = entrada
        .correlacao_id
        .filter(|valor| !valor.trim().is_empty())
        .unwrap_or_else(|| format!("armazenamento-{}", agora_millis()));
    let cancelamento = Arc::new(AtomicBool::new(false));
    hospedar_video_temporario(
        &app,
        estado.inner(),
        &entrada.caminho,
        &correlacao,
        cancelamento,
        &mut |_, _, _, _| {},
    )
}

#[tauri::command]
pub fn listar_ativos_temporarios_publicacao(
    app: AppHandle,
) -> Result<Vec<AtivoTemporarioPublicacao>, String> {
    let conexao = abrir_banco(&app)?;
    let mut consulta = conexao
        .prepare("SELECT id, provedor, public_id, url_publica, caminho_local, status, bytes, criado_em, atualizado_em, expira_em, removido_em, mensagem, correlacao_id FROM ativos_temporarios_publicacao ORDER BY atualizado_em DESC LIMIT 200")
        .map_err(|erro| erro.to_string())?;
    let linhas = consulta
        .query_map([], mapear_ativo)
        .map_err(|erro| erro.to_string())?;
    linhas
        .collect::<Result<Vec<_>, _>>()
        .map_err(|erro| erro.to_string())
}

#[tauri::command]
pub fn remover_ativo_temporario_publicacao(
    app: AppHandle,
    estado: State<'_, EstadoCofre>,
    ativo_id: String,
) -> Result<bool, String> {
    let conexao = abrir_banco(&app)?;
    let ativo = conexao
        .query_row(
            "SELECT id, provedor, public_id, url_publica, caminho_local, status, bytes, criado_em, atualizado_em, expira_em, removido_em, mensagem, correlacao_id FROM ativos_temporarios_publicacao WHERE id=?1",
            params![ativo_id],
            mapear_ativo,
        )
        .map_err(|_| "Ativo temporário não encontrado.".to_owned())?;
    remover_ativo_temporario_interno(&app, estado.inner(), &ativo)?;
    Ok(true)
}

#[tauri::command]
pub fn limpar_ativos_temporarios_expirados(
    app: AppHandle,
    estado: State<'_, EstadoCofre>,
) -> Result<ResultadoLimpezaAtivos, String> {
    let agora = agora_millis();
    let ativos = listar_ativos_temporarios_publicacao(app.clone())?
        .into_iter()
        .filter(|item| item.status != "removido" && item.expira_em <= agora)
        .collect::<Vec<_>>();
    let analisados = ativos.len() as u64;
    let mut removidos = 0_u64;
    let mut falhas = 0_u64;
    for ativo in ativos {
        match remover_ativo_temporario_interno(&app, estado.inner(), &ativo) {
            Ok(()) => removidos += 1,
            Err(_) => falhas += 1,
        }
    }
    Ok(ResultadoLimpezaAtivos {
        analisados,
        removidos,
        falhas,
        mensagem: format!("Limpeza concluída: {removidos} removidos e {falhas} falhas."),
    })
}

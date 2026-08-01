use std::{fs, time::Duration};

use reqwest::{blocking::Client, header};
use rusqlite::{params, Row};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tauri::{AppHandle, State};

use crate::{
    commands::{
        cofre::ler_segredo_interno,
        dados::{abrir_banco, agora_millis},
        oauth::TokenCanal,
    },
    state::EstadoCofre,
};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EntradaPublicacaoSocial {
    pub provedor: String,
    pub publicacao_id: String,
    pub titulo: String,
    pub descricao: String,
    pub hashtags: Vec<String>,
    pub caminho_video: Option<String>,
    pub media_url: Option<String>,
    pub conta_id: Option<String>,
    pub privacidade: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EnvioPublicacaoSocial {
    pub id: String,
    pub publicacao_id: String,
    pub provedor: String,
    pub status: String,
    pub progresso: u32,
    pub remoto_id: Option<String>,
    pub link: Option<String>,
    pub criado_em: u64,
    pub atualizado_em: u64,
    pub mensagem: String,
}

fn legenda(entrada: &EntradaPublicacaoSocial) -> String {
    let tags = entrada
        .hashtags
        .iter()
        .filter(|tag| !tag.trim().is_empty())
        .map(|tag| format!("#{}", tag.trim().trim_start_matches('#')))
        .collect::<Vec<_>>()
        .join(" ");
    format!("{}\n\n{}", entrada.descricao.trim(), tags)
        .trim()
        .to_owned()
}

fn publicar_youtube(
    cliente: &Client,
    token: &TokenCanal,
    entrada: &EntradaPublicacaoSocial,
) -> Result<(String, String), String> {
    let caminho = entrada
        .caminho_video
        .as_deref()
        .filter(|valor| !valor.trim().is_empty())
        .ok_or_else(|| "A publicação não possui caminho de vídeo local.".to_owned())?;
    let arquivo = fs::read(caminho).map_err(|erro| format!("Falha ao ler o vídeo: {erro}"))?;
    let privacidade = match entrada.privacidade.as_deref() {
        Some("privada") => "private",
        Some("nao-listada") => "unlisted",
        _ => "public",
    };
    let metadados = json!({ "snippet": { "title": entrada.titulo, "description": legenda(entrada), "categoryId": "22" }, "status": { "privacyStatus": privacidade, "selfDeclaredMadeForKids": false } });
    let inicio = cliente.post("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status")
        .bearer_auth(&token.access_token).header(header::CONTENT_TYPE, "application/json; charset=UTF-8")
        .header("X-Upload-Content-Type", "video/mp4").header("X-Upload-Content-Length", arquivo.len().to_string())
        .json(&metadados).send().map_err(|erro| format!("Falha ao iniciar o upload do YouTube: {erro}"))?;
    if !inicio.status().is_success() {
        return Err(format!(
            "O YouTube recusou a sessão de upload: {}",
            inicio.status()
        ));
    }
    let url_upload = inicio
        .headers()
        .get(header::LOCATION)
        .and_then(|valor| valor.to_str().ok())
        .ok_or_else(|| "O YouTube não retornou a URL da sessão retomável.".to_owned())?
        .to_owned();
    let resposta = cliente
        .put(url_upload)
        .bearer_auth(&token.access_token)
        .header(header::CONTENT_TYPE, "video/mp4")
        .header(header::CONTENT_LENGTH, arquivo.len().to_string())
        .body(arquivo)
        .send()
        .map_err(|erro| format!("Falha durante o upload do vídeo: {erro}"))?;
    let status = resposta.status();
    let corpo: Value = resposta
        .json()
        .map_err(|erro| format!("Resposta final do YouTube inválida: {erro}"))?;
    if !status.is_success() {
        return Err(corpo
            .get("error")
            .and_then(|item| item.get("message"))
            .and_then(Value::as_str)
            .unwrap_or("O YouTube recusou o vídeo.")
            .to_owned());
    }
    let id = corpo
        .get("id")
        .and_then(Value::as_str)
        .ok_or_else(|| "O YouTube não retornou o identificador do vídeo.".to_owned())?
        .to_owned();
    Ok((id.clone(), format!("https://www.youtube.com/watch?v={id}")))
}

fn publicar_instagram(
    cliente: &Client,
    token: &TokenCanal,
    entrada: &EntradaPublicacaoSocial,
) -> Result<(String, String), String> {
    let media_url = entrada
        .media_url
        .as_deref()
        .filter(|valor| valor.starts_with("https://"))
        .ok_or_else(|| "Informe uma URL HTTPS pública para o Reel.".to_owned())?;
    let conta_id = entrada
        .conta_id
        .as_deref()
        .filter(|valor| !valor.trim().is_empty())
        .or_else(|| (!token.account_id.is_empty()).then_some(token.account_id.as_str()))
        .ok_or_else(|| "Informe o ID da conta profissional do Instagram.".to_owned())?;
    let texto_legenda = legenda(entrada);
    let criar: Value = cliente
        .post(format!(
            "https://graph.instagram.com/v23.0/{conta_id}/media"
        ))
        .form(&[
            ("media_type", "REELS"),
            ("video_url", media_url),
            ("caption", texto_legenda.as_str()),
            ("access_token", token.access_token.as_str()),
        ])
        .send()
        .map_err(|erro| format!("Falha ao criar o contêiner do Instagram: {erro}"))?
        .json()
        .map_err(|erro| erro.to_string())?;
    let creation_id = criar.get("id").and_then(Value::as_str).ok_or_else(|| {
        criar
            .get("error")
            .and_then(|item| item.get("message"))
            .and_then(Value::as_str)
            .unwrap_or("O Instagram não criou o contêiner de mídia.")
            .to_owned()
    })?;
    let publicar: Value = cliente
        .post(format!(
            "https://graph.instagram.com/v23.0/{conta_id}/media_publish"
        ))
        .form(&[
            ("creation_id", creation_id),
            ("access_token", token.access_token.as_str()),
        ])
        .send()
        .map_err(|erro| format!("Falha ao publicar o Reel: {erro}"))?
        .json()
        .map_err(|erro| erro.to_string())?;
    let id = publicar
        .get("id")
        .and_then(Value::as_str)
        .ok_or_else(|| {
            publicar
                .get("error")
                .and_then(|item| item.get("message"))
                .and_then(Value::as_str)
                .unwrap_or("O Instagram não confirmou a publicação.")
                .to_owned()
        })?
        .to_owned();
    Ok((id, String::new()))
}

fn publicar_tiktok(
    cliente: &Client,
    token: &TokenCanal,
    entrada: &EntradaPublicacaoSocial,
) -> Result<(String, String), String> {
    let media_url = entrada
        .media_url
        .as_deref()
        .filter(|valor| valor.starts_with("https://"))
        .ok_or_else(|| {
            "Informe uma URL HTTPS pertencente a um domínio verificado no TikTok.".to_owned()
        })?;
    let corpo = json!({ "post_info": { "title": legenda(entrada), "privacy_level": "PUBLIC_TO_EVERYONE", "disable_duet": false, "disable_comment": false, "disable_stitch": false, "video_cover_timestamp_ms": 1000 }, "source_info": { "source": "PULL_FROM_URL", "video_url": media_url } });
    let resposta = cliente
        .post("https://open.tiktokapis.com/v2/post/publish/video/init/")
        .bearer_auth(&token.access_token)
        .json(&corpo)
        .send()
        .map_err(|erro| format!("Falha ao iniciar o Direct Post: {erro}"))?;
    let status = resposta.status();
    let valor: Value = resposta.json().map_err(|erro| erro.to_string())?;
    if !status.is_success() {
        return Err(valor
            .get("error")
            .and_then(|item| item.get("message"))
            .and_then(Value::as_str)
            .unwrap_or("O TikTok recusou o envio.")
            .to_owned());
    }
    let id = valor
        .get("data")
        .and_then(|item| item.get("publish_id"))
        .and_then(Value::as_str)
        .ok_or_else(|| "O TikTok não retornou publish_id.".to_owned())?
        .to_owned();
    Ok((id, String::new()))
}

fn mapear_envio(linha: &Row<'_>) -> rusqlite::Result<EnvioPublicacaoSocial> {
    Ok(EnvioPublicacaoSocial {
        id: linha.get(0)?,
        publicacao_id: linha.get(1)?,
        provedor: linha.get(2)?,
        status: linha.get(3)?,
        progresso: linha.get::<_, i64>(4)?.clamp(0, 100) as u32,
        remoto_id: linha.get(5)?,
        link: linha.get(6)?,
        criado_em: linha.get::<_, i64>(7)?.max(0) as u64,
        atualizado_em: linha.get::<_, i64>(8)?.max(0) as u64,
        mensagem: linha.get(9)?,
    })
}

#[tauri::command]
pub fn publicar_conteudo_social(
    app: AppHandle,
    estado: State<'_, EstadoCofre>,
    entrada: EntradaPublicacaoSocial,
) -> Result<EnvioPublicacaoSocial, String> {
    let token_texto =
        ler_segredo_interno(&app, estado.inner(), &format!("oauth:{}", entrada.provedor))?;
    let token: TokenCanal = serde_json::from_str(&token_texto)
        .map_err(|erro| format!("Token OAuth inválido: {erro}"))?;
    if token
        .expires_at
        .is_some_and(|expira| expira <= agora_millis())
    {
        return Err("O token do canal expirou. Reconecte a conta antes de publicar.".to_owned());
    }
    let agora = agora_millis();
    let id = format!("envio-{agora}-{}", rand::random::<u32>());
    let conexao = abrir_banco(&app)?;
    conexao.execute("INSERT INTO envios_publicacao (id, publicacao_id, provedor, status, progresso, remoto_id, link, criado_em, atualizado_em, mensagem) VALUES (?1, ?2, ?3, 'enviando', 10, NULL, NULL, ?4, ?4, 'Preparando envio real.')", params![id, entrada.publicacao_id, entrada.provedor, agora as i64]).map_err(|erro| erro.to_string())?;
    let cliente = Client::builder()
        .timeout(Duration::from_secs(900))
        .build()
        .map_err(|erro| erro.to_string())?;
    let resultado = match entrada.provedor.as_str() {
        "youtube" => publicar_youtube(&cliente, &token, &entrada),
        "instagram" => publicar_instagram(&cliente, &token, &entrada),
        "tiktok" => publicar_tiktok(&cliente, &token, &entrada),
        _ => Err("Canal de publicação não reconhecido.".to_owned()),
    };
    let atualizado = agora_millis();
    let (status, progresso, remoto_id, link, mensagem) = match resultado {
        Ok((remoto_id, link)) => (
            "publicada",
            100,
            Some(remoto_id),
            (!link.is_empty()).then_some(link),
            "Publicação enviada e confirmada pela plataforma.".to_owned(),
        ),
        Err(erro) => ("falha", 100, None, None, erro),
    };
    conexao.execute("UPDATE envios_publicacao SET status=?2, progresso=?3, remoto_id=?4, link=?5, atualizado_em=?6, mensagem=?7 WHERE id=?1", params![id, status, progresso, remoto_id, link, atualizado as i64, mensagem]).map_err(|erro| erro.to_string())?;
    Ok(EnvioPublicacaoSocial {
        id,
        publicacao_id: entrada.publicacao_id,
        provedor: entrada.provedor,
        status: status.to_owned(),
        progresso,
        remoto_id,
        link,
        criado_em: agora,
        atualizado_em: atualizado,
        mensagem,
    })
}

#[tauri::command]
pub fn listar_envios_publicacao(app: AppHandle) -> Result<Vec<EnvioPublicacaoSocial>, String> {
    let conexao = abrir_banco(&app)?;
    let mut consulta = conexao.prepare("SELECT id, publicacao_id, provedor, status, progresso, remoto_id, link, criado_em, atualizado_em, mensagem FROM envios_publicacao ORDER BY atualizado_em DESC LIMIT 100").map_err(|erro| erro.to_string())?;
    let linhas = consulta
        .query_map([], mapear_envio)
        .map_err(|erro| erro.to_string())?;
    linhas
        .collect::<Result<Vec<_>, _>>()
        .map_err(|erro| erro.to_string())
}

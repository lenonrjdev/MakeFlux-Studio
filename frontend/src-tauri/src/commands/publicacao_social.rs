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

use reqwest::{
    blocking::Client,
    header::{self, HeaderMap},
    StatusCode,
};
use rusqlite::{params, OptionalExtension, Row};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tauri::{AppHandle, State};

use crate::{
    commands::{
        armazenamento_publicacao::{
            carregar_configuracao_armazenamento, hospedar_video_temporario,
            remover_ativo_temporario_interno, AtivoTemporarioPublicacao,
        },
        dados::{abrir_banco, agora_millis},
        oauth::{obter_token_valido, TokenCanal},
        observabilidade::registrar_log_interno,
    },
    state::{EstadoCofre, EstadoEnviosPublicacao},
};

const MAX_TENTATIVAS: u32 = 4;
const BLOCO_YOUTUBE: u64 = 8 * 1024 * 1024;
const BLOCO_TIKTOK: u64 = 10 * 1024 * 1024;

#[derive(Debug, Clone, Serialize, Deserialize)]
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
    pub hospedar_temporariamente: Option<bool>,
    pub consentimento_tiktok: Option<bool>,
    pub permitir_comentarios: Option<bool>,
    pub permitir_dueto: Option<bool>,
    pub permitir_costura: Option<bool>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EnvioPublicacaoSocial {
    pub id: String,
    pub publicacao_id: String,
    pub provedor: String,
    pub status: String,
    pub progresso: u32,
    pub tentativas: u32,
    pub max_tentativas: u32,
    pub proxima_tentativa_em: Option<u64>,
    pub bytes_enviados: u64,
    pub bytes_totais: u64,
    pub remoto_id: Option<String>,
    pub link: Option<String>,
    pub ativo_temporario_id: Option<String>,
    pub criado_em: u64,
    pub atualizado_em: u64,
    pub mensagem: String,
    pub correlacao_id: String,
}

#[derive(Debug, Clone)]
struct ResultadoPublicacao {
    remoto_id: String,
    link: Option<String>,
    ativo_temporario: Option<AtivoTemporarioPublicacao>,
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

fn caminho_video(entrada: &EntradaPublicacaoSocial) -> Result<&str, String> {
    let caminho = entrada
        .caminho_video
        .as_deref()
        .filter(|valor| !valor.trim().is_empty())
        .ok_or_else(|| "A publicação não possui um vídeo local consolidado.".to_owned())?;
    if !Path::new(caminho).is_file() {
        return Err("O arquivo local da publicação não foi encontrado.".to_owned());
    }
    Ok(caminho)
}

fn cliente_http() -> Result<Client, String> {
    Client::builder()
        .timeout(Duration::from_secs(180))
        .build()
        .map_err(|erro| format!("Falha ao preparar cliente de publicação: {erro}"))
}

fn erro_api(valor: &Value, fallback: &str) -> String {
    valor
        .get("error")
        .and_then(|item| {
            item.get("message")
                .or_else(|| item.get("description"))
                .or_else(|| item.get("code"))
        })
        .or_else(|| valor.get("error_description"))
        .or_else(|| valor.get("message"))
        .and_then(|item| {
            item.as_str()
                .map(str::to_owned)
                .or_else(|| Some(item.to_string()))
        })
        .unwrap_or_else(|| fallback.to_owned())
}

fn mapear_envio(linha: &Row<'_>) -> rusqlite::Result<EnvioPublicacaoSocial> {
    Ok(EnvioPublicacaoSocial {
        id: linha.get(0)?,
        publicacao_id: linha.get(1)?,
        provedor: linha.get(2)?,
        status: linha.get(3)?,
        progresso: linha.get::<_, i64>(4)?.clamp(0, 100) as u32,
        tentativas: linha.get::<_, i64>(5)?.max(0) as u32,
        max_tentativas: linha.get::<_, i64>(6)?.max(1) as u32,
        proxima_tentativa_em: linha
            .get::<_, Option<i64>>(7)?
            .map(|valor| valor.max(0) as u64),
        bytes_enviados: linha.get::<_, i64>(8)?.max(0) as u64,
        bytes_totais: linha.get::<_, i64>(9)?.max(0) as u64,
        remoto_id: linha.get(10)?,
        link: linha.get(11)?,
        ativo_temporario_id: linha.get(12)?,
        criado_em: linha.get::<_, i64>(13)?.max(0) as u64,
        atualizado_em: linha.get::<_, i64>(14)?.max(0) as u64,
        mensagem: linha.get(15)?,
        correlacao_id: linha.get(16)?,
    })
}

fn consultar_envio(app: &AppHandle, id: &str) -> Result<EnvioPublicacaoSocial, String> {
    abrir_banco(app)?
        .query_row(
            "SELECT id, publicacao_id, provedor, status, progresso, tentativas, max_tentativas, proxima_tentativa_em, bytes_enviados, bytes_totais, remoto_id, link, ativo_temporario_id, criado_em, atualizado_em, mensagem, correlacao_id FROM fila_publicacao_v2 WHERE id=?1",
            params![id],
            mapear_envio,
        )
        .map_err(|erro| format!("Envio não encontrado: {erro}"))
}

fn atualizar_envio(
    app: &AppHandle,
    id: &str,
    status: &str,
    progresso: u32,
    tentativa: u32,
    proxima_tentativa_em: Option<u64>,
    bytes_enviados: u64,
    bytes_totais: u64,
    mensagem: &str,
) -> Result<(), String> {
    abrir_banco(app)?
        .execute(
            "UPDATE fila_publicacao_v2 SET status=?2, progresso=?3, tentativas=?4, proxima_tentativa_em=?5, bytes_enviados=?6, bytes_totais=?7, atualizado_em=?8, mensagem=?9 WHERE id=?1",
            params![
                id,
                status,
                progresso.clamp(0, 100) as i64,
                tentativa as i64,
                proxima_tentativa_em.map(|valor| valor as i64),
                bytes_enviados as i64,
                bytes_totais as i64,
                agora_millis() as i64,
                mensagem,
            ],
        )
        .map_err(|erro| format!("Falha ao atualizar envio: {erro}"))?;
    Ok(())
}

fn registrar_sessao_upload(
    app: &AppHandle,
    id: &str,
    sessao: Option<&str>,
    ativo_temporario_id: Option<&str>,
) -> Result<(), String> {
    abrir_banco(app)?
        .execute(
            "UPDATE fila_publicacao_v2 SET sessao_upload_url=COALESCE(?2, sessao_upload_url), ativo_temporario_id=COALESCE(?3, ativo_temporario_id), atualizado_em=?4 WHERE id=?1",
            params![id, sessao, ativo_temporario_id, agora_millis() as i64],
        )
        .map_err(|erro| format!("Falha ao persistir sessão de upload: {erro}"))?;
    Ok(())
}

fn concluir_envio(
    app: &AppHandle,
    id: &str,
    resultado: &ResultadoPublicacao,
) -> Result<(), String> {
    abrir_banco(app)?
        .execute(
            "UPDATE fila_publicacao_v2 SET status='publicada', progresso=100, proxima_tentativa_em=NULL, remoto_id=?2, link=?3, ativo_temporario_id=COALESCE(?4, ativo_temporario_id), atualizado_em=?5, mensagem='Publicação confirmada pela plataforma.' WHERE id=?1",
            params![
                id,
                resultado.remoto_id,
                resultado.link,
                resultado.ativo_temporario.as_ref().map(|item| item.id.as_str()),
                agora_millis() as i64,
            ],
        )
        .map_err(|erro| format!("Falha ao concluir envio: {erro}"))?;
    Ok(())
}

fn confirmar_nao_cancelado(cancelamento: &AtomicBool) -> Result<(), String> {
    if cancelamento.load(Ordering::SeqCst) {
        Err("Envio cancelado pelo usuário.".to_owned())
    } else {
        Ok(())
    }
}

fn range_recebido(cabecalhos: &HeaderMap) -> Option<u64> {
    cabecalhos
        .get("Range")
        .and_then(|valor| valor.to_str().ok())
        .and_then(|valor| valor.rsplit('-').next())
        .and_then(|valor| valor.parse::<u64>().ok())
        .map(|ultimo| ultimo.saturating_add(1))
}

fn publicar_youtube(
    app: &AppHandle,
    id: &str,
    cliente: &Client,
    token: &TokenCanal,
    entrada: &EntradaPublicacaoSocial,
    cancelamento: &AtomicBool,
    tentativa: u32,
) -> Result<ResultadoPublicacao, String> {
    let caminho = caminho_video(entrada)?;
    let total = fs::metadata(caminho)
        .map_err(|erro| format!("Falha ao inspecionar vídeo: {erro}"))?
        .len();
    let privacidade = match entrada.privacidade.as_deref() {
        Some("privada") => "private",
        Some("nao-listada") => "unlisted",
        _ => "public",
    };
    let metadados = json!({
        "snippet": {
            "title": entrada.titulo,
            "description": legenda(entrada),
            "categoryId": "22"
        },
        "status": {
            "privacyStatus": privacidade,
            "selfDeclaredMadeForKids": false
        }
    });

    let conexao = abrir_banco(app)?;
    let sessao_existente: Option<String> = conexao
        .query_row(
            "SELECT sessao_upload_url FROM fila_publicacao_v2 WHERE id=?1",
            params![id],
            |linha| linha.get(0),
        )
        .optional()
        .map_err(|erro| erro.to_string())?
        .flatten();
    drop(conexao);

    let sessao = if let Some(sessao) = sessao_existente.filter(|valor| !valor.is_empty()) {
        sessao
    } else {
        let resposta = cliente
            .post("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status")
            .bearer_auth(&token.access_token)
            .header(header::CONTENT_TYPE, "application/json; charset=UTF-8")
            .header("X-Upload-Content-Type", "video/mp4")
            .header("X-Upload-Content-Length", total.to_string())
            .json(&metadados)
            .send()
            .map_err(|erro| format!("Falha ao iniciar sessão retomável do YouTube: {erro}"))?;
        if !resposta.status().is_success() {
            let status = resposta.status();
            let valor: Value = resposta.json().unwrap_or(Value::Null);
            return Err(format!(
                "O YouTube recusou a sessão de upload ({status}): {}",
                erro_api(&valor, "sessão não criada")
            ));
        }
        let sessao = resposta
            .headers()
            .get(header::LOCATION)
            .and_then(|valor| valor.to_str().ok())
            .ok_or_else(|| "O YouTube não retornou a URL da sessão retomável.".to_owned())?
            .to_owned();
        registrar_sessao_upload(app, id, Some(&sessao), None)?;
        sessao
    };

    let mut inicio = consultar_envio(app, id)?.bytes_enviados.min(total);
    if !sessao.is_empty() {
        let consulta = cliente
            .put(&sessao)
            .bearer_auth(&token.access_token)
            .header(header::CONTENT_LENGTH, "0")
            .header(header::CONTENT_RANGE, format!("bytes */{total}"))
            .send();
        if let Ok(resposta) = consulta {
            if resposta.status().as_u16() == 308 {
                inicio = range_recebido(resposta.headers()).unwrap_or(inicio);
            } else if resposta.status().is_success() {
                let valor: Value = resposta.json().unwrap_or(Value::Null);
                if let Some(remoto_id) = valor.get("id").and_then(Value::as_str) {
                    return Ok(ResultadoPublicacao {
                        remoto_id: remoto_id.to_owned(),
                        link: Some(format!("https://www.youtube.com/watch?v={remoto_id}")),
                        ativo_temporario: None,
                    });
                }
            }
        }
    }

    let mut arquivo = File::open(caminho)
        .map_err(|erro| format!("Falha ao abrir vídeo para o YouTube: {erro}"))?;
    while inicio < total {
        confirmar_nao_cancelado(cancelamento)?;
        let fim_exclusivo = (inicio + BLOCO_YOUTUBE).min(total);
        let tamanho = (fim_exclusivo - inicio) as usize;
        arquivo
            .seek(SeekFrom::Start(inicio))
            .map_err(|erro| format!("Falha ao retomar leitura do vídeo: {erro}"))?;
        let mut bloco = vec![0_u8; tamanho];
        arquivo
            .read_exact(&mut bloco)
            .map_err(|erro| format!("Falha ao ler bloco do vídeo: {erro}"))?;
        let resposta = cliente
            .put(&sessao)
            .bearer_auth(&token.access_token)
            .header(header::CONTENT_TYPE, "video/mp4")
            .header(header::CONTENT_LENGTH, tamanho.to_string())
            .header(
                header::CONTENT_RANGE,
                format!("bytes {}-{}/{}", inicio, fim_exclusivo - 1, total),
            )
            .body(bloco)
            .send()
            .map_err(|erro| format!("Falha ao enviar bloco ao YouTube: {erro}"))?;
        let status = resposta.status();
        if status.as_u16() == 308 {
            inicio = range_recebido(resposta.headers()).unwrap_or(fim_exclusivo);
            let percentual = 10 + ((inicio.saturating_mul(75) / total).min(75) as u32);
            atualizar_envio(
                app,
                id,
                "enviando",
                percentual,
                tentativa,
                None,
                inicio,
                total,
                "Upload retomável do YouTube em andamento.",
            )?;
            continue;
        }
        let valor: Value = resposta.json().unwrap_or(Value::Null);
        if status.is_success() {
            let remoto_id = valor
                .get("id")
                .and_then(Value::as_str)
                .ok_or_else(|| "O YouTube não retornou o identificador do vídeo.".to_owned())?
                .to_owned();
            return Ok(ResultadoPublicacao {
                link: Some(format!("https://www.youtube.com/watch?v={remoto_id}")),
                remoto_id,
                ativo_temporario: None,
            });
        }
        return Err(format!(
            "O YouTube recusou um bloco ({status}): {}",
            erro_api(&valor, "upload interrompido")
        ));
    }
    Err("O YouTube encerrou o upload sem confirmar o vídeo.".to_owned())
}

fn publicar_instagram(
    app: &AppHandle,
    cofre: &EstadoCofre,
    id: &str,
    cliente: &Client,
    token: &TokenCanal,
    entrada: &EntradaPublicacaoSocial,
    cancelamento: Arc<AtomicBool>,
    tentativa: u32,
) -> Result<ResultadoPublicacao, String> {
    confirmar_nao_cancelado(&cancelamento)?;
    let conta_id = entrada
        .conta_id
        .as_deref()
        .filter(|valor| !valor.trim().is_empty())
        .or_else(|| (!token.account_id.is_empty()).then_some(token.account_id.as_str()))
        .ok_or_else(|| "Informe o ID da conta profissional do Instagram.".to_owned())?;

    let mut ativo_temporario = None;
    let media_url = if let Some(url) = entrada
        .media_url
        .as_deref()
        .filter(|valor| valor.starts_with("https://"))
    {
        url.to_owned()
    } else if entrada.hospedar_temporariamente.unwrap_or(true) {
        let caminho = caminho_video(entrada)?;
        let correlacao = consultar_envio(app, id)?.correlacao_id;
        let ativo = hospedar_video_temporario(
            app,
            cofre,
            caminho,
            &correlacao,
            cancelamento.clone(),
            &mut |percentual, enviados, total, mensagem| {
                let progresso = 5 + (percentual.saturating_mul(35) / 100);
                let _ = atualizar_envio(
                    app,
                    id,
                    "hospedando",
                    progresso,
                    tentativa,
                    None,
                    enviados,
                    total,
                    mensagem,
                );
            },
        )?;
        registrar_sessao_upload(app, id, None, Some(&ativo.id))?;
        let url = ativo.url_publica.clone();
        ativo_temporario = Some(ativo);
        url
    } else {
        return Err("Informe uma URL HTTPS ou ative a hospedagem temporária.".to_owned());
    };

    atualizar_envio(
        app,
        id,
        "processando",
        45,
        tentativa,
        None,
        0,
        0,
        "Criando contêiner do Reel no Instagram.",
    )?;
    let texto_legenda = legenda(entrada);
    let resposta = cliente
        .post(format!(
            "https://graph.instagram.com/v23.0/{conta_id}/media"
        ))
        .form(&[
            ("media_type", "REELS"),
            ("video_url", media_url.as_str()),
            ("caption", texto_legenda.as_str()),
            ("access_token", token.access_token.as_str()),
        ])
        .send()
        .map_err(|erro| format!("Falha ao criar contêiner do Instagram: {erro}"))?;
    let status = resposta.status();
    let valor: Value = resposta.json().unwrap_or(Value::Null);
    if !status.is_success() {
        return Err(erro_api(&valor, "O Instagram não criou o contêiner."));
    }
    let creation_id = valor
        .get("id")
        .and_then(Value::as_str)
        .ok_or_else(|| "O Instagram não retornou o ID do contêiner.".to_owned())?
        .to_owned();

    for ciclo in 0..90_u32 {
        confirmar_nao_cancelado(&cancelamento)?;
        let resposta = cliente
            .get(format!(
                "https://graph.instagram.com/v23.0/{creation_id}?fields=status_code,status&access_token={}",
                token.access_token
            ))
            .send()
            .map_err(|erro| format!("Falha ao consultar processamento do Reel: {erro}"))?;
        let valor: Value = resposta.json().unwrap_or(Value::Null);
        let status_code = valor
            .get("status_code")
            .and_then(Value::as_str)
            .unwrap_or("IN_PROGRESS");
        match status_code {
            "FINISHED" => break,
            "ERROR" | "EXPIRED" => {
                return Err(erro_api(
                    &valor,
                    "O Instagram não conseguiu processar o Reel.",
                ));
            }
            _ => {
                let progresso = 50 + ((ciclo.min(70) * 30) / 70);
                atualizar_envio(
                    app,
                    id,
                    "processando",
                    progresso,
                    tentativa,
                    None,
                    0,
                    0,
                    "Instagram processando o contêiner do Reel.",
                )?;
                thread::sleep(Duration::from_secs(5));
            }
        }
        if ciclo == 89 {
            return Err("O Instagram excedeu o tempo de processamento do Reel.".to_owned());
        }
    }

    let resposta = cliente
        .post(format!(
            "https://graph.instagram.com/v23.0/{conta_id}/media_publish"
        ))
        .form(&[
            ("creation_id", creation_id.as_str()),
            ("access_token", token.access_token.as_str()),
        ])
        .send()
        .map_err(|erro| format!("Falha ao publicar Reel: {erro}"))?;
    let status = resposta.status();
    let valor: Value = resposta.json().unwrap_or(Value::Null);
    if !status.is_success() {
        return Err(erro_api(&valor, "O Instagram não confirmou a publicação."));
    }
    let remoto_id = valor
        .get("id")
        .and_then(Value::as_str)
        .ok_or_else(|| "O Instagram não retornou o ID publicado.".to_owned())?
        .to_owned();
    Ok(ResultadoPublicacao {
        remoto_id,
        link: None,
        ativo_temporario,
    })
}

fn privacidade_tiktok(entrada: &EntradaPublicacaoSocial, opcoes: &[String]) -> String {
    let solicitada = match entrada.privacidade.as_deref() {
        Some("privada") => "SELF_ONLY",
        Some("amigos") => "MUTUAL_FOLLOW_FRIENDS",
        _ => "PUBLIC_TO_EVERYONE",
    };
    if opcoes.iter().any(|item| item == solicitada) {
        solicitada.to_owned()
    } else if opcoes.iter().any(|item| item == "SELF_ONLY") {
        "SELF_ONLY".to_owned()
    } else {
        opcoes
            .first()
            .cloned()
            .unwrap_or_else(|| "SELF_ONLY".to_owned())
    }
}

fn publicar_tiktok(
    app: &AppHandle,
    id: &str,
    cliente: &Client,
    token: &TokenCanal,
    entrada: &EntradaPublicacaoSocial,
    cancelamento: &AtomicBool,
    tentativa: u32,
) -> Result<ResultadoPublicacao, String> {
    if entrada.consentimento_tiktok != Some(true) {
        return Err("Confirme a autorização explícita para publicar no TikTok.".to_owned());
    }
    let caminho = caminho_video(entrada)?;
    let total = fs::metadata(caminho)
        .map_err(|erro| format!("Falha ao inspecionar vídeo: {erro}"))?
        .len();
    if total == 0 {
        return Err("O vídeo do TikTok está vazio.".to_owned());
    }

    let criador = cliente
        .post("https://open.tiktokapis.com/v2/post/publish/creator_info/query/")
        .bearer_auth(&token.access_token)
        .json(&json!({}))
        .send()
        .map_err(|erro| format!("Falha ao consultar opções do criador TikTok: {erro}"))?;
    let status_criador = criador.status();
    let valor_criador: Value = criador.json().unwrap_or(Value::Null);
    if !status_criador.is_success() {
        return Err(erro_api(
            &valor_criador,
            "O TikTok não retornou as opções de publicação do criador.",
        ));
    }
    let opcoes = valor_criador
        .pointer("/data/privacy_level_options")
        .and_then(Value::as_array)
        .map(|itens| {
            itens
                .iter()
                .filter_map(Value::as_str)
                .map(str::to_owned)
                .collect::<Vec<_>>()
        })
        .unwrap_or_else(|| vec!["SELF_ONLY".to_owned()]);
    let privacidade = privacidade_tiktok(entrada, &opcoes);

    let tamanho_bloco = if total <= 64 * 1024 * 1024 {
        total
    } else {
        BLOCO_TIKTOK
    };
    let total_blocos = total.div_ceil(tamanho_bloco);
    if total_blocos > 1_000 {
        return Err("O vídeo excede o número máximo de blocos aceito pelo TikTok.".to_owned());
    }
    let corpo = json!({
        "post_info": {
            "title": legenda(entrada),
            "privacy_level": privacidade,
            "disable_duet": !entrada.permitir_dueto.unwrap_or(false),
            "disable_comment": !entrada.permitir_comentarios.unwrap_or(true),
            "disable_stitch": !entrada.permitir_costura.unwrap_or(false),
            "video_cover_timestamp_ms": 1000
        },
        "source_info": {
            "source": "FILE_UPLOAD",
            "video_size": total,
            "chunk_size": tamanho_bloco,
            "total_chunk_count": total_blocos
        }
    });
    let resposta = cliente
        .post("https://open.tiktokapis.com/v2/post/publish/video/init/")
        .bearer_auth(&token.access_token)
        .json(&corpo)
        .send()
        .map_err(|erro| format!("Falha ao iniciar Direct Post: {erro}"))?;
    let status = resposta.status();
    let valor: Value = resposta.json().unwrap_or(Value::Null);
    if !status.is_success() {
        return Err(erro_api(&valor, "O TikTok recusou o Direct Post."));
    }
    let publish_id = valor
        .pointer("/data/publish_id")
        .and_then(Value::as_str)
        .ok_or_else(|| "O TikTok não retornou publish_id.".to_owned())?
        .to_owned();
    let upload_url = valor
        .pointer("/data/upload_url")
        .and_then(Value::as_str)
        .ok_or_else(|| "O TikTok não retornou upload_url.".to_owned())?
        .to_owned();
    registrar_sessao_upload(app, id, Some(&upload_url), None)?;

    let mut arquivo =
        File::open(caminho).map_err(|erro| format!("Falha ao abrir vídeo do TikTok: {erro}"))?;
    let mut inicio = 0_u64;
    while inicio < total {
        confirmar_nao_cancelado(cancelamento)?;
        let fim_exclusivo = (inicio + tamanho_bloco).min(total);
        let tamanho = (fim_exclusivo - inicio) as usize;
        arquivo
            .seek(SeekFrom::Start(inicio))
            .map_err(|erro| format!("Falha ao posicionar vídeo do TikTok: {erro}"))?;
        let mut bloco = vec![0_u8; tamanho];
        arquivo
            .read_exact(&mut bloco)
            .map_err(|erro| format!("Falha ao ler bloco do TikTok: {erro}"))?;
        let resposta = cliente
            .put(&upload_url)
            .header(header::CONTENT_TYPE, "video/mp4")
            .header(header::CONTENT_LENGTH, tamanho.to_string())
            .header(
                header::CONTENT_RANGE,
                format!("bytes {}-{}/{}", inicio, fim_exclusivo - 1, total),
            )
            .body(bloco)
            .send()
            .map_err(|erro| format!("Falha ao enviar bloco ao TikTok: {erro}"))?;
        let codigo = resposta.status();
        let ultimo = fim_exclusivo == total;
        if (!ultimo && codigo != StatusCode::PARTIAL_CONTENT)
            || (ultimo && !matches!(codigo.as_u16(), 200 | 201))
        {
            let valor: Value = resposta.json().unwrap_or(Value::Null);
            return Err(format!(
                "O TikTok recusou um bloco ({codigo}): {}",
                erro_api(&valor, "bloco rejeitado")
            ));
        }
        inicio = fim_exclusivo;
        let progresso = 10 + ((inicio.saturating_mul(70) / total).min(70) as u32);
        atualizar_envio(
            app,
            id,
            "enviando",
            progresso,
            tentativa,
            None,
            inicio,
            total,
            "Upload direto do TikTok em andamento.",
        )?;
    }

    for ciclo in 0..90_u32 {
        confirmar_nao_cancelado(cancelamento)?;
        let resposta = cliente
            .post("https://open.tiktokapis.com/v2/post/publish/status/fetch/")
            .bearer_auth(&token.access_token)
            .json(&json!({ "publish_id": &publish_id }))
            .send()
            .map_err(|erro| format!("Falha ao consultar publicação TikTok: {erro}"))?;
        let valor: Value = resposta.json().unwrap_or(Value::Null);
        let status = valor
            .pointer("/data/status")
            .and_then(Value::as_str)
            .unwrap_or("PROCESSING_UPLOAD");
        match status {
            "PUBLISH_COMPLETE" | "SEND_TO_USER_INBOX" => {
                return Ok(ResultadoPublicacao {
                    remoto_id: publish_id,
                    link: None,
                    ativo_temporario: None,
                });
            }
            "FAILED" => {
                return Err(erro_api(
                    &valor,
                    "O TikTok informou falha no processamento.",
                ));
            }
            _ => {
                atualizar_envio(
                    app,
                    id,
                    "processando",
                    82 + ciclo.min(12),
                    tentativa,
                    None,
                    total,
                    total,
                    "TikTok processando a publicação.",
                )?;
                thread::sleep(Duration::from_secs(5));
            }
        }
    }
    Err("O TikTok excedeu o tempo de processamento da publicação.".to_owned())
}

fn executar_tentativa(
    app: &AppHandle,
    cofre: &EstadoCofre,
    id: &str,
    entrada: &EntradaPublicacaoSocial,
    cancelamento: Arc<AtomicBool>,
    tentativa: u32,
) -> Result<ResultadoPublicacao, String> {
    confirmar_nao_cancelado(&cancelamento)?;
    let token = obter_token_valido(app, cofre, &entrada.provedor)?;
    let cliente = cliente_http()?;
    match entrada.provedor.as_str() {
        "youtube" => publicar_youtube(app, id, &cliente, &token, entrada, &cancelamento, tentativa),
        "instagram" => publicar_instagram(
            app,
            cofre,
            id,
            &cliente,
            &token,
            entrada,
            cancelamento,
            tentativa,
        ),
        "tiktok" => publicar_tiktok(app, id, &cliente, &token, entrada, &cancelamento, tentativa),
        _ => Err("Canal de publicação não reconhecido.".to_owned()),
    }
}

fn processar_envio(
    app: AppHandle,
    cofre: EstadoCofre,
    cancelamentos: EstadoEnviosPublicacao,
    id: String,
    entrada: EntradaPublicacaoSocial,
    cancelamento: Arc<AtomicBool>,
) {
    let correlacao = consultar_envio(&app, &id)
        .map(|item| item.correlacao_id)
        .unwrap_or_else(|_| format!("publicacao-{id}"));
    let _ = registrar_log_interno(
        &app,
        "info",
        "publicacao",
        "publicacao.fila.iniciada",
        "Envio robusto iniciado.",
        &correlacao,
        json!({ "envioId": &id, "provedor": &entrada.provedor }),
    );

    let mut ultimo_erro = String::new();
    for tentativa in 1..=MAX_TENTATIVAS {
        if cancelamento.load(Ordering::SeqCst) {
            let _ = atualizar_envio(
                &app,
                &id,
                "cancelada",
                100,
                tentativa,
                None,
                0,
                0,
                "Envio cancelado pelo usuário.",
            );
            break;
        }
        let _ = atualizar_envio(
            &app,
            &id,
            "preparando",
            5,
            tentativa,
            None,
            0,
            0,
            &format!("Preparando tentativa {tentativa} de {MAX_TENTATIVAS}."),
        );
        match executar_tentativa(&app, &cofre, &id, &entrada, cancelamento.clone(), tentativa) {
            Ok(resultado) => {
                let _ = concluir_envio(&app, &id, &resultado);
                if let Some(ativo) = resultado.ativo_temporario.as_ref() {
                    let limpeza_automatica = carregar_configuracao_armazenamento(&app, &cofre)
                        .map(|configuracao| configuracao.limpeza_automatica)
                        .unwrap_or(false);
                    if limpeza_automatica {
                        let _ = remover_ativo_temporario_interno(&app, &cofre, ativo);
                    }
                }
                let _ = registrar_log_interno(
                    &app,
                    "info",
                    "publicacao",
                    "publicacao.fila.concluida",
                    "Publicação robusta confirmada.",
                    &correlacao,
                    json!({ "envioId": &id, "provedor": &entrada.provedor, "tentativa": tentativa }),
                );
                ultimo_erro.clear();
                break;
            }
            Err(erro) => {
                ultimo_erro = erro;
                if cancelamento.load(Ordering::SeqCst) {
                    let _ = atualizar_envio(
                        &app,
                        &id,
                        "cancelada",
                        100,
                        tentativa,
                        None,
                        0,
                        0,
                        "Envio cancelado pelo usuário.",
                    );
                    break;
                }
                if tentativa < MAX_TENTATIVAS {
                    let espera = 2_u64.pow(tentativa);
                    let proxima = agora_millis().saturating_add(espera * 1_000);
                    let _ = atualizar_envio(
                        &app,
                        &id,
                        "aguardando-nova-tentativa",
                        3,
                        tentativa,
                        Some(proxima),
                        0,
                        0,
                        &format!("Falha temporária. Nova tentativa em {espera}s: {ultimo_erro}"),
                    );
                    thread::sleep(Duration::from_secs(espera));
                }
            }
        }
    }

    if !ultimo_erro.is_empty() && !cancelamento.load(Ordering::SeqCst) {
        let _ = atualizar_envio(
            &app,
            &id,
            "falha",
            100,
            MAX_TENTATIVAS,
            None,
            0,
            0,
            &ultimo_erro,
        );
        let _ = registrar_log_interno(
            &app,
            "error",
            "publicacao",
            "publicacao.fila.falhou",
            "A fila esgotou as tentativas de publicação.",
            &correlacao,
            json!({ "envioId": &id, "provedor": &entrada.provedor, "erro": &ultimo_erro }),
        );
    }
    if let Ok(mut mapa) = cancelamentos.0.lock() {
        mapa.remove(&id);
    };
}

fn enfileirar(
    app: AppHandle,
    cofre: EstadoCofre,
    cancelamentos: EstadoEnviosPublicacao,
    entrada: EntradaPublicacaoSocial,
) -> Result<EnvioPublicacaoSocial, String> {
    let agora = agora_millis();
    let id = format!("envio-v2-{agora}-{}", rand::random::<u32>());
    let correlacao_id = format!("publicacao-{agora}-{}", rand::random::<u32>());
    let entrada_json = serde_json::to_string(&entrada)
        .map_err(|erro| format!("Falha ao preparar envio: {erro}"))?;
    abrir_banco(&app)?
        .execute(
            "INSERT INTO fila_publicacao_v2 (id, publicacao_id, provedor, status, progresso, tentativas, max_tentativas, proxima_tentativa_em, sessao_upload_url, bytes_enviados, bytes_totais, remoto_id, link, ativo_temporario_id, criado_em, atualizado_em, mensagem, correlacao_id, entrada_json, cancelado) VALUES (?1, ?2, ?3, 'na-fila', 0, 0, ?4, NULL, NULL, 0, 0, NULL, NULL, NULL, ?5, ?5, 'Envio adicionado à fila robusta.', ?6, ?7, 0)",
            params![
                id,
                entrada.publicacao_id,
                entrada.provedor,
                MAX_TENTATIVAS as i64,
                agora as i64,
                correlacao_id,
                entrada_json,
            ],
        )
        .map_err(|erro| format!("Falha ao criar fila de publicação: {erro}"))?;
    let cancelamento = Arc::new(AtomicBool::new(false));
    cancelamentos
        .0
        .lock()
        .map_err(|_| "Fila de cancelamento indisponível.".to_owned())?
        .insert(id.clone(), cancelamento.clone());
    let app_thread = app.clone();
    let cofre_thread = cofre.clone();
    let cancelamentos_thread = cancelamentos.clone();
    let id_thread = id.clone();
    thread::spawn(move || {
        processar_envio(
            app_thread,
            cofre_thread,
            cancelamentos_thread,
            id_thread,
            entrada,
            cancelamento,
        );
    });
    consultar_envio(&app, &id)
}

#[tauri::command]
pub fn publicar_conteudo_social(
    app: AppHandle,
    cofre: State<'_, EstadoCofre>,
    cancelamentos: State<'_, EstadoEnviosPublicacao>,
    entrada: EntradaPublicacaoSocial,
) -> Result<EnvioPublicacaoSocial, String> {
    enfileirar(
        app,
        cofre.inner().clone(),
        cancelamentos.inner().clone(),
        entrada,
    )
}

#[tauri::command]
pub fn listar_envios_publicacao(app: AppHandle) -> Result<Vec<EnvioPublicacaoSocial>, String> {
    let conexao = abrir_banco(&app)?;
    let mut consulta = conexao
        .prepare("SELECT id, publicacao_id, provedor, status, progresso, tentativas, max_tentativas, proxima_tentativa_em, bytes_enviados, bytes_totais, remoto_id, link, ativo_temporario_id, criado_em, atualizado_em, mensagem, correlacao_id FROM fila_publicacao_v2 ORDER BY atualizado_em DESC LIMIT 200")
        .map_err(|erro| erro.to_string())?;
    let linhas = consulta
        .query_map([], mapear_envio)
        .map_err(|erro| erro.to_string())?;
    linhas
        .collect::<Result<Vec<_>, _>>()
        .map_err(|erro| erro.to_string())
}

#[tauri::command]
pub fn cancelar_envio_publicacao(
    app: AppHandle,
    cancelamentos: State<'_, EstadoEnviosPublicacao>,
    envio_id: String,
) -> Result<bool, String> {
    if let Ok(mapa) = cancelamentos.0.lock() {
        if let Some(sinal) = mapa.get(&envio_id) {
            sinal.store(true, Ordering::SeqCst);
        }
    }
    abrir_banco(&app)?
        .execute(
            "UPDATE fila_publicacao_v2 SET cancelado=1, status=CASE WHEN status IN ('publicada','falha') THEN status ELSE 'cancelando' END, atualizado_em=?2, mensagem='Cancelamento solicitado pelo usuário.' WHERE id=?1",
            params![envio_id, agora_millis() as i64],
        )
        .map_err(|erro| erro.to_string())?;
    Ok(true)
}

#[tauri::command]
pub fn repetir_envio_publicacao(
    app: AppHandle,
    cofre: State<'_, EstadoCofre>,
    cancelamentos: State<'_, EstadoEnviosPublicacao>,
    envio_id: String,
) -> Result<EnvioPublicacaoSocial, String> {
    let entrada_json: String = abrir_banco(&app)?
        .query_row(
            "SELECT entrada_json FROM fila_publicacao_v2 WHERE id=?1",
            params![envio_id],
            |linha| linha.get(0),
        )
        .map_err(|_| "Envio original não encontrado.".to_owned())?;
    let entrada: EntradaPublicacaoSocial = serde_json::from_str(&entrada_json)
        .map_err(|erro| format!("Dados do envio original inválidos: {erro}"))?;
    enfileirar(
        app,
        cofre.inner().clone(),
        cancelamentos.inner().clone(),
        entrada,
    )
}

pub(crate) fn recuperar_envios_interrompidos(app: &AppHandle) -> Result<u64, String> {
    let alterados = abrir_banco(app)?
        .execute(
            "UPDATE fila_publicacao_v2 SET status='interrompida', proxima_tentativa_em=NULL, atualizado_em=?1, mensagem='O aplicativo foi encerrado durante o envio. Use Repetir para retomar com segurança.' WHERE status IN ('na-fila','preparando','hospedando','enviando','processando','aguardando-nova-tentativa','cancelando')",
            params![agora_millis() as i64],
        )
        .map_err(|erro| format!("Falha ao recuperar fila interrompida: {erro}"))?;
    Ok(alterados as u64)
}

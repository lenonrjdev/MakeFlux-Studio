use std::{
    collections::HashMap,
    io::{Read, Write},
    net::TcpListener,
    sync::Arc,
    thread,
    time::Duration,
};

use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use rand::{rngs::OsRng, RngCore};
use reqwest::blocking::Client;
use rusqlite::{params, Row};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sha2::{Digest, Sha256};
use tauri::{AppHandle, State};
use tauri_plugin_opener::OpenerExt;
use url::Url;

use crate::{
    commands::{
        cofre::{ler_segredo_interno, remover_segredo_interno, salvar_segredo_interno},
        dados::{abrir_banco, agora_millis},
        observabilidade::registrar_log_interno,
    },
    state::{EstadoCofre, EstadoOauthPublicacao, SessaoOauthPendente},
};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EntradaInicioOauth {
    pub provedor: String,
    pub client_id: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InicioOauthPublicacao {
    pub sessao_id: String,
    pub provedor: String,
    pub url_autorizacao: String,
    pub redirect_uri: String,
    pub expira_em: u64,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EntradaConclusaoOauth {
    pub sessao_id: String,
    pub client_id: String,
    pub client_secret: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConexaoCanalPublicacao {
    pub provedor: String,
    pub conta_id: String,
    pub conta_nome: String,
    pub escopos: Vec<String>,
    pub status: String,
    pub expira_em: Option<u64>,
    pub conectada_em: u64,
    pub atualizada_em: u64,
    pub detalhes: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ResultadoOauthPublicacao {
    pub concluido: bool,
    pub pendente: bool,
    pub mensagem: String,
    pub conexao: Option<ConexaoCanalPublicacao>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub(crate) struct TokenCanal {
    pub access_token: String,
    pub refresh_token: Option<String>,
    pub token_type: String,
    pub expires_at: Option<u64>,
    pub account_id: String,
    pub scopes: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct CredenciaisOauthCanal {
    client_id: String,
    client_secret: Option<String>,
}

fn token_aleatorio(bytes: usize) -> String {
    let mut dados = vec![0_u8; bytes];
    OsRng.fill_bytes(&mut dados);
    URL_SAFE_NO_PAD.encode(dados)
}

fn configuracao_provedor(
    provedor: &str,
) -> Result<(&'static str, &'static str, Vec<&'static str>), String> {
    match provedor {
        "youtube" => Ok((
            "https://accounts.google.com/o/oauth2/v2/auth",
            "https://oauth2.googleapis.com/token",
            vec![
                "https://www.googleapis.com/auth/youtube.upload",
                "https://www.googleapis.com/auth/youtube.readonly",
            ],
        )),
        "instagram" => Ok((
            "https://www.instagram.com/oauth/authorize",
            "https://api.instagram.com/oauth/access_token",
            vec![
                "instagram_business_basic",
                "instagram_business_content_publish",
            ],
        )),
        "tiktok" => Ok((
            "https://www.tiktok.com/v2/auth/authorize/",
            "https://open.tiktokapis.com/v2/oauth/token/",
            vec!["user.info.basic", "video.publish", "video.upload"],
        )),
        _ => Err("Provedor de publicação não reconhecido.".to_owned()),
    }
}

fn responder_callback(mut fluxo: std::net::TcpStream, sucesso: bool) {
    let corpo = if sucesso {
        "<!doctype html><html><body style='font-family:sans-serif;padding:40px'><h2>Autorização recebida</h2><p>Você já pode voltar ao MakeFlux Studio.</p></body></html>"
    } else {
        "<!doctype html><html><body style='font-family:sans-serif;padding:40px'><h2>Não foi possível autorizar</h2><p>Volte ao MakeFlux Studio para consultar os detalhes.</p></body></html>"
    };
    let resposta = format!(
        "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",
        corpo.len(), corpo
    );
    let _ = fluxo.write_all(resposta.as_bytes());
}

fn iniciar_listener(
    listener: TcpListener,
    sessoes: Arc<std::sync::Mutex<HashMap<String, SessaoOauthPendente>>>,
    sessao_id: String,
) {
    let _ = listener.set_nonblocking(true);
    thread::spawn(move || {
        for _ in 0..3_000 {
            match listener.accept() {
                Ok((mut fluxo, _)) => {
                    let mut buffer = [0_u8; 8192];
                    let lidos = fluxo.read(&mut buffer).unwrap_or_default();
                    let requisicao = String::from_utf8_lossy(&buffer[..lidos]);
                    let caminho = requisicao
                        .lines()
                        .next()
                        .and_then(|linha| linha.split_whitespace().nth(1))
                        .unwrap_or("/");
                    let analisada = Url::parse(&format!("http://127.0.0.1{caminho}"));
                    let mut codigo = None;
                    let mut erro = None;
                    let mut state_recebido = None;
                    if let Ok(url) = analisada {
                        for (chave, valor) in url.query_pairs() {
                            match chave.as_ref() {
                                "code" => codigo = Some(valor.into_owned()),
                                "error" | "error_description" => erro = Some(valor.into_owned()),
                                "state" => state_recebido = Some(valor.into_owned()),
                                _ => {}
                            }
                        }
                    }
                    let mut sucesso = false;
                    if let Ok(mut bloqueio) = sessoes.lock() {
                        if let Some(sessao) = bloqueio.get_mut(&sessao_id) {
                            if state_recebido.as_deref() == Some(sessao.state.as_str()) {
                                sessao.codigo = codigo;
                                sessao.erro = erro;
                                sucesso = sessao.codigo.is_some();
                            } else {
                                sessao.erro = Some(
                                    "O estado OAuth retornado não corresponde à sessão iniciada."
                                        .to_owned(),
                                );
                            }
                        }
                    }
                    responder_callback(fluxo, sucesso);
                    return;
                }
                Err(erro) if erro.kind() == std::io::ErrorKind::WouldBlock => {
                    thread::sleep(Duration::from_millis(100))
                }
                Err(_) => return,
            }
        }
    });
}

#[tauri::command]
pub fn iniciar_oauth_publicacao(
    app: AppHandle,
    estado: State<'_, EstadoOauthPublicacao>,
    entrada: EntradaInicioOauth,
) -> Result<InicioOauthPublicacao, String> {
    let client_id = entrada.client_id.trim();
    if client_id.is_empty() {
        return Err("Informe o Client ID do aplicativo.".to_owned());
    }
    let (autorizacao, _, escopos) = configuracao_provedor(&entrada.provedor)?;
    let listener = TcpListener::bind("127.0.0.1:47891")
        .map_err(|erro| format!("Falha ao preparar o retorno OAuth: {erro}"))?;
    let porta = listener
        .local_addr()
        .map_err(|erro| erro.to_string())?
        .port();
    let redirect_uri = format!("http://127.0.0.1:{porta}/oauth/callback");
    let sessao_id = format!("oauth-{}-{}", agora_millis(), token_aleatorio(8));
    let state = token_aleatorio(24);
    let verifier = token_aleatorio(48);
    let challenge = URL_SAFE_NO_PAD.encode(Sha256::digest(verifier.as_bytes()));
    let expira_em = agora_millis().saturating_add(300_000);
    let sessao = SessaoOauthPendente {
        provedor: entrada.provedor.clone(),
        state: state.clone(),
        verifier,
        redirect_uri: redirect_uri.clone(),
        codigo: None,
        erro: None,
        expira_em,
    };
    estado
        .0
        .lock()
        .map_err(|_| "Estado OAuth indisponível.".to_owned())?
        .insert(sessao_id.clone(), sessao);
    iniciar_listener(listener, estado.0.clone(), sessao_id.clone());

    let mut url = Url::parse(autorizacao).map_err(|erro| erro.to_string())?;
    {
        let mut pares = url.query_pairs_mut();
        pares
            .append_pair(
                if entrada.provedor == "tiktok" {
                    "client_key"
                } else {
                    "client_id"
                },
                client_id,
            )
            .append_pair("redirect_uri", &redirect_uri)
            .append_pair("response_type", "code")
            .append_pair("state", &state)
            .append_pair(
                "scope",
                &escopos.join(if entrada.provedor == "youtube" {
                    " "
                } else {
                    ","
                }),
            );
        if entrada.provedor != "instagram" {
            pares
                .append_pair("code_challenge", &challenge)
                .append_pair("code_challenge_method", "S256");
        }
        if entrada.provedor == "youtube" {
            pares
                .append_pair("access_type", "offline")
                .append_pair("prompt", "consent");
        }
    }
    app.opener()
        .open_url(url.as_str(), None::<&str>)
        .map_err(|erro| format!("Falha ao abrir o navegador: {erro}"))?;
    Ok(InicioOauthPublicacao {
        sessao_id,
        provedor: entrada.provedor,
        url_autorizacao: url.to_string(),
        redirect_uri,
        expira_em,
    })
}

fn cliente_oauth() -> Result<Client, String> {
    Client::builder()
        .timeout(Duration::from_secs(45))
        .build()
        .map_err(|erro| erro.to_string())
}

fn trocar_token(
    sessao: &SessaoOauthPendente,
    client_id: &str,
    client_secret: Option<&str>,
) -> Result<TokenCanal, String> {
    let (_, token_url, escopos) = configuracao_provedor(&sessao.provedor)?;
    let codigo = sessao
        .codigo
        .as_deref()
        .ok_or_else(|| "O código OAuth ainda não foi recebido.".to_owned())?;
    let mut formulario: Vec<(&str, String)> = vec![
        (
            if sessao.provedor == "tiktok" {
                "client_key"
            } else {
                "client_id"
            },
            client_id.to_owned(),
        ),
        ("code", codigo.to_owned()),
        ("grant_type", "authorization_code".to_owned()),
        ("redirect_uri", sessao.redirect_uri.clone()),
    ];
    if sessao.provedor != "instagram" {
        formulario.push(("code_verifier", sessao.verifier.clone()));
    }
    if let Some(segredo) = client_secret.filter(|valor| !valor.trim().is_empty()) {
        formulario.push(("client_secret", segredo.to_owned()));
    }
    let resposta = cliente_oauth()?
        .post(token_url)
        .form(&formulario)
        .send()
        .map_err(|erro| format!("Falha ao trocar o código OAuth: {erro}"))?;
    let status = resposta.status();
    let valor: Value = resposta
        .json()
        .map_err(|erro| format!("Resposta OAuth inválida: {erro}"))?;
    if !status.is_success() {
        return Err(valor
            .get("error_description")
            .or_else(|| valor.get("message"))
            .and_then(Value::as_str)
            .unwrap_or("A plataforma recusou a troca do código OAuth.")
            .to_owned());
    }
    let access_token = valor
        .get("access_token")
        .and_then(Value::as_str)
        .ok_or_else(|| "A plataforma não retornou access_token.".to_owned())?
        .to_owned();
    let refresh_token = valor
        .get("refresh_token")
        .and_then(Value::as_str)
        .map(str::to_owned);
    let expires_at = valor
        .get("expires_in")
        .and_then(Value::as_u64)
        .map(|segundos| agora_millis().saturating_add(segundos * 1_000));
    let account_id = valor
        .get("open_id")
        .or_else(|| valor.get("user_id"))
        .and_then(|item| {
            item.as_str()
                .map(str::to_owned)
                .or_else(|| item.as_i64().map(|id| id.to_string()))
        })
        .unwrap_or_default();
    Ok(TokenCanal {
        access_token,
        refresh_token,
        token_type: valor
            .get("token_type")
            .and_then(Value::as_str)
            .unwrap_or("Bearer")
            .to_owned(),
        expires_at,
        account_id,
        scopes: escopos.into_iter().map(str::to_owned).collect(),
    })
}

fn mapear_conexao(linha: &Row<'_>) -> rusqlite::Result<ConexaoCanalPublicacao> {
    let escopos: String = linha.get(3)?;
    let expira_em = linha
        .get::<_, Option<i64>>(5)?
        .map(|valor| valor.max(0) as u64);
    let agora = agora_millis();
    let status_salvo: String = linha.get(4)?;
    let status = match expira_em {
        Some(expira) if expira <= agora => "expirada".to_owned(),
        Some(expira) if expira <= agora.saturating_add(3_600_000) => "atencao".to_owned(),
        _ => status_salvo,
    };
    Ok(ConexaoCanalPublicacao {
        provedor: linha.get(0)?,
        conta_id: linha.get(1)?,
        conta_nome: linha.get(2)?,
        escopos: serde_json::from_str(&escopos).unwrap_or_default(),
        status,
        expira_em,
        conectada_em: linha.get::<_, i64>(6)?.max(0) as u64,
        atualizada_em: linha.get::<_, i64>(7)?.max(0) as u64,
        detalhes: linha.get(8)?,
    })
}

fn salvar_token_e_conexao(
    app: &AppHandle,
    estado: &EstadoCofre,
    provedor: &str,
    token: &TokenCanal,
    mensagem: &str,
) -> Result<ConexaoCanalPublicacao, String> {
    salvar_segredo_interno(
        app,
        estado,
        &format!("oauth:{provedor}"),
        &serde_json::to_string(token).map_err(|erro| erro.to_string())?,
    )?;
    let agora = agora_millis();
    let conexao = ConexaoCanalPublicacao {
        provedor: provedor.to_owned(),
        conta_id: token.account_id.clone(),
        conta_nome: if token.account_id.is_empty() {
            "Conta autorizada".to_owned()
        } else {
            token.account_id.clone()
        },
        escopos: token.scopes.clone(),
        status: "conectada".to_owned(),
        expira_em: token.expires_at,
        conectada_em: agora,
        atualizada_em: agora,
        detalhes: mensagem.to_owned(),
    };
    let escopos_json = serde_json::to_string(&conexao.escopos).unwrap_or_default();
    abrir_banco(app)?
        .execute(
            r#"INSERT INTO conexoes_publicacao (provedor, conta_id, conta_nome, escopos, status, expira_em, conectada_em, atualizada_em, detalhes) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9) ON CONFLICT(provedor) DO UPDATE SET conta_id=excluded.conta_id, conta_nome=excluded.conta_nome, escopos=excluded.escopos, status=excluded.status, expira_em=excluded.expira_em, atualizada_em=excluded.atualizada_em, detalhes=excluded.detalhes"#,
            params![&conexao.provedor, &conexao.conta_id, &conexao.conta_nome, escopos_json, &conexao.status, conexao.expira_em.map(|valor| valor as i64), agora as i64, agora as i64, &conexao.detalhes],
        )
        .map_err(|erro| format!("Falha ao registrar a conexão: {erro}"))?;
    Ok(conexao)
}

#[tauri::command]
pub fn concluir_oauth_publicacao(
    app: AppHandle,
    estado_oauth: State<'_, EstadoOauthPublicacao>,
    estado_cofre: State<'_, EstadoCofre>,
    entrada: EntradaConclusaoOauth,
) -> Result<ResultadoOauthPublicacao, String> {
    let sessao = estado_oauth
        .0
        .lock()
        .map_err(|_| "Estado OAuth indisponível.".to_owned())?
        .get(&entrada.sessao_id)
        .cloned();
    let Some(sessao) = sessao else {
        return Ok(ResultadoOauthPublicacao {
            concluido: false,
            pendente: false,
            mensagem: "Sessão OAuth não encontrada ou já concluída.".to_owned(),
            conexao: None,
        });
    };
    if agora_millis() > sessao.expira_em {
        return Ok(ResultadoOauthPublicacao {
            concluido: false,
            pendente: false,
            mensagem: "A sessão OAuth expirou.".to_owned(),
            conexao: None,
        });
    }
    if let Some(erro) = sessao.erro.clone() {
        return Ok(ResultadoOauthPublicacao {
            concluido: false,
            pendente: false,
            mensagem: erro,
            conexao: None,
        });
    }
    if sessao.codigo.is_none() {
        return Ok(ResultadoOauthPublicacao {
            concluido: false,
            pendente: true,
            mensagem: "Aguardando autorização no navegador.".to_owned(),
            conexao: None,
        });
    }
    let token = trocar_token(
        &sessao,
        entrada.client_id.trim(),
        entrada.client_secret.as_deref(),
    )?;
    let credenciais = CredenciaisOauthCanal {
        client_id: entrada.client_id.trim().to_owned(),
        client_secret: entrada
            .client_secret
            .as_deref()
            .map(str::trim)
            .filter(|valor| !valor.is_empty())
            .map(str::to_owned),
    };
    salvar_segredo_interno(
        &app,
        estado_cofre.inner(),
        &format!("oauth-app:{}", sessao.provedor),
        &serde_json::to_string(&credenciais).map_err(|erro| erro.to_string())?,
    )?;
    let conexao = salvar_token_e_conexao(
        &app,
        estado_cofre.inner(),
        &sessao.provedor,
        &token,
        "Token e credenciais do aplicativo protegidos no cofre.",
    )?;
    estado_oauth
        .0
        .lock()
        .map_err(|_| "Estado OAuth indisponível.".to_owned())?
        .remove(&entrada.sessao_id);
    Ok(ResultadoOauthPublicacao {
        concluido: true,
        pendente: false,
        mensagem: "Conta conectada e renovação automática preparada.".to_owned(),
        conexao: Some(conexao),
    })
}

fn renovar_token(
    app: &AppHandle,
    estado: &EstadoCofre,
    provedor: &str,
    token_atual: &TokenCanal,
) -> Result<TokenCanal, String> {
    let cliente = cliente_oauth()?;
    let credenciais_texto = ler_segredo_interno(app, estado, &format!("oauth-app:{provedor}"))?;
    let credenciais: CredenciaisOauthCanal = serde_json::from_str(&credenciais_texto)
        .map_err(|erro| format!("Credenciais OAuth inválidas: {erro}"))?;
    let (resposta, usa_refresh_rotativo) = match provedor {
        "youtube" => {
            let refresh_token = token_atual.refresh_token.as_deref().ok_or_else(|| {
                "O YouTube não forneceu refresh token. Reconecte a conta com acesso offline."
                    .to_owned()
            })?;
            let mut formulario = vec![
                ("client_id", credenciais.client_id.clone()),
                ("refresh_token", refresh_token.to_owned()),
                ("grant_type", "refresh_token".to_owned()),
            ];
            if let Some(segredo) = credenciais.client_secret.clone() {
                formulario.push(("client_secret", segredo));
            }
            (
                cliente
                    .post("https://oauth2.googleapis.com/token")
                    .form(&formulario)
                    .send(),
                false,
            )
        }
        "tiktok" => {
            let refresh_token = token_atual.refresh_token.as_deref().ok_or_else(|| {
                "O TikTok não forneceu refresh token. Reconecte a conta.".to_owned()
            })?;
            let segredo = credenciais
                .client_secret
                .clone()
                .ok_or_else(|| "O Client Secret do TikTok não está no cofre.".to_owned())?;
            (
                cliente
                    .post("https://open.tiktokapis.com/v2/oauth/token/")
                    .form(&[
                        ("client_key", credenciais.client_id.clone()),
                        ("client_secret", segredo),
                        ("grant_type", "refresh_token".to_owned()),
                        ("refresh_token", refresh_token.to_owned()),
                    ])
                    .send(),
                true,
            )
        }
        "instagram" => (
            cliente
                .get("https://graph.instagram.com/refresh_access_token")
                .query(&[
                    ("grant_type", "ig_refresh_token"),
                    ("access_token", token_atual.access_token.as_str()),
                ])
                .send(),
            false,
        ),
        _ => return Err("Canal não reconhecido para renovação.".to_owned()),
    };
    let resposta = resposta.map_err(|erro| format!("Falha ao renovar token: {erro}"))?;
    let status = resposta.status();
    let valor: Value = resposta
        .json()
        .map_err(|erro| format!("Resposta de renovação inválida: {erro}"))?;
    if !status.is_success() {
        return Err(valor
            .get("error_description")
            .or_else(|| valor.get("message"))
            .or_else(|| valor.get("error").and_then(|item| item.get("message")))
            .and_then(Value::as_str)
            .unwrap_or("A plataforma recusou a renovação do token.")
            .to_owned());
    }
    let access_token = valor
        .get("access_token")
        .and_then(Value::as_str)
        .ok_or_else(|| "A renovação não retornou access_token.".to_owned())?
        .to_owned();
    let expires_at = valor
        .get("expires_in")
        .and_then(Value::as_u64)
        .map(|segundos| agora_millis().saturating_add(segundos * 1_000));
    let refresh_token = if usa_refresh_rotativo {
        valor
            .get("refresh_token")
            .and_then(Value::as_str)
            .map(str::to_owned)
            .or_else(|| token_atual.refresh_token.clone())
    } else {
        token_atual.refresh_token.clone()
    };
    Ok(TokenCanal {
        access_token,
        refresh_token,
        token_type: valor
            .get("token_type")
            .and_then(Value::as_str)
            .unwrap_or(token_atual.token_type.as_str())
            .to_owned(),
        expires_at: expires_at.or(token_atual.expires_at),
        account_id: valor
            .get("open_id")
            .and_then(Value::as_str)
            .map(str::to_owned)
            .unwrap_or_else(|| token_atual.account_id.clone()),
        scopes: valor
            .get("scope")
            .and_then(Value::as_str)
            .map(|escopos| escopos.split(',').map(str::to_owned).collect())
            .unwrap_or_else(|| token_atual.scopes.clone()),
    })
}

pub(crate) fn obter_token_valido(
    app: &AppHandle,
    estado: &EstadoCofre,
    provedor: &str,
) -> Result<TokenCanal, String> {
    let token_texto = ler_segredo_interno(app, estado, &format!("oauth:{provedor}"))?;
    let token: TokenCanal = serde_json::from_str(&token_texto)
        .map_err(|erro| format!("Token OAuth inválido: {erro}"))?;
    let margem = agora_millis().saturating_add(15 * 60 * 1_000);
    if token.expires_at.is_none_or(|expira| expira > margem) {
        return Ok(token);
    }
    let renovado = renovar_token(app, estado, provedor, &token)?;
    let _ = salvar_token_e_conexao(
        app,
        estado,
        provedor,
        &renovado,
        "Token renovado automaticamente pelo MakeFlux Studio.",
    )?;
    let _ = registrar_log_interno(
        app,
        "info",
        "publicacao",
        "oauth.token.renovado",
        "Token do canal renovado automaticamente.",
        &format!("oauth-{provedor}"),
        serde_json::json!({ "provedor": provedor, "expiraEm": renovado.expires_at }),
    );
    Ok(renovado)
}

#[tauri::command]
pub fn renovar_token_canal_publicacao(
    app: AppHandle,
    estado: State<'_, EstadoCofre>,
    provedor: String,
) -> Result<ConexaoCanalPublicacao, String> {
    let texto = ler_segredo_interno(&app, estado.inner(), &format!("oauth:{provedor}"))?;
    let token: TokenCanal =
        serde_json::from_str(&texto).map_err(|erro| format!("Token OAuth inválido: {erro}"))?;
    let renovado = renovar_token(&app, estado.inner(), &provedor, &token)?;
    salvar_token_e_conexao(
        &app,
        estado.inner(),
        &provedor,
        &renovado,
        "Token renovado manualmente.",
    )
}

#[tauri::command]
pub fn listar_conexoes_publicacao(app: AppHandle) -> Result<Vec<ConexaoCanalPublicacao>, String> {
    let conexao = abrir_banco(&app)?;
    let mut consulta = conexao
        .prepare("SELECT provedor, conta_id, conta_nome, escopos, status, expira_em, conectada_em, atualizada_em, detalhes FROM conexoes_publicacao ORDER BY provedor")
        .map_err(|erro| erro.to_string())?;
    let linhas = consulta
        .query_map([], mapear_conexao)
        .map_err(|erro| erro.to_string())?;
    linhas
        .collect::<Result<Vec<_>, _>>()
        .map_err(|erro| erro.to_string())
}

#[tauri::command]
pub fn desconectar_canal_publicacao(
    app: AppHandle,
    estado: State<'_, EstadoCofre>,
    provedor: String,
) -> Result<bool, String> {
    let identificador = provedor.trim();
    remover_segredo_interno(&app, estado.inner(), &format!("oauth:{identificador}"))?;
    let _ = remover_segredo_interno(&app, estado.inner(), &format!("oauth-app:{identificador}"));
    abrir_banco(&app)?
        .execute(
            "DELETE FROM conexoes_publicacao WHERE provedor = ?1",
            params![identificador],
        )
        .map_err(|erro| erro.to_string())?;
    Ok(true)
}

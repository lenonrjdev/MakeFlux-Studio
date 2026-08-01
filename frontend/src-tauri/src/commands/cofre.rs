use std::{
    collections::BTreeMap,
    fs,
    path::PathBuf,
    time::{SystemTime, UNIX_EPOCH},
};

use argon2::Argon2;
use base64::{engine::general_purpose::STANDARD, Engine};
use chacha20poly1305::{
    aead::{Aead, KeyInit},
    ChaCha20Poly1305, Key, Nonce,
};
use rand::{rngs::OsRng, RngCore};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, State};
use zeroize::Zeroize;

use crate::{
    models::{SegredoCofreResumo, StatusCofre},
    state::EstadoCofre,
};

#[derive(Debug, Serialize, Deserialize)]
struct ArquivoCofre {
    versao: u32,
    salt: String,
    nonce: String,
    conteudo: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct RegistroSegredo {
    valor: String,
    atualizado_em: u64,
}

fn agora_millis() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duracao| duracao.as_millis() as u64)
        .unwrap_or_default()
}

fn caminho_cofre(app: &AppHandle) -> Result<PathBuf, String> {
    let diretorio = app
        .path()
        .app_local_data_dir()
        .map_err(|erro| format!("Falha ao localizar os dados locais: {erro}"))?;
    fs::create_dir_all(&diretorio)
        .map_err(|erro| format!("Falha ao preparar o diretório do cofre: {erro}"))?;
    Ok(diretorio.join("makeflux-vault.json"))
}

fn derivar_chave(senha: &str, salt: &[u8]) -> Result<[u8; 32], String> {
    if senha.len() < 8 {
        return Err("A senha mestra deve possuir ao menos oito caracteres.".to_owned());
    }
    let mut chave = [0_u8; 32];
    Argon2::default()
        .hash_password_into(senha.as_bytes(), salt, &mut chave)
        .map_err(|erro| format!("Falha ao derivar a chave do cofre: {erro}"))?;
    Ok(chave)
}

fn criptografar(
    chave: &[u8; 32],
    salt: &[u8],
    dados: &BTreeMap<String, RegistroSegredo>,
) -> Result<ArquivoCofre, String> {
    let texto = serde_json::to_vec(dados).map_err(|erro| erro.to_string())?;
    let cifra = ChaCha20Poly1305::new(Key::from_slice(chave));
    let mut nonce = [0_u8; 12];
    let mut gerador = OsRng;
    gerador.fill_bytes(&mut nonce);
    let conteudo = cifra
        .encrypt(Nonce::from_slice(&nonce), texto.as_ref())
        .map_err(|_| "Falha ao criptografar o cofre.".to_owned())?;
    Ok(ArquivoCofre {
        versao: 1,
        salt: STANDARD.encode(salt),
        nonce: STANDARD.encode(nonce),
        conteudo: STANDARD.encode(conteudo),
    })
}

fn descriptografar(
    chave: &[u8; 32],
    arquivo: &ArquivoCofre,
) -> Result<BTreeMap<String, RegistroSegredo>, String> {
    let nonce = STANDARD
        .decode(&arquivo.nonce)
        .map_err(|_| "Nonce do cofre inválido.".to_owned())?;
    let conteudo = STANDARD
        .decode(&arquivo.conteudo)
        .map_err(|_| "Conteúdo do cofre inválido.".to_owned())?;
    if nonce.len() != 12 {
        return Err("Nonce do cofre possui tamanho inválido.".to_owned());
    }
    let cifra = ChaCha20Poly1305::new(Key::from_slice(chave));
    let texto = cifra
        .decrypt(Nonce::from_slice(&nonce), conteudo.as_ref())
        .map_err(|_| "Senha mestra inválida ou cofre corrompido.".to_owned())?;
    serde_json::from_slice(&texto).map_err(|erro| format!("Falha ao ler o cofre: {erro}"))
}

fn ler_arquivo(app: &AppHandle) -> Result<ArquivoCofre, String> {
    let caminho = caminho_cofre(app)?;
    let texto =
        fs::read_to_string(&caminho).map_err(|erro| format!("Falha ao abrir o cofre: {erro}"))?;
    serde_json::from_str(&texto).map_err(|erro| format!("Arquivo do cofre inválido: {erro}"))
}

fn salvar_arquivo(app: &AppHandle, arquivo: &ArquivoCofre) -> Result<(), String> {
    let caminho = caminho_cofre(app)?;
    let temporario = caminho.with_extension("tmp");
    let texto = serde_json::to_string_pretty(arquivo).map_err(|erro| erro.to_string())?;
    fs::write(&temporario, texto)
        .map_err(|erro| format!("Falha ao gravar o cofre temporário: {erro}"))?;
    if caminho.exists() {
        fs::remove_file(&caminho)
            .map_err(|erro| format!("Falha ao substituir o cofre anterior: {erro}"))?;
    }
    fs::rename(&temporario, &caminho).map_err(|erro| format!("Falha ao confirmar o cofre: {erro}"))
}

fn chave_desbloqueada(estado: &State<'_, EstadoCofre>) -> Result<[u8; 32], String> {
    let bloqueio = estado
        .0
        .lock()
        .map_err(|_| "Estado do cofre indisponível.".to_owned())?;
    bloqueio
        .as_ref()
        .copied()
        .ok_or_else(|| "Desbloqueie o cofre antes de continuar.".to_owned())
}

fn status_interno(app: &AppHandle, estado: &State<'_, EstadoCofre>) -> Result<StatusCofre, String> {
    let caminho = caminho_cofre(app)?;
    let inicializado = caminho.is_file();
    let desbloqueado = estado
        .0
        .lock()
        .map_err(|_| "Estado do cofre indisponível.".to_owned())?
        .is_some();
    let quantidade_segredos = if inicializado && desbloqueado {
        let chave = chave_desbloqueada(estado)?;
        descriptografar(&chave, &ler_arquivo(app)?)?.len()
    } else {
        0
    };
    Ok(StatusCofre {
        disponivel: true,
        inicializado,
        desbloqueado,
        caminho: caminho.to_string_lossy().to_string(),
        quantidade_segredos,
        mensagem: if desbloqueado {
            "Cofre desbloqueado somente nesta sessão.".to_owned()
        } else if inicializado {
            "Cofre protegido e bloqueado.".to_owned()
        } else {
            "Cofre ainda não inicializado.".to_owned()
        },
    })
}

#[tauri::command]
pub fn status_cofre(app: AppHandle, estado: State<'_, EstadoCofre>) -> Result<StatusCofre, String> {
    status_interno(&app, &estado)
}

#[tauri::command]
pub fn inicializar_cofre(
    app: AppHandle,
    estado: State<'_, EstadoCofre>,
    senha: String,
) -> Result<StatusCofre, String> {
    let caminho = caminho_cofre(&app)?;
    if caminho.exists() {
        return Err("O cofre já foi inicializado.".to_owned());
    }
    let mut salt = [0_u8; 16];
    let mut gerador = OsRng;
    gerador.fill_bytes(&mut salt);
    let chave = derivar_chave(&senha, &salt)?;
    let arquivo = criptografar(&chave, &salt, &BTreeMap::new())?;
    salvar_arquivo(&app, &arquivo)?;
    *estado
        .0
        .lock()
        .map_err(|_| "Estado do cofre indisponível.".to_owned())? = Some(chave);
    status_interno(&app, &estado)
}

#[tauri::command]
pub fn desbloquear_cofre(
    app: AppHandle,
    estado: State<'_, EstadoCofre>,
    senha: String,
) -> Result<StatusCofre, String> {
    let arquivo = ler_arquivo(&app)?;
    let salt = STANDARD
        .decode(&arquivo.salt)
        .map_err(|_| "Salt do cofre inválido.".to_owned())?;
    let chave = derivar_chave(&senha, &salt)?;
    let _ = descriptografar(&chave, &arquivo)?;
    *estado
        .0
        .lock()
        .map_err(|_| "Estado do cofre indisponível.".to_owned())? = Some(chave);
    status_interno(&app, &estado)
}

#[tauri::command]
pub fn bloquear_cofre(
    app: AppHandle,
    estado: State<'_, EstadoCofre>,
) -> Result<StatusCofre, String> {
    let mut bloqueio = estado
        .0
        .lock()
        .map_err(|_| "Estado do cofre indisponível.".to_owned())?;
    if let Some(mut chave) = bloqueio.take() {
        chave.zeroize();
    }
    drop(bloqueio);
    status_interno(&app, &estado)
}

#[tauri::command]
pub fn listar_segredos_cofre(
    app: AppHandle,
    estado: State<'_, EstadoCofre>,
) -> Result<Vec<SegredoCofreResumo>, String> {
    let chave = chave_desbloqueada(&estado)?;
    let dados = descriptografar(&chave, &ler_arquivo(&app)?)?;
    Ok(dados
        .into_iter()
        .map(|(chave, registro)| SegredoCofreResumo {
            chave,
            atualizado_em: registro.atualizado_em,
        })
        .collect())
}

#[tauri::command]
pub fn salvar_segredo_cofre(
    app: AppHandle,
    estado: State<'_, EstadoCofre>,
    chave: String,
    valor: String,
) -> Result<StatusCofre, String> {
    let identificador = chave.trim();
    if identificador.is_empty() || valor.is_empty() {
        return Err("Informe o identificador e o segredo.".to_owned());
    }
    let chave_mestra = chave_desbloqueada(&estado)?;
    let arquivo_atual = ler_arquivo(&app)?;
    let salt = STANDARD
        .decode(&arquivo_atual.salt)
        .map_err(|_| "Salt do cofre inválido.".to_owned())?;
    let mut dados = descriptografar(&chave_mestra, &arquivo_atual)?;
    dados.insert(
        identificador.to_owned(),
        RegistroSegredo {
            valor,
            atualizado_em: agora_millis(),
        },
    );
    salvar_arquivo(&app, &criptografar(&chave_mestra, &salt, &dados)?)?;
    status_interno(&app, &estado)
}

#[tauri::command]
pub fn remover_segredo_cofre(
    app: AppHandle,
    estado: State<'_, EstadoCofre>,
    chave: String,
) -> Result<StatusCofre, String> {
    let chave_mestra = chave_desbloqueada(&estado)?;
    let arquivo_atual = ler_arquivo(&app)?;
    let salt = STANDARD
        .decode(&arquivo_atual.salt)
        .map_err(|_| "Salt do cofre inválido.".to_owned())?;
    let mut dados = descriptografar(&chave_mestra, &arquivo_atual)?;
    dados.remove(chave.trim());
    salvar_arquivo(&app, &criptografar(&chave_mestra, &salt, &dados)?)?;
    status_interno(&app, &estado)
}

pub(crate) fn ler_segredo_interno(
    app: &AppHandle,
    estado: &EstadoCofre,
    identificador: &str,
) -> Result<String, String> {
    let chave_mestra = estado
        .0
        .lock()
        .map_err(|_| "Estado do cofre indisponível.".to_owned())?
        .as_ref()
        .copied()
        .ok_or_else(|| "Desbloqueie o cofre antes de continuar.".to_owned())?;
    let dados = descriptografar(&chave_mestra, &ler_arquivo(app)?)?;
    dados
        .get(identificador)
        .map(|registro| registro.valor.clone())
        .ok_or_else(|| "A credencial solicitada não está disponível no cofre.".to_owned())
}

pub(crate) fn salvar_segredo_interno(
    app: &AppHandle,
    estado: &EstadoCofre,
    identificador: &str,
    valor: &str,
) -> Result<(), String> {
    let chave_mestra = estado
        .0
        .lock()
        .map_err(|_| "Estado do cofre indisponível.".to_owned())?
        .as_ref()
        .copied()
        .ok_or_else(|| "Desbloqueie o cofre antes de continuar.".to_owned())?;
    let arquivo_atual = ler_arquivo(app)?;
    let salt = STANDARD
        .decode(&arquivo_atual.salt)
        .map_err(|_| "Salt do cofre inválido.".to_owned())?;
    let mut dados = descriptografar(&chave_mestra, &arquivo_atual)?;
    dados.insert(
        identificador.to_owned(),
        RegistroSegredo {
            valor: valor.to_owned(),
            atualizado_em: agora_millis(),
        },
    );
    salvar_arquivo(app, &criptografar(&chave_mestra, &salt, &dados)?)
}

pub(crate) fn remover_segredo_interno(
    app: &AppHandle,
    estado: &EstadoCofre,
    identificador: &str,
) -> Result<(), String> {
    let chave_mestra = estado
        .0
        .lock()
        .map_err(|_| "Estado do cofre indisponível.".to_owned())?
        .as_ref()
        .copied()
        .ok_or_else(|| "Desbloqueie o cofre antes de continuar.".to_owned())?;
    let arquivo_atual = ler_arquivo(app)?;
    let salt = STANDARD
        .decode(&arquivo_atual.salt)
        .map_err(|_| "Salt do cofre inválido.".to_owned())?;
    let mut dados = descriptografar(&chave_mestra, &arquivo_atual)?;
    dados.remove(identificador);
    salvar_arquivo(app, &criptografar(&chave_mestra, &salt, &dados)?)
}

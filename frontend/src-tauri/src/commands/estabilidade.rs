use std::{
    env, fs,
    path::{Path, PathBuf},
    time::{Duration, SystemTime, UNIX_EPOCH},
};

use rusqlite::params;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tauri::{AppHandle, Manager};

use crate::commands::{
    dados::{abrir_banco, agora_millis, caminho_banco},
    observabilidade::registrar_log_interno,
};

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct StatusEstabilidade {
    pub disponivel: bool,
    pub modo_seguro: bool,
    pub falhas_consecutivas: u32,
    pub execucao_anterior_inesperada: bool,
    pub restauracao_pendente: bool,
    pub rota_ultima_sessao: String,
    pub sessao_atualizada_em: Option<u64>,
    pub ultima_saida_limpa_em: Option<u64>,
    pub banco_integro: bool,
    pub cache_bytes: u64,
    pub incidentes_24h: u64,
    pub ultimo_incidente_em: Option<u64>,
    pub caminho_banco: String,
    pub mensagem: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EntradaSessaoEstabilidade {
    pub rota: String,
    pub contexto: Option<Value>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EntradaIncidenteEstabilidade {
    pub origem: String,
    pub categoria: String,
    pub mensagem: String,
    pub contexto: Option<Value>,
    pub correlacao_id: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IncidenteEstabilidade {
    pub id: String,
    pub origem: String,
    pub categoria: String,
    pub mensagem: String,
    pub contexto: String,
    pub correlacao_id: String,
    pub criado_em: u64,
    pub recuperado: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ItemValidacaoEstabilidade {
    pub id: String,
    pub titulo: String,
    pub status: String,
    pub detalhe: String,
    pub caminho: Option<String>,
    pub acao_recomendada: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ResultadoValidacaoEstabilidade {
    pub itens: Vec<ItemValidacaoEstabilidade>,
    pub bloqueios: u32,
    pub avisos: u32,
    pub executado_em: u64,
    pub mensagem: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ResultadoReparoBanco {
    pub sucesso: bool,
    pub alterado: bool,
    pub integridade_antes: String,
    pub integridade_depois: String,
    pub backup_path: String,
    pub criado_em: u64,
    pub mensagem: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ResultadoLimpezaCache {
    pub arquivos_removidos: u64,
    pub bytes_liberados: u64,
    pub caminhos_inspecionados: Vec<String>,
    pub retencao_dias: u32,
    pub executado_em: u64,
    pub mensagem: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ResultadoExportacaoEstabilidade {
    pub caminho: String,
    pub incidentes: u64,
    pub tamanho_bytes: u64,
    pub criado_em: u64,
    pub mensagem: String,
}

fn id(prefixo: &str) -> String {
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duracao| duracao.as_nanos())
        .unwrap_or_default();
    format!("{prefixo}-{nanos}")
}

fn sanitizar_texto(texto: &str) -> String {
    let mut resultado = texto.trim().to_owned();
    for marcador in [
        "Bearer ",
        "token=",
        "api_key=",
        "apikey=",
        "password=",
        "senha=",
        "client_secret=",
    ] {
        let marcador_minusculo = marcador.to_lowercase();
        let mut inicio_busca = 0;
        while inicio_busca < resultado.len() {
            let restante = resultado[inicio_busca..].to_lowercase();
            let Some(indice_relativo) = restante.find(&marcador_minusculo) else {
                break;
            };
            let inicio = inicio_busca + indice_relativo + marcador.len();
            let fim = resultado[inicio..]
                .find(|caractere: char| {
                    caractere.is_whitespace() || ['&', '"', '\'', ',', ';'].contains(&caractere)
                })
                .map(|indice| inicio + indice)
                .unwrap_or(resultado.len());
            resultado.replace_range(inicio..fim, "[REDACTED]");
            inicio_busca = inicio + "[REDACTED]".len();
        }
    }
    if let Ok(perfil) = env::var("USERPROFILE") {
        if !perfil.trim().is_empty() {
            resultado = resultado.replace(&perfil, "%USERPROFILE%");
        }
    }
    if let Ok(home) = env::var("HOME") {
        if !home.trim().is_empty() {
            resultado = resultado.replace(&home, "$HOME");
        }
    }
    resultado
}

fn sanitizar_valor(valor: &mut Value) {
    match valor {
        Value::Object(mapa) => {
            for (chave, conteudo) in mapa.iter_mut() {
                let chave_normalizada = chave.to_lowercase();
                if [
                    "senha",
                    "password",
                    "token",
                    "secret",
                    "segredo",
                    "authorization",
                    "cookie",
                    "api_key",
                    "apikey",
                    "client_secret",
                    "private_key",
                ]
                .iter()
                .any(|termo| chave_normalizada.contains(termo))
                {
                    *conteudo = Value::String("[REDACTED]".to_owned());
                } else {
                    sanitizar_valor(conteudo);
                }
            }
        }
        Value::Array(itens) => itens.iter_mut().for_each(sanitizar_valor),
        Value::String(texto) => *texto = sanitizar_texto(texto),
        _ => {}
    }
}

fn contexto_sanitizado(contexto: Option<Value>) -> String {
    let mut valor = contexto.unwrap_or_else(|| json!({}));
    sanitizar_valor(&mut valor);
    serde_json::to_string(&valor).unwrap_or_else(|_| "{}".to_owned())
}

fn integridade_banco(app: &AppHandle) -> Result<(bool, String), String> {
    let conexao = abrir_banco(app)?;
    let resultado = conexao
        .query_row("PRAGMA quick_check", [], |linha| linha.get::<_, String>(0))
        .map_err(|erro| format!("Falha ao verificar a integridade do SQLite: {erro}"))?;
    Ok((resultado.eq_ignore_ascii_case("ok"), resultado))
}

fn tamanho_recursivo(caminho: &Path) -> u64 {
    let Ok(metadados) = fs::symlink_metadata(caminho) else {
        return 0;
    };
    if metadados.file_type().is_symlink() {
        return 0;
    }
    if metadados.is_file() {
        return metadados.len();
    }
    fs::read_dir(caminho)
        .ok()
        .into_iter()
        .flatten()
        .filter_map(Result::ok)
        .map(|entrada| tamanho_recursivo(&entrada.path()))
        .sum()
}

fn caminhos_cache_permitidos(app: &AppHandle) -> Result<Vec<PathBuf>, String> {
    let dados = app
        .path()
        .app_local_data_dir()
        .map_err(|erro| format!("Falha ao localizar os dados locais: {erro}"))?;
    let documentos = app
        .path()
        .document_dir()
        .or_else(|_| app.path().app_local_data_dir())
        .map_err(|erro| format!("Falha ao localizar a pasta de documentos: {erro}"))?;
    Ok(vec![
        dados.join("cache"),
        documentos.join("MakeFlux Studio").join("Cache"),
    ])
}

fn cache_total(app: &AppHandle) -> Result<u64, String> {
    Ok(caminhos_cache_permitidos(app)?
        .iter()
        .map(|caminho| tamanho_recursivo(caminho))
        .sum())
}

fn registrar_incidente_interno(
    app: &AppHandle,
    origem: &str,
    categoria: &str,
    mensagem: &str,
    contexto: Option<Value>,
    correlacao_id: Option<&str>,
) -> Result<IncidenteEstabilidade, String> {
    let conexao = abrir_banco(app)?;
    let incidente = IncidenteEstabilidade {
        id: id("incidente"),
        origem: sanitizar_texto(origem),
        categoria: sanitizar_texto(categoria),
        mensagem: sanitizar_texto(mensagem),
        contexto: contexto_sanitizado(contexto),
        correlacao_id: sanitizar_texto(correlacao_id.unwrap_or("estabilidade")),
        criado_em: agora_millis(),
        recuperado: false,
    };
    conexao
        .execute(
            "INSERT INTO incidentes_estabilidade (id, origem, categoria, mensagem, contexto, correlacao_id, criado_em, recuperado) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 0)",
            params![
                incidente.id,
                incidente.origem,
                incidente.categoria,
                incidente.mensagem,
                incidente.contexto,
                incidente.correlacao_id,
                incidente.criado_em as i64
            ],
        )
        .map_err(|erro| format!("Falha ao registrar incidente de estabilidade: {erro}"))?;
    let _ = registrar_log_interno(
        app,
        "erro",
        "sistema",
        "estabilidade.incidente",
        &incidente.mensagem,
        &incidente.correlacao_id,
        json!({
            "origem": incidente.origem,
            "categoria": incidente.categoria,
            "contexto": serde_json::from_str::<Value>(&incidente.contexto).unwrap_or_else(|_| json!({}))
        }),
    );
    Ok(incidente)
}

fn consultar_status_interno(
    app: &AppHandle,
    execucao_anterior_inesperada: bool,
) -> Result<StatusEstabilidade, String> {
    let conexao = abrir_banco(app)?;
    let estado = conexao
        .query_row(
            "SELECT modo_seguro, falhas_consecutivas, restauracao_pendente, rota_ultima_sessao, sessao_atualizada_em, ultima_saida_limpa_em FROM estado_estabilidade WHERE singleton = 1",
            [],
            |linha| {
                Ok((
                    linha.get::<_, i64>(0)? != 0,
                    linha.get::<_, i64>(1)?.max(0) as u32,
                    linha.get::<_, i64>(2)? != 0,
                    linha.get::<_, String>(3)?,
                    linha.get::<_, Option<i64>>(4)?.map(|valor| valor.max(0) as u64),
                    linha.get::<_, Option<i64>>(5)?.map(|valor| valor.max(0) as u64),
                ))
            },
        )
        .map_err(|erro| format!("Falha ao consultar o estado de estabilidade: {erro}"))?;
    let (banco_integro, _) = integridade_banco(app)?;
    let limite_24h = agora_millis().saturating_sub(86_400_000) as i64;
    let incidentes_24h = conexao
        .query_row(
            "SELECT COUNT(*) FROM incidentes_estabilidade WHERE criado_em >= ?1",
            params![limite_24h],
            |linha| linha.get::<_, i64>(0),
        )
        .map_err(|erro| erro.to_string())?
        .max(0) as u64;
    let ultimo_incidente_em = conexao
        .query_row(
            "SELECT MAX(criado_em) FROM incidentes_estabilidade",
            [],
            |linha| linha.get::<_, Option<i64>>(0),
        )
        .map_err(|erro| erro.to_string())?
        .map(|valor| valor.max(0) as u64);
    Ok(StatusEstabilidade {
        disponivel: true,
        modo_seguro: estado.0,
        falhas_consecutivas: estado.1,
        execucao_anterior_inesperada,
        restauracao_pendente: estado.2,
        rota_ultima_sessao: estado.3,
        sessao_atualizada_em: estado.4,
        ultima_saida_limpa_em: estado.5,
        banco_integro,
        cache_bytes: cache_total(app)?,
        incidentes_24h,
        ultimo_incidente_em,
        caminho_banco: caminho_banco(app)?.to_string_lossy().to_string(),
        mensagem: if estado.0 {
            "Modo seguro ativo: automações e recuperações de rede permanecem pausadas.".to_owned()
        } else if execucao_anterior_inesperada {
            "Uma execução anterior terminou inesperadamente; a restauração de sessão está disponível.".to_owned()
        } else {
            "Camada de estabilidade operacional pronta.".to_owned()
        },
    })
}

pub(crate) fn registrar_inicio_aplicacao(app: &AppHandle) -> Result<StatusEstabilidade, String> {
    let conexao = abrir_banco(app)?;
    let agora = agora_millis();
    let estado = conexao
        .query_row(
            "SELECT execucao_ativa, falhas_consecutivas, rota_ultima_sessao FROM estado_estabilidade WHERE singleton = 1",
            [],
            |linha| {
                Ok((
                    linha.get::<_, i64>(0)? != 0,
                    linha.get::<_, i64>(1)?.max(0) as u32,
                    linha.get::<_, String>(2)?,
                ))
            },
        )
        .map_err(|erro| format!("Falha ao preparar o estado de inicialização: {erro}"))?;
    let execucao_anterior_inesperada = estado.0;
    let falhas = if execucao_anterior_inesperada {
        estado.1.saturating_add(1)
    } else {
        estado.1
    };
    let ativar_modo_seguro = falhas >= 3;
    let restauracao_pendente = execucao_anterior_inesperada && !estado.2.trim().is_empty();
    conexao
        .execute(
            "UPDATE estado_estabilidade SET execucao_ativa = 1, iniciada_em = ?1, falhas_consecutivas = ?2, modo_seguro = CASE WHEN ?3 = 1 THEN 1 ELSE modo_seguro END, restauracao_pendente = ?4, mensagem = ?5 WHERE singleton = 1",
            params![
                agora as i64,
                falhas as i64,
                if ativar_modo_seguro { 1 } else { 0 },
                if restauracao_pendente { 1 } else { 0 },
                if execucao_anterior_inesperada {
                    "Execução anterior encerrada sem confirmação de saída limpa."
                } else {
                    "Aplicativo iniciado normalmente."
                }
            ],
        )
        .map_err(|erro| format!("Falha ao registrar a inicialização: {erro}"))?;
    if execucao_anterior_inesperada {
        let _ = registrar_incidente_interno(
            app,
            "rust",
            "encerramento-inesperado",
            "A execução anterior terminou sem registrar uma saída limpa.",
            Some(
                json!({ "falhasConsecutivas": falhas, "modoSeguroAutomatico": ativar_modo_seguro }),
            ),
            Some("startup-recovery"),
        );
    }
    consultar_status_interno(app, execucao_anterior_inesperada)
}

pub(crate) fn registrar_saida_limpa(app: &AppHandle) -> Result<(), String> {
    let conexao = abrir_banco(app)?;
    conexao
        .execute(
            "UPDATE estado_estabilidade SET execucao_ativa = 0, ultima_saida_limpa_em = ?1, falhas_consecutivas = 0, restauracao_pendente = 0, mensagem = 'Saída limpa confirmada.' WHERE singleton = 1",
            params![agora_millis() as i64],
        )
        .map_err(|erro| format!("Falha ao registrar a saída limpa: {erro}"))?;
    Ok(())
}

#[tauri::command]
pub fn consultar_estabilidade(app: AppHandle) -> Result<StatusEstabilidade, String> {
    consultar_status_interno(&app, false)
}

#[tauri::command]
pub fn registrar_sessao_estabilidade(
    app: AppHandle,
    entrada: EntradaSessaoEstabilidade,
) -> Result<StatusEstabilidade, String> {
    let rota = entrada.rota.trim();
    if !rota.starts_with('/') || rota.contains("://") || rota.len() > 240 {
        return Err("A rota da sessão é inválida.".to_owned());
    }
    let conexao = abrir_banco(&app)?;
    conexao
        .execute(
            "UPDATE estado_estabilidade SET rota_ultima_sessao = ?1, sessao_json = ?2, sessao_atualizada_em = ?3, mensagem = 'Sessão persistida.' WHERE singleton = 1",
            params![rota, contexto_sanitizado(entrada.contexto), agora_millis() as i64],
        )
        .map_err(|erro| format!("Falha ao persistir a sessão: {erro}"))?;
    consultar_status_interno(&app, false)
}

#[tauri::command]
pub fn descartar_restauracao_estabilidade(app: AppHandle) -> Result<StatusEstabilidade, String> {
    let conexao = abrir_banco(&app)?;
    conexao
        .execute(
            "UPDATE estado_estabilidade SET restauracao_pendente = 0, mensagem = 'Restauração de sessão descartada.' WHERE singleton = 1",
            [],
        )
        .map_err(|erro| format!("Falha ao descartar a restauração: {erro}"))?;
    consultar_status_interno(&app, false)
}

#[tauri::command]
pub fn definir_modo_seguro(app: AppHandle, ativo: bool) -> Result<StatusEstabilidade, String> {
    let conexao = abrir_banco(&app)?;
    conexao
        .execute(
            "UPDATE estado_estabilidade SET modo_seguro = ?1, mensagem = ?2 WHERE singleton = 1",
            params![
                if ativo { 1 } else { 0 },
                if ativo {
                    "Modo seguro solicitado para a próxima inicialização."
                } else {
                    "Modo seguro desativado para a próxima inicialização."
                }
            ],
        )
        .map_err(|erro| format!("Falha ao alterar o modo seguro: {erro}"))?;
    let _ = registrar_log_interno(
        &app,
        "aviso",
        "sistema",
        "estabilidade.modo_seguro",
        if ativo {
            "Modo seguro ativado."
        } else {
            "Modo seguro desativado."
        },
        "safe-mode",
        json!({ "ativo": ativo, "reinicioNecessario": true }),
    );
    consultar_status_interno(&app, false)
}

#[tauri::command]
pub fn registrar_incidente_estabilidade(
    app: AppHandle,
    entrada: EntradaIncidenteEstabilidade,
) -> Result<IncidenteEstabilidade, String> {
    registrar_incidente_interno(
        &app,
        &entrada.origem,
        &entrada.categoria,
        &entrada.mensagem,
        entrada.contexto,
        entrada.correlacao_id.as_deref(),
    )
}

#[tauri::command]
pub fn listar_incidentes_estabilidade(
    app: AppHandle,
    limite: Option<u32>,
) -> Result<Vec<IncidenteEstabilidade>, String> {
    let conexao = abrir_banco(&app)?;
    let limite = limite.unwrap_or(100).clamp(1, 500) as i64;
    let mut consulta = conexao
        .prepare(
            "SELECT id, origem, categoria, mensagem, contexto, correlacao_id, criado_em, recuperado FROM incidentes_estabilidade ORDER BY criado_em DESC LIMIT ?1",
        )
        .map_err(|erro| erro.to_string())?;
    let linhas = consulta
        .query_map(params![limite], |linha| {
            Ok(IncidenteEstabilidade {
                id: linha.get(0)?,
                origem: linha.get(1)?,
                categoria: linha.get(2)?,
                mensagem: linha.get(3)?,
                contexto: linha.get(4)?,
                correlacao_id: linha.get(5)?,
                criado_em: linha.get::<_, i64>(6)?.max(0) as u64,
                recuperado: linha.get::<_, i64>(7)? != 0,
            })
        })
        .map_err(|erro| erro.to_string())?;
    linhas
        .collect::<Result<Vec<_>, _>>()
        .map_err(|erro| erro.to_string())
}

#[tauri::command]
pub fn marcar_incidente_recuperado(
    app: AppHandle,
    incidente_id: String,
) -> Result<Vec<IncidenteEstabilidade>, String> {
    let conexao = abrir_banco(&app)?;
    conexao
        .execute(
            "UPDATE incidentes_estabilidade SET recuperado = 1 WHERE id = ?1",
            params![incidente_id],
        )
        .map_err(|erro| format!("Falha ao atualizar o incidente: {erro}"))?;
    listar_incidentes_estabilidade(app, Some(100))
}

fn item(
    id: &str,
    titulo: &str,
    status: &str,
    detalhe: String,
    caminho: Option<PathBuf>,
    acao: &str,
) -> ItemValidacaoEstabilidade {
    ItemValidacaoEstabilidade {
        id: id.to_owned(),
        titulo: titulo.to_owned(),
        status: status.to_owned(),
        detalhe,
        caminho: caminho.map(|valor| valor.to_string_lossy().to_string()),
        acao_recomendada: acao.to_owned(),
    }
}

#[tauri::command]
pub fn validar_arquivos_estabilidade(
    app: AppHandle,
) -> Result<ResultadoValidacaoEstabilidade, String> {
    let dados = app
        .path()
        .app_local_data_dir()
        .map_err(|erro| format!("Falha ao localizar os dados locais: {erro}"))?;
    let banco = caminho_banco(&app)?;
    let cofre = dados.join("makeflux-vault.json");
    let checkpoint = dados.join("checkpoint-atualizacao.json");
    let (banco_integro, detalhe_banco) = integridade_banco(&app)?;
    let mut itens = vec![item(
        "sqlite",
        "Banco SQLite",
        if banco_integro { "saudavel" } else { "critico" },
        if banco_integro {
            "PRAGMA quick_check retornou OK.".to_owned()
        } else {
            format!("A integridade do banco exige atenção: {detalhe_banco}")
        },
        Some(banco.clone()),
        if banco_integro {
            "Nenhuma ação necessária."
        } else {
            "Crie um backup e execute o reparo seguro."
        },
    )];

    if cofre.is_file() {
        let valido = fs::read_to_string(&cofre)
            .ok()
            .and_then(|texto| serde_json::from_str::<Value>(&texto).ok())
            .is_some();
        itens.push(item(
            "cofre",
            "Cofre criptografado",
            if valido { "saudavel" } else { "critico" },
            if valido {
                "Estrutura JSON do cofre está legível; o conteúdo permanece criptografado."
                    .to_owned()
            } else {
                "O arquivo do cofre não pôde ser interpretado.".to_owned()
            },
            Some(cofre.clone()),
            if valido {
                "Mantenha o backup da senha mestra em local seguro."
            } else {
                "Não sobrescreva o arquivo; preserve uma cópia para recuperação."
            },
        ));
    } else {
        itens.push(item(
            "cofre",
            "Cofre criptografado",
            "atencao",
            "O cofre ainda não foi inicializado.".to_owned(),
            Some(cofre),
            "Inicialize o cofre antes de configurar credenciais externas.",
        ));
    }

    if checkpoint.is_file() {
        let valido = fs::read_to_string(&checkpoint)
            .ok()
            .and_then(|texto| serde_json::from_str::<Value>(&texto).ok())
            .is_some();
        itens.push(item(
            "checkpoint",
            "Checkpoint de atualização",
            if valido { "atencao" } else { "critico" },
            if valido {
                "Existe um checkpoint de atualização pendente de reconciliação.".to_owned()
            } else {
                "O checkpoint existente possui estrutura inválida.".to_owned()
            },
            Some(checkpoint),
            "Abra Atualizações e conclua ou descarte o checkpoint com segurança.",
        ));
    } else {
        itens.push(item(
            "checkpoint",
            "Checkpoint de atualização",
            "saudavel",
            "Nenhum checkpoint externo pendente foi encontrado.".to_owned(),
            None,
            "Nenhuma ação necessária.",
        ));
    }

    let caches = caminhos_cache_permitidos(&app)?;
    let cache_bytes: u64 = caches
        .iter()
        .map(|caminho| tamanho_recursivo(caminho))
        .sum();
    itens.push(item(
        "cache",
        "Caches gerenciados",
        if cache_bytes > 10 * 1024 * 1024 * 1024 {
            "atencao"
        } else {
            "saudavel"
        },
        format!("{} bytes em pastas de cache aprovadas.", cache_bytes),
        caches.first().cloned(),
        "Use a limpeza segura; projetos, banco e exportações nunca são removidos.",
    ));

    let bloqueios = itens.iter().filter(|item| item.status == "critico").count() as u32;
    let avisos = itens.iter().filter(|item| item.status == "atencao").count() as u32;
    let executado_em = agora_millis();
    Ok(ResultadoValidacaoEstabilidade {
        itens,
        bloqueios,
        avisos,
        executado_em,
        mensagem: if bloqueios == 0 {
            "Validação concluída sem bloqueios críticos.".to_owned()
        } else {
            format!("Validação encontrou {bloqueios} bloqueio(s) crítico(s).")
        },
    })
}

fn pasta_recuperacao(app: &AppHandle) -> Result<PathBuf, String> {
    let base = app
        .path()
        .document_dir()
        .or_else(|_| app.path().app_local_data_dir())
        .map_err(|erro| format!("Falha ao localizar a pasta de recuperação: {erro}"))?;
    let pasta = base.join("MakeFlux Studio").join("Recuperacao");
    fs::create_dir_all(&pasta)
        .map_err(|erro| format!("Falha ao criar a pasta de recuperação: {erro}"))?;
    Ok(pasta)
}

#[tauri::command]
pub fn reparar_banco_estabilidade(app: AppHandle) -> Result<ResultadoReparoBanco, String> {
    let criado_em = agora_millis();
    let caminho = caminho_banco(&app)?;
    let conexao = abrir_banco(&app)?;
    conexao
        .execute_batch("PRAGMA wal_checkpoint(FULL);")
        .map_err(|erro| format!("Falha ao consolidar o WAL: {erro}"))?;
    let integridade_antes = conexao
        .query_row("PRAGMA quick_check", [], |linha| linha.get::<_, String>(0))
        .map_err(|erro| erro.to_string())?;
    drop(conexao);

    let backup =
        pasta_recuperacao(&app)?.join(format!("makeflux-banco-antes-reparo-{criado_em}.sqlite3"));
    fs::copy(&caminho, &backup)
        .map_err(|erro| format!("Falha ao criar o backup preventivo do banco: {erro}"))?;

    let conexao = abrir_banco(&app)?;
    let manutencao = conexao.execute_batch("REINDEX; PRAGMA optimize;");
    if manutencao.is_err() && integridade_antes.eq_ignore_ascii_case("ok") {
        return Err(format!(
            "O banco estava íntegro, mas a manutenção preventiva falhou: {}",
            manutencao
                .err()
                .map(|erro| erro.to_string())
                .unwrap_or_default()
        ));
    }
    let integridade_depois = conexao
        .query_row("PRAGMA quick_check", [], |linha| linha.get::<_, String>(0))
        .map_err(|erro| erro.to_string())?;
    let sucesso = integridade_depois.eq_ignore_ascii_case("ok");
    let backup_path = backup.to_string_lossy().to_string();
    conexao
        .execute(
            "INSERT INTO reparos_estabilidade (id, acao, status, integridade_antes, integridade_depois, backup_path, bytes_liberados, criado_em, mensagem) VALUES (?1, 'reparo-banco', ?2, ?3, ?4, ?5, 0, ?6, ?7)",
            params![
                id("reparo"),
                if sucesso { "concluido" } else { "inconclusivo" },
                &integridade_antes,
                &integridade_depois,
                &backup_path,
                criado_em as i64,
                if sucesso {
                    "REINDEX e PRAGMA optimize concluídos com backup preventivo."
                } else {
                    "O original e o backup foram preservados; restauração manual pode ser necessária."
                }
            ],
        )
        .map_err(|erro| format!("Falha ao registrar o reparo: {erro}"))?;
    let _ = registrar_log_interno(
        &app,
        if sucesso { "info" } else { "erro" },
        "sistema",
        "estabilidade.reparo_banco",
        if sucesso {
            "Reparo seguro do banco concluído."
        } else {
            "Reparo seguro do banco não restaurou a integridade."
        },
        "database-repair",
        json!({
            "integridadeAntes": &integridade_antes,
            "integridadeDepois": &integridade_depois,
            "backup": &backup_path
        }),
    );
    Ok(ResultadoReparoBanco {
        sucesso,
        alterado: true,
        integridade_antes,
        integridade_depois,
        backup_path,
        criado_em,
        mensagem: if sucesso {
            "Banco verificado e otimizado. O backup preventivo foi preservado.".to_owned()
        } else {
            "A integridade ainda exige recuperação manual. Nenhum arquivo original foi apagado."
                .to_owned()
        },
    })
}

fn remover_cache_antigo(caminho: &Path, limite: SystemTime, arquivos: &mut u64, bytes: &mut u64) {
    let Ok(metadados) = fs::symlink_metadata(caminho) else {
        return;
    };
    if metadados.file_type().is_symlink() {
        return;
    }
    if metadados.is_file() {
        let antigo = metadados
            .modified()
            .ok()
            .map(|modificado| modificado <= limite)
            .unwrap_or(false);
        if antigo && fs::remove_file(caminho).is_ok() {
            *arquivos += 1;
            *bytes += metadados.len();
        }
        return;
    }
    if let Ok(entradas) = fs::read_dir(caminho) {
        for entrada in entradas.filter_map(Result::ok) {
            remover_cache_antigo(&entrada.path(), limite, arquivos, bytes);
        }
    }
    let _ = fs::remove_dir(caminho);
}

#[tauri::command]
pub fn limpar_cache_estabilidade(
    app: AppHandle,
    retencao_dias: Option<u32>,
) -> Result<ResultadoLimpezaCache, String> {
    let retencao_dias = retencao_dias.unwrap_or(7).clamp(1, 365);
    let limite = SystemTime::now()
        .checked_sub(Duration::from_secs(retencao_dias as u64 * 86_400))
        .unwrap_or(UNIX_EPOCH);
    let caminhos = caminhos_cache_permitidos(&app)?;
    let mut arquivos = 0_u64;
    let mut bytes = 0_u64;
    for caminho in &caminhos {
        if caminho.is_dir() {
            if let Ok(entradas) = fs::read_dir(caminho) {
                for entrada in entradas.filter_map(Result::ok) {
                    remover_cache_antigo(&entrada.path(), limite, &mut arquivos, &mut bytes);
                }
            }
        }
    }
    let executado_em = agora_millis();
    let conexao = abrir_banco(&app)?;
    conexao
        .execute(
            "INSERT INTO reparos_estabilidade (id, acao, status, integridade_antes, integridade_depois, backup_path, bytes_liberados, criado_em, mensagem) VALUES (?1, 'limpeza-cache', 'concluido', '', '', '', ?2, ?3, ?4)",
            params![
                id("cache"),
                bytes as i64,
                executado_em as i64,
                format!("{arquivos} arquivo(s) removido(s) com retenção de {retencao_dias} dias.")
            ],
        )
        .map_err(|erro| format!("Falha ao registrar a limpeza: {erro}"))?;
    let _ = registrar_log_interno(
        &app,
        "info",
        "sistema",
        "estabilidade.cache_limpo",
        "Limpeza segura de cache concluída.",
        "safe-cache-cleanup",
        json!({ "arquivosRemovidos": arquivos, "bytesLiberados": bytes, "retencaoDias": retencao_dias }),
    );
    Ok(ResultadoLimpezaCache {
        arquivos_removidos: arquivos,
        bytes_liberados: bytes,
        caminhos_inspecionados: caminhos
            .iter()
            .map(|caminho| caminho.to_string_lossy().to_string())
            .collect(),
        retencao_dias,
        executado_em,
        mensagem: "Somente caches gerenciados foram inspecionados; projetos, exportações, banco e cofre foram preservados.".to_owned(),
    })
}

fn pasta_diagnosticos(app: &AppHandle) -> Result<PathBuf, String> {
    let base = app
        .path()
        .document_dir()
        .or_else(|_| app.path().app_local_data_dir())
        .map_err(|erro| format!("Falha ao localizar a pasta de diagnósticos: {erro}"))?;
    let pasta = base
        .join("MakeFlux Studio")
        .join("Diagnosticos")
        .join("Estabilidade");
    fs::create_dir_all(&pasta)
        .map_err(|erro| format!("Falha ao criar a pasta de diagnósticos: {erro}"))?;
    Ok(pasta)
}

#[tauri::command]
pub fn exportar_relatorio_estabilidade(
    app: AppHandle,
) -> Result<ResultadoExportacaoEstabilidade, String> {
    let criado_em = agora_millis();
    let status = consultar_status_interno(&app, false)?;
    let validacao = validar_arquivos_estabilidade(app.clone())?;
    let incidentes = listar_incidentes_estabilidade(app.clone(), Some(250))?;
    let documento = json!({
        "produto": "MakeFlux Studio",
        "versao": env!("CARGO_PKG_VERSION"),
        "criadoEm": criado_em,
        "sanitizado": true,
        "status": status,
        "validacao": validacao,
        "incidentes": incidentes,
    });
    let conteudo = serde_json::to_vec_pretty(&documento)
        .map_err(|erro| format!("Falha ao serializar o relatório: {erro}"))?;
    let caminho = pasta_diagnosticos(&app)?.join(format!("makeflux-estabilidade-{criado_em}.json"));
    fs::write(&caminho, &conteudo)
        .map_err(|erro| format!("Falha ao salvar o relatório: {erro}"))?;
    Ok(ResultadoExportacaoEstabilidade {
        caminho: caminho.to_string_lossy().to_string(),
        incidentes: documento
            .get("incidentes")
            .and_then(Value::as_array)
            .map(|itens| itens.len())
            .unwrap_or_default() as u64,
        tamanho_bytes: conteudo.len() as u64,
        criado_em,
        mensagem: "Relatório sanitizado de estabilidade criado.".to_owned(),
    })
}

#[tauri::command]
pub fn revelar_artefato_estabilidade(caminho: String) -> Result<(), String> {
    let caminho = PathBuf::from(caminho.trim());
    if !caminho.is_file() {
        return Err("O artefato de estabilidade não foi encontrado.".to_owned());
    }
    tauri_plugin_opener::reveal_item_in_dir(&caminho)
        .map_err(|erro| format!("Falha ao mostrar o artefato: {erro}"))
}

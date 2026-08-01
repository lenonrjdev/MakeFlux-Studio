use std::{
    env, fs,
    path::PathBuf,
    time::{SystemTime, UNIX_EPOCH},
};

use rusqlite::params;
use serde_json::{json, Value};
use tauri::{AppHandle, Manager};

use crate::{
    commands::dados::{abrir_banco, agora_millis, caminho_banco},
    models::{
        EntradaLogEstruturado, FiltrosLogsEstruturados, LogEstruturado,
        ResultadoExportacaoDiagnostico, ResultadoLimpezaLogs, ResumoObservabilidade,
    },
};

fn id_log() -> String {
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duracao| duracao.as_nanos())
        .unwrap_or_default();
    format!("log-{nanos}")
}

fn chave_sensivel(chave: &str) -> bool {
    let normalizada = chave.to_lowercase();
    [
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
    .any(|trecho| normalizada.contains(trecho))
}

fn sanitizar_valor(valor: &mut Value) {
    match valor {
        Value::Object(mapa) => {
            for (chave, conteudo) in mapa.iter_mut() {
                if chave_sensivel(chave) {
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

fn sanitizar_texto(texto: &str) -> String {
    let mut resultado = texto.to_owned();
    for marcador in [
        "Bearer ",
        "token=",
        "api_key=",
        "apikey=",
        "password=",
        "senha=",
        "client_secret=",
    ] {
        let mut inicio_busca = 0;
        loop {
            let trecho = resultado[inicio_busca..].to_lowercase();
            let marcador_minusculo = marcador.to_lowercase();
            let Some(indice_relativo) = trecho.find(&marcador_minusculo) else {
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
            if inicio_busca >= resultado.len() {
                break;
            }
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

fn sanitizar_contexto(contexto: &str) -> String {
    match serde_json::from_str::<Value>(contexto) {
        Ok(mut valor) => {
            sanitizar_valor(&mut valor);
            serde_json::to_string(&valor).unwrap_or_else(|_| "{}".to_owned())
        }
        Err(_) => serde_json::to_string(&json!({ "detalhe": sanitizar_texto(contexto) }))
            .unwrap_or_else(|_| "{}".to_owned()),
    }
}

fn normalizar_nivel(nivel: &str) -> String {
    match nivel.to_lowercase().as_str() {
        "debug" => "debug",
        "aviso" | "warn" | "warning" => "aviso",
        "erro" | "error" => "erro",
        _ => "info",
    }
    .to_owned()
}

fn normalizar_origem(origem: &str) -> String {
    match origem.to_lowercase().as_str() {
        "frontend" | "rust" | "moneyprinter" | "provedor" | "publicacao" | "sistema" => {
            origem.to_lowercase()
        }
        _ => "sistema".to_owned(),
    }
}

pub(crate) fn registrar_log_interno(
    app: &AppHandle,
    nivel: &str,
    origem: &str,
    evento: &str,
    mensagem: &str,
    correlacao_id: &str,
    contexto: Value,
) -> Result<LogEstruturado, String> {
    let entrada = EntradaLogEstruturado {
        nivel: nivel.to_owned(),
        origem: origem.to_owned(),
        evento: evento.to_owned(),
        mensagem: mensagem.to_owned(),
        correlacao_id: correlacao_id.to_owned(),
        contexto: serde_json::to_string(&contexto).unwrap_or_else(|_| "{}".to_owned()),
        criado_em: Some(agora_millis()),
    };
    persistir_log(app, entrada)
}

fn persistir_log(
    app: &AppHandle,
    entrada: EntradaLogEstruturado,
) -> Result<LogEstruturado, String> {
    let conexao = abrir_banco(app)?;
    let log = LogEstruturado {
        id: id_log(),
        nivel: normalizar_nivel(&entrada.nivel),
        origem: normalizar_origem(&entrada.origem),
        evento: sanitizar_texto(entrada.evento.trim()),
        mensagem: sanitizar_texto(entrada.mensagem.trim()),
        correlacao_id: sanitizar_texto(entrada.correlacao_id.trim()),
        contexto: sanitizar_contexto(&entrada.contexto),
        criado_em: entrada.criado_em.unwrap_or_else(agora_millis),
    };
    conexao.execute(
        "INSERT INTO logs_estruturados (id, nivel, origem, evento, mensagem, correlacao_id, contexto, criado_em) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![log.id, log.nivel, log.origem, log.evento, log.mensagem, log.correlacao_id, log.contexto, log.criado_em as i64],
    ).map_err(|erro| format!("Falha ao registrar log estruturado: {erro}"))?;
    Ok(log)
}

#[tauri::command]
pub fn registrar_log_estruturado(
    app: AppHandle,
    entrada: EntradaLogEstruturado,
) -> Result<LogEstruturado, String> {
    persistir_log(&app, entrada)
}

#[tauri::command]
pub fn listar_logs_estruturados(
    app: AppHandle,
    filtros: FiltrosLogsEstruturados,
) -> Result<Vec<LogEstruturado>, String> {
    let conexao = abrir_banco(&app)?;
    let limite = filtros.limite.unwrap_or(500).clamp(1, 2_000) as usize;
    let termo = filtros.termo.unwrap_or_default().trim().to_lowercase();
    let correlacao = filtros
        .correlacao_id
        .unwrap_or_default()
        .trim()
        .to_lowercase();
    let nivel = filtros
        .nivel
        .unwrap_or_else(|| "todos".to_owned())
        .to_lowercase();
    let origem = filtros
        .origem
        .unwrap_or_else(|| "todas".to_owned())
        .to_lowercase();
    let mut consulta = conexao.prepare("SELECT id, nivel, origem, evento, mensagem, correlacao_id, contexto, criado_em FROM logs_estruturados ORDER BY criado_em DESC LIMIT 5000").map_err(|erro| erro.to_string())?;
    let linhas = consulta
        .query_map([], |linha| {
            Ok(LogEstruturado {
                id: linha.get(0)?,
                nivel: linha.get(1)?,
                origem: linha.get(2)?,
                evento: linha.get(3)?,
                mensagem: linha.get(4)?,
                correlacao_id: linha.get(5)?,
                contexto: linha.get(6)?,
                criado_em: linha.get::<_, i64>(7)?.max(0) as u64,
            })
        })
        .map_err(|erro| erro.to_string())?;
    let mut resultado = Vec::new();
    for linha in linhas {
        let log = linha.map_err(|erro| erro.to_string())?;
        if nivel != "todos" && log.nivel != nivel {
            continue;
        }
        if origem != "todas" && log.origem != origem {
            continue;
        }
        if !correlacao.is_empty() && !log.correlacao_id.to_lowercase().contains(&correlacao) {
            continue;
        }
        if !termo.is_empty() {
            let conjunto =
                format!("{} {} {}", log.evento, log.mensagem, log.contexto).to_lowercase();
            if !conjunto.contains(&termo) {
                continue;
            }
        }
        resultado.push(log);
        if resultado.len() >= limite {
            break;
        }
    }
    Ok(resultado)
}

#[tauri::command]
pub fn consultar_resumo_observabilidade(app: AppHandle) -> Result<ResumoObservabilidade, String> {
    let conexao = abrir_banco(&app)?;
    let agora = agora_millis();
    let limite = agora.saturating_sub(86_400_000) as i64;
    let total = conexao
        .query_row("SELECT COUNT(*) FROM logs_estruturados", [], |linha| {
            linha.get::<_, i64>(0)
        })
        .map_err(|erro| erro.to_string())?
        .max(0) as u64;
    let erros = conexao
        .query_row(
            "SELECT COUNT(*) FROM logs_estruturados WHERE nivel = 'erro' AND criado_em >= ?1",
            params![limite],
            |linha| linha.get::<_, i64>(0),
        )
        .map_err(|erro| erro.to_string())?
        .max(0) as u64;
    let avisos = conexao
        .query_row(
            "SELECT COUNT(*) FROM logs_estruturados WHERE nivel = 'aviso' AND criado_em >= ?1",
            params![limite],
            |linha| linha.get::<_, i64>(0),
        )
        .map_err(|erro| erro.to_string())?
        .max(0) as u64;
    let correlacoes = conexao
        .query_row(
            "SELECT COUNT(DISTINCT correlacao_id) FROM logs_estruturados WHERE criado_em >= ?1",
            params![limite],
            |linha| linha.get::<_, i64>(0),
        )
        .map_err(|erro| erro.to_string())?
        .max(0) as u64;
    let ultimo_erro = conexao
        .query_row(
            "SELECT MAX(criado_em) FROM logs_estruturados WHERE nivel = 'erro'",
            [],
            |linha| linha.get::<_, Option<i64>>(0),
        )
        .map_err(|erro| erro.to_string())?
        .map(|valor| valor.max(0) as u64);
    let tamanho = conexao.query_row("SELECT COALESCE(SUM(LENGTH(evento) + LENGTH(mensagem) + LENGTH(contexto) + LENGTH(correlacao_id)), 0) FROM logs_estruturados", [], |linha| linha.get::<_, i64>(0)).map_err(|erro| erro.to_string())?.max(0) as u64;
    Ok(ResumoObservabilidade {
        disponivel: true,
        schema_versao: 5,
        total_logs: total,
        erros_24h: erros,
        avisos_24h: avisos,
        correlacoes_24h: correlacoes,
        ultimo_erro_em: ultimo_erro,
        tamanho_aproximado_bytes: tamanho,
        retencao_dias: 30,
        caminho_banco: caminho_banco(&app)?.to_string_lossy().to_string(),
        mensagem: "Observabilidade nativa pronta.".to_owned(),
    })
}

#[tauri::command]
pub fn limpar_logs_estruturados(
    app: AppHandle,
    retencao_dias: u32,
) -> Result<ResultadoLimpezaLogs, String> {
    let dias = retencao_dias.clamp(1, 365);
    let limite_em = agora_millis().saturating_sub(dias as u64 * 86_400_000);
    let conexao = abrir_banco(&app)?;
    let removidos = conexao
        .execute(
            "DELETE FROM logs_estruturados WHERE criado_em < ?1",
            params![limite_em as i64],
        )
        .map_err(|erro| format!("Falha ao aplicar retenção: {erro}"))? as u64;
    let restantes = conexao
        .query_row("SELECT COUNT(*) FROM logs_estruturados", [], |linha| {
            linha.get::<_, i64>(0)
        })
        .map_err(|erro| erro.to_string())?
        .max(0) as u64;
    Ok(ResultadoLimpezaLogs {
        removidos,
        restantes,
        limite_em,
        mensagem: format!("Retenção de {dias} dias aplicada."),
    })
}

fn diretorio_diagnosticos(app: &AppHandle) -> Result<PathBuf, String> {
    let base = app
        .path()
        .document_dir()
        .or_else(|_| app.path().app_local_data_dir())
        .map_err(|erro| format!("Falha ao localizar pasta para diagnóstico: {erro}"))?;
    let pasta = base.join("MakeFlux Studio").join("Diagnosticos");
    fs::create_dir_all(&pasta)
        .map_err(|erro| format!("Falha ao criar pasta de diagnóstico: {erro}"))?;
    Ok(pasta)
}

#[tauri::command]
pub fn exportar_pacote_diagnostico(
    app: AppHandle,
    limite: Option<u32>,
) -> Result<ResultadoExportacaoDiagnostico, String> {
    let filtros = FiltrosLogsEstruturados {
        nivel: Some("todos".to_owned()),
        origem: Some("todas".to_owned()),
        termo: None,
        correlacao_id: None,
        limite: Some(limite.unwrap_or(2_000).clamp(1, 5_000)),
    };
    let logs = listar_logs_estruturados(app.clone(), filtros)?;
    let resumo = consultar_resumo_observabilidade(app.clone())?;
    let criado_em = agora_millis();
    let documento = json!({ "produto": "MakeFlux Studio", "versao": env!("CARGO_PKG_VERSION"), "criadoEm": criado_em, "sanitizado": true, "resumo": resumo, "logs": logs });
    let conteudo = serde_json::to_vec_pretty(&documento)
        .map_err(|erro| format!("Falha ao serializar diagnóstico: {erro}"))?;
    let caminho =
        diretorio_diagnosticos(&app)?.join(format!("makeflux-diagnostico-{criado_em}.json"));
    fs::write(&caminho, &conteudo)
        .map_err(|erro| format!("Falha ao salvar diagnóstico: {erro}"))?;
    let registros = documento
        .get("logs")
        .and_then(Value::as_array)
        .map(|itens| itens.len())
        .unwrap_or_default() as u64;
    Ok(ResultadoExportacaoDiagnostico {
        caminho: caminho.to_string_lossy().to_string(),
        registros,
        tamanho_bytes: conteudo.len() as u64,
        criado_em,
        mensagem: "Pacote sanitizado criado com sucesso.".to_owned(),
    })
}

#[tauri::command]
pub fn revelar_pacote_diagnostico(caminho: String) -> Result<(), String> {
    let caminho = PathBuf::from(caminho.trim());
    if !caminho.is_file() {
        return Err("O pacote de diagnóstico não foi encontrado.".to_owned());
    }
    tauri_plugin_opener::reveal_item_in_dir(&caminho)
        .map_err(|erro| format!("Falha ao mostrar o diagnóstico: {erro}"))
}

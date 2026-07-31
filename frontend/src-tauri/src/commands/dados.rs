use std::{
    fs,
    path::PathBuf,
    time::{SystemTime, UNIX_EPOCH},
};

use rusqlite::{params, Connection, OptionalExtension};
use tauri::{AppHandle, Manager};

use crate::models::{
    EventoTelemetriaLocal, RegistroPersistenciaEntrada, RegistroPersistenciaSaida,
    ResultadoMigracaoSqlite, StatusBancoLocal,
};

fn agora_millis() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duracao| duracao.as_millis() as u64)
        .unwrap_or_default()
}

fn caminho_banco(app: &AppHandle) -> Result<PathBuf, String> {
    let diretorio = app
        .path()
        .app_local_data_dir()
        .map_err(|erro| format!("Falha ao localizar os dados locais: {erro}"))?;
    fs::create_dir_all(&diretorio)
        .map_err(|erro| format!("Falha ao preparar os dados locais: {erro}"))?;
    Ok(diretorio.join("makeflux-studio.sqlite3"))
}

fn abrir_banco(app: &AppHandle) -> Result<Connection, String> {
    let caminho = caminho_banco(app)?;
    let conexao =
        Connection::open(&caminho).map_err(|erro| format!("Falha ao abrir o SQLite: {erro}"))?;
    conexao
        .execute_batch(
            r#"
            PRAGMA journal_mode = WAL;
            PRAGMA synchronous = NORMAL;
            CREATE TABLE IF NOT EXISTS workspace_store (
                chave TEXT PRIMARY KEY NOT NULL,
                valor TEXT NOT NULL,
                atualizado_em INTEGER NOT NULL,
                origem TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id INTEGER PRIMARY KEY NOT NULL,
                aplicada_em INTEGER NOT NULL,
                detalhes TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS telemetria_local (
                id TEXT PRIMARY KEY NOT NULL,
                categoria TEXT NOT NULL,
                nome TEXT NOT NULL,
                detalhes TEXT NOT NULL,
                criado_em INTEGER NOT NULL
            );
            "#,
        )
        .map_err(|erro| format!("Falha ao preparar o schema SQLite: {erro}"))?;
    Ok(conexao)
}

fn calcular_status(app: &AppHandle, conexao: &Connection) -> Result<StatusBancoLocal, String> {
    let registros = conexao
        .query_row("SELECT COUNT(*) FROM workspace_store", [], |linha| {
            linha.get::<_, i64>(0).map(|valor| valor.max(0) as u64)
        })
        .map_err(|erro| erro.to_string())?;
    let bytes_aproximados = conexao
        .query_row(
            "SELECT COALESCE(SUM(LENGTH(chave) + LENGTH(valor)), 0) FROM workspace_store",
            [],
            |linha| linha.get::<_, i64>(0).map(|valor| valor.max(0) as u64),
        )
        .map_err(|erro| erro.to_string())?;
    let ultima_migracao_em = conexao
        .query_row(
            "SELECT aplicada_em FROM schema_migrations ORDER BY aplicada_em DESC LIMIT 1",
            [],
            |linha| linha.get::<_, i64>(0).map(|valor| valor.max(0) as u64),
        )
        .optional()
        .map_err(|erro| erro.to_string())?;

    Ok(StatusBancoLocal {
        disponivel: true,
        caminho: caminho_banco(app)?.to_string_lossy().to_string(),
        registros,
        bytes_aproximados,
        ultima_migracao_em,
        mensagem: "SQLite pronto para persistência nativa.".to_owned(),
    })
}

#[tauri::command]
pub fn status_banco_local(app: AppHandle) -> Result<StatusBancoLocal, String> {
    let conexao = abrir_banco(&app)?;
    calcular_status(&app, &conexao)
}

#[tauri::command]
pub fn migrar_workspace_sqlite(
    app: AppHandle,
    registros: Vec<RegistroPersistenciaEntrada>,
) -> Result<ResultadoMigracaoSqlite, String> {
    let mut conexao = abrir_banco(&app)?;
    let transacao = conexao
        .transaction()
        .map_err(|erro| format!("Falha ao iniciar a migração: {erro}"))?;
    let mut migrados = 0_u64;
    let mut ignorados = 0_u64;

    for registro in registros {
        if !registro.chave.starts_with("makeflux:") {
            ignorados += 1;
            continue;
        }
        transacao
            .execute(
                r#"
                INSERT INTO workspace_store (chave, valor, atualizado_em, origem)
                VALUES (?1, ?2, ?3, ?4)
                ON CONFLICT(chave) DO UPDATE SET
                  valor = excluded.valor,
                  atualizado_em = excluded.atualizado_em,
                  origem = excluded.origem
                "#,
                params![
                    registro.chave,
                    registro.valor,
                    registro.atualizado_em as i64,
                    registro.origem
                ],
            )
            .map_err(|erro| format!("Falha ao migrar um registro: {erro}"))?;
        migrados += 1;
    }

    let aplicado_em = agora_millis();
    transacao
        .execute(
            "INSERT OR REPLACE INTO schema_migrations (id, aplicada_em, detalhes) VALUES (1, ?1, ?2)",
            params![aplicado_em as i64, "migração localStorage para SQLite v1"],
        )
        .map_err(|erro| format!("Falha ao registrar a migração: {erro}"))?;
    transacao
        .commit()
        .map_err(|erro| format!("Falha ao concluir a migração: {erro}"))?;

    let status = calcular_status(&app, &conexao)?;
    Ok(ResultadoMigracaoSqlite {
        disponivel: status.disponivel,
        caminho: status.caminho,
        registros: status.registros,
        bytes_aproximados: status.bytes_aproximados,
        ultima_migracao_em: status.ultima_migracao_em,
        mensagem: "Workspace sincronizado com o SQLite.".to_owned(),
        migrados,
        ignorados,
    })
}

#[tauri::command]
pub fn listar_registros_sqlite(app: AppHandle) -> Result<Vec<RegistroPersistenciaSaida>, String> {
    let conexao = abrir_banco(&app)?;
    let mut consulta = conexao
        .prepare(
            "SELECT chave, valor, atualizado_em, origem FROM workspace_store ORDER BY chave ASC",
        )
        .map_err(|erro| erro.to_string())?;
    let linhas = consulta
        .query_map([], |linha| {
            Ok(RegistroPersistenciaSaida {
                chave: linha.get(0)?,
                valor: linha.get(1)?,
                atualizado_em: linha.get::<_, i64>(2)?.max(0) as u64,
                origem: linha.get(3)?,
            })
        })
        .map_err(|erro| erro.to_string())?;

    linhas
        .collect::<Result<Vec<_>, _>>()
        .map_err(|erro| erro.to_string())
}

#[tauri::command]
pub fn registrar_telemetria_local(
    app: AppHandle,
    evento: EventoTelemetriaLocal,
) -> Result<(), String> {
    let conexao = abrir_banco(&app)?;
    conexao
        .execute(
            r#"
            INSERT OR REPLACE INTO telemetria_local (id, categoria, nome, detalhes, criado_em)
            VALUES (?1, ?2, ?3, ?4, ?5)
            "#,
            params![
                evento.id,
                evento.categoria,
                evento.nome,
                evento.detalhes,
                evento.criado_em as i64
            ],
        )
        .map_err(|erro| format!("Falha ao registrar a telemetria local: {erro}"))?;
    Ok(())
}

#[tauri::command]
pub fn listar_telemetria_local(app: AppHandle) -> Result<Vec<EventoTelemetriaLocal>, String> {
    let conexao = abrir_banco(&app)?;
    let mut consulta = conexao
        .prepare(
            "SELECT id, categoria, nome, detalhes, criado_em FROM telemetria_local ORDER BY criado_em DESC LIMIT 500",
        )
        .map_err(|erro| erro.to_string())?;
    let linhas = consulta
        .query_map([], |linha| {
            Ok(EventoTelemetriaLocal {
                id: linha.get(0)?,
                categoria: linha.get(1)?,
                nome: linha.get(2)?,
                detalhes: linha.get(3)?,
                criado_em: linha.get::<_, i64>(4)?.max(0) as u64,
            })
        })
        .map_err(|erro| erro.to_string())?;

    linhas
        .collect::<Result<Vec<_>, _>>()
        .map_err(|erro| erro.to_string())
}

#[tauri::command]
pub fn limpar_telemetria_local(app: AppHandle) -> Result<u64, String> {
    let conexao = abrir_banco(&app)?;
    let removidos = conexao
        .execute("DELETE FROM telemetria_local", [])
        .map_err(|erro| format!("Falha ao limpar a telemetria local: {erro}"))?;
    Ok(removidos as u64)
}

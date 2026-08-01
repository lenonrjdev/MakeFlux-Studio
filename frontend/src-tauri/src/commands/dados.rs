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

pub(crate) fn agora_millis() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duracao| duracao.as_millis() as u64)
        .unwrap_or_default()
}

pub(crate) fn caminho_banco(app: &AppHandle) -> Result<PathBuf, String> {
    let diretorio = app
        .path()
        .app_local_data_dir()
        .map_err(|erro| format!("Falha ao localizar os dados locais: {erro}"))?;
    fs::create_dir_all(&diretorio)
        .map_err(|erro| format!("Falha ao preparar os dados locais: {erro}"))?;
    Ok(diretorio.join("makeflux-studio.sqlite3"))
}

pub(crate) fn abrir_banco(app: &AppHandle) -> Result<Connection, String> {
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
            CREATE TABLE IF NOT EXISTS metricas_consulta (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                operacao TEXT NOT NULL,
                duracao_ms REAL NOT NULL,
                registros INTEGER NOT NULL,
                criado_em INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS operacoes_lote (
                id TEXT PRIMARY KEY NOT NULL,
                tipo TEXT NOT NULL,
                status TEXT NOT NULL,
                total INTEGER NOT NULL,
                processados INTEGER NOT NULL,
                afetados INTEGER NOT NULL,
                iniciado_em INTEGER NOT NULL,
                atualizado_em INTEGER NOT NULL,
                mensagem TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS manutencao_banco (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                acao TEXT NOT NULL,
                criado_em INTEGER NOT NULL,
                duracao_ms REAL NOT NULL,
                antes_bytes INTEGER NOT NULL,
                depois_bytes INTEGER NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_workspace_store_atualizado ON workspace_store(atualizado_em DESC);
            CREATE INDEX IF NOT EXISTS idx_workspace_store_origem ON workspace_store(origem);
            CREATE INDEX IF NOT EXISTS idx_telemetria_criado ON telemetria_local(criado_em DESC);
            CREATE INDEX IF NOT EXISTS idx_operacoes_lote_status ON operacoes_lote(status, atualizado_em DESC);
            CREATE TABLE IF NOT EXISTS rotinas_agendadas (
                id TEXT PRIMARY KEY NOT NULL,
                nome TEXT NOT NULL,
                descricao TEXT NOT NULL,
                tipo TEXT NOT NULL,
                frequencia TEXT NOT NULL,
                intervalo_minutos INTEGER,
                proxima_execucao_em INTEGER,
                ativa INTEGER NOT NULL,
                notificar INTEGER NOT NULL,
                parametros TEXT NOT NULL,
                criado_em INTEGER NOT NULL,
                atualizado_em INTEGER NOT NULL,
                ultima_execucao_em INTEGER,
                ultimo_status TEXT
            );
            CREATE TABLE IF NOT EXISTS execucoes_rotinas (
                id TEXT PRIMARY KEY NOT NULL,
                rotina_id TEXT NOT NULL,
                rotina_nome TEXT NOT NULL,
                status TEXT NOT NULL,
                iniciada_em INTEGER NOT NULL,
                concluida_em INTEGER,
                duracao_ms INTEGER NOT NULL,
                mensagem TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS notificacoes_locais (
                id TEXT PRIMARY KEY NOT NULL,
                titulo TEXT NOT NULL,
                corpo TEXT NOT NULL,
                nivel TEXT NOT NULL,
                rota TEXT,
                lida INTEGER NOT NULL,
                criada_em INTEGER NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_rotinas_proxima ON rotinas_agendadas(ativa, proxima_execucao_em);
            CREATE INDEX IF NOT EXISTS idx_execucoes_rotina ON execucoes_rotinas(rotina_id, iniciada_em DESC);
            CREATE INDEX IF NOT EXISTS idx_notificacoes_lidas ON notificacoes_locais(lida, criada_em DESC);

            CREATE TABLE IF NOT EXISTS conexoes_publicacao (
                provedor TEXT PRIMARY KEY NOT NULL,
                conta_id TEXT NOT NULL,
                conta_nome TEXT NOT NULL,
                escopos TEXT NOT NULL,
                status TEXT NOT NULL,
                expira_em INTEGER,
                conectada_em INTEGER NOT NULL,
                atualizada_em INTEGER NOT NULL,
                detalhes TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS envios_publicacao (
                id TEXT PRIMARY KEY NOT NULL,
                publicacao_id TEXT NOT NULL,
                provedor TEXT NOT NULL,
                status TEXT NOT NULL,
                progresso INTEGER NOT NULL,
                remoto_id TEXT,
                link TEXT,
                criado_em INTEGER NOT NULL,
                atualizado_em INTEGER NOT NULL,
                mensagem TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_envios_publicacao_status ON envios_publicacao(status, atualizado_em DESC);
            CREATE TABLE IF NOT EXISTS logs_estruturados (
                id TEXT PRIMARY KEY NOT NULL,
                nivel TEXT NOT NULL,
                origem TEXT NOT NULL,
                evento TEXT NOT NULL,
                mensagem TEXT NOT NULL,
                correlacao_id TEXT NOT NULL,
                contexto TEXT NOT NULL,
                criado_em INTEGER NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_logs_criado ON logs_estruturados(criado_em DESC);
            CREATE INDEX IF NOT EXISTS idx_logs_nivel_origem ON logs_estruturados(nivel, origem, criado_em DESC);
            CREATE INDEX IF NOT EXISTS idx_logs_correlacao ON logs_estruturados(correlacao_id, criado_em ASC);
            CREATE TABLE IF NOT EXISTS provedores_ia (
                id TEXT PRIMARY KEY NOT NULL, endpoint TEXT NOT NULL, modelo TEXT NOT NULL, habilitado INTEGER NOT NULL,
                prioridade INTEGER NOT NULL, timeout_segundos INTEGER NOT NULL, limite_diario_requisicoes INTEGER NOT NULL,
                max_tokens_saida INTEGER NOT NULL, temperatura REAL NOT NULL, custo_entrada_milhao REAL NOT NULL,
                custo_saida_milhao REAL NOT NULL, ultima_verificacao_em INTEGER, latencia_ms REAL,
                ultimo_status TEXT NOT NULL, ultima_mensagem TEXT NOT NULL, atualizado_em INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS execucoes_ia (
                id TEXT PRIMARY KEY NOT NULL, experimento_id TEXT NOT NULL, provedor TEXT NOT NULL, modelo TEXT NOT NULL,
                status TEXT NOT NULL, tokens_entrada INTEGER NOT NULL, tokens_saida INTEGER NOT NULL, custo_estimado REAL NOT NULL,
                duracao_ms REAL NOT NULL, mensagem TEXT NOT NULL, correlacao_id TEXT NOT NULL, criado_em INTEGER NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_execucoes_ia_criado ON execucoes_ia(criado_em DESC);
            CREATE INDEX IF NOT EXISTS idx_execucoes_ia_provedor ON execucoes_ia(provedor, criado_em DESC);
            CREATE TABLE IF NOT EXISTS configuracoes_armazenamento_publicacao (
                provedor TEXT PRIMARY KEY NOT NULL,
                cloud_name TEXT NOT NULL,
                tamanho_bloco_mb INTEGER NOT NULL,
                retencao_horas INTEGER NOT NULL,
                limpeza_automatica INTEGER NOT NULL,
                status TEXT NOT NULL,
                ultima_verificacao_em INTEGER,
                mensagem TEXT NOT NULL,
                atualizado_em INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS ativos_temporarios_publicacao (
                id TEXT PRIMARY KEY NOT NULL,
                provedor TEXT NOT NULL,
                public_id TEXT NOT NULL,
                url_publica TEXT NOT NULL,
                caminho_local TEXT NOT NULL,
                status TEXT NOT NULL,
                bytes INTEGER NOT NULL,
                criado_em INTEGER NOT NULL,
                atualizado_em INTEGER NOT NULL,
                expira_em INTEGER NOT NULL,
                removido_em INTEGER,
                mensagem TEXT NOT NULL,
                correlacao_id TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_ativos_temporarios_expiracao ON ativos_temporarios_publicacao(status, expira_em);
            CREATE TABLE IF NOT EXISTS fila_publicacao_v2 (
                id TEXT PRIMARY KEY NOT NULL,
                publicacao_id TEXT NOT NULL,
                provedor TEXT NOT NULL,
                status TEXT NOT NULL,
                progresso INTEGER NOT NULL,
                tentativas INTEGER NOT NULL,
                max_tentativas INTEGER NOT NULL,
                proxima_tentativa_em INTEGER,
                sessao_upload_url TEXT,
                bytes_enviados INTEGER NOT NULL,
                bytes_totais INTEGER NOT NULL,
                remoto_id TEXT,
                link TEXT,
                ativo_temporario_id TEXT,
                criado_em INTEGER NOT NULL,
                atualizado_em INTEGER NOT NULL,
                mensagem TEXT NOT NULL,
                correlacao_id TEXT NOT NULL,
                entrada_json TEXT NOT NULL,
                cancelado INTEGER NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_fila_publicacao_status ON fila_publicacao_v2(status, atualizado_em DESC);
            CREATE INDEX IF NOT EXISTS idx_fila_publicacao_provedor ON fila_publicacao_v2(provedor, atualizado_em DESC);
            PRAGMA user_version = 7;
            "#,
        )
        .map_err(|erro| format!("Falha ao preparar o schema SQLite: {erro}"))?;
    conexao
        .execute(
            "INSERT OR IGNORE INTO schema_migrations (id, aplicada_em, detalhes) VALUES (2, ?1, ?2)",
            params![agora_millis() as i64, "índices, métricas e operações em lote v2"],
        )
        .map_err(|erro| format!("Falha ao registrar o schema v2: {erro}"))?;
    conexao
        .execute(
            "INSERT OR IGNORE INTO schema_migrations (id, aplicada_em, detalhes) VALUES (3, ?1, ?2)",
            params![agora_millis() as i64, "rotinas persistentes, histórico e notificações v3"],
        )
        .map_err(|erro| format!("Falha ao registrar o schema v3: {erro}"))?;
    conexao
        .execute(
            "INSERT OR IGNORE INTO schema_migrations (id, aplicada_em, detalhes) VALUES (4, ?1, ?2)",
            params![agora_millis() as i64, "conexões OAuth e envios sociais v4"],
        )
        .map_err(|erro| format!("Falha ao registrar o schema v4: {erro}"))?;
    conexao
        .execute(
            "INSERT OR IGNORE INTO schema_migrations (id, aplicada_em, detalhes) VALUES (5, ?1, ?2)",
            params![agora_millis() as i64, "logs estruturados, correlação e diagnóstico sanitizado v5"],
        )
        .map_err(|erro| format!("Falha ao registrar o schema v5: {erro}"))?;
    conexao
        .execute(
            "INSERT OR IGNORE INTO schema_migrations (id, aplicada_em, detalhes) VALUES (6, ?1, ?2)",
            params![agora_millis() as i64, "provedores reais, limites e execuções de IA v6"],
        )
        .map_err(|erro| format!("Falha ao registrar o schema v6: {erro}"))?;
    conexao
        .execute(
            "INSERT OR IGNORE INTO schema_migrations (id, aplicada_em, detalhes) VALUES (7, ?1, ?2)",
            params![agora_millis() as i64, "hospedagem temporária, fila robusta e retomada de publicações v7"],
        )
        .map_err(|erro| format!("Falha ao registrar o schema v7: {erro}"))?;
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

use std::{
    sync::atomic::Ordering,
    thread,
    time::{Duration, Instant},
};

use rand::random;
use rusqlite::{params, Connection, OptionalExtension, Row};
use serde_json::Value;
use tauri::{AppHandle, State};
use tauri_plugin_notification::NotificationExt;

use crate::{
    commands::dados::{abrir_banco, agora_millis},
    models::{
        EntradaRotinaAgendada, ExecucaoRotina, NotificacaoLocal, ResultadoProcessamentoRotinas,
        RotinaAgendada, StatusAgendadorRotinas,
    },
    state::EstadoAgendadorRotinas,
};

const LIMITE_RECUPERACAO: usize = 20;

fn mapear_rotina(linha: &Row<'_>) -> rusqlite::Result<RotinaAgendada> {
    Ok(RotinaAgendada {
        id: linha.get(0)?,
        nome: linha.get(1)?,
        descricao: linha.get(2)?,
        tipo: linha.get(3)?,
        frequencia: linha.get(4)?,
        intervalo_minutos: linha
            .get::<_, Option<i64>>(5)?
            .map(|valor| valor.max(0) as u32),
        proxima_execucao_em: linha
            .get::<_, Option<i64>>(6)?
            .map(|valor| valor.max(0) as u64),
        ativa: linha.get::<_, i64>(7)? != 0,
        notificar: linha.get::<_, i64>(8)? != 0,
        parametros: linha.get(9)?,
        criado_em: linha.get::<_, i64>(10)?.max(0) as u64,
        atualizado_em: linha.get::<_, i64>(11)?.max(0) as u64,
        ultima_execucao_em: linha
            .get::<_, Option<i64>>(12)?
            .map(|valor| valor.max(0) as u64),
        ultimo_status: linha.get(13)?,
    })
}

fn buscar_rotina(conexao: &Connection, id: &str) -> Result<RotinaAgendada, String> {
    conexao
        .query_row(
            r#"
            SELECT id, nome, descricao, tipo, frequencia, intervalo_minutos,
                   proxima_execucao_em, ativa, notificar, parametros, criado_em,
                   atualizado_em, ultima_execucao_em, ultimo_status
            FROM rotinas_agendadas WHERE id = ?1
            "#,
            params![id],
            mapear_rotina,
        )
        .map_err(|erro| format!("Rotina não encontrada: {erro}"))
}

fn proxima_execucao(rotina: &RotinaAgendada, referencia: u64) -> Option<u64> {
    match rotina.frequencia.as_str() {
        "diaria" => Some(referencia.saturating_add(86_400_000)),
        "semanal" => Some(referencia.saturating_add(604_800_000)),
        "mensal" => Some(referencia.saturating_add(2_592_000_000)),
        "intervalo" => Some(referencia.saturating_add(
            rotina.intervalo_minutos.unwrap_or(60).clamp(5, 10_080) as u64 * 60_000,
        )),
        _ => None,
    }
}

fn registrar_notificacao(
    app: &AppHandle,
    conexao: &Connection,
    titulo: &str,
    corpo: &str,
    nivel: &str,
    rota: Option<&str>,
) -> Result<(), String> {
    let agora = agora_millis();
    let id = format!("notificacao-{agora}-{}", random::<u32>());
    conexao
        .execute(
            r#"
            INSERT INTO notificacoes_locais (id, titulo, corpo, nivel, rota, lida, criada_em)
            VALUES (?1, ?2, ?3, ?4, ?5, 0, ?6)
            "#,
            params![id, titulo, corpo, nivel, rota, agora as i64],
        )
        .map_err(|erro| format!("Falha ao salvar a notificação: {erro}"))?;

    let _ = app
        .notification()
        .builder()
        .title(titulo)
        .body(corpo)
        .show();
    Ok(())
}

fn executar_acao(conexao: &Connection, rotina: &RotinaAgendada) -> Result<String, String> {
    match rotina.tipo.as_str() {
        "lembrete" => Ok(if rotina.descricao.trim().is_empty() {
            "Lembrete executado pelo agendador local.".to_owned()
        } else {
            rotina.descricao.clone()
        }),
        "checkpoint-wal" => {
            conexao
                .execute_batch("PRAGMA wal_checkpoint(TRUNCATE);")
                .map_err(|erro| format!("Falha no checkpoint WAL: {erro}"))?;
            Ok("Checkpoint WAL concluído.".to_owned())
        }
        "otimizar-banco" => {
            conexao
                .execute_batch("PRAGMA optimize; ANALYZE;")
                .map_err(|erro| format!("Falha ao otimizar o banco: {erro}"))?;
            Ok("Índices e estatísticas do SQLite foram atualizados.".to_owned())
        }
        "verificar-integridade" => {
            let resultado: String = conexao
                .query_row("PRAGMA quick_check", [], |linha| linha.get(0))
                .map_err(|erro| format!("Falha ao verificar a integridade: {erro}"))?;
            if resultado.eq_ignore_ascii_case("ok") {
                Ok("Verificação de integridade concluída sem erros.".to_owned())
            } else {
                Err(format!("O SQLite reportou: {resultado}"))
            }
        }
        "limpar-telemetria" => {
            let parametros: Value = serde_json::from_str(&rotina.parametros).unwrap_or(Value::Null);
            let dias = parametros
                .get("dias")
                .and_then(Value::as_u64)
                .unwrap_or(30)
                .clamp(1, 3_650);
            let limite = agora_millis().saturating_sub(dias * 86_400_000);
            let removidos = conexao
                .execute(
                    "DELETE FROM telemetria_local WHERE criado_em < ?1",
                    params![limite as i64],
                )
                .map_err(|erro| format!("Falha ao limpar a telemetria: {erro}"))?;
            Ok(format!(
                "{removidos} evento(s) de telemetria antiga removido(s)."
            ))
        }
        "relatorio-workspace" => {
            let registros: i64 = conexao
                .query_row("SELECT COUNT(*) FROM workspace_store", [], |linha| {
                    linha.get(0)
                })
                .map_err(|erro| erro.to_string())?;
            let rotinas: i64 = conexao
                .query_row("SELECT COUNT(*) FROM rotinas_agendadas", [], |linha| {
                    linha.get(0)
                })
                .map_err(|erro| erro.to_string())?;
            Ok(format!(
                "Workspace com {} registro(s) persistido(s) e {} rotina(s) cadastrada(s).",
                registros.max(0),
                rotinas.max(0)
            ))
        }
        _ => Err("Tipo de rotina não reconhecido.".to_owned()),
    }
}

fn executar_rotina_interna(app: &AppHandle, id: &str) -> Result<ExecucaoRotina, String> {
    let conexao = abrir_banco(app)?;
    let rotina = buscar_rotina(&conexao, id)?;
    let inicio = Instant::now();
    let iniciada_em = agora_millis();
    let execucao_id = format!("execucao-{iniciada_em}-{}", random::<u32>());
    conexao
        .execute(
            r#"
            INSERT INTO execucoes_rotinas
              (id, rotina_id, rotina_nome, status, iniciada_em, concluida_em, duracao_ms, mensagem)
            VALUES (?1, ?2, ?3, 'executando', ?4, NULL, 0, ?5)
            "#,
            params![
                execucao_id,
                rotina.id,
                rotina.nome,
                iniciada_em as i64,
                "Execução iniciada."
            ],
        )
        .map_err(|erro| format!("Falha ao iniciar o histórico da rotina: {erro}"))?;

    let resultado = executar_acao(&conexao, &rotina);
    let concluida_em = agora_millis();
    let duracao_ms = inicio.elapsed().as_millis() as u64;
    let (status, mensagem, nivel) = match resultado {
        Ok(mensagem) => ("concluida", mensagem, "sucesso"),
        Err(mensagem) => ("falha", mensagem, "erro"),
    };
    let proxima = proxima_execucao(&rotina, concluida_em);
    let ativa = rotina.ativa && proxima.is_some();

    conexao
        .execute(
            r#"
            UPDATE execucoes_rotinas
            SET status = ?2, concluida_em = ?3, duracao_ms = ?4, mensagem = ?5
            WHERE id = ?1
            "#,
            params![
                execucao_id,
                status,
                concluida_em as i64,
                duracao_ms as i64,
                mensagem
            ],
        )
        .map_err(|erro| format!("Falha ao concluir o histórico da rotina: {erro}"))?;
    conexao
        .execute(
            r#"
            UPDATE rotinas_agendadas
            SET proxima_execucao_em = ?2, ativa = ?3, atualizado_em = ?4,
                ultima_execucao_em = ?4, ultimo_status = ?5
            WHERE id = ?1
            "#,
            params![
                rotina.id,
                proxima.map(|valor| valor as i64),
                ativa as i64,
                concluida_em as i64,
                status
            ],
        )
        .map_err(|erro| format!("Falha ao atualizar a rotina: {erro}"))?;

    if rotina.notificar {
        registrar_notificacao(
            app,
            &conexao,
            &rotina.nome,
            &mensagem,
            nivel,
            Some("/rotinas"),
        )?;
    }

    Ok(ExecucaoRotina {
        id: execucao_id,
        rotina_id: rotina.id,
        rotina_nome: rotina.nome,
        status: status.to_owned(),
        iniciada_em,
        concluida_em: Some(concluida_em),
        duracao_ms,
        mensagem,
    })
}

fn processar_pendentes_interno(
    app: &AppHandle,
    limite: usize,
) -> Result<ResultadoProcessamentoRotinas, String> {
    let agora = agora_millis();
    let conexao = abrir_banco(app)?;
    let mut consulta = conexao
        .prepare(
            r#"
            SELECT id FROM rotinas_agendadas
            WHERE ativa = 1 AND proxima_execucao_em IS NOT NULL AND proxima_execucao_em <= ?1
            ORDER BY proxima_execucao_em ASC LIMIT ?2
            "#,
        )
        .map_err(|erro| erro.to_string())?;
    let ids = consulta
        .query_map(params![agora as i64, limite as i64], |linha| {
            linha.get::<_, String>(0)
        })
        .map_err(|erro| erro.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|erro| erro.to_string())?;
    drop(consulta);
    drop(conexao);

    let verificadas = ids.len() as u64;
    let mut executadas = 0_u64;
    let mut falhas = 0_u64;
    for id in ids {
        match executar_rotina_interna(app, &id) {
            Ok(execucao) if execucao.status == "concluida" => executadas += 1,
            Ok(_) | Err(_) => falhas += 1,
        }
    }
    Ok(ResultadoProcessamentoRotinas {
        verificadas,
        executadas,
        falhas,
        mensagem: format!(
            "Ciclo concluído: {executadas} rotina(s) executada(s) e {falhas} falha(s)."
        ),
    })
}

pub fn iniciar_worker_rotinas(app: AppHandle, estado: EstadoAgendadorRotinas) {
    if estado.iniciado.swap(true, Ordering::SeqCst) {
        return;
    }
    estado.parar.store(false, Ordering::SeqCst);
    let controle = estado.clone();
    thread::spawn(move || {
        while !controle.parar.load(Ordering::SeqCst) {
            let _ = processar_pendentes_interno(&app, LIMITE_RECUPERACAO);
            if let Ok(mut ultimo) = controle.ultimo_ciclo_em.lock() {
                *ultimo = agora_millis();
            }
            for _ in 0..15 {
                if controle.parar.load(Ordering::SeqCst) {
                    break;
                }
                thread::sleep(Duration::from_secs(1));
            }
        }
        controle.iniciado.store(false, Ordering::SeqCst);
    });
}

#[tauri::command]
pub fn listar_rotinas_agendadas(app: AppHandle) -> Result<Vec<RotinaAgendada>, String> {
    let conexao = abrir_banco(&app)?;
    let mut consulta = conexao
        .prepare(
            r#"
            SELECT id, nome, descricao, tipo, frequencia, intervalo_minutos,
                   proxima_execucao_em, ativa, notificar, parametros, criado_em,
                   atualizado_em, ultima_execucao_em, ultimo_status
            FROM rotinas_agendadas ORDER BY ativa DESC, proxima_execucao_em ASC, atualizado_em DESC
            "#,
        )
        .map_err(|erro| erro.to_string())?;
    let linhas = consulta
        .query_map([], mapear_rotina)
        .map_err(|erro| erro.to_string())?;
    linhas
        .collect::<Result<Vec<_>, _>>()
        .map_err(|erro| erro.to_string())
}

#[tauri::command]
pub fn salvar_rotina_agendada(
    app: AppHandle,
    entrada: EntradaRotinaAgendada,
) -> Result<RotinaAgendada, String> {
    if entrada.nome.trim().is_empty() {
        return Err("Informe um nome para a rotina.".to_owned());
    }
    let tipos = [
        "lembrete",
        "checkpoint-wal",
        "otimizar-banco",
        "verificar-integridade",
        "limpar-telemetria",
        "relatorio-workspace",
    ];
    let frequencias = ["uma-vez", "diaria", "semanal", "mensal", "intervalo"];
    if !tipos.contains(&entrada.tipo_rotina.as_str())
        || !frequencias.contains(&entrada.frequencia.as_str())
    {
        return Err("Tipo ou frequência de rotina inválido.".to_owned());
    }
    let agora = agora_millis();
    let id = entrada
        .id
        .filter(|valor| !valor.trim().is_empty())
        .unwrap_or_else(|| format!("rotina-{agora}-{}", random::<u32>()));
    let proxima = entrada
        .proxima_execucao_em
        .or_else(|| Some(agora.saturating_add(60_000)));
    let conexao = abrir_banco(&app)?;
    conexao
        .execute(
            r#"
            INSERT INTO rotinas_agendadas
              (id, nome, descricao, tipo, frequencia, intervalo_minutos, proxima_execucao_em,
               ativa, notificar, parametros, criado_em, atualizado_em, ultima_execucao_em, ultimo_status)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?11, NULL, NULL)
            ON CONFLICT(id) DO UPDATE SET
              nome = excluded.nome, descricao = excluded.descricao, tipo = excluded.tipo,
              frequencia = excluded.frequencia, intervalo_minutos = excluded.intervalo_minutos,
              proxima_execucao_em = excluded.proxima_execucao_em, ativa = excluded.ativa,
              notificar = excluded.notificar, parametros = excluded.parametros,
              atualizado_em = excluded.atualizado_em
            "#,
            params![
                id,
                entrada.nome.trim(),
                entrada.descricao.trim(),
                entrada.tipo_rotina,
                entrada.frequencia,
                entrada.intervalo_minutos.map(|valor| valor.clamp(5, 10_080) as i64),
                proxima.map(|valor| valor as i64),
                entrada.ativa as i64,
                entrada.notificar as i64,
                entrada.parametros,
                agora as i64
            ],
        )
        .map_err(|erro| format!("Falha ao salvar a rotina: {erro}"))?;
    buscar_rotina(&conexao, &id)
}

#[tauri::command]
pub fn alterar_status_rotina(
    app: AppHandle,
    id: String,
    ativa: bool,
) -> Result<RotinaAgendada, String> {
    let conexao = abrir_banco(&app)?;
    let agora = agora_millis();
    conexao
        .execute(
            "UPDATE rotinas_agendadas SET ativa = ?2, atualizado_em = ?3 WHERE id = ?1",
            params![id, ativa as i64, agora as i64],
        )
        .map_err(|erro| format!("Falha ao alterar a rotina: {erro}"))?;
    buscar_rotina(&conexao, &id)
}

#[tauri::command]
pub fn remover_rotina_agendada(app: AppHandle, id: String) -> Result<bool, String> {
    let conexao = abrir_banco(&app)?;
    conexao
        .execute(
            "DELETE FROM execucoes_rotinas WHERE rotina_id = ?1",
            params![id],
        )
        .map_err(|erro| erro.to_string())?;
    let removidos = conexao
        .execute("DELETE FROM rotinas_agendadas WHERE id = ?1", params![id])
        .map_err(|erro| format!("Falha ao remover a rotina: {erro}"))?;
    Ok(removidos > 0)
}

#[tauri::command]
pub fn executar_rotina_agora(app: AppHandle, id: String) -> Result<ExecucaoRotina, String> {
    executar_rotina_interna(&app, &id)
}

#[tauri::command]
pub fn processar_rotinas_pendentes(
    app: AppHandle,
) -> Result<ResultadoProcessamentoRotinas, String> {
    processar_pendentes_interno(&app, LIMITE_RECUPERACAO)
}

#[tauri::command]
pub fn listar_execucoes_rotinas(
    app: AppHandle,
    rotina_id: Option<String>,
) -> Result<Vec<ExecucaoRotina>, String> {
    let conexao = abrir_banco(&app)?;
    let mut consulta = conexao
        .prepare(
            r#"
            SELECT id, rotina_id, rotina_nome, status, iniciada_em, concluida_em, duracao_ms, mensagem
            FROM execucoes_rotinas
            WHERE (?1 IS NULL OR rotina_id = ?1)
            ORDER BY iniciada_em DESC LIMIT 200
            "#,
        )
        .map_err(|erro| erro.to_string())?;
    let linhas = consulta
        .query_map(params![rotina_id], |linha| {
            Ok(ExecucaoRotina {
                id: linha.get(0)?,
                rotina_id: linha.get(1)?,
                rotina_nome: linha.get(2)?,
                status: linha.get(3)?,
                iniciada_em: linha.get::<_, i64>(4)?.max(0) as u64,
                concluida_em: linha
                    .get::<_, Option<i64>>(5)?
                    .map(|valor| valor.max(0) as u64),
                duracao_ms: linha.get::<_, i64>(6)?.max(0) as u64,
                mensagem: linha.get(7)?,
            })
        })
        .map_err(|erro| erro.to_string())?;
    linhas
        .collect::<Result<Vec<_>, _>>()
        .map_err(|erro| erro.to_string())
}

#[tauri::command]
pub fn listar_notificacoes_locais(app: AppHandle) -> Result<Vec<NotificacaoLocal>, String> {
    let conexao = abrir_banco(&app)?;
    let mut consulta = conexao
        .prepare(
            r#"
            SELECT id, titulo, corpo, nivel, rota, lida, criada_em
            FROM notificacoes_locais ORDER BY criada_em DESC LIMIT 300
            "#,
        )
        .map_err(|erro| erro.to_string())?;
    let linhas = consulta
        .query_map([], |linha| {
            Ok(NotificacaoLocal {
                id: linha.get(0)?,
                titulo: linha.get(1)?,
                corpo: linha.get(2)?,
                nivel: linha.get(3)?,
                rota: linha.get(4)?,
                lida: linha.get::<_, i64>(5)? != 0,
                criada_em: linha.get::<_, i64>(6)?.max(0) as u64,
            })
        })
        .map_err(|erro| erro.to_string())?;
    linhas
        .collect::<Result<Vec<_>, _>>()
        .map_err(|erro| erro.to_string())
}

#[tauri::command]
pub fn marcar_notificacao_lida(app: AppHandle, id: String) -> Result<bool, String> {
    let conexao = abrir_banco(&app)?;
    let alterados = conexao
        .execute(
            "UPDATE notificacoes_locais SET lida = 1 WHERE id = ?1",
            params![id],
        )
        .map_err(|erro| erro.to_string())?;
    Ok(alterados > 0)
}

#[tauri::command]
pub fn marcar_todas_notificacoes_lidas(app: AppHandle) -> Result<u64, String> {
    let conexao = abrir_banco(&app)?;
    conexao
        .execute("UPDATE notificacoes_locais SET lida = 1 WHERE lida = 0", [])
        .map(|valor| valor as u64)
        .map_err(|erro| erro.to_string())
}

#[tauri::command]
pub fn remover_notificacoes_lidas(app: AppHandle) -> Result<u64, String> {
    let conexao = abrir_banco(&app)?;
    conexao
        .execute("DELETE FROM notificacoes_locais WHERE lida = 1", [])
        .map(|valor| valor as u64)
        .map_err(|erro| erro.to_string())
}

#[tauri::command]
pub fn enviar_notificacao_teste(app: AppHandle) -> Result<bool, String> {
    let conexao = abrir_banco(&app)?;
    registrar_notificacao(
        &app,
        &conexao,
        "MakeFlux Studio",
        "As notificações nativas estão funcionando.",
        "informacao",
        Some("/rotinas"),
    )?;
    Ok(true)
}

#[tauri::command]
pub fn status_agendador_rotinas(
    app: AppHandle,
    estado: State<'_, EstadoAgendadorRotinas>,
) -> Result<StatusAgendadorRotinas, String> {
    let conexao = abrir_banco(&app)?;
    let agora = agora_millis();
    let rotinas_ativas = conexao
        .query_row(
            "SELECT COUNT(*) FROM rotinas_agendadas WHERE ativa = 1",
            [],
            |linha| linha.get::<_, i64>(0),
        )
        .map_err(|erro| erro.to_string())?
        .max(0) as u64;
    let rotinas_pendentes = conexao
        .query_row("SELECT COUNT(*) FROM rotinas_agendadas WHERE ativa = 1 AND proxima_execucao_em IS NOT NULL AND proxima_execucao_em <= ?1", params![agora as i64], |linha| linha.get::<_, i64>(0))
        .map_err(|erro| erro.to_string())?
        .max(0) as u64;
    let notificacoes_nao_lidas = conexao
        .query_row(
            "SELECT COUNT(*) FROM notificacoes_locais WHERE lida = 0",
            [],
            |linha| linha.get::<_, i64>(0),
        )
        .map_err(|erro| erro.to_string())?
        .max(0) as u64;
    let proxima_execucao_em = conexao
        .query_row("SELECT MIN(proxima_execucao_em) FROM rotinas_agendadas WHERE ativa = 1 AND proxima_execucao_em IS NOT NULL", [], |linha| linha.get::<_, Option<i64>>(0))
        .optional()
        .map_err(|erro| erro.to_string())?
        .flatten()
        .map(|valor| valor.max(0) as u64);
    let ultimo_ciclo_em = estado
        .ultimo_ciclo_em
        .lock()
        .ok()
        .map(|valor| *valor)
        .filter(|valor| *valor > 0);
    Ok(StatusAgendadorRotinas {
        disponivel: true,
        worker_ativo: estado.iniciado.load(Ordering::SeqCst),
        ultimo_ciclo_em,
        rotinas_ativas,
        rotinas_pendentes,
        notificacoes_nao_lidas,
        proxima_execucao_em,
        mensagem: "Agendador nativo ativo; pendências são recuperadas ao abrir o aplicativo."
            .to_owned(),
    })
}

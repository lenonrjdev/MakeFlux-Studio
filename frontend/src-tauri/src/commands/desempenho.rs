use std::{
    collections::HashMap,
    fs,
    path::Path,
    sync::{
        atomic::{AtomicBool, Ordering},
        Arc, Mutex,
    },
    thread,
    time::{Duration, Instant},
};

use rusqlite::{params, OptionalExtension};
use tauri::{AppHandle, State};

use crate::{
    commands::dados::{abrir_banco, agora_millis, caminho_banco},
    models::{
        FiltroRegistrosPaginados, OperacaoLote, PaginaRegistros, RegistroPaginado,
        ResultadoManutencao, SolicitacaoOperacaoLote, StatusDesempenhoBanco,
    },
    state::EstadoOperacoesLote,
};

fn tamanho_arquivo(caminho: &Path) -> u64 {
    fs::metadata(caminho)
        .map(|item| item.len())
        .unwrap_or_default()
}

fn salvar_operacao(app: &AppHandle, operacao: &OperacaoLote) -> Result<(), String> {
    let conexao = abrir_banco(app)?;
    conexao
        .execute(
            r#"
            INSERT INTO operacoes_lote (
                id,
                tipo,
                status,
                total,
                processados,
                afetados,
                iniciado_em,
                atualizado_em,
                mensagem
            )
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
            ON CONFLICT(id) DO UPDATE SET
              status = excluded.status,
              total = excluded.total,
              processados = excluded.processados,
              afetados = excluded.afetados,
              atualizado_em = excluded.atualizado_em,
              mensagem = excluded.mensagem
            "#,
            params![
                operacao.id,
                operacao.tipo,
                operacao.status,
                operacao.total as i64,
                operacao.processados as i64,
                operacao.afetados as i64,
                operacao.iniciado_em as i64,
                operacao.atualizado_em as i64,
                operacao.mensagem
            ],
        )
        .map_err(|erro| format!("Falha ao salvar a operação em lote: {erro}"))?;
    Ok(())
}

fn ler_operacao(app: &AppHandle, id: &str) -> Result<OperacaoLote, String> {
    let conexao = abrir_banco(app)?;
    conexao
        .query_row(
            r#"
            SELECT
                id,
                tipo,
                status,
                total,
                processados,
                afetados,
                iniciado_em,
                atualizado_em,
                mensagem
            FROM operacoes_lote
            WHERE id = ?1
            "#,
            params![id],
            |linha| {
                Ok(OperacaoLote {
                    id: linha.get(0)?,
                    tipo: linha.get(1)?,
                    status: linha.get(2)?,
                    total: linha.get::<_, i64>(3)?.max(0) as u64,
                    processados: linha.get::<_, i64>(4)?.max(0) as u64,
                    afetados: linha.get::<_, i64>(5)?.max(0) as u64,
                    iniciado_em: linha.get::<_, i64>(6)?.max(0) as u64,
                    atualizado_em: linha.get::<_, i64>(7)?.max(0) as u64,
                    mensagem: linha.get(8)?,
                })
            },
        )
        .map_err(|erro| erro.to_string())
}

#[tauri::command]
pub fn consultar_status_desempenho(app: AppHandle) -> Result<StatusDesempenhoBanco, String> {
    let conexao = abrir_banco(&app)?;
    let caminho = caminho_banco(&app)?;
    let caminho_wal = std::path::PathBuf::from(format!("{}-wal", caminho.display()));
    let paginas = conexao
        .pragma_query_value(None, "page_count", |linha| linha.get::<_, i64>(0))
        .map_err(|erro| erro.to_string())?
        .max(0) as u64;
    let paginas_livres = conexao
        .pragma_query_value(None, "freelist_count", |linha| linha.get::<_, i64>(0))
        .map_err(|erro| erro.to_string())?
        .max(0) as u64;
    let tamanho_pagina = conexao
        .pragma_query_value(None, "page_size", |linha| linha.get::<_, i64>(0))
        .map_err(|erro| erro.to_string())?
        .max(0) as u64;
    let schema_versao = conexao
        .pragma_query_value(None, "user_version", |linha| linha.get::<_, i64>(0))
        .map_err(|erro| erro.to_string())?
        .max(0) as u32;
    let registros_workspace = conexao
        .query_row("SELECT COUNT(*) FROM workspace_store", [], |linha| {
            linha.get::<_, i64>(0)
        })
        .map_err(|erro| erro.to_string())?
        .max(0) as u64;
    let registros_telemetria = conexao
        .query_row("SELECT COUNT(*) FROM telemetria_local", [], |linha| {
            linha.get::<_, i64>(0)
        })
        .map_err(|erro| erro.to_string())?
        .max(0) as u64;
    let consultas_lentas = conexao
        .query_row(
            "SELECT COUNT(*) FROM metricas_consulta WHERE duracao_ms >= 50.0",
            [],
            |linha| linha.get::<_, i64>(0),
        )
        .map_err(|erro| erro.to_string())?
        .max(0) as u64;
    let operacoes_ativas = conexao
        .query_row(
            r#"
            SELECT COUNT(*)
            FROM operacoes_lote
            WHERE status IN ('aguardando', 'processando')
            "#,
            [],
            |linha| linha.get::<_, i64>(0),
        )
        .map_err(|erro| erro.to_string())?
        .max(0) as u64;
    let ultima_manutencao_em = conexao
        .query_row(
            "SELECT criado_em FROM manutencao_banco ORDER BY criado_em DESC LIMIT 1",
            [],
            |linha| linha.get::<_, i64>(0),
        )
        .optional()
        .map_err(|erro| erro.to_string())?
        .map(|valor| valor.max(0) as u64);
    let fragmentacao_percentual = if paginas == 0 {
        0.0
    } else {
        paginas_livres as f64 / paginas as f64 * 100.0
    };

    Ok(StatusDesempenhoBanco {
        disponivel: true,
        schema_versao,
        registros_workspace,
        registros_telemetria,
        tamanho_banco_bytes: tamanho_arquivo(&caminho),
        tamanho_wal_bytes: tamanho_arquivo(&caminho_wal),
        paginas,
        paginas_livres,
        tamanho_pagina,
        fragmentacao_percentual,
        consultas_lentas,
        operacoes_ativas,
        ultima_manutencao_em,
        mensagem: if fragmentacao_percentual < 15.0 {
            "Banco saudável e pronto para grandes volumes.".to_owned()
        } else {
            "A fragmentação está alta; compacte o banco fora do horário de produção.".to_owned()
        },
    })
}

#[tauri::command]
pub fn listar_registros_paginados(
    app: AppHandle,
    filtro: FiltroRegistrosPaginados,
) -> Result<PaginaRegistros, String> {
    let inicio = Instant::now();
    let conexao = abrir_banco(&app)?;
    let limite = filtro.limite.unwrap_or(100).clamp(20, 1_000) as i64;
    let deslocamento = filtro
        .cursor
        .as_deref()
        .and_then(|valor| valor.parse::<i64>().ok())
        .unwrap_or_default()
        .max(0);
    let termo = filtro.termo.unwrap_or_default().trim().to_owned();
    let padrao = format!("%{termo}%");
    let origem = filtro.origem.unwrap_or_default();
    let ordem = match filtro.ordem.as_deref() {
        Some("chave-asc") => "chave ASC",
        Some("maiores") => "LENGTH(valor) DESC, atualizado_em DESC",
        _ => "atualizado_em DESC, chave ASC",
    };
    let total = conexao
        .query_row(
            r#"
            SELECT COUNT(*)
            FROM workspace_store
            WHERE (?1 = '' OR chave LIKE ?2 OR valor LIKE ?2)
              AND (?3 = '' OR origem = ?3)
            "#,
            params![termo, padrao, origem],
            |linha| linha.get::<_, i64>(0),
        )
        .map_err(|erro| erro.to_string())?
        .max(0) as u64;
    let sql = format!(
        r#"
        SELECT
            chave,
            origem,
            atualizado_em,
            LENGTH(valor),
            SUBSTR(valor, 1, 180)
        FROM workspace_store
        WHERE (?1 = '' OR chave LIKE ?2 OR valor LIKE ?2)
          AND (?3 = '' OR origem = ?3)
        ORDER BY {ordem}
        LIMIT ?4 OFFSET ?5
        "#
    );
    let mut consulta = conexao.prepare(&sql).map_err(|erro| erro.to_string())?;
    let linhas = consulta
        .query_map(
            params![termo, padrao, origem, limite, deslocamento],
            |linha| {
                Ok(RegistroPaginado {
                    chave: linha.get(0)?,
                    origem: linha.get(1)?,
                    atualizado_em: linha.get::<_, i64>(2)?.max(0) as u64,
                    tamanho_bytes: linha.get::<_, i64>(3)?.max(0) as u64,
                    previa: linha.get(4)?,
                })
            },
        )
        .map_err(|erro| erro.to_string())?;
    let itens = linhas
        .collect::<Result<Vec<_>, _>>()
        .map_err(|erro| erro.to_string())?;
    let duracao_ms = inicio.elapsed().as_secs_f64() * 1_000.0;
    conexao
        .execute(
            r#"
            INSERT INTO metricas_consulta (operacao, duracao_ms, registros, criado_em)
            VALUES (?1, ?2, ?3, ?4)
            "#,
            params![
                "listar_registros_paginados",
                duracao_ms,
                itens.len() as i64,
                agora_millis() as i64
            ],
        )
        .map_err(|erro| erro.to_string())?;
    let proximo = deslocamento + itens.len() as i64;

    Ok(PaginaRegistros {
        itens,
        total,
        proximo_cursor: if proximo < total as i64 {
            Some(proximo.to_string())
        } else {
            None
        },
        duracao_ms,
    })
}

fn executar_lote(
    app: AppHandle,
    mapa: Arc<Mutex<HashMap<String, Arc<AtomicBool>>>>,
    mut operacao: OperacaoLote,
    cancelamento: Arc<AtomicBool>,
    solicitacao: SolicitacaoOperacaoLote,
) {
    operacao.status = "processando".to_owned();
    operacao.mensagem = "Operação em lote iniciada.".to_owned();
    operacao.atualizado_em = agora_millis();
    let _ = salvar_operacao(&app, &operacao);

    let resultado = (|| -> Result<(), String> {
        let quantidade = solicitacao.quantidade.unwrap_or(10_000).clamp(1, 100_000) as u64;
        let tamanho_payload = solicitacao.tamanho_payload.unwrap_or(384).clamp(32, 4_096) as usize;
        operacao.total = if solicitacao.tipo == "reindexar" {
            1
        } else {
            quantidade
        };
        salvar_operacao(&app, &operacao)?;

        match solicitacao.tipo.as_str() {
            "gerar-dados-teste" => {
                let mut processados = 0_u64;
                while processados < quantidade {
                    if cancelamento.load(Ordering::Relaxed) {
                        break;
                    }
                    let fim = (processados + 250).min(quantidade);
                    let mut conexao = abrir_banco(&app)?;
                    let transacao = conexao.transaction().map_err(|erro| erro.to_string())?;
                    for indice in processados..fim {
                        let chave = format!("makeflux:desempenho-teste:{indice:08}");
                        let valor = format!(
                            "{{\"indice\":{indice},\"payload\":\"{}\"}}",
                            "x".repeat(tamanho_payload)
                        );
                        transacao
                            .execute(
                                r#"
                                INSERT OR REPLACE INTO workspace_store (
                                    chave,
                                    valor,
                                    atualizado_em,
                                    origem
                                )
                                VALUES (?1, ?2, ?3, 'desempenho-teste')
                                "#,
                                params![chave, valor, agora_millis() as i64],
                            )
                            .map_err(|erro| erro.to_string())?;
                    }
                    transacao.commit().map_err(|erro| erro.to_string())?;
                    processados = fim;
                    operacao.processados = processados;
                    operacao.afetados = processados;
                    operacao.atualizado_em = agora_millis();
                    operacao.mensagem = format!("{processados} registros de teste gravados.");
                    salvar_operacao(&app, &operacao)?;
                    thread::sleep(Duration::from_millis(8));
                }
            }
            "remover-dados-teste" => {
                let conexao = abrir_banco(&app)?;
                let afetados = conexao
                    .execute(
                        "DELETE FROM workspace_store WHERE origem = 'desempenho-teste'",
                        [],
                    )
                    .map_err(|erro| erro.to_string())? as u64;
                operacao.total = afetados;
                operacao.processados = afetados;
                operacao.afetados = afetados;
            }
            "reindexar" => {
                let conexao = abrir_banco(&app)?;
                conexao
                    .execute_batch("REINDEX; ANALYZE;")
                    .map_err(|erro| erro.to_string())?;
                operacao.processados = 1;
                operacao.afetados = 1;
            }
            _ => return Err("Tipo de operação em lote desconhecido.".to_owned()),
        }
        Ok(())
    })();

    operacao.atualizado_em = agora_millis();
    if cancelamento.load(Ordering::Relaxed) {
        operacao.status = "cancelada".to_owned();
        operacao.mensagem = "Operação cancelada com segurança no fim do bloco atual.".to_owned();
    } else if let Err(erro) = resultado {
        operacao.status = "erro".to_owned();
        operacao.mensagem = erro;
    } else {
        operacao.status = "concluida".to_owned();
        operacao.mensagem = "Operação concluída.".to_owned();
    }
    let _ = salvar_operacao(&app, &operacao);
    if let Ok(mut bloqueio) = mapa.lock() {
        bloqueio.remove(&operacao.id);
    };
}

#[tauri::command]
pub fn iniciar_operacao_lote(
    app: AppHandle,
    estado: State<'_, EstadoOperacoesLote>,
    solicitacao: SolicitacaoOperacaoLote,
) -> Result<OperacaoLote, String> {
    let agora = agora_millis();
    let id = format!("lote-{agora}-{}", std::process::id());
    let operacao = OperacaoLote {
        id: id.clone(),
        tipo: solicitacao.tipo.clone(),
        status: "aguardando".to_owned(),
        total: solicitacao.quantidade.unwrap_or(1) as u64,
        processados: 0,
        afetados: 0,
        iniciado_em: agora,
        atualizado_em: agora,
        mensagem: "Operação adicionada à fila local.".to_owned(),
    };
    salvar_operacao(&app, &operacao)?;
    let cancelamento = Arc::new(AtomicBool::new(false));
    let mapa = estado.0.clone();
    mapa.lock()
        .map_err(|_| "Estado das operações indisponível.".to_owned())?
        .insert(id, cancelamento.clone());
    let retorno = operacao.clone();
    tauri::async_runtime::spawn_blocking(move || {
        executar_lote(app, mapa, operacao, cancelamento, solicitacao)
    });
    Ok(retorno)
}

#[tauri::command]
pub fn cancelar_operacao_lote(
    app: AppHandle,
    estado: State<'_, EstadoOperacoesLote>,
    id: String,
) -> Result<OperacaoLote, String> {
    let sinal = {
        let bloqueio = estado
            .0
            .lock()
            .map_err(|_| "Estado das operações indisponível.".to_owned())?;
        bloqueio.get(&id).cloned()
    };
    if let Some(sinal) = sinal {
        sinal.store(true, Ordering::Relaxed);
    }
    let mut operacao = ler_operacao(&app, &id)?;
    operacao.mensagem = "Cancelamento solicitado; aguardando o fim do bloco atual.".to_owned();
    Ok(operacao)
}

#[tauri::command]
pub fn listar_operacoes_lote(app: AppHandle) -> Result<Vec<OperacaoLote>, String> {
    let conexao = abrir_banco(&app)?;
    let mut consulta = conexao
        .prepare(
            r#"
            SELECT
                id,
                tipo,
                status,
                total,
                processados,
                afetados,
                iniciado_em,
                atualizado_em,
                mensagem
            FROM operacoes_lote
            ORDER BY atualizado_em DESC
            LIMIT 20
            "#,
        )
        .map_err(|erro| erro.to_string())?;
    let linhas = consulta
        .query_map([], |linha| {
            Ok(OperacaoLote {
                id: linha.get(0)?,
                tipo: linha.get(1)?,
                status: linha.get(2)?,
                total: linha.get::<_, i64>(3)?.max(0) as u64,
                processados: linha.get::<_, i64>(4)?.max(0) as u64,
                afetados: linha.get::<_, i64>(5)?.max(0) as u64,
                iniciado_em: linha.get::<_, i64>(6)?.max(0) as u64,
                atualizado_em: linha.get::<_, i64>(7)?.max(0) as u64,
                mensagem: linha.get(8)?,
            })
        })
        .map_err(|erro| erro.to_string())?;
    linhas
        .collect::<Result<Vec<_>, _>>()
        .map_err(|erro| erro.to_string())
}

#[tauri::command]
pub fn executar_manutencao_banco(
    app: AppHandle,
    acao: String,
) -> Result<ResultadoManutencao, String> {
    let inicio = Instant::now();
    let caminho = caminho_banco(&app)?;
    let antes = tamanho_arquivo(&caminho);
    let conexao = abrir_banco(&app)?;
    match acao.as_str() {
        "checkpoint" => conexao
            .execute_batch("PRAGMA wal_checkpoint(TRUNCATE);")
            .map_err(|erro| erro.to_string())?,
        "otimizar" => conexao
            .execute_batch("PRAGMA optimize; ANALYZE;")
            .map_err(|erro| erro.to_string())?,
        "compactar" => {
            let ativas = conexao
                .query_row(
                    r#"
                    SELECT COUNT(*)
                    FROM operacoes_lote
                    WHERE status IN ('aguardando', 'processando')
                    "#,
                    [],
                    |linha| linha.get::<_, i64>(0),
                )
                .map_err(|erro| erro.to_string())?;
            if ativas > 0 {
                return Err(
                    "Compactação bloqueada enquanto existe uma operação em lote ativa.".to_owned(),
                );
            }
            conexao
                .execute_batch("VACUUM; PRAGMA optimize;")
                .map_err(|erro| erro.to_string())?;
        }
        _ => return Err("Ação de manutenção desconhecida.".to_owned()),
    }
    let duracao_ms = inicio.elapsed().as_secs_f64() * 1_000.0;
    let depois = tamanho_arquivo(&caminho);
    conexao
        .execute(
            r#"
            INSERT INTO manutencao_banco (
                acao,
                criado_em,
                duracao_ms,
                antes_bytes,
                depois_bytes
            )
            VALUES (?1, ?2, ?3, ?4, ?5)
            "#,
            params![
                acao,
                agora_millis() as i64,
                duracao_ms,
                antes as i64,
                depois as i64
            ],
        )
        .map_err(|erro| erro.to_string())?;

    Ok(ResultadoManutencao {
        sucesso: true,
        acao: acao.clone(),
        antes_bytes: antes,
        depois_bytes: depois,
        duracao_ms,
        mensagem: format!("Manutenção {acao} concluída com segurança."),
    })
}

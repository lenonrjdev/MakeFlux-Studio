use std::{
    fs,
    io::Read,
    path::{Path, PathBuf},
};

use rusqlite::{params, OptionalExtension};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use tauri::{AppHandle, Manager};

use crate::commands::dados::{abrir_banco, agora_millis, caminho_banco};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StatusAtualizadorNativo {
    pub versao_atual: String,
    pub alvo: String,
    pub configurado: bool,
    pub endpoint: Option<String>,
    pub assinatura_obrigatoria: bool,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EntradaCheckpointAtualizacao {
    pub versao_destino: String,
    pub canal: String,
    pub rollback: bool,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EntradaTransicaoLegadaAtualizacao {
    pub versao_origem: String,
    pub versao_destino: String,
    pub canal: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RegistroAtualizacaoReal {
    pub id: String,
    pub versao_origem: String,
    pub versao_destino: String,
    pub canal: String,
    pub tipo: String,
    pub status: String,
    pub banco_integro_antes: bool,
    pub banco_integro_depois: Option<bool>,
    pub workspace_registros_antes: u64,
    pub workspace_registros_depois: Option<u64>,
    pub banco_bytes_antes: u64,
    pub banco_bytes_depois: Option<u64>,
    pub banco_sha256_antes: String,
    pub banco_sha256_depois: Option<String>,
    pub cofre_existia_antes: bool,
    pub cofre_existe_depois: Option<bool>,
    pub snapshot_path: String,
    pub iniciada_em: u64,
    pub concluida_em: Option<u64>,
    pub mensagem: String,
    pub checkpoint_previo: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PainelHomologacaoAtualizador {
    pub versao_atual: String,
    pub checkpoint_pendente: Option<RegistroAtualizacaoReal>,
    pub ultima_operacao: Option<RegistroAtualizacaoReal>,
    pub historico: Vec<RegistroAtualizacaoReal>,
    pub dados_preservados: Option<bool>,
    pub rollback_disponivel: bool,
    pub atualizado_em: u64,
}

#[derive(Debug)]
struct CheckpointInterno {
    id: String,
    versao_origem: String,
    versao_destino: String,
    canal: String,
    tipo: String,
    banco_integro_antes: bool,
    workspace_registros_antes: u64,
    banco_bytes_antes: u64,
    banco_sha256_antes: String,
    cofre_existia_antes: bool,
    snapshot_path: String,
    iniciada_em: u64,
}

fn texto_caminho(caminho: &Path) -> String {
    caminho.to_string_lossy().to_string()
}

fn caminho_cofre(app: &AppHandle) -> Result<PathBuf, String> {
    let diretorio = app
        .path()
        .app_local_data_dir()
        .map_err(|erro| format!("Falha ao localizar os dados locais: {erro}"))?;
    Ok(diretorio.join("makeflux-vault.json"))
}

fn sha256_arquivo(caminho: &Path) -> Result<String, String> {
    let mut arquivo = fs::File::open(caminho)
        .map_err(|erro| format!("Falha ao abrir o arquivo para checksum: {erro}"))?;
    let mut hash = Sha256::new();
    let mut buffer = [0_u8; 64 * 1024];
    loop {
        let lidos = arquivo
            .read(&mut buffer)
            .map_err(|erro| format!("Falha ao calcular o checksum: {erro}"))?;
        if lidos == 0 {
            break;
        }
        hash.update(&buffer[..lidos]);
    }
    Ok(format!("{:x}", hash.finalize()))
}

fn integridade_banco(app: &AppHandle) -> Result<(bool, u64), String> {
    let conexao = abrir_banco(app)?;
    let integridade: String = conexao
        .query_row("PRAGMA quick_check", [], |linha| linha.get(0))
        .map_err(|erro| format!("Falha ao validar o SQLite: {erro}"))?;
    let registros = conexao
        .query_row("SELECT COUNT(*) FROM workspace_store", [], |linha| {
            linha.get::<_, i64>(0)
        })
        .map_err(|erro| format!("Falha ao contar os registros persistidos: {erro}"))?
        .max(0) as u64;
    Ok((integridade.eq_ignore_ascii_case("ok"), registros))
}

fn registro_da_linha(linha: &rusqlite::Row<'_>) -> rusqlite::Result<RegistroAtualizacaoReal> {
    Ok(RegistroAtualizacaoReal {
        id: linha.get(0)?,
        versao_origem: linha.get(1)?,
        versao_destino: linha.get(2)?,
        canal: linha.get(3)?,
        tipo: linha.get(4)?,
        status: linha.get(5)?,
        banco_integro_antes: linha.get::<_, i64>(6)? != 0,
        banco_integro_depois: linha.get::<_, Option<i64>>(7)?.map(|valor| valor != 0),
        workspace_registros_antes: linha.get::<_, i64>(8)?.max(0) as u64,
        workspace_registros_depois: linha
            .get::<_, Option<i64>>(9)?
            .map(|valor| valor.max(0) as u64),
        banco_bytes_antes: linha.get::<_, i64>(10)?.max(0) as u64,
        banco_bytes_depois: linha
            .get::<_, Option<i64>>(11)?
            .map(|valor| valor.max(0) as u64),
        banco_sha256_antes: linha.get(12)?,
        banco_sha256_depois: linha.get(13)?,
        cofre_existia_antes: linha.get::<_, i64>(14)? != 0,
        cofre_existe_depois: linha.get::<_, Option<i64>>(15)?.map(|valor| valor != 0),
        snapshot_path: linha.get(16)?,
        iniciada_em: linha.get::<_, i64>(17)?.max(0) as u64,
        concluida_em: linha
            .get::<_, Option<i64>>(18)?
            .map(|valor| valor.max(0) as u64),
        mensagem: linha.get(19)?,
        checkpoint_previo: linha.get::<_, i64>(20)? != 0,
    })
}

fn consulta_registros() -> &'static str {
    "SELECT id, versao_origem, versao_destino, canal, tipo, status, \
     banco_integro_antes, banco_integro_depois, workspace_registros_antes, \
     workspace_registros_depois, banco_bytes_antes, banco_bytes_depois, \
     banco_sha256_antes, banco_sha256_depois, cofre_existia_antes, \
     cofre_existe_depois, snapshot_path, iniciada_em, concluida_em, mensagem, \
     checkpoint_previo FROM historico_atualizacoes_reais"
}

fn ler_checkpoint(app: &AppHandle) -> Result<Option<CheckpointInterno>, String> {
    let conexao = abrir_banco(app)?;
    conexao
        .query_row(
            "SELECT id, versao_origem, versao_destino, canal, tipo, banco_integro_antes, \
             workspace_registros_antes, banco_bytes_antes, banco_sha256_antes, \
             cofre_existia_antes, snapshot_path, criado_em \
             FROM checkpoint_atualizacao WHERE singleton = 1",
            [],
            |linha| {
                Ok(CheckpointInterno {
                    id: linha.get(0)?,
                    versao_origem: linha.get(1)?,
                    versao_destino: linha.get(2)?,
                    canal: linha.get(3)?,
                    tipo: linha.get(4)?,
                    banco_integro_antes: linha.get::<_, i64>(5)? != 0,
                    workspace_registros_antes: linha.get::<_, i64>(6)?.max(0) as u64,
                    banco_bytes_antes: linha.get::<_, i64>(7)?.max(0) as u64,
                    banco_sha256_antes: linha.get(8)?,
                    cofre_existia_antes: linha.get::<_, i64>(9)? != 0,
                    snapshot_path: linha.get(10)?,
                    iniciada_em: linha.get::<_, i64>(11)?.max(0) as u64,
                })
            },
        )
        .optional()
        .map_err(|erro| format!("Falha ao consultar o checkpoint da atualização: {erro}"))
}

fn carregar_registro(app: &AppHandle, id: &str) -> Result<Option<RegistroAtualizacaoReal>, String> {
    let conexao = abrir_banco(app)?;
    conexao
        .query_row(
            &format!("{} WHERE id = ?1", consulta_registros()),
            [id],
            registro_da_linha,
        )
        .optional()
        .map_err(|erro| format!("Falha ao consultar a atualização: {erro}"))
}

fn limpar_snapshots_antigos(app: &AppHandle) -> Result<(), String> {
    let conexao = abrir_banco(app)?;
    let mut consulta = conexao
        .prepare(
            "SELECT snapshot_path FROM historico_atualizacoes_reais \
             WHERE snapshot_path <> '' ORDER BY iniciada_em DESC LIMIT -1 OFFSET 3",
        )
        .map_err(|erro| erro.to_string())?;
    let caminhos = consulta
        .query_map([], |linha| linha.get::<_, String>(0))
        .map_err(|erro| erro.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|erro| erro.to_string())?;
    drop(consulta);
    for caminho in caminhos {
        let _ = fs::remove_file(caminho);
    }
    Ok(())
}

pub(crate) fn reconciliar_checkpoint_pos_atualizacao(
    app: &AppHandle,
) -> Result<Option<RegistroAtualizacaoReal>, String> {
    let Some(checkpoint) = ler_checkpoint(app)? else {
        return Ok(None);
    };

    let versao_atual = env!("CARGO_PKG_VERSION").to_owned();
    let (banco_integro_depois, workspace_registros_depois) = integridade_banco(app)?;
    let banco = caminho_banco(app)?;
    let banco_bytes_depois = fs::metadata(&banco).map(|m| m.len()).unwrap_or_default();
    let banco_sha256_depois = sha256_arquivo(&banco).unwrap_or_default();
    let cofre_existe_depois = caminho_cofre(app)?.is_file();
    let versao_confirmada = versao_atual == checkpoint.versao_destino;
    let registros_preservados = workspace_registros_depois >= checkpoint.workspace_registros_antes;
    let cofre_preservado = !checkpoint.cofre_existia_antes || cofre_existe_depois;
    let dados_preservados = banco_integro_depois && registros_preservados && cofre_preservado;

    let (status, mensagem, concluir) = if versao_confirmada && dados_preservados {
        (
            "confirmada",
            format!(
                "Atualização para {} confirmada após o reinício. SQLite e cofre foram preservados.",
                checkpoint.versao_destino
            ),
            true,
        )
    } else if versao_confirmada {
        (
            "dados-inconsistentes",
            "A versão foi instalada, mas a validação dos dados locais requer atenção.".to_owned(),
            true,
        )
    } else if versao_atual == checkpoint.versao_origem {
        (
            "nao-aplicada",
            format!(
                "O aplicativo reiniciou ainda na versão {}. A instalação não foi concluída.",
                versao_atual
            ),
            false,
        )
    } else {
        (
            "versao-inesperada",
            format!(
                "Era esperada a versão {}, mas o aplicativo iniciou em {}.",
                checkpoint.versao_destino, versao_atual
            ),
            false,
        )
    };

    let concluida_em = if concluir { Some(agora_millis()) } else { None };
    let conexao = abrir_banco(app)?;
    conexao
        .execute(
            "UPDATE historico_atualizacoes_reais SET status = ?1, banco_integro_depois = ?2, \
             workspace_registros_depois = ?3, banco_bytes_depois = ?4, banco_sha256_depois = ?5, \
             cofre_existe_depois = ?6, concluida_em = ?7, mensagem = ?8 WHERE id = ?9",
            params![
                status,
                if banco_integro_depois { 1 } else { 0 },
                workspace_registros_depois as i64,
                banco_bytes_depois as i64,
                banco_sha256_depois,
                if cofre_existe_depois { 1 } else { 0 },
                concluida_em.map(|valor| valor as i64),
                mensagem,
                checkpoint.id,
            ],
        )
        .map_err(|erro| format!("Falha ao concluir o histórico da atualização: {erro}"))?;
    if concluir {
        conexao
            .execute("DELETE FROM checkpoint_atualizacao WHERE singleton = 1", [])
            .map_err(|erro| format!("Falha ao encerrar o checkpoint: {erro}"))?;
    }
    drop(conexao);
    carregar_registro(app, &checkpoint.id)
}

#[tauri::command]
pub fn status_atualizador_nativo() -> StatusAtualizadorNativo {
    StatusAtualizadorNativo {
        versao_atual: env!("CARGO_PKG_VERSION").to_owned(),
        alvo: tauri_plugin_updater::target().unwrap_or_else(|| "nao-suportado".to_owned()),
        configurado: option_env!("MAKEFLUX_ATUALIZADOR_CONFIGURADO").is_some(),
        endpoint: option_env!("MAKEFLUX_UPDATER_ENDPOINT").map(str::to_owned),
        assinatura_obrigatoria: true,
    }
}

#[tauri::command]
pub fn preparar_checkpoint_atualizacao(
    app: AppHandle,
    entrada: EntradaCheckpointAtualizacao,
) -> Result<RegistroAtualizacaoReal, String> {
    let versao_destino = entrada.versao_destino.trim();
    let canal = entrada.canal.trim().to_lowercase();
    let versao_origem = env!("CARGO_PKG_VERSION").to_owned();
    if versao_destino.is_empty() {
        return Err("A versão de destino não foi informada.".to_owned());
    }
    if !entrada.rollback && versao_destino == versao_origem {
        return Err("A versão de destino já está instalada.".to_owned());
    }
    if !matches!(canal.as_str(), "estavel" | "beta") {
        return Err("Canal de atualização inválido.".to_owned());
    }
    if ler_checkpoint(&app)?.is_some() {
        return Err("Já existe uma atualização aguardando confirmação após o reinício.".to_owned());
    }

    let banco = caminho_banco(&app)?;
    {
        let conexao = abrir_banco(&app)?;
        conexao
            .execute_batch("PRAGMA wal_checkpoint(FULL);")
            .map_err(|erro| format!("Falha ao consolidar o SQLite antes da atualização: {erro}"))?;
    }
    let (banco_integro_antes, workspace_registros_antes) = integridade_banco(&app)?;
    if !banco_integro_antes {
        return Err("O SQLite não passou na verificação de integridade.".to_owned());
    }
    let banco_bytes_antes = fs::metadata(&banco)
        .map_err(|erro| format!("Falha ao inspecionar o banco local: {erro}"))?
        .len();
    let banco_sha256_antes = sha256_arquivo(&banco)?;
    let cofre_existia_antes = caminho_cofre(&app)?.is_file();
    let iniciada_em = agora_millis();
    let id = format!("update-real-{iniciada_em}");
    let tipo = if entrada.rollback {
        "rollback"
    } else {
        "atualizacao"
    };

    let dados = app
        .path()
        .app_local_data_dir()
        .map_err(|erro| format!("Falha ao localizar os dados locais: {erro}"))?;
    let pasta_snapshots = dados.join("update-checkpoints");
    fs::create_dir_all(&pasta_snapshots)
        .map_err(|erro| format!("Falha ao preparar o checkpoint local: {erro}"))?;
    let snapshot = pasta_snapshots.join(format!("{id}.sqlite3"));
    fs::copy(&banco, &snapshot)
        .map_err(|erro| format!("Falha ao criar o snapshot pré-atualização: {erro}"))?;

    let mensagem = format!(
        "Checkpoint criado antes de {} {} → {}.",
        tipo, versao_origem, versao_destino
    );
    let conexao = abrir_banco(&app)?;
    conexao
        .execute(
            "INSERT INTO historico_atualizacoes_reais (
                id, versao_origem, versao_destino, canal, tipo, status,
                banco_integro_antes, banco_integro_depois, workspace_registros_antes,
                workspace_registros_depois, banco_bytes_antes, banco_bytes_depois,
                banco_sha256_antes, banco_sha256_depois, cofre_existia_antes,
                cofre_existe_depois, snapshot_path, iniciada_em, concluida_em, mensagem, checkpoint_previo
             ) VALUES (?1, ?2, ?3, ?4, ?5, 'aguardando-reinicio', ?6, NULL, ?7, NULL,
                       ?8, NULL, ?9, NULL, ?10, NULL, ?11, ?12, NULL, ?13, 1)",
            params![
                id,
                versao_origem,
                versao_destino,
                canal,
                tipo,
                if banco_integro_antes { 1 } else { 0 },
                workspace_registros_antes as i64,
                banco_bytes_antes as i64,
                banco_sha256_antes,
                if cofre_existia_antes { 1 } else { 0 },
                texto_caminho(&snapshot),
                iniciada_em as i64,
                mensagem,
            ],
        )
        .map_err(|erro| format!("Falha ao registrar o início da atualização: {erro}"))?;
    conexao
        .execute(
            "INSERT INTO checkpoint_atualizacao (
                singleton, id, versao_origem, versao_destino, canal, tipo,
                banco_integro_antes, workspace_registros_antes, banco_bytes_antes,
                banco_sha256_antes, cofre_existia_antes, snapshot_path, criado_em
             ) VALUES (1, ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
            params![
                id,
                versao_origem,
                versao_destino,
                canal,
                tipo,
                if banco_integro_antes { 1 } else { 0 },
                workspace_registros_antes as i64,
                banco_bytes_antes as i64,
                banco_sha256_antes,
                if cofre_existia_antes { 1 } else { 0 },
                texto_caminho(&snapshot),
                iniciada_em as i64,
            ],
        )
        .map_err(|erro| format!("Falha ao persistir o checkpoint da atualização: {erro}"))?;
    drop(conexao);
    let _ = limpar_snapshots_antigos(&app);
    carregar_registro(&app, &id)?
        .ok_or_else(|| "Checkpoint não encontrado após a gravação.".to_owned())
}

#[tauri::command]
pub fn registrar_transicao_legada_atualizacao(
    app: AppHandle,
    entrada: EntradaTransicaoLegadaAtualizacao,
) -> Result<RegistroAtualizacaoReal, String> {
    let versao_atual = env!("CARGO_PKG_VERSION").to_owned();
    let versao_origem = entrada.versao_origem.trim();
    let versao_destino = entrada.versao_destino.trim();
    let canal = entrada.canal.trim().to_lowercase();
    if versao_destino != versao_atual || versao_origem.is_empty() || versao_origem == versao_destino
    {
        return Err("A transição legada não corresponde à versão atualmente instalada.".to_owned());
    }
    if !matches!(canal.as_str(), "estavel" | "beta") {
        return Err("Canal de atualização inválido.".to_owned());
    }
    let conexao = abrir_banco(&app)?;
    let existente: Option<String> = conexao
        .query_row(
            "SELECT id FROM historico_atualizacoes_reais WHERE versao_origem = ?1 AND versao_destino = ?2 AND status IN ('confirmada-legado', 'dados-inconsistentes-legado') LIMIT 1",
            params![versao_origem, versao_destino],
            |linha| linha.get(0),
        )
        .optional()
        .map_err(|erro| format!("Falha ao verificar a transição anterior: {erro}"))?;
    drop(conexao);
    if let Some(id) = existente {
        return carregar_registro(&app, &id)?
            .ok_or_else(|| "Transição registrada, mas não localizada.".to_owned());
    }

    let (banco_integro, registros) = integridade_banco(&app)?;
    let banco = caminho_banco(&app)?;
    let banco_bytes = fs::metadata(&banco)
        .map(|item| item.len())
        .unwrap_or_default();
    let banco_sha256 = sha256_arquivo(&banco).unwrap_or_default();
    let cofre_existe = caminho_cofre(&app)?.is_file();
    let agora = agora_millis();
    let id = format!("update-legado-{agora}");
    let (status, mensagem) = if banco_integro {
        (
            "confirmada-legado",
            format!(
                "Transição {} → {} confirmada após o reinício. A versão 1.9.0 iniciou a instalação sem o checkpoint nativo da Fase 23; a integridade atual foi validada.",
                versao_origem, versao_destino
            ),
        )
    } else {
        (
            "dados-inconsistentes-legado",
            format!(
                "A transição {} → {} foi detectada, mas o SQLite atual não passou na verificação de integridade.",
                versao_origem, versao_destino
            ),
        )
    };
    let conexao = abrir_banco(&app)?;
    conexao
        .execute(
            "INSERT INTO historico_atualizacoes_reais (
                id, versao_origem, versao_destino, canal, tipo, status,
                banco_integro_antes, banco_integro_depois, workspace_registros_antes,
                workspace_registros_depois, banco_bytes_antes, banco_bytes_depois,
                banco_sha256_antes, banco_sha256_depois, cofre_existia_antes,
                cofre_existe_depois, snapshot_path, iniciada_em, concluida_em, mensagem, checkpoint_previo
             ) VALUES (?1, ?2, ?3, ?4, 'atualizacao', ?5, ?6, ?6, ?7, ?7,
                       ?8, ?8, ?9, ?9, ?10, ?10, '', ?11, ?11, ?12, 0)",
            params![
                id,
                versao_origem,
                versao_destino,
                canal,
                status,
                if banco_integro { 1 } else { 0 },
                registros as i64,
                banco_bytes as i64,
                banco_sha256,
                if cofre_existe { 1 } else { 0 },
                agora as i64,
                mensagem,
            ],
        )
        .map_err(|erro| format!("Falha ao registrar a transição legada: {erro}"))?;
    drop(conexao);
    carregar_registro(&app, &id)?
        .ok_or_else(|| "Transição legada não encontrada após a gravação.".to_owned())
}

#[tauri::command]
pub fn confirmar_pos_atualizacao(
    app: AppHandle,
) -> Result<Option<RegistroAtualizacaoReal>, String> {
    reconciliar_checkpoint_pos_atualizacao(&app)
}

#[tauri::command]
pub fn descartar_checkpoint_atualizacao(app: AppHandle) -> Result<(), String> {
    let conexao = abrir_banco(&app)?;
    if let Some(checkpoint) = ler_checkpoint(&app)? {
        conexao
            .execute(
                "UPDATE historico_atualizacoes_reais SET status = 'descartada', concluida_em = ?1, \
                 mensagem = 'Checkpoint descartado manualmente pelo usuário.' WHERE id = ?2",
                params![agora_millis() as i64, checkpoint.id],
            )
            .map_err(|erro| format!("Falha ao atualizar o histórico: {erro}"))?;
    }
    conexao
        .execute("DELETE FROM checkpoint_atualizacao WHERE singleton = 1", [])
        .map_err(|erro| format!("Falha ao descartar o checkpoint: {erro}"))?;
    Ok(())
}

#[tauri::command]
pub fn consultar_homologacao_atualizador(
    app: AppHandle,
) -> Result<PainelHomologacaoAtualizador, String> {
    let _ = reconciliar_checkpoint_pos_atualizacao(&app);
    let conexao = abrir_banco(&app)?;
    let mut consulta = conexao
        .prepare(&format!(
            "{} ORDER BY iniciada_em DESC LIMIT 20",
            consulta_registros()
        ))
        .map_err(|erro| format!("Falha ao preparar o histórico: {erro}"))?;
    let historico = consulta
        .query_map([], registro_da_linha)
        .map_err(|erro| format!("Falha ao listar o histórico: {erro}"))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|erro| format!("Falha ao ler o histórico: {erro}"))?;
    drop(consulta);

    let checkpoint_id = conexao
        .query_row(
            "SELECT id FROM checkpoint_atualizacao WHERE singleton = 1",
            [],
            |linha| linha.get::<_, String>(0),
        )
        .optional()
        .map_err(|erro| format!("Falha ao localizar o checkpoint: {erro}"))?;
    let checkpoint_pendente = checkpoint_id
        .as_deref()
        .and_then(|id| historico.iter().find(|item| item.id == id).cloned());
    let ultima_operacao = historico.first().cloned();
    let dados_preservados = ultima_operacao.as_ref().and_then(|item| {
        if !item.checkpoint_previo {
            return None;
        }
        item.banco_integro_depois.map(|integro| {
            integro
                && item.workspace_registros_depois.unwrap_or_default()
                    >= item.workspace_registros_antes
                && (!item.cofre_existia_antes || item.cofre_existe_depois.unwrap_or(false))
        })
    });
    let rollback_disponivel = ultima_operacao
        .as_ref()
        .map(|item| {
            item.checkpoint_previo
                && item.status == "confirmada"
                && Path::new(&item.snapshot_path).is_file()
        })
        .unwrap_or(false);

    Ok(PainelHomologacaoAtualizador {
        versao_atual: env!("CARGO_PKG_VERSION").to_owned(),
        checkpoint_pendente,
        ultima_operacao,
        historico,
        dados_preservados,
        rollback_disponivel,
        atualizado_em: agora_millis(),
    })
}

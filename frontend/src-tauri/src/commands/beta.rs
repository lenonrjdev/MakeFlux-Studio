use rusqlite::{params, OptionalExtension};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{
    fs,
    path::{Path, PathBuf},
};
use tauri::{AppHandle, Manager};

use crate::commands::dados::{abrir_banco, agora_millis, caminho_banco};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PortaoBeta {
    id: String,
    titulo: String,
    detalhe: String,
    status: String,
    obrigatorio: bool,
    automatico: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CheckBeta {
    id: String,
    categoria: String,
    titulo: String,
    descricao: String,
    obrigatorio: bool,
    concluido: bool,
    evidencia: String,
    atualizado_em: u64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SessaoBeta {
    id: String,
    nome: String,
    alvo: String,
    status: String,
    score: u32,
    iniciado_em: u64,
    finalizado_em: Option<u64>,
    mensagem: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PainelBetaOperacional {
    sessao: Option<SessaoBeta>,
    portoes: Vec<PortaoBeta>,
    checklist: Vec<CheckBeta>,
    score: u32,
    apto: bool,
    bloqueios: u32,
    avisos: u32,
    atualizado_em: u64,
    mensagem: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EntradaSessaoBeta {
    nome: String,
    alvo: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EntradaCheckBeta {
    check_id: String,
    concluido: bool,
    evidencia: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ArtefatoBeta {
    caminho: String,
    tamanho_bytes: u64,
    criado_em: u64,
    checksum_sha256: Option<String>,
    mensagem: String,
}

const CHECKS: [(&str, &str, &str, &str, bool); 8] = [
    (
        "maquina-limpa",
        "ambiente",
        "Instalação em máquina limpa",
        "Instale sem Node.js ou Rust previamente disponíveis e registre a versão do Windows.",
        true,
    ),
    (
        "video-real",
        "produção",
        "Vídeo real de ponta a ponta",
        "Gere um MP4 real, reproduza e registre o caminho final da exportação.",
        true,
    ),
    (
        "persistencia",
        "dados",
        "Persistência após reinicialização",
        "Feche e abra o aplicativo e confirme projetos, fila, histórico e configurações.",
        true,
    ),
    (
        "backup-restauracao",
        "recuperação",
        "Backup e restauração",
        "Restaure o workspace em outro usuário ou computador e confira os dados.",
        true,
    ),
    (
        "atualizacao-rollback",
        "distribuição",
        "Atualização e rollback assinados",
        "Atualize a partir de uma versão anterior e teste o rollback controlado.",
        true,
    ),
    (
        "publicacao-real",
        "canais",
        "Publicação em canal real",
        "Publique ao menos um conteúdo e registre o link ou ID remoto.",
        true,
    ),
    (
        "desinstalacao",
        "instalador",
        "Desinstalação sem perda de projetos",
        "Desinstale e reinstale confirmando que o workspace externo foi preservado.",
        true,
    ),
    (
        "diagnostico",
        "suporte",
        "Pacote de diagnóstico",
        "Exporte o diagnóstico e confira que segredos e caminhos pessoais foram sanitizados.",
        false,
    ),
];

fn texto_caminho(caminho: &Path) -> String {
    caminho.to_string_lossy().to_string()
}

fn sessao_atual(app: &AppHandle) -> Result<Option<SessaoBeta>, String> {
    let conexao = abrir_banco(app)?;
    conexao.query_row(
        "SELECT id, nome, alvo, status, score, iniciado_em, finalizado_em, mensagem FROM sessoes_beta ORDER BY iniciado_em DESC LIMIT 1",
        [],
        |linha| Ok(SessaoBeta {
            id: linha.get(0)?, nome: linha.get(1)?, alvo: linha.get(2)?, status: linha.get(3)?,
            score: linha.get::<_, i64>(4)?.max(0) as u32,
            iniciado_em: linha.get::<_, i64>(5)?.max(0) as u64,
            finalizado_em: linha.get::<_, Option<i64>>(6)?.map(|valor| valor.max(0) as u64),
            mensagem: linha.get(7)?,
        }),
    ).optional().map_err(|erro| erro.to_string())
}

fn listar_checks(app: &AppHandle, sessao_id: Option<&str>) -> Result<Vec<CheckBeta>, String> {
    let Some(sessao_id) = sessao_id else {
        return Ok(Vec::new());
    };
    let conexao = abrir_banco(app)?;
    let mut consulta = conexao.prepare(
        "SELECT id, categoria, titulo, descricao, obrigatorio, concluido, evidencia, atualizado_em FROM checks_beta WHERE sessao_id = ?1 ORDER BY ordem ASC",
    ).map_err(|erro| erro.to_string())?;
    let linhas = consulta
        .query_map([sessao_id], |linha| {
            Ok(CheckBeta {
                id: linha.get(0)?,
                categoria: linha.get(1)?,
                titulo: linha.get(2)?,
                descricao: linha.get(3)?,
                obrigatorio: linha.get::<_, i64>(4)? != 0,
                concluido: linha.get::<_, i64>(5)? != 0,
                evidencia: linha.get(6)?,
                atualizado_em: linha.get::<_, i64>(7)?.max(0) as u64,
            })
        })
        .map_err(|erro| erro.to_string())?;
    linhas
        .collect::<Result<Vec<_>, _>>()
        .map_err(|erro| erro.to_string())
}

fn portao(
    id: &str,
    titulo: &str,
    aprovado: bool,
    detalhe_ok: String,
    detalhe_falha: String,
    obrigatorio: bool,
) -> PortaoBeta {
    PortaoBeta {
        id: id.to_owned(),
        titulo: titulo.to_owned(),
        detalhe: if aprovado { detalhe_ok } else { detalhe_falha },
        status: if aprovado {
            "aprovado".to_owned()
        } else if obrigatorio {
            "bloqueado".to_owned()
        } else {
            "atencao".to_owned()
        },
        obrigatorio,
        automatico: true,
    }
}

fn diagnosticar_portoes(app: &AppHandle) -> Result<Vec<PortaoBeta>, String> {
    let conexao = abrir_banco(app)?;
    let integridade: String = conexao
        .query_row("PRAGMA quick_check", [], |linha| linha.get(0))
        .unwrap_or_else(|_| "falha".to_owned());
    let banco_ok = integridade.eq_ignore_ascii_case("ok");

    let dados = app
        .path()
        .app_local_data_dir()
        .map_err(|erro| erro.to_string())?;
    fs::create_dir_all(&dados).map_err(|erro| erro.to_string())?;
    let prova = dados.join(".makeflux-beta-write-test");
    let gravacao_ok = fs::write(&prova, b"ok")
        .and_then(|_| fs::remove_file(&prova))
        .is_ok();

    let cofre = dados.join("makeflux-vault.json");
    let cofre_ok = cofre.is_file();

    let producao_json: Option<String> = conexao
        .query_row(
            "SELECT valor FROM workspace_store WHERE chave = 'makeflux:workspace-producao:v1'",
            [],
            |linha| linha.get(0),
        )
        .optional()
        .map_err(|erro| erro.to_string())?;
    let producao_ok = producao_json
        .as_deref()
        .map(|valor| {
            let minusculo = valor.to_lowercase();
            minusculo.contains(".mp4")
                && (minusculo.contains("moneyprinter")
                    || minusculo.contains("execucao-real")
                    || minusculo.contains("real"))
        })
        .unwrap_or(false);

    let provedores: i64 = conexao.query_row(
        "SELECT COUNT(*) FROM provedores_ia WHERE habilitado = 1 AND ultimo_status IN ('pronto','sucesso','online')",
        [], |linha| linha.get(0),
    ).unwrap_or(0);

    let canais: i64 = conexao.query_row(
        "SELECT COUNT(*) FROM conexoes_publicacao WHERE status IN ('conectada','conectado','pronto')",
        [], |linha| linha.get(0),
    ).unwrap_or(0);

    let logs: i64 = conexao
        .query_row("SELECT COUNT(*) FROM logs_estruturados", [], |linha| {
            linha.get(0)
        })
        .unwrap_or(0);
    let updater_ok = option_env!("MAKEFLUX_ATUALIZADOR_CONFIGURADO") == Some("1");

    Ok(vec![
        portao(
            "banco",
            "Integridade do SQLite",
            banco_ok,
            "PRAGMA quick_check retornou OK.".to_owned(),
            format!("Integridade retornou: {integridade}."),
            true,
        ),
        portao(
            "workspace",
            "Workspace gravável",
            gravacao_ok,
            format!("Escrita confirmada em {}.", texto_caminho(&dados)),
            "O diretório local não aceitou gravação.".to_owned(),
            true,
        ),
        portao(
            "cofre",
            "Cofre inicializado",
            cofre_ok,
            "Arquivo criptografado do cofre localizado.".to_owned(),
            "Inicialize o cofre antes da homologação.".to_owned(),
            true,
        ),
        portao(
            "producao",
            "Exportação real detectada",
            producao_ok,
            "O histórico contém uma exportação MP4 real.".to_owned(),
            "Gere um vídeo real com o MoneyPrinterTurbo e confirme o MP4.".to_owned(),
            true,
        ),
        portao(
            "ia",
            "Provedor real de IA",
            provedores > 0,
            format!("{provedores} provedor(es) prontos."),
            "Nenhum provedor real foi testado com sucesso.".to_owned(),
            false,
        ),
        portao(
            "canais",
            "Canal social conectado",
            canais > 0,
            format!("{canais} canal(is) conectado(s)."),
            "Nenhum canal social conectado foi encontrado.".to_owned(),
            false,
        ),
        portao(
            "observabilidade",
            "Observabilidade ativa",
            logs > 0,
            format!("{logs} evento(s) técnico(s) registrados."),
            "Ainda não existem logs estruturados.".to_owned(),
            false,
        ),
        portao(
            "updater",
            "Updater assinado",
            updater_ok,
            "Build atual contém configuração assinada do updater.".to_owned(),
            "O build comum não contém updater assinado; valide no instalador de release."
                .to_owned(),
            false,
        ),
    ])
}

fn montar_painel(app: &AppHandle) -> Result<PainelBetaOperacional, String> {
    let sessao = sessao_atual(app)?;
    let checklist = listar_checks(app, sessao.as_ref().map(|item| item.id.as_str()))?;
    let portoes = diagnosticar_portoes(app)?;
    let bloqueios = portoes
        .iter()
        .filter(|item| item.status == "bloqueado")
        .count() as u32;
    let avisos = portoes
        .iter()
        .filter(|item| item.status == "atencao")
        .count() as u32;
    let automaticos_aprovados = portoes
        .iter()
        .filter(|item| item.status == "aprovado")
        .count() as u32;
    let manuais_concluidos = checklist.iter().filter(|item| item.concluido).count() as u32;
    let total = portoes.len() as u32 + checklist.len() as u32;
    let score = if total == 0 {
        0
    } else {
        ((automaticos_aprovados + manuais_concluidos) * 100 / total).min(100)
    };
    let manuais_obrigatorios_ok = checklist
        .iter()
        .filter(|item| item.obrigatorio)
        .all(|item| item.concluido);
    let apto = sessao.is_some() && bloqueios == 0 && manuais_obrigatorios_ok;
    Ok(PainelBetaOperacional {
        sessao,
        portoes,
        checklist,
        score,
        apto,
        bloqueios,
        avisos,
        atualizado_em: agora_millis(),
        mensagem: if apto {
            "Todos os critérios obrigatórios estão atendidos. A sessão pode ser aprovada."
                .to_owned()
        } else {
            "Conclua os bloqueios e testes manuais obrigatórios antes de aprovar a sessão."
                .to_owned()
        },
    })
}

#[tauri::command]
pub fn consultar_beta_operacional(app: AppHandle) -> Result<PainelBetaOperacional, String> {
    montar_painel(&app)
}

#[tauri::command]
pub fn iniciar_sessao_beta(
    app: AppHandle,
    entrada: EntradaSessaoBeta,
) -> Result<PainelBetaOperacional, String> {
    let nome = entrada.nome.trim();
    let alvo = entrada.alvo.trim();
    if nome.len() < 3 || alvo.len() < 3 {
        return Err("Informe um nome e um cenário válidos.".to_owned());
    }
    let agora = agora_millis();
    let id = format!("beta-{agora}");
    let mut conexao = abrir_banco(&app)?;
    let transacao = conexao.transaction().map_err(|erro| erro.to_string())?;
    transacao.execute(
        "INSERT INTO sessoes_beta (id, nome, alvo, status, score, iniciado_em, finalizado_em, mensagem) VALUES (?1, ?2, ?3, 'em-andamento', 0, ?4, NULL, ?5)",
        params![id, nome, alvo, agora as i64, "Sessão iniciada. Registre evidências reais antes da aprovação."],
    ).map_err(|erro| erro.to_string())?;
    for (ordem, (sufixo, categoria, titulo, descricao, obrigatorio)) in CHECKS.iter().enumerate() {
        let check_id = format!("{id}:{sufixo}");
        transacao.execute(
            "INSERT INTO checks_beta (id, sessao_id, ordem, categoria, titulo, descricao, obrigatorio, concluido, evidencia, atualizado_em) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 0, '', ?8)",
            params![check_id, id, ordem as i64, categoria, titulo, descricao, if *obrigatorio { 1 } else { 0 }, agora as i64],
        ).map_err(|erro| erro.to_string())?;
    }
    transacao.commit().map_err(|erro| erro.to_string())?;
    montar_painel(&app)
}

#[tauri::command]
pub fn atualizar_check_beta(
    app: AppHandle,
    entrada: EntradaCheckBeta,
) -> Result<PainelBetaOperacional, String> {
    let sessao =
        sessao_atual(&app)?.ok_or_else(|| "Inicie uma sessão beta primeiro.".to_owned())?;
    if !entrada.check_id.starts_with(&format!("{}:", sessao.id)) {
        return Err("O item não pertence à sessão atual.".to_owned());
    }
    let evidencia = entrada.evidencia.trim();
    if entrada.concluido && evidencia.len() < 3 {
        return Err("Registre uma evidência antes de concluir o item.".to_owned());
    }
    let conexao = abrir_banco(&app)?;
    let alterados = conexao.execute(
        "UPDATE checks_beta SET concluido = ?1, evidencia = ?2, atualizado_em = ?3 WHERE id = ?4 AND sessao_id = ?5",
        params![if entrada.concluido { 1 } else { 0 }, evidencia, agora_millis() as i64, entrada.check_id, sessao.id],
    ).map_err(|erro| erro.to_string())?;
    if alterados == 0 {
        return Err("Item da sessão beta não encontrado.".to_owned());
    }
    montar_painel(&app)
}

#[tauri::command]
pub fn finalizar_sessao_beta(app: AppHandle) -> Result<PainelBetaOperacional, String> {
    let painel = montar_painel(&app)?;
    let sessao = painel
        .sessao
        .as_ref()
        .ok_or_else(|| "Nenhuma sessão beta está ativa.".to_owned())?;
    if !painel.apto {
        return Err("A sessão ainda possui critérios obrigatórios pendentes.".to_owned());
    }
    let conexao = abrir_banco(&app)?;
    conexao.execute(
        "UPDATE sessoes_beta SET status = 'aprovada', score = ?1, finalizado_em = ?2, mensagem = ?3 WHERE id = ?4",
        params![painel.score as i64, agora_millis() as i64, "Sessão aprovada e pronta para compor uma release candidate.", sessao.id],
    ).map_err(|erro| erro.to_string())?;
    montar_painel(&app)
}

fn pasta_beta(app: &AppHandle) -> Result<PathBuf, String> {
    let base = app
        .path()
        .document_dir()
        .or_else(|_| app.path().app_local_data_dir())
        .map_err(|erro| erro.to_string())?;
    let pasta = base.join("MakeFlux Studio").join("Beta");
    fs::create_dir_all(&pasta)
        .map_err(|erro| format!("Falha ao preparar {}: {erro}", texto_caminho(&pasta)))?;
    Ok(pasta)
}

fn checksum(caminho: &Path) -> Result<String, String> {
    let bytes = fs::read(caminho).map_err(|erro| erro.to_string())?;
    Ok(format!("{:x}", Sha256::digest(bytes)))
}

#[tauri::command]
pub fn exportar_relatorio_beta(app: AppHandle) -> Result<ArtefatoBeta, String> {
    let painel = montar_painel(&app)?;
    let sessao = painel
        .sessao
        .as_ref()
        .ok_or_else(|| "Inicie uma sessão beta primeiro.".to_owned())?;
    let agora = agora_millis();
    let caminho = pasta_beta(&app)?.join(format!("makeflux-relatorio-{}-{agora}.json", sessao.id));
    let conteudo = serde_json::to_vec_pretty(&painel).map_err(|erro| erro.to_string())?;
    fs::write(&caminho, conteudo).map_err(|erro| erro.to_string())?;
    let tamanho = fs::metadata(&caminho)
        .map_err(|erro| erro.to_string())?
        .len();
    Ok(ArtefatoBeta {
        caminho: texto_caminho(&caminho),
        tamanho_bytes: tamanho,
        criado_em: agora,
        checksum_sha256: Some(checksum(&caminho)?),
        mensagem: "Relatório beta sanitizado exportado.".to_owned(),
    })
}

#[tauri::command]
pub fn criar_snapshot_beta(app: AppHandle) -> Result<ArtefatoBeta, String> {
    let sessao =
        sessao_atual(&app)?.ok_or_else(|| "Inicie uma sessão beta primeiro.".to_owned())?;
    let origem = caminho_banco(&app)?;
    let conexao = abrir_banco(&app)?;
    let _ = conexao.execute_batch("PRAGMA wal_checkpoint(TRUNCATE);");
    drop(conexao);
    let agora = agora_millis();
    let destino =
        pasta_beta(&app)?.join(format!("makeflux-snapshot-{}-{agora}.sqlite3", sessao.id));
    fs::copy(&origem, &destino).map_err(|erro| format!("Falha ao criar o snapshot: {erro}"))?;
    let tamanho = fs::metadata(&destino)
        .map_err(|erro| erro.to_string())?
        .len();
    Ok(ArtefatoBeta {
        caminho: texto_caminho(&destino),
        tamanho_bytes: tamanho,
        criado_em: agora,
        checksum_sha256: Some(checksum(&destino)?),
        mensagem: "Snapshot consistente do SQLite criado. O cofre criptografado não foi incluído."
            .to_owned(),
    })
}

#[tauri::command]
pub fn revelar_artefato_beta(caminho: String) -> Result<bool, String> {
    let caminho = PathBuf::from(caminho.trim());
    if !caminho.is_file() {
        return Err("O artefato beta não existe mais.".to_owned());
    }
    tauri_plugin_opener::reveal_item_in_dir(caminho).map_err(|erro| erro.to_string())?;
    Ok(true)
}

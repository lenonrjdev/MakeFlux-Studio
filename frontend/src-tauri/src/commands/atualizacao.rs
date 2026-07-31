use std::{
    fs,
    path::{Path, PathBuf},
    process::Command,
    time::{SystemTime, UNIX_EPOCH},
};

use crate::models::{EstadoRepositorioMotor, RegistroRollback, ResultadoAtualizacaoMotor};

fn executar_git(diretorio: &Path, argumentos: &[&str]) -> Result<String, String> {
    let saida = Command::new("git")
        .current_dir(diretorio)
        .args(argumentos)
        .output()
        .map_err(|erro| format!("Falha ao executar Git: {erro}"))?;
    if !saida.status.success() {
        let erro = String::from_utf8_lossy(&saida.stderr).trim().to_owned();
        return Err(if erro.is_empty() {
            "O Git retornou uma falha sem detalhes.".to_owned()
        } else {
            erro
        });
    }
    Ok(String::from_utf8_lossy(&saida.stdout).trim().to_owned())
}

fn validar_repositorio(diretorio: &str) -> Result<PathBuf, String> {
    let caminho = PathBuf::from(diretorio);
    if !caminho.join(".git").exists() || !caminho.join("main.py").is_file() {
        return Err(
            "A pasta não parece ser um repositório válido do MoneyPrinterTurbo.".to_owned(),
        );
    }
    Ok(caminho)
}

fn caminho_rollback(diretorio: &Path) -> PathBuf {
    diretorio.join(".makeflux").join("rollback.json")
}

fn ler_rollback(diretorio: &Path) -> Option<RegistroRollback> {
    fs::read_to_string(caminho_rollback(diretorio))
        .ok()
        .and_then(|texto| serde_json::from_str(&texto).ok())
}

fn salvar_rollback(diretorio: &Path, registro: &RegistroRollback) -> Result<(), String> {
    let caminho = caminho_rollback(diretorio);
    if let Some(pasta) = caminho.parent() {
        fs::create_dir_all(pasta).map_err(|erro| erro.to_string())?;
    }
    let texto = serde_json::to_string_pretty(registro).map_err(|erro| erro.to_string())?;
    fs::write(caminho, texto).map_err(|erro| erro.to_string())
}

fn segundos_agora() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or_default()
}

#[tauri::command]
pub fn inspecionar_repositorio_motor(diretorio: String) -> Result<EstadoRepositorioMotor, String> {
    let caminho = validar_repositorio(&diretorio)?;
    let branch = executar_git(&caminho, &["branch", "--show-current"])?;
    let commit_atual = executar_git(&caminho, &["rev-parse", "HEAD"])?;
    let remoto = executar_git(&caminho, &["remote", "get-url", "origin"]).ok();
    let limpo = executar_git(&caminho, &["status", "--porcelain"])?.is_empty();
    let referencia = if branch.is_empty() {
        "origin/main".to_owned()
    } else {
        format!("origin/{branch}")
    };
    let commits_pendentes = executar_git(
        &caminho,
        &["rev-list", "--count", &format!("HEAD..{referencia}")],
    )
    .ok()
    .and_then(|valor| valor.parse::<u32>().ok())
    .unwrap_or_default();
    let rollback = ler_rollback(&caminho);

    Ok(EstadoRepositorioMotor {
        valido: true,
        diretorio,
        branch,
        commit_atual,
        remoto,
        limpo,
        commits_pendentes,
        atualizacao_disponivel: commits_pendentes > 0,
        rollback_disponivel: rollback.is_some(),
        rollback,
        mensagem: if limpo {
            "Repositório pronto para atualização segura.".to_owned()
        } else {
            "Existem alterações locais; a atualização foi bloqueada para proteger seus arquivos."
                .to_owned()
        },
    })
}

#[tauri::command]
pub fn verificar_atualizacao_motor(diretorio: String) -> Result<EstadoRepositorioMotor, String> {
    let caminho = validar_repositorio(&diretorio)?;
    executar_git(&caminho, &["fetch", "origin", "--tags", "--prune"])?;
    inspecionar_repositorio_motor(diretorio)
}

#[tauri::command]
pub fn atualizar_motor_seguro(diretorio: String) -> Result<ResultadoAtualizacaoMotor, String> {
    let caminho = validar_repositorio(&diretorio)?;
    let estado = inspecionar_repositorio_motor(diretorio.clone())?;
    if !estado.limpo {
        return Err(
            "Atualização cancelada: salve ou reverta as alterações locais do motor.".to_owned(),
        );
    }
    if estado.branch.is_empty() {
        return Err("Atualização cancelada: o repositório está em HEAD destacado.".to_owned());
    }

    executar_git(&caminho, &["fetch", "origin", "--tags", "--prune"])?;
    let commit_anterior = executar_git(&caminho, &["rev-parse", "HEAD"])?;
    let branch_backup = format!("makeflux-backup-{}", segundos_agora());
    executar_git(&caminho, &["branch", &branch_backup, &commit_anterior])?;
    let registro = RegistroRollback {
        commit: commit_anterior.clone(),
        branch: estado.branch.clone(),
        criado_em: segundos_agora().to_string(),
        branch_backup: branch_backup.clone(),
    };
    salvar_rollback(&caminho, &registro)?;
    executar_git(
        &caminho,
        &["merge", "--ff-only", &format!("origin/{}", estado.branch)],
    )?;
    let commit_atual = executar_git(&caminho, &["rev-parse", "HEAD"])?;

    Ok(ResultadoAtualizacaoMotor {
        sucesso: true,
        commit_anterior,
        commit_atual,
        branch_backup: Some(branch_backup),
        mensagem: "Motor atualizado por fast-forward. O ponto de rollback foi preservado."
            .to_owned(),
    })
}

#[tauri::command]
pub fn rollback_motor_seguro(diretorio: String) -> Result<ResultadoAtualizacaoMotor, String> {
    let caminho = validar_repositorio(&diretorio)?;
    let registro = ler_rollback(&caminho)
        .ok_or_else(|| "Nenhum ponto de rollback foi encontrado.".to_owned())?;
    let limpo = executar_git(&caminho, &["status", "--porcelain"])?.is_empty();
    if !limpo {
        return Err("Rollback cancelado: existem alterações locais no motor.".to_owned());
    }
    let commit_anterior = executar_git(&caminho, &["rev-parse", "HEAD"])?;
    executar_git(&caminho, &["reset", "--hard", &registro.commit])?;
    let commit_atual = executar_git(&caminho, &["rev-parse", "HEAD"])?;

    Ok(ResultadoAtualizacaoMotor {
        sucesso: true,
        commit_anterior,
        commit_atual,
        branch_backup: Some(registro.branch_backup),
        mensagem: "Rollback concluído. A referência de backup continua disponível no Git."
            .to_owned(),
    })
}

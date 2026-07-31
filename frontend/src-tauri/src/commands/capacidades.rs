use std::{
    env,
    process::Command,
    time::{SystemTime, UNIX_EPOCH},
};

use sysinfo::System;

use crate::models::{CapacidadesSistema, ExecutavelDetectado};

fn agora_iso_simples() -> String {
    let segundos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duracao| duracao.as_secs())
        .unwrap_or_default();
    segundos.to_string()
}

fn localizar_executavel(nome: &str, argumento_versao: &str) -> ExecutavelDetectado {
    let localizador = if cfg!(target_os = "windows") {
        "where"
    } else {
        "which"
    };
    let caminho = Command::new(localizador)
        .arg(nome)
        .output()
        .ok()
        .filter(|saida| saida.status.success())
        .and_then(|saida| String::from_utf8(saida.stdout).ok())
        .and_then(|texto| texto.lines().next().map(str::trim).map(str::to_owned))
        .filter(|texto| !texto.is_empty());

    let versao = caminho.as_ref().and_then(|executavel| {
        Command::new(executavel)
            .arg(argumento_versao)
            .output()
            .ok()
            .filter(|saida| saida.status.success())
            .and_then(|saida| {
                let texto = if saida.stdout.is_empty() {
                    saida.stderr
                } else {
                    saida.stdout
                };
                String::from_utf8(texto).ok()
            })
            .and_then(|texto| texto.lines().next().map(str::trim).map(str::to_owned))
            .filter(|texto| !texto.is_empty())
    });

    ExecutavelDetectado {
        nome: nome.to_owned(),
        disponivel: caminho.is_some(),
        caminho,
        versao,
    }
}

fn detectar_gpu() -> Option<String> {
    #[cfg(target_os = "windows")]
    {
        return Command::new("powershell")
            .args([
                "-NoProfile",
                "-Command",
                "(Get-CimInstance Win32_VideoController | Select-Object -ExpandProperty Name) -join ' | '",
            ])
            .output()
            .ok()
            .filter(|saida| saida.status.success())
            .and_then(|saida| String::from_utf8(saida.stdout).ok())
            .map(|texto| texto.trim().to_owned())
            .filter(|texto| !texto.is_empty());
    }

    #[cfg(not(target_os = "windows"))]
    {
        Command::new("sh")
            .args([
                "-lc",
                "lspci 2>/dev/null | grep -Ei 'vga|3d|display' | head -n 2",
            ])
            .output()
            .ok()
            .filter(|saida| saida.status.success())
            .and_then(|saida| String::from_utf8(saida.stdout).ok())
            .map(|texto| texto.trim().to_owned())
            .filter(|texto| !texto.is_empty())
    }
}

#[tauri::command]
pub fn detectar_capacidades_sistema() -> Result<CapacidadesSistema, String> {
    let mut sistema = System::new_all();
    sistema.refresh_all();

    let python = localizar_executavel("python", "--version");
    let ffmpeg = localizar_executavel("ffmpeg", "-version");
    let git = localizar_executavel("git", "--version");
    let uv = localizar_executavel("uv", "--version");
    let modo_offline_pronto = python.disponivel && ffmpeg.disponivel;

    Ok(CapacidadesSistema {
        sistema_operacional: env::consts::OS.to_owned(),
        arquitetura: env::consts::ARCH.to_owned(),
        nucleos_logicos: sistema.cpus().len(),
        memoria_total_mb: sistema.total_memory() / 1024 / 1024,
        gpu: detectar_gpu(),
        python,
        ffmpeg,
        git,
        uv,
        modo_offline_pronto,
        detectado_em: agora_iso_simples(),
    })
}

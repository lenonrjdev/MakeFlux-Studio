use std::{
    fs::{self, OpenOptions},
    path::{Path, PathBuf},
    process::{Command, Stdio},
    time::{SystemTime, UNIX_EPOCH},
};

use tauri::State;

use crate::{
    models::{EstadoMotor, SolicitacaoIniciarMotor},
    state::{EstadoProcessoMotor, ProcessoMotor},
};

fn agora() -> String {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duracao| duracao.as_secs().to_string())
        .unwrap_or_else(|_| "0".to_owned())
}

fn caminho_log(diretorio: &Path) -> Result<PathBuf, String> {
    let pasta = diretorio.join(".makeflux").join("logs");
    fs::create_dir_all(&pasta).map_err(|erro| format!("Falha ao criar pasta de logs: {erro}"))?;
    Ok(pasta.join("moneyprinter.log"))
}

#[tauri::command]
pub fn iniciar_motor_moneyprinter(
    solicitacao: SolicitacaoIniciarMotor,
    estado: State<'_, EstadoProcessoMotor>,
) -> Result<EstadoMotor, String> {
    let diretorio = PathBuf::from(&solicitacao.diretorio);
    if !diretorio.join("main.py").is_file() {
        return Err(
            "A pasta selecionada não contém o arquivo main.py do MoneyPrinterTurbo.".to_owned(),
        );
    }

    let mut bloqueio = estado
        .0
        .lock()
        .map_err(|_| "Estado do motor indisponível.".to_owned())?;
    if let Some(processo) = bloqueio.as_mut() {
        if processo
            .child
            .try_wait()
            .map_err(|erro| erro.to_string())?
            .is_none()
        {
            return Ok(EstadoMotor {
                executando: true,
                pid: Some(processo.child.id()),
                diretorio: Some(processo.diretorio.clone()),
                iniciado_em: Some(processo.iniciado_em.clone()),
                log: Some(processo.log.clone()),
            });
        }
        *bloqueio = None;
    }

    let log = caminho_log(&diretorio)?;
    let saida = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&log)
        .map_err(|erro| format!("Falha ao abrir o log do motor: {erro}"))?;
    let erro = saida.try_clone().map_err(|erro| erro.to_string())?;
    let python = solicitacao
        .python
        .filter(|valor| !valor.trim().is_empty())
        .unwrap_or_else(|| "python".to_owned());
    let mut comando = Command::new(python);
    comando.current_dir(&diretorio).arg("main.py");
    for argumento in solicitacao.argumentos.unwrap_or_default() {
        comando.arg(argumento);
    }
    comando
        .stdin(Stdio::null())
        .stdout(Stdio::from(saida))
        .stderr(Stdio::from(erro));

    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        comando.creation_flags(0x08000000);
    }

    let child = comando
        .spawn()
        .map_err(|erro| format!("Não foi possível iniciar o motor: {erro}"))?;
    let processo = ProcessoMotor {
        child,
        diretorio: diretorio.to_string_lossy().to_string(),
        iniciado_em: agora(),
        log: log.to_string_lossy().to_string(),
    };
    let resultado = EstadoMotor {
        executando: true,
        pid: Some(processo.child.id()),
        diretorio: Some(processo.diretorio.clone()),
        iniciado_em: Some(processo.iniciado_em.clone()),
        log: Some(processo.log.clone()),
    };
    *bloqueio = Some(processo);
    Ok(resultado)
}

#[tauri::command]
pub fn status_motor_moneyprinter(
    estado: State<'_, EstadoProcessoMotor>,
) -> Result<EstadoMotor, String> {
    let mut bloqueio = estado
        .0
        .lock()
        .map_err(|_| "Estado do motor indisponível.".to_owned())?;
    let Some(processo) = bloqueio.as_mut() else {
        return Ok(EstadoMotor {
            executando: false,
            pid: None,
            diretorio: None,
            iniciado_em: None,
            log: None,
        });
    };
    if processo
        .child
        .try_wait()
        .map_err(|erro| erro.to_string())?
        .is_some()
    {
        let diretorio = processo.diretorio.clone();
        let iniciado_em = processo.iniciado_em.clone();
        let log = processo.log.clone();
        *bloqueio = None;
        return Ok(EstadoMotor {
            executando: false,
            pid: None,
            diretorio: Some(diretorio),
            iniciado_em: Some(iniciado_em),
            log: Some(log),
        });
    }
    Ok(EstadoMotor {
        executando: true,
        pid: Some(processo.child.id()),
        diretorio: Some(processo.diretorio.clone()),
        iniciado_em: Some(processo.iniciado_em.clone()),
        log: Some(processo.log.clone()),
    })
}

#[tauri::command]
pub fn parar_motor_moneyprinter(
    estado: State<'_, EstadoProcessoMotor>,
) -> Result<EstadoMotor, String> {
    let mut bloqueio = estado
        .0
        .lock()
        .map_err(|_| "Estado do motor indisponível.".to_owned())?;
    if let Some(mut processo) = bloqueio.take() {
        processo
            .child
            .kill()
            .map_err(|erro| format!("Falha ao encerrar o motor: {erro}"))?;
        let _ = processo.child.wait();
        return Ok(EstadoMotor {
            executando: false,
            pid: None,
            diretorio: Some(processo.diretorio),
            iniciado_em: Some(processo.iniciado_em),
            log: Some(processo.log),
        });
    }
    Ok(EstadoMotor {
        executando: false,
        pid: None,
        diretorio: None,
        iniciado_em: None,
        log: None,
    })
}

use serde::Serialize;
use std::{
    env, fs,
    path::{Path, PathBuf},
    process::{Command, Output},
    time::{SystemTime, UNIX_EPOCH},
};
use tauri::{AppHandle, Manager};

const REPOSITORIO_MONEYPRINTER: &str = "https://github.com/harry0703/MoneyPrinterTurbo.git";

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DependenciaInstalacao {
    id: String,
    nome: String,
    obrigatoria: bool,
    disponivel: bool,
    caminho: Option<String>,
    versao: Option<String>,
    pacote_winget: String,
    mensagem: String,
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct EstruturaWorkspaceInstalacao {
    raiz: String,
    motores: String,
    projetos: String,
    exportacoes: String,
    cache: String,
    modelos: String,
    logs: String,
    criada: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DiagnosticoInstalacaoAssistida {
    desktop: bool,
    windows: bool,
    winget_disponivel: bool,
    winget_versao: Option<String>,
    dependencias: Vec<DependenciaInstalacao>,
    workspace: Option<EstruturaWorkspaceInstalacao>,
    diretorio_money_printer: Option<String>,
    money_printer_detectado: bool,
    ambiente_python_pronto: bool,
    config_criada: bool,
    pronto_para_motor: bool,
    pronto_para_producao: bool,
    mensagem: String,
    detectado_em: u64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ResultadoOperacaoInstalacao {
    sucesso: bool,
    operacao: String,
    mensagem: String,
    detalhes: String,
    caminho: Option<String>,
    reinicio_recomendado: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ResultadoInstalacaoMoneyPrinter {
    sucesso: bool,
    operacao: String,
    mensagem: String,
    detalhes: String,
    caminho: Option<String>,
    reinicio_recomendado: bool,
    diretorio: String,
    python_executavel: String,
    config: String,
    clonado: bool,
    ambiente_sincronizado: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ValidacaoMoneyPrinterAssistida {
    valido: bool,
    diretorio: String,
    python_executavel: Option<String>,
    python_versao: Option<String>,
    main_py: bool,
    pyproject: bool,
    uv_lock: bool,
    config: bool,
    ffmpeg: bool,
    image_magick: bool,
    mensagem: String,
}

fn agora() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duracao| duracao.as_millis() as u64)
        .unwrap_or_default()
}

fn texto_saida(saida: &Output) -> String {
    let stdout = String::from_utf8_lossy(&saida.stdout).trim().to_owned();
    let stderr = String::from_utf8_lossy(&saida.stderr).trim().to_owned();
    match (stdout.is_empty(), stderr.is_empty()) {
        (false, false) => format!("{stdout}\n{stderr}"),
        (false, true) => stdout,
        (true, false) => stderr,
        (true, true) => "Comando concluído sem saída textual.".to_owned(),
    }
}

fn comando_sem_janela(comando: &mut Command) {
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        comando.creation_flags(0x08000000);
    }
}

fn executar(mut comando: Command, descricao: &str) -> Result<String, String> {
    comando_sem_janela(&mut comando);
    let saida = comando
        .output()
        .map_err(|erro| format!("Não foi possível executar {descricao}: {erro}"))?;
    let texto = texto_saida(&saida);
    if saida.status.success() {
        Ok(texto)
    } else {
        Err(format!(
            "{descricao} falhou com código {:?}. {texto}",
            saida.status.code()
        ))
    }
}

fn candidatos_comuns(nome: &str) -> Vec<PathBuf> {
    let mut candidatos = Vec::new();
    if !cfg!(target_os = "windows") {
        return candidatos;
    }
    let local_app_data = env::var_os("LOCALAPPDATA").map(PathBuf::from);
    let user_profile = env::var_os("USERPROFILE").map(PathBuf::from);
    let program_files = env::var_os("ProgramFiles").map(PathBuf::from);
    let program_files_x86 = env::var_os("ProgramFiles(x86)").map(PathBuf::from);
    match nome {
        "winget" => {
            if let Some(base) = &local_app_data {
                candidatos.push(
                    base.join("Microsoft")
                        .join("WindowsApps")
                        .join("winget.exe"),
                );
            }
        }
        "git" => {
            if let Some(base) = &program_files {
                candidatos.push(base.join("Git").join("cmd").join("git.exe"));
            }
        }
        "python" => {
            if let Some(base) = &local_app_data {
                candidatos.push(
                    base.join("Programs")
                        .join("Python")
                        .join("Python311")
                        .join("python.exe"),
                );
                candidatos.push(
                    base.join("Microsoft")
                        .join("WindowsApps")
                        .join("python.exe"),
                );
            }
        }
        "uv" => {
            if let Some(base) = &user_profile {
                candidatos.push(base.join(".local").join("bin").join("uv.exe"));
            }
            if let Some(base) = &local_app_data {
                candidatos.push(
                    base.join("Microsoft")
                        .join("WinGet")
                        .join("Links")
                        .join("uv.exe"),
                );
            }
        }
        "ffmpeg" => {
            if let Some(base) = &local_app_data {
                candidatos.push(
                    base.join("Microsoft")
                        .join("WinGet")
                        .join("Links")
                        .join("ffmpeg.exe"),
                );
            }
            if let Some(base) = &program_files {
                candidatos.push(base.join("WinGet").join("Links").join("ffmpeg.exe"));
            }
        }
        "magick" => {
            for base in [program_files, program_files_x86].into_iter().flatten() {
                if let Ok(entradas) = fs::read_dir(base) {
                    for entrada in entradas.flatten() {
                        let nome_pasta = entrada.file_name().to_string_lossy().to_string();
                        if nome_pasta.starts_with("ImageMagick-") {
                            candidatos.push(entrada.path().join("magick.exe"));
                        }
                    }
                }
            }
        }
        _ => {}
    }
    candidatos
}

fn localizar(nome: &str, argumento: &str) -> (bool, Option<String>, Option<String>) {
    let localizador = if cfg!(target_os = "windows") {
        "where"
    } else {
        "which"
    };
    let caminho_localizador = Command::new(localizador)
        .arg(nome)
        .output()
        .ok()
        .filter(|saida| saida.status.success())
        .and_then(|saida| String::from_utf8(saida.stdout).ok())
        .and_then(|texto| texto.lines().next().map(str::trim).map(str::to_owned))
        .filter(|texto| !texto.is_empty());
    let caminho = caminho_localizador.or_else(|| {
        candidatos_comuns(nome)
            .into_iter()
            .find(|candidato| candidato.is_file())
            .map(|candidato| candidato.to_string_lossy().to_string())
    });
    let versao = caminho.as_ref().and_then(|executavel| {
        let mut comando = Command::new(executavel);
        comando.arg(argumento);
        comando_sem_janela(&mut comando);
        comando
            .output()
            .ok()
            .filter(|saida| saida.status.success())
            .map(|saida| texto_saida(&saida))
            .and_then(|texto| texto.lines().next().map(str::trim).map(str::to_owned))
    });
    (versao.is_some(), caminho, versao)
}

fn executavel_localizado(nome: &str, argumento: &str) -> Result<PathBuf, String> {
    let (_, caminho, versao) = localizar(nome, argumento);
    let caminho = caminho.ok_or_else(|| format!("O executável {nome} não foi localizado."))?;
    if versao.is_none() {
        return Err(format!(
            "O caminho encontrado para {nome} não respondeu corretamente: {caminho}."
        ));
    }
    Ok(PathBuf::from(caminho))
}

fn dependencia(
    id: &str,
    nome: &str,
    executavel: &str,
    argumento: &str,
    pacote: &str,
    obrigatoria: bool,
) -> DependenciaInstalacao {
    let (disponivel, caminho, versao) = localizar(executavel, argumento);
    DependenciaInstalacao {
        id: id.to_owned(),
        nome: nome.to_owned(),
        obrigatoria,
        disponivel,
        caminho,
        versao,
        pacote_winget: pacote.to_owned(),
        mensagem: if disponivel {
            "Dependência detectada no computador.".to_owned()
        } else {
            format!("Instale o pacote aprovado {pacote}.")
        },
    }
}

fn valor_toml_caminho(caminho: &str) -> String {
    caminho.replace('\\', "\\\\").replace('"', "\\\"")
}

fn definir_caminho_config(config: &Path, chave: &str, caminho: &str) -> Result<(), String> {
    let conteudo = fs::read_to_string(config)
        .map_err(|erro| format!("Não foi possível ler {}: {erro}", config.display()))?;
    let nova_linha = format!("{chave} = \"{}\"", valor_toml_caminho(caminho));
    let mut substituiu = false;
    let mut linhas = Vec::new();
    for linha in conteudo.lines() {
        let limpa = linha.trim_start().trim_start_matches('#').trim_start();
        if limpa.starts_with(&format!("{chave} =")) {
            if !substituiu {
                linhas.push(nova_linha.clone());
                substituiu = true;
            }
        } else {
            linhas.push(linha.to_owned());
        }
    }
    if !substituiu {
        let posicao = linhas
            .iter()
            .position(|linha| linha.trim() == "[app]")
            .map(|indice| indice + 1)
            .unwrap_or(0);
        linhas.insert(posicao, nova_linha);
    }
    fs::write(config, format!("{}\n", linhas.join("\n")))
        .map_err(|erro| format!("Não foi possível atualizar {}: {erro}", config.display()))
}

fn resolver_raiz(app: &AppHandle, raiz_workspace: Option<String>) -> Result<PathBuf, String> {
    if let Some(raiz) = raiz_workspace
        .map(|valor| valor.trim().to_owned())
        .filter(|valor| !valor.is_empty())
    {
        return Ok(PathBuf::from(raiz));
    }
    let documentos = app
        .path()
        .document_dir()
        .or_else(|_| app.path().app_local_data_dir())
        .map_err(|erro| format!("Não foi possível localizar uma pasta padrão: {erro}"))?;
    Ok(documentos.join("MakeFlux Studio"))
}

fn estrutura(raiz: &Path, criar: bool) -> Result<EstruturaWorkspaceInstalacao, String> {
    let motores = raiz.join("Motores");
    let projetos = raiz.join("Projetos");
    let exportacoes = raiz.join("Exportacoes");
    let cache = raiz.join("Cache");
    let modelos = raiz.join("Modelos");
    let logs = raiz.join("Logs");
    if criar {
        for pasta in [&motores, &projetos, &exportacoes, &cache, &modelos, &logs] {
            fs::create_dir_all(pasta)
                .map_err(|erro| format!("Não foi possível criar {}: {erro}", pasta.display()))?;
        }
    }
    Ok(EstruturaWorkspaceInstalacao {
        raiz: raiz.to_string_lossy().to_string(),
        motores: motores.to_string_lossy().to_string(),
        projetos: projetos.to_string_lossy().to_string(),
        exportacoes: exportacoes.to_string_lossy().to_string(),
        cache: cache.to_string_lossy().to_string(),
        modelos: modelos.to_string_lossy().to_string(),
        logs: logs.to_string_lossy().to_string(),
        criada: raiz.is_dir() && motores.is_dir() && projetos.is_dir() && exportacoes.is_dir(),
    })
}

fn diretorio_motor(estrutura: &EstruturaWorkspaceInstalacao) -> PathBuf {
    PathBuf::from(&estrutura.motores).join("MoneyPrinterTurbo")
}

#[tauri::command]
pub fn diagnosticar_instalacao_assistida(
    app: AppHandle,
    raiz_workspace: Option<String>,
) -> Result<DiagnosticoInstalacaoAssistida, String> {
    let windows = cfg!(target_os = "windows");
    let (winget_disponivel, _, winget_versao) = localizar("winget", "--version");
    let dependencias = vec![
        dependencia("git", "Git", "git", "--version", "Git.Git", true),
        dependencia(
            "python",
            "Python 3.11",
            "python",
            "--version",
            "Python.Python.3.11",
            false,
        ),
        dependencia(
            "ffmpeg",
            "FFmpeg",
            "ffmpeg",
            "-version",
            "Gyan.FFmpeg",
            true,
        ),
        dependencia("uv", "uv", "uv", "--version", "astral-sh.uv", true),
        dependencia(
            "imagemagick",
            "ImageMagick",
            "magick",
            "-version",
            "ImageMagick.ImageMagick",
            true,
        ),
    ];
    let raiz = resolver_raiz(&app, raiz_workspace)?;
    let workspace = estrutura(&raiz, false)?;
    let motor = diretorio_motor(&workspace);
    let money_printer_detectado =
        motor.join("main.py").is_file() && motor.join("pyproject.toml").is_file();
    let python_venv = motor.join(".venv").join("Scripts").join("python.exe");
    let ambiente_python_pronto = python_venv.is_file();
    let config_criada = motor.join("config.toml").is_file();
    let obrigatorias_prontas = dependencias
        .iter()
        .filter(|item| item.obrigatoria)
        .all(|item| item.disponivel);
    let pronto_para_motor = windows && workspace.criada && obrigatorias_prontas;
    let pronto_para_producao =
        pronto_para_motor && money_printer_detectado && ambiente_python_pronto && config_criada;
    let mensagem = if pronto_para_producao {
        "Ambiente preparado para iniciar o MoneyPrinterTurbo e produzir vídeos.".to_owned()
    } else if !workspace.criada {
        "Comece preparando o workspace permanente do MakeFlux Studio.".to_owned()
    } else if !obrigatorias_prontas {
        "Existem dependências obrigatórias pendentes.".to_owned()
    } else if !money_printer_detectado {
        "As dependências estão prontas. Instale o MoneyPrinterTurbo.".to_owned()
    } else {
        "O motor foi detectado, mas o ambiente Python ou a configuração ainda precisa ser sincronizado.".to_owned()
    };
    Ok(DiagnosticoInstalacaoAssistida {
        desktop: true,
        windows,
        winget_disponivel,
        winget_versao,
        dependencias,
        workspace: if workspace.criada {
            Some(workspace)
        } else {
            None
        },
        diretorio_money_printer: if money_printer_detectado {
            Some(motor.to_string_lossy().to_string())
        } else {
            None
        },
        money_printer_detectado,
        ambiente_python_pronto,
        config_criada,
        pronto_para_motor,
        pronto_para_producao,
        mensagem,
        detectado_em: agora(),
    })
}

#[tauri::command]
pub fn preparar_workspace_assistido(
    app: AppHandle,
    raiz_workspace: Option<String>,
) -> Result<EstruturaWorkspaceInstalacao, String> {
    let raiz = resolver_raiz(&app, raiz_workspace)?;
    estrutura(&raiz, true)
}

#[tauri::command]
pub async fn instalar_dependencia_assistida(
    dependencia: String,
) -> Result<ResultadoOperacaoInstalacao, String> {
    if !cfg!(target_os = "windows") {
        return Err(
            "A instalação automática desta fase está disponível somente no Windows.".to_owned(),
        );
    }
    let (nome, pacote) = match dependencia.as_str() {
        "git" => ("Git", "Git.Git"),
        "python" => ("Python 3.11", "Python.Python.3.11"),
        "ffmpeg" => ("FFmpeg", "Gyan.FFmpeg"),
        "uv" => ("uv", "astral-sh.uv"),
        "imagemagick" => ("ImageMagick", "ImageMagick.ImageMagick"),
        _ => {
            return Err("Dependência não autorizada pelo assistente do MakeFlux Studio.".to_owned())
        }
    };
    let dependencia_id = dependencia.clone();
    let winget = executavel_localizado("winget", "--version")?;
    let saida = tauri::async_runtime::spawn_blocking(move || {
        let mut comando = Command::new(&winget);
        comando.args([
            "install",
            "--id",
            pacote,
            "--exact",
            "--source",
            "winget",
            "--accept-package-agreements",
            "--accept-source-agreements",
            "--silent",
            "--disable-interactivity",
        ]);
        executar(comando, &format!("instalação de {nome}"))
    })
    .await
    .map_err(|erro| format!("A tarefa de instalação foi interrompida: {erro}"))??;
    Ok(ResultadoOperacaoInstalacao {
        sucesso: true,
        operacao: format!("instalar-{dependencia_id}"),
        mensagem: format!("{nome} instalado. Uma nova detecção confirmará o caminho disponível."),
        detalhes: saida,
        caminho: None,
        reinicio_recomendado: true,
    })
}

#[tauri::command]
pub async fn instalar_moneyprinter_assistido(
    app: AppHandle,
    raiz_workspace: String,
) -> Result<ResultadoInstalacaoMoneyPrinter, String> {
    let raiz = resolver_raiz(&app, Some(raiz_workspace))?;
    let workspace = estrutura(&raiz, true)?;
    let destino = diretorio_motor(&workspace);
    let clonado = !destino.exists();
    let destino_tarefa = destino.clone();
    let detalhes = tauri::async_runtime::spawn_blocking(move || -> Result<String, String> {
        let mut historico = Vec::new();
        if !destino_tarefa.exists() {
            let git_executavel = executavel_localizado("git", "--version")?;
            let mut git = Command::new(git_executavel);
            git.args(["clone", "--depth", "1", REPOSITORIO_MONEYPRINTER])
                .arg(&destino_tarefa);
            historico.push(executar(git, "clone do MoneyPrinterTurbo")?);
        } else if !destino_tarefa.join(".git").is_dir() || !destino_tarefa.join("main.py").is_file()
        {
            return Err(format!(
                "A pasta {} já existe, mas não contém uma instalação válida do MoneyPrinterTurbo.",
                destino_tarefa.display()
            ));
        }
        let exemplo = destino_tarefa.join("config.example.toml");
        let config = destino_tarefa.join("config.toml");
        if !config.exists() {
            if !exemplo.is_file() {
                return Err("O repositório não contém config.example.toml.".to_owned());
            }
            fs::copy(&exemplo, &config)
                .map_err(|erro| format!("Não foi possível criar config.toml: {erro}"))?;
            historico.push("config.toml criado a partir do exemplo oficial.".to_owned());
        }
        if let (_, Some(caminho_magick), _) = localizar("magick", "-version") {
            definir_caminho_config(&config, "imagemagick_path", &caminho_magick)?;
            historico.push("Caminho do ImageMagick registrado no config.toml.".to_owned());
        }
        if let (_, Some(caminho_ffmpeg), _) = localizar("ffmpeg", "-version") {
            definir_caminho_config(&config, "ffmpeg_path", &caminho_ffmpeg)?;
            historico.push("Caminho do FFmpeg registrado no config.toml.".to_owned());
        }
        let uv_executavel = executavel_localizado("uv", "--version")?;
        let mut uv_python = Command::new(&uv_executavel);
        uv_python
            .current_dir(&destino_tarefa)
            .args(["python", "install", "3.11"]);
        historico.push(executar(uv_python, "instalação do Python 3.11 pelo uv")?);
        let mut uv_sync = Command::new(&uv_executavel);
        uv_sync
            .current_dir(&destino_tarefa)
            .args(["sync", "--frozen"]);
        historico.push(executar(
            uv_sync,
            "sincronização do ambiente MoneyPrinterTurbo",
        )?);
        Ok(historico.join("\n\n"))
    })
    .await
    .map_err(|erro| format!("A instalação do motor foi interrompida: {erro}"))??;
    let python = destino.join(".venv").join("Scripts").join("python.exe");
    if !python.is_file() {
        return Err("O uv concluiu sem criar .venv\\Scripts\\python.exe.".to_owned());
    }
    let config = destino.join("config.toml");
    Ok(ResultadoInstalacaoMoneyPrinter {
        sucesso: true,
        operacao: "instalar-moneyprinter".to_owned(),
        mensagem: "MoneyPrinterTurbo instalado e ambiente Python sincronizado.".to_owned(),
        detalhes,
        caminho: Some(destino.to_string_lossy().to_string()),
        reinicio_recomendado: false,
        diretorio: destino.to_string_lossy().to_string(),
        python_executavel: python.to_string_lossy().to_string(),
        config: config.to_string_lossy().to_string(),
        clonado,
        ambiente_sincronizado: true,
    })
}

#[tauri::command]
pub async fn validar_moneyprinter_assistido(
    diretorio: String,
) -> Result<ValidacaoMoneyPrinterAssistida, String> {
    let caminho = PathBuf::from(diretorio.trim());
    if caminho.as_os_str().is_empty() {
        return Err("Nenhum diretório do MoneyPrinterTurbo foi informado.".to_owned());
    }
    let python = caminho.join(".venv").join("Scripts").join("python.exe");
    let python_versao = if python.is_file() {
        let python_tarefa = python.clone();
        tauri::async_runtime::spawn_blocking(move || {
            let mut comando = Command::new(&python_tarefa);
            comando.arg("--version");
            executar(comando, "validação do Python do motor")
        })
        .await
        .map_err(|erro| format!("A validação do ambiente foi interrompida: {erro}"))?
        .ok()
    } else {
        None
    };
    let main_py = caminho.join("main.py").is_file();
    let pyproject = caminho.join("pyproject.toml").is_file();
    let uv_lock = caminho.join("uv.lock").is_file();
    let config = caminho.join("config.toml").is_file();
    let (ffmpeg, _, _) = localizar("ffmpeg", "-version");
    let (image_magick, _, _) = localizar("magick", "-version");
    let valido = main_py
        && pyproject
        && uv_lock
        && config
        && python_versao.is_some()
        && ffmpeg
        && image_magick;
    Ok(ValidacaoMoneyPrinterAssistida {
        valido,
        diretorio: caminho.to_string_lossy().to_string(),
        python_executavel: if python.is_file() {
            Some(python.to_string_lossy().to_string())
        } else {
            None
        },
        python_versao,
        main_py,
        pyproject,
        uv_lock,
        config,
        ffmpeg,
        image_magick,
        mensagem: if valido {
            "Instalação técnica validada. O motor pode ser iniciado pelo MakeFlux Studio."
                .to_owned()
        } else {
            "A instalação ainda possui itens pendentes. Revise a lista antes de iniciar a API."
                .to_owned()
        },
    })
}

#[tauri::command]
pub fn abrir_pasta_instalacao_assistida(caminho: String) -> Result<(), String> {
    let pasta = PathBuf::from(caminho.trim());
    if !pasta.is_dir() {
        return Err("A pasta informada não existe.".to_owned());
    }
    tauri_plugin_opener::open_path(&pasta, None::<&str>)
        .map_err(|erro| format!("Não foi possível abrir a pasta: {erro}"))
}

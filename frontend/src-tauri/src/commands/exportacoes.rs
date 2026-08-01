use serde::{Deserialize, Serialize};
use std::{
    fs,
    path::{Path, PathBuf},
};
use tauri::{AppHandle, Manager};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SolicitacaoPrepararExportacao {
    pub nome_projeto: String,
    pub tarefa_id: String,
    pub pasta_preferida: Option<String>,
    pub organizar_por_projeto: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PastaExportacaoPreparada {
    pub caminho: String,
    pub pasta_padrao: bool,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ArquivoOrigemExportacao {
    pub caminho: String,
    #[serde(rename = "tipo")]
    pub tipo_arquivo: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SolicitacaoConsolidarExportacao {
    pub pasta_saida: String,
    pub diretorio_motor: Option<String>,
    pub arquivos: Vec<ArquivoOrigemExportacao>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ArquivoExportado {
    pub nome: String,
    #[serde(rename = "tipo")]
    pub tipo_arquivo: String,
    pub caminho: String,
    pub tamanho_bytes: u64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ResultadoConsolidacaoExportacao {
    pub pasta_saida: String,
    pub arquivos: Vec<ArquivoExportado>,
    pub avisos: Vec<String>,
}

fn segmento_seguro(valor: &str, fallback: &str) -> String {
    let mut resultado = String::new();
    let mut separador = false;

    for caractere in valor.trim().chars().take(96) {
        if caractere.is_alphanumeric() {
            resultado.push(caractere);
            separador = false;
        } else if !separador && !resultado.is_empty() {
            resultado.push('-');
            separador = true;
        }
    }

    let normalizado = resultado.trim_matches('-');
    if normalizado.is_empty() {
        fallback.to_owned()
    } else {
        normalizado.to_owned()
    }
}

fn caminho_padrao_exportacoes(app: &AppHandle) -> Result<PathBuf, String> {
    let videos = app
        .path()
        .video_dir()
        .or_else(|_| app.path().app_local_data_dir())
        .map_err(|erro| format!("Não foi possível localizar a pasta de vídeos: {erro}"))?;
    Ok(videos.join("MakeFlux Studio").join("Exportacoes"))
}

fn caminho_texto(caminho: &Path) -> String {
    caminho.to_string_lossy().to_string()
}

fn resolver_origem(caminho: &str, diretorio_motor: Option<&str>) -> PathBuf {
    let caminho_limpo = caminho
        .trim()
        .strip_prefix("file:///")
        .unwrap_or(caminho.trim());
    let origem = PathBuf::from(caminho_limpo);
    if origem.is_absolute() {
        return origem;
    }

    if let Some(diretorio) = diretorio_motor.filter(|valor| !valor.trim().is_empty()) {
        return PathBuf::from(diretorio).join(origem);
    }

    origem
}

fn destino_disponivel(pasta: &Path, nome: &str) -> PathBuf {
    let candidato = pasta.join(nome);
    if !candidato.exists() {
        return candidato;
    }

    let origem = Path::new(nome);
    let stem = origem
        .file_stem()
        .and_then(|valor| valor.to_str())
        .unwrap_or("arquivo");
    let extensao = origem.extension().and_then(|valor| valor.to_str());

    for indice in 2..=999 {
        let nome_alternativo = match extensao {
            Some(extensao) => format!("{stem}-{indice}.{extensao}"),
            None => format!("{stem}-{indice}"),
        };
        let alternativo = pasta.join(nome_alternativo);
        if !alternativo.exists() {
            return alternativo;
        }
    }

    pasta.join(format!("{}-copia", segmento_seguro(nome, "arquivo")))
}

fn validar_caminho_existente(caminho: &str) -> Result<PathBuf, String> {
    let caminho = PathBuf::from(caminho.trim());
    if caminho.as_os_str().is_empty() {
        return Err("Nenhum caminho foi informado.".to_owned());
    }
    if !caminho.exists() {
        return Err(format!("O caminho não existe: {}", caminho_texto(&caminho)));
    }
    Ok(caminho)
}

#[tauri::command]
pub fn preparar_pasta_exportacao(
    app: AppHandle,
    solicitacao: SolicitacaoPrepararExportacao,
) -> Result<PastaExportacaoPreparada, String> {
    let pasta_preferida = solicitacao
        .pasta_preferida
        .as_deref()
        .map(str::trim)
        .filter(|valor| !valor.is_empty());
    let pasta_padrao = pasta_preferida.is_none();
    let mut pasta = match pasta_preferida {
        Some(caminho) => PathBuf::from(caminho),
        None => caminho_padrao_exportacoes(&app)?,
    };

    if solicitacao.organizar_por_projeto {
        pasta = pasta.join(segmento_seguro(&solicitacao.nome_projeto, "projeto"));
    }

    let identificador_tarefa: String = solicitacao
        .tarefa_id
        .chars()
        .filter(|caractere| caractere.is_alphanumeric())
        .take(18)
        .collect();
    pasta = pasta.join(if identificador_tarefa.is_empty() {
        "renderizacao".to_owned()
    } else {
        identificador_tarefa
    });

    fs::create_dir_all(&pasta).map_err(|erro| {
        format!(
            "Não foi possível criar a pasta de exportação {}: {erro}",
            caminho_texto(&pasta)
        )
    })?;

    Ok(PastaExportacaoPreparada {
        caminho: caminho_texto(&pasta),
        pasta_padrao,
    })
}

#[tauri::command]
pub fn consolidar_arquivos_exportacao(
    solicitacao: SolicitacaoConsolidarExportacao,
) -> Result<ResultadoConsolidacaoExportacao, String> {
    let pasta_saida = PathBuf::from(solicitacao.pasta_saida.trim());
    if pasta_saida.as_os_str().is_empty() {
        return Err("A pasta de saída da tarefa não foi definida.".to_owned());
    }
    fs::create_dir_all(&pasta_saida).map_err(|erro| {
        format!(
            "Não foi possível preparar a pasta de saída {}: {erro}",
            caminho_texto(&pasta_saida)
        )
    })?;

    let mut arquivos = Vec::new();
    let mut avisos = Vec::new();

    for arquivo in solicitacao.arquivos {
        let origem = resolver_origem(&arquivo.caminho, solicitacao.diretorio_motor.as_deref());
        if !origem.is_file() {
            avisos.push(format!(
                "Arquivo retornado pelo motor não foi encontrado: {}",
                caminho_texto(&origem)
            ));
            continue;
        }

        let nome = origem
            .file_name()
            .and_then(|valor| valor.to_str())
            .filter(|valor| !valor.trim().is_empty())
            .unwrap_or("arquivo-gerado");

        let origem_canonica = fs::canonicalize(&origem).unwrap_or_else(|_| origem.clone());
        let pasta_canonica = fs::canonicalize(&pasta_saida).unwrap_or_else(|_| pasta_saida.clone());
        let destino = if origem_canonica.parent() == Some(pasta_canonica.as_path()) {
            origem.clone()
        } else {
            let destino = destino_disponivel(&pasta_saida, nome);
            fs::copy(&origem, &destino).map_err(|erro| {
                format!(
                    "Não foi possível copiar {} para {}: {erro}",
                    caminho_texto(&origem),
                    caminho_texto(&destino)
                )
            })?;
            destino
        };

        let tamanho_bytes = fs::metadata(&destino)
            .map_err(|erro| format!("Não foi possível ler o arquivo exportado: {erro}"))?
            .len();
        let nome_destino = destino
            .file_name()
            .and_then(|valor| valor.to_str())
            .unwrap_or(nome)
            .to_owned();

        arquivos.push(ArquivoExportado {
            nome: nome_destino,
            tipo_arquivo: arquivo.tipo_arquivo,
            caminho: caminho_texto(&destino),
            tamanho_bytes,
        });
    }

    if arquivos.is_empty() {
        let detalhe = if avisos.is_empty() {
            "O MoneyPrinterTurbo não retornou arquivos finais.".to_owned()
        } else {
            avisos.join(" | ")
        };
        return Err(format!(
            "A renderização terminou, mas nenhum arquivo pôde ser salvo. {detalhe}"
        ));
    }

    Ok(ResultadoConsolidacaoExportacao {
        pasta_saida: caminho_texto(&pasta_saida),
        arquivos,
        avisos,
    })
}

#[tauri::command]
pub fn abrir_arquivo_exportado(caminho: String) -> Result<(), String> {
    let caminho = validar_caminho_existente(&caminho)?;
    if !caminho.is_file() {
        return Err("O caminho informado não é um arquivo.".to_owned());
    }
    tauri_plugin_opener::open_path(&caminho, None::<&str>)
        .map_err(|erro| format!("Não foi possível abrir o arquivo: {erro}"))
}

#[tauri::command]
pub fn revelar_arquivo_exportado(caminho: String) -> Result<(), String> {
    let caminho = validar_caminho_existente(&caminho)?;
    tauri_plugin_opener::reveal_item_in_dir(&caminho)
        .map_err(|erro| format!("Não foi possível mostrar o arquivo na pasta: {erro}"))
}

#[tauri::command]
pub fn abrir_pasta_exportacao(caminho: String) -> Result<(), String> {
    let caminho = validar_caminho_existente(&caminho)?;
    if !caminho.is_dir() {
        return Err("O caminho informado não é uma pasta.".to_owned());
    }
    tauri_plugin_opener::open_path(&caminho, None::<&str>)
        .map_err(|erro| format!("Não foi possível abrir a pasta de exportações: {erro}"))
}

param(
    [Parameter(Mandatory = $true)]
    [string]$ChavePrivada,

    [Parameter(Mandatory = $true)]
    [string]$ChavePublica,

    [string]$SenhaChave = $env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD,
    [string]$Endpoint = "https://github.com/lenonrjdev/MakeFlux-Studio/releases/latest/download/latest.json",
    [string]$BaseUrl = "https://github.com/lenonrjdev/MakeFlux-Studio/releases/download",
    [string]$Notas = "Nova versão estável do MakeFlux Studio.",
    [string]$ManifestoAnterior = ""
)

$ErrorActionPreference = "Stop"
$raiz = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$frontend = Join-Path $raiz "frontend"
$pacote = Get-Content -LiteralPath (Join-Path $frontend "package.json") -Raw | ConvertFrom-Json
$versao = [string]$pacote.version
$configTemporaria = Join-Path $frontend "src-tauri\tauri.release.local.conf.json"
$destino = Join-Path $raiz "dist\updater-v$versao"

if (-not (Test-Path -LiteralPath $ChavePrivada)) { throw "Chave privada não encontrada: $ChavePrivada" }
if (-not (Test-Path -LiteralPath $ChavePublica)) { throw "Chave pública não encontrada: $ChavePublica" }

$publica = (Get-Content -LiteralPath $ChavePublica -Raw).Trim()
if ([string]::IsNullOrWhiteSpace($publica)) { throw "A chave pública está vazia." }

$config = @{
    bundle = @{ createUpdaterArtifacts = $true }
    plugins = @{
        updater = @{
            pubkey = $publica
            endpoints = @($Endpoint)
            windows = @{ installMode = "passive" }
        }
    }
}
$config | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $configTemporaria -Encoding utf8

$envAnteriorChave = $env:TAURI_SIGNING_PRIVATE_KEY
$envAnteriorSenha = $env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD
$envAnteriorConfigurado = $env:MAKEFLUX_ATUALIZADOR_CONFIGURADO
$envAnteriorEndpoint = $env:MAKEFLUX_UPDATER_ENDPOINT

try {
    $env:TAURI_SIGNING_PRIVATE_KEY = $ChavePrivada
    $env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = $SenhaChave
    $env:MAKEFLUX_ATUALIZADOR_CONFIGURADO = "1"
    $env:MAKEFLUX_UPDATER_ENDPOINT = $Endpoint

    Push-Location $frontend
    try {
        Write-Host "Gerando instalador e artefato assinado v$versao..." -ForegroundColor Cyan
        & npm run tauri build -- --config src-tauri/tauri.release.local.conf.json
        if ($LASTEXITCODE -ne 0) { throw "O build assinado retornou código $LASTEXITCODE." }
    } finally {
        Pop-Location
    }
} finally {
    Remove-Item -LiteralPath $configTemporaria -Force -ErrorAction SilentlyContinue
    $env:TAURI_SIGNING_PRIVATE_KEY = $envAnteriorChave
    $env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = $envAnteriorSenha
    $env:MAKEFLUX_ATUALIZADOR_CONFIGURADO = $envAnteriorConfigurado
    $env:MAKEFLUX_UPDATER_ENDPOINT = $envAnteriorEndpoint
}

$bundle = Join-Path $frontend "src-tauri\target\release\bundle"
$candidatos = @()
$candidatos += Get-ChildItem -Path (Join-Path $bundle "nsis") -Filter "*.exe" -File -ErrorAction SilentlyContinue
$candidatos += Get-ChildItem -Path (Join-Path $bundle "msi") -Filter "*.msi" -File -ErrorAction SilentlyContinue
$artefato = $candidatos | Where-Object { Test-Path -LiteralPath "$($_.FullName).sig" } | Select-Object -First 1
if (-not $artefato) { throw "Nenhum instalador com arquivo .sig foi encontrado em $bundle." }

Remove-Item -LiteralPath $destino -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $destino -Force | Out-Null
Copy-Item -LiteralPath $artefato.FullName -Destination $destino -Force
Copy-Item -LiteralPath "$($artefato.FullName).sig" -Destination $destino -Force

$arquitetura = [System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture.ToString().ToLowerInvariant()
$arch = switch ($arquitetura) {
    "x64" { "x86_64" }
    "arm64" { "aarch64" }
    "x86" { "i686" }
    default { "x86_64" }
}
$alvo = "windows-$arch"
$nomeArtefato = $artefato.Name
$nomeArtefatoUrl = [Uri]::EscapeDataString($nomeArtefato)
$urlArtefato = "$BaseUrl/v$versao/$nomeArtefatoUrl"
$assinatura = (Get-Content -LiteralPath "$($artefato.FullName).sig" -Raw).Trim()

$plataformas = [ordered]@{}
$plataformas[$alvo] = [ordered]@{ signature = $assinatura; url = $urlArtefato }

if ($ManifestoAnterior -and (Test-Path -LiteralPath $ManifestoAnterior)) {
    $anterior = Get-Content -LiteralPath $ManifestoAnterior -Raw | ConvertFrom-Json
    $entradaAnterior = $anterior.platforms.$alvo
    if ($entradaAnterior -and $entradaAnterior.url -and $entradaAnterior.signature) {
        $plataformas["rollback-$alvo"] = [ordered]@{
            signature = [string]$entradaAnterior.signature
            url = [string]$entradaAnterior.url
        }
    }
}

$manifesto = [ordered]@{
    version = $versao
    notes = $Notas
    pub_date = [DateTime]::UtcNow.ToString("o")
    platforms = $plataformas
}
$manifesto | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath (Join-Path $destino "latest.json") -Encoding utf8

$arquivosHash = Get-ChildItem -LiteralPath $destino -File
$linhasHash = foreach ($arquivo in $arquivosHash) {
    $hash = (Get-FileHash -LiteralPath $arquivo.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
    "$hash  $($arquivo.Name)"
}
$linhasHash | Set-Content -LiteralPath (Join-Path $destino "checksums.sha256") -Encoding utf8

$release = [ordered]@{
    produto = "MakeFlux Studio"
    versao = $versao
    alvo = $alvo
    endpoint = $Endpoint
    artefato = $nomeArtefato
    url = $urlArtefato
    rollbackIncluido = $plataformas.Contains("rollback-$alvo")
    criadoEm = [DateTime]::UtcNow.ToString("o")
}
$release | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $destino "release-manifest.json") -Encoding utf8

Write-Host ""
Write-Host "Release assinada preparada em: $destino" -ForegroundColor Green
Write-Host "Envie o instalador, o .sig e latest.json para a mesma GitHub Release v$versao." -ForegroundColor Cyan

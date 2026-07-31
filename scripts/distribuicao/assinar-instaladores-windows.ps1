param(
    [string]$DiretorioRelease = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$raiz = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
if (-not $DiretorioRelease) {
    $DiretorioRelease = Join-Path $raiz "dist\release-1.0.0"
}

$certificado = $env:MAKEFLUX_CERTIFICATE_PATH
$senha = $env:MAKEFLUX_CERTIFICATE_PASSWORD
$timestamp = if ($env:MAKEFLUX_TIMESTAMP_URL) {
    $env:MAKEFLUX_TIMESTAMP_URL
} else {
    "http://timestamp.digicert.com"
}

if (-not $certificado -or -not (Test-Path $certificado)) {
    throw "Defina MAKEFLUX_CERTIFICATE_PATH com o caminho do certificado PFX."
}
if (-not $senha) {
    throw "Defina MAKEFLUX_CERTIFICATE_PASSWORD no ambiente atual."
}
if (-not (Test-Path $DiretorioRelease)) {
    throw "Diretorio de release nao encontrado: $DiretorioRelease"
}

$signtool = Get-Command "signtool.exe" -ErrorAction SilentlyContinue
if (-not $signtool) {
    throw "signtool.exe nao foi encontrado. Instale o Windows SDK."
}

$instaladores = @(
    Get-ChildItem -Path $DiretorioRelease -File |
        Where-Object { $_.Extension -in @(".exe", ".msi") }
)
if ($instaladores.Count -eq 0) {
    throw "Nenhum instalador para assinatura foi encontrado."
}

foreach ($arquivo in $instaladores) {
    Write-Host ("Assinando " + $arquivo.Name + "...")
    & $signtool.Source sign `
        /fd SHA256 `
        /f $certificado `
        /p $senha `
        /tr $timestamp `
        /td SHA256 `
        $arquivo.FullName

    if ($LASTEXITCODE -ne 0) {
        throw "Falha ao assinar: $($arquivo.Name)"
    }

    & $signtool.Source verify /pa /v $arquivo.FullName
    if ($LASTEXITCODE -ne 0) {
        throw "A verificacao da assinatura falhou: $($arquivo.Name)"
    }
}

$manifestoPath = Join-Path $DiretorioRelease "release-manifest.json"
$checksumsPath = Join-Path $DiretorioRelease "checksums.sha256"
$manifesto = if (Test-Path $manifestoPath) {
    Get-Content -LiteralPath $manifestoPath -Raw | ConvertFrom-Json
} else {
    [PSCustomObject]@{
        produto = "MakeFlux Studio"
        versao = "1.0.0"
        canal = "stable"
        geradoEm = (Get-Date).ToUniversalTime().ToString("o")
        sistema = "windows"
        arquitetura = "x64"
        assinaturaObrigatoriaParaPublicacao = $true
        arquivos = @()
    }
}

$arquivosManifesto = @()
$linhasChecksum = @()
foreach ($arquivo in $instaladores) {
    $hash = Get-FileHash -LiteralPath $arquivo.FullName -Algorithm SHA256
    $arquivosManifesto += [PSCustomObject]@{
        nome = $arquivo.Name
        tamanhoBytes = $arquivo.Length
        sha256 = $hash.Hash.ToLowerInvariant()
        assinado = $true
    }
    $linhasChecksum += ($hash.Hash.ToLowerInvariant() + "  " + $arquivo.Name)
}

$manifesto.arquivos = $arquivosManifesto
$manifesto.geradoEm = (Get-Date).ToUniversalTime().ToString("o")
$manifesto |
    ConvertTo-Json -Depth 6 |
    Set-Content -LiteralPath $manifestoPath -Encoding UTF8
$linhasChecksum | Set-Content -LiteralPath $checksumsPath -Encoding UTF8

Write-Host "[OK] Instaladores assinados, verificados e checksums atualizados." -ForegroundColor Green

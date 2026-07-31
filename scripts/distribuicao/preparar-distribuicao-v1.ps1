param(
    [switch]$IgnorarValidacao
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$raiz = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$frontend = Join-Path $raiz "frontend"
$versao = "1.0.0"
$destino = Join-Path $raiz ("dist\release-" + $versao)
$bundle = Join-Path $frontend "src-tauri\target\release\bundle"

Write-Host ""
Write-Host "=============================================================================="
Write-Host "  MakeFlux Studio - Preparacao da distribuicao v$versao"
Write-Host "=============================================================================="

if (-not $IgnorarValidacao) {
    & (Join-Path $raiz "VALIDAR_FASE_ATUAL.cmd")
    if ($LASTEXITCODE -ne 0) {
        throw "A distribuicao foi bloqueada porque a Fase 13 nao foi aprovada."
    }
}

if (-not (Test-Path $bundle)) {
    throw "A pasta de instaladores nao foi encontrada: $bundle"
}

Remove-Item -Path $destino -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $destino -Force | Out-Null

$instaladores = @(
    Get-ChildItem -Path $bundle -Recurse -File |
        Where-Object { $_.Extension -in @(".exe", ".msi") }
)

if ($instaladores.Count -eq 0) {
    throw "Nenhum instalador MSI ou NSIS foi encontrado."
}

$manifestoArquivos = @()
$linhasChecksum = @()

foreach ($arquivo in $instaladores) {
    $nome = $arquivo.Name
    $destinoArquivo = Join-Path $destino $nome
    Copy-Item -LiteralPath $arquivo.FullName -Destination $destinoArquivo -Force
    $hash = Get-FileHash -LiteralPath $destinoArquivo -Algorithm SHA256
    $manifestoArquivos += [PSCustomObject]@{
        nome = $nome
        tamanhoBytes = (Get-Item $destinoArquivo).Length
        sha256 = $hash.Hash.ToLowerInvariant()
        assinado = $false
    }
    $linhasChecksum += ($hash.Hash.ToLowerInvariant() + "  " + $nome)
}

$manifesto = [PSCustomObject]@{
    produto = "MakeFlux Studio"
    versao = $versao
    canal = "stable"
    geradoEm = (Get-Date).ToUniversalTime().ToString("o")
    sistema = "windows"
    arquitetura = "x64"
    assinaturaObrigatoriaParaPublicacao = $true
    arquivos = $manifestoArquivos
}

$manifesto |
    ConvertTo-Json -Depth 6 |
    Set-Content -Path (Join-Path $destino "release-manifest.json") -Encoding UTF8

$linhasChecksum |
    Set-Content -Path (Join-Path $destino "checksums.sha256") -Encoding UTF8

Write-Host ""
Write-Host "[OK] Pacote de distribuicao preparado em:" -ForegroundColor Green
Write-Host "     $destino"
Write-Host "[INFO] Assine os instaladores antes da publicacao oficial." -ForegroundColor Yellow

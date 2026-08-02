param(
    [Parameter(Mandatory = $true)]
    [string]$ChavePrivada,

    [Parameter(Mandatory = $true)]
    [string]$ChavePublica,

    [string]$ManifestoAnterior = "",
    [string]$Notas = "MakeFlux Studio 1.9.1 — validação real do atualizador, checkpoint e confirmação pós-reinício."
)

$ErrorActionPreference = "Stop"
$raiz = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$frontend = Join-Path $raiz "frontend"
$pacote = Get-Content -LiteralPath (Join-Path $frontend "package.json") -Raw | ConvertFrom-Json
if ([string]$pacote.version -ne "1.9.1") {
    throw "Este fluxo exige a versão 1.9.1. Encontrado: $($pacote.version)."
}

$manifestoTemporario = $null
if ([string]::IsNullOrWhiteSpace($ManifestoAnterior)) {
    $manifestoTemporario = Join-Path $env:TEMP "makeflux-latest-v1.9.0.json"
    Write-Host "Baixando o manifesto estável v1.9.0 para compor o rollback..." -ForegroundColor Cyan
    Invoke-WebRequest `
        -Uri "https://github.com/lenonrjdev/MakeFlux-Studio/releases/download/v1.9.0/latest.json" `
        -OutFile $manifestoTemporario `
        -UseBasicParsing
    $ManifestoAnterior = $manifestoTemporario
}

try {
    & (Join-Path $PSScriptRoot "preparar-atualizacao-assinada.ps1") `
        -ChavePrivada $ChavePrivada `
        -ChavePublica $ChavePublica `
        -ManifestoAnterior $ManifestoAnterior `
        -Notas $Notas
    if ($LASTEXITCODE -ne 0) {
        throw "A preparação assinada retornou código $LASTEXITCODE."
    }

    $destino = Join-Path $raiz "dist\updater-v1.9.1"
    $latest = Get-Content -LiteralPath (Join-Path $destino "latest.json") -Raw | ConvertFrom-Json
    if ([string]$latest.version -ne "1.9.1") {
        throw "O latest.json não aponta para a versão 1.9.1."
    }
    $chaves = @($latest.platforms.PSObject.Properties.Name)
    $alvo = $chaves | Where-Object { $_ -match '^windows-' } | Select-Object -First 1
    if (-not $alvo) { throw "O manifesto não possui o alvo estável do Windows." }
    if ($chaves -notcontains "beta-$alvo") { throw "O manifesto não possui o alias do canal beta." }

    $arquivosManifesto = @(
        "$alvo.json",
        "beta-$alvo.json",
        "rollback-$alvo.json",
        "rollback-beta-$alvo.json"
    )
    foreach ($nomeManifesto in $arquivosManifesto) {
        $caminhoManifesto = Join-Path $destino $nomeManifesto
        if (-not (Test-Path -LiteralPath $caminhoManifesto)) {
            throw "Manifesto de canal ausente: $nomeManifesto"
        }
    }

    $rollbackEstavel = Get-Content -LiteralPath (Join-Path $destino "rollback-$alvo.json") -Raw | ConvertFrom-Json
    $rollbackBeta = Get-Content -LiteralPath (Join-Path $destino "rollback-beta-$alvo.json") -Raw | ConvertFrom-Json
    if ([string]$rollbackEstavel.version -ne "1.9.0") {
        throw "O manifesto de rollback estável não anuncia a versão 1.9.0."
    }
    if ([string]$rollbackBeta.version -ne "1.9.0") {
        throw "O manifesto de rollback beta não anuncia a versão 1.9.0."
    }
    if (-not $rollbackEstavel.platforms.PSObject.Properties["rollback-$alvo"]) {
        throw "O manifesto de rollback estável não possui o alvo esperado."
    }
    if (-not $rollbackBeta.platforms.PSObject.Properties["rollback-beta-$alvo"]) {
        throw "O manifesto de rollback beta não possui o alvo esperado."
    }

    Write-Host "" 
    Write-Host "Atualização 1.9.1 pronta para publicação e teste real." -ForegroundColor Green
    Write-Host "Pasta: $destino" -ForegroundColor Cyan
    Write-Host "Próximo passo: publique os assets na GitHub Release v1.9.1 e teste partindo do aplicativo 1.9.0 instalado." -ForegroundColor Cyan
}
finally {
    if ($manifestoTemporario) {
        Remove-Item -LiteralPath $manifestoTemporario -Force -ErrorAction SilentlyContinue
    }
}

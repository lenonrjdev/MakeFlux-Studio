param(
    [string]$Versao = "1.9.0",
    [string]$Identificador = "rc.1",
    [switch]$PularValidacao,
    [switch]$PermitirAlteracoesLocais
)

$ErrorActionPreference = "Stop"
$raiz = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location $raiz

if (-not $PermitirAlteracoesLocais) {
    $alteracoes = @(git status --porcelain 2>$null)
    if ($LASTEXITCODE -ne 0) { throw "Git não está disponível para identificar a release candidate." }
    if ($alteracoes.Count -gt 0) {
        throw "A árvore Git possui alterações. Consolide a fase ou use -PermitirAlteracoesLocais conscientemente."
    }
}

if (-not $PularValidacao) {
    & (Join-Path $raiz "scripts\validacao\validar-fase-22.ps1")
    if ($LASTEXITCODE -ne 0) { throw "A Fase 22 não foi aprovada pelo validador." }
}

$pacote = Get-Content (Join-Path $raiz "frontend\package.json") -Raw | ConvertFrom-Json
if ($pacote.version -ne $Versao) {
    throw "A versão do frontend ($($pacote.version)) difere da versão solicitada ($Versao)."
}

$pastaNsis = Join-Path $raiz "frontend\src-tauri\target\release\bundle\nsis"
$instalador = Get-ChildItem $pastaNsis -Filter "*setup.exe" -File -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1
if (-not $instalador) { throw "Nenhum instalador NSIS foi encontrado em $pastaNsis." }

$destino = Join-Path $raiz "dist\release-candidate\v$Versao-$Identificador"
New-Item -ItemType Directory -Force -Path $destino | Out-Null
$instaladorDestino = Join-Path $destino $instalador.Name
Copy-Item $instalador.FullName $instaladorDestino -Force

$hash = (Get-FileHash $instaladorDestino -Algorithm SHA256).Hash.ToLowerInvariant()
$commit = (git rev-parse HEAD 2>$null)
if ($LASTEXITCODE -ne 0) { $commit = "nao-disponivel" }
$agora = (Get-Date).ToUniversalTime().ToString("o")

$manifesto = [ordered]@{
    produto = "MakeFlux Studio"
    versao = $Versao
    identificador = $Identificador
    commit = $commit
    criado_em = $agora
    instalador = $instalador.Name
    sha256 = $hash
    status = "release-candidate"
}
$manifesto | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $destino "release-candidate.json") -Encoding UTF8
"$hash  $($instalador.Name)" | Set-Content (Join-Path $destino "checksums.sha256") -Encoding ASCII

Write-Host ""
Write-Host "Release candidate preparada em: $destino" -ForegroundColor Green
Write-Host "Instalador: $($instalador.Name)"
Write-Host "SHA-256: $hash"

param(
    [string]$Destino = "$HOME\.makeflux\updater\makeflux-studio.key"
)

$ErrorActionPreference = "Stop"
$raiz = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$frontend = Join-Path $raiz "frontend"
$pasta = Split-Path -Parent $Destino

if (-not (Test-Path -LiteralPath $frontend)) {
    throw "A pasta frontend não foi encontrada."
}
if (Test-Path -LiteralPath $Destino) {
    throw "A chave privada já existe em $Destino. Nenhum arquivo foi substituído."
}
New-Item -ItemType Directory -Path $pasta -Force | Out-Null

Push-Location $frontend
try {
    Write-Host "Gerando chave do atualizador fora do repositório..." -ForegroundColor Cyan
    & npm run tauri signer generate -- -w $Destino
    if ($LASTEXITCODE -ne 0) { throw "O Tauri signer retornou código $LASTEXITCODE." }
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "Chave privada criada em: $Destino" -ForegroundColor Green
Write-Host "Nunca envie a chave privada ao Git ou a terceiros." -ForegroundColor Yellow
Get-ChildItem -LiteralPath $pasta -Force | Where-Object { $_.Name -like "$(Split-Path -Leaf $Destino)*" } | ForEach-Object {
    Write-Host "Arquivo gerado: $($_.FullName)"
}

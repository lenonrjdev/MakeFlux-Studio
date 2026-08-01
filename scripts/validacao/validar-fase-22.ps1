$manifesto = Join-Path $PSScriptRoot "fases\fase-22.json"
& (Join-Path $PSScriptRoot "validar-fase.ps1") -Manifesto $manifesto -BuildDesktopCompleto
exit $LASTEXITCODE

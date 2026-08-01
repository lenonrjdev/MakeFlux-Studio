$manifesto = Join-Path $PSScriptRoot "fases\fase-16.json"
& (Join-Path $PSScriptRoot "validar-fase.ps1") -Manifesto $manifesto -BuildDesktopCompleto
exit $LASTEXITCODE

$manifesto = Join-Path $PSScriptRoot "fases\fase-20.json"
& (Join-Path $PSScriptRoot "validar-fase.ps1") -Manifesto $manifesto -BuildDesktopCompleto
exit $LASTEXITCODE

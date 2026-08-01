$manifesto = Join-Path $PSScriptRoot "fases\hotfix-1.4.1.json"
& (Join-Path $PSScriptRoot "validar-fase.ps1") -Manifesto $manifesto -BuildDesktopCompleto
exit $LASTEXITCODE

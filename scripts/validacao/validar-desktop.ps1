$manifesto = Join-Path $PSScriptRoot "fases\fase-03.json"
& (Join-Path $PSScriptRoot "validar-fase.ps1") -Manifesto $manifesto
exit $LASTEXITCODE

# Atualize somente o manifesto abaixo ao iniciar uma nova fase.
$manifesto = Join-Path $PSScriptRoot "fases\fase-13.json"
& (Join-Path $PSScriptRoot "validar-fase.ps1") -Manifesto $manifesto -BuildDesktopCompleto
exit $LASTEXITCODE

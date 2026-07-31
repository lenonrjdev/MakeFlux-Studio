Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$script:ResultadosValidacao = @()
$script:DiretorioRelatorio = $null
$script:InicioValidacao = Get-Date
$script:NomeValidacao = "Validacao MakeFlux Studio"

function Write-MakeFluxTitulo {
    param([Parameter(Mandatory = $true)][string]$Texto)
    Write-Host ""
    Write-Host ("=" * 78) -ForegroundColor DarkGray
    Write-Host ("  " + $Texto) -ForegroundColor Cyan
    Write-Host ("=" * 78) -ForegroundColor DarkGray
}

function Write-MakeFluxInfo {
    param([Parameter(Mandatory = $true)][string]$Texto)
    Write-Host ("[INFO] " + $Texto) -ForegroundColor DarkCyan
}

function Write-MakeFluxOk {
    param([Parameter(Mandatory = $true)][string]$Texto)
    Write-Host ("[OK]   " + $Texto) -ForegroundColor Green
}

function Write-MakeFluxFalha {
    param([Parameter(Mandatory = $true)][string]$Texto)
    Write-Host ("[ERRO] " + $Texto) -ForegroundColor Red
}

function Get-MakeFluxExecutavel {
    param([Parameter(Mandatory = $true)][string]$Nome)
    if ($env:OS -eq "Windows_NT" -and $Nome -eq "npm") { return "npm.cmd" }
    if ($env:OS -eq "Windows_NT" -and $Nome -eq "npx") { return "npx.cmd" }
    return $Nome
}

function Start-MakeFluxValidacao {
    param(
        [Parameter(Mandatory = $true)][string]$Nome,
        [Parameter(Mandatory = $true)][string]$RaizRepositorio,
        [Parameter(Mandatory = $true)][string]$Identificador
    )

    $script:NomeValidacao = $Nome
    $script:InicioValidacao = Get-Date
    $carimbo = Get-Date -Format "yyyyMMdd-HHmmss"
    $script:DiretorioRelatorio = Join-Path $RaizRepositorio "scripts\.validacao\$Identificador\$carimbo"
    New-Item -ItemType Directory -Path $script:DiretorioRelatorio -Force | Out-Null

    Write-MakeFluxTitulo $Nome
    Write-MakeFluxInfo ("Repositorio: " + $RaizRepositorio)
    Write-MakeFluxInfo ("Relatorio: " + $script:DiretorioRelatorio)
}

function Add-MakeFluxResultado {
    param(
        [Parameter(Mandatory = $true)][string]$Etapa,
        [Parameter(Mandatory = $true)][ValidateSet("aprovado", "falhou", "ignorado")][string]$Status,
        [Parameter(Mandatory = $true)][double]$DuracaoSegundos,
        [string]$Detalhe = ""
    )
    $script:ResultadosValidacao += [PSCustomObject]@{
        etapa = $Etapa
        status = $Status
        duracaoSegundos = [Math]::Round($DuracaoSegundos, 2)
        detalhe = $Detalhe
    }
}

function Invoke-MakeFluxEtapa {
    param(
        [Parameter(Mandatory = $true)][string]$Nome,
        [Parameter(Mandatory = $true)][scriptblock]$Acao
    )
    $inicio = Get-Date
    Write-Host ""
    Write-Host ("--> " + $Nome) -ForegroundColor Yellow
    try {
        & $Acao
        $duracao = ((Get-Date) - $inicio).TotalSeconds
        Add-MakeFluxResultado -Etapa $Nome -Status "aprovado" -DuracaoSegundos $duracao
        Write-MakeFluxOk $Nome
    }
    catch {
        $duracao = ((Get-Date) - $inicio).TotalSeconds
        Add-MakeFluxResultado -Etapa $Nome -Status "falhou" -DuracaoSegundos $duracao -Detalhe $_.Exception.Message
        Write-MakeFluxFalha ("$Nome: " + $_.Exception.Message)
        throw
    }
}

function Assert-MakeFlux {
    param(
        [Parameter(Mandatory = $true)][bool]$Condicao,
        [Parameter(Mandatory = $true)][string]$Mensagem
    )
    if (-not $Condicao) { throw $Mensagem }
}

function Assert-MakeFluxComando {
    param([Parameter(Mandatory = $true)][string]$Nome)
    $executavel = Get-MakeFluxExecutavel $Nome
    $comando = Get-Command $executavel -ErrorAction SilentlyContinue
    Assert-MakeFlux ($null -ne $comando) ("Comando obrigatorio nao encontrado: " + $Nome)
    return $comando.Source
}

function Invoke-MakeFluxComando {
    param(
        [Parameter(Mandatory = $true)][string]$Comando,
        [string[]]$Argumentos = @(),
        [Parameter(Mandatory = $true)][string]$Diretorio,
        [Parameter(Mandatory = $true)][string]$NomeLog
    )
    $executavel = Get-MakeFluxExecutavel $Comando
    $arquivoLog = Join-Path $script:DiretorioRelatorio ($NomeLog + ".log")
    Push-Location $Diretorio
    try {
        & $executavel @Argumentos 2>&1 | Tee-Object -FilePath $arquivoLog
        $codigo = $LASTEXITCODE
        if ($null -eq $codigo) { $codigo = 0 }
        if ($codigo -ne 0) {
            throw ("Comando falhou com codigo " + $codigo + ": " + $Comando + " " + ($Argumentos -join " "))
        }
    }
    finally {
        Pop-Location
    }
}

function Get-MakeFluxVersaoMaior {
    param([Parameter(Mandatory = $true)][string]$Versao)
    $limpa = $Versao.Trim().TrimStart("v")
    $parte = $limpa.Split(".")[0]
    return [int]$parte
}

function Save-MakeFluxRelatorio {
    param(
        [Parameter(Mandatory = $true)][string]$RaizRepositorio,
        [Parameter(Mandatory = $true)][bool]$Aprovado,
        [string]$Erro = ""
    )
    $fim = Get-Date
    $objeto = [PSCustomObject]@{
        nome = $script:NomeValidacao
        aprovado = $Aprovado
        inicio = $script:InicioValidacao.ToString("o")
        fim = $fim.ToString("o")
        duracaoSegundos = [Math]::Round(($fim - $script:InicioValidacao).TotalSeconds, 2)
        erro = $Erro
        resultados = $script:ResultadosValidacao
    }
    $json = $objeto | ConvertTo-Json -Depth 8
    $jsonPath = Join-Path $script:DiretorioRelatorio "resultado.json"
    $json | Set-Content -Path $jsonPath -Encoding UTF8

    $linhas = @()
    $linhas += "# $($script:NomeValidacao)"
    $linhas += ""
    if ($Aprovado) {
        $linhas += "**Resultado:** APROVADO"
    }
    else {
        $linhas += "**Resultado:** FALHOU"
    }
    $linhas += ""
    $linhas += "| Etapa | Status | Duracao |"
    $linhas += "|---|---:|---:|"
    foreach ($resultado in $script:ResultadosValidacao) {
        $linhas += "| $($resultado.etapa) | $($resultado.status) | $($resultado.duracaoSegundos)s |"
    }
    if ($Erro) {
        $linhas += ""
        $linhas += "## Erro"
        $linhas += ""
        $linhas += "````text"
        $linhas += $Erro
        $linhas += "````"
    }
    $resumoPath = Join-Path $script:DiretorioRelatorio "RESUMO.md"
    $linhas | Set-Content -Path $resumoPath -Encoding UTF8

    $ultimo = Join-Path $RaizRepositorio "scripts\.validacao\ultimo-resultado.json"
    $json | Set-Content -Path $ultimo -Encoding UTF8
    return $resumoPath
}

param(
    [Parameter(Mandatory = $true)][string]$Manifesto,
    [switch]$SomenteAmbiente,
    [switch]$IgnorarDesktop,
    [switch]$BuildDesktopCompleto,
    [switch]$IgnorarInstalacao
)

. (Join-Path $PSScriptRoot "comum.ps1")

$raizRepositorio = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$frontend = Join-Path $raizRepositorio "frontend"
$manifestoResolvido = (Resolve-Path $Manifesto).Path
$contrato = Get-Content -Path $manifestoResolvido -Raw | ConvertFrom-Json
$identificador = "fase-" + $contrato.fase
$nomeValidacao = "MakeFlux Studio - Fase " + $contrato.fase + " - " + $contrato.nome

Start-MakeFluxValidacao -Nome $nomeValidacao -RaizRepositorio $raizRepositorio -Identificador $identificador

try {
    Invoke-MakeFluxEtapa -Nome "Estrutura do repositorio" -Acao {
        Assert-MakeFlux (Test-Path (Join-Path $raizRepositorio ".git")) "A pasta .git deve existir somente na raiz do repositorio."
        Assert-MakeFlux (-not (Test-Path (Join-Path $frontend ".git"))) "Foi encontrado um segundo repositorio em frontend/.git. Remova-o antes de continuar."
        Assert-MakeFlux (Test-Path $frontend) "A pasta frontend nao foi encontrada."
        Assert-MakeFlux (Test-Path (Join-Path $frontend "package.json")) "frontend/package.json nao foi encontrado."

        $topo = (& (Get-MakeFluxExecutavel "git") -C $raizRepositorio rev-parse --show-toplevel 2>$null).Trim()
        Assert-MakeFlux ($LASTEXITCODE -eq 0) "Nao foi possivel identificar a raiz Git."
        $topoNormalizado = [System.IO.Path]::GetFullPath($topo).TrimEnd('\', '/')
        $raizNormalizada = [System.IO.Path]::GetFullPath($raizRepositorio).TrimEnd('\', '/')
        Assert-MakeFlux ($topoNormalizado -eq $raizNormalizada) "O Git ativo nao aponta para a raiz makeFluxStudio."
    }

    Invoke-MakeFluxEtapa -Nome "Ferramentas obrigatorias" -Acao {
        Assert-MakeFluxComando "git" | Out-Null
        Assert-MakeFluxComando "node" | Out-Null
        Assert-MakeFluxComando "npm" | Out-Null

        $nodeVersao = (& node --version).Trim()
        Assert-MakeFlux ((Get-MakeFluxVersaoMaior $nodeVersao) -ge 20) ("Node.js 20 ou superior e obrigatorio. Encontrado: " + $nodeVersao)
        Write-MakeFluxInfo ("Node: " + $nodeVersao)
        Write-MakeFluxInfo ("npm: " + ((& (Get-MakeFluxExecutavel "npm") --version).Trim()))

        if (-not $IgnorarDesktop) {
            Assert-MakeFluxComando "cargo" | Out-Null
            Assert-MakeFluxComando "rustc" | Out-Null
            Write-MakeFluxInfo ("Cargo: " + ((& cargo --version).Trim()))
            Write-MakeFluxInfo ("Rust: " + ((& rustc --version).Trim()))
        }
    }

    Invoke-MakeFluxEtapa -Nome "Contrato de arquivos da fase" -Acao {
        foreach ($arquivo in $contrato.arquivosObrigatorios) {
            $caminho = Join-Path $raizRepositorio ([string]$arquivo)
            Assert-MakeFlux (Test-Path $caminho) ("Arquivo obrigatorio ausente: " + $arquivo)
        }
        foreach ($rota in $contrato.rotas) {
            $caminhoRota = Join-Path $raizRepositorio ([string]$rota.arquivo)
            Assert-MakeFlux (Test-Path $caminhoRota) ("Rota sem arquivo de pagina: " + $rota.rota)
        }
    }

    Invoke-MakeFluxEtapa -Nome "Versoes sincronizadas" -Acao {
        $package = Get-Content (Join-Path $frontend "package.json") -Raw | ConvertFrom-Json
        $tauri = Get-Content (Join-Path $frontend "src-tauri\tauri.conf.json") -Raw | ConvertFrom-Json
        $cargoTexto = Get-Content (Join-Path $frontend "src-tauri\Cargo.toml") -Raw
        $cargoMatch = [regex]::Match($cargoTexto, '(?ms)^\[package\].*?^version\s*=\s*"([^"]+)"')
        Assert-MakeFlux $cargoMatch.Success "Nao foi possivel ler a versao do Cargo.toml."
        Assert-MakeFlux ($package.version -eq $contrato.versao) "A versao do frontend/package.json difere do manifesto da fase."
        Assert-MakeFlux ($tauri.version -eq $contrato.versao) "A versao do tauri.conf.json difere do manifesto da fase."
        Assert-MakeFlux ($cargoMatch.Groups[1].Value -eq $contrato.versao) "A versao do Cargo.toml difere do manifesto da fase."
    }

    Invoke-MakeFluxEtapa -Nome "Arquivos sensiveis versionados" -Acao {
        $rastreados = & (Get-MakeFluxExecutavel "git") -C $raizRepositorio ls-files
        Assert-MakeFlux ($LASTEXITCODE -eq 0) "Nao foi possivel listar os arquivos rastreados pelo Git."
        $proibidos = @($rastreados | Where-Object {
            $_ -match '(^|/)(\.env|\.env\..+|config\.toml)$' -and $_ -notmatch '(example|sample|template)'
        })
        Assert-MakeFlux ($proibidos.Count -eq 0) ("Arquivos sensiveis rastreados pelo Git: " + ($proibidos -join ", "))
    }

    if ($SomenteAmbiente) {
        $resumo = Save-MakeFluxRelatorio -RaizRepositorio $raizRepositorio -Aprovado $true
        Write-MakeFluxTitulo "AMBIENTE APROVADO"
        Write-MakeFluxOk ("Relatorio salvo em: " + $resumo)
        exit 0
    }

    Invoke-MakeFluxEtapa -Nome "Dependencias do frontend" -Acao {
        $nodeModules = Join-Path $frontend "node_modules"
        if (-not (Test-Path $nodeModules)) {
            if ($IgnorarInstalacao) { throw "node_modules ausente e a instalacao automatica foi desativada." }
            $lock = Join-Path $frontend "package-lock.json"
            if (Test-Path $lock) {
                Invoke-MakeFluxComando -Comando "npm" -Argumentos @("ci") -Diretorio $frontend -NomeLog "01-npm-ci"
            }
            else {
                Invoke-MakeFluxComando -Comando "npm" -Argumentos @("install") -Diretorio $frontend -NomeLog "01-npm-install"
            }
        }
        Assert-MakeFlux (Test-Path (Join-Path $frontend "node_modules")) "As dependencias do frontend nao foram instaladas."
    }

    Invoke-MakeFluxEtapa -Nome "Lint sem avisos" -Acao {
        Invoke-MakeFluxComando -Comando "npm" -Argumentos @("run", "lint") -Diretorio $frontend -NomeLog "02-lint"
    }

    Invoke-MakeFluxEtapa -Nome "TypeScript estrito" -Acao {
        Invoke-MakeFluxComando -Comando "npm" -Argumentos @("run", "typecheck") -Diretorio $frontend -NomeLog "03-typecheck"
    }

    Invoke-MakeFluxEtapa -Nome "Testes automatizados" -Acao {
        Invoke-MakeFluxComando -Comando "npm" -Argumentos @("run", "test") -Diretorio $frontend -NomeLog "04-testes"
    }

    Invoke-MakeFluxEtapa -Nome "Build estatico Next.js" -Acao {
        Invoke-MakeFluxComando -Comando "npm" -Argumentos @("run", "build") -Diretorio $frontend -NomeLog "05-build-next"
    }

    Invoke-MakeFluxEtapa -Nome "Saidas das rotas" -Acao {
        foreach ($rota in $contrato.rotas) {
            $saida = Join-Path $raizRepositorio ([string]$rota.saida)
            Assert-MakeFlux (Test-Path $saida) ("O build nao gerou a rota " + $rota.rota + ": " + $rota.saida)
        }
    }

    if (-not $IgnorarDesktop) {
        Invoke-MakeFluxEtapa -Nome "Formatacao Rust" -Acao {
            Invoke-MakeFluxComando -Comando "cargo" -Argumentos @("fmt", "--manifest-path", (Join-Path $frontend "src-tauri\Cargo.toml"), "--", "--check") -Diretorio $raizRepositorio -NomeLog "06-cargo-fmt"
        }

        Invoke-MakeFluxEtapa -Nome "Compilacao nativa Tauri" -Acao {
            Invoke-MakeFluxComando -Comando "cargo" -Argumentos @("check", "--manifest-path", (Join-Path $frontend "src-tauri\Cargo.toml")) -Diretorio $raizRepositorio -NomeLog "07-cargo-check"
        }

        Invoke-MakeFluxEtapa -Nome "Diagnostico Tauri" -Acao {
            Invoke-MakeFluxComando -Comando "npm" -Argumentos @("run", "tauri", "--", "info") -Diretorio $frontend -NomeLog "08-tauri-info"
        }
    }

    if ($BuildDesktopCompleto) {
        Invoke-MakeFluxEtapa -Nome "Build completo do aplicativo desktop" -Acao {
            Invoke-MakeFluxComando -Comando "npm" -Argumentos @("run", "desktop:build") -Diretorio $frontend -NomeLog "09-tauri-build"
            $bundle = Join-Path $frontend "src-tauri\target\release\bundle"
            Assert-MakeFlux (Test-Path $bundle) "O Tauri nao gerou a pasta de instaladores em target/release/bundle."
            $instaladores = @(Get-ChildItem -Path $bundle -Recurse -File -ErrorAction SilentlyContinue)
            Assert-MakeFlux ($instaladores.Count -gt 0) "Nenhum instalador desktop foi encontrado apos o build."
        }
    }

    $resumo = Save-MakeFluxRelatorio -RaizRepositorio $raizRepositorio -Aprovado $true
    Write-MakeFluxTitulo "FASE APROVADA"
    Write-MakeFluxOk "Lint, TypeScript, testes, Next.js e Tauri foram validados."
    if ($BuildDesktopCompleto) { Write-MakeFluxOk "O instalador desktop tambem foi gerado." }
    Write-MakeFluxOk ("Relatorio salvo em: " + $resumo)
    exit 0
}
catch {
    $mensagem = $_.Exception.Message
    $resumo = Save-MakeFluxRelatorio -RaizRepositorio $raizRepositorio -Aprovado $false -Erro $mensagem
    Write-MakeFluxTitulo "VALIDACAO REPROVADA"
    Write-MakeFluxFalha $mensagem
    Write-MakeFluxInfo ("Consulte o relatorio: " + $resumo)
    exit 1
}

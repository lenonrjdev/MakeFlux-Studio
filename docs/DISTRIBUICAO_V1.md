# Distribuição do MakeFlux Studio 1.0

## 1. Homologar

```powershell
.\VALIDAR_FASE_ATUAL.cmd
```

A distribuição deve parar se a Fase 13 não terminar com `FASE APROVADA`.

## 2. Preparar os artefatos

```powershell
.\PREPARAR_DISTRIBUICAO_V1.cmd
```

O script copia os instaladores MSI e NSIS para:

```text
dist\release-1.0.0
```

Também gera:

```text
release-manifest.json
checksums.sha256
```

## 3. Assinar no Windows

A assinatura requer certificado real e o Windows SDK. Configure no PowerShell atual:

```powershell
$env:MAKEFLUX_CERTIFICATE_PATH = "C:\Certificados\makeflux.pfx"
$env:MAKEFLUX_CERTIFICATE_PASSWORD = "SENHA_DO_CERTIFICADO"
$env:MAKEFLUX_TIMESTAMP_URL = "http://timestamp.digicert.com"

.\ASSINAR_INSTALADORES_WINDOWS.cmd
```

Nunca grave a senha do certificado no repositório, em arquivos `.env` ou scripts.

## 4. Verificar

O script de assinatura executa `signtool verify /pa /v` em cada instalador e atualiza automaticamente o manifesto e os checksums com os binários já assinados.

## 5. Publicar

Publique somente:

- instaladores assinados;
- `checksums.sha256`;
- `release-manifest.json`;
- notas da versão.

A assinatura reduz alertas do SmartScreen, mas depende da reputação e da validade do certificado utilizado.

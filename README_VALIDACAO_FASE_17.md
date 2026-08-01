# Validação da Fase 17

A Fase 17 adiciona atualizações assinadas ao MakeFlux Studio 1.4.0 usando os plugins oficiais `updater` e `process` do Tauri.

## Homologação

```powershell
cd C:\projetos\makeFluxStudio
npm --prefix .\frontend install
cargo fmt --manifest-path .\frontend\src-tauri\Cargo.toml
.\VALIDAR_FASE_ATUAL.cmd
```

A fase é consolidada somente quando o validador exibir `FASE APROVADA`.

## Por que o build de validação não exige a chave privada

O `tauri.conf.json` normal mantém `createUpdaterArtifacts` desativado. A chave privada nunca é necessária para compilar, testar ou instalar um build de desenvolvimento.

O fluxo assinado é criado separadamente por `PREPARAR_ATUALIZACAO_ASSINADA.cmd`, que gera uma configuração temporária, injeta a chave somente no processo de build e remove a configuração ao terminar.

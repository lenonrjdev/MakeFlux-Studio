# Validação do Hotfix 1.4.1

Este hotfix corrige duas falhas encontradas na homologação do MakeFlux Studio 1.4.0:

1. a interface podia herdar o tema escuro do Windows;
2. a Produção podia concluir uma simulação sem deixar claro que nenhum vídeo real existia e, no modo real, não consolidava as saídas em uma pasta estável do MakeFlux Studio.

## Contrato visual

- O produto possui somente o tema claro.
- O fundo geral é cinza muito claro.
- Sidebar, cabeçalho, painéis e cartões usam superfícies brancas.
- Bordas são finas e discretas.
- O acento principal é verde suave.
- Preferências antigas `sistema` ou `escuro` são normalizadas para `claro`.

## Contrato de exportação

- A pasta de saída é criada antes do envio ao MoneyPrinterTurbo.
- Quando nenhuma pasta foi escolhida, o aplicativo usa a pasta de Vídeos do Windows e cria `MakeFlux Studio\Exportacoes`.
- As saídas retornadas pelo motor são verificadas e copiadas para uma pasta permanente por projeto e renderização.
- Uma tarefa real não é concluída quando nenhum arquivo final pode ser localizado.
- A tela de Produção oferece `Reproduzir`, `Abrir pasta` e `Mostrar na pasta`.
- O modo simulação não fabrica registros de MP4, áudio ou legenda.

## Executar

```powershell
cd C:\projetos\makeFluxStudio

cargo fmt `
  --manifest-path .\frontend\src-tauri\Cargo.toml

.\VALIDAR_FASE_ATUAL.cmd
```

A correção só deve ser consolidada quando o validador exibir `FASE APROVADA`.

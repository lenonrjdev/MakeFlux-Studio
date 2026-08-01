# Distribuição robusta

## Objetivo

A Fase 21 separa o pedido de publicação da execução externa. Cada envio entra em uma fila SQLite, recebe correlação técnica, até quatro tentativas e um sinal de cancelamento.

## Cloudinary temporário

As credenciais ficam no cofre criptografado. Somente Cloud Name, retenção, tamanho do bloco e estado operacional ficam no SQLite. O vídeo é enviado em blocos, recebe URL HTTPS e é removido após a publicação quando a limpeza automática está ativa.

## YouTube

O MakeFlux cria uma sessão retomável, persiste a URL de upload, consulta o offset com `Content-Range: bytes */TOTAL` e envia blocos de 8 MB. Um encerramento inesperado mantém o registro para repetição segura.

## Instagram

Um arquivo local pode ser hospedado temporariamente. O MakeFlux cria o contêiner de Reel, consulta `status_code` até `FINISHED` e só então chama `media_publish`.

## TikTok

O fluxo consulta as opções permitidas para o criador, exige consentimento explícito, inicia `FILE_UPLOAD`, envia blocos e acompanha o `publish_id` até a conclusão.

## Tokens

Client ID e Client Secret permanecem no cofre. YouTube e TikTok usam refresh token; Instagram utiliza renovação do token de longa duração quando disponível.

## Recuperação

Envios que estavam ativos quando o aplicativo foi encerrado passam para `interrompida`. O usuário pode repetir a operação sem esconder o histórico anterior.

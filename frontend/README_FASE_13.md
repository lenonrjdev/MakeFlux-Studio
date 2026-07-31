# Fase 13 — Qualidade, migrações e distribuição 1.0

A Fase 13 consolida o MakeFlux Studio como aplicativo desktop distribuível.

## Persistência

O aplicativo passa a sincronizar os workspaces `makeflux:*` com um banco SQLite nativo. A migração é transacional, idempotente e preserva o `localStorage` como fallback até que o usuário confirme a estabilidade do ambiente.

## Cofre

Credenciais podem ser armazenadas em um arquivo criptografado usando:

- Argon2 para derivação da chave;
- ChaCha20-Poly1305 para criptografia autenticada;
- nonce aleatório por gravação;
- chave apenas em memória durante a sessão;
- limpeza da chave ao bloquear ou fechar o aplicativo.

## Qualidade

A rota `/qualidade` reúne:

- status da migração;
- cofre de credenciais;
- telemetria local opcional;
- matriz de testes ponta a ponta;
- prontidão para distribuição.

## Distribuição

`PREPARAR_DISTRIBUICAO_V1.cmd` valida a fase, coleta instaladores, gera SHA-256 e cria um manifesto de release. A assinatura de código é separada porque depende de um certificado real do distribuidor.

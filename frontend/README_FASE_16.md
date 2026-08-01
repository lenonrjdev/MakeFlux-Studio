# Fase 16 — Contas, OAuth e publicação real

A fase adiciona conexão segura com YouTube, Instagram e TikTok. O backend Rust recebe o callback OAuth em uma porta loopback temporária, valida `state`, usa PKCE quando suportado e salva tokens somente no cofre criptografado.

A publicação é executada no Tauri:

- YouTube: upload retomável a partir do arquivo local;
- Instagram: criação e publicação de contêiner Reels por URL HTTPS;
- TikTok: Direct Post com `PULL_FROM_URL`.

As plataformas exigem credenciais e aprovações próprias. Nenhuma credencial real acompanha o projeto.

Cadastre `http://127.0.0.1:47891/oauth/callback` como URI de retorno no aplicativo de cada provedor.

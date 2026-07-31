# Validação da Fase 13

Execute na raiz do repositório:

```powershell
.\VALIDAR_FASE_ATUAL.cmd
```

A validação aprova somente quando confirmar:

- versão `1.0.0` sincronizada;
- rota `/qualidade` exportada;
- migração idempotente para SQLite;
- fallback seguro no `localStorage`;
- cofre criptografado com Argon2 e ChaCha20-Poly1305;
- telemetria local opcional e desativada por padrão;
- testes de ponta a ponta e regressão das fases anteriores;
- ESLint sem avisos;
- TypeScript estrito;
- build estático do Next.js;
- `cargo fmt --check` e `cargo check`;
- build completo do Tauri;
- criação do instalador desktop.

A assinatura digital não é simulada e não faz parte da aprovação automática, pois exige um certificado real do distribuidor.

A fase somente deve receber commit após a mensagem `FASE APROVADA`.

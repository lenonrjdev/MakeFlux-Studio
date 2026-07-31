# Validação da Fase 12

Execute na raiz do repositório:

```powershell
.\VALIDAR_FASE_ATUAL.cmd
```

A validação aprova somente quando confirmar:

- versão `0.12.0` sincronizada;
- contrato completo dos comandos Tauri;
- adaptador REST do MoneyPrinterTurbo;
- fila real e fallback simulado;
- detecção de capacidades offline;
- atualização segura e rollback;
- ESLint sem avisos;
- TypeScript estrito;
- todos os testes Node;
- build estático do Next.js;
- Cargo check e build do aplicativo Tauri;
- criação do instalador desktop.

A fase somente deve receber commit após a mensagem `FASE APROVADA`.

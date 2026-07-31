# MakeFlux Studio — Fase 11

## Central de ajuda, diagnóstico e suporte

A Fase 11 substitui a rota provisória `/central-de-ajuda` por uma central interna completa.

### Entregas

- onboarding persistente com seis etapas;
- guias por categoria, nível, duração e tags;
- favoritos e histórico de guias consultados;
- perguntas frequentes;
- diagnóstico local do workspace;
- verificação de armazenamento, projetos, integrações, Tauri e Web Crypto;
- checklists para falhas recorrentes;
- pacote de suporte JSON sanitizado;
- histórico de novidades do produto.

### Persistência

```text
makeflux:workspace-ajuda:v1
```

### Pacote de suporte

O arquivo utiliza o contrato:

```text
makeflux-support
```

Credenciais, tokens, hash do PIN, foto do perfil e caminhos pessoais são removidos ou mascarados antes da exportação.

### Validação

Na raiz do repositório:

```powershell
.\VALIDAR_FASE_ATUAL.cmd
```

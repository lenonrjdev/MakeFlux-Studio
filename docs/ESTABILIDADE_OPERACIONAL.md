# Estabilidade operacional

## Objetivo

A Fase 24 protege o MakeFlux Studio depois do primeiro lançamento estável. A camada registra inicializações, confirma saídas limpas, reconhece encerramentos inesperados e oferece recuperação sem apagar dados do usuário.

## Modo seguro

O modo seguro é persistido no SQLite. Quando ativo, o startup nativo não inicia o worker de rotinas nem recupera automaticamente publicações interrompidas. Atualizador, banco e observabilidade continuam disponíveis para diagnóstico.

Após três inicializações consecutivas que detectem uma execução anterior ainda marcada como ativa, o modo seguro é habilitado automaticamente.

## Sessão

A aplicação grava a última rota aberta. A restauração só é oferecida quando a execução anterior terminou sem confirmação de saída limpa. Um fechamento normal remove a pendência.

## Incidentes

Erros globais do frontend, rejeições de promessas e encerramentos inesperados são persistidos localmente. Campos sensíveis e caminhos do perfil do Windows são sanitizados antes da gravação e da exportação.

## Reparo do SQLite

O reparo executa:

1. `PRAGMA wal_checkpoint(FULL)`;
2. `PRAGMA quick_check`;
3. cópia preventiva do banco para `Documentos\MakeFlux Studio\Recuperacao`;
4. `REINDEX`;
5. `PRAGMA optimize`;
6. nova verificação de integridade.

O banco original não é apagado. Quando a integridade não é restaurada, o resultado informa que uma recuperação manual ainda é necessária.

## Limpeza de cache

Somente estas pastas são permitidas:

- cache interno do aplicativo;
- `Documentos\MakeFlux Studio\Cache`.

Links simbólicos são ignorados. Projetos, exportações, banco, cofre, modelos e motores não fazem parte da limpeza.

## Diagnóstico

O relatório JSON inclui status, validação de arquivos e incidentes recentes. O pacote é marcado como sanitizado e salvo em `Documentos\MakeFlux Studio\Diagnosticos\Estabilidade`.

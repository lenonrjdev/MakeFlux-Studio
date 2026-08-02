export const conteudoAtualizador = {
  titulo: "Atualizações assinadas",
  descricao: "Valide a atualização real, preserve os dados locais e confirme a nova versão depois do reinício.",
  avisoAssinatura:
    "O MakeFlux Studio aceita somente pacotes assinados pela chave pública incorporada ao build de distribuição. A verificação de assinatura do atualizador não pode ser desativada.",
  avisoBuild:
    "O build normal de desenvolvimento não recebe endpoint nem chave pública. A atualização fica ativa somente nos pacotes produzidos pelo fluxo PREPARAR_ATUALIZACAO_ASSINADA.cmd.",
  avisoRollback:
    "O rollback usa um alvo assinado separado no manifesto e cria um novo checkpoint antes da troca de versão.",
  avisoCheckpoint:
    "Antes de instalar, o MakeFlux consolida o WAL, valida o SQLite, registra o estado do cofre e cria um snapshot local. Após o reinício, a versão e os dados são conferidos automaticamente.",
} as const;

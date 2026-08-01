export const conteudoAtualizador = {
  titulo: "Atualizações assinadas",
  descricao: "Verifique, baixe e instale novas versões com validação criptográfica antes da execução.",
  avisoAssinatura:
    "O MakeFlux Studio aceita somente pacotes assinados pela chave pública incorporada ao build de distribuição. A verificação de assinatura do atualizador não pode ser desativada.",
  avisoBuild:
    "O build normal de desenvolvimento não recebe endpoint nem chave pública. A atualização fica ativa somente nos pacotes produzidos pelo fluxo PREPARAR_ATUALIZACAO_ASSINADA.cmd.",
  avisoRollback:
    "O rollback usa um alvo assinado separado no manifesto. Ele somente aparece quando a release publica uma versão anterior válida como ponto de recuperação.",
} as const;

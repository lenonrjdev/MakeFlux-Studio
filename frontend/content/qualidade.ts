export const conteudoQualidade = {
  titulo: "Qualidade e distribuição",
  descricao:
    "Consolide os dados no SQLite, proteja credenciais, acompanhe qualidade local e prepare a distribuição da versão 1.0.",
  avisoMigracao:
    "O localStorage continua preservado como fallback. A sincronização com SQLite é validada antes de qualquer limpeza futura.",
  avisoCofre:
    "A senha mestra nunca é persistida. A chave derivada permanece apenas na memória enquanto o cofre estiver desbloqueado.",
  avisoTelemetria:
    "A telemetria é opcional, local e não envia informações para servidores externos.",
};

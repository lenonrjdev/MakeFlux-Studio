import type { ConfiguracaoProvedorIa, IdProvedorIa } from "@/types/provedores-ia";

export const ordemProvedoresIa: IdProvedorIa[] = ["openai", "gemini", "deepseek", "ollama"];

export const provedoresIaDemonstrativos: ConfiguracaoProvedorIa[] = [
  {
    id: "openai", nome: "OpenAI", descricao: "Responses API", endpoint: "https://api.openai.com/v1",
    modelo: "gpt-5-mini", habilitado: true, prioridade: 1, timeoutSegundos: 60,
    limiteDiarioRequisicoes: 0, maxTokensSaida: 2400, temperaturaPadrao: 0.7,
    custoEntradaMilhao: 0, custoSaidaMilhao: 0, requerCredencial: true,
    credencialConfigurada: false, status: "credencial-pendente", mensagem: "Adicione a chave no cofre.",
    ultimaVerificacaoEm: null, latenciaMs: null, requisicoesHoje: 0, tokensEntradaHoje: 0,
    tokensSaidaHoje: 0, custoEstimadoHoje: 0,
  },
  {
    id: "gemini", nome: "Google Gemini", descricao: "GenerateContent API", endpoint: "https://generativelanguage.googleapis.com",
    modelo: "gemini-2.5-flash", habilitado: true, prioridade: 2, timeoutSegundos: 60,
    limiteDiarioRequisicoes: 0, maxTokensSaida: 2400, temperaturaPadrao: 0.7,
    custoEntradaMilhao: 0, custoSaidaMilhao: 0, requerCredencial: true,
    credencialConfigurada: false, status: "credencial-pendente", mensagem: "Adicione a chave no cofre.",
    ultimaVerificacaoEm: null, latenciaMs: null, requisicoesHoje: 0, tokensEntradaHoje: 0,
    tokensSaidaHoje: 0, custoEstimadoHoje: 0,
  },
  {
    id: "deepseek", nome: "DeepSeek", descricao: "Chat Completions API", endpoint: "https://api.deepseek.com",
    modelo: "deepseek-chat", habilitado: true, prioridade: 3, timeoutSegundos: 60,
    limiteDiarioRequisicoes: 0, maxTokensSaida: 2400, temperaturaPadrao: 0.7,
    custoEntradaMilhao: 0, custoSaidaMilhao: 0, requerCredencial: true,
    credencialConfigurada: false, status: "credencial-pendente", mensagem: "Adicione a chave no cofre.",
    ultimaVerificacaoEm: null, latenciaMs: null, requisicoesHoje: 0, tokensEntradaHoje: 0,
    tokensSaidaHoje: 0, custoEstimadoHoje: 0,
  },
  {
    id: "ollama", nome: "Ollama", descricao: "API local de chat", endpoint: "http://127.0.0.1:11434",
    modelo: "gemma3", habilitado: true, prioridade: 4, timeoutSegundos: 120,
    limiteDiarioRequisicoes: 0, maxTokensSaida: 2400, temperaturaPadrao: 0.7,
    custoEntradaMilhao: 0, custoSaidaMilhao: 0, requerCredencial: false,
    credencialConfigurada: true, status: "nao-testado", mensagem: "Teste o servidor local do Ollama.",
    ultimaVerificacaoEm: null, latenciaMs: null, requisicoesHoje: 0, tokensEntradaHoje: 0,
    tokensSaidaHoje: 0, custoEstimadoHoje: 0,
  },
];

export const rotulosStatusProvedorIa = {
  pronto: "Pronto",
  "nao-testado": "Não testado",
  indisponivel: "Indisponível",
  "credencial-pendente": "Credencial pendente",
  desativado: "Desativado",
} as const;

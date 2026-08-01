
import type { LogEstruturado, NivelLog, OrigemLog } from "@/types/observabilidade";

export const niveisLog: Array<{ id: NivelLog | "todos"; titulo: string }> = [
  { id: "todos", titulo: "Todos os níveis" },
  { id: "erro", titulo: "Erros" },
  { id: "aviso", titulo: "Avisos" },
  { id: "info", titulo: "Informações" },
  { id: "debug", titulo: "Depuração" },
];

export const origensLog: Array<{ id: OrigemLog | "todas"; titulo: string }> = [
  { id: "todas", titulo: "Todas as origens" },
  { id: "frontend", titulo: "Interface" },
  { id: "rust", titulo: "Nativo Rust" },
  { id: "moneyprinter", titulo: "MoneyPrinterTurbo" },
  { id: "provedor", titulo: "Provedores" },
  { id: "publicacao", titulo: "Publicação" },
  { id: "sistema", titulo: "Sistema" },
];

const agora = Date.UTC(2026, 7, 1, 17, 30);
export const logsDemonstrativos: LogEstruturado[] = [
  {
    id: "log-demo-1",
    nivel: "info",
    origem: "frontend",
    evento: "navegacao.rota",
    mensagem: "Central de observabilidade aberta.",
    correlacaoId: "sessao-demo-20260801",
    contexto: JSON.stringify({ rota: "/observabilidade" }),
    criadoEm: agora,
  },
  {
    id: "log-demo-2",
    nivel: "aviso",
    origem: "moneyprinter",
    evento: "motor.indisponivel",
    mensagem: "O motor demonstrativo não respondeu ao diagnóstico.",
    correlacaoId: "diagnostico-demo-01",
    contexto: JSON.stringify({ endpoint: "http://127.0.0.1:8080", tentativa: 1 }),
    criadoEm: agora - 45_000,
  },
  {
    id: "log-demo-3",
    nivel: "erro",
    origem: "provedor",
    evento: "provedor.autenticacao",
    mensagem: "Credencial inválida. Valor sensível removido.",
    correlacaoId: "diagnostico-demo-01",
    contexto: JSON.stringify({ authorization: "[REDACTED]", status: 401 }),
    criadoEm: agora - 90_000,
  },
];

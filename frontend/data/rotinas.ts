import { BellRing, DatabaseZap, FileSearch, Gauge, Megaphone, Trash2 } from "lucide-react";

import type { FrequenciaRotina, RotinaAgendada, TipoRotina } from "@/types/rotinas";

export const tiposRotina: Array<{ id: TipoRotina; titulo: string; descricao: string; icone: typeof BellRing }> = [
  { id: "lembrete", titulo: "Lembrete local", descricao: "Cria um aviso persistente e uma notificação nativa.", icone: BellRing },
  { id: "checkpoint-wal", titulo: "Checkpoint do banco", descricao: "Consolida o arquivo WAL do SQLite.", icone: DatabaseZap },
  { id: "otimizar-banco", titulo: "Otimizar banco", descricao: "Atualiza estatísticas e índices do workspace.", icone: Gauge },
  { id: "verificar-integridade", titulo: "Verificar integridade", descricao: "Executa uma verificação rápida do SQLite.", icone: FileSearch },
  { id: "limpar-telemetria", titulo: "Limpar telemetria antiga", descricao: "Remove eventos técnicos fora da retenção configurada.", icone: Trash2 },
  { id: "relatorio-workspace", titulo: "Resumo do workspace", descricao: "Registra um resumo local de projetos, dados e notificações.", icone: Megaphone },
];

export const frequenciasRotina: Array<{ id: FrequenciaRotina; titulo: string }> = [
  { id: "uma-vez", titulo: "Uma vez" },
  { id: "diaria", titulo: "Diariamente" },
  { id: "semanal", titulo: "Semanalmente" },
  { id: "mensal", titulo: "Mensalmente" },
  { id: "intervalo", titulo: "Por intervalo" },
];

export const rotinasDemonstrativas: RotinaAgendada[] = [
  {
    id: "demo-integridade",
    nome: "Verificar integridade do workspace",
    descricao: "Rotina demonstrativa da prévia web.",
    tipo: "verificar-integridade",
    frequencia: "semanal",
    intervaloMinutos: null,
    proximaExecucaoEm: Date.UTC(2026, 7, 3, 9, 0),
    ativa: true,
    notificar: true,
    parametros: "{}",
    criadoEm: Date.UTC(2026, 6, 31, 20, 0),
    atualizadoEm: Date.UTC(2026, 6, 31, 20, 0),
    ultimaExecucaoEm: null,
    ultimoStatus: null,
  },
];

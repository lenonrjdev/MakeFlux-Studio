import type { IdProvedorIa } from "@/types/provedores-ia";

export type TipoFerramentaLaboratorio = "roteiro" | "prompt-sistema" | "gancho" | "termos-visuais" | "metadados";
export type StatusExperimentoLaboratorio = "rascunho" | "processando" | "concluido" | "erro";
export type ModoExecucaoLaboratorio = "real" | "demonstracao";
export type PontuacoesResultadoLaboratorio = { clareza: number; engajamento: number; representabilidade: number; aderencia: number };
export type ResultadoExperimentoLaboratorio = {
  id: string; titulo: string; conteudo: string; resumo: string; duracaoEstimada: string; palavras: number;
  pontuacoes: PontuacoesResultadoLaboratorio; criadoEm: string;
  origem?: ModoExecucaoLaboratorio; provedor?: IdProvedorIa; modeloReal?: string;
  tokensEntrada?: number; tokensSaida?: number; custoEstimado?: number; duracaoMs?: number; tentativa?: number;
};
export type ExperimentoLaboratorio = {
  id: string; nome: string; tipo: TipoFerramentaLaboratorio; tema: string; publico: string; plataforma: string;
  idioma: string; modelo: string; promptSistema: string; promptUsuario: string; quantidadeVariacoes: number;
  temperatura: number; status: StatusExperimentoLaboratorio; resultados: ResultadoExperimentoLaboratorio[];
  melhorResultadoId?: string; observacoes: string; criadoEm: string; atualizadoEm: string;
  modoExecucao: ModoExecucaoLaboratorio; provedorPreferido: IdProvedorIa | "automatico";
  permitirFallback: boolean; maxTokensSaida: number; ultimaMensagem?: string; requisicaoId?: string;
};
export type PresetPromptLaboratorio = { id: string; nome: string; descricao: string; tipo: TipoFerramentaLaboratorio; promptSistema: string; promptUsuario: string; favorito: boolean };
export type WorkspaceLaboratorioIa = { versao: 2; experimentos: ExperimentoLaboratorio[]; presets: PresetPromptLaboratorio[] };
export type ConfiguracaoNovoExperimento = Pick<ExperimentoLaboratorio, "nome" | "tipo" | "tema" | "publico" | "plataforma" | "idioma" | "modelo" | "promptSistema" | "promptUsuario" | "quantidadeVariacoes" | "temperatura" | "observacoes" | "modoExecucao" | "provedorPreferido" | "permitirFallback" | "maxTokensSaida">;
export type TransferenciaLaboratorioEstudio = { versao: 1; experimentoId: string; tipo: TipoFerramentaLaboratorio; tema: string; modelo: string; promptSistema: string; promptUsuario: string; conteudo: string; criadoEm: string };

export type SecaoConfiguracoes =
  | "perfil"
  | "workspace"
  | "padroes"
  | "desempenho"
  | "armazenamento"
  | "aparencia"
  | "backup"
  | "seguranca"
  | "atualizacoes";

export type AparenciaAplicacao = "claro";
export type DensidadeInterface = "confortavel" | "compacta";
export type EscalaInterface = "90" | "100" | "110";
export type CanalAtualizacao = "estavel" | "beta";
export type FrequenciaBackup = "ao-fechar" | "diario" | "semanal" | "manual";
export type PrioridadeProcesso = "baixa" | "normal" | "alta";
export type ProcessamentoPreferido = "automatico" | "cpu" | "gpu";

export type PerfilLocal = {
  nome: string;
  email: string;
  autorMetadados: string;
  idioma: "pt-BR" | "en-US" | "es-ES";
  fotoDataUrl: string;
};

export type ConfiguracaoWorkspace = {
  nome: string;
  pastaPrincipal: string;
  pastaExportacoes: string;
  pastaCache: string;
  pastaModelos: string;
  padraoNomeArquivo: string;
  organizarPorProjeto: boolean;
  abrirUltimoProjeto: boolean;
};

export type PadroesCriacao = {
  idioma: "pt-BR" | "en-US" | "es-ES";
  plataforma: "youtube-shorts" | "instagram-reels" | "tiktok" | "youtube";
  formato: "9:16" | "16:9" | "1:1";
  duracaoSegundos: number;
  modoCriacao: "rapido" | "assistido" | "avancado";
  modeloIa: string;
  voz: string;
  presetLegenda: string;
  qualidade: "720p" | "1080p" | "1440p" | "2160p";
  codificador: "automatico" | "nvenc" | "quick-sync" | "amf" | "libx264";
};

export type ConfiguracaoDesempenho = {
  processamento: ProcessamentoPreferido;
  codificador: "automatico" | "nvenc" | "quick-sync" | "amf" | "libx264";
  threads: number;
  tarefasSimultaneas: number;
  limiteFila: number;
  limiteRamGb: number;
  prioridadeProcesso: PrioridadeProcesso;
  pausarEmBateria: boolean;
  reduzirPreviaDuranteRenderizacao: boolean;
};

export type ConfiguracaoArmazenamento = {
  limiteCacheGb: number;
  retencaoTemporariosDias: number;
  limparTemporariosAutomaticamente: boolean;
  manterExportacoes: boolean;
  avisarEspacoLivreGb: number;
};

export type ConfiguracaoAparencia = {
  tema: AparenciaAplicacao;
  densidade: DensidadeInterface;
  escala: EscalaInterface;
  reduzirAnimacoes: boolean;
  altoContraste: boolean;
  sidebarCompacta: boolean;
};

export type ConfiguracaoBackup = {
  automatico: boolean;
  frequencia: FrequenciaBackup;
  pastaDestino: string;
  incluirProjetos: boolean;
  incluirBiblioteca: boolean;
  incluirIntegracoes: boolean;
  incluirHistoricos: boolean;
  ultimoBackupEm: string | null;
};

export type ConfiguracaoSeguranca = {
  bloqueioAtivo: boolean;
  pinHash: string;
  bloquearAposMinutos: number;
  ocultarCaminhosRecentes: boolean;
  removerDadosSensiveisDosLogs: boolean;
  confirmarExclusoesDefinitivas: boolean;
};

export type ConfiguracaoAtualizacoes = {
  canal: CanalAtualizacao;
  verificarAutomaticamente: boolean;
  baixarAutomaticamente: boolean;
  incluirMotor: boolean;
  permitirRollback: boolean;
  ultimaVerificacaoEm: string | null;
  versaoAplicativo: string;
  versaoMotor: string;
};

export type WorkspaceConfiguracoes = {
  versao: 1;
  perfil: PerfilLocal;
  workspace: ConfiguracaoWorkspace;
  padroes: PadroesCriacao;
  desempenho: ConfiguracaoDesempenho;
  armazenamento: ConfiguracaoArmazenamento;
  aparencia: ConfiguracaoAparencia;
  backup: ConfiguracaoBackup;
  seguranca: ConfiguracaoSeguranca;
  atualizacoes: ConfiguracaoAtualizacoes;
  atualizadoEm: string;
};

export type UsoArmazenamentoLocal = {
  totalBytes: number;
  itens: Array<{ chave: string; bytes: number; categoria: string }>;
};

export type PacoteBackupMakeFlux = {
  produto: "MakeFlux Studio";
  formato: "makeflux-backup";
  versao: 1;
  criadoEm: string;
  dados: Record<string, string>;
};

export type ResultadoImportacaoBackup = {
  sucesso: boolean;
  mensagem: string;
  chavesImportadas: number;
};

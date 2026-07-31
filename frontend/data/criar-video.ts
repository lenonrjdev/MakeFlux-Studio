import {
  Captions,
  Clapperboard,
  FileText,
  Lightbulb,
  Mic2,
  Music2,
  UploadCloud,
} from "lucide-react";

import type { ConfiguracaoCriacaoVideo, CenaVideo, IdEtapaCriacao } from "@/types/criar-video";

export const etapasCriacaoVideo: Array<{
  id: IdEtapaCriacao;
  titulo: string;
  resumo: string;
  icone: typeof Lightbulb;
}> = [
  { id: "ideia", titulo: "Ideia", resumo: "Assunto e objetivo", icone: Lightbulb },
  { id: "roteiro", titulo: "Roteiro", resumo: "Texto e prompt", icone: FileText },
  { id: "cenas", titulo: "Cenas", resumo: "Storyboard visual", icone: Clapperboard },
  { id: "narracao", titulo: "Narração", resumo: "Voz e áudio", icone: Mic2 },
  { id: "legendas", titulo: "Legendas", resumo: "Estilo e posição", icone: Captions },
  { id: "musica", titulo: "Música", resumo: "Trilha e volume", icone: Music2 },
  { id: "exportacao", titulo: "Exportação", resumo: "Saída final", icone: UploadCloud },
];

export const modosCriacao = [
  {
    id: "rapido",
    titulo: "Rápido",
    descricao: "A IA prepara todas as etapas com os padrões selecionados.",
  },
  {
    id: "assistido",
    titulo: "Assistido",
    descricao: "Você revisa e aprova cada etapa antes de continuar.",
  },
  {
    id: "avancado",
    titulo: "Avançado",
    descricao: "Exibe prompts e parâmetros técnicos completos.",
  },
] as const;

export const objetivosVideo = [
  { id: "informar", titulo: "Informar", descricao: "Apresentar fatos e contexto com objetividade." },
  { id: "educar", titulo: "Educar", descricao: "Ensinar um conceito ou processo de forma clara." },
  { id: "entreter", titulo: "Entreter", descricao: "Criar ritmo, curiosidade e retenção visual." },
  { id: "promover", titulo: "Promover", descricao: "Apresentar uma ideia, marca, serviço ou produto." },
] as const;

export const plataformasVideo = [
  { id: "shorts", titulo: "YouTube Shorts" },
  { id: "reels", titulo: "Instagram Reels" },
  { id: "tiktok", titulo: "TikTok" },
  { id: "youtube", titulo: "YouTube" },
] as const;

export const formatosVideo = [
  { id: "9:16", titulo: "Vertical", detalhe: "9:16" },
  { id: "16:9", titulo: "Horizontal", detalhe: "16:9" },
  { id: "1:1", titulo: "Quadrado", detalhe: "1:1" },
] as const;

export const idiomasVideo = ["Português (Brasil)", "Inglês", "Espanhol"];
export const duracoesVideo = ["30 segundos", "45 segundos", "60 segundos", "90 segundos"];
export const modelosIa = ["OpenAI · modelo padrão", "Ollama · modelo local", "Escrever sem IA"];
export const fontesMateriais = ["Pexels", "Pixabay", "Biblioteca local", "Materiais próprios"];

export const vozesDisponiveis = [
  { id: "pt-BR-FranciscaNeural", nome: "Francisca", detalhe: "Feminina · natural", provedor: "Edge TTS" },
  { id: "pt-BR-AntonioNeural", nome: "Antônio", detalhe: "Masculina · equilibrada", provedor: "Edge TTS" },
  { id: "local-narrador-01", nome: "Narrador local", detalhe: "Masculina · offline", provedor: "TTS local" },
];

export const presetsLegenda = [
  { id: "limpa", titulo: "Limpa", descricao: "Branca, discreta e centralizada." },
  { id: "shorts", titulo: "Shorts dinâmica", descricao: "Palavras maiores com contorno forte." },
  { id: "documentario", titulo: "Documentário", descricao: "Faixa inferior com ritmo calmo." },
  { id: "minimalista", titulo: "Minimalista", descricao: "Texto compacto sem fundo." },
];

export const musicasDisponiveis = [
  { id: "sem-musica", titulo: "Sem música", estilo: "Somente narração", duracao: "—" },
  { id: "digital-focus", titulo: "Digital Focus", estilo: "Tecnologia · suave", duracao: "02:14" },
  { id: "quiet-motion", titulo: "Quiet Motion", estilo: "Ambient · moderno", duracao: "01:48" },
  { id: "forward-pulse", titulo: "Forward Pulse", estilo: "Motivacional · leve", duracao: "02:31" },
];

export const cenasIniciais: CenaVideo[] = [
  {
    id: 1,
    titulo: "Gancho inicial",
    trecho: "Você pode estar perdendo horas do seu dia sem perceber.",
    termo: "person checking phone early morning productivity",
    duracao: 5,
    origem: "Pexels",
  },
  {
    id: 2,
    titulo: "Problema",
    trecho: "Pequenas distrações quebram seu foco e aumentam o tempo de cada tarefa.",
    termo: "distracted office worker multiple notifications",
    duracao: 8,
    origem: "Pexels",
  },
  {
    id: 3,
    titulo: "Solução",
    trecho: "Organizar prioridades e bloquear interrupções muda completamente a rotina.",
    termo: "focused person planning tasks notebook desk",
    duracao: 9,
    origem: "Biblioteca local",
  },
  {
    id: 4,
    titulo: "Fechamento",
    trecho: "Comece hoje eliminando apenas uma distração recorrente.",
    termo: "productive workspace calm focused ending",
    duracao: 6,
    origem: "Pixabay",
  },
];

export const configuracaoInicialVideo: ConfiguracaoCriacaoVideo = {
  nomeProjeto: "Novo vídeo sem título",
  tema: "",
  objetivo: "informar",
  publico: "Pessoas interessadas em produtividade e tecnologia",
  plataforma: "shorts",
  idioma: "Português (Brasil)",
  duracao: "45 segundos",
  formato: "9:16",
  modo: "assistido",
  modeloIa: "OpenAI · modelo padrão",
  promptRoteiro:
    "Crie um roteiro direto para vídeo curto. Comece com um gancho forte, use frases curtas e finalize com uma ação prática.",
  systemPrompt:
    "Você é um roteirista especializado em vídeos curtos, claros e visualmente representáveis para redes sociais.",
  roteiro: "",
  fonteMateriais: "Pexels",
  correspondenciaNarrativa: true,
  cenas: cenasIniciais,
  provedorVoz: "Edge TTS",
  voz: "pt-BR-FranciscaNeural",
  velocidadeVoz: 1,
  volumeVoz: 90,
  legendasAtivas: true,
  presetLegenda: "limpa",
  posicaoLegenda: "Inferior",
  tamanhoLegenda: 42,
  musicaAtiva: true,
  musica: "digital-focus",
  volumeMusica: 18,
  qualidade: "1080p · Alta qualidade",
  codificador: "Automático · melhor disponível",
  quantidadeVersoes: 1,
};

import {
  Bot,
  Captions,
  CircleAlert,
  CircleCheck,
  Cloud,
  Cpu,
  Film,
  FolderOpen,
  Globe2,
  HardDrive,
  Image,
  Mic2,
  Music2,
  PlugZap,
  Server,
  Share2,
  Sparkles,
  Terminal,
  WifiOff,
  Youtube,
  Instagram,
  type LucideIcon,
} from "lucide-react";

import type {
  CapacidadeIntegracao,
  CategoriaIntegracao,
  FiltroIntegracoes,
  ModoProcessamento,
  StatusIntegracao,
} from "@/types/integracoes";

export const categoriasIntegracoes: Array<{
  id: CategoriaIntegracao | "todas";
  titulo: string;
  descricao: string;
  icone: LucideIcon;
}> = [
  { id: "todas", titulo: "Todas", descricao: "Visão completa", icone: PlugZap },
  { id: "motor", titulo: "Motor", descricao: "MoneyPrinterTurbo", icone: Cpu },
  { id: "inteligencia-artificial", titulo: "Inteligência artificial", descricao: "Roteiros e metadados", icone: Bot },
  { id: "midia", titulo: "Mídia", descricao: "Vídeos e imagens", icone: Image },
  { id: "voz", titulo: "Voz", descricao: "Narração e TTS", icone: Mic2 },
  { id: "legendas", titulo: "Legendas", descricao: "Sincronização e transcrição", icone: Captions },
  { id: "sistema", titulo: "Sistema", descricao: "Renderização e serviços", icone: Terminal },
  { id: "publicacao", titulo: "Publicação", descricao: "Canais sociais", icone: Share2 },
];

export const filtrosIntegracoes: Array<{ id: FiltroIntegracoes; titulo: string; icone: LucideIcon }> = [
  { id: "todas", titulo: "Todas", icone: PlugZap },
  { id: "conectadas", titulo: "Conectadas", icone: CircleCheck },
  { id: "nao-configuradas", titulo: "Não configuradas", icone: Cloud },
  { id: "atencao", titulo: "Precisam de atenção", icone: CircleAlert },
  { id: "locais", titulo: "Locais", icone: HardDrive },
  { id: "nuvem", titulo: "Na nuvem", icone: Globe2 },
];

export const modosProcessamento: Array<{
  id: ModoProcessamento;
  titulo: string;
  descricao: string;
  icone: LucideIcon;
}> = [
  { id: "online", titulo: "Online", descricao: "Prioriza provedores em nuvem e bancos de mídia externos.", icone: Cloud },
  { id: "hibrido", titulo: "Híbrido", descricao: "Usa IA e mídia online, mantendo processamento e renderização locais.", icone: Server },
  { id: "offline", titulo: "Offline", descricao: "Usa somente motor, modelos, mídia e ferramentas instalados no computador.", icone: WifiOff },
];

export const rotulosStatusIntegracao: Record<StatusIntegracao, string> = {
  conectada: "Conectada",
  "nao-configurada": "Não configurada",
  atencao: "Atenção",
  indisponivel: "Indisponível",
};

export const coresStatusIntegracao: Record<StatusIntegracao, string> = {
  conectada: "border-[#cfe4de] bg-[#eef8f5] text-[#277361]",
  "nao-configurada": "border-[#dde3e2] bg-[#f7f9f9] text-[#65716f]",
  atencao: "border-[#eadfc7] bg-[#fff9ec] text-[#8b6a2e]",
  indisponivel: "border-[#ead5d1] bg-[#fff4f2] text-[#a05145]",
};

export const rotulosCapacidades: Record<CapacidadeIntegracao, string> = {
  "motor-video": "Motor de vídeo",
  roteiro: "Roteiro",
  "termos-visuais": "Termos visuais",
  metadados: "Metadados",
  materiais: "Materiais",
  narracao: "Narração",
  legendas: "Legendas",
  renderizacao: "Renderização",
  publicacao: "Publicação",
};

export const iconesIntegracoes: Record<string, LucideIcon> = {
  "moneyprinter-turbo": Film,
  openai: Sparkles,
  ollama: Bot,
  gemini: Bot,
  deepseek: Bot,
  pexels: Image,
  pixabay: Image,
  coverr: Film,
  "biblioteca-local": FolderOpen,
  "edge-tts": Mic2,
  elevenlabs: Mic2,
  chatterbox: Mic2,
  whisper: Captions,
  "edge-timestamps": Captions,
  ffmpeg: Terminal,
  youtube: Youtube,
  instagram: Instagram,
  tiktok: Music2,
};

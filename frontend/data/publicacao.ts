import {
  Archive,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileText,
  Instagram,
  Music2,
  Youtube,
  type LucideIcon,
} from "lucide-react";

import type {
  EstiloThumbnail,
  FiltroPublicacoes,
  PlataformaPublicacao,
  StatusPublicacao,
} from "@/types/publicacao";

export const plataformasPublicacao: Array<{
  id: PlataformaPublicacao;
  titulo: string;
  descricao: string;
  icone: LucideIcon;
  cor: string;
}> = [
  { id: "youtube-shorts", titulo: "YouTube Shorts", descricao: "Vídeos verticais curtos", icone: Youtube, cor: "#d94b4b" },
  { id: "instagram-reels", titulo: "Instagram Reels", descricao: "Conteúdo vertical para Reels", icone: Instagram, cor: "#b45a95" },
  { id: "tiktok", titulo: "TikTok", descricao: "Vídeos rápidos e dinâmicos", icone: Music2, cor: "#313a3a" },
  { id: "youtube", titulo: "YouTube", descricao: "Vídeos horizontais e longos", icone: Youtube, cor: "#d94b4b" },
];

export const filtrosPublicacao: Array<{
  id: FiltroPublicacoes;
  titulo: string;
  icone: LucideIcon;
}> = [
  { id: "todas", titulo: "Todas as publicações", icone: CalendarDays },
  { id: "rascunhos", titulo: "Rascunhos", icone: FileText },
  { id: "prontas", titulo: "Prontas", icone: CheckCircle2 },
  { id: "agendadas", titulo: "Agendadas", icone: Clock3 },
  { id: "publicadas", titulo: "Publicadas", icone: CheckCircle2 },
  { id: "falhas", titulo: "Com falha", icone: CircleAlert },
  { id: "arquivadas", titulo: "Arquivadas", icone: Archive },
];

export const rotulosStatusPublicacao: Record<StatusPublicacao, string> = {
  rascunho: "Rascunho",
  pronta: "Pronta",
  agendada: "Agendada",
  publicada: "Publicada",
  falha: "Com falha",
  arquivada: "Arquivada",
};

export const estilosThumbnail: Array<{
  id: EstiloThumbnail;
  titulo: string;
  descricao: string;
  gradiente: string;
}> = [
  { id: "contraste", titulo: "Alto contraste", descricao: "Texto forte sobre fundo vibrante", gradiente: "linear-gradient(135deg,#1f9b83,#172a27)" },
  { id: "clean", titulo: "Clean", descricao: "Composição clara e minimalista", gradiente: "linear-gradient(135deg,#eaf4f1,#bed8d1)" },
  { id: "cinematografica", titulo: "Cinematográfica", descricao: "Fundo escuro com atmosfera", gradiente: "linear-gradient(135deg,#22292b,#6b4d57)" },
  { id: "texto-grande", titulo: "Texto grande", descricao: "Gancho central para telas pequenas", gradiente: "linear-gradient(135deg,#e4a637,#7b4b20)" },
];

export const coresThumbnail = ["#1f9b83", "#20292a", "#d46d55", "#d5a23f", "#7b659c", "#4c78a8"];

import { Instagram, Music2, Youtube, type LucideIcon } from "lucide-react";

import type { ProvedorCanalPublicacao, StatusConexaoCanal, StatusEnvioSocial } from "@/types/canais-publicacao";

export const provedoresCanais: Array<{
  id: ProvedorCanalPublicacao;
  titulo: string;
  descricao: string;
  icone: LucideIcon;
  cor: string;
  exigeUrlPublica: boolean;
  escopos: string[];
}> = [
  {
    id: "youtube",
    titulo: "YouTube",
    descricao: "Upload retomável de vídeos e Shorts pela YouTube Data API.",
    icone: Youtube,
    cor: "#e74b4b",
    exigeUrlPublica: false,
    escopos: ["youtube.upload", "youtube.readonly"],
  },
  {
    id: "instagram",
    titulo: "Instagram",
    descricao: "Publicação de Reels por contêiner de mídia do Instagram Graph API.",
    icone: Instagram,
    cor: "#b94fc7",
    exigeUrlPublica: true,
    escopos: ["instagram_business_basic", "instagram_business_content_publish"],
  },
  {
    id: "tiktok",
    titulo: "TikTok",
    descricao: "Direct Post com upload direto do arquivo local, consentimento e acompanhamento de status.",
    icone: Music2,
    cor: "#222728",
    exigeUrlPublica: false,
    escopos: ["user.info.basic", "video.publish", "video.upload"],
  },
];

export const rotulosStatusConexao: Record<StatusConexaoCanal, string> = {
  conectada: "Conectada",
  expirada: "Expirada",
  atencao: "Atenção",
};

export const rotulosStatusEnvio: Record<StatusEnvioSocial, string> = {
  "na-fila": "Na fila",
  preparando: "Preparando",
  hospedando: "Hospedando",
  enviando: "Enviando",
  processando: "Processando",
  "aguardando-nova-tentativa": "Nova tentativa",
  cancelando: "Cancelando",
  cancelada: "Cancelada",
  interrompida: "Interrompida",
  publicada: "Publicada",
  falha: "Falha",
};

import {
  Captions,
  FileText,
  Hash,
  Images,
  MessageSquareQuote,
  ShieldCheck,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";

import type {
  PresetPromptLaboratorio,
  TipoFerramentaLaboratorio,
} from "@/types/laboratorio-ia";

export const ferramentasLaboratorio: Array<{
  id: TipoFerramentaLaboratorio;
  titulo: string;
  descricao: string;
  icone: LucideIcon;
}> = [
  {
    id: "roteiro",
    titulo: "Roteiros",
    descricao: "Estrutura, ritmo e duração",
    icone: FileText,
  },
  {
    id: "prompt-sistema",
    titulo: "Prompts do sistema",
    descricao: "Comportamento e regras",
    icone: ShieldCheck,
  },
  {
    id: "gancho",
    titulo: "Ganchos",
    descricao: "Aberturas de alta retenção",
    icone: MessageSquareQuote,
  },
  {
    id: "termos-visuais",
    titulo: "Termos visuais",
    descricao: "Busca de cenas e imagens",
    icone: Images,
  },
  {
    id: "metadados",
    titulo: "Metadados",
    descricao: "Título, descrição e hashtags",
    icone: Hash,
  },
];

export const modelosLaboratorio = [
  "OpenAI · modelo padrão",
  "Ollama · modelo local",
  "DeepSeek · modelo conectado",
  "Comparação sem provedor",
];

export const idiomasLaboratorio = ["Português (Brasil)", "Inglês", "Espanhol"];
export const plataformasLaboratorio = [
  "YouTube Shorts",
  "Instagram Reels",
  "TikTok",
  "YouTube",
];

export const presetsLaboratorioIniciais: PresetPromptLaboratorio[] = [
  {
    id: "preset-roteiro-direto",
    nome: "Roteiro direto",
    descricao: "Gancho rápido, desenvolvimento objetivo e ação prática no encerramento.",
    tipo: "roteiro",
    favorito: true,
    promptSistema:
      "Você é um roteirista especializado em vídeos curtos, claros e visualmente representáveis. Evite introduções genéricas e repetições.",
    promptUsuario:
      "Crie um roteiro direto para vídeo curto. Comece com um gancho forte, use frases curtas, apresente três pontos práticos e finalize com uma ação simples.",
  },
  {
    id: "preset-gancho-curiosidade",
    nome: "Gancho de curiosidade",
    descricao: "Aberturas que criam tensão sem promessas exageradas.",
    tipo: "gancho",
    favorito: true,
    promptSistema:
      "Você cria ganchos responsáveis para vídeos curtos. Não use clickbait enganoso nem afirmações impossíveis de comprovar.",
    promptUsuario:
      "Gere aberturas curtas que provoquem curiosidade nos primeiros três segundos e conectem diretamente com o tema informado.",
  },
  {
    id: "preset-termos-narrativos",
    nome: "Busca narrativa",
    descricao: "Termos visuais em inglês organizados na mesma ordem do roteiro.",
    tipo: "termos-visuais",
    favorito: false,
    promptSistema:
      "Você transforma roteiros em termos de busca visuais específicos, concretos e adequados para bancos de vídeos.",
    promptUsuario:
      "Extraia termos de busca em inglês, um por cena, preservando a ordem narrativa. Evite palavras abstratas e repetições.",
  },
  {
    id: "preset-metadados-sociais",
    nome: "Pacote social",
    descricao: "Título, descrição curta, chamada e hashtags sem excesso.",
    tipo: "metadados",
    favorito: false,
    promptSistema:
      "Você prepara metadados objetivos para publicação social, preservando o tema e sem inventar informações.",
    promptUsuario:
      "Crie um título curto, uma descrição de até duas frases, uma chamada para ação e até cinco hashtags relevantes.",
  },
  {
    id: "preset-system-confiavel",
    nome: "Direção confiável",
    descricao: "Prompt do sistema focado em precisão, clareza e segurança editorial.",
    tipo: "prompt-sistema",
    favorito: false,
    promptSistema:
      "Você é um assistente editorial que prioriza clareza, precisão e linguagem natural. Sinalize limitações e não invente dados.",
    promptUsuario:
      "Reescreva o prompt do sistema para torná-lo específico, verificável e adequado à criação de vídeos curtos.",
  },
];

export const indicadoresLaboratorio = [
  { id: "clareza", titulo: "Clareza", icone: Captions },
  { id: "engajamento", titulo: "Engajamento", icone: Sparkles },
  { id: "representabilidade", titulo: "Visual", icone: Target },
  { id: "aderencia", titulo: "Aderência", icone: ShieldCheck },
] as const;

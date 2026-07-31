import {
  BookOpenText,
  GraduationCap,
  ListChecks,
  MoonStar,
  Newspaper,
  PackageOpen,
  Sparkles,
  type LucideIcon,
  Video,
} from "lucide-react";

import { configuracaoInicialVideo } from "@/data/criar-video";
import type { ConfiguracaoCriacaoVideo } from "@/types/criar-video";
import type { CategoriaTemplate, TemplateStudio } from "@/types/templates";

export const categoriasTemplates: Array<{
  id: CategoriaTemplate;
  titulo: string;
  descricao: string;
  icone: LucideIcon;
}> = [
  { id: "curiosidades", titulo: "Curiosidades", descricao: "Ganchos rápidos e fatos visuais", icone: Sparkles },
  { id: "lista", titulo: "Listas", descricao: "Estruturas numeradas e objetivas", icone: ListChecks },
  { id: "historia", titulo: "Histórias", descricao: "Narrativas com tensão e progressão", icone: BookOpenText },
  { id: "noticia", titulo: "Notícias", descricao: "Contexto direto e informativo", icone: Newspaper },
  { id: "educativo", titulo: "Educativo", descricao: "Explicações claras e didáticas", icone: GraduationCap },
  { id: "promocional", titulo: "Promocional", descricao: "Produtos, serviços e chamadas", icone: PackageOpen },
  { id: "documentario", titulo: "Documentário", descricao: "Tom editorial e cinematográfico", icone: Video },
  { id: "dark-lofi", titulo: "Dark Lo-fi", descricao: "Atmosfera melancólica e contemplativa", icone: MoonStar },
];

export const coresTemplates = ["#1f9b83", "#446f8f", "#8b6850", "#7d668d", "#8b7748", "#78565d"];

function copiarConfiguracao(configuracao: ConfiguracaoCriacaoVideo): ConfiguracaoCriacaoVideo {
  return {
    ...configuracao,
    cenas: configuracao.cenas.map((cena) => ({ ...cena })),
    narracaoLocal: configuracao.narracaoLocal ? { ...configuracao.narracaoLocal } : undefined,
    legendaLocal: configuracao.legendaLocal ? { ...configuracao.legendaLocal } : undefined,
    musicaLocal: configuracao.musicaLocal ? { ...configuracao.musicaLocal } : undefined,
  };
}

function configuracaoCom(
  alteracoes: Partial<ConfiguracaoCriacaoVideo>,
): ConfiguracaoCriacaoVideo {
  return copiarConfiguracao({
    ...configuracaoInicialVideo,
    ...alteracoes,
    cenas: alteracoes.cenas ?? configuracaoInicialVideo.cenas,
  });
}

export function criarTemplatesSistema(): TemplateStudio[] {
  const agora = new Date().toISOString();
  return [
    {
      id: "template-sistema-curiosidades",
      nome: "Curiosidades rápidas",
      descricao: "Vídeo vertical de até 45 segundos com gancho imediato, fatos curtos e ritmo visual acelerado.",
      categoria: "curiosidades",
      status: "ativo",
      origem: "sistema",
      sistema: true,
      favorito: true,
      tags: ["shorts", "gancho", "curiosidades"],
      corDestaque: "#1f9b83",
      configuracao: configuracaoCom({
        nomeProjeto: "Curiosidades rápidas",
        objetivo: "entreter",
        duracao: "45 segundos",
        formato: "9:16",
        modo: "assistido",
        promptRoteiro:
          "Crie um roteiro de curiosidades com uma afirmação surpreendente nos primeiros dois segundos, três fatos curtos e um fechamento que incentive comentários.",
        systemPrompt:
          "Você é um roteirista de vídeos curtos com foco em curiosidade, retenção e cenas fáceis de representar visualmente.",
        presetLegenda: "shorts",
        musica: "forward-pulse",
        volumeMusica: 16,
      }),
      usos: 12,
      criadoEm: agora,
      atualizadoEm: agora,
    },
    {
      id: "template-sistema-lista",
      nome: "Lista Top 5",
      descricao: "Estrutura numerada para recomendações, erros comuns, ferramentas ou ideias em sequência.",
      categoria: "lista",
      status: "ativo",
      origem: "sistema",
      sistema: true,
      favorito: false,
      tags: ["lista", "top-5", "ritmo"],
      corDestaque: "#446f8f",
      configuracao: configuracaoCom({
        nomeProjeto: "Lista Top 5",
        objetivo: "informar",
        duracao: "60 segundos",
        promptRoteiro:
          "Organize o assunto em cinco itens numerados. Cada item deve ter uma frase principal, um exemplo visual e uma transição curta para o próximo.",
        systemPrompt:
          "Você transforma assuntos complexos em listas objetivas, sem introduções longas e com linguagem natural em português brasileiro.",
        presetLegenda: "shorts",
        musica: "digital-focus",
      }),
      usos: 8,
      criadoEm: agora,
      atualizadoEm: agora,
    },
    {
      id: "template-sistema-historia",
      nome: "História sombria",
      descricao: "Narrativa curta com mistério, progressão dramática, narração mais lenta e trilha atmosférica.",
      categoria: "historia",
      status: "ativo",
      origem: "sistema",
      sistema: true,
      favorito: false,
      tags: ["storytelling", "mistério", "dark"],
      corDestaque: "#6b6179",
      configuracao: configuracaoCom({
        nomeProjeto: "História sombria",
        objetivo: "entreter",
        duracao: "90 segundos",
        promptRoteiro:
          "Conte uma história curta em três atos: situação estranha, descoberta inquietante e conclusão memorável. Use frases visuais e evite explicar tudo cedo demais.",
        systemPrompt:
          "Você escreve narrativas sombrias e elegantes, com suspense progressivo, imagens concretas e ritmo cinematográfico.",
        provedorVoz: "TTS local",
        voz: "local-narrador-01",
        velocidadeVoz: 0.92,
        presetLegenda: "documentario",
        musica: "quiet-motion",
        volumeMusica: 14,
        qualidade: "1080p · Alta qualidade",
      }),
      usos: 5,
      criadoEm: agora,
      atualizadoEm: agora,
    },
    {
      id: "template-sistema-noticia",
      nome: "Notícia explicada",
      descricao: "Resumo contextualizado com fato principal, impacto e o que acompanhar em seguida.",
      categoria: "noticia",
      status: "ativo",
      origem: "sistema",
      sistema: true,
      favorito: false,
      tags: ["notícia", "contexto", "informativo"],
      corDestaque: "#586f7c",
      configuracao: configuracaoCom({
        nomeProjeto: "Notícia explicada",
        objetivo: "informar",
        duracao: "60 segundos",
        promptRoteiro:
          "Explique a notícia começando pelo fato principal, depois apresente contexto, impacto prático e finalize com o próximo ponto que merece atenção.",
        systemPrompt:
          "Você é um editor de notícias objetivo. Diferencie fatos de interpretações, evite sensacionalismo e use linguagem acessível.",
        presetLegenda: "limpa",
        musica: "digital-focus",
        volumeMusica: 10,
      }),
      usos: 7,
      criadoEm: agora,
      atualizadoEm: agora,
    },
    {
      id: "template-sistema-educativo",
      nome: "Educativo clean",
      descricao: "Explicação didática em problema, conceito, exemplo e aplicação prática.",
      categoria: "educativo",
      status: "ativo",
      origem: "sistema",
      sistema: true,
      favorito: true,
      tags: ["educativo", "tutorial", "clean"],
      corDestaque: "#547f70",
      configuracao: configuracaoCom({
        nomeProjeto: "Educativo clean",
        objetivo: "educar",
        duracao: "60 segundos",
        promptRoteiro:
          "Ensine o conceito em quatro blocos: problema, explicação simples, exemplo concreto e ação prática. Use frases curtas e analogias visuais.",
        systemPrompt:
          "Você é um professor direto e visual. Explique sem jargões, preserve a precisão e sempre ofereça um exemplo aplicável.",
        presetLegenda: "minimalista",
        musica: "quiet-motion",
        volumeMusica: 12,
      }),
      usos: 10,
      criadoEm: agora,
      atualizadoEm: agora,
    },
    {
      id: "template-sistema-promocional",
      nome: "Produto em destaque",
      descricao: "Apresentação de produto ou serviço com problema, benefício, prova e chamada para ação.",
      categoria: "promocional",
      status: "ativo",
      origem: "sistema",
      sistema: true,
      favorito: false,
      tags: ["produto", "conversão", "cta"],
      corDestaque: "#8b6850",
      configuracao: configuracaoCom({
        nomeProjeto: "Produto em destaque",
        objetivo: "promover",
        duracao: "45 segundos",
        promptRoteiro:
          "Apresente o problema do público, mostre o benefício principal, inclua uma prova ou diferencial e finalize com uma chamada para ação clara.",
        systemPrompt:
          "Você escreve anúncios naturais, específicos e confiáveis, evitando promessas exageradas e clichês de venda.",
        presetLegenda: "shorts",
        musica: "forward-pulse",
        volumeMusica: 18,
      }),
      usos: 4,
      criadoEm: agora,
      atualizadoEm: agora,
    },
    {
      id: "template-sistema-documentario",
      nome: "Documentário curto",
      descricao: "Tom editorial, narração equilibrada, cenas mais longas e legendas discretas.",
      categoria: "documentario",
      status: "ativo",
      origem: "sistema",
      sistema: true,
      favorito: false,
      tags: ["documentário", "editorial", "cinema"],
      corDestaque: "#776f5b",
      configuracao: configuracaoCom({
        nomeProjeto: "Documentário curto",
        objetivo: "informar",
        plataforma: "youtube",
        formato: "16:9",
        duracao: "90 segundos",
        promptRoteiro:
          "Construa uma narrativa documental curta com contexto histórico, personagem ou conflito central, evidência visual e conclusão reflexiva.",
        systemPrompt:
          "Você é um roteirista documental com tom sóbrio, precisão factual e preocupação com continuidade visual entre as cenas.",
        velocidadeVoz: 0.95,
        presetLegenda: "documentario",
        musica: "quiet-motion",
        volumeMusica: 11,
      }),
      usos: 6,
      criadoEm: agora,
      atualizadoEm: agora,
    },
    {
      id: "template-sistema-dark-lofi",
      nome: "Dark Lo-fi",
      descricao: "Vídeo contemplativo para música, estudos ou relaxamento com atmosfera melancólica.",
      categoria: "dark-lofi",
      status: "ativo",
      origem: "sistema",
      sistema: true,
      favorito: true,
      tags: ["dark", "lo-fi", "ambient"],
      corDestaque: "#5f6175",
      configuracao: configuracaoCom({
        nomeProjeto: "Dark Lo-fi",
        objetivo: "entreter",
        plataforma: "youtube",
        formato: "16:9",
        duracao: "90 segundos",
        roteiro: "",
        promptRoteiro:
          "Crie apenas uma descrição visual contínua e contemplativa. Não use narração explicativa; priorize atmosfera, pequenos movimentos e repetição confortável.",
        systemPrompt:
          "Você dirige cenas lo-fi melancólicas, adultas e consistentes, com pouca ação, iluminação noturna e continuidade visual.",
        provedorVoz: "Áudio próprio",
        legendasAtivas: false,
        musicaAtiva: true,
        musica: "quiet-motion",
        volumeMusica: 74,
        qualidade: "1080p · Alta qualidade",
      }),
      usos: 9,
      criadoEm: agora,
      atualizadoEm: agora,
    },
  ];
}

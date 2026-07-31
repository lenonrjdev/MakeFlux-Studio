import {
  BookOpenText,
  Bot,
  Boxes,
  CircleHelp,
  Clapperboard,
  FolderKanban,
  Gauge,
  Library,
  PlugZap,
  Rocket,
  Settings2,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import type { GrupoNavegacao } from "@/types/navegacao";

export const gruposNavegacao: GrupoNavegacao[] = [
  {
    titulo: "Principal",
    itens: [
      { titulo: "Início", href: "/", icone: Gauge },
      { titulo: "Criar vídeo", href: "/criar-video", icone: WandSparkles },
      {
        titulo: "Projetos",
        href: "/projetos",
        icone: FolderKanban,
        subitens: [
          { titulo: "Ativos", href: "/projetos?status=ativos", indicador: "verde" },
          { titulo: "Rascunhos", href: "/projetos?status=rascunhos", indicador: "cinza" },
          { titulo: "Concluídos", href: "/projetos?status=concluidos", indicador: "verde" },
          { titulo: "Arquivados", href: "/projetos?status=arquivados", indicador: "cinza" },
        ],
      },
      { titulo: "Produção", href: "/producao", icone: Clapperboard },
    ],
  },
  {
    titulo: "Recursos",
    itens: [
      { titulo: "Laboratório de IA", href: "/laboratorio-de-ia", icone: Bot },
      { titulo: "Biblioteca", href: "/biblioteca", icone: Library },
      { titulo: "Templates", href: "/templates", icone: Boxes },
    ],
  },
  {
    titulo: "Distribuição",
    itens: [{ titulo: "Publicação", href: "/publicacao", icone: Rocket }],
  },
  {
    titulo: "Sistema",
    itens: [
      { titulo: "Integrações", href: "/integracoes", icone: PlugZap },
      { titulo: "Configurações", href: "/configuracoes", icone: Settings2 },
      { titulo: "Central de ajuda", href: "/central-de-ajuda", icone: CircleHelp },
    ],
  },
];

export const atalhosRodape = [
  { titulo: "Guia inicial", href: "/central-de-ajuda?secao=primeiros-passos", icone: BookOpenText },
  { titulo: "Novidades", href: "/central-de-ajuda?secao=novidades", icone: Sparkles },
];

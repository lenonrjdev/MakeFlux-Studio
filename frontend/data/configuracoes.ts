import {
  Archive,
  Cpu,
  Folder,
  HardDrive,
  Palette,
  RefreshCw,
  Settings2,
  Shield,
  User,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";

import type { SecaoConfiguracoes } from "@/types/configuracoes";

export type ItemNavegacaoConfiguracoes = {
  id: SecaoConfiguracoes;
  titulo: string;
  descricao: string;
  icone: LucideIcon;
};

export const secoesConfiguracoes: ItemNavegacaoConfiguracoes[] = [
  { id: "perfil", titulo: "Meu perfil", descricao: "Identidade local e metadados", icone: User },
  { id: "workspace", titulo: "Workspace", descricao: "Pastas e organização", icone: Folder },
  { id: "padroes", titulo: "Padrões de criação", descricao: "Preferências do estúdio", icone: WandSparkles },
  { id: "desempenho", titulo: "Desempenho", descricao: "CPU, GPU, fila e limites", icone: Cpu },
  { id: "armazenamento", titulo: "Armazenamento", descricao: "Cache e retenção", icone: HardDrive },
  { id: "aparencia", titulo: "Aparência", descricao: "Tema, escala e densidade", icone: Palette },
  { id: "backup", titulo: "Backup e restauração", descricao: "Cópias locais do workspace", icone: Archive },
  { id: "seguranca", titulo: "Segurança", descricao: "Bloqueio e privacidade", icone: Shield },
  { id: "atualizacoes", titulo: "Atualizações", descricao: "Aplicativo e motor", icone: RefreshCw },
];

export const idiomasInterface = [
  { id: "pt-BR", titulo: "Português do Brasil" },
  { id: "en-US", titulo: "English" },
  { id: "es-ES", titulo: "Español" },
] as const;

export const opcoesTema = [
  { id: "sistema", titulo: "Sistema", detalhe: "Acompanha o Windows" },
  { id: "claro", titulo: "Claro", detalhe: "Interface clara" },
  { id: "escuro", titulo: "Escuro", detalhe: "Menos luminosidade" },
] as const;

export const opcoesDensidade = [
  { id: "confortavel", titulo: "Confortável", detalhe: "Mais respiro" },
  { id: "compacta", titulo: "Compacta", detalhe: "Mais conteúdo" },
] as const;

export const categoriasChavesWorkspace: Record<string, string> = {
  "makeflux:workspace-projetos:v1": "Projetos",
  "makeflux:workspace-producao:v1": "Produção",
  "makeflux:workspace-laboratorio-ia:v1": "Laboratório",
  "makeflux:workspace-biblioteca:v1": "Biblioteca",
  "makeflux:workspace-templates:v1": "Templates",
  "makeflux:workspace-publicacao:v1": "Publicação",
  "makeflux:workspace-integracoes:v1": "Integrações",
  "makeflux:workspace-configuracoes:v1": "Configurações",
};

export const iconeConfiguracoes = Settings2;

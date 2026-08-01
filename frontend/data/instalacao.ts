
import { Boxes, CheckCircle2, Cpu, FolderKanban, PlayCircle } from "lucide-react";

import type { EtapaInstalacao, IdDependenciaInstalacao } from "@/types/instalacao";

export const etapasInstalacao: Array<{
  id: EtapaInstalacao;
  titulo: string;
  descricao: string;
  icone: typeof Cpu;
}> = [
  { id: "diagnostico", titulo: "Diagnóstico", descricao: "Verificar Windows e ferramentas", icone: Cpu },
  { id: "workspace", titulo: "Workspace", descricao: "Criar pastas permanentes", icone: FolderKanban },
  { id: "dependencias", titulo: "Dependências", descricao: "Instalar ferramentas aprovadas", icone: Boxes },
  { id: "motor", titulo: "MoneyPrinterTurbo", descricao: "Clonar e sincronizar o ambiente", icone: PlayCircle },
  { id: "homologacao", titulo: "Homologação", descricao: "Validar motor e preparar o primeiro vídeo", icone: CheckCircle2 },
];

export const ordemDependencias: IdDependenciaInstalacao[] = [
  "git",
  "uv",
  "ffmpeg",
  "imagemagick",
  "python",
];

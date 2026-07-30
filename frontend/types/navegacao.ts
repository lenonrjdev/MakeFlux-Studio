import type { LucideIcon } from "lucide-react";

export type SubitemNavegacao = {
  titulo: string;
  href: string;
  indicador?: "verde" | "cinza" | "laranja";
};

export type ItemNavegacao = {
  titulo: string;
  href?: string;
  icone: LucideIcon;
  subitens?: SubitemNavegacao[];
};

export type GrupoNavegacao = {
  titulo: string;
  itens: ItemNavegacao[];
};

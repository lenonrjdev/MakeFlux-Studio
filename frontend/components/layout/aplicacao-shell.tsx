import type { ReactNode } from "react";

import { BarraLateral } from "@/components/barra-lateral/barra-lateral";

export function AplicacaoShell({ children }: { children: ReactNode }) {
  return (
    <div className="aplicacao-shell min-h-screen bg-[#f7f8f9]">
      <BarraLateral />
      <main className="conteudo-aplicacao min-h-screen pl-[218px]">{children}</main>
    </div>
  );
}

import type { ReactNode } from "react";

import { BarraLateral } from "@/components/barra-lateral/barra-lateral";

export function AplicacaoShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f8f9]">
      <BarraLateral />
      <main className="min-h-screen pl-[218px]">{children}</main>
    </div>
  );
}

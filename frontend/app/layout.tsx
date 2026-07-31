import type { Metadata } from "next";

import { ProvedorConfiguracoes } from "@/components/configuracoes/provedor-configuracoes";
import { ProvedorPersistenciaNativa } from "@/components/qualidade/provedor-persistencia-nativa";
import { AplicacaoShell } from "@/components/layout/aplicacao-shell";

import "./globals.css";

export const metadata: Metadata = {
  title: "MakeFlux Studio",
  description: "Estúdio desktop para criação de vídeos com inteligência artificial.",
};

export default function LayoutRaiz({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ProvedorPersistenciaNativa>
          <ProvedorConfiguracoes>
            <AplicacaoShell>{children}</AplicacaoShell>
          </ProvedorConfiguracoes>
        </ProvedorPersistenciaNativa>
      </body>
    </html>
  );
}

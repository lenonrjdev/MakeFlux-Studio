"use client";

import { Bell, CircleHelp, Plus, Search, UsersRound } from "lucide-react";
import { usePathname } from "next/navigation";

import { Botao, BotaoLink } from "@/components/ui/botao";
import { useConfiguracoesLocais } from "@/hooks/use-configuracoes-locais";

const titulosRotas: Record<string, string> = {
  "/": "Início",
  "/criar-video": "Criar vídeo",
  "/projetos": "Projetos",
  "/producao": "Produção",
  "/laboratorio-de-ia": "Laboratório de IA",
  "/biblioteca": "Biblioteca",
  "/templates": "Templates",
  "/publicacao": "Publicação",
  "/integracoes": "Integrações",
  "/configuracoes": "Configurações",
  "/qualidade": "Qualidade e distribuição",
  "/central-de-ajuda": "Central de ajuda",
};

export function CabecalhoAplicacao() {
  const pathname = usePathname();
  const { workspace } = useConfiguracoesLocais();
  const iniciais = workspace.perfil.nome.split(" ").filter(Boolean).slice(0, 2).map((parte) => parte[0]).join("").toUpperCase() || "MF";
  const tituloAtual = titulosRotas[pathname] ?? "MakeFlux Studio";
  const criandoVideo = pathname === "/criar-video";

  return (
    <header className="flex h-[62px] items-center justify-between border-b border-[#e6eaea] bg-white px-8">
      <div className="flex items-center gap-2 text-[10.5px] text-[#8b9293]">
        <span>MakeFlux Studio</span>
        <span className="text-[#c4c9c9]">/</span>
        <strong className="font-medium text-[#4b5253]">{tituloAtual}</strong>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Buscar no aplicativo"
          className="foco-acessivel grid size-8 place-items-center rounded-md text-[#697172] hover:bg-[#f2f4f4]"
        >
          <Search className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Abrir ajuda"
          className="foco-acessivel grid size-8 place-items-center rounded-md text-[#697172] hover:bg-[#f2f4f4]"
        >
          <CircleHelp className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Abrir notificações"
          className="foco-acessivel relative grid size-8 place-items-center rounded-md text-[#697172] hover:bg-[#f2f4f4]"
        >
          <Bell className="size-4" />
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[#d85e5e] ring-2 ring-white" />
        </button>
        <Botao className="ml-1 h-8 px-2.5">
          <UsersRound className="size-3.5" />
          {workspace.workspace.nome || "Workspace"}
        </Botao>
        {!criandoVideo && (
          <BotaoLink href="/criar-video" variante="primario" className="ml-1 h-8 px-3">
            <Plus className="size-3.5" />
            Novo vídeo
          </BotaoLink>
        )}
        <div className="ml-2 grid size-8 place-items-center rounded-full bg-[#e7f3ef] text-[10px] font-semibold text-[#1b7966] ring-1 ring-[#d6e8e3]">
          {iniciais}
        </div>
      </div>
    </header>
  );
}

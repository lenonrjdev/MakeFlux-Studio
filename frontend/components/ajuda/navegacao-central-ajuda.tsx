import {
  Activity,
  BookOpenText,
  CircleHelp,
  GraduationCap,
  LifeBuoy,
  ListChecks,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import type { SecaoAjuda } from "@/types/ajuda";

const itens: Array<{ id: SecaoAjuda; titulo: string; descricao: string; icone: LucideIcon }> = [
  { id: "visao-geral", titulo: "Visão geral", descricao: "Resumo e atalhos", icone: CircleHelp },
  { id: "primeiros-passos", titulo: "Primeiros passos", descricao: "Onboarding guiado", icone: ListChecks },
  { id: "guias", titulo: "Guias", descricao: "Tutoriais do produto", icone: BookOpenText },
  { id: "diagnostico", titulo: "Diagnóstico", descricao: "Verificação local", icone: Activity },
  { id: "solucao-problemas", titulo: "Solução de problemas", descricao: "Correções guiadas", icone: Wrench },
  { id: "suporte", titulo: "Pacote de suporte", descricao: "Relatório sanitizado", icone: LifeBuoy },
  { id: "novidades", titulo: "Novidades", descricao: "Histórico de versões", icone: Sparkles },
];

export function NavegacaoCentralAjuda({ secao, aoSelecionar }: { secao: SecaoAjuda; aoSelecionar: (secao: SecaoAjuda) => void }) {
  return (
    <aside className="sticky top-4 rounded-md border border-[#e2e7e6] bg-white p-2">
      <div className="mb-2 flex items-center gap-2 border-b border-[#edf0f0] px-2.5 py-2 text-[9px] font-semibold uppercase tracking-[0.05em] text-[#7b8384]">
        <GraduationCap className="size-3.5" />
        Central de ajuda
      </div>
      <nav className="space-y-1">
        {itens.map((item) => {
          const Icone = item.icone;
          const ativo = secao === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => aoSelecionar(item.id)}
              className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2.5 text-left transition ${ativo ? "bg-[#edf7f4] text-[#1c7865]" : "text-[#626a6b] hover:bg-[#f6f8f8]"}`}
            >
              <Icone className="size-4 shrink-0" />
              <span className="min-w-0">
                <span className="block text-[10px] font-medium">{item.titulo}</span>
                <span className={`mt-0.5 block text-[8.5px] ${ativo ? "text-[#6d9d92]" : "text-[#a0a6a7]"}`}>{item.descricao}</span>
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

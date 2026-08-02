import { GitBranch, RotateCcw } from "lucide-react";

import { SeletorSegmentado } from "@/components/ui/seletor-segmentado";
import { conteudoAtualizador } from "@/content/atualizador";
import type { WorkspaceAtualizador } from "@/types/atualizador";

export function PainelCanalAtualizacao({
  canal,
  aoAlterar,
}: {
  canal: WorkspaceAtualizador["canal"];
  aoAlterar: (canal: WorkspaceAtualizador["canal"]) => void;
}) {
  return (
    <section className="rounded-md border border-[#e1e7e6] bg-white p-4">
      <div className="flex items-center gap-2 text-[10px] font-semibold text-[#303737]">
        <GitBranch className="size-3.5 text-[#278a76]" /> Canal e recuperação
      </div>

      <div className="mt-3">
        <SeletorSegmentado
          valor={canal}
          aoAlterar={aoAlterar}
          opcoes={[
            { id: "estavel", titulo: "Estável" },
            { id: "beta", titulo: "Beta" },
          ]}
        />
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-md bg-[#f6f8f8] px-3 py-2.5 text-[7.5px] leading-4 text-[#747d7c]">
        <RotateCcw className="mt-0.5 size-3.5 shrink-0" />
        {conteudoAtualizador.avisoRollback}
      </div>
    </section>
  );
}

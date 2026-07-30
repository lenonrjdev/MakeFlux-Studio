import { Check, Clock3, Heart, MoreHorizontal, Play, Sparkles } from "lucide-react";

import { Botao } from "@/components/ui/botao";
import { juntarClasses } from "@/lib/classes";
import type { ProjetoRecente } from "@/types/projeto";

const estiloStatus = {
  Rascunho: "text-[#8a643f]",
  "Em produção": "text-[#1b7c69]",
  "Pronto para renderizar": "text-[#1b7c69]",
  Concluído: "text-[#596162]",
};

export function CartaoProjeto({ projeto }: { projeto: ProjetoRecente }) {
  return (
    <article className="painel-superficie flex min-h-[206px] flex-col rounded-md p-4 transition hover:-translate-y-0.5 hover:border-[#d8dddd] hover:shadow-[0_5px_18px_rgba(27,36,34,.06)]">
      <div className="flex items-start gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-[#e7f3ef] text-[10px] font-semibold text-[#1a7865] ring-1 ring-[#d9e8e4]">
          {projeto.iniciais}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-[12px] font-semibold tracking-[-0.01em] text-[#242829]">{projeto.titulo}</h3>
            <button className="foco-acessivel -mr-1 grid size-6 shrink-0 place-items-center rounded-md text-[#909798] hover:bg-[#f1f3f3]">
              <MoreHorizontal className="size-3.5" />
            </button>
          </div>
          <p className="mt-1 line-clamp-1 text-[9.5px] text-[#858c8d]">{projeto.descricao}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 divide-x divide-[#e7ebeb] rounded-md border border-[#e5e9e9] bg-[#fafbfb] py-2.5">
        <div className="px-3">
          <span className="block text-[9.5px] font-medium text-[#333839]">{projeto.formato}</span>
          <span className="mt-1 block text-[7.5px] uppercase tracking-[0.05em] text-[#9aa1a2]">Formato de saída</span>
        </div>
        <div className="px-3">
          <span className="block text-[9.5px] font-medium text-[#333839]">{projeto.duracao}</span>
          <span className="mt-1 block text-[7.5px] uppercase tracking-[0.05em] text-[#9aa1a2]">Duração estimada</span>
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-1.5 flex items-center justify-between text-[8.5px]">
          <span className={juntarClasses("font-medium", estiloStatus[projeto.status])}>{projeto.status}</span>
          <span className="text-[#909798]">{projeto.progresso}%</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-[#edf0f0]">
          <div className="h-full rounded-full bg-[#2a9a84]" style={{ width: `${projeto.progresso}%` }} />
        </div>
      </div>

      <div className="mt-auto flex items-center gap-2 pt-3">
        <Botao className="h-8 flex-1 px-2.5">
          <Heart className="size-3" />
          Favoritar
        </Botao>
        <Botao variante={projeto.status === "Concluído" ? "secundario" : "primario"} className="h-8 flex-1 px-2.5">
          {projeto.status === "Concluído" ? <Play className="size-3" /> : <Sparkles className="size-3" />}
          {projeto.status === "Concluído" ? "Visualizar" : "Continuar"}
        </Botao>
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-[#eff1f1] pt-2 text-[8.5px] text-[#8e9596]">
        <span className="inline-flex items-center gap-1">
          {projeto.status === "Concluído" ? <Check className="size-3 text-[#28947f]" /> : <Clock3 className="size-3" />}
          {projeto.destaque}
        </span>
        <span>{projeto.atualizadoEm}</span>
      </div>
    </article>
  );
}

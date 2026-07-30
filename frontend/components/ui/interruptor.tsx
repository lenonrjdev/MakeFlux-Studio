"use client";

import { juntarClasses } from "@/lib/classes";

export function Interruptor({
  ativo,
  aoAlterar,
  rotulo,
  descricao,
}: {
  ativo: boolean;
  aoAlterar: (ativo: boolean) => void;
  rotulo: string;
  descricao?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-5 rounded-md border border-[#e3e7e7] bg-[#fafbfb] px-3.5 py-3">
      <div>
        <strong className="block text-[10.5px] font-medium text-[#303637]">{rotulo}</strong>
        {descricao && <span className="mt-1 block text-[9px] leading-4 text-[#8c9394]">{descricao}</span>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={ativo}
        onClick={() => aoAlterar(!ativo)}
        className={juntarClasses(
          "foco-acessivel relative h-5 w-9 shrink-0 rounded-full border transition",
          ativo ? "border-[#208a75] bg-[#269b84]" : "border-[#d1d7d7] bg-[#e4e8e8]",
        )}
      >
        <span
          className={juntarClasses(
            "absolute top-0.5 size-3.5 rounded-full bg-white shadow-sm transition",
            ativo ? "left-[17px]" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}

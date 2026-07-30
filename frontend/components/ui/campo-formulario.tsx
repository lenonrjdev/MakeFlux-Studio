import type { ReactNode } from "react";

import { juntarClasses } from "@/lib/classes";

export function CampoFormulario({
  rotulo,
  descricao,
  opcional,
  children,
  className,
}: {
  rotulo: string;
  descricao?: string;
  opcional?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={juntarClasses("space-y-2", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <label className="block text-[10.5px] font-semibold text-[#303637]">{rotulo}</label>
          {descricao && <p className="mt-1 text-[9px] leading-4 text-[#8b9293]">{descricao}</p>}
        </div>
        {opcional && <span className="text-[8px] uppercase tracking-[0.06em] text-[#a0a6a7]">Opcional</span>}
      </div>
      {children}
    </div>
  );
}

export const classesCampo =
  "foco-acessivel w-full rounded-md border border-[#dfe4e4] bg-white px-3 text-[11px] text-[#2f3435] placeholder:text-[#a0a6a7] hover:border-[#d2d8d8] focus:border-[#8fc6ba]";

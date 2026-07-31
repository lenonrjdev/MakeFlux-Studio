import type { ReactNode } from "react";

export function CartaoConfiguracao({ titulo, descricao, acao, children }: { titulo: string; descricao?: string; acao?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-md border border-[#e2e7e6] bg-white">
      <header className="flex items-start justify-between gap-5 border-b border-[#edf0f0] px-5 py-4">
        <div>
          <h2 className="text-[12px] font-semibold text-[#252a2b]">{titulo}</h2>
          {descricao && <p className="mt-1 text-[9.5px] leading-4 text-[#8b9293]">{descricao}</p>}
        </div>
        {acao}
      </header>
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}

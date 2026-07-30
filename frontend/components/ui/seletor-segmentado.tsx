"use client";

import { juntarClasses } from "@/lib/classes";

export function SeletorSegmentado<T extends string>({
  valor,
  opcoes,
  aoAlterar,
  className,
}: {
  valor: T;
  opcoes: ReadonlyArray<{ id: T; titulo: string; detalhe?: string }>;
  aoAlterar: (valor: T) => void;
  className?: string;
}) {
  return (
    <div className={juntarClasses("grid gap-1 rounded-md border border-[#dfe4e4] bg-[#f3f5f5] p-1", className)}>
      {opcoes.map((opcao) => {
        const ativo = valor === opcao.id;
        return (
          <button
            key={opcao.id}
            type="button"
            onClick={() => aoAlterar(opcao.id)}
            className={juntarClasses(
              "foco-acessivel rounded-[5px] px-3 py-2 text-left transition",
              ativo
                ? "bg-white text-[#202526] shadow-[0_1px_2px_rgba(20,29,27,.08)]"
                : "text-[#737b7c] hover:bg-white/65 hover:text-[#363c3d]",
            )}
          >
            <strong className="block text-[10px] font-medium">{opcao.titulo}</strong>
            {opcao.detalhe && <span className="mt-0.5 block text-[8px] text-[#959c9d]">{opcao.detalhe}</span>}
          </button>
        );
      })}
    </div>
  );
}

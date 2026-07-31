import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link, { type LinkProps } from "next/link";

import { juntarClasses } from "@/lib/classes";

type VarianteBotao = "primario" | "secundario" | "fantasma";

const variantes: Record<VarianteBotao, string> = {
  primario:
    "border-[#18806c] bg-[#1f9b83] text-white shadow-[0_1px_1px_rgba(16,86,72,.18)] hover:bg-[#18866f]",
  secundario: "border-[#dfe4e4] bg-white text-[#313637] hover:bg-[#f7f9f9]",
  fantasma: "border-transparent bg-transparent text-[#697172] hover:bg-[#eef1f1]",
};

function classesBotao(variante: VarianteBotao, className?: string) {
  return juntarClasses(
    "foco-acessivel inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3.5 text-[12px] font-medium transition disabled:cursor-not-allowed disabled:opacity-55",
    variantes[variante],
    className,
  );
}

export function Botao({
  children,
  className,
  variante = "secundario",
  ...propriedades
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variante?: VarianteBotao;
}) {
  return (
    <button className={classesBotao(variante, className)} {...propriedades}>
      {children}
    </button>
  );
}

export function BotaoLink({
  children,
  className,
  variante = "secundario",
  ...propriedades
}: LinkProps & {
  children: ReactNode;
  className?: string;
  variante?: VarianteBotao;
}) {
  return (
    <Link className={classesBotao(variante, className)} {...propriedades}>
      {children}
    </Link>
  );
}

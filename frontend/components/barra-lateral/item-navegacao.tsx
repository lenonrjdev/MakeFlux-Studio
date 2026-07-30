"use client";

import { ChevronDown, Folder, FolderOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { juntarClasses } from "@/lib/classes";
import type { ItemNavegacao } from "@/types/navegacao";

export function ItemNavegacaoBarra({ item }: { item: ItemNavegacao }) {
  const pathname = usePathname();
  const ativo = item.href === "/" ? pathname === "/" : Boolean(item.href && pathname.startsWith(item.href));
  const [aberto, setAberto] = useState(Boolean(item.subitens && ativo));
  const Icone = item.icone;

  if (item.subitens) {
    return (
      <div>
        <div className="flex items-center gap-1">
          <Link
            href={item.href ?? "#"}
            className={juntarClasses(
              "foco-acessivel flex min-w-0 flex-1 items-center gap-2.5 rounded-md px-2.5 py-2 text-[12px] transition",
              ativo
                ? "bg-[#edf3f1] font-medium text-[#202526]"
                : "text-[#626a6b] hover:bg-[#f2f4f4] hover:text-[#252a2b]",
            )}
          >
            {aberto ? <FolderOpen className="size-[15px]" /> : <Folder className="size-[15px]" />}
            <span className="truncate">{item.titulo}</span>
          </Link>
          <button
            type="button"
            aria-label={aberto ? "Recolher grupo" : "Expandir grupo"}
            onClick={() => setAberto((estado) => !estado)}
            className="foco-acessivel grid size-7 place-items-center rounded-md text-[#8b9293] hover:bg-[#f0f2f2]"
          >
            <ChevronDown className={juntarClasses("size-3.5 transition", aberto && "rotate-180")} />
          </button>
        </div>

        {aberto && (
          <div className="relative ml-[18px] mt-0.5 space-y-0.5 border-l border-[#e1e5e5] pl-4">
            {item.subitens.map((subitem) => (
              <Link
                key={subitem.href}
                href={subitem.href}
                className="foco-acessivel flex items-center justify-between rounded-md px-2 py-1.5 text-[10.5px] text-[#747c7d] hover:bg-[#f2f4f4] hover:text-[#303637]"
              >
                <span>{subitem.titulo}</span>
                {subitem.indicador && (
                  <span
                    className={juntarClasses(
                      "size-1.5 rounded-full",
                      subitem.indicador === "verde" && "bg-[#2ba48d]",
                      subitem.indicador === "cinza" && "bg-[#cbd0d0]",
                      subitem.indicador === "laranja" && "bg-[#c88753]",
                    )}
                  />
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href ?? "#"}
      className={juntarClasses(
        "foco-acessivel flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[12px] transition",
        ativo
          ? "bg-[#edf3f1] font-medium text-[#202526]"
          : "text-[#626a6b] hover:bg-[#f2f4f4] hover:text-[#252a2b]",
      )}
    >
      <Icone className={juntarClasses("size-[15px]", ativo && "text-[#208a75]")} strokeWidth={1.8} />
      <span className="truncate">{item.titulo}</span>
    </Link>
  );
}

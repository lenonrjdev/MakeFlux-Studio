"use client";

import { RotateCcw } from "lucide-react";

import { Botao } from "@/components/ui/botao";
import { secoesConfiguracoes } from "@/data/configuracoes";
import { juntarClasses } from "@/lib/classes";
import type { SecaoConfiguracoes } from "@/types/configuracoes";

export function NavegacaoConfiguracoes({ secao, aoSelecionar, aoRestaurarTudo }: { secao: SecaoConfiguracoes; aoSelecionar: (secao: SecaoConfiguracoes) => void; aoRestaurarTudo: () => void }) {
  return (
    <aside className="sticky top-4 rounded-md border border-[#e2e7e6] bg-white p-2.5">
      <div className="space-y-0.5">
        {secoesConfiguracoes.map(({ id, titulo, descricao, icone: Icone }) => (
          <button
            key={id}
            type="button"
            onClick={() => aoSelecionar(id)}
            className={juntarClasses(
              "foco-acessivel flex w-full items-start gap-2.5 rounded-md px-2.5 py-2.5 text-left transition",
              secao === id ? "bg-[#eaf5f2] text-[#176e5d]" : "text-[#697172] hover:bg-[#f4f6f6] hover:text-[#303637]",
            )}
          >
            <Icone className="mt-0.5 size-3.5 shrink-0" />
            <span className="min-w-0">
              <strong className="block text-[10px] font-medium">{titulo}</strong>
              <span className="mt-0.5 block text-[8px] leading-3.5 text-[#969d9e]">{descricao}</span>
            </span>
          </button>
        ))}
      </div>
      <div className="mt-2 border-t border-[#edf0f0] pt-2">
        <Botao variante="fantasma" className="w-full justify-start px-2.5" onClick={aoRestaurarTudo}>
          <RotateCcw className="size-3.5" />
          Restaurar tudo
        </Botao>
      </div>
    </aside>
  );
}

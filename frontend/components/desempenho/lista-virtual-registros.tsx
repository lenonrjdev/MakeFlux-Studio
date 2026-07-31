"use client";

import { useMemo, useState } from "react";

import type { RegistroPaginado } from "@/types/desempenho";

const ALTURA_LINHA = 54;
const ALTURA_VIEWPORT = 430;
const SOBRA = 5;

function formatarBytes(valor: number) {
  if (valor < 1024) return `${valor} B`;
  return `${(valor / 1024).toFixed(1)} KB`;
}

export function ListaVirtualRegistros({ itens }: { itens: RegistroPaginado[] }) {
  const [rolagem, setRolagem] = useState(0);
  const janela = useMemo(() => {
    const inicio = Math.max(0, Math.floor(rolagem / ALTURA_LINHA) - SOBRA);
    const visiveis = Math.ceil(ALTURA_VIEWPORT / ALTURA_LINHA) + SOBRA * 2;
    const fim = Math.min(itens.length, inicio + visiveis);
    return { inicio, fim, itens: itens.slice(inicio, fim) };
  }, [itens, rolagem]);

  return (
    <div
      className="overflow-auto rounded-md border border-[#e4e8e8] bg-white"
      style={{ height: ALTURA_VIEWPORT }}
      onScroll={(evento) => setRolagem(evento.currentTarget.scrollTop)}
    >
      <div className="relative" style={{ height: itens.length * ALTURA_LINHA }}>
        <div className="absolute inset-x-0" style={{ transform: `translateY(${janela.inicio * ALTURA_LINHA}px)` }}>
          {janela.itens.map((item) => (
            <div key={item.chave} className="grid h-[54px] grid-cols-[minmax(0,1.45fr)_110px_95px_125px] items-center gap-3 border-b border-[#edf0ef] px-3.5 text-[9px]">
              <div className="min-w-0">
                <strong className="block truncate font-medium text-[#35403f]">{item.chave}</strong>
                <span className="mt-1 block truncate text-[8px] text-[#8a9292]">{item.previa}</span>
              </div>
              <span className="truncate text-[#667170]">{item.origem}</span>
              <span className="text-[#667170]">{formatarBytes(item.tamanhoBytes)}</span>
              <time className="text-right text-[#8a9292]">{new Date(item.atualizadoEm).toLocaleString("pt-BR")}</time>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

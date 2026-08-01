"use client";

import { Check, Sun } from "lucide-react";

import { CartaoConfiguracao } from "@/components/configuracoes/cartao-configuracao";
import { Interruptor } from "@/components/ui/interruptor";
import { SeletorSegmentado } from "@/components/ui/seletor-segmentado";
import { opcoesDensidade } from "@/data/configuracoes";
import type { ConfiguracaoAparencia } from "@/types/configuracoes";

export function SecaoAparencia({
  aparencia,
  aoAtualizar,
}: {
  aparencia: ConfiguracaoAparencia;
  aoAtualizar: (dados: Partial<ConfiguracaoAparencia>) => void;
}) {
  return (
    <div className="space-y-4">
      <CartaoConfiguracao
        titulo="Tema oficial"
        descricao="O MakeFlux Studio utiliza somente a interface clara do design de referência."
      >
        <div className="flex items-center justify-between gap-4 rounded-md border border-[#a9d2c8] bg-[#edf7f4] p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-md bg-white text-[#1e826d] ring-1 ring-[#cfe5df]">
              <Sun className="size-4" />
            </span>
            <div>
              <strong className="block text-[10.5px] font-medium text-[#26302e]">Claro padrão</strong>
              <span className="mt-1 block text-[8.5px] text-[#71807d]">
                Fundo cinza muito claro, cartões brancos, bordas sutis e destaque verde.
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[8px] font-medium text-[#1f7d69] ring-1 ring-[#d3e7e2]">
            <Check className="size-3" /> Ativo
          </span>
        </div>
      </CartaoConfiguracao>

      <CartaoConfiguracao titulo="Interface" descricao="Ajuste densidade, escala e comportamento visual.">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong className="mb-2 block text-[10.5px] text-[#303637]">Densidade</strong>
            <SeletorSegmentado
              valor={aparencia.densidade}
              opcoes={opcoesDensidade}
              aoAlterar={(valor) => aoAtualizar({ densidade: valor, tema: "claro" })}
              className="grid-cols-2"
            />
          </div>
          <div>
            <strong className="mb-2 block text-[10.5px] text-[#303637]">Escala</strong>
            <SeletorSegmentado
              valor={aparencia.escala}
              opcoes={[
                { id: "90", titulo: "90%" },
                { id: "100", titulo: "100%" },
                { id: "110", titulo: "110%" },
              ]}
              aoAlterar={(valor) => aoAtualizar({ escala: valor, tema: "claro" })}
              className="grid-cols-3"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Interruptor
            ativo={aparencia.reduzirAnimacoes}
            aoAlterar={(valor) => aoAtualizar({ reduzirAnimacoes: valor, tema: "claro" })}
            rotulo="Reduzir animações"
            descricao="Remove movimentos não essenciais."
          />
          <Interruptor
            ativo={aparencia.altoContraste}
            aoAlterar={(valor) => aoAtualizar({ altoContraste: valor, tema: "claro" })}
            rotulo="Contraste reforçado"
            descricao="Torna bordas e textos mais evidentes."
          />
          <Interruptor
            ativo={aparencia.sidebarCompacta}
            aoAlterar={(valor) => aoAtualizar({ sidebarCompacta: valor, tema: "claro" })}
            rotulo="Sidebar compacta"
            descricao="Reduz a largura da navegação lateral."
          />
        </div>
      </CartaoConfiguracao>
    </div>
  );
}

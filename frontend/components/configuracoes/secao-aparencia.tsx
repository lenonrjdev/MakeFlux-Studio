"use client";

import { Laptop, Moon, Sun } from "lucide-react";

import { CartaoConfiguracao } from "@/components/configuracoes/cartao-configuracao";
import { Interruptor } from "@/components/ui/interruptor";
import { SeletorSegmentado } from "@/components/ui/seletor-segmentado";
import { opcoesDensidade, opcoesTema } from "@/data/configuracoes";
import { juntarClasses } from "@/lib/classes";
import type { ConfiguracaoAparencia } from "@/types/configuracoes";

export function SecaoAparencia({ aparencia, aoAtualizar }: { aparencia: ConfiguracaoAparencia; aoAtualizar: (dados: Partial<ConfiguracaoAparencia>) => void }) {
  const icones = { sistema: Laptop, claro: Sun, escuro: Moon } as const;
  return (
    <div className="space-y-4">
      <CartaoConfiguracao titulo="Tema" descricao="A alteração é aplicada imediatamente em todo o aplicativo.">
        <div className="grid grid-cols-3 gap-3">
          {opcoesTema.map((opcao) => {
            const Icone = icones[opcao.id];
            const ativo = aparencia.tema === opcao.id;
            return <button key={opcao.id} type="button" onClick={() => aoAtualizar({ tema: opcao.id })} className={juntarClasses("foco-acessivel rounded-md border p-4 text-left transition", ativo ? "border-[#8fc6ba] bg-[#edf7f4]" : "border-[#e2e7e6] bg-white hover:bg-[#fafbfb]")}><Icone className={juntarClasses("size-4", ativo ? "text-[#1f8c76]" : "text-[#697172]")} /><strong className="mt-3 block text-[10.5px] text-[#303637]">{opcao.titulo}</strong><span className="mt-1 block text-[8.5px] text-[#92999a]">{opcao.detalhe}</span></button>;
          })}
        </div>
      </CartaoConfiguracao>
      <CartaoConfiguracao titulo="Interface" descricao="Ajuste densidade, escala e comportamento visual.">
        <div className="grid grid-cols-2 gap-4">
          <div><strong className="mb-2 block text-[10.5px] text-[#303637]">Densidade</strong><SeletorSegmentado valor={aparencia.densidade} opcoes={opcoesDensidade} aoAlterar={(valor) => aoAtualizar({ densidade: valor })} className="grid-cols-2" /></div>
          <div><strong className="mb-2 block text-[10.5px] text-[#303637]">Escala</strong><SeletorSegmentado valor={aparencia.escala} opcoes={[{ id: "90", titulo: "90%" }, { id: "100", titulo: "100%" }, { id: "110", titulo: "110%" }]} aoAlterar={(valor) => aoAtualizar({ escala: valor })} className="grid-cols-3" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Interruptor ativo={aparencia.reduzirAnimacoes} aoAlterar={(valor) => aoAtualizar({ reduzirAnimacoes: valor })} rotulo="Reduzir animações" descricao="Remove movimentos não essenciais." />
          <Interruptor ativo={aparencia.altoContraste} aoAlterar={(valor) => aoAtualizar({ altoContraste: valor })} rotulo="Contraste reforçado" descricao="Torna bordas e textos mais evidentes." />
          <Interruptor ativo={aparencia.sidebarCompacta} aoAlterar={(valor) => aoAtualizar({ sidebarCompacta: valor })} rotulo="Sidebar compacta" descricao="Reduz a largura da navegação lateral." />
        </div>
      </CartaoConfiguracao>
    </div>
  );
}

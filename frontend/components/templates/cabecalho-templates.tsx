"use client";

import { LayoutTemplate, Plus, Upload } from "lucide-react";
import { type ChangeEvent, useRef } from "react";

import { Botao } from "@/components/ui/botao";
import { conteudoTemplates } from "@/content/templates";

export function CabecalhoTemplates({
  total,
  personalizados,
  aoCriar,
  aoImportar,
}: {
  total: number;
  personalizados: number;
  aoCriar: () => void;
  aoImportar: (conteudo: string) => void;
}) {
  const entradaArquivo = useRef<HTMLInputElement>(null);

  async function importarArquivo(evento: ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!arquivo) return;
    aoImportar(await arquivo.text());
  }

  return (
    <header className="border-b border-[#e2e7e6] bg-white px-8 py-5">
      <div className="flex items-start justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 text-[8.5px] font-medium uppercase tracking-[0.08em] text-[#84908d]">
            <LayoutTemplate className="size-3" />
            {conteudoTemplates.etiqueta}
          </div>
          <h1 className="mt-2 text-[19px] font-semibold tracking-[-0.035em] text-[#202526]">
            {conteudoTemplates.titulo}
          </h1>
          <p className="mt-1.5 max-w-[720px] text-[9px] leading-4 text-[#7e8788]">
            {conteudoTemplates.descricao}
          </p>
          <div className="mt-3 flex items-center gap-2 text-[8px] text-[#8d9596]">
            <span className="rounded border border-[#e2e7e6] bg-[#f8fafa] px-2 py-1">{total} templates</span>
            <span className="rounded border border-[#e2e7e6] bg-[#f8fafa] px-2 py-1">{personalizados} personalizados</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Botao onClick={() => entradaArquivo.current?.click()}>
            <Upload className="size-3.5" />
            {conteudoTemplates.importar}
          </Botao>
          <Botao variante="primario" onClick={aoCriar}>
            <Plus className="size-3.5" />
            {conteudoTemplates.criar}
          </Botao>
          <input
            ref={entradaArquivo}
            type="file"
            accept="application/json,.json"
            onChange={importarArquivo}
            className="hidden"
          />
        </div>
      </div>
    </header>
  );
}

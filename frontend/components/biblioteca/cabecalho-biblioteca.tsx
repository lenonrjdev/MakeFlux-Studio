"use client";

import { FolderOpen, RefreshCw, Upload } from "lucide-react";
import { type ChangeEvent, useRef } from "react";

import { Botao } from "@/components/ui/botao";
import { BotaoSelecionarPasta } from "@/components/ui/botao-selecionar-pasta";
import { conteudoBiblioteca } from "@/content/biblioteca";

export function CabecalhoBiblioteca({
  total,
  pastaRaiz,
  aoImportar,
  aoSincronizar,
  aoAlterarPasta,
}: {
  total: number;
  pastaRaiz: string;
  aoImportar: (arquivos: File[]) => void;
  aoSincronizar: () => void;
  aoAlterarPasta: (pasta: string) => void;
}) {
  const entradaArquivos = useRef<HTMLInputElement>(null);

  function selecionarArquivos(evento: ChangeEvent<HTMLInputElement>) {
    const arquivos = Array.from(evento.target.files ?? []);
    if (arquivos.length > 0) aoImportar(arquivos);
    evento.target.value = "";
  }

  return (
    <header className="border-b border-[#e2e7e6] bg-white px-8 py-5">
      <div className="flex items-start justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 text-[8.5px] font-medium uppercase tracking-[0.08em] text-[#84908d]">
            <FolderOpen className="size-3" />
            Recursos locais
          </div>
          <h1 className="mt-2 text-[19px] font-semibold tracking-[-0.035em] text-[#202526]">
            {conteudoBiblioteca.titulo}
          </h1>
          <p className="mt-1.5 max-w-[700px] text-[9px] leading-4 text-[#7e8788]">
            {conteudoBiblioteca.descricao}
          </p>
          <div className="mt-3 flex items-center gap-2 text-[8px] text-[#8d9596]">
            <span className="rounded border border-[#e2e7e6] bg-[#f8fafa] px-2 py-1">
              {total} recursos indexados
            </span>
            <span className="max-w-[420px] truncate rounded border border-[#e2e7e6] bg-[#f8fafa] px-2 py-1">
              {pastaRaiz}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <BotaoSelecionarPasta
            rotulo="Escolher pasta raiz"
            tituloDialogo="Escolha a pasta raiz da Biblioteca"
            chaveArmazenamento="makeflux:pasta-biblioteca"
            className="h-9 max-w-[230px]"
            aoSelecionar={aoAlterarPasta}
          />
          <Botao onClick={aoSincronizar}>
            <RefreshCw className="size-3.5" />
            {conteudoBiblioteca.sincronizar}
          </Botao>
          <Botao variante="primario" onClick={() => entradaArquivos.current?.click()}>
            <Upload className="size-3.5" />
            {conteudoBiblioteca.importar}
          </Botao>
          <input
            id="entrada-recursos-biblioteca"
            ref={entradaArquivos}
            type="file"
            multiple
            onChange={selecionarArquivos}
            className="hidden"
            accept="video/*,image/*,audio/*,.srt,.vtt,.ass,.ttf,.otf,.woff,.woff2,.txt,.md,.json"
          />
        </div>
      </div>
    </header>
  );
}

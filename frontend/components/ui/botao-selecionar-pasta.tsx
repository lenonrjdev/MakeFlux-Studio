"use client";

import { Check, FolderOpen, LoaderCircle } from "lucide-react";

import { useSeletorPasta } from "@/hooks/use-seletor-pasta";

import { Botao } from "./botao";

export function BotaoSelecionarPasta({
  rotulo = "Escolher pasta principal",
  tituloDialogo = "Escolha a pasta principal do MakeFlux Studio",
  chaveArmazenamento = "makeflux:pasta-estudio",
  className,
}: {
  rotulo?: string;
  tituloDialogo?: string;
  chaveArmazenamento?: string;
  className?: string;
}) {
  const { pasta, selecionando, erro, selecionarPasta } = useSeletorPasta({
    chaveArmazenamento,
    tituloDialogo,
  });

  return (
    <div className="min-w-0">
      <Botao onClick={selecionarPasta} disabled={selecionando} className={className ?? "max-w-full"}>
        {selecionando ? (
          <LoaderCircle className="size-3.5 animate-spin" />
        ) : pasta ? (
          <Check className="size-3.5 text-[#1f9b83]" />
        ) : (
          <FolderOpen className="size-3.5" />
        )}
        <span className="max-w-[230px] truncate">{pasta || rotulo}</span>
      </Botao>
      {erro && <p className="mt-1.5 text-[10px] leading-4 text-[#a45c38]">{erro}</p>}
    </div>
  );
}

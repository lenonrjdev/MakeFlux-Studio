"use client";

import { ChevronDown, ChevronUp, Copy, FolderOpen, GripVertical, ImagePlus, Plus, Trash2 } from "lucide-react";

import { Botao } from "@/components/ui/botao";
import { BotaoSelecionarPasta } from "@/components/ui/botao-selecionar-pasta";
import { CampoFormulario, classesCampo } from "@/components/ui/campo-formulario";
import { Interruptor } from "@/components/ui/interruptor";
import { fontesMateriais } from "@/data/criar-video";
import type { AtualizarConfiguracaoVideo, ConfiguracaoCriacaoVideo } from "@/types/criar-video";

export function EtapaCenas({
  configuracao,
  atualizar,
  notificar,
}: {
  configuracao: ConfiguracaoCriacaoVideo;
  atualizar: AtualizarConfiguracaoVideo;
  notificar: (mensagem: string) => void;
}) {
  function atualizarCena(id: number, campo: "termo" | "duracao", valor: string | number) {
    atualizar(
      "cenas",
      configuracao.cenas.map((cena) => (cena.id === id ? { ...cena, [campo]: valor } : cena)),
    );
  }

  function moverCena(indice: number, direcao: -1 | 1) {
    const destino = indice + direcao;
    if (destino < 0 || destino >= configuracao.cenas.length) return;
    const cenas = [...configuracao.cenas];
    [cenas[indice], cenas[destino]] = [cenas[destino], cenas[indice]];
    atualizar("cenas", cenas);
  }

  function duplicarCena(indice: number) {
    const cena = configuracao.cenas[indice];
    const novaCena = { ...cena, id: Date.now(), titulo: `${cena.titulo} — cópia` };
    const cenas = [...configuracao.cenas];
    cenas.splice(indice + 1, 0, novaCena);
    atualizar("cenas", cenas);
  }

  function adicionarCena() {
    atualizar("cenas", [
      ...configuracao.cenas,
      {
        id: Date.now(),
        titulo: `Cena ${configuracao.cenas.length + 1}`,
        trecho: "Novo trecho visual para revisar.",
        termo: "",
        duracao: 5,
        origem: configuracao.fonteMateriais,
      },
    ]);
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-[1fr_1.2fr] gap-4 rounded-md border border-[#e3e7e7] bg-[#fafbfb] p-4">
        <CampoFormulario rotulo="Fonte principal dos materiais">
          <select
            value={configuracao.fonteMateriais}
            onChange={(evento) => atualizar("fonteMateriais", evento.target.value)}
            className={`${classesCampo} h-9`}
          >
            {fontesMateriais.map((fonte) => (
              <option key={fonte}>{fonte}</option>
            ))}
          </select>
        </CampoFormulario>

        <Interruptor
          ativo={configuracao.correspondenciaNarrativa}
          aoAlterar={(ativo) => atualizar("correspondenciaNarrativa", ativo)}
          rotulo="Correspondência narrativa"
          descricao="Tenta manter os materiais na mesma ordem dos trechos do roteiro."
        />
      </div>

      <div className="flex items-center justify-between gap-5 border-b border-[#e5e9e9] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[10.5px] font-semibold text-[#303637]">Storyboard do vídeo</h3>
            <span className="rounded-full bg-[#dff1ec] px-1.5 py-0.5 text-[8px] font-semibold text-[#1c7e6a]">
              {configuracao.cenas.length}
            </span>
          </div>
          <p className="mt-1 text-[8.5px] text-[#8b9293]">Edite termos, duração e ordem antes de buscar os arquivos reais.</p>
        </div>

        <div className="flex items-center gap-2">
          <BotaoSelecionarPasta
            rotulo="Usar pasta de materiais"
            tituloDialogo="Escolha uma pasta com vídeos e imagens"
            chaveArmazenamento="makeflux:pasta-materiais-projeto"
            className="h-8 px-2.5"
          />
          <Botao onClick={adicionarCena} className="h-8 px-2.5">
            <Plus className="size-3" />
            Adicionar cena
          </Botao>
        </div>
      </div>

      <div className="space-y-2.5">
        {configuracao.cenas.map((cena, indice) => (
          <article key={cena.id} className="grid grid-cols-[28px_116px_minmax(0,1fr)_120px] gap-3 rounded-md border border-[#e1e5e5] bg-white p-3">
            <div className="flex flex-col items-center gap-1 pt-1 text-[#a0a6a7]">
              <GripVertical className="size-3.5" />
              <span className="mt-1 text-[8px] font-semibold text-[#747c7d]">{String(indice + 1).padStart(2, "0")}</span>
            </div>

            <div className="relative h-[86px] overflow-hidden rounded-md border border-[#dfe4e4] bg-[#ecefef]">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,#e6ebe9,#cfd9d6)]" />
              <div className="absolute inset-x-3 bottom-3 space-y-1">
                <div className="h-1.5 rounded-full bg-white/85" />
                <div className="h-1.5 w-3/4 rounded-full bg-[#4db69f]" />
              </div>
              <span className="absolute left-2 top-2 rounded bg-black/50 px-1.5 py-0.5 text-[7px] font-medium text-white">
                {cena.duracao}s
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <strong className="block truncate text-[10px] font-medium text-[#303637]">{cena.titulo}</strong>
                  <p className="mt-1 line-clamp-2 text-[8.5px] leading-4 text-[#858d8e]">{cena.trecho}</p>
                </div>
                <span className="shrink-0 rounded border border-[#e2e6e6] bg-[#fafbfb] px-1.5 py-1 text-[7.5px] text-[#7e8687]">
                  {cena.origem}
                </span>
              </div>
              <input
                value={cena.termo}
                onChange={(evento) => atualizarCena(cena.id, "termo", evento.target.value)}
                className={`${classesCampo} mt-2 h-8 text-[9px]`}
                placeholder="Termo visual em inglês"
              />
            </div>

            <div className="flex flex-col justify-between border-l border-[#edf0f0] pl-3">
              <div>
                <span className="block text-[7.5px] uppercase tracking-[0.05em] text-[#9aa1a2]">Duração</span>
                <div className="mt-1 flex items-center gap-1.5">
                  <input
                    type="number"
                    min={2}
                    max={30}
                    value={cena.duracao}
                    onChange={(evento) => atualizarCena(cena.id, "duracao", Number(evento.target.value))}
                    className={`${classesCampo} h-8 w-16 px-2 text-center`}
                  />
                  <span className="text-[8px] text-[#8c9394]">seg.</span>
                </div>
              </div>

              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  aria-label="Mover cena para cima"
                  onClick={() => moverCena(indice, -1)}
                  disabled={indice === 0}
                  className="foco-acessivel grid size-7 place-items-center rounded text-[#788081] hover:bg-[#f0f3f3] disabled:opacity-30"
                >
                  <ChevronUp className="size-3" />
                </button>
                <button
                  type="button"
                  aria-label="Mover cena para baixo"
                  onClick={() => moverCena(indice, 1)}
                  disabled={indice === configuracao.cenas.length - 1}
                  className="foco-acessivel grid size-7 place-items-center rounded text-[#788081] hover:bg-[#f0f3f3] disabled:opacity-30"
                >
                  <ChevronDown className="size-3" />
                </button>
                <button
                  type="button"
                  aria-label="Duplicar cena"
                  onClick={() => duplicarCena(indice)}
                  className="foco-acessivel grid size-7 place-items-center rounded text-[#788081] hover:bg-[#f0f3f3]"
                >
                  <Copy className="size-3" />
                </button>
                <button
                  type="button"
                  aria-label="Excluir cena"
                  onClick={() => atualizar("cenas", configuracao.cenas.filter((item) => item.id !== cena.id))}
                  className="foco-acessivel grid size-7 place-items-center rounded text-[#9a7770] hover:bg-[#fbf2f0] hover:text-[#a65145]"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <button
        type="button"
        onClick={() => notificar("A busca real de materiais será conectada ao motor do MoneyPrinterTurbo.")}
        className="foco-acessivel flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-[#cfd7d6] bg-[#fafbfb] py-3 text-[9.5px] font-medium text-[#657071] hover:border-[#a9c9c1] hover:bg-[#f5faf8] hover:text-[#277b6a]"
      >
        <ImagePlus className="size-3.5" />
        Buscar materiais para todas as cenas
        <FolderOpen className="size-3.5" />
      </button>
    </div>
  );
}

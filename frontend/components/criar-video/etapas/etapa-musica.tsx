"use client";

import { Check, Music2, Pause, Play, Volume1, Waves } from "lucide-react";
import { useState } from "react";

import { Botao } from "@/components/ui/botao";
import { BotaoSelecionarPasta } from "@/components/ui/botao-selecionar-pasta";
import { CampoFormulario } from "@/components/ui/campo-formulario";
import { Interruptor } from "@/components/ui/interruptor";
import { musicasDisponiveis } from "@/data/criar-video";
import { juntarClasses } from "@/lib/classes";
import type { AtualizarConfiguracaoVideo, ConfiguracaoCriacaoVideo } from "@/types/criar-video";

export function EtapaMusica({
  configuracao,
  atualizar,
  notificar,
}: {
  configuracao: ConfiguracaoCriacaoVideo;
  atualizar: AtualizarConfiguracaoVideo;
  notificar: (mensagem: string) => void;
}) {
  const [tocando, setTocando] = useState<string | null>(null);
  const musicaSelecionada = musicasDisponiveis.find((musica) => musica.id === configuracao.musica);

  function alternarMusica(id: string) {
    setTocando((atual) => (atual === id ? null : id));
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-5">
      <div className="space-y-5">
        <Interruptor
          ativo={configuracao.musicaAtiva}
          aoAlterar={(ativo) => atualizar("musicaAtiva", ativo)}
          rotulo="Adicionar música de fundo"
          descricao="A trilha será mixada abaixo da narração para não competir com a voz."
        />

        <div>
          <div className="mb-3 flex items-center justify-between gap-5">
            <div>
              <h3 className="text-[10.5px] font-semibold text-[#303637]">Biblioteca de músicas</h3>
              <p className="mt-1 text-[8.5px] text-[#8b9293]">Selecione uma faixa ou utilize sua própria biblioteca local.</p>
            </div>
            <BotaoSelecionarPasta
              rotulo="Pasta de músicas"
              tituloDialogo="Escolha uma pasta de músicas"
              chaveArmazenamento="makeflux:pasta-musicas"
              className="h-8 px-2.5"
            />
          </div>

          <div className="space-y-2">
            {musicasDisponiveis.map((musica) => {
              const selecionada = configuracao.musica === musica.id;
              const reproduzindo = tocando === musica.id;
              return (
                <article
                  key={musica.id}
                  className={juntarClasses(
                    "grid grid-cols-[38px_minmax(0,1fr)_130px_70px] items-center gap-3 rounded-md border px-3 py-2.5 transition",
                    selecionada
                      ? "border-[#9dcfc3] bg-[#f0f9f6]"
                      : "border-[#e0e5e5] bg-white hover:border-[#cfd6d5]",
                    !configuracao.musicaAtiva && "opacity-50",
                  )}
                >
                  <button
                    type="button"
                    aria-label={reproduzindo ? `Pausar ${musica.titulo}` : `Reproduzir ${musica.titulo}`}
                    onClick={() => alternarMusica(musica.id)}
                    disabled={!configuracao.musicaAtiva || musica.id === "sem-musica"}
                    className="foco-acessivel grid size-8 place-items-center rounded-full border border-[#dce2e1] bg-white text-[#57706b] hover:text-[#208a75] disabled:cursor-default disabled:opacity-40"
                  >
                    {reproduzindo ? <Pause className="size-3.5" fill="currentColor" /> : <Play className="ml-0.5 size-3.5" fill="currentColor" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => atualizar("musica", musica.id)}
                    disabled={!configuracao.musicaAtiva}
                    className="foco-acessivel min-w-0 rounded text-left"
                  >
                    <strong className="block truncate text-[10px] font-medium text-[#303637]">{musica.titulo}</strong>
                    <span className="mt-1 block truncate text-[8px] text-[#899192]">{musica.estilo}</span>
                  </button>

                  <div className="flex h-7 items-end gap-[2px] overflow-hidden px-2">
                    {[8, 15, 10, 21, 13, 18, 9, 24, 16, 12, 20, 8, 17, 11, 22, 14, 9, 18].map((altura, indice) => (
                      <span
                        key={`${musica.id}-${indice}`}
                        className={juntarClasses(
                          "w-[2px] rounded-full",
                          selecionada ? "bg-[#62b9a7]" : "bg-[#cfd6d5]",
                          reproduzindo && indice < 10 && "bg-[#238d77]",
                        )}
                        style={{ height: `${altura}px` }}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <span className="text-[8px] tabular-nums text-[#8d9596]">{musica.duracao}</span>
                    <button
                      type="button"
                      aria-label={`Selecionar ${musica.titulo}`}
                      onClick={() => atualizar("musica", musica.id)}
                      disabled={!configuracao.musicaAtiva}
                      className={juntarClasses(
                        "foco-acessivel grid size-5 place-items-center rounded-full border",
                        selecionada ? "border-[#24977f] bg-[#24977f] text-white" : "border-[#d2d8d8] bg-white text-transparent",
                      )}
                    >
                      <Check className="size-3" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => notificar("O upload de arquivos individuais será conectado ao seletor desktop na Biblioteca.")}
          className="foco-acessivel flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-[#cfd7d6] bg-[#fafbfb] py-3 text-[9.5px] font-medium text-[#657071] hover:border-[#a9c9c1] hover:bg-[#f5faf8] hover:text-[#277b6a]"
        >
          <Music2 className="size-3.5" />
          Adicionar uma música ao projeto
        </button>
      </div>

      <aside className="rounded-md border border-[#e1e5e5] bg-[#fafbfb] p-4">
        <span className="text-[8px] font-medium uppercase tracking-[0.06em] text-[#92999a]">Mixagem</span>
        <div className="mt-4 rounded-md border border-[#e0e5e5] bg-white p-4">
          <span className="grid size-10 place-items-center rounded-md bg-[#eef5f3] text-[#258a75]">
            <Waves className="size-5" />
          </span>
          <strong className="mt-3 block text-[10.5px] font-medium text-[#303637]">
            {configuracao.musicaAtiva ? musicaSelecionada?.titulo : "Música desativada"}
          </strong>
          <span className="mt-1 block text-[8.5px] text-[#8b9293]">
            {configuracao.musicaAtiva ? musicaSelecionada?.estilo : "Apenas a narração será exportada."}
          </span>
        </div>

        <CampoFormulario rotulo="Volume da música" descricao="Recomendação para narração: entre 12% e 24%." className="mt-5">
          <div className="rounded-md border border-[#e1e5e5] bg-white px-3 py-3">
            <div className="mb-2 flex items-center justify-between text-[9px]">
              <Volume1 className="size-3.5 text-[#7a8283]" />
              <strong className="text-[#278773]">{configuracao.volumeMusica}%</strong>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={configuracao.volumeMusica}
              disabled={!configuracao.musicaAtiva}
              onChange={(evento) => atualizar("volumeMusica", Number(evento.target.value))}
              className="w-full accent-[#25967f] disabled:opacity-40"
            />
          </div>
        </CampoFormulario>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Botao disabled={!configuracao.musicaAtiva}>Aplicar fade</Botao>
          <Botao disabled={!configuracao.musicaAtiva}>Ajustar corte</Botao>
        </div>
      </aside>
    </div>
  );
}

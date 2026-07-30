"use client";

import { AlignCenter, Captions, Check, MoveDown, Type } from "lucide-react";

import { CampoFormulario, classesCampo } from "@/components/ui/campo-formulario";
import { Interruptor } from "@/components/ui/interruptor";
import { presetsLegenda } from "@/data/criar-video";
import { juntarClasses } from "@/lib/classes";
import type { AtualizarConfiguracaoVideo, ConfiguracaoCriacaoVideo } from "@/types/criar-video";

export function EtapaLegendas({
  configuracao,
  atualizar,
}: {
  configuracao: ConfiguracaoCriacaoVideo;
  atualizar: AtualizarConfiguracaoVideo;
}) {
  return (
    <div className="grid grid-cols-[330px_minmax(0,1fr)] gap-5">
      <div className="space-y-5 border-r border-[#edf0f0] pr-5">
        <Interruptor
          ativo={configuracao.legendasAtivas}
          aoAlterar={(ativo) => atualizar("legendasAtivas", ativo)}
          rotulo="Exibir legendas"
          descricao="Inclui o texto sincronizado na renderização final."
        />

        <CampoFormulario rotulo="Estilo da legenda" descricao="Presets podem ser refinados no modo avançado.">
          <div className="space-y-2">
            {presetsLegenda.map((preset) => {
              const ativo = configuracao.presetLegenda === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => atualizar("presetLegenda", preset.id)}
                  disabled={!configuracao.legendasAtivas}
                  className={juntarClasses(
                    "foco-acessivel flex w-full items-center gap-3 rounded-md border p-3 text-left transition disabled:opacity-50",
                    ativo
                      ? "border-[#9dcfc3] bg-[#f0f9f6]"
                      : "border-[#e0e5e5] bg-white hover:border-[#ccd4d3] hover:bg-[#fafbfb]",
                  )}
                >
                  <span className={juntarClasses("grid size-8 place-items-center rounded-md", ativo ? "bg-white text-[#208a75]" : "bg-[#f1f4f4] text-[#737b7c]")}>
                    <Captions className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block text-[10px] font-medium text-[#303637]">{preset.titulo}</strong>
                    <span className="mt-1 block text-[8px] text-[#8b9293]">{preset.descricao}</span>
                  </span>
                  {ativo && <Check className="size-3.5 text-[#228c76]" />}
                </button>
              );
            })}
          </div>
        </CampoFormulario>

        <div className="grid grid-cols-2 gap-3">
          <CampoFormulario rotulo="Posição">
            <select
              value={configuracao.posicaoLegenda}
              onChange={(evento) => atualizar("posicaoLegenda", evento.target.value)}
              disabled={!configuracao.legendasAtivas}
              className={`${classesCampo} h-9 disabled:opacity-50`}
            >
              <option>Superior</option>
              <option>Central</option>
              <option>Inferior</option>
            </select>
          </CampoFormulario>
          <CampoFormulario rotulo="Tamanho">
            <input
              type="number"
              min={20}
              max={80}
              value={configuracao.tamanhoLegenda}
              onChange={(evento) => atualizar("tamanhoLegenda", Number(evento.target.value))}
              disabled={!configuracao.legendasAtivas}
              className={`${classesCampo} h-9 disabled:opacity-50`}
            />
          </CampoFormulario>
        </div>
      </div>

      <div className="min-w-0">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <strong className="block text-[10.5px] font-semibold text-[#303637]">Prévia visual</strong>
            <span className="mt-1 block text-[8px] text-[#92999a]">Exemplo aproximado do resultado no formato selecionado.</span>
          </div>
          <span className="rounded border border-[#e0e5e5] bg-[#fafbfb] px-2 py-1 text-[8px] text-[#7d8586]">
            {configuracao.formato}
          </span>
        </div>

        <div className="grid min-h-[438px] place-items-center rounded-md border border-[#dfe4e4] bg-[#eef1f1] p-6">
          <div className="relative h-[360px] w-[203px] overflow-hidden rounded-lg bg-[#171b1c] shadow-[0_20px_45px_rgba(19,27,26,.2)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(65,151,134,.36),transparent_36%),linear-gradient(150deg,#273332,#111515_62%)]" />
            <div className="absolute left-5 top-5 flex items-center gap-2 text-white/70">
              <span className="grid size-6 place-items-center rounded-full border border-white/15 bg-white/10">
                <Type className="size-3" />
              </span>
              <span className="text-[7px] uppercase tracking-[0.12em]">MakeFlux Studio</span>
            </div>

            <div
              className={juntarClasses(
                "absolute inset-x-5 text-center transition",
                configuracao.posicaoLegenda === "Superior" && "top-20",
                configuracao.posicaoLegenda === "Central" && "top-1/2 -translate-y-1/2",
                configuracao.posicaoLegenda === "Inferior" && "bottom-14",
              )}
            >
              {configuracao.legendasAtivas ? (
                <span
                  className={juntarClasses(
                    "inline box-decoration-clone font-semibold uppercase leading-[1.45] text-white",
                    configuracao.presetLegenda === "shorts" && "rounded bg-black/45 px-1.5 py-1 tracking-tight [text-shadow:0_2px_0_#000]",
                    configuracao.presetLegenda === "documentario" && "rounded bg-black/60 px-2 py-1 font-medium normal-case",
                    configuracao.presetLegenda === "minimalista" && "font-medium normal-case text-white/95",
                    configuracao.presetLegenda === "limpa" && "normal-case [text-shadow:0_1px_5px_#000]",
                  )}
                  style={{ fontSize: `${Math.max(10, configuracao.tamanhoLegenda / 3.2)}px` }}
                >
                  Pequenas distrações podem consumir horas do seu dia.
                </span>
              ) : (
                <span className="text-[9px] text-white/45">Legendas desativadas</span>
              )}
            </div>

            <div className="absolute inset-x-5 bottom-5 h-1 overflow-hidden rounded-full bg-white/15">
              <div className="h-full w-[62%] rounded-full bg-[#54cbb3]" />
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2.5">
          <div className="flex items-center gap-2 rounded-md border border-[#e3e7e7] bg-[#fafbfb] p-2.5">
            <AlignCenter className="size-3.5 text-[#7c8485]" />
            <span className="text-[8.5px] text-[#697172]">Alinhamento central</span>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-[#e3e7e7] bg-[#fafbfb] p-2.5">
            <MoveDown className="size-3.5 text-[#7c8485]" />
            <span className="text-[8.5px] text-[#697172]">Posição {configuracao.posicaoLegenda.toLowerCase()}</span>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-[#e3e7e7] bg-[#fafbfb] p-2.5">
            <Type className="size-3.5 text-[#7c8485]" />
            <span className="text-[8.5px] text-[#697172]">Tamanho {configuracao.tamanhoLegenda}px</span>
          </div>
        </div>
      </div>
    </div>
  );
}

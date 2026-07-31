"use client";

import { Check, Headphones, Mic2, Pause, Play, Volume2 } from "lucide-react";
import { useState } from "react";

import { Botao } from "@/components/ui/botao";
import { CampoFormulario, classesCampo } from "@/components/ui/campo-formulario";
import { SeletorSegmentado } from "@/components/ui/seletor-segmentado";
import { vozesDisponiveis } from "@/data/criar-video";
import { juntarClasses } from "@/lib/classes";
import type { AtualizarConfiguracaoVideo, ConfiguracaoCriacaoVideo } from "@/types/criar-video";

const provedoresVoz = [
  { id: "Edge TTS", titulo: "Edge TTS", detalhe: "Online · sem chave" },
  { id: "TTS local", titulo: "TTS local", detalhe: "Offline" },
  { id: "Áudio próprio", titulo: "Áudio próprio", detalhe: "Arquivo local" },
] as const;

export function EtapaNarracao({
  configuracao,
  atualizar,
  notificar,
}: {
  configuracao: ConfiguracaoCriacaoVideo;
  atualizar: AtualizarConfiguracaoVideo;
  notificar: (mensagem: string) => void;
}) {
  const [reproduzindo, setReproduzindo] = useState(false);
  const vozesFiltradas = vozesDisponiveis.filter(
    (voz) => configuracao.provedorVoz === "Áudio próprio" || voz.provedor === configuracao.provedorVoz,
  );

  function testarVoz() {
    setReproduzindo((estado) => !estado);
    notificar(
      reproduzindo
        ? "Prévia interrompida."
        : "Prévia visual iniciada. O áudio real será gerado quando o provedor estiver conectado.",
    );
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_290px] gap-5">
      <div className="space-y-6">
        <CampoFormulario rotulo="Provedor da narração" descricao="Escolha entre voz online, processamento local ou áudio próprio.">
          <SeletorSegmentado
            valor={configuracao.provedorVoz}
            opcoes={provedoresVoz}
            aoAlterar={(valor) => atualizar("provedorVoz", valor)}
            className="grid-cols-3"
          />
        </CampoFormulario>

        {configuracao.provedorVoz === "Áudio próprio" ? (
          <div className="rounded-md border border-dashed border-[#cdd6d5] bg-[#fafbfb] px-5 py-8 text-center">
            <span className="mx-auto grid size-10 place-items-center rounded-md bg-[#eef4f2] text-[#2b8875]">
              <Mic2 className="size-5" />
            </span>
            <strong className="mt-3 block text-[10.5px] font-medium text-[#343a3b]">
              {configuracao.narracaoLocal?.nome ?? "Selecione uma narração pronta"}
            </strong>
            <p className="mx-auto mt-1 max-w-[420px] text-[8.5px] leading-4 text-[#8a9293]">
              {configuracao.narracaoLocal
                ? configuracao.narracaoLocal.caminho
                : "Na integração desktop, este botão abrirá o seletor nativo para arquivos WAV, MP3 e M4A."}
            </p>
            <Botao className="mt-4">
              {configuracao.narracaoLocal ? "Trocar arquivo de áudio" : "Escolher arquivo de áudio"}
            </Botao>
          </div>
        ) : (
          <CampoFormulario rotulo="Voz disponível" descricao="Ouça uma prévia antes de confirmar a narração.">
            <div className="grid grid-cols-2 gap-2.5">
              {vozesFiltradas.map((voz) => {
                const ativa = configuracao.voz === voz.id;
                return (
                  <button
                    key={voz.id}
                    type="button"
                    onClick={() => atualizar("voz", voz.id)}
                    className={juntarClasses(
                      "foco-acessivel flex items-center gap-3 rounded-md border p-3 text-left transition",
                      ativa
                        ? "border-[#9dcfc3] bg-[#f0f9f6]"
                        : "border-[#e0e5e5] bg-white hover:border-[#ccd4d3] hover:bg-[#fafbfb]",
                    )}
                  >
                    <span
                      className={juntarClasses(
                        "grid size-9 shrink-0 place-items-center rounded-full",
                        ativa ? "bg-white text-[#208a75] shadow-sm" : "bg-[#f1f4f4] text-[#727a7b]",
                      )}
                    >
                      <Headphones className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-[10px] font-medium text-[#303637]">{voz.nome}</strong>
                      <span className="mt-1 block truncate text-[8px] text-[#8b9293]">{voz.detalhe}</span>
                    </span>
                    {ativa && (
                      <span className="grid size-4 place-items-center rounded-full bg-[#24977f] text-white">
                        <Check className="size-2.5" strokeWidth={2.5} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </CampoFormulario>
        )}

        <div className="grid grid-cols-2 gap-5">
          <CampoFormulario rotulo="Velocidade da voz" descricao="Ajuste sem alterar o tom natural.">
            <div className="rounded-md border border-[#e1e5e5] bg-[#fafbfb] px-3 py-3">
              <div className="mb-2 flex items-center justify-between text-[9px]">
                <span className="text-[#7a8283]">0.75×</span>
                <strong className="text-[#278773]">{configuracao.velocidadeVoz.toFixed(2)}×</strong>
                <span className="text-[#7a8283]">1.50×</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.5"
                step="0.05"
                value={configuracao.velocidadeVoz}
                onChange={(evento) => atualizar("velocidadeVoz", Number(evento.target.value))}
                className="w-full accent-[#25967f]"
              />
            </div>
          </CampoFormulario>

          <CampoFormulario rotulo="Volume da narração" descricao="Volume aplicado antes da mixagem final.">
            <div className="rounded-md border border-[#e1e5e5] bg-[#fafbfb] px-3 py-3">
              <div className="mb-2 flex items-center justify-between text-[9px]">
                <Volume2 className="size-3.5 text-[#7a8283]" />
                <strong className="text-[#278773]">{configuracao.volumeVoz}%</strong>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={configuracao.volumeVoz}
                onChange={(evento) => atualizar("volumeVoz", Number(evento.target.value))}
                className="w-full accent-[#25967f]"
              />
            </div>
          </CampoFormulario>
        </div>
      </div>

      <aside className="rounded-md border border-[#e1e5e5] bg-[#fafbfb] p-4">
        <span className="text-[8px] font-medium uppercase tracking-[0.06em] text-[#92999a]">Prévia da narração</span>
        <div className="mt-4 flex h-[188px] items-center justify-center rounded-md border border-[#e0e5e5] bg-white">
          <div className="text-center">
            <button
              type="button"
              onClick={testarVoz}
              className="foco-acessivel mx-auto grid size-12 place-items-center rounded-full bg-[#1f9b83] text-white shadow-[0_8px_22px_rgba(31,155,131,.22)] hover:bg-[#18866f]"
            >
              {reproduzindo ? <Pause className="size-5" fill="currentColor" /> : <Play className="ml-0.5 size-5" fill="currentColor" />}
            </button>
            <strong className="mt-3 block text-[10px] font-medium text-[#343a3b]">
              {reproduzindo ? "Reproduzindo prévia" : "Ouvir trecho de teste"}
            </strong>
            <span className="mt-1 block text-[8px] text-[#92999a]">12 segundos · português brasileiro</span>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <CampoFormulario rotulo="Pronúncia personalizada" descricao="Palavras que precisam de orientação específica." opcional>
            <input className={`${classesCampo} h-9`} placeholder="Ex.: MakeFlux = Meik Flâks" />
          </CampoFormulario>
          <Botao onClick={() => notificar("A narração será gerada pelo provedor escolhido na integração.")} variante="primario" className="w-full">
            <Mic2 className="size-3.5" />
            Preparar narração
          </Botao>
        </div>
      </aside>
    </div>
  );
}

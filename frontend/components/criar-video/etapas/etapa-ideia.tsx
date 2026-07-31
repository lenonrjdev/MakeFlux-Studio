"use client";

import { Check, Film, Gauge, SlidersHorizontal } from "lucide-react";

import { CampoFormulario, classesCampo } from "@/components/ui/campo-formulario";
import { SeletorSegmentado } from "@/components/ui/seletor-segmentado";
import {
  duracoesVideo,
  formatosVideo,
  idiomasVideo,
  modosCriacao,
  objetivosVideo,
  plataformasVideo,
} from "@/data/criar-video";
import { juntarClasses } from "@/lib/classes";
import type { AtualizarConfiguracaoVideo, ConfiguracaoCriacaoVideo } from "@/types/criar-video";

const iconesModo = {
  rapido: Gauge,
  assistido: Film,
  avancado: SlidersHorizontal,
};

export function EtapaIdeia({
  configuracao,
  atualizar,
}: {
  configuracao: ConfiguracaoCriacaoVideo;
  atualizar: AtualizarConfiguracaoVideo;
}) {
  return (
    <div className="space-y-7">
      <div className="grid grid-cols-2 gap-5">
        <CampoFormulario
          rotulo="Nome do projeto"
          descricao="Identificação usada na lista de projetos e nos arquivos exportados."
        >
          <input
            value={configuracao.nomeProjeto}
            onChange={(evento) => atualizar("nomeProjeto", evento.target.value)}
            className={`${classesCampo} h-9`}
            placeholder="Ex.: Hábitos de produtividade"
          />
        </CampoFormulario>

        <CampoFormulario rotulo="Público principal" descricao="Para quem a linguagem e o ritmo devem ser pensados.">
          <input
            value={configuracao.publico}
            onChange={(evento) => atualizar("publico", evento.target.value)}
            className={`${classesCampo} h-9`}
            placeholder="Ex.: Empreendedores e criadores"
          />
        </CampoFormulario>
      </div>

      <CampoFormulario
        rotulo="Qual é a ideia do vídeo?"
        descricao="Descreva o assunto com contexto suficiente para orientar o roteiro e a busca de materiais."
      >
        <textarea
          value={configuracao.tema}
          onChange={(evento) => atualizar("tema", evento.target.value)}
          className={`${classesCampo} min-h-[108px] resize-none py-3 leading-5`}
          placeholder="Ex.: Explique cinco hábitos simples que reduzem a produtividade no trabalho e mostre como corrigi-los."
        />
        <div className="flex items-center justify-between text-[8.5px] text-[#9aa1a2]">
          <span>Uma ideia clara melhora o roteiro, os termos visuais e a narração.</span>
          <span>{configuracao.tema.length}/600</span>
        </div>
      </CampoFormulario>

      <CampoFormulario rotulo="Objetivo do conteúdo" descricao="Escolha a intenção principal da narrativa.">
        <div className="grid grid-cols-4 gap-2.5">
          {objetivosVideo.map((objetivo) => {
            const ativo = configuracao.objetivo === objetivo.id;
            return (
              <button
                key={objetivo.id}
                type="button"
                onClick={() => atualizar("objetivo", objetivo.id)}
                className={juntarClasses(
                  "foco-acessivel relative min-h-[92px] rounded-md border p-3 text-left transition",
                  ativo
                    ? "border-[#9dcfc3] bg-[#f0f9f6] shadow-[0_1px_2px_rgba(25,111,93,.06)]"
                    : "border-[#e0e5e5] bg-white hover:border-[#ccd4d3] hover:bg-[#fafbfb]",
                )}
              >
                {ativo && (
                  <span className="absolute right-2.5 top-2.5 grid size-4 place-items-center rounded-full bg-[#24977f] text-white">
                    <Check className="size-2.5" strokeWidth={2.5} />
                  </span>
                )}
                <strong className="block text-[10px] font-medium text-[#303637]">{objetivo.titulo}</strong>
                <span className="mt-2 block pr-2 text-[8.5px] leading-4 text-[#858d8e]">{objetivo.descricao}</span>
              </button>
            );
          })}
        </div>
      </CampoFormulario>

      <div className="grid grid-cols-[1.2fr_.8fr] gap-5">
        <CampoFormulario rotulo="Plataforma de destino">
          <SeletorSegmentado
            valor={configuracao.plataforma}
            opcoes={plataformasVideo}
            aoAlterar={(valor) => atualizar("plataforma", valor)}
            className="grid-cols-4"
          />
        </CampoFormulario>

        <CampoFormulario rotulo="Formato do vídeo">
          <SeletorSegmentado
            valor={configuracao.formato}
            opcoes={formatosVideo}
            aoAlterar={(valor) => atualizar("formato", valor)}
            className="grid-cols-3"
          />
        </CampoFormulario>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <CampoFormulario rotulo="Idioma principal">
          <select
            value={configuracao.idioma}
            onChange={(evento) => atualizar("idioma", evento.target.value)}
            className={`${classesCampo} h-9`}
          >
            {idiomasVideo.map((idioma) => (
              <option key={idioma}>{idioma}</option>
            ))}
          </select>
        </CampoFormulario>

        <CampoFormulario rotulo="Duração desejada">
          <select
            value={configuracao.duracao}
            onChange={(evento) => atualizar("duracao", evento.target.value)}
            className={`${classesCampo} h-9`}
          >
            {duracoesVideo.map((duracao) => (
              <option key={duracao}>{duracao}</option>
            ))}
          </select>
        </CampoFormulario>
      </div>

      <CampoFormulario
        rotulo="Modo de criação"
        descricao="Você pode mudar o nível de controle a qualquer momento sem perder o projeto."
      >
        <div className="grid grid-cols-3 gap-2.5">
          {modosCriacao.map((modo) => {
            const ativo = configuracao.modo === modo.id;
            const Icone = iconesModo[modo.id];
            return (
              <button
                key={modo.id}
                type="button"
                onClick={() => atualizar("modo", modo.id)}
                className={juntarClasses(
                  "foco-acessivel flex items-start gap-3 rounded-md border p-3.5 text-left transition",
                  ativo
                    ? "border-[#9dcfc3] bg-[#f0f9f6]"
                    : "border-[#e0e5e5] bg-white hover:border-[#ccd4d3] hover:bg-[#fafbfb]",
                )}
              >
                <span
                  className={juntarClasses(
                    "grid size-8 shrink-0 place-items-center rounded-md",
                    ativo ? "bg-white text-[#208a75] shadow-sm" : "bg-[#f1f4f4] text-[#747c7d]",
                  )}
                >
                  <Icone className="size-4" strokeWidth={1.7} />
                </span>
                <span>
                  <strong className="block text-[10.5px] font-medium text-[#303637]">{modo.titulo}</strong>
                  <span className="mt-1 block text-[8.5px] leading-4 text-[#858d8e]">{modo.descricao}</span>
                </span>
              </button>
            );
          })}
        </div>
      </CampoFormulario>
    </div>
  );
}

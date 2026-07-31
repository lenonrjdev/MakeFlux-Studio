"use client";

import { Sparkles } from "lucide-react";

import { CartaoConfiguracao } from "@/components/configuracoes/cartao-configuracao";
import { CampoFormulario, classesCampo } from "@/components/ui/campo-formulario";
import type { PadroesCriacao } from "@/types/configuracoes";

export function SecaoPadroesCriacao({ padroes, aoAtualizar }: { padroes: PadroesCriacao; aoAtualizar: (dados: Partial<PadroesCriacao>) => void }) {
  return (
    <div className="space-y-4">
      <CartaoConfiguracao titulo="Padrões do estúdio" descricao="Valores aplicados automaticamente ao iniciar um novo projeto.">
        <div className="grid grid-cols-3 gap-4">
          <CampoFormulario rotulo="Idioma"><select value={padroes.idioma} onChange={(e) => aoAtualizar({ idioma: e.target.value as PadroesCriacao["idioma"] })} className={`${classesCampo} h-10`}><option value="pt-BR">Português do Brasil</option><option value="en-US">English</option><option value="es-ES">Español</option></select></CampoFormulario>
          <CampoFormulario rotulo="Plataforma"><select value={padroes.plataforma} onChange={(e) => aoAtualizar({ plataforma: e.target.value as PadroesCriacao["plataforma"] })} className={`${classesCampo} h-10`}><option value="youtube-shorts">YouTube Shorts</option><option value="instagram-reels">Instagram Reels</option><option value="tiktok">TikTok</option><option value="youtube">YouTube</option></select></CampoFormulario>
          <CampoFormulario rotulo="Formato"><select value={padroes.formato} onChange={(e) => aoAtualizar({ formato: e.target.value as PadroesCriacao["formato"] })} className={`${classesCampo} h-10`}><option value="9:16">Vertical 9:16</option><option value="16:9">Horizontal 16:9</option><option value="1:1">Quadrado 1:1</option></select></CampoFormulario>
          <CampoFormulario rotulo="Duração padrão"><div className="relative"><input type="number" min={10} max={600} value={padroes.duracaoSegundos} onChange={(e) => aoAtualizar({ duracaoSegundos: Number(e.target.value) })} className={`${classesCampo} h-10 pr-12`} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-[#92999a]">seg</span></div></CampoFormulario>
          <CampoFormulario rotulo="Modo de criação"><select value={padroes.modoCriacao} onChange={(e) => aoAtualizar({ modoCriacao: e.target.value as PadroesCriacao["modoCriacao"] })} className={`${classesCampo} h-10`}><option value="rapido">Rápido</option><option value="assistido">Assistido</option><option value="avancado">Avançado</option></select></CampoFormulario>
          <CampoFormulario rotulo="Modelo de IA"><input value={padroes.modeloIa} onChange={(e) => aoAtualizar({ modeloIa: e.target.value })} className={`${classesCampo} h-10`} /></CampoFormulario>
          <CampoFormulario rotulo="Voz"><input value={padroes.voz} onChange={(e) => aoAtualizar({ voz: e.target.value })} className={`${classesCampo} h-10`} /></CampoFormulario>
          <CampoFormulario rotulo="Preset de legenda"><input value={padroes.presetLegenda} onChange={(e) => aoAtualizar({ presetLegenda: e.target.value })} className={`${classesCampo} h-10`} /></CampoFormulario>
          <CampoFormulario rotulo="Qualidade"><select value={padroes.qualidade} onChange={(e) => aoAtualizar({ qualidade: e.target.value as PadroesCriacao["qualidade"] })} className={`${classesCampo} h-10`}><option value="720p">720p</option><option value="1080p">1080p</option><option value="1440p">1440p</option><option value="2160p">4K</option></select></CampoFormulario>
        </div>
      </CartaoConfiguracao>
      <div className="rounded-md border border-[#dce8e5] bg-[#f2f8f6] p-4 text-[9.5px] leading-5 text-[#55736c]"><Sparkles className="mr-2 inline size-3.5" /> Templates aplicados ao criar um vídeo continuam tendo prioridade sobre estes padrões.</div>
    </div>
  );
}

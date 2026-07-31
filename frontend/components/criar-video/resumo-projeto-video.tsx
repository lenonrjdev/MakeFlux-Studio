import { Clock3, FileText, FolderOutput, LayoutTemplate, MonitorPlay, Sparkles } from "lucide-react";

import { BotaoSelecionarPasta } from "@/components/ui/botao-selecionar-pasta";
import { conteudoCriarVideo } from "@/content/criar-video";
import { plataformasVideo } from "@/data/criar-video";
import type { ConfiguracaoCriacaoVideo } from "@/types/criar-video";

function MiniaturaFormato({ formato }: { formato: ConfiguracaoCriacaoVideo["formato"] }) {
  const dimensoes = {
    "9:16": "h-[118px] w-[66px]",
    "16:9": "h-[66px] w-[118px]",
    "1:1": "size-[94px]",
  } as const;

  return (
    <div className="flex h-[136px] items-center justify-center rounded-md border border-[#e4e8e8] bg-[#f2f4f4]">
      <div
        className={`${dimensoes[formato]} relative overflow-hidden rounded-[4px] border border-[#d3d9d9] bg-[#1d2223] shadow-[0_8px_22px_rgba(18,25,24,.13)]`}
      >
        <div className="absolute inset-x-2 top-2 h-1.5 rounded-full bg-white/20" />
        <div className="absolute inset-x-2 bottom-4 space-y-1">
          <div className="h-1 rounded-full bg-white/85" />
          <div className="h-1 w-4/5 rounded-full bg-[#5dd0b9]" />
        </div>
        <div className="absolute left-2 top-1/2 size-4 -translate-y-1/2 rounded-full border border-white/30 bg-white/10" />
      </div>
    </div>
  );
}

export function ResumoProjetoVideo({ configuracao }: { configuracao: ConfiguracaoCriacaoVideo }) {
  const plataforma = plataformasVideo.find((item) => item.id === configuracao.plataforma)?.titulo;
  const palavras = configuracao.roteiro.trim() ? configuracao.roteiro.trim().split(/\s+/).length : 0;

  const detalhes = [
    { rotulo: "Plataforma", valor: plataforma ?? "YouTube Shorts", icone: MonitorPlay },
    { rotulo: "Formato", valor: `${configuracao.formato} · ${configuracao.qualidade.split(" · ")[0]}`, icone: LayoutTemplate },
    { rotulo: "Duração", valor: configuracao.duracao, icone: Clock3 },
    { rotulo: "Roteiro", valor: palavras ? `${palavras} palavras` : "Ainda não gerado", icone: FileText },
    { rotulo: "Criação", valor: configuracao.modo, icone: Sparkles },
  ];

  return (
    <aside className="space-y-4 self-start lg:sticky lg:top-[78px]">
      <section className="painel-superficie rounded-md p-4">
        <div>
          <h2 className="text-[11px] font-semibold text-[#252a2b]">{conteudoCriarVideo.resumoTitulo}</h2>
          <p className="mt-1 text-[9px] leading-4 text-[#8b9293]">{conteudoCriarVideo.resumoDescricao}</p>
        </div>

        <div className="mt-4">
          <MiniaturaFormato formato={configuracao.formato} />
        </div>

        <div className="mt-4 divide-y divide-[#edf0f0] border-y border-[#edf0f0]">
          {detalhes.map(({ rotulo, valor, icone: Icone }) => (
            <div key={rotulo} className="flex items-center gap-2.5 py-2.5">
              <span className="grid size-7 shrink-0 place-items-center rounded-md bg-[#f1f4f4] text-[#71797a]">
                <Icone className="size-3.5" strokeWidth={1.7} />
              </span>
              <div className="min-w-0 flex-1">
                <span className="block text-[7.5px] font-medium uppercase tracking-[0.06em] text-[#9aa1a2]">{rotulo}</span>
                <strong className="mt-0.5 block truncate capitalize text-[9.5px] font-medium text-[#343a3b]">{valor}</strong>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-md border border-[#dcebe7] bg-[#f2f9f7] p-3">
          <div className="flex items-start gap-2.5">
            <FolderOutput className="mt-0.5 size-3.5 shrink-0 text-[#258a75]" />
            <div>
              <strong className="block text-[9.5px] font-medium text-[#27695c]">{conteudoCriarVideo.pastaSaidaTitulo}</strong>
              <p className="mt-1 text-[8.5px] leading-4 text-[#6b8580]">{conteudoCriarVideo.pastaSaidaDescricao}</p>
            </div>
          </div>
          <BotaoSelecionarPasta
            rotulo="Escolher pasta de saída"
            tituloDialogo="Escolha a pasta de exportação do MakeFlux Studio"
            chaveArmazenamento="makeflux:pasta-exportacao"
            className="mt-3 h-8 w-full justify-start px-2.5"
          />
        </div>
      </section>

      <div className="rounded-md border border-[#e7e1d9] bg-[#fbf8f4] p-3 text-[8.5px] leading-4 text-[#826d58]">
        {conteudoCriarVideo.avisoFrontend}
      </div>
    </aside>
  );
}

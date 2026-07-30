"use client";

import { CheckCircle2, Cpu, FileVideo2, Layers3, MonitorUp, ShieldCheck } from "lucide-react";

import { BotaoSelecionarPasta } from "@/components/ui/botao-selecionar-pasta";
import { CampoFormulario, classesCampo } from "@/components/ui/campo-formulario";
import { SeletorSegmentado } from "@/components/ui/seletor-segmentado";
import { formatosVideo, plataformasVideo } from "@/data/criar-video";
import type { AtualizarConfiguracaoVideo, ConfiguracaoCriacaoVideo } from "@/types/criar-video";

const qualidades = ["720p · Prévia rápida", "1080p · Alta qualidade", "1440p · Qualidade superior"];
const codificadores = [
  "Automático · melhor disponível",
  "NVIDIA NVENC",
  "Intel Quick Sync",
  "AMD AMF",
  "CPU · libx264",
];
const quantidades = [
  { id: "1", titulo: "1 versão", detalhe: "Uma saída" },
  { id: "2", titulo: "2 versões", detalhe: "Comparação rápida" },
  { id: "3", titulo: "3 versões", detalhe: "Mais variações" },
] as const;

export function EtapaExportacao({
  configuracao,
  atualizar,
}: {
  configuracao: ConfiguracaoCriacaoVideo;
  atualizar: AtualizarConfiguracaoVideo;
}) {
  const plataforma = plataformasVideo.find((item) => item.id === configuracao.plataforma)?.titulo;
  const duracaoCenas = configuracao.cenas.reduce((total, cena) => total + cena.duracao, 0);
  const itensRevisao = [
    { rotulo: "Destino", valor: plataforma ?? "YouTube Shorts", icone: MonitorUp },
    { rotulo: "Saída", valor: `${configuracao.formato} · ${configuracao.qualidade.split(" · ")[0]}`, icone: FileVideo2 },
    { rotulo: "Storyboard", valor: `${configuracao.cenas.length} cenas · ${duracaoCenas}s`, icone: Layers3 },
    { rotulo: "Renderização", valor: configuracao.codificador, icone: Cpu },
  ];

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-5">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-5">
          <CampoFormulario rotulo="Formato final">
            <SeletorSegmentado
              valor={configuracao.formato}
              opcoes={formatosVideo}
              aoAlterar={(valor) => atualizar("formato", valor)}
              className="grid-cols-3"
            />
          </CampoFormulario>

          <CampoFormulario rotulo="Qualidade de exportação">
            <select
              value={configuracao.qualidade}
              onChange={(evento) => atualizar("qualidade", evento.target.value)}
              className={`${classesCampo} h-9`}
            >
              {qualidades.map((qualidade) => (
                <option key={qualidade}>{qualidade}</option>
              ))}
            </select>
          </CampoFormulario>
        </div>

        <CampoFormulario
          rotulo="Quantidade de versões"
          descricao="O motor poderá variar materiais e ordem mantendo a mesma configuração principal."
        >
          <SeletorSegmentado
            valor={String(configuracao.quantidadeVersoes) as "1" | "2" | "3"}
            opcoes={quantidades}
            aoAlterar={(valor) => atualizar("quantidadeVersoes", Number(valor))}
            className="grid-cols-3"
          />
        </CampoFormulario>

        <CampoFormulario
          rotulo="Codificador de vídeo"
          descricao="O modo automático utiliza aceleração por hardware quando ela estiver disponível."
        >
          <select
            value={configuracao.codificador}
            onChange={(evento) => atualizar("codificador", evento.target.value)}
            className={`${classesCampo} h-9`}
          >
            {codificadores.map((codificador) => (
              <option key={codificador}>{codificador}</option>
            ))}
          </select>
        </CampoFormulario>

        <div className="rounded-md border border-[#e1e5e5] bg-[#fafbfb] p-4">
          <div className="flex items-center justify-between gap-5">
            <div>
              <strong className="block text-[10.5px] font-medium text-[#303637]">Pasta de exportação</strong>
              <p className="mt-1 text-[8.5px] leading-4 text-[#8a9293]">
                Escolha onde os vídeos, áudios e legendas resultantes serão gravados.
              </p>
            </div>
            <BotaoSelecionarPasta
              rotulo="Escolher destino"
              tituloDialogo="Escolha a pasta de exportação"
              chaveArmazenamento="makeflux:pasta-exportacao"
              className="h-8 px-2.5"
            />
          </div>
        </div>

        <div className="rounded-md border border-[#cfe5df] bg-[#f1f9f7] p-4">
          <div className="flex items-start gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-md bg-white text-[#248a75] shadow-sm">
              <ShieldCheck className="size-4" />
            </span>
            <div>
              <strong className="block text-[10.5px] font-medium text-[#27695c]">Projeto pronto para entrar na produção</strong>
              <p className="mt-1 text-[8.5px] leading-4 text-[#66827c]">
                A interface já reúne todas as decisões necessárias. A chamada real será habilitada quando o adaptador do MoneyPrinterTurbo estiver conectado.
              </p>
            </div>
          </div>
        </div>
      </div>

      <aside className="rounded-md border border-[#dfe4e4] bg-white p-4 shadow-[0_1px_2px_rgba(20,29,27,.04)]">
        <div className="flex items-center gap-2.5 border-b border-[#edf0f0] pb-3">
          <span className="grid size-8 place-items-center rounded-md bg-[#eaf7f3] text-[#218773]">
            <CheckCircle2 className="size-4" />
          </span>
          <div>
            <strong className="block text-[10.5px] font-semibold text-[#303637]">Revisão final</strong>
            <span className="mt-0.5 block text-[8px] text-[#92999a]">Configuração consolidada</span>
          </div>
        </div>

        <div className="divide-y divide-[#edf0f0]">
          {itensRevisao.map(({ rotulo, valor, icone: Icone }) => (
            <div key={rotulo} className="flex items-start gap-2.5 py-3">
              <Icone className="mt-0.5 size-3.5 shrink-0 text-[#81898a]" />
              <div className="min-w-0">
                <span className="block text-[7.5px] font-medium uppercase tracking-[0.05em] text-[#9aa1a2]">{rotulo}</span>
                <strong className="mt-1 block text-[9px] font-medium leading-4 text-[#3c4243]">{valor}</strong>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-md bg-[#f3f5f5] p-3">
          <div className="flex items-center justify-between text-[8.5px]">
            <span className="text-[#7d8586]">Versões</span>
            <strong className="text-[#323839]">{configuracao.quantidadeVersoes}</strong>
          </div>
          <div className="mt-2 flex items-center justify-between text-[8.5px]">
            <span className="text-[#7d8586]">Narração</span>
            <strong className="text-[#323839]">{configuracao.provedorVoz}</strong>
          </div>
          <div className="mt-2 flex items-center justify-between text-[8.5px]">
            <span className="text-[#7d8586]">Legendas</span>
            <strong className="text-[#323839]">{configuracao.legendasAtivas ? "Ativas" : "Desativadas"}</strong>
          </div>
          <div className="mt-2 flex items-center justify-between text-[8.5px]">
            <span className="text-[#7d8586]">Música</span>
            <strong className="text-[#323839]">{configuracao.musicaAtiva ? "Ativa" : "Desativada"}</strong>
          </div>
        </div>
      </aside>
    </div>
  );
}

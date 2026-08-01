"use client";

import { Ban, ExternalLink, RefreshCcw, Send } from "lucide-react";

import { Botao } from "@/components/ui/botao";
import { provedoresCanais, rotulosStatusEnvio } from "@/data/canais-publicacao";
import type { EnvioPublicacaoSocial } from "@/types/canais-publicacao";

function formatarBytes(valor: number) {
  if (!valor) return "0 B";
  if (valor < 1024 * 1024) return `${Math.round(valor / 1024)} KB`;
  return `${(valor / 1024 / 1024).toFixed(1)} MB`;
}

export function PainelFilaPublicacao({
  envios,
  aoCancelar,
  aoRepetir,
}: {
  envios: EnvioPublicacaoSocial[];
  aoCancelar: (id: string) => Promise<unknown>;
  aoRepetir: (id: string) => Promise<unknown>;
}) {
  return (
    <section className="rounded-md border border-[#e0e6e5] bg-white p-4">
      <div className="flex items-center gap-2 text-[10px] font-semibold text-[#303737]">
        <Send className="size-3.5 text-[#288a75]" /> Fila de publicação robusta
      </div>
      <div className="mt-3 space-y-2">
        {envios.length === 0 && <div className="rounded-md border border-dashed border-[#dfe5e4] px-3 py-8 text-center text-[8px] text-[#929a99]">Nenhum envio foi registrado na nova fila.</div>}
        {envios.slice(0, 20).map((envio) => {
          const provedor = provedoresCanais.find((item) => item.id === envio.provedor);
          const finalizado = ["publicada", "falha", "cancelada", "interrompida"].includes(envio.status);
          return (
            <article key={envio.id} className="rounded-md border border-[#e7ebea] px-3 py-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-[8.5px] text-[#404847]">{provedor?.titulo ?? envio.provedor}</strong>
                    <span className="rounded-full bg-[#edf5f2] px-2 py-0.5 text-[6.5px] font-medium text-[#287864]">{rotulosStatusEnvio[envio.status]}</span>
                    <span className="text-[6.5px] text-[#929a99]">Tentativa {envio.tentativas}/{envio.maxTentativas}</span>
                  </div>
                  <p className="mt-1 text-[7.5px] leading-3.5 text-[#7f8887]">{envio.mensagem}</p>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#edf0ef]"><div className="h-full rounded-full bg-[#2d907a]" style={{ width: `${Math.max(2, envio.progresso)}%` }} /></div>
                  <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[6.5px] text-[#9aa09f]">
                    <span>{envio.progresso}%</span>
                    {envio.bytesTotais > 0 && <span>{formatarBytes(envio.bytesEnviados)} / {formatarBytes(envio.bytesTotais)}</span>}
                    <span>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(envio.atualizadoEm))}</span>
                    <span>Correlação: {envio.correlacaoId}</span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  {!finalizado && <Botao className="h-7 px-2 text-[7px]" onClick={() => void aoCancelar(envio.id)}><Ban className="size-3" /> Cancelar</Botao>}
                  {finalizado && envio.status !== "publicada" && <Botao className="h-7 px-2 text-[7px]" onClick={() => void aoRepetir(envio.id)}><RefreshCcw className="size-3" /> Repetir</Botao>}
                  {envio.link && <Botao className="h-7 px-2 text-[7px]" onClick={() => window.open(envio.link ?? "", "_blank", "noopener,noreferrer")}><ExternalLink className="size-3" /> Abrir</Botao>}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

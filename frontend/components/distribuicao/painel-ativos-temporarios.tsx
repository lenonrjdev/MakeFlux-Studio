"use client";

import { Clock3, ExternalLink, RefreshCcw, Trash2 } from "lucide-react";

import { Botao } from "@/components/ui/botao";
import type { AtivoTemporarioPublicacao } from "@/types/distribuicao";

function tamanho(bytes: number) {
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

export function PainelAtivosTemporarios({
  ativos,
  aoRemover,
  aoLimpar,
}: {
  ativos: AtivoTemporarioPublicacao[];
  aoRemover: (id: string) => Promise<unknown>;
  aoLimpar: () => Promise<unknown>;
}) {
  return (
    <section className="rounded-md border border-[#e0e6e5] bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[10px] font-semibold text-[#303737]"><Clock3 className="size-3.5 text-[#288a75]" /> Ativos temporários</div>
        <Botao className="h-7 px-2 text-[7px]" onClick={() => void aoLimpar()}><RefreshCcw className="size-3" /> Limpar expirados</Botao>
      </div>
      <div className="mt-3 space-y-2">
        {ativos.length === 0 && <div className="rounded-md border border-dashed border-[#dfe5e4] px-3 py-8 text-center text-[8px] text-[#929a99]">Nenhuma URL temporária foi criada.</div>}
        {ativos.slice(0, 15).map((ativo) => (
          <article key={ativo.id} className="flex items-start justify-between gap-3 rounded-md border border-[#e7ebea] px-3 py-2.5">
            <div className="min-w-0">
              <div className="flex items-center gap-2"><strong className="truncate text-[8px] text-[#424a49]">{ativo.publicId}</strong><span className="rounded-full bg-[#f1f5f4] px-1.5 py-0.5 text-[6px] text-[#667170]">{ativo.status}</span></div>
              <p className="mt-1 truncate text-[7px] text-[#858e8d]">{ativo.urlPublica || ativo.mensagem}</p>
              <div className="mt-1 flex gap-3 text-[6.5px] text-[#9aa09f]"><span>{tamanho(ativo.bytes)}</span><span>Expira {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(ativo.expiraEm))}</span></div>
            </div>
            <div className="flex shrink-0 gap-1">
              {ativo.urlPublica && <button type="button" className="foco-acessivel grid size-7 place-items-center rounded-md text-[#287d6b] hover:bg-[#eff7f5]" onClick={() => window.open(ativo.urlPublica, "_blank", "noopener,noreferrer")}><ExternalLink className="size-3.5" /></button>}
              {ativo.status !== "removido" && <button type="button" aria-label="Remover ativo" className="foco-acessivel grid size-7 place-items-center rounded-md text-[#a74f49] hover:bg-[#fff0ef]" onClick={() => void aoRemover(ativo.id)}><Trash2 className="size-3.5" /></button>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

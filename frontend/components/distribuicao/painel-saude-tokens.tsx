"use client";

import { KeyRound, RefreshCcw } from "lucide-react";

import { Botao } from "@/components/ui/botao";
import { provedoresCanais, rotulosStatusConexao } from "@/data/canais-publicacao";
import type { ConexaoCanalPublicacao, ProvedorCanalPublicacao } from "@/types/canais-publicacao";

export function PainelSaudeTokens({
  conexoes,
  aoRenovar,
}: {
  conexoes: ConexaoCanalPublicacao[];
  aoRenovar: (provedor: ProvedorCanalPublicacao) => Promise<unknown>;
}) {
  return (
    <section className="rounded-md border border-[#e0e6e5] bg-white p-4">
      <div className="flex items-center gap-2 text-[10px] font-semibold text-[#303737]"><KeyRound className="size-3.5 text-[#288a75]" /> Saúde dos tokens OAuth</div>
      <div className="mt-3 space-y-2">
        {provedoresCanais.map((provedor) => {
          const conexao = conexoes.find((item) => item.provedor === provedor.id);
          const Icone = provedor.icone;
          return (
            <article key={provedor.id} className="flex items-center justify-between gap-3 rounded-md border border-[#e7ebea] px-3 py-2.5">
              <div className="flex items-center gap-2.5"><div className="grid size-7 place-items-center rounded-md bg-[#f3f6f5]"><Icone className="size-3.5" style={{ color: provedor.cor }} /></div><div><strong className="block text-[8px] text-[#414948]">{provedor.titulo}</strong><span className="text-[6.5px] text-[#929a99]">{conexao ? `${rotulosStatusConexao[conexao.status]}${conexao.expiraEm ? ` · vence ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(conexao.expiraEm))}` : ""}` : "Não conectada"}</span></div></div>
              {conexao && <Botao className="h-7 px-2 text-[7px]" onClick={() => void aoRenovar(provedor.id)}><RefreshCcw className="size-3" /> Renovar</Botao>}
            </article>
          );
        })}
      </div>
    </section>
  );
}

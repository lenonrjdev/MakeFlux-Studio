import { CircleAlert, KeyRound, ServerCog, ShieldCheck } from "lucide-react";

import { conteudoAtualizador } from "@/content/atualizador";
import type { StatusAtualizadorNativo } from "@/types/atualizador";

export function PainelSegurancaAtualizador({ runtime }: { runtime: StatusAtualizadorNativo | null }) {
  const configurado = runtime?.configurado ?? false;
  return (
    <section className="rounded-md border border-[#e1e7e6] bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-semibold text-[#303737]"><ShieldCheck className="size-3.5 text-[#278a76]" /> Cadeia de confiança</div>
        <span className={`rounded-full px-2 py-1 text-[7px] font-semibold ${configurado ? "bg-[#e7f4f0] text-[#247762]" : "bg-[#fff3dc] text-[#8c692d]"}`}>{configurado ? "Configurada" : "Build de desenvolvimento"}</span>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex items-start gap-2 rounded-md bg-[#f6f8f8] px-3 py-2.5"><KeyRound className="mt-0.5 size-3.5 text-[#6d7776]" /><div><strong className="block text-[8.5px] text-[#3b4242]">Chave pública incorporada</strong><p className="mt-1 text-[7.5px] leading-4 text-[#7d8585]">Somente builds de distribuição recebem a chave pública usada na validação.</p></div></div>
        <div className="flex items-start gap-2 rounded-md bg-[#f6f8f8] px-3 py-2.5"><ServerCog className="mt-0.5 size-3.5 text-[#6d7776]" /><div><strong className="block text-[8.5px] text-[#3b4242]">Endpoint HTTPS</strong><p className="mt-1 break-all text-[7.5px] leading-4 text-[#7d8585]">{runtime?.endpoint ?? "Não incorporado neste build"}</p></div></div>
      </div>
      <div className="mt-3 flex items-start gap-2 rounded-md border border-[#e5dfcf] bg-[#fffaf0] px-3 py-2.5 text-[7.5px] leading-4 text-[#7c6539]"><CircleAlert className="mt-0.5 size-3.5 shrink-0" /> {configurado ? conteudoAtualizador.avisoAssinatura : conteudoAtualizador.avisoBuild}</div>
    </section>
  );
}

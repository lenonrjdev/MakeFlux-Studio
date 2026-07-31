"use client";

import { Activity, Download, Trash2 } from "lucide-react";

import { CartaoConfiguracao } from "@/components/configuracoes/cartao-configuracao";
import { Botao } from "@/components/ui/botao";
import { Interruptor } from "@/components/ui/interruptor";
import { conteudoQualidade } from "@/content/qualidade";
import type { EventoTelemetriaLocal, PreferenciasTelemetriaLocal } from "@/types/qualidade";

export function PainelTelemetriaLocal({
  preferencias,
  eventos,
  aoAlterar,
  aoLimpar,
  aoNotificar,
}: {
  preferencias: PreferenciasTelemetriaLocal;
  eventos: EventoTelemetriaLocal[];
  aoAlterar: (ativa: boolean) => void;
  aoLimpar: () => Promise<void>;
  aoNotificar: (mensagem: string, tipo?: "sucesso" | "aviso") => void;
}) {
  function exportar() {
    const conteudo = JSON.stringify(
      { tipo: "makeflux-telemetria-local", versao: 1, exportadoEm: new Date().toISOString(), eventos },
      null,
      2,
    );
    const url = URL.createObjectURL(new Blob([conteudo], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `makeflux-telemetria-local-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    aoNotificar("Telemetria local exportada.");
  }

  return (
    <CartaoConfiguracao
      titulo="Telemetria local opcional"
      descricao="Eventos técnicos permanecem no computador e ajudam a diagnosticar estabilidade."
    >
      <Interruptor
        ativo={preferencias.ativa}
        aoAlterar={aoAlterar}
        rotulo="Registrar telemetria local"
        descricao="Desativada por padrão. Nenhum dado é enviado pela internet."
      />
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-md border border-[#e3e8e7] bg-[#fafbfb] p-3">
          <Activity className="size-3.5 text-[#238f77]" />
          <strong className="mt-2 block text-[16px] text-[#303637]">{eventos.length}</strong>
          <span className="text-[8px] text-[#92999a]">eventos registrados</span>
        </div>
        <div className="col-span-2 max-h-[128px] space-y-1.5 overflow-auto rounded-md border border-[#e3e8e7] bg-[#fafbfb] p-2.5">
          {eventos.slice(0, 8).map((evento) => (
            <div key={evento.id} className="flex items-center justify-between gap-3 rounded bg-white px-2.5 py-2 text-[8.5px]">
              <span className="truncate text-[#3d4445]">{evento.categoria} · {evento.nome}</span>
              <span className="shrink-0 text-[#9aa0a1]">{new Date(evento.criadoEm).toLocaleTimeString("pt-BR")}</span>
            </div>
          ))}
          {eventos.length === 0 && <p className="py-6 text-center text-[9px] text-[#969d9e]">Sem eventos locais.</p>}
        </div>
      </div>
      <div className="flex gap-2">
        <Botao disabled={eventos.length === 0} onClick={exportar}><Download className="size-3.5" /> Exportar JSON</Botao>
        <Botao variante="fantasma" disabled={eventos.length === 0} onClick={() => void aoLimpar()}><Trash2 className="size-3.5" /> Limpar</Botao>
      </div>
      <p className="text-[9px] leading-5 text-[#7c8585]">{conteudoQualidade.avisoTelemetria}</p>
    </CartaoConfiguracao>
  );
}

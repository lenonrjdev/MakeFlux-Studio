import {
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Cloud,
  HardDrive,
  Power,
  RefreshCw,
  Star,
} from "lucide-react";

import {
  coresStatusIntegracao,
  iconesIntegracoes,
  rotulosCapacidades,
  rotulosStatusIntegracao,
} from "@/data/integracoes";
import { juntarClasses } from "@/lib/classes";
import { integracaoCompativelComModo } from "@/lib/integracoes-local";
import type {
  CapacidadeIntegracao,
  IntegracaoStudio,
  ModoProcessamento,
  PadroesIntegracoes,
} from "@/types/integracoes";

export function CartaoIntegracao({
  integracao,
  modo,
  padroes,
  testando,
  aoSelecionar,
  aoAlternarAtiva,
  aoTestar,
}: {
  integracao: IntegracaoStudio;
  modo: ModoProcessamento;
  padroes: PadroesIntegracoes;
  testando: boolean;
  aoSelecionar: () => void;
  aoAlternarAtiva: () => void;
  aoTestar: () => void;
}) {
  const Icone = iconesIntegracoes[integracao.id] ?? Cloud;
  const compativel = integracaoCompativelComModo(integracao, modo);
  const padraoPara = (Object.entries(padroes) as Array<[CapacidadeIntegracao, string]>).filter(
    ([, id]) => id === integracao.id,
  );

  return (
    <article className="painel-superficie overflow-hidden rounded-md transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(24,37,34,.08)]">
      <div className="flex items-start justify-between gap-3 border-b border-[#edf0ef] p-3.5">
        <button type="button" onClick={aoSelecionar} className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 shrink-0 place-items-center rounded-md border border-[#dfe7e5] bg-[#f4f8f7] text-[#277763]">
              <Icone className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="truncate text-[10px] font-semibold text-[#293031]">{integracao.nome}</h3>
                {padraoPara.length > 0 && <Star className="size-3 fill-[#d8a33f] text-[#d8a33f]" />}
              </div>
              <p className="mt-0.5 truncate text-[7.5px] text-[#8c9495]">{integracao.fornecedor}</p>
            </div>
          </div>
        </button>
        <button
          type="button"
          onClick={aoAlternarAtiva}
          className={juntarClasses(
            "foco-acessivel grid size-7 shrink-0 place-items-center rounded-md border transition",
            integracao.ativa
              ? "border-[#cae2dc] bg-[#edf7f4] text-[#237461]"
              : "border-[#e0e5e4] bg-[#f7f9f9] text-[#9aa1a1]",
          )}
          aria-label={integracao.ativa ? "Desativar integração" : "Ativar integração"}
        >
          <Power className="size-3.5" />
        </button>
      </div>

      <button type="button" onClick={aoSelecionar} className="block w-full p-3.5 text-left">
        <div className="flex items-center justify-between gap-2">
          <span className={`rounded border px-2 py-1 text-[7px] font-medium ${coresStatusIntegracao[integracao.status]}`}>
            {rotulosStatusIntegracao[integracao.status]}
          </span>
          <span className="flex items-center gap-1 text-[7px] text-[#879091]">
            {integracao.execucao === "local" ? <HardDrive className="size-3" /> : <Cloud className="size-3" />}
            {integracao.execucao === "local" ? "Local" : integracao.execucao === "nuvem" ? "Nuvem" : "Híbrida"}
          </span>
        </div>
        <p className="mt-3 line-clamp-2 min-h-8 text-[8px] leading-4 text-[#818a8b]">{integracao.descricao}</p>
        <div className="mt-3 flex flex-wrap gap-1">
          {integracao.capacidades.slice(0, 3).map((capacidade) => (
            <span key={capacidade} className="rounded border border-[#e4e8e7] bg-[#fafbfb] px-1.5 py-0.5 text-[6.8px] text-[#768081]">
              {rotulosCapacidades[capacidade]}
            </span>
          ))}
        </div>
        {padraoPara.length > 0 && (
          <p className="mt-2 truncate text-[7px] text-[#a0782e]">
            Padrão para {padraoPara.map(([capacidade]) => rotulosCapacidades[capacidade]).join(", ")}
          </p>
        )}
      </button>

      <div className="flex items-center justify-between border-t border-[#edf0ef] px-3.5 py-2.5">
        <div className="flex min-w-0 items-center gap-1.5 text-[7px] text-[#8c9495]">
          {!compativel ? (
            <><CircleAlert className="size-3 shrink-0 text-[#9a6f2f]" /><span className="truncate">Incompatível com modo Offline</span></>
          ) : integracao.status === "conectada" ? (
            <><CircleCheck className="size-3 shrink-0 text-[#23816a]" /><span className="truncate">{integracao.latenciaMs ? `${integracao.latenciaMs} ms` : "Pronta para uso"}</span></>
          ) : (
            <><CircleAlert className="size-3 shrink-0 text-[#9a6f2f]" /><span className="truncate">Requer configuração</span></>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={aoTestar}
            disabled={testando}
            className="foco-acessivel grid size-7 place-items-center rounded-md text-[#687273] hover:bg-[#f0f3f3] disabled:opacity-45"
            aria-label="Testar integração"
          >
            <RefreshCw className={`size-3.5 ${testando ? "animate-spin" : ""}`} />
          </button>
          <button type="button" onClick={aoSelecionar} className="foco-acessivel grid size-7 place-items-center rounded-md text-[#687273] hover:bg-[#f0f3f3]" aria-label="Abrir detalhes">
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}

import { Check, Gauge, ShieldCheck } from "lucide-react";

import { modosProcessamento, rotulosCapacidades } from "@/data/integracoes";
import type {
  CapacidadeIntegracao,
  IntegracaoStudio,
  ModoProcessamento,
  PadroesIntegracoes,
} from "@/types/integracoes";

const capacidadesPrincipais: CapacidadeIntegracao[] = [
  "motor-video",
  "roteiro",
  "materiais",
  "narracao",
  "legendas",
  "renderizacao",
];

export function PainelModoProcessamento({
  modo,
  integracoes,
  padroes,
  aoMudarModo,
  aoDefinirPadrao,
}: {
  modo: ModoProcessamento;
  integracoes: IntegracaoStudio[];
  padroes: PadroesIntegracoes;
  aoMudarModo: (modo: ModoProcessamento) => void;
  aoDefinirPadrao: (capacidade: CapacidadeIntegracao, integracaoId: string) => void;
}) {
  return (
    <section className="painel-superficie rounded-md p-4">
      <div className="flex items-start justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-[9px] font-semibold text-[#303637]">
            <Gauge className="size-3.5 text-[#1f9079]" /> Modo de processamento
          </div>
          <p className="mt-1 text-[8px] leading-4 text-[#8a9293]">
            Escolha como o MakeFlux combina serviços externos e recursos deste computador.
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-[#dfe5e4] bg-[#f8fafa] p-1">
          {modosProcessamento.map((opcao) => {
            const Icone = opcao.icone;
            const ativo = modo === opcao.id;
            return (
              <button
                key={opcao.id}
                type="button"
                onClick={() => aoMudarModo(opcao.id)}
                className={`foco-acessivel flex h-8 items-center gap-1.5 rounded px-2.5 text-[8px] font-medium transition ${ativo ? "bg-white text-[#247763] shadow-sm" : "text-[#7d8687] hover:bg-white/70"}`}
                title={opcao.descricao}
              >
                <Icone className="size-3.5" /> {opcao.titulo}
                {ativo && <Check className="size-3" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-6 gap-2 border-t border-[#edf0ef] pt-4">
        {capacidadesPrincipais.map((capacidade) => {
          const candidatos = integracoes.filter((item) => item.capacidades.includes(capacidade));
          return (
            <label key={capacidade} className="block min-w-0">
              <span className="mb-1.5 flex items-center gap-1 text-[7px] font-semibold uppercase tracking-[0.08em] text-[#8b9494]">
                <ShieldCheck className="size-3" /> {rotulosCapacidades[capacidade]}
              </span>
              <select
                value={padroes[capacidade] ?? ""}
                onChange={(evento) => aoDefinirPadrao(capacidade, evento.target.value)}
                className="foco-acessivel h-8 w-full rounded-md border border-[#dfe5e4] bg-white px-2 text-[8px] text-[#4e5859]"
              >
                {candidatos.map((item) => (
                  <option key={item.id} value={item.id}>{item.nome}</option>
                ))}
              </select>
            </label>
          );
        })}
      </div>
    </section>
  );
}

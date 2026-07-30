import { ChevronLeft, MoreVertical, Plus } from "lucide-react";
import { BotaoLink } from "@/components/ui/botao";
import { SeloStatus } from "@/components/ui/selo-status";
import { conteudoInicio } from "@/content/inicio";

export function CabecalhoInicio() {
  return (
    <div className="border-b border-[#e4e8e8] bg-[#f7f8f9] px-8 pt-5">
      <button className="foco-acessivel mb-4 inline-flex items-center gap-1 rounded text-[10px] text-[#697172] hover:text-[#202526]">
        <ChevronLeft className="size-3" />
        Voltar para projetos
      </button>

      <div className="flex items-start justify-between gap-8">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[19px] font-semibold tracking-[-0.025em] text-[#171a1b]">
              {conteudoInicio.titulo}
            </h1>
            <span className="rounded border border-[#dce1e1] bg-white px-2 py-1 text-[9px] font-medium text-[#687071]">
              Estúdio pessoal
            </span>
          </div>
          <p className="mt-2 max-w-[650px] text-[11.5px] leading-5 text-[#747c7d]">
            {conteudoInicio.descricao}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <SeloStatus texto="Motor pronto" />
          <SeloStatus texto="Fila: 1" tom="neutro" />
          <button className="foco-acessivel grid size-8 place-items-center rounded-md border border-[#dfe4e4] bg-white text-[#6a7273] hover:bg-[#f7f9f9]">
            <MoreVertical className="size-3.5" />
          </button>
          <BotaoLink href="/criar-video" variante="primario">
            <Plus className="size-3.5" />
            {conteudoInicio.acaoPrincipal}
          </BotaoLink>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-6">
        {conteudoInicio.abas.map((aba, indice) => (
          <button
            key={aba}
            className={`foco-acessivel relative pb-3 text-[9.5px] font-medium uppercase tracking-[0.05em] ${
              indice === 0 ? "text-[#1b7f6b]" : "text-[#777f80] hover:text-[#303637]"
            }`}
          >
            {aba}
            {indice === 0 && <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[#299a84]" />}
          </button>
        ))}
      </div>
    </div>
  );
}

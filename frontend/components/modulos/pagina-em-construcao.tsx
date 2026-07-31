import { ArrowRight, Construction, Layers3 } from "lucide-react";
import { BotaoLink } from "@/components/ui/botao";

export function PaginaEmConstrucao({
  titulo,
  fase,
  descricao,
}: {
  titulo: string;
  fase: string;
  descricao: string;
}) {
  return (
    <div className="min-h-screen bg-[#f7f8f9]">
      <div className="flex h-[62px] items-center border-b border-[#e6eaea] bg-white px-8 text-[10.5px] text-[#8b9293]">
        MakeFlux Studio <span className="mx-2 text-[#c4c9c9]">/</span>
        <strong className="font-medium text-[#4b5253]">{titulo}</strong>
      </div>
      <div className="mx-auto flex min-h-[calc(100vh-62px)] max-w-[920px] items-center justify-center px-8 py-12">
        <section className="painel-superficie w-full rounded-md p-10">
          <div className="flex items-start justify-between gap-8">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-[#cfe4df] bg-[#edf7f4] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.05em] text-[#1b7c68]">
                <Layers3 className="size-3" />
                {fase}
              </span>
              <h1 className="mt-5 text-[24px] font-semibold tracking-[-0.035em]">{titulo}</h1>
              <p className="mt-3 max-w-[620px] text-[12px] leading-6 text-[#747c7d]">{descricao}</p>
            </div>
            <span className="grid size-12 shrink-0 place-items-center rounded-md bg-[#f0f3f3] text-[#798182]">
              <Construction className="size-5" />
            </span>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-[#e9ecec] pt-5">
            <p className="text-[10px] text-[#8b9293]">A navegação já está pronta. A implementação funcional entra na fase indicada.</p>
            <BotaoLink href="/">
              Voltar ao início
              <ArrowRight className="size-3.5" />
            </BotaoLink>
          </div>
        </section>
      </div>
    </div>
  );
}

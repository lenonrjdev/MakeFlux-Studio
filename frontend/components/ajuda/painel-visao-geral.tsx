import { Activity, BookOpenText, ChevronRight, LifeBuoy, ListChecks, Wrench } from "lucide-react";

import type { PerguntaFrequente, SecaoAjuda } from "@/types/ajuda";

const atalhos: Array<{ titulo: string; descricao: string; secao: SecaoAjuda; icone: typeof Activity }> = [
  { titulo: "Concluir primeiros passos", descricao: "Prepare workspace, integrações e primeiro projeto.", secao: "primeiros-passos", icone: ListChecks },
  { titulo: "Consultar guias", descricao: "Tutoriais organizados por cada área do produto.", secao: "guias", icone: BookOpenText },
  { titulo: "Executar diagnóstico", descricao: "Verifique dados locais, motor, FFmpeg e segurança.", secao: "diagnostico", icone: Activity },
  { titulo: "Resolver uma falha", descricao: "Siga checklists para os problemas mais recorrentes.", secao: "solucao-problemas", icone: Wrench },
  { titulo: "Gerar pacote de suporte", descricao: "Exporte um relatório técnico sem credenciais.", secao: "suporte", icone: LifeBuoy },
];

export function PainelVisaoGeral({ perguntas, aoSelecionar }: { perguntas: PerguntaFrequente[]; aoSelecionar: (secao: SecaoAjuda) => void }) {
  return (
    <div className="space-y-4">
      <section className="rounded-md border border-[#e2e7e6] bg-white">
        <header className="border-b border-[#edf0f0] px-5 py-4">
          <h2 className="text-[12px] font-semibold text-[#252a2b]">Como podemos ajudar?</h2>
          <p className="mt-1 text-[9.5px] text-[#8b9293]">Acesse rapidamente o ponto certo do fluxo.</p>
        </header>
        <div className="grid grid-cols-2 gap-3 p-4">
          {atalhos.map((atalho) => {
            const Icone = atalho.icone;
            return (
              <button key={atalho.secao} type="button" onClick={() => aoSelecionar(atalho.secao)} className="group flex items-center gap-3 rounded-md border border-[#e4e8e7] p-4 text-left transition hover:border-[#b9d8d1] hover:bg-[#fbfdfc]">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[#edf7f4] text-[#277a68]"><Icone className="size-4" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10.5px] font-semibold text-[#303637]">{atalho.titulo}</span>
                  <span className="mt-1 block text-[9px] leading-4 text-[#8c9495]">{atalho.descricao}</span>
                </span>
                <ChevronRight className="size-3.5 text-[#b3baba] transition group-hover:translate-x-0.5 group-hover:text-[#438273]" />
              </button>
            );
          })}
        </div>
      </section>
      <section className="rounded-md border border-[#e2e7e6] bg-white">
        <header className="border-b border-[#edf0f0] px-5 py-4">
          <h2 className="text-[12px] font-semibold text-[#252a2b]">Perguntas frequentes</h2>
          <p className="mt-1 text-[9.5px] text-[#8b9293]">Respostas rápidas sobre dados, modo offline e arquivos.</p>
        </header>
        <div className="divide-y divide-[#edf0f0]">
          {perguntas.map((pergunta) => (
            <details key={pergunta.id} className="group px-5 py-3.5">
              <summary className="cursor-pointer list-none pr-4 text-[10px] font-medium text-[#3b4243] marker:hidden">{pergunta.pergunta}</summary>
              <p className="mt-2 max-w-[780px] text-[9px] leading-4 text-[#81898a]">{pergunta.resposta}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

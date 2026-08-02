import { AlertTriangle, CheckCircle2, CircleX, FileCheck2, ScanSearch } from "lucide-react";

import { Botao } from "@/components/ui/botao";
import type { ResultadoValidacaoEstabilidade } from "@/types/estabilidade";

const visual = {
  saudavel: { icone: CheckCircle2, classe: "border-[#d7e8e3] bg-[#f5faf8] text-[#277561]", rotulo: "Saudável" },
  atencao: { icone: AlertTriangle, classe: "border-[#eadfc7] bg-[#fffaf1] text-[#8a6b32]", rotulo: "Atenção" },
  critico: { icone: CircleX, classe: "border-[#ead3d3] bg-[#fcf5f5] text-[#9a4e4e]", rotulo: "Crítico" },
};

export function PainelValidacaoEstabilidade({
  validacao,
  operacao,
  aoValidar,
}: {
  validacao: ResultadoValidacaoEstabilidade | null;
  operacao: string | null;
  aoValidar: () => void;
}) {
  return (
    <section className="rounded-md border border-[#e0e6e5] bg-white">
      <div className="flex items-center justify-between border-b border-[#e7ebea] px-5 py-4">
        <div className="flex items-center gap-2">
          <FileCheck2 className="size-3.5 text-[#278a76]" />
          <div>
            <h2 className="text-[12px] font-semibold text-[#303738]">Arquivos essenciais</h2>
            <p className="mt-1 text-[8px] text-[#7f8889]">SQLite, cofre, checkpoint e caches gerenciados.</p>
          </div>
        </div>
        <Botao onClick={aoValidar} disabled={operacao === "validar"} className="h-8 text-[8.5px]">
          <ScanSearch className="size-3.5" />
          Executar validação
        </Botao>
      </div>
      <div className="grid grid-cols-2 gap-3 p-5">
        {(validacao?.itens ?? []).map((item) => {
          const estado = visual[item.status];
          const Icone = estado.icone;
          return (
            <article key={item.id} className={`rounded-md border p-3 ${estado.classe}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <strong className="text-[9px]">{item.titulo}</strong>
                  <p className="mt-1 text-[7.5px] leading-4 opacity-85">{item.detalhe}</p>
                </div>
                <Icone className="size-3.5 shrink-0" />
              </div>
              <p className="mt-2 text-[6.8px] leading-3 opacity-80">{item.acaoRecomendada}</p>
            </article>
          );
        })}
        {!validacao && (
          <div className="col-span-2 rounded-md border border-dashed border-[#dfe5e4] px-4 py-8 text-center text-[8px] text-[#8a9293]">
            Execute a validação para conferir os arquivos da instalação atual.
          </div>
        )}
      </div>
    </section>
  );
}

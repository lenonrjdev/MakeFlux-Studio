import { Power, RotateCcw, ShieldAlert } from "lucide-react";

import { Botao } from "@/components/ui/botao";
import type { StatusEstabilidade } from "@/types/estabilidade";

export function PainelModoSeguro({
  status,
  operacao,
  aoAlternar,
}: {
  status: StatusEstabilidade | null;
  operacao: string | null;
  aoAlternar: (ativo: boolean) => void;
}) {
  const ativo = Boolean(status?.modoSeguro);
  return (
    <section className="rounded-md border border-[#e0e6e5] bg-white">
      <div className="flex items-center gap-2 border-b border-[#e7ebea] px-5 py-4">
        <ShieldAlert className="size-3.5 text-[#278a76]" />
        <div>
          <h2 className="text-[12px] font-semibold text-[#303738]">Modo seguro</h2>
          <p className="mt-1 text-[8px] text-[#7f8889]">
            Inicia sem rotinas automáticas nem recuperação de publicações de rede.
          </p>
        </div>
      </div>
      <div className="space-y-3 p-5">
        <div className={`rounded-md border px-4 py-3 ${ativo ? "border-[#eadfc7] bg-[#fffaf1]" : "border-[#d7e8e3] bg-[#f5faf8]"}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <strong className={`text-[10px] ${ativo ? "text-[#805f2d]" : "text-[#276d5d]"}`}>
                {ativo ? "Modo seguro ativo" : "Inicialização normal"}
              </strong>
              <p className="mt-1 text-[7.5px] leading-4 text-[#778182]">
                {ativo
                  ? "Use este estado para investigar falhas sem disparar tarefas em segundo plano."
                  : "O aplicativo inicia todos os serviços operacionais aprovados."}
              </p>
            </div>
            <span className="text-[7px] uppercase tracking-[0.08em] text-[#8a9293]">
              Reinício necessário
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Botao
            variante={ativo ? "secundario" : "primario"}
            disabled={operacao === "modo-seguro" || ativo}
            onClick={() => aoAlternar(true)}
            className="h-8 text-[8.5px]"
          >
            <Power className="size-3.5" />
            Ativar na próxima abertura
          </Botao>
          <Botao
            disabled={operacao === "modo-seguro" || !ativo}
            onClick={() => aoAlternar(false)}
            className="h-8 text-[8.5px]"
          >
            <RotateCcw className="size-3.5" />
            Retomar inicialização normal
          </Botao>
        </div>
      </div>
    </section>
  );
}

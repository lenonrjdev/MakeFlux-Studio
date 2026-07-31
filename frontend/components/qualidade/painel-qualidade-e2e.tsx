import { CheckCircle2, History, MonitorPlay } from "lucide-react";

import { CartaoConfiguracao } from "@/components/configuracoes/cartao-configuracao";
import { verificacoesQualidade } from "@/data/qualidade";

export function PainelQualidadeE2E() {
  return (
    <CartaoConfiguracao
      titulo="Matriz de qualidade e ponta a ponta"
      descricao="Contratos críticos executados junto com a suíte completa da aplicação."
    >
      <div className="grid grid-cols-2 gap-2">
        {verificacoesQualidade.map((item) => (
          <div key={item} className="flex items-start gap-2.5 rounded-md border border-[#e3e8e7] bg-[#fafbfb] px-3 py-3">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-[#248f78]" />
            <span className="text-[8.8px] leading-4 text-[#596263]">{item}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 rounded-md border border-[#dce8e5] bg-[#f3f8f7] p-3">
          <MonitorPlay className="size-4 text-[#248f78]" />
          <div><strong className="block text-[9px] text-[#315f55]">Smoke test desktop</strong><span className="text-[8px] text-[#78928c]">Rotas, banco, cofre e runtime</span></div>
        </div>
        <div className="flex items-center gap-3 rounded-md border border-[#dce8e5] bg-[#f3f8f7] p-3">
          <History className="size-4 text-[#248f78]" />
          <div><strong className="block text-[9px] text-[#315f55]">Regressão acumulada</strong><span className="text-[8px] text-[#78928c]">Fases 1 a 13 no mesmo validador</span></div>
        </div>
      </div>
    </CartaoConfiguracao>
  );
}

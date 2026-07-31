import { Activity, PlugZap, RefreshCw } from "lucide-react";

import { Botao } from "@/components/ui/botao";
import { conteudoIntegracoes } from "@/content/integracoes";

export function CabecalhoIntegracoes({
  conectadas,
  total,
  diagnosticando,
  aoDiagnosticar,
}: {
  conectadas: number;
  total: number;
  diagnosticando: boolean;
  aoDiagnosticar: () => void;
}) {
  return (
    <header className="border-b border-[#e3e8e7] bg-white px-8 py-5">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.1em] text-[#1d8b74]">
            <PlugZap className="size-3" /> Sistema
          </div>
          <h1 className="mt-2 text-[22px] font-semibold tracking-[-0.035em] text-[#252a2b]">
            {conteudoIntegracoes.titulo}
          </h1>
          <p className="mt-1.5 max-w-[690px] text-[10px] leading-5 text-[#788181]">
            {conteudoIntegracoes.descricao}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-9 items-center gap-2 rounded-md border border-[#e0e5e4] bg-[#fafbfb] px-3 text-[9px] text-[#687171]">
            <Activity className="size-3.5 text-[#1e8c75]" />
            {conectadas} conectadas · {total} disponíveis
          </div>
          <Botao variante="primario" onClick={aoDiagnosticar} disabled={diagnosticando}>
            <RefreshCw className={`size-3.5 ${diagnosticando ? "animate-spin" : ""}`} />
            {diagnosticando ? "Diagnosticando" : "Testar integrações"}
          </Botao>
        </div>
      </div>
    </header>
  );
}

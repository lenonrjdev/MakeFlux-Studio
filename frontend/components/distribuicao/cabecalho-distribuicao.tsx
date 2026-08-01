import { CloudUpload, ShieldCheck } from "lucide-react";

export function CabecalhoDistribuicao({ filaAtiva }: { filaAtiva: number }) {
  return (
    <header className="border-b border-[#e1e6e5] bg-white px-8 py-5">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[7px] font-semibold uppercase tracking-[0.09em] text-[#2d8b76]">
            <CloudUpload className="size-3" /> Fase 21 · Distribuição robusta
          </div>
          <h1 className="mt-2 text-[21px] font-semibold tracking-[-0.04em] text-[#252b2b]">
            Hospedagem temporária e fila de publicação
          </h1>
          <p className="mt-1 max-w-3xl text-[9px] leading-4 text-[#808989]">
            Prepare URLs HTTPS para Reels, acompanhe uploads em blocos, renove tokens e recupere envios interrompidos.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-[#dbe6e3] bg-[#f3faf8] px-3 py-2 text-[8px] text-[#2a7565]">
          <ShieldCheck className="size-3.5" /> {filaAtiva} envio(s) em andamento
        </div>
      </div>
    </header>
  );
}

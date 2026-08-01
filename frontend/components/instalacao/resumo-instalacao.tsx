
import { CheckCircle2, CircleAlert, Laptop, PackageCheck } from "lucide-react";

import type { DiagnosticoInstalacaoAssistida } from "@/types/instalacao";

export function ResumoInstalacao({ diagnostico }: { diagnostico: DiagnosticoInstalacaoAssistida | null }) {
  const obrigatorias = diagnostico?.dependencias.filter((item) => item.obrigatoria) ?? [];
  const prontas = obrigatorias.filter((item) => item.disponivel).length;
  const cards = [
    { titulo: "Ambiente", valor: diagnostico?.windows ? "Windows detectado" : "Aguardando", detalhe: diagnostico?.wingetDisponivel ? `WinGet ${diagnostico.wingetVersao ?? "disponível"}` : "WinGet não detectado", ok: Boolean(diagnostico?.windows && diagnostico?.wingetDisponivel), icone: Laptop },
    { titulo: "Dependências", valor: `${prontas}/${obrigatorias.length || 4} prontas`, detalhe: "Git, uv, FFmpeg e ImageMagick", ok: prontas === obrigatorias.length && obrigatorias.length > 0, icone: PackageCheck },
    { titulo: "Motor", valor: diagnostico?.moneyPrinterDetectado ? "Instalado" : "Pendente", detalhe: diagnostico?.ambientePythonPronto ? "Ambiente Python sincronizado" : "Ambiente ainda não sincronizado", ok: Boolean(diagnostico?.moneyPrinterDetectado && diagnostico?.ambientePythonPronto), icone: CheckCircle2 },
    { titulo: "Produção", valor: diagnostico?.prontoParaProducao ? "Pronta" : "Requer preparação", detalhe: diagnostico?.configCriada ? "Configuração local criada" : "config.toml pendente", ok: Boolean(diagnostico?.prontoParaProducao), icone: CircleAlert },
  ];
  return <section className="grid grid-cols-4 gap-3">{cards.map((card) => { const Icone=card.icone; return <article key={card.titulo} className="rounded-md border border-[#e0e6e5] bg-white p-4"><div className="flex items-center justify-between"><span className="text-[8px] font-medium text-[#838c8d]">{card.titulo}</span><Icone className={`size-3.5 ${card.ok ? "text-[#27806d]" : "text-[#a3aaab]"}`} /></div><strong className="mt-2 block text-[14px] tracking-[-0.025em] text-[#303738]">{card.valor}</strong><span className="mt-1 block text-[7.5px] leading-4 text-[#8a9293]">{card.detalhe}</span></article>; })}</section>;
}

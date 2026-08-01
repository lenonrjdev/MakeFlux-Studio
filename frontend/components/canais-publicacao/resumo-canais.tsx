import { CheckCircle2, Clock3, Send, ShieldCheck } from "lucide-react";

import type { ConexaoCanalPublicacao, EnvioPublicacaoSocial } from "@/types/canais-publicacao";

export function ResumoCanais({ conexoes, envios }: { conexoes: ConexaoCanalPublicacao[]; envios: EnvioPublicacaoSocial[] }) {
  const itens = [
    { titulo: "Conectadas", valor: conexoes.filter((item) => item.status === "conectada").length, icone: CheckCircle2 },
    { titulo: "Publicadas", valor: envios.filter((item) => item.status === "publicada").length, icone: Send },
    { titulo: "Processando", valor: envios.filter((item) => ["preparando", "enviando", "processando"].includes(item.status)).length, icone: Clock3 },
    { titulo: "Tokens no cofre", valor: conexoes.length, icone: ShieldCheck },
  ];
  return <section className="grid grid-cols-4 gap-3">{itens.map(({ titulo, valor, icone: Icone }) => <div key={titulo} className="rounded-md border border-[#e1e7e6] bg-white px-4 py-3"><div className="flex items-center justify-between"><span className="text-[7.5px] text-[#858e8d]">{titulo}</span><Icone className="size-3.5 text-[#2c8d78]" /></div><strong className="mt-2 block text-[18px] font-semibold tracking-[-0.04em] text-[#303737]">{valor}</strong></div>)}</section>;
}

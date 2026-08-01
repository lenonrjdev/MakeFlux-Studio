import { Cloud, KeyRound, RefreshCw, Send } from "lucide-react";

import type { EnvioPublicacaoSocial } from "@/types/canais-publicacao";
import type {
  AtivoTemporarioPublicacao,
  ConfiguracaoArmazenamentoPublicacao,
} from "@/types/distribuicao";

export function ResumoDistribuicao({
  configuracao,
  ativos,
  envios,
}: {
  configuracao: ConfiguracaoArmazenamentoPublicacao | null;
  ativos: AtivoTemporarioPublicacao[];
  envios: EnvioPublicacaoSocial[];
}) {
  const cards = [
    {
      titulo: "Armazenamento",
      valor: configuracao?.status === "pronto" ? "Pronto" : "Pendente",
      detalhe: configuracao?.cloudName || "Cloudinary não configurado",
      icone: Cloud,
    },
    {
      titulo: "URLs temporárias",
      valor: ativos.filter((item) => item.status === "disponivel").length.toString(),
      detalhe: `${ativos.filter((item) => item.status !== "removido").length} ativo(s) monitorado(s)`,
      icone: RefreshCw,
    },
    {
      titulo: "Fila robusta",
      valor: envios.filter((item) => !["publicada", "falha", "cancelada", "interrompida"].includes(item.status)).length.toString(),
      detalhe: `${envios.filter((item) => item.status === "publicada").length} publicação(ões) confirmada(s)`,
      icone: Send,
    },
    {
      titulo: "Tokens",
      valor: "Automático",
      detalhe: "Renovação antes do vencimento",
      icone: KeyRound,
    },
  ];

  return (
    <section className="grid grid-cols-4 gap-3">
      {cards.map(({ titulo, valor, detalhe, icone: Icone }) => (
        <article key={titulo} className="rounded-md border border-[#e0e6e5] bg-white p-3.5">
          <div className="flex items-center justify-between text-[7px] uppercase tracking-[0.08em] text-[#858e8d]">
            {titulo}
            <Icone className="size-3.5 text-[#2b8b76]" />
          </div>
          <strong className="mt-2 block text-[17px] font-semibold tracking-[-0.04em] text-[#303737]">{valor}</strong>
          <span className="mt-0.5 block truncate text-[7px] text-[#929998]">{detalhe}</span>
        </article>
      ))}
    </section>
  );
}

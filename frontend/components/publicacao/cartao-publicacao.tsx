import { CalendarDays, ExternalLink, MoreHorizontal, Star } from "lucide-react";

import { plataformasPublicacao, rotulosStatusPublicacao } from "@/data/publicacao";
import { formatarDataPublicacao } from "@/lib/publicacao-local";
import { juntarClasses } from "@/lib/classes";
import type { PublicacaoStudio } from "@/types/publicacao";

const gradientes = {
  contraste: "linear-gradient(135deg,#1f9b83,#172a27)",
  clean: "linear-gradient(135deg,#eaf4f1,#b7d6ce)",
  cinematografica: "linear-gradient(135deg,#22292b,#6b4d57)",
  "texto-grande": "linear-gradient(135deg,#e4a637,#75481f)",
} as const;

export function CartaoPublicacao({ publicacao, aoSelecionar, aoFavoritar }: { publicacao: PublicacaoStudio; aoSelecionar: () => void; aoFavoritar: () => void }) {
  const plataforma = plataformasPublicacao.find((item) => item.id === publicacao.plataforma) ?? plataformasPublicacao[0];
  const Icone = plataforma.icone;
  const dataPrincipal = publicacao.status === "agendada" ? publicacao.agendadaPara : publicacao.status === "publicada" ? publicacao.publicadaEm : publicacao.atualizadoEm;

  return (
    <article className="group overflow-hidden rounded-md border border-[#e0e5e4] bg-white transition hover:-translate-y-0.5 hover:border-[#c9d8d4] hover:shadow-[0_8px_24px_rgba(28,45,41,.08)]">
      <button type="button" onClick={aoSelecionar} className="block w-full text-left">
        <div className="relative h-[132px] overflow-hidden" style={{ background: gradientes[publicacao.estiloThumbnail] }}>
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.16)_1px,transparent_1px)] [background-size:26px_26px]" />
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded border border-white/20 bg-black/15 px-2 py-1 text-[6.5px] font-medium text-white backdrop-blur-sm"><Icone className="size-3" />{plataforma.titulo}</div>
          <div className="absolute inset-x-4 bottom-4"><p className="max-w-[260px] text-[15px] font-bold uppercase leading-[1.05] tracking-[-0.04em] text-white drop-shadow-sm">{publicacao.textoThumbnail || publicacao.titulo}</p></div>
        </div>
      </button>
      <div className="p-3.5">
        <div className="flex items-start gap-2">
          <button type="button" onClick={aoSelecionar} className="min-w-0 flex-1 text-left"><h3 className="truncate text-[10px] font-semibold text-[#303636]">{publicacao.titulo}</h3><p className="mt-1 line-clamp-2 text-[7.5px] leading-3.5 text-[#858d8d]">{publicacao.descricao}</p></button>
          <button type="button" onClick={aoFavoritar} className="foco-acessivel grid size-7 shrink-0 place-items-center rounded-md text-[#929999] hover:bg-[#f2f4f4]" aria-label="Alternar favorito"><Star className={juntarClasses("size-3.5", publicacao.favorito && "fill-[#d6a23d] text-[#d6a23d]")} /></button>
        </div>
        <div className="mt-3 flex flex-wrap gap-1">{publicacao.hashtags.slice(0, 3).map((tag) => <span key={tag} className="rounded bg-[#f1f4f3] px-1.5 py-0.5 text-[6px] text-[#6f7878]">#{tag}</span>)}</div>
        <div className="mt-3 flex items-center justify-between border-t border-[#edf0ef] pt-2.5">
          <span className={`rounded px-2 py-1 text-[6.5px] font-medium ${publicacao.status === "publicada" ? "bg-[#eaf6f1] text-[#1a7a65]" : publicacao.status === "agendada" ? "bg-[#eef3fb] text-[#4e6f9d]" : publicacao.status === "falha" ? "bg-[#fbefef] text-[#9a5b5b]" : "bg-[#f2f4f4] text-[#687171]"}`}>{rotulosStatusPublicacao[publicacao.status]}</span>
          <span className="flex items-center gap-1 text-[6.5px] text-[#909797]">{publicacao.status === "publicada" && publicacao.linkPublicado ? <ExternalLink className="size-3" /> : <CalendarDays className="size-3" />}{formatarDataPublicacao(dataPrincipal)}</span>
          <MoreHorizontal className="size-3.5 text-[#9aa0a0]" />
        </div>
      </div>
    </article>
  );
}

import {
  Archive,
  Copy,
  MoreHorizontal,
  Play,
  Star,
  Trash2,
} from "lucide-react";

import { juntarClasses } from "@/lib/classes";
import type { TemplateStudio, VisualizacaoTemplates } from "@/types/templates";

function rotuloCategoria(categoria: TemplateStudio["categoria"]) {
  const mapa: Record<TemplateStudio["categoria"], string> = {
    curiosidades: "Curiosidades",
    lista: "Lista",
    historia: "História",
    noticia: "Notícia",
    educativo: "Educativo",
    promocional: "Promocional",
    documentario: "Documentário",
    "dark-lofi": "Dark Lo-fi",
    personalizado: "Personalizado",
  };
  return mapa[categoria];
}

export function CartaoTemplate({
  template,
  visualizacao,
  aoSelecionar,
  aoFavoritar,
  aoDuplicar,
  aoArquivar,
  aoExcluir,
  aoUsar,
}: {
  template: TemplateStudio;
  visualizacao: VisualizacaoTemplates;
  aoSelecionar: () => void;
  aoFavoritar: () => void;
  aoDuplicar: () => void;
  aoArquivar: () => void;
  aoExcluir: () => void;
  aoUsar: () => void;
}) {
  const configuracao = template.configuracao;

  if (visualizacao === "lista") {
    return (
      <article className="painel-superficie grid grid-cols-[44px_minmax(0,1fr)_110px_82px_118px_130px] items-center gap-3 rounded-md px-3 py-2.5">
        <button
          type="button"
          onClick={aoSelecionar}
          className="foco-acessivel grid size-10 place-items-center rounded-md border text-[9px] font-semibold text-white"
          style={{ backgroundColor: template.corDestaque, borderColor: template.corDestaque }}
          aria-label={`Abrir detalhes de ${template.nome}`}
        >
          {configuracao.formato}
        </button>
        <button type="button" onClick={aoSelecionar} className="min-w-0 text-left">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[10px] font-semibold text-[#2b3031]">{template.nome}</h3>
            {template.sistema && (
              <span className="rounded border border-[#dce5e3] bg-[#f6f9f8] px-1.5 py-0.5 text-[7px] text-[#778080]">Sistema</span>
            )}
          </div>
          <p className="mt-1 truncate text-[8px] text-[#8b9394]">{template.descricao}</p>
        </button>
        <span className="text-[8px] text-[#717a7b]">{rotuloCategoria(template.categoria)}</span>
        <span className="text-[8px] tabular-nums text-[#717a7b]">{template.usos} usos</span>
        <span className="truncate text-[8px] text-[#8a9293]">{configuracao.plataforma} · {configuracao.formato}</span>
        <div className="flex items-center justify-end gap-1">
          <button type="button" onClick={aoFavoritar} className="foco-acessivel grid size-7 place-items-center rounded text-[#7b8585] hover:bg-[#f0f3f3]" aria-label="Favoritar template">
            <Star className={juntarClasses("size-3.5", template.favorito && "fill-[#d39b36] text-[#d39b36]")} />
          </button>
          <button type="button" onClick={aoUsar} className="foco-acessivel inline-flex h-7 items-center gap-1 rounded-md bg-[#1f9b83] px-2.5 text-[8px] font-medium text-white hover:bg-[#18866f]">
            <Play className="size-3" /> Usar
          </button>
          <button type="button" onClick={aoSelecionar} className="foco-acessivel grid size-7 place-items-center rounded text-[#7b8585] hover:bg-[#f0f3f3]" aria-label="Mais opções">
            <MoreHorizontal className="size-3.5" />
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="painel-superficie group overflow-hidden rounded-md transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(24,37,34,.08)]">
      <button
        type="button"
        onClick={aoSelecionar}
        className="relative block h-[118px] w-full overflow-hidden border-b border-[#e5e9e8] text-left"
        style={{ background: `linear-gradient(135deg, ${template.corDestaque} 0%, #20292a 145%)` }}
      >
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.16)_1px,transparent_1px)] [background-size:28px_28px]" />
        <div className="absolute inset-x-4 bottom-3 flex items-end justify-between gap-4 text-white">
          <div>
            <p className="text-[7px] uppercase tracking-[0.12em] text-white/65">{rotuloCategoria(template.categoria)}</p>
            <p className="mt-1 text-[9px] font-medium">{configuracao.formato} · {configuracao.duracao}</p>
          </div>
          <span className="rounded border border-white/20 bg-black/10 px-2 py-1 text-[7px] backdrop-blur-sm">{configuracao.plataforma}</span>
        </div>
        {template.sistema && (
          <span className="absolute left-3 top-3 rounded border border-white/20 bg-black/15 px-2 py-1 text-[7px] text-white backdrop-blur-sm">Template do sistema</span>
        )}
      </button>

      <div className="p-3.5">
        <div className="flex items-start justify-between gap-3">
          <button type="button" onClick={aoSelecionar} className="min-w-0 flex-1 text-left">
            <h3 className="truncate text-[10.5px] font-semibold text-[#282d2e]">{template.nome}</h3>
            <p className="mt-1 line-clamp-2 min-h-8 text-[8px] leading-4 text-[#858e8f]">{template.descricao}</p>
          </button>
          <button type="button" onClick={aoFavoritar} className="foco-acessivel grid size-7 shrink-0 place-items-center rounded text-[#7b8585] hover:bg-[#f0f3f3]" aria-label="Favoritar template">
            <Star className={juntarClasses("size-3.5", template.favorito && "fill-[#d39b36] text-[#d39b36]")} />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          {template.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded border border-[#e2e7e6] bg-[#f8fafa] px-1.5 py-0.5 text-[7px] text-[#778080]">{tag}</span>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-[#edf0ef] pt-3">
          <span className="text-[7.5px] text-[#8d9697]">{template.usos} usos · {configuracao.quantidadeVersoes} versão</span>
          <div className="flex items-center gap-1">
            <button type="button" onClick={aoDuplicar} className="foco-acessivel grid size-7 place-items-center rounded text-[#788182] hover:bg-[#f1f4f4]" aria-label="Duplicar template">
              <Copy className="size-3.5" />
            </button>
            {!template.sistema && (
              template.status === "arquivado" ? (
                <button type="button" onClick={aoExcluir} className="foco-acessivel grid size-7 place-items-center rounded text-[#9a6666] hover:bg-[#f8eeee]" aria-label="Excluir template">
                  <Trash2 className="size-3.5" />
                </button>
              ) : (
                <button type="button" onClick={aoArquivar} className="foco-acessivel grid size-7 place-items-center rounded text-[#788182] hover:bg-[#f1f4f4]" aria-label="Arquivar template">
                  <Archive className="size-3.5" />
                </button>
              )
            )}
            <button type="button" onClick={aoUsar} disabled={template.status === "arquivado"} className="foco-acessivel inline-flex h-7 items-center gap-1 rounded-md bg-[#1f9b83] px-2.5 text-[8px] font-medium text-white hover:bg-[#18866f] disabled:cursor-not-allowed disabled:opacity-45">
              <Play className="size-3" /> Usar
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

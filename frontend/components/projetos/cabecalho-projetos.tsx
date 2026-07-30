import { Archive, FolderKanban, Heart, Plus, Video } from "lucide-react";

import { Botao } from "@/components/ui/botao";
import { conteudoProjetos } from "@/content/projetos";
import type { ProjetoStudio } from "@/types/projeto";

export function CabecalhoProjetos({ projetos, aoCriarProjeto }: { projetos: ProjetoStudio[]; aoCriarProjeto: () => void }) {
  const ativos = projetos.filter((projeto) => ["rascunho", "em-edicao", "pronto"].includes(projeto.status)).length;
  const favoritos = projetos.filter((projeto) => projeto.favorito && projeto.status !== "arquivado").length;
  const concluidos = projetos.filter((projeto) => projeto.status === "concluido").length;
  const arquivados = projetos.filter((projeto) => projeto.status === "arquivado").length;

  const metricas = [
    { rotulo: "Projetos ativos", valor: ativos, icone: FolderKanban },
    { rotulo: "Favoritos", valor: favoritos, icone: Heart },
    { rotulo: "Concluídos", valor: concluidos, icone: Video },
    { rotulo: "Arquivados", valor: arquivados, icone: Archive },
  ];

  return (
    <div className="border-b border-[#e4e8e8] bg-[#f7f8f9] px-8 pb-5 pt-5">
      <div className="flex items-start justify-between gap-8">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[19px] font-semibold tracking-[-0.025em] text-[#171a1b]">{conteudoProjetos.titulo}</h1>
            <span className="rounded border border-[#dce1e1] bg-white px-2 py-1 text-[9px] font-medium text-[#687071]">
              {conteudoProjetos.etiqueta}
            </span>
          </div>
          <p className="mt-2 max-w-[760px] text-[11.5px] leading-5 text-[#747c7d]">{conteudoProjetos.descricao}</p>
        </div>

        <Botao variante="primario" onClick={aoCriarProjeto} className="h-8 px-3">
          <Plus className="size-3.5" />
          {conteudoProjetos.acaoNovoProjeto}
        </Botao>
      </div>

      <div className="mt-5 grid max-w-[760px] grid-cols-4 divide-x divide-[#e4e8e8] overflow-hidden rounded-md border border-[#e1e6e6] bg-white">
        {metricas.map(({ rotulo, valor, icone: Icone }) => (
          <div key={rotulo} className="flex items-center gap-3 px-4 py-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-md bg-[#f0f4f3] text-[#71807d]">
              <Icone className="size-3.5" strokeWidth={1.7} />
            </span>
            <div>
              <strong className="block text-[14px] font-semibold tracking-[-0.02em] text-[#252a2b]">{valor}</strong>
              <span className="mt-0.5 block text-[8px] uppercase tracking-[0.055em] text-[#92999a]">{rotulo}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

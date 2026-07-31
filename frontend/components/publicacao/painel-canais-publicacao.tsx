import { Clapperboard, Plus } from "lucide-react";

import { filtrosPublicacao, plataformasPublicacao } from "@/data/publicacao";
import type { TarefaProducao } from "@/types/producao";
import type { FiltroPublicacoes, PublicacaoStudio } from "@/types/publicacao";

export function PainelCanaisPublicacao({
  publicacoes,
  selecionado,
  tarefasDisponiveis,
  aoSelecionar,
  aoCriarDeTarefa,
}: {
  publicacoes: PublicacaoStudio[];
  selecionado: FiltroPublicacoes;
  tarefasDisponiveis: TarefaProducao[];
  aoSelecionar: (filtro: FiltroPublicacoes) => void;
  aoCriarDeTarefa: (tarefa: TarefaProducao) => void;
}) {
  function totalFiltro(filtro: FiltroPublicacoes) {
    if (filtro === "todas") return publicacoes.filter((item) => item.status !== "arquivada").length;
    if (filtro === "rascunhos") return publicacoes.filter((item) => item.status === "rascunho").length;
    if (filtro === "prontas") return publicacoes.filter((item) => item.status === "pronta").length;
    if (filtro === "agendadas") return publicacoes.filter((item) => item.status === "agendada").length;
    if (filtro === "publicadas") return publicacoes.filter((item) => item.status === "publicada").length;
    if (filtro === "falhas") return publicacoes.filter((item) => item.status === "falha").length;
    if (filtro === "arquivadas") return publicacoes.filter((item) => item.status === "arquivada").length;
    return publicacoes.filter((item) => item.plataforma === filtro && item.status !== "arquivada").length;
  }

  return (
    <aside className="space-y-3">
      <section className="rounded-md border border-[#e0e5e4] bg-white p-2.5">
        <p className="px-2 pb-2 pt-1 text-[7.5px] font-semibold uppercase tracking-[0.08em] text-[#929999]">Organização</p>
        <div className="space-y-0.5">
          {filtrosPublicacao.map((filtro) => {
            const Icone = filtro.icone;
            return (
              <button key={filtro.id} type="button" onClick={() => aoSelecionar(filtro.id)} className={`foco-acessivel flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[8.5px] ${selecionado === filtro.id ? "bg-[#eaf5f2] font-medium text-[#176f5e]" : "text-[#5f6868] hover:bg-[#f3f5f5]"}`}>
                <Icone className="size-3.5" /><span className="flex-1">{filtro.titulo}</span><span className="text-[7px] text-[#9aa1a1]">{totalFiltro(filtro.id)}</span>
              </button>
            );
          })}
        </div>
        <p className="px-2 pb-2 pt-4 text-[7.5px] font-semibold uppercase tracking-[0.08em] text-[#929999]">Canais</p>
        <div className="space-y-0.5">
          {plataformasPublicacao.map((plataforma) => {
            const Icone = plataforma.icone;
            return (
              <button key={plataforma.id} type="button" onClick={() => aoSelecionar(plataforma.id)} className={`foco-acessivel flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[8.5px] ${selecionado === plataforma.id ? "bg-[#eaf5f2] font-medium text-[#176f5e]" : "text-[#5f6868] hover:bg-[#f3f5f5]"}`}>
                <Icone className="size-3.5" style={{ color: plataforma.cor }} /><span className="flex-1">{plataforma.titulo}</span><span className="text-[7px] text-[#9aa1a1]">{totalFiltro(plataforma.id)}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-md border border-[#e0e5e4] bg-white p-3">
        <div className="flex items-center gap-2"><Clapperboard className="size-3.5 text-[#1d8b74]" /><h3 className="text-[8.5px] font-semibold text-[#343a3a]">Vídeos prontos</h3><span className="ml-auto text-[7px] text-[#929999]">{tarefasDisponiveis.length}</span></div>
        <p className="mt-1 text-[7.5px] leading-3.5 text-[#8a9293]">Resultados concluídos ainda não adicionados ao planejamento.</p>
        <div className="mt-2.5 space-y-1.5">
          {tarefasDisponiveis.slice(0, 3).map((tarefa) => (
            <button key={tarefa.id} type="button" onClick={() => aoCriarDeTarefa(tarefa)} className="foco-acessivel flex w-full items-center gap-2 rounded-md border border-[#e5e9e8] p-2 text-left hover:border-[#b9d8d0] hover:bg-[#f6faf9]">
              <span className="grid size-7 shrink-0 place-items-center rounded bg-[#edf3f2] text-[#5c6d69]"><Plus className="size-3" /></span>
              <span className="min-w-0"><span className="block truncate text-[7.5px] font-medium text-[#3d4444]">{tarefa.nome}</span><span className="mt-0.5 block text-[6.5px] text-[#919899]">{tarefa.proporcao} · {tarefa.duracaoEstimada}</span></span>
            </button>
          ))}
          {tarefasDisponiveis.length === 0 && <p className="rounded-md bg-[#f7f9f9] px-2 py-2 text-center text-[7px] text-[#929999]">Nenhum vídeo novo aguardando.</p>}
        </div>
      </section>
    </aside>
  );
}

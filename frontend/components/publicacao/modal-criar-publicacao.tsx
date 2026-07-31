"use client";

import { Clapperboard, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Botao } from "@/components/ui/botao";
import { plataformasPublicacao } from "@/data/publicacao";
import type { ProjetoStudio } from "@/types/projeto";
import type { TarefaProducao } from "@/types/producao";
import type { DadosCriarPublicacao, PlataformaPublicacao } from "@/types/publicacao";

export function ModalCriarPublicacao({ projetos, tarefas, tarefaInicialId, aoFechar, aoCriar }: { projetos: ProjetoStudio[]; tarefas: TarefaProducao[]; tarefaInicialId?: string | null; aoFechar: () => void; aoCriar: (dados: DadosCriarPublicacao) => void }) {
  const [origem, setOrigem] = useState(tarefaInicialId ? `tarefa:${tarefaInicialId}` : "manual");
  const [plataforma, setPlataforma] = useState<PlataformaPublicacao>("instagram-reels");
  const [nome, setNome] = useState("");
  const tarefasConcluidas = useMemo(() => tarefas.filter((tarefa) => tarefa.status === "concluida"), [tarefas]);

  function enviar() {
    if (origem.startsWith("tarefa:")) aoCriar({ tarefaId: origem.replace("tarefa:", ""), plataforma, nome: nome || undefined });
    else if (origem.startsWith("projeto:")) aoCriar({ projetoId: origem.replace("projeto:", ""), plataforma, nome: nome || undefined });
    else aoCriar({ plataforma, nome: nome || "Nova publicação" });
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-[#17201f]/25 p-6 backdrop-blur-[1px]">
      <section className="w-full max-w-[590px] overflow-hidden rounded-md border border-[#dce3e1] bg-white shadow-[0_24px_70px_rgba(21,32,29,.2)]">
        <header className="flex items-start justify-between border-b border-[#e7ebea] px-5 py-4"><div><p className="text-[7px] font-semibold uppercase tracking-[0.08em] text-[#1d8b74]">Planejamento</p><h2 className="mt-1 text-[15px] font-semibold text-[#2f3535]">Criar publicação</h2><p className="mt-1 text-[8px] text-[#858d8d]">Comece por um vídeo concluído, um projeto ou um rascunho vazio.</p></div><button type="button" onClick={aoFechar} className="foco-acessivel grid size-8 place-items-center rounded-md text-[#778080] hover:bg-[#f1f3f3]" aria-label="Fechar"><X className="size-4" /></button></header>
        <div className="space-y-4 p-5">
          <label className="block"><span className="mb-1.5 block text-[7.5px] font-medium text-[#687171]">Origem do conteúdo</span><select value={origem} onChange={(evento) => setOrigem(evento.target.value)} className="h-9 w-full rounded-md border border-[#dfe5e4] bg-white px-3 text-[9px] outline-none focus:border-[#9fcfc4]"><option value="manual">Rascunho vazio</option>{tarefasConcluidas.map((tarefa) => <option key={tarefa.id} value={`tarefa:${tarefa.id}`}>Vídeo concluído · {tarefa.nome}</option>)}{projetos.filter((projeto) => projeto.status !== "arquivado").map((projeto) => <option key={projeto.id} value={`projeto:${projeto.id}`}>Projeto · {projeto.nome}</option>)}</select></label>
          <label className="block"><span className="mb-1.5 block text-[7.5px] font-medium text-[#687171]">Nome interno</span><input value={nome} onChange={(evento) => setNome(evento.target.value)} placeholder="Ex.: Campanha de produtividade — agosto" className="h-9 w-full rounded-md border border-[#dfe5e4] px-3 text-[9px] outline-none placeholder:text-[#a2a8a8] focus:border-[#9fcfc4]" /></label>
          <div><span className="mb-2 block text-[7.5px] font-medium text-[#687171]">Canal de destino</span><div className="grid grid-cols-2 gap-2">{plataformasPublicacao.map((item) => { const Icone=item.icone; return <button key={item.id} type="button" onClick={() => setPlataforma(item.id)} className={`foco-acessivel flex items-center gap-3 rounded-md border p-3 text-left ${plataforma === item.id ? "border-[#83bdae] bg-[#edf7f4]" : "border-[#e1e6e5] hover:bg-[#f8fafa]"}`}><span className="grid size-8 place-items-center rounded-md bg-white shadow-sm"><Icone className="size-4" style={{ color: item.cor }} /></span><span><span className="block text-[8.5px] font-medium text-[#353b3b]">{item.titulo}</span><span className="mt-0.5 block text-[7px] text-[#8a9293]">{item.descricao}</span></span></button>; })}</div></div>
          {tarefasConcluidas.length === 0 && <div className="flex items-center gap-2 rounded-md border border-[#e5e9e8] bg-[#fafbfb] p-3 text-[7.5px] text-[#7c8585]"><Clapperboard className="size-3.5" /> Ainda não há vídeos concluídos, mas você pode criar um rascunho.</div>}
        </div>
        <footer className="flex justify-end gap-2 border-t border-[#e7ebea] bg-[#fafbfb] px-5 py-3"><Botao onClick={aoFechar}>Cancelar</Botao><Botao variante="primario" onClick={enviar}><Plus className="size-3.5" /> Criar publicação</Botao></footer>
      </section>
    </div>
  );
}

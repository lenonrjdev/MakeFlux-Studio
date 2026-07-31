"use client";

import { FolderKanban, LayoutTemplate, Plus, X } from "lucide-react";
import { useState } from "react";

import { Botao } from "@/components/ui/botao";
import { categoriasTemplates, coresTemplates } from "@/data/templates";
import { juntarClasses } from "@/lib/classes";
import type { ProjetoStudio } from "@/types/projeto";
import type { CategoriaTemplate } from "@/types/templates";

export type DadosNovoTemplate = {
  nome: string;
  descricao: string;
  categoria: CategoriaTemplate;
  tags: string[];
  corDestaque: string;
  projetoId?: string;
};

export function ModalCriarTemplate({
  projetos,
  aoFechar,
  aoCriar,
}: {
  projetos: ProjetoStudio[];
  aoFechar: () => void;
  aoCriar: (dados: DadosNovoTemplate) => void;
}) {
  const [origem, setOrigem] = useState<"base" | "projeto">("base");
  const [projetoId, setProjetoId] = useState(projetos[0]?.id ?? "");
  const [nome, setNome] = useState("Meu novo template");
  const [descricao, setDescricao] = useState("Configuração reutilizável para novos projetos de vídeo.");
  const [categoria, setCategoria] = useState<CategoriaTemplate>("personalizado");
  const [tags, setTags] = useState("personalizado, produção");
  const [corDestaque, setCorDestaque] = useState(coresTemplates[0]);

  function confirmar() {
    aoCriar({
      nome,
      descricao,
      categoria,
      tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      corDestaque,
      projetoId: origem === "projeto" ? projetoId : undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#17201f]/35 p-6 backdrop-blur-[2px]">
      <section role="dialog" aria-modal="true" aria-labelledby="titulo-criar-template" className="w-full max-w-[640px] overflow-hidden rounded-lg border border-[#dfe5e4] bg-white shadow-[0_24px_80px_rgba(16,28,25,.24)]">
        <header className="flex items-start justify-between border-b border-[#e7ebea] px-5 py-4">
          <div>
            <div className="flex items-center gap-2 text-[8px] font-medium uppercase tracking-[0.08em] text-[#87908f]">
              <LayoutTemplate className="size-3" /> Novo preset
            </div>
            <h2 id="titulo-criar-template" className="mt-1.5 text-[15px] font-semibold tracking-[-0.025em] text-[#252a2b]">Criar template</h2>
            <p className="mt-1 text-[8.5px] text-[#858e8f]">Comece com os padrões do estúdio ou copie todas as escolhas de um projeto existente.</p>
          </div>
          <button type="button" onClick={aoFechar} className="foco-acessivel grid size-8 place-items-center rounded-md text-[#768080] hover:bg-[#f0f3f3]" aria-label="Fechar">
            <X className="size-4" />
          </button>
        </header>

        <div className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setOrigem("base")}
              className={juntarClasses(
                "foco-acessivel flex items-start gap-3 rounded-md border p-3 text-left transition",
                origem === "base" ? "border-[#9dcec2] bg-[#eff8f6]" : "border-[#e1e6e5] hover:bg-[#f8fafa]",
              )}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-md border border-[#dce6e3] bg-white text-[#4b7e72]"><Plus className="size-3.5" /></span>
              <span><strong className="block text-[9px] font-semibold text-[#343a3a]">Padrões do estúdio</strong><small className="mt-1 block text-[7.5px] leading-3.5 text-[#828b8c]">Cria um template limpo usando a configuração inicial.</small></span>
            </button>
            <button
              type="button"
              onClick={() => setOrigem("projeto")}
              className={juntarClasses(
                "foco-acessivel flex items-start gap-3 rounded-md border p-3 text-left transition",
                origem === "projeto" ? "border-[#9dcec2] bg-[#eff8f6]" : "border-[#e1e6e5] hover:bg-[#f8fafa]",
              )}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-md border border-[#dce6e3] bg-white text-[#4b7e72]"><FolderKanban className="size-3.5" /></span>
              <span><strong className="block text-[9px] font-semibold text-[#343a3a]">Projeto existente</strong><small className="mt-1 block text-[7.5px] leading-3.5 text-[#828b8c]">Copia roteiro, voz, legenda, música e exportação.</small></span>
            </button>
          </div>

          {origem === "projeto" && (
            <label className="block">
              <span className="mb-1.5 block text-[8px] font-medium text-[#697273]">Projeto de origem</span>
              <select value={projetoId} onChange={(evento) => setProjetoId(evento.target.value)} className="h-9 w-full rounded-md border border-[#dfe5e4] bg-white px-3 text-[9px] text-[#33393a] outline-none focus:border-[#9fcfc4]">
                {projetos.map((projeto) => <option key={projeto.id} value={projeto.id}>{projeto.nome}</option>)}
              </select>
              {projetos.length === 0 && <p className="mt-1.5 text-[7.5px] text-[#a26767]">Nenhum projeto disponível. Use os padrões do estúdio.</p>}
            </label>
          )}

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-[8px] font-medium text-[#697273]">Nome</span>
              <input value={nome} onChange={(evento) => setNome(evento.target.value)} className="h-9 w-full rounded-md border border-[#dfe5e4] px-3 text-[9px] outline-none focus:border-[#9fcfc4]" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[8px] font-medium text-[#697273]">Categoria</span>
              <select value={categoria} onChange={(evento) => setCategoria(evento.target.value as CategoriaTemplate)} className="h-9 w-full rounded-md border border-[#dfe5e4] bg-white px-3 text-[9px] outline-none focus:border-[#9fcfc4]">
                <option value="personalizado">Personalizado</option>
                {categoriasTemplates.map((item) => <option key={item.id} value={item.id}>{item.titulo}</option>)}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-[8px] font-medium text-[#697273]">Descrição</span>
            <textarea value={descricao} onChange={(evento) => setDescricao(evento.target.value)} rows={3} className="w-full resize-none rounded-md border border-[#dfe5e4] px-3 py-2 text-[9px] leading-4 outline-none focus:border-[#9fcfc4]" />
          </label>

          <div className="grid grid-cols-[minmax(0,1fr)_180px] gap-3">
            <label className="block">
              <span className="mb-1.5 block text-[8px] font-medium text-[#697273]">Tags separadas por vírgula</span>
              <input value={tags} onChange={(evento) => setTags(evento.target.value)} className="h-9 w-full rounded-md border border-[#dfe5e4] px-3 text-[9px] outline-none focus:border-[#9fcfc4]" />
            </label>
            <div>
              <span className="mb-1.5 block text-[8px] font-medium text-[#697273]">Cor de identificação</span>
              <div className="flex h-9 items-center gap-1.5 rounded-md border border-[#dfe5e4] px-2">
                {coresTemplates.map((cor) => (
                  <button key={cor} type="button" onClick={() => setCorDestaque(cor)} aria-label={`Usar cor ${cor}`} className={juntarClasses("size-5 rounded-full border-2", corDestaque === cor ? "border-[#202526]" : "border-white")} style={{ backgroundColor: cor }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-[#e7ebea] bg-[#fafbfb] px-5 py-3">
          <Botao onClick={aoFechar}>Cancelar</Botao>
          <Botao variante="primario" onClick={confirmar} disabled={!nome.trim() || (origem === "projeto" && !projetoId)}>
            <Plus className="size-3.5" /> Criar template
          </Botao>
        </footer>
      </section>
    </div>
  );
}

"use client";

import {
  Archive,
  Captions,
  Clapperboard,
  Copy,
  Download,
  FileText,
  Mic2,
  MonitorUp,
  Music2,
  Play,
  Save,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";

import { Botao } from "@/components/ui/botao";
import { categoriasTemplates, coresTemplates } from "@/data/templates";
import { juntarClasses } from "@/lib/classes";
import type { CategoriaTemplate, TemplateStudio } from "@/types/templates";

export function PainelDetalhesTemplate({
  template,
  aoFechar,
  aoAtualizar,
  aoFavoritar,
  aoDuplicar,
  aoArquivar,
  aoExcluir,
  aoExportar,
  aoUsar,
}: {
  template: TemplateStudio;
  aoFechar: () => void;
  aoAtualizar: (alteracoes: Partial<Pick<TemplateStudio, "nome" | "descricao" | "categoria" | "tags" | "corDestaque">>) => void;
  aoFavoritar: () => void;
  aoDuplicar: () => void;
  aoArquivar: () => void;
  aoExcluir: () => void;
  aoExportar: () => void;
  aoUsar: () => void;
}) {
  const [nome, setNome] = useState(template.nome);
  const [descricao, setDescricao] = useState(template.descricao);
  const [categoria, setCategoria] = useState<CategoriaTemplate>(template.categoria);
  const [tags, setTags] = useState(template.tags.join(", "));
  const [corDestaque, setCorDestaque] = useState(template.corDestaque);
  const configuracao = template.configuracao;

  const blocos = [
    { titulo: "Roteiro", valor: configuracao.modeloIa, detalhe: configuracao.promptRoteiro, icone: FileText },
    { titulo: "Materiais", valor: configuracao.fonteMateriais, detalhe: `${configuracao.cenas.length} cenas iniciais`, icone: Clapperboard },
    { titulo: "Narração", valor: configuracao.provedorVoz, detalhe: configuracao.voz, icone: Mic2 },
    { titulo: "Legendas", valor: configuracao.legendasAtivas ? configuracao.presetLegenda : "Desativadas", detalhe: configuracao.posicaoLegenda, icone: Captions },
    { titulo: "Música", valor: configuracao.musicaAtiva ? configuracao.musica : "Sem música", detalhe: `Volume ${configuracao.volumeMusica}%`, icone: Music2 },
    { titulo: "Exportação", valor: configuracao.qualidade, detalhe: `${configuracao.formato} · ${configuracao.codificador}`, icone: MonitorUp },
  ];

  function salvar() {
    aoAtualizar({
      nome,
      descricao,
      categoria,
      tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      corDestaque,
    });
  }

  return (
    <div className="fixed inset-0 z-[75] flex justify-end bg-[#17201f]/20 backdrop-blur-[1px]">
      <aside className="flex h-full w-[470px] flex-col border-l border-[#dce3e1] bg-white shadow-[-18px_0_50px_rgba(19,31,28,.13)]">
        <header className="flex items-start justify-between border-b border-[#e7ebea] px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[8px] font-medium uppercase tracking-[0.08em] text-[#86908f]">
              <span className="size-2 rounded-full" style={{ backgroundColor: template.corDestaque }} />
              {template.sistema ? "Template do sistema" : "Template personalizado"}
            </div>
            <h2 className="mt-1.5 truncate text-[15px] font-semibold tracking-[-0.025em] text-[#252a2b]">{template.nome}</h2>
            <p className="mt-1 text-[8px] text-[#8a9293]">{template.usos} usos · {template.status}</p>
          </div>
          <button type="button" onClick={aoFechar} className="foco-acessivel grid size-8 place-items-center rounded-md text-[#758080] hover:bg-[#f0f3f3]" aria-label="Fechar detalhes">
            <X className="size-4" />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <section className="overflow-hidden rounded-md border border-[#e0e5e4]">
            <div className="relative h-[128px]" style={{ background: `linear-gradient(135deg, ${template.corDestaque}, #20292a 145%)` }}>
              <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.16)_1px,transparent_1px)] [background-size:28px_28px]" />
              <div className="absolute inset-x-4 bottom-4 flex items-end justify-between text-white">
                <div>
                  <p className="text-[7px] uppercase tracking-[0.12em] text-white/60">{categoria}</p>
                  <p className="mt-1 text-[11px] font-semibold">{configuracao.formato} · {configuracao.duracao}</p>
                </div>
                <span className="rounded border border-white/20 bg-black/10 px-2 py-1 text-[7px]">{configuracao.plataforma}</span>
              </div>
            </div>
          </section>

          {!template.sistema ? (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[9px] font-semibold text-[#363c3c]">Identidade do template</h3>
                <span className="text-[7.5px] text-[#909899]">Editável</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1.5 block text-[7.5px] text-[#697273]">Nome</span>
                  <input value={nome} onChange={(evento) => setNome(evento.target.value)} className="h-9 w-full rounded-md border border-[#dfe5e4] px-3 text-[9px] outline-none focus:border-[#9fcfc4]" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[7.5px] text-[#697273]">Categoria</span>
                  <select value={categoria} onChange={(evento) => setCategoria(evento.target.value as CategoriaTemplate)} className="h-9 w-full rounded-md border border-[#dfe5e4] bg-white px-3 text-[9px] outline-none focus:border-[#9fcfc4]">
                    <option value="personalizado">Personalizado</option>
                    {categoriasTemplates.map((item) => <option key={item.id} value={item.id}>{item.titulo}</option>)}
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="mb-1.5 block text-[7.5px] text-[#697273]">Descrição</span>
                <textarea value={descricao} onChange={(evento) => setDescricao(evento.target.value)} rows={3} className="w-full resize-none rounded-md border border-[#dfe5e4] px-3 py-2 text-[9px] leading-4 outline-none focus:border-[#9fcfc4]" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[7.5px] text-[#697273]">Tags</span>
                <input value={tags} onChange={(evento) => setTags(evento.target.value)} className="h-9 w-full rounded-md border border-[#dfe5e4] px-3 text-[9px] outline-none focus:border-[#9fcfc4]" />
              </label>
              <div>
                <span className="mb-1.5 block text-[7.5px] text-[#697273]">Cor de identificação</span>
                <div className="flex gap-1.5">
                  {coresTemplates.map((cor) => (
                    <button key={cor} type="button" onClick={() => setCorDestaque(cor)} aria-label={`Selecionar cor ${cor}`} className={juntarClasses("size-6 rounded-full border-2", corDestaque === cor ? "border-[#202526]" : "border-white")} style={{ backgroundColor: cor }} />
                  ))}
                </div>
              </div>
              <Botao variante="primario" onClick={salvar} className="w-full">
                <Save className="size-3.5" /> Salvar alterações
              </Botao>
            </section>
          ) : (
            <section className="rounded-md border border-[#dfe6e3] bg-[#f6faf9] p-3 text-[8px] leading-4 text-[#667473]">
              Templates do sistema permanecem protegidos. Duplique este template para criar uma versão personalizada e editável.
            </section>
          )}

          <section>
            <h3 className="mb-2.5 text-[9px] font-semibold text-[#363c3c]">Configuração incluída</h3>
            <div className="grid grid-cols-2 gap-2">
              {blocos.map((bloco) => {
                const Icone = bloco.icone;
                return (
                  <article key={bloco.titulo} className="rounded-md border border-[#e2e7e6] bg-[#fafbfb] p-3">
                    <div className="flex items-center gap-2 text-[#667473]"><Icone className="size-3.5" /><span className="text-[7.5px] font-medium uppercase tracking-[0.05em]">{bloco.titulo}</span></div>
                    <p className="mt-2 truncate text-[8.5px] font-medium text-[#343a3a]">{bloco.valor}</p>
                    <p className="mt-1 line-clamp-2 text-[7.5px] leading-3.5 text-[#8a9293]">{bloco.detalhe}</p>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        <footer className="space-y-2 border-t border-[#e7ebea] bg-[#fafbfb] p-4">
          <Botao variante="primario" onClick={aoUsar} disabled={template.status === "arquivado"} className="w-full">
            <Play className="size-3.5" /> Usar no projeto
          </Botao>
          <div className="grid grid-cols-3 gap-2">
            <Botao onClick={aoFavoritar}><Star className={juntarClasses("size-3.5", template.favorito && "fill-[#d39b36] text-[#d39b36]")} /> Favorito</Botao>
            <Botao onClick={aoDuplicar}><Copy className="size-3.5" /> Duplicar</Botao>
            <Botao onClick={aoExportar}><Download className="size-3.5" /> Exportar</Botao>
          </div>
          {!template.sistema && (
            <div className="grid grid-cols-2 gap-2">
              <Botao onClick={aoArquivar}><Archive className="size-3.5" /> {template.status === "arquivado" ? "Restaurar" : "Arquivar"}</Botao>
              <Botao onClick={aoExcluir} className="border-[#eadada] text-[#9b5f5f] hover:bg-[#fbf2f2]"><Trash2 className="size-3.5" /> Excluir</Botao>
            </div>
          )}
        </footer>
      </aside>
    </div>
  );
}

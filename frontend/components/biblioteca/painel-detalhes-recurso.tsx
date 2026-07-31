"use client";

import {
  Captions,
  CheckCircle2,
  Copy,
  FileText,
  FolderOpen,
  Image,
  Mic2,
  Music2,
  PackageCheck,
  Pencil,
  Play,
  Star,
  Trash2,
  Type,
  Video,
  X,
} from "lucide-react";
import { useState } from "react";

import { Botao } from "@/components/ui/botao";
import { SeloStatus } from "@/components/ui/selo-status";
import { rotulosOrigemBiblioteca } from "@/data/biblioteca";
import { juntarClasses } from "@/lib/classes";
import type { ColecaoBiblioteca, RecursoBiblioteca } from "@/types/biblioteca";

const iconesTipo = {
  video: Video,
  imagem: Image,
  musica: Music2,
  narracao: Mic2,
  legenda: Captions,
  fonte: Type,
  prompt: FileText,
  exportacao: PackageCheck,
} as const;

export function PainelDetalhesRecurso({
  recurso,
  colecoes,
  aoFechar,
  aoAtualizar,
  aoFavoritar,
  aoDuplicar,
  aoExcluir,
  aoMover,
  aoUsarNoProjeto,
  aoCopiarCaminho,
}: {
  recurso: RecursoBiblioteca;
  colecoes: ColecaoBiblioteca[];
  aoFechar: () => void;
  aoAtualizar: (alteracoes: Partial<Pick<RecursoBiblioteca, "nome" | "descricao" | "tags">>) => void;
  aoFavoritar: () => void;
  aoDuplicar: () => void;
  aoExcluir: () => void;
  aoMover: (colecaoId?: string) => void;
  aoUsarNoProjeto: () => void;
  aoCopiarCaminho: () => void;
}) {
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(recurso.nome);
  const [descricao, setDescricao] = useState(recurso.descricao);
  const [tags, setTags] = useState(recurso.tags.join(", "));
  const Icone = iconesTipo[recurso.tipo];
  const podeUsar = !["exportacao", "fonte"].includes(recurso.tipo);

  function salvarEdicao() {
    aoAtualizar({
      nome: nome.trim() || recurso.nome,
      descricao: descricao.trim(),
      tags: tags.split(",").map((item) => item.trim()).filter(Boolean),
    });
    setEditando(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#15201e]/25 backdrop-blur-[1px]" onMouseDown={aoFechar}>
      <aside
        className="h-full w-[420px] overflow-y-auto border-l border-[#dce2e1] bg-white shadow-[-12px_0_35px_rgba(18,31,28,.12)]"
        onMouseDown={(evento) => evento.stopPropagation()}
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e4e8e8] bg-white px-5 py-4">
          <div>
            <span className="text-[8px] font-medium uppercase tracking-[0.07em] text-[#8a9293]">Recurso selecionado</span>
            <h2 className="mt-1 text-[12px] font-semibold text-[#2d3334]">Detalhes e organização</h2>
          </div>
          <button type="button" aria-label="Fechar" onClick={aoFechar} className="foco-acessivel grid size-8 place-items-center rounded text-[#778081] hover:bg-[#f1f4f3]">
            <X className="size-4" />
          </button>
        </header>

        <div className="space-y-5 p-5">
          <div className="grid h-48 place-items-center rounded-md border border-[#dde4e2] bg-gradient-to-br from-[#e0ebe8] to-[#f4f7f6] text-[#4f7c72]">
            <div className="text-center">
              <Icone className="mx-auto size-10" strokeWidth={1.35} />
              <span className="mt-3 block text-[8px] font-medium uppercase tracking-[0.08em]">{recurso.extensao}</span>
              {recurso.duracao && <span className="mt-1 block text-[8px] text-[#73817e]">{recurso.duracao}</span>}
            </div>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-[13px] font-semibold text-[#293031]">{recurso.nome}</h3>
              <p className="mt-1 text-[8.5px] leading-4 text-[#858d8e]">{recurso.descricao}</p>
            </div>
            <button
              type="button"
              onClick={aoFavoritar}
              className={juntarClasses(
                "foco-acessivel grid size-8 shrink-0 place-items-center rounded-md border",
                recurso.favorito ? "border-[#ded1a7] bg-[#fffaf0] text-[#b68f2f]" : "border-[#dfe4e3] text-[#7d8687]",
              )}
            >
              <Star className={juntarClasses("size-3.5", recurso.favorito && "fill-current")} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <SeloStatus texto={recurso.status === "disponivel" ? "Disponível" : recurso.status} tom={recurso.status === "disponivel" ? "verde" : "laranja"} />
            <SeloStatus texto={rotulosOrigemBiblioteca[recurso.origem]} tom="neutro" />
          </div>

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-[#e0e5e4] bg-[#e0e5e4]">
            {[
              ["Tipo", recurso.tipo],
              ["Tamanho", recurso.tamanhoRotulo],
              ["Dimensões", recurso.dimensoes ?? "—"],
              ["Duração", recurso.duracao ?? "—"],
              ["Usos", String(recurso.usos)],
              ["Projetos", String(recurso.projetoIds.length)],
            ].map(([rotulo, valor]) => (
              <div key={rotulo} className="bg-white px-3 py-2.5">
                <dt className="text-[7px] font-medium uppercase tracking-[0.05em] text-[#969d9e]">{rotulo}</dt>
                <dd className="mt-1 truncate text-[8.5px] font-medium text-[#4e5758]">{valor}</dd>
              </div>
            ))}
          </dl>

          <section>
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[8px] font-semibold uppercase tracking-[0.06em] text-[#7e8788]">Metadados</span>
              <button type="button" onClick={() => setEditando((atual) => !atual)} className="foco-acessivel flex items-center gap-1 rounded px-2 py-1 text-[8px] text-[#247d6a] hover:bg-[#edf6f3]">
                <Pencil className="size-3" /> {editando ? "Cancelar" : "Editar"}
              </button>
            </div>
            {editando ? (
              <div className="space-y-2 rounded-md border border-[#dfe5e4] bg-[#fafbfb] p-3">
                <input value={nome} onChange={(evento) => setNome(evento.target.value)} className="foco-acessivel h-8 w-full rounded border border-[#dce2e1] bg-white px-2.5 text-[9px]" />
                <textarea value={descricao} onChange={(evento) => setDescricao(evento.target.value)} rows={3} className="foco-acessivel w-full resize-none rounded border border-[#dce2e1] bg-white px-2.5 py-2 text-[9px] leading-4" />
                <input value={tags} onChange={(evento) => setTags(evento.target.value)} placeholder="Tags separadas por vírgula" className="foco-acessivel h-8 w-full rounded border border-[#dce2e1] bg-white px-2.5 text-[9px]" />
                <Botao variante="primario" className="h-8 w-full" onClick={salvarEdicao}>
                  <CheckCircle2 className="size-3.5" /> Salvar metadados
                </Botao>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {recurso.tags.map((tag) => (
                  <span key={tag} className="rounded border border-[#dde4e2] bg-[#f7f9f8] px-2 py-1 text-[7.5px] text-[#667170]">#{tag}</span>
                ))}
              </div>
            )}
          </section>

          <section>
            <span className="text-[8px] font-semibold uppercase tracking-[0.06em] text-[#7e8788]">Coleção</span>
            <select value={recurso.colecaoId ?? ""} onChange={(evento) => aoMover(evento.target.value || undefined)} className="foco-acessivel mt-2 h-9 w-full rounded border border-[#dfe4e3] bg-white px-2.5 text-[9px] text-[#596263]">
              <option value="">Sem coleção</option>
              {colecoes.map((colecao) => <option key={colecao.id} value={colecao.id}>{colecao.nome}</option>)}
            </select>
          </section>

          <section>
            <span className="text-[8px] font-semibold uppercase tracking-[0.06em] text-[#7e8788]">Local do arquivo</span>
            <button type="button" onClick={aoCopiarCaminho} className="foco-acessivel mt-2 flex w-full items-center gap-2 rounded-md border border-[#dfe4e3] bg-[#fafbfb] px-3 py-2.5 text-left text-[8px] text-[#697273] hover:bg-[#f3f6f5]">
              <FolderOpen className="size-3.5 shrink-0" />
              <span className="min-w-0 flex-1 truncate">{recurso.caminho}</span>
              <Copy className="size-3" />
            </button>
          </section>

          <div className="grid grid-cols-2 gap-2 border-t border-[#e5e9e8] pt-4">
            <Botao onClick={aoDuplicar}><Copy className="size-3.5" /> Duplicar</Botao>
            <Botao onClick={aoExcluir} className="text-[#a65349]"><Trash2 className="size-3.5" /> Excluir</Botao>
            <Botao variante="primario" disabled={!podeUsar} onClick={aoUsarNoProjeto} className="col-span-2">
              <Play className="size-3.5" /> {podeUsar ? "Usar em um projeto" : "Somente visualização"}
            </Botao>
          </div>
        </div>
      </aside>
    </div>
  );
}

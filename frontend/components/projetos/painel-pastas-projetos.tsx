"use client";

import { Archive, Clock3, Folder, FolderOpen, Heart, Plus, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";

import { BotaoSelecionarPasta } from "@/components/ui/botao-selecionar-pasta";
import { conteudoProjetos } from "@/content/projetos";
import { juntarClasses } from "@/lib/classes";
import type { PastaProjetoStudio, ProjetoStudio } from "@/types/projeto";

const limiteProjetosRecentesEm = Date.now() - 1000 * 60 * 60 * 48;

export type SelecaoPastaProjetos = "todos" | "favoritos" | "recentes" | "arquivados" | string;

export function PainelPastasProjetos({
  pastas,
  projetos,
  selecionada,
  aoSelecionar,
  aoCriarPasta,
  aoRemoverPasta,
}: {
  pastas: PastaProjetoStudio[];
  projetos: ProjetoStudio[];
  selecionada: SelecaoPastaProjetos;
  aoSelecionar: (id: SelecaoPastaProjetos) => void;
  aoCriarPasta: (nome: string) => void;
  aoRemoverPasta: (id: string) => void;
}) {
  const [criando, setCriando] = useState(false);
  const [nome, setNome] = useState("");

  function enviar(evento: FormEvent) {
    evento.preventDefault();
    if (!nome.trim()) return;
    aoCriarPasta(nome.trim());
    setNome("");
    setCriando(false);
  }

  const itensFixos = [
    { id: "todos", titulo: "Todos os projetos", icone: FolderOpen, total: projetos.length },
    { id: "favoritos", titulo: "Favoritos", icone: Heart, total: projetos.filter((item) => item.favorito).length },
    {
      id: "recentes",
      titulo: "Abertos recentemente",
      icone: Clock3,
      total: projetos.filter((item) => new Date(item.ultimaAberturaEm).getTime() >= limiteProjetosRecentesEm).length,
    },
    { id: "arquivados", titulo: "Arquivados", icone: Archive, total: projetos.filter((item) => item.status === "arquivado").length },
  ] as const;

  return (
    <aside className="painel-superficie self-start overflow-hidden rounded-md">
      <div className="border-b border-[#e7ebeb] bg-[#fafbfb] px-4 py-3.5">
        <h2 className="text-[10px] font-semibold text-[#303536]">{conteudoProjetos.painelPastasTitulo}</h2>
        <p className="mt-1 text-[8.5px] leading-4 text-[#8b9293]">{conteudoProjetos.painelPastasDescricao}</p>
      </div>

      <div className="p-2.5">
        <div className="space-y-0.5">
          {itensFixos.map(({ id, titulo, icone: Icone, total }) => (
            <button
              key={id}
              type="button"
              onClick={() => aoSelecionar(id)}
              className={juntarClasses(
                "foco-acessivel flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[10px] transition",
                selecionada === id ? "bg-[#edf4f2] font-medium text-[#1d685b]" : "text-[#626a6b] hover:bg-[#f3f5f5]",
              )}
            >
              <Icone className="size-3.5" strokeWidth={1.7} />
              <span className="min-w-0 flex-1 truncate">{titulo}</span>
              <span className="text-[8px] text-[#9aa1a2]">{total}</span>
            </button>
          ))}
        </div>

        <div className="my-3 border-t border-[#edf0f0]" />

        <div className="flex items-center justify-between px-2.5">
          <span className="text-[8px] font-medium uppercase tracking-[0.06em] text-[#989fa0]">Minhas pastas</span>
          <button
            type="button"
            onClick={() => setCriando(true)}
            aria-label="Criar nova pasta"
            className="foco-acessivel grid size-6 place-items-center rounded-md text-[#788081] hover:bg-[#f0f3f3]"
          >
            <Plus className="size-3.5" />
          </button>
        </div>

        {criando && (
          <form onSubmit={enviar} className="mt-2 rounded-md border border-[#dfe5e5] bg-[#fafbfb] p-2">
            <input
              autoFocus
              value={nome}
              onChange={(evento) => setNome(evento.target.value)}
              placeholder="Nome da pasta"
              className="foco-acessivel h-8 w-full rounded-md border border-[#dfe4e4] bg-white px-2.5 text-[9.5px] placeholder:text-[#a0a6a7]"
            />
            <div className="mt-2 flex justify-end gap-1.5">
              <button type="button" onClick={() => setCriando(false)} className="h-7 rounded-md px-2 text-[8.5px] text-[#788081] hover:bg-white">
                Cancelar
              </button>
              <button type="submit" className="h-7 rounded-md bg-[#238f79] px-2.5 text-[8.5px] font-medium text-white hover:bg-[#1c7c69]">
                Criar pasta
              </button>
            </div>
          </form>
        )}

        <div className="mt-1 space-y-0.5">
          {pastas.map((pasta) => {
            const total = projetos.filter((projeto) => projeto.pastaId === pasta.id).length;
            const ativa = selecionada === pasta.id;
            return (
              <div key={pasta.id} className="group flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => aoSelecionar(pasta.id)}
                  className={juntarClasses(
                    "foco-acessivel flex min-w-0 flex-1 items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[10px] transition",
                    ativa ? "bg-[#edf4f2] font-medium text-[#1d685b]" : "text-[#626a6b] hover:bg-[#f3f5f5]",
                  )}
                >
                  {ativa ? <FolderOpen className="size-3.5" /> : <Folder className="size-3.5" />}
                  <span className="min-w-0 flex-1 truncate">{pasta.nome}</span>
                  <span className="text-[8px] text-[#9aa1a2]">{total}</span>
                </button>
                {!pasta.fixa && (
                  <button
                    type="button"
                    onClick={() => aoRemoverPasta(pasta.id)}
                    aria-label={`Remover pasta ${pasta.nome}`}
                    className="foco-acessivel grid size-6 shrink-0 place-items-center rounded-md text-[#a0a6a7] opacity-0 hover:bg-[#f7eeee] hover:text-[#a95353] group-hover:opacity-100"
                  >
                    <Trash2 className="size-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-[#e7ebeb] bg-[#fafbfb] p-3">
        <strong className="block text-[8.5px] font-medium text-[#555d5e]">{conteudoProjetos.pastaWorkspaceTitulo}</strong>
        <p className="mt-1 text-[8px] leading-3.5 text-[#8e9596]">{conteudoProjetos.pastaWorkspaceDescricao}</p>
        <BotaoSelecionarPasta
          rotulo="Escolher pasta local"
          tituloDialogo="Escolha a pasta do workspace MakeFlux Studio"
          chaveArmazenamento="makeflux:pasta-workspace-projetos"
          className="mt-2.5 h-8 w-full justify-start px-2.5"
        />
      </div>
    </aside>
  );
}

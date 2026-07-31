"use client";

import { Clock3, Folder, FolderPlus, Layers3, Star, Trash2 } from "lucide-react";
import { useState } from "react";

import { Botao } from "@/components/ui/botao";
import { juntarClasses } from "@/lib/classes";
import type {
  ColecaoBiblioteca,
  RecursoBiblioteca,
  SelecaoColecaoBiblioteca,
} from "@/types/biblioteca";

const limiteRecentesBiblioteca = Date.now() - 1000 * 60 * 60 * 24 * 7;

export function PainelColecoesBiblioteca({
  colecoes,
  recursos,
  selecionada,
  aoSelecionar,
  aoCriar,
  aoRemover,
}: {
  colecoes: ColecaoBiblioteca[];
  recursos: RecursoBiblioteca[];
  selecionada: SelecaoColecaoBiblioteca;
  aoSelecionar: (selecao: SelecaoColecaoBiblioteca) => void;
  aoCriar: (nome: string) => void;
  aoRemover: (id: string) => void;
}) {
  const [criando, setCriando] = useState(false);
  const [nome, setNome] = useState("");
  const atalhos = [
    { id: "todos", titulo: "Todos os recursos", icone: Layers3, total: recursos.length },
    { id: "favoritos", titulo: "Favoritos", icone: Star, total: recursos.filter((item) => item.favorito).length },
    {
      id: "recentes",
      titulo: "Adicionados recentemente",
      icone: Clock3,
      total: recursos.filter((item) => new Date(item.criadoEm).getTime() >= limiteRecentesBiblioteca).length,
    },
    {
      id: "sem-colecao",
      titulo: "Sem coleção",
      icone: Folder,
      total: recursos.filter((item) => !item.colecaoId).length,
    },
  ] as const;

  function criarColecao() {
    if (!nome.trim()) return;
    aoCriar(nome);
    setNome("");
    setCriando(false);
  }

  return (
    <aside className="painel-superficie sticky top-[78px] overflow-hidden rounded-md">
      <div className="border-b border-[#e6eaea] bg-[#fafbfb] px-3.5 py-3">
        <span className="text-[8px] font-semibold uppercase tracking-[0.065em] text-[#7d8687]">
          Organização
        </span>
      </div>

      <div className="space-y-1 p-2">
        {atalhos.map((item) => {
          const Icone = item.icone;
          const ativa = selecionada === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => aoSelecionar(item.id)}
              className={juntarClasses(
                "foco-acessivel flex w-full items-center gap-2 rounded px-2.5 py-2 text-left transition",
                ativa ? "bg-[#eaf5f2] text-[#237b69]" : "text-[#626b6c] hover:bg-[#f3f5f5]",
              )}
            >
              <Icone className="size-3.5 shrink-0" />
              <span className="min-w-0 flex-1 truncate text-[9px] font-medium">{item.titulo}</span>
              <span className="text-[8px] tabular-nums text-[#969d9e]">{item.total}</span>
            </button>
          );
        })}
      </div>

      <div className="border-t border-[#e6eaea] px-3.5 py-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-[8px] font-semibold uppercase tracking-[0.065em] text-[#7d8687]">
            Minhas coleções
          </span>
          <button
            type="button"
            aria-label="Criar coleção"
            onClick={() => setCriando((atual) => !atual)}
            className="foco-acessivel grid size-6 place-items-center rounded text-[#687172] hover:bg-[#eef2f1] hover:text-[#238a74]"
          >
            <FolderPlus className="size-3.5" />
          </button>
        </div>

        {criando && (
          <div className="mb-2 rounded-md border border-[#dce3e2] bg-[#fafcfc] p-2">
            <input
              autoFocus
              value={nome}
              onChange={(evento) => setNome(evento.target.value)}
              onKeyDown={(evento) => {
                if (evento.key === "Enter") criarColecao();
                if (evento.key === "Escape") setCriando(false);
              }}
              placeholder="Nome da coleção"
              className="foco-acessivel h-8 w-full rounded border border-[#dce2e2] bg-white px-2.5 text-[9px] text-[#303637] placeholder:text-[#a1a7a8]"
            />
            <div className="mt-2 flex gap-1.5">
              <Botao className="h-7 flex-1 px-2 text-[9px]" onClick={() => setCriando(false)}>
                Cancelar
              </Botao>
              <Botao variante="primario" className="h-7 flex-1 px-2 text-[9px]" onClick={criarColecao}>
                Criar
              </Botao>
            </div>
          </div>
        )}

        <div className="space-y-1">
          {colecoes.map((colecao) => {
            const ativa = selecionada === colecao.id;
            const total = recursos.filter((item) => item.colecaoId === colecao.id).length;
            return (
              <div key={colecao.id} className="group flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => aoSelecionar(colecao.id)}
                  className={juntarClasses(
                    "foco-acessivel flex min-w-0 flex-1 items-center gap-2 rounded px-2.5 py-2 text-left transition",
                    ativa ? "bg-[#eaf5f2] text-[#237b69]" : "text-[#626b6c] hover:bg-[#f3f5f5]",
                  )}
                >
                  <Folder className="size-3.5 shrink-0" />
                  <span className="min-w-0 flex-1 truncate text-[9px] font-medium">{colecao.nome}</span>
                  <span className="text-[8px] tabular-nums text-[#969d9e]">{total}</span>
                </button>
                {!colecao.sistema && (
                  <button
                    type="button"
                    aria-label={`Remover ${colecao.nome}`}
                    onClick={() => aoRemover(colecao.id)}
                    className="foco-acessivel hidden size-6 place-items-center rounded text-[#9a7770] hover:bg-[#fbf1ef] hover:text-[#ac5145] group-hover:grid"
                  >
                    <Trash2 className="size-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

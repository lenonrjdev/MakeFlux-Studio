"use client";

import { ArrowUpDown, Grid2X2, List, Search } from "lucide-react";

import { juntarClasses } from "@/lib/classes";
import type {
  FiltroTipoBiblioteca,
  OrdenacaoBiblioteca,
  VisualizacaoBiblioteca,
} from "@/types/biblioteca";

export function BarraFiltrosBiblioteca({
  busca,
  tipo,
  ordenacao,
  visualizacao,
  total,
  aoBuscar,
  aoFiltrarTipo,
  aoOrdenar,
  aoMudarVisualizacao,
}: {
  busca: string;
  tipo: FiltroTipoBiblioteca;
  ordenacao: OrdenacaoBiblioteca;
  visualizacao: VisualizacaoBiblioteca;
  total: number;
  aoBuscar: (valor: string) => void;
  aoFiltrarTipo: (valor: FiltroTipoBiblioteca) => void;
  aoOrdenar: (valor: OrdenacaoBiblioteca) => void;
  aoMudarVisualizacao: (valor: VisualizacaoBiblioteca) => void;
}) {
  return (
    <div className="painel-superficie flex min-h-12 items-center gap-2 rounded-md px-3 py-2">
      <label className="relative min-w-[230px] flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#939a9b]" />
        <input
          value={busca}
          onChange={(evento) => aoBuscar(evento.target.value)}
          placeholder="Buscar por nome, tag, extensão ou origem"
          className="foco-acessivel h-8 w-full rounded border border-[#e0e5e5] bg-[#fafbfb] pl-8 pr-3 text-[9px] text-[#303637] placeholder:text-[#a0a7a8]"
        />
      </label>

      <select
        value={tipo}
        onChange={(evento) => aoFiltrarTipo(evento.target.value as FiltroTipoBiblioteca)}
        className="foco-acessivel h-8 rounded border border-[#e0e5e5] bg-white px-2.5 text-[9px] text-[#596263]"
      >
        <option value="todos">Todos os tipos</option>
        <option value="video">Vídeos</option>
        <option value="imagem">Imagens</option>
        <option value="musica">Músicas</option>
        <option value="narracao">Narrações</option>
        <option value="legenda">Legendas</option>
        <option value="fonte">Fontes</option>
        <option value="prompt">Prompts</option>
        <option value="exportacao">Exportações</option>
      </select>

      <label className="relative">
        <ArrowUpDown className="pointer-events-none absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-[#92999a]" />
        <select
          value={ordenacao}
          onChange={(evento) => aoOrdenar(evento.target.value as OrdenacaoBiblioteca)}
          className="foco-acessivel h-8 appearance-none rounded border border-[#e0e5e5] bg-white pl-7 pr-7 text-[9px] text-[#596263]"
        >
          <option value="recentes">Mais recentes</option>
          <option value="antigos">Mais antigos</option>
          <option value="nome-az">Nome A–Z</option>
          <option value="maiores">Maiores arquivos</option>
          <option value="mais-usados">Mais usados</option>
        </select>
      </label>

      <span className="whitespace-nowrap px-1.5 text-[8px] tabular-nums text-[#8f9697]">
        {total} resultados
      </span>

      <div className="flex rounded border border-[#e0e5e5] bg-[#fafbfb] p-0.5">
        {([
          { id: "grade", icone: Grid2X2, rotulo: "Grade" },
          { id: "lista", icone: List, rotulo: "Lista" },
        ] as const).map((item) => {
          const Icone = item.icone;
          return (
            <button
              key={item.id}
              type="button"
              aria-label={item.rotulo}
              onClick={() => aoMudarVisualizacao(item.id)}
              className={juntarClasses(
                "foco-acessivel grid size-7 place-items-center rounded text-[#7e8788]",
                visualizacao === item.id && "bg-white text-[#237f6c] shadow-sm",
              )}
            >
              <Icone className="size-3.5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

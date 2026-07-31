"use client";

import { ChevronRight, Database, LoaderCircle, Search } from "lucide-react";
import { useState } from "react";

import { Botao } from "@/components/ui/botao";
import type { FiltroRegistros, PaginaRegistros } from "@/types/desempenho";

import { ListaVirtualRegistros } from "./lista-virtual-registros";

export function ExploradorRegistros({
  pagina,
  carregando,
  aoConsultar,
}: {
  pagina: PaginaRegistros | null;
  carregando: boolean;
  aoConsultar: (filtro: FiltroRegistros) => Promise<PaginaRegistros | null>;
}) {
  const [termo, setTermo] = useState("");
  const [origem, setOrigem] = useState("");
  const [ordem, setOrdem] = useState<FiltroRegistros["ordem"]>("recentes");
  const [cursor, setCursor] = useState<string | null>(null);

  async function consultar(proximoCursor: string | null = null) {
    const resultado = await aoConsultar({ termo, origem, ordem, limite: 500, cursor: proximoCursor });
    setCursor(proximoCursor);
    return resultado;
  }

  return (
    <section className="rounded-md border border-[#e1e7e6] bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold text-[#303737]"><Database className="size-3.5 text-[#1d8b74]" /> Explorador paginado</div>
          <p className="mt-1 text-[8.5px] leading-4 text-[#87908f]">A consulta retorna somente a página solicitada; a lista renderiza apenas as linhas visíveis.</p>
        </div>
        <span className="rounded bg-[#eef6f3] px-2 py-1 text-[8px] font-medium text-[#277261]">{pagina?.total.toLocaleString("pt-BR") ?? 0} resultados</span>
      </div>

      <div className="my-3 grid grid-cols-[minmax(0,1fr)_155px_150px_auto] gap-2">
        <label className="relative">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#929a99]" />
          <input value={termo} onChange={(evento) => setTermo(evento.target.value)} placeholder="Buscar chave ou conteúdo" className="foco-acessivel h-9 w-full rounded-md border border-[#dfe5e4] bg-white pl-9 pr-3 text-[9px] text-[#3c4544]" />
        </label>
        <select value={origem} onChange={(evento) => setOrigem(evento.target.value)} className="foco-acessivel h-9 rounded-md border border-[#dfe5e4] bg-white px-3 text-[9px] text-[#56605f]">
          <option value="">Todas as origens</option><option value="localStorage">localStorage</option><option value="projetos">Projetos</option><option value="biblioteca">Biblioteca</option><option value="desempenho-teste">Dados de teste</option>
        </select>
        <select value={ordem} onChange={(evento) => setOrdem(evento.target.value as FiltroRegistros["ordem"])} className="foco-acessivel h-9 rounded-md border border-[#dfe5e4] bg-white px-3 text-[9px] text-[#56605f]">
          <option value="recentes">Mais recentes</option><option value="chave-asc">Chave A–Z</option><option value="maiores">Maiores primeiro</option>
        </select>
        <Botao variante="primario" onClick={() => void consultar(null)} disabled={carregando}>{carregando ? <LoaderCircle className="size-3.5 animate-spin" /> : <Search className="size-3.5" />} Consultar</Botao>
      </div>

      <div className="mb-1 grid grid-cols-[minmax(0,1.45fr)_110px_95px_125px] gap-3 px-3.5 text-[7.5px] font-semibold uppercase tracking-[0.08em] text-[#929a99]"><span>Chave</span><span>Origem</span><span>Tamanho</span><span className="text-right">Atualização</span></div>
      <ListaVirtualRegistros itens={pagina?.itens ?? []} />
      <div className="mt-3 flex items-center justify-between text-[8.5px] text-[#87908f]">
        <span>Página iniciada em {cursor ?? "0"} · consulta em {pagina?.duracaoMs.toFixed(1) ?? "0.0"} ms</span>
        <Botao onClick={() => pagina?.proximoCursor && void consultar(pagina.proximoCursor)} disabled={!pagina?.proximoCursor || carregando}>Próxima página <ChevronRight className="size-3.5" /></Botao>
      </div>
    </section>
  );
}

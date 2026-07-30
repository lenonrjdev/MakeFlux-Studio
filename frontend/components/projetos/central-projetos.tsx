"use client";

import { FolderPlus, Plus, SearchX } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Botao } from "@/components/ui/botao";
import { conteudoProjetos } from "@/content/projetos";
import { useProjetosLocais } from "@/hooks/use-projetos-locais";
import type {
  FiltroStatusProjetos,
  OrdenacaoProjetos,
  ProjetoStudio,
  StatusProjetoStudio,
  VisualizacaoProjetos,
} from "@/types/projeto";

import { BarraFiltrosProjetos } from "./barra-filtros-projetos";
import { CabecalhoProjetos } from "./cabecalho-projetos";
import { CartaoProjetoStudio } from "./cartao-projeto-studio";
import { ListaProjetosStudio } from "./lista-projetos-studio";
import { PainelDetalhesProjeto } from "./painel-detalhes-projeto";
import { PainelPastasProjetos, type SelecaoPastaProjetos } from "./painel-pastas-projetos";

const mapaFiltroUrl: Record<string, FiltroStatusProjetos> = {
  ativos: "ativos",
  rascunhos: "rascunhos",
  prontos: "prontos",
  concluidos: "concluidos",
  arquivados: "arquivados",
};

export function CentralProjetos() {
  const router = useRouter();
  const parametros = useSearchParams();
  const {
    projetos,
    pastas,
    carregado,
    criarProjeto,
    alternarFavorito,
    duplicarProjeto,
    arquivarProjeto,
    excluirProjeto,
    alterarStatus,
    criarPasta,
    removerPasta,
    moverProjeto,
    criarVersao,
    restaurarVersao,
    exportarProjeto,
  } = useProjetosLocais();

  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<FiltroStatusProjetos>("todos");
  const [ordenacao, setOrdenacao] = useState<OrdenacaoProjetos>("recentes");
  const [visualizacao, setVisualizacao] = useState<VisualizacaoProjetos>("grade");
  const [pastaSelecionada, setPastaSelecionada] = useState<SelecaoPastaProjetos>("todos");
  const [projetoSelecionadoId, setProjetoSelecionadoId] = useState<string | null>(null);

  useEffect(() => {
    const status = parametros.get("status");
    if (status && mapaFiltroUrl[status]) {
      setFiltro(mapaFiltroUrl[status]);
      if (status === "arquivados") setPastaSelecionada("arquivados");
    }
  }, [parametros]);

  const projetoSelecionado = projetos.find((projeto) => projeto.id === projetoSelecionadoId) ?? null;

  const projetosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const agora = Date.now();

    return [...projetos]
      .filter((projeto) => {
        if (pastaSelecionada === "favoritos" && !projeto.favorito) return false;
        if (pastaSelecionada === "recentes" && agora - new Date(projeto.ultimaAberturaEm).getTime() > 1000 * 60 * 60 * 48) return false;
        if (pastaSelecionada === "arquivados" && projeto.status !== "arquivado") return false;
        if (!["todos", "favoritos", "recentes", "arquivados"].includes(pastaSelecionada) && projeto.pastaId !== pastaSelecionada) return false;

        if (pastaSelecionada !== "arquivados" && filtro !== "arquivados" && projeto.status === "arquivado") return false;
        if (filtro === "ativos" && !["rascunho", "em-edicao", "pronto"].includes(projeto.status)) return false;
        if (filtro === "rascunhos" && projeto.status !== "rascunho") return false;
        if (filtro === "prontos" && projeto.status !== "pronto") return false;
        if (filtro === "concluidos" && projeto.status !== "concluido") return false;
        if (filtro === "arquivados" && projeto.status !== "arquivado") return false;

        if (!termo) return true;
        const plataforma = projeto.configuracao.plataforma.toLowerCase();
        return [projeto.nome, projeto.descricao, projeto.configuracao.tema, plataforma]
          .join(" ")
          .toLowerCase()
          .includes(termo);
      })
      .sort((a, b) => {
        if (ordenacao === "antigos") return new Date(a.atualizadoEm).getTime() - new Date(b.atualizadoEm).getTime();
        if (ordenacao === "nome-az") return a.nome.localeCompare(b.nome, "pt-BR");
        if (ordenacao === "progresso") return b.progresso - a.progresso;
        return new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime();
      });
  }, [busca, filtro, ordenacao, pastaSelecionada, projetos]);

  function novoProjeto() {
    const projeto = criarProjeto();
    router.push(`/criar-video?projeto=${encodeURIComponent(projeto.id)}`);
  }

  function criarNovaPasta(nome: string) {
    const pasta = criarPasta(nome);
    setPastaSelecionada(pasta.id);
  }

  function removerPastaComConfirmacao(id: string) {
    const pasta = pastas.find((item) => item.id === id);
    if (!pasta) return;
    if (window.confirm(`Remover a pasta “${pasta.nome}”? Os projetos continuarão disponíveis em “Todos os projetos”.`)) {
      removerPasta(id);
      setPastaSelecionada("todos");
    }
  }

  function arquivarOuRestaurar(id: string, arquivado: boolean) {
    if (arquivado) alterarStatus(id, "rascunho");
    else arquivarProjeto(id);
  }

  function excluirComConfirmacao(id: string) {
    const projeto = projetos.find((item) => item.id === id);
    if (!projeto) return;
    if (window.confirm(`Excluir definitivamente “${projeto.nome}”? Esta ação não pode ser desfeita.`)) {
      excluirProjeto(id);
      if (projetoSelecionadoId === id) setProjetoSelecionadoId(null);
    }
  }

  function criarVersaoDoSelecionado() {
    if (!projetoSelecionado) return;
    const numero = (projetoSelecionado.versoes[0]?.numero ?? 0) + 1;
    criarVersao(projetoSelecionado.id, `Versão ${numero}`);
  }

  function mudarStatusSelecionado(status: StatusProjetoStudio) {
    if (projetoSelecionado) alterarStatus(projetoSelecionado.id, status);
  }

  if (!carregado) {
    return (
      <div className="min-h-[calc(100vh-62px)] bg-[#f7f8f9] px-8 py-8">
        <div className="h-28 animate-pulse rounded-md border border-[#e2e7e6] bg-white" />
        <div className="mt-5 grid grid-cols-[220px_minmax(0,1fr)] gap-5">
          <div className="h-[520px] animate-pulse rounded-md border border-[#e2e7e6] bg-white" />
          <div className="h-[520px] animate-pulse rounded-md border border-[#e2e7e6] bg-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-62px)] bg-[#f7f8f9]">
      <CabecalhoProjetos projetos={projetos} aoCriarProjeto={novoProjeto} />

      <div className="grid grid-cols-[220px_minmax(0,1fr)] gap-5 px-8 py-5">
        <PainelPastasProjetos
          pastas={pastas}
          projetos={projetos}
          selecionada={pastaSelecionada}
          aoSelecionar={setPastaSelecionada}
          aoCriarPasta={criarNovaPasta}
          aoRemoverPasta={removerPastaComConfirmacao}
        />

        <main className="min-w-0 space-y-4">
          <BarraFiltrosProjetos
            busca={busca}
            filtro={filtro}
            ordenacao={ordenacao}
            visualizacao={visualizacao}
            total={projetosFiltrados.length}
            aoBuscar={setBusca}
            aoFiltrar={setFiltro}
            aoOrdenar={setOrdenacao}
            aoMudarVisualizacao={setVisualizacao}
          />

          {projetosFiltrados.length === 0 ? (
            <div className="painel-superficie flex min-h-[360px] flex-col items-center justify-center rounded-md px-6 text-center">
              <span className="grid size-12 place-items-center rounded-full bg-[#edf3f1] text-[#70807c]"><SearchX className="size-5" /></span>
              <h2 className="mt-4 text-[12px] font-semibold text-[#313637]">{conteudoProjetos.vazioTitulo}</h2>
              <p className="mt-1 max-w-[360px] text-[9px] leading-4 text-[#858d8e]">{conteudoProjetos.vazioDescricao}</p>
              <div className="mt-4 flex items-center gap-2">
                <Botao onClick={() => { setBusca(""); setFiltro("todos"); setPastaSelecionada("todos"); }}><FolderPlus className="size-3.5" /> Limpar filtros</Botao>
                <Botao variante="primario" onClick={novoProjeto}><Plus className="size-3.5" /> Novo projeto</Botao>
              </div>
            </div>
          ) : visualizacao === "grade" ? (
            <div className="grid grid-cols-3 gap-4 2xl:grid-cols-4">
              {projetosFiltrados.map((projeto) => (
                <CartaoProjetoStudio
                  key={projeto.id}
                  projeto={projeto}
                  pastas={pastas}
                  aoSelecionar={() => setProjetoSelecionadoId(projeto.id)}
                  aoFavoritar={() => alternarFavorito(projeto.id)}
                  aoDuplicar={() => duplicarProjeto(projeto.id)}
                  aoArquivar={() => arquivarOuRestaurar(projeto.id, projeto.status === "arquivado")}
                  aoExcluir={() => excluirComConfirmacao(projeto.id)}
                  aoMover={(pastaId) => moverProjeto(projeto.id, pastaId)}
                  aoExportar={() => exportarProjeto(projeto)}
                />
              ))}
            </div>
          ) : (
            <ListaProjetosStudio
              projetos={projetosFiltrados}
              pastas={pastas}
              aoSelecionar={(projeto: ProjetoStudio) => setProjetoSelecionadoId(projeto.id)}
              aoFavoritar={alternarFavorito}
              aoDuplicar={duplicarProjeto}
              aoArquivar={arquivarOuRestaurar}
              aoExcluir={excluirComConfirmacao}
              aoExportar={exportarProjeto}
            />
          )}
        </main>
      </div>

      {projetoSelecionado && (
        <PainelDetalhesProjeto
          projeto={projetoSelecionado}
          pastas={pastas}
          aoFechar={() => setProjetoSelecionadoId(null)}
          aoDuplicar={() => duplicarProjeto(projetoSelecionado.id)}
          aoArquivar={() => arquivarOuRestaurar(projetoSelecionado.id, projetoSelecionado.status === "arquivado")}
          aoMover={(pastaId) => moverProjeto(projetoSelecionado.id, pastaId)}
          aoMudarStatus={mudarStatusSelecionado}
          aoCriarVersao={criarVersaoDoSelecionado}
          aoRestaurarVersao={(versaoId) => restaurarVersao(projetoSelecionado.id, versaoId)}
          aoExportar={() => exportarProjeto(projetoSelecionado)}
        />
      )}
    </div>
  );
}

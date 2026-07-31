"use client";

import { CheckCircle2, CircleAlert, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { categoriasBiblioteca } from "@/data/biblioteca";
import { useBibliotecaLocal } from "@/hooks/use-biblioteca-local";
import { juntarClasses } from "@/lib/classes";
import type {
  FiltroTipoBiblioteca,
  OrdenacaoBiblioteca,
  SelecaoColecaoBiblioteca,
  VisualizacaoBiblioteca,
} from "@/types/biblioteca";

import { BarraFiltrosBiblioteca } from "./barra-filtros-biblioteca";
import { CabecalhoBiblioteca } from "./cabecalho-biblioteca";
import { EstadoVazioBiblioteca } from "./estado-vazio-biblioteca";
import { GradeRecursosBiblioteca } from "./grade-recursos-biblioteca";
import { PainelColecoesBiblioteca } from "./painel-colecoes-biblioteca";
import { PainelDetalhesRecurso } from "./painel-detalhes-recurso";
import { ResumoBiblioteca } from "./resumo-biblioteca";

const limiteRecursosRecentes = Date.now() - 1000 * 60 * 60 * 24 * 7;

export function CentralBiblioteca() {
  const router = useRouter();
  const {
    recursos,
    colecoes,
    pastaRaiz,
    carregado,
    importarArquivos,
    atualizarRecurso,
    alternarFavorito,
    moverRecurso,
    duplicarRecurso,
    excluirRecurso,
    criarColecao,
    removerColecao,
    definirPastaRaiz,
    sincronizar,
    prepararParaEstudio,
  } = useBibliotecaLocal();

  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState<FiltroTipoBiblioteca>("todos");
  const [ordenacao, setOrdenacao] = useState<OrdenacaoBiblioteca>("recentes");
  const [visualizacao, setVisualizacao] = useState<VisualizacaoBiblioteca>("grade");
  const [colecaoSelecionada, setColecaoSelecionada] = useState<SelecaoColecaoBiblioteca>("todos");
  const [recursoSelecionadoId, setRecursoSelecionadoId] = useState<string | null>(null);
  const [notificacao, setNotificacao] = useState<{ mensagem: string; tipo: "sucesso" | "aviso" } | null>(null);
  const temporizadorNotificacao = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (temporizadorNotificacao.current) window.clearTimeout(temporizadorNotificacao.current);
    };
  }, []);

  const recursoSelecionado = recursos.find((recurso) => recurso.id === recursoSelecionadoId) ?? null;

  const recursosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return [...recursos]
      .filter((recurso) => {
        if (colecaoSelecionada === "favoritos" && !recurso.favorito) return false;
        if (colecaoSelecionada === "recentes" && new Date(recurso.criadoEm).getTime() < limiteRecursosRecentes) return false;
        if (colecaoSelecionada === "sem-colecao" && recurso.colecaoId) return false;
        if (!["todos", "favoritos", "recentes", "sem-colecao"].includes(colecaoSelecionada) && recurso.colecaoId !== colecaoSelecionada) return false;
        if (tipo !== "todos" && recurso.tipo !== tipo) return false;
        if (!termo) return true;
        return [
          recurso.nome,
          recurso.descricao,
          recurso.extensao,
          recurso.origem,
          recurso.tags.join(" "),
        ].join(" ").toLowerCase().includes(termo);
      })
      .sort((a, b) => {
        if (ordenacao === "antigos") return new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime();
        if (ordenacao === "nome-az") return a.nome.localeCompare(b.nome, "pt-BR");
        if (ordenacao === "maiores") return b.tamanhoBytes - a.tamanhoBytes;
        if (ordenacao === "mais-usados") return b.usos - a.usos;
        return new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime();
      });
  }, [busca, colecaoSelecionada, ordenacao, recursos, tipo]);

  function notificar(mensagem: string, tipoNotificacao: "sucesso" | "aviso" = "sucesso") {
    if (temporizadorNotificacao.current) window.clearTimeout(temporizadorNotificacao.current);
    setNotificacao({ mensagem, tipo: tipoNotificacao });
    temporizadorNotificacao.current = window.setTimeout(() => setNotificacao(null), 3600);
  }

  function importar(arquivos: File[]) {
    const colecaoId = !["todos", "favoritos", "recentes", "sem-colecao"].includes(colecaoSelecionada)
      ? colecaoSelecionada
      : undefined;
    const tipoForcado = tipo === "todos" ? undefined : tipo;
    const importados = importarArquivos(
      arquivos.map((arquivo) => ({
        nome: arquivo.name,
        tamanho: arquivo.size,
        tipoMime: arquivo.type,
        atualizadoEm: arquivo.lastModified,
      })),
      colecaoId,
      tipoForcado,
    );
    notificar(`${importados.length} ${importados.length === 1 ? "recurso importado" : "recursos importados"} para a biblioteca.`);
  }

  function abrirImportador() {
    document.getElementById("entrada-recursos-biblioteca")?.click();
  }

  function sincronizarFontes() {
    const resultado = sincronizar();
    const total = resultado.producao.length + resultado.prompts.length;
    notificar(
      total > 0
        ? `${total} novos recursos sincronizados da Produção e do Laboratório de IA.`
        : "A biblioteca já está sincronizada com os módulos locais.",
    );
  }

  function criarNovaColecao(nome: string) {
    const colecao = criarColecao(nome);
    setColecaoSelecionada(colecao.id);
    notificar(`Coleção “${colecao.nome}” criada.`);
  }

  function removerColecaoComConfirmacao(id: string) {
    const colecao = colecoes.find((item) => item.id === id);
    if (!colecao) return;
    if (!window.confirm(`Remover a coleção “${colecao.nome}”? Os recursos não serão excluídos.`)) return;
    removerColecao(id);
    setColecaoSelecionada("todos");
    notificar("Coleção removida. Os recursos continuam disponíveis.");
  }

  function excluirComConfirmacao(id: string) {
    const recurso = recursos.find((item) => item.id === id);
    if (!recurso) return;
    if (!window.confirm(`Excluir “${recurso.nome}” da biblioteca? O arquivo físico não será apagado nesta fase.`)) return;
    excluirRecurso(id);
    if (recursoSelecionadoId === id) setRecursoSelecionadoId(null);
    notificar("Referência removida da biblioteca.");
  }

  function usarNoProjeto() {
    if (!recursoSelecionado) return;
    const transferencia = prepararParaEstudio(recursoSelecionado.id);
    if (!transferencia) {
      notificar("Este tipo de recurso não pode ser aplicado diretamente ao estúdio.", "aviso");
      return;
    }
    router.push("/criar-video?origem=biblioteca");
  }

  async function copiarCaminho() {
    if (!recursoSelecionado) return;
    try {
      await navigator.clipboard.writeText(recursoSelecionado.caminho);
      notificar("Caminho copiado para a área de transferência.");
    } catch {
      notificar("Não foi possível copiar o caminho automaticamente.", "aviso");
    }
  }

  function limparFiltros() {
    setBusca("");
    setTipo("todos");
    setColecaoSelecionada("todos");
  }

  if (!carregado) {
    return (
      <div className="min-h-[calc(100vh-62px)] bg-[#f7f8f9]">
        <div className="h-[150px] animate-pulse border-b border-[#e2e7e6] bg-white" />
        <div className="space-y-4 px-8 py-5">
          <div className="h-[92px] animate-pulse rounded-md border border-[#e2e7e6] bg-white" />
          <div className="grid grid-cols-[220px_minmax(0,1fr)] gap-5">
            <div className="h-[540px] animate-pulse rounded-md border border-[#e2e7e6] bg-white" />
            <div className="h-[540px] animate-pulse rounded-md border border-[#e2e7e6] bg-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-62px)] bg-[#f7f8f9]">
      <CabecalhoBiblioteca
        total={recursos.length}
        pastaRaiz={pastaRaiz}
        aoImportar={importar}
        aoSincronizar={sincronizarFontes}
        aoAlterarPasta={(pasta) => {
          definirPastaRaiz(pasta);
          notificar("Pasta raiz da biblioteca atualizada.");
        }}
      />

      <div className="space-y-4 px-8 py-5">
        <ResumoBiblioteca recursos={recursos} colecoes={colecoes} />

        <section className="painel-superficie flex items-center gap-1.5 overflow-x-auto rounded-md p-2">
          <button
            type="button"
            onClick={() => setTipo("todos")}
            className={juntarClasses(
              "foco-acessivel flex h-10 shrink-0 items-center gap-2 rounded-md border px-3 text-left transition",
              tipo === "todos" ? "border-[#aad4ca] bg-[#edf8f5] text-[#267a68]" : "border-transparent text-[#657071] hover:bg-[#f3f5f5]",
            )}
          >
            <Plus className="size-3.5" />
            <span className="text-[8.5px] font-medium">Todos</span>
            <span className="text-[7.5px] tabular-nums text-[#92999a]">{recursos.length}</span>
          </button>
          {categoriasBiblioteca.map((categoria) => {
            const Icone = categoria.icone;
            const total = recursos.filter((item) => item.tipo === categoria.id).length;
            return (
              <button
                key={categoria.id}
                type="button"
                onClick={() => setTipo(categoria.id)}
                className={juntarClasses(
                  "foco-acessivel flex h-10 shrink-0 items-center gap-2 rounded-md border px-3 text-left transition",
                  tipo === categoria.id ? "border-[#aad4ca] bg-[#edf8f5] text-[#267a68]" : "border-transparent text-[#657071] hover:bg-[#f3f5f5]",
                )}
              >
                <Icone className="size-3.5" />
                <span className="text-[8.5px] font-medium">{categoria.titulo}</span>
                <span className="text-[7.5px] tabular-nums text-[#92999a]">{total}</span>
              </button>
            );
          })}
        </section>

        <div className="grid grid-cols-[220px_minmax(0,1fr)] items-start gap-5">
          <PainelColecoesBiblioteca
            colecoes={colecoes}
            recursos={recursos}
            selecionada={colecaoSelecionada}
            aoSelecionar={setColecaoSelecionada}
            aoCriar={criarNovaColecao}
            aoRemover={removerColecaoComConfirmacao}
          />

          <main className="min-w-0 space-y-3">
            <BarraFiltrosBiblioteca
              busca={busca}
              tipo={tipo}
              ordenacao={ordenacao}
              visualizacao={visualizacao}
              total={recursosFiltrados.length}
              aoBuscar={setBusca}
              aoFiltrarTipo={setTipo}
              aoOrdenar={setOrdenacao}
              aoMudarVisualizacao={setVisualizacao}
            />

            {recursosFiltrados.length > 0 ? (
              <GradeRecursosBiblioteca
                recursos={recursosFiltrados}
                colecoes={colecoes}
                visualizacao={visualizacao}
                aoSelecionar={setRecursoSelecionadoId}
                aoFavoritar={alternarFavorito}
                aoDuplicar={(id) => {
                  duplicarRecurso(id);
                  notificar("Referência duplicada na biblioteca.");
                }}
                aoExcluir={excluirComConfirmacao}
                aoMover={moverRecurso}
              />
            ) : (
              <EstadoVazioBiblioteca aoLimpar={limparFiltros} aoImportar={abrirImportador} />
            )}
          </main>
        </div>
      </div>

      {recursoSelecionado && (
        <PainelDetalhesRecurso
          recurso={recursoSelecionado}
          colecoes={colecoes}
          aoFechar={() => setRecursoSelecionadoId(null)}
          aoAtualizar={(alteracoes) => atualizarRecurso(recursoSelecionado.id, alteracoes)}
          aoFavoritar={() => alternarFavorito(recursoSelecionado.id)}
          aoDuplicar={() => {
            duplicarRecurso(recursoSelecionado.id);
            notificar("Referência duplicada na biblioteca.");
          }}
          aoExcluir={() => excluirComConfirmacao(recursoSelecionado.id)}
          aoMover={(colecaoId) => moverRecurso(recursoSelecionado.id, colecaoId)}
          aoUsarNoProjeto={usarNoProjeto}
          aoCopiarCaminho={copiarCaminho}
        />
      )}

      {notificacao && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-[70] flex max-w-[390px] items-start gap-2.5 rounded-md border bg-white px-3.5 py-3 text-[9.5px] leading-4 shadow-[0_12px_35px_rgba(20,29,27,.13)] ${
            notificacao.tipo === "aviso"
              ? "border-[#ead9cb] text-[#8b5e3b]"
              : "border-[#cce4de] text-[#276f60]"
          }`}
        >
          {notificacao.tipo === "aviso" ? (
            <CircleAlert className="mt-0.5 size-3.5 shrink-0" />
          ) : (
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" />
          )}
          {notificacao.mensagem}
        </div>
      )}

    </div>
  );
}

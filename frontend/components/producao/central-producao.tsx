"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { conteudoProducao } from "@/content/producao";
import { pesosPrioridade } from "@/data/producao";
import { useProducaoLocal } from "@/hooks/use-producao-local";
import type { FiltroTarefasProducao, PrioridadeTarefaProducao } from "@/types/producao";

import { BarraFiltrosProducao } from "./barra-filtros-producao";
import { CabecalhoProducao } from "./cabecalho-producao";
import { FilaRenderizacao } from "./fila-renderizacao";
import { MonitorRecursos } from "./monitor-recursos";
import { PainelDetalhesTarefa } from "./painel-detalhes-tarefa";
import { ResumoProducao } from "./resumo-producao";

const ordemStatus = {
  processando: 0,
  "na-fila": 1,
  pausada: 2,
  erro: 3,
  concluida: 4,
  cancelada: 5,
} as const;

export function CentralProducao() {
  const parametros = useSearchParams();
  const {
    tarefas,
    filaPausada,
    recursos,
    carregado,
    alternarFila,
    pausar,
    retomar,
    cancelar,
    tentarNovamente,
    duplicar,
    excluir,
    limparFinalizadas,
    alterarPrioridade,
    simularErro,
  } = useProducaoLocal();

  const tarefaInicial = parametros.get("tarefa");
  const filtroInformado = parametros.get("status") as FiltroTarefasProducao | null;
  const filtrosValidos: FiltroTarefasProducao[] = [
    "todas",
    "em-andamento",
    "na-fila",
    "concluidas",
    "erros",
    "canceladas",
  ];

  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<FiltroTarefasProducao>(
    filtroInformado && filtrosValidos.includes(filtroInformado) ? filtroInformado : "todas",
  );
  const [tarefaSelecionadaId, setTarefaSelecionadaId] = useState<string | null>(tarefaInicial);

  const tarefaSelecionada = tarefas.find((tarefa) => tarefa.id === tarefaSelecionadaId) ?? null;

  const tarefasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return [...tarefas]
      .filter((tarefa) => {
        if (filtro === "em-andamento" && !["processando", "pausada"].includes(tarefa.status)) return false;
        if (filtro === "na-fila" && tarefa.status !== "na-fila") return false;
        if (filtro === "concluidas" && tarefa.status !== "concluida") return false;
        if (filtro === "erros" && tarefa.status !== "erro") return false;
        if (filtro === "canceladas" && tarefa.status !== "cancelada") return false;
        if (!termo) return true;
        return [tarefa.nome, tarefa.descricao, tarefa.codificador, tarefa.formato]
          .join(" ")
          .toLowerCase()
          .includes(termo);
      })
      .sort((a, b) => {
        const status = ordemStatus[a.status] - ordemStatus[b.status];
        if (status !== 0) return status;
        const prioridade = pesosPrioridade[b.prioridade] - pesosPrioridade[a.prioridade];
        if (prioridade !== 0) return prioridade;
        return new Date(b.atualizadaEm).getTime() - new Date(a.atualizadaEm).getTime();
      });
  }, [busca, filtro, tarefas]);

  function excluirComConfirmacao(id: string) {
    const tarefa = tarefas.find((item) => item.id === id);
    if (!tarefa) return;
    if (window.confirm(`Remover “${tarefa.nome}” do histórico de produção?`)) {
      excluir(id);
      if (tarefaSelecionadaId === id) setTarefaSelecionadaId(null);
    }
  }

  function limparComConfirmacao() {
    if (window.confirm("Remover tarefas concluídas e canceladas do histórico?")) {
      limparFinalizadas();
      if (tarefaSelecionada && ["concluida", "cancelada"].includes(tarefaSelecionada.status)) {
        setTarefaSelecionadaId(null);
      }
    }
  }

  if (!carregado) {
    return (
      <div className="min-h-[calc(100vh-62px)] bg-[#f7f8f9]">
        <div className="h-[128px] animate-pulse border-b border-[#e2e7e6] bg-white" />
        <div className="space-y-4 px-8 py-5">
          <div className="h-[102px] animate-pulse rounded-md border border-[#e2e7e6] bg-white" />
          <div className="grid grid-cols-[minmax(0,1fr)_285px] gap-5">
            <div className="h-[480px] animate-pulse rounded-md border border-[#e2e7e6] bg-white" />
            <div className="h-[480px] animate-pulse rounded-md border border-[#e2e7e6] bg-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-62px)] bg-[#f7f8f9]">
      <CabecalhoProducao
        tarefas={tarefas}
        filaPausada={filaPausada}
        aoAlternarFila={alternarFila}
        aoLimparFinalizadas={limparComConfirmacao}
      />

      <div className="space-y-4 px-8 py-5">
        <ResumoProducao tarefas={tarefas} />

        <div className="grid grid-cols-[minmax(0,1fr)_285px] items-start gap-5">
          <main className="min-w-0 space-y-3">
            <div>
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.045em] text-[#303637]">
                {conteudoProducao.filaTitulo}
              </h2>
              <p className="mt-1 text-[8.5px] text-[#8a9293]">{conteudoProducao.filaDescricao}</p>
            </div>
            <BarraFiltrosProducao
              filtro={filtro}
              busca={busca}
              total={tarefasFiltradas.length}
              aoFiltrar={setFiltro}
              aoBuscar={setBusca}
            />
            <FilaRenderizacao
              tarefas={tarefasFiltradas}
              aoSelecionar={setTarefaSelecionadaId}
              aoPausar={pausar}
              aoRetomar={retomar}
              aoCancelar={cancelar}
              aoTentarNovamente={tentarNovamente}
              aoDuplicar={duplicar}
              aoExcluir={excluirComConfirmacao}
              aoAlterarPrioridade={alterarPrioridade}
            />
          </main>

          <div className="sticky top-[78px]">
            <MonitorRecursos recursos={recursos} />
          </div>
        </div>
      </div>

      {tarefaSelecionada && (
        <PainelDetalhesTarefa
          tarefa={tarefaSelecionada}
          aoFechar={() => setTarefaSelecionadaId(null)}
          aoPausar={() => pausar(tarefaSelecionada.id)}
          aoRetomar={() => retomar(tarefaSelecionada.id)}
          aoCancelar={() => cancelar(tarefaSelecionada.id)}
          aoTentarNovamente={() => tentarNovamente(tarefaSelecionada.id)}
          aoDuplicar={() => duplicar(tarefaSelecionada.id)}
          aoExcluir={() => excluirComConfirmacao(tarefaSelecionada.id)}
          aoAlterarPrioridade={(prioridade: PrioridadeTarefaProducao) =>
            alterarPrioridade(tarefaSelecionada.id, prioridade)
          }
          aoSimularErro={() => simularErro(tarefaSelecionada.id)}
        />
      )}
    </div>
  );
}

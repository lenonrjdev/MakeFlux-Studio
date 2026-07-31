"use client";

import { CheckCircle2, CircleAlert } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useIntegracoesLocais } from "@/hooks/use-integracoes-locais";
import type {
  CategoriaIntegracao,
  FiltroIntegracoes,
  OrdenacaoIntegracoes,
} from "@/types/integracoes";

import { BarraFiltrosIntegracoes } from "./barra-filtros-integracoes";
import { CabecalhoIntegracoes } from "./cabecalho-integracoes";
import { EstadoVazioIntegracoes } from "./estado-vazio-integracoes";
import { GradeIntegracoes } from "./grade-integracoes";
import { PainelCategoriasIntegracoes } from "./painel-categorias-integracoes";
import { PainelDetalhesIntegracao } from "./painel-detalhes-integracao";
import { PainelModoProcessamento } from "./painel-modo-processamento";
import { PainelRuntimeNativo } from "./painel-runtime-nativo";
import { ResumoIntegracoes } from "./resumo-integracoes";

export function CentralIntegracoes() {
  const {
    integracoes,
    padroes,
    modoProcessamento,
    carregado,
    testandoIds,
    diagnosticandoTudo,
    definirModo,
    atualizar,
    limparCredencial,
    alternarAtiva,
    definirPadrao,
    testar,
    testarTudo,
    restaurar,
    restaurarCatalogo,
  } = useIntegracoesLocais();
  const [categoria, setCategoria] = useState<CategoriaIntegracao | "todas">("todas");
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<FiltroIntegracoes>("todas");
  const [ordenacao, setOrdenacao] = useState<OrdenacaoIntegracoes>("categoria");
  const [selecionadaId, setSelecionadaId] = useState<string | null>(null);
  const [notificacao, setNotificacao] = useState<{ mensagem: string; tipo: "sucesso" | "aviso" } | null>(null);
  const temporizadorNotificacao = useRef<number | null>(null);

  useEffect(() => () => {
    if (temporizadorNotificacao.current) window.clearTimeout(temporizadorNotificacao.current);
  }, []);

  const selecionada = integracoes.find((item) => item.id === selecionadaId) ?? null;

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const ordemStatus = { conectada: 0, atencao: 1, "nao-configurada": 2, indisponivel: 3 } as const;
    return [...integracoes]
      .filter((integracao) => {
        if (categoria !== "todas" && integracao.categoria !== categoria) return false;
        if (filtro === "conectadas" && integracao.status !== "conectada") return false;
        if (filtro === "nao-configuradas" && integracao.status !== "nao-configurada") return false;
        if (filtro === "atencao" && !["atencao", "indisponivel"].includes(integracao.status)) return false;
        if (filtro === "locais" && integracao.execucao !== "local") return false;
        if (filtro === "nuvem" && integracao.execucao !== "nuvem") return false;
        if (!termo) return true;
        return [
          integracao.nome,
          integracao.fornecedor,
          integracao.descricao,
          integracao.categoria,
          integracao.capacidades.join(" "),
          integracao.modelo,
        ].join(" ").toLowerCase().includes(termo);
      })
      .sort((a, b) => {
        if (ordenacao === "nome") return a.nome.localeCompare(b.nome, "pt-BR");
        if (ordenacao === "status") return ordemStatus[a.status] - ordemStatus[b.status];
        if (ordenacao === "recentes") return new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime();
        return a.categoria.localeCompare(b.categoria, "pt-BR") || a.nome.localeCompare(b.nome, "pt-BR");
      });
  }, [busca, categoria, filtro, integracoes, ordenacao]);

  function notificar(mensagem: string, tipo: "sucesso" | "aviso" = "sucesso") {
    if (temporizadorNotificacao.current) window.clearTimeout(temporizadorNotificacao.current);
    setNotificacao({ mensagem, tipo });
    temporizadorNotificacao.current = window.setTimeout(() => setNotificacao(null), 3800);
  }

  async function testarUma(id: string) {
    const resultado = await testar(id);
    if (!resultado) return;
    notificar(resultado.mensagem, resultado.sucesso ? "sucesso" : "aviso");
  }

  async function diagnosticarTudo() {
    const resultados = await testarTudo();
    const aprovadas = resultados.filter((item) => item.resultado.sucesso).length;
    const falhas = resultados.length - aprovadas;
    notificar(
      `Diagnóstico concluído: ${aprovadas} integrações prontas${falhas ? ` e ${falhas} com pendências` : ""}.`,
      falhas ? "aviso" : "sucesso",
    );
  }

  function limparFiltros() {
    setBusca("");
    setFiltro("todas");
    setCategoria("todas");
  }

  function restaurarTudo() {
    if (!window.confirm("Restaurar todas as integrações para o catálogo padrão?")) return;
    restaurarCatalogo();
    setSelecionadaId(null);
    notificar("Catálogo de integrações restaurado.");
  }

  if (!carregado) {
    return (
      <div className="min-h-[calc(100vh-62px)] bg-[#f7f8f9]">
        <div className="h-[148px] animate-pulse border-b border-[#e2e7e6] bg-white" />
        <div className="space-y-4 px-8 py-5">
          <div className="h-[82px] animate-pulse rounded-md border border-[#e2e7e6] bg-white" />
          <div className="h-[132px] animate-pulse rounded-md border border-[#e2e7e6] bg-white" />
          <div className="grid grid-cols-[220px_minmax(0,1fr)] gap-5">
            <div className="h-[560px] animate-pulse rounded-md border border-[#e2e7e6] bg-white" />
            <div className="h-[560px] animate-pulse rounded-md border border-[#e2e7e6] bg-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-62px)] bg-[#f7f8f9]">
      <CabecalhoIntegracoes
        conectadas={integracoes.filter((item) => item.status === "conectada" && item.ativa).length}
        total={integracoes.length}
        diagnosticando={diagnosticandoTudo}
        aoDiagnosticar={diagnosticarTudo}
      />
      <div className="space-y-4 px-8 py-5">
        <ResumoIntegracoes integracoes={integracoes} />
        <PainelRuntimeNativo
          integracao={integracoes.find((item) => item.id === "moneyprinter-turbo") ?? null}
          aoAtualizar={(dados) => atualizar("moneyprinter-turbo", dados)}
          aoNotificar={notificar}
        />
        <PainelModoProcessamento
          modo={modoProcessamento}
          integracoes={integracoes}
          padroes={padroes}
          aoMudarModo={(modo) => {
            definirModo(modo);
            notificar(`Modo ${modo} ativado.`);
          }}
          aoDefinirPadrao={(capacidade, id) => {
            definirPadrao(capacidade, id);
            notificar("Provedor padrão atualizado.");
          }}
        />
        <div className="grid grid-cols-[220px_minmax(0,1fr)] items-start gap-5">
          <PainelCategoriasIntegracoes
            integracoes={integracoes}
            selecionada={categoria}
            aoSelecionar={setCategoria}
            aoRestaurarCatalogo={restaurarTudo}
          />
          <main className="min-w-0 space-y-3">
            <BarraFiltrosIntegracoes
              busca={busca}
              filtro={filtro}
              ordenacao={ordenacao}
              total={filtradas.length}
              aoBuscar={setBusca}
              aoFiltrar={setFiltro}
              aoOrdenar={setOrdenacao}
            />
            {filtradas.length === 0 ? (
              <EstadoVazioIntegracoes aoLimpar={limparFiltros} />
            ) : (
              <GradeIntegracoes
                integracoes={filtradas}
                modo={modoProcessamento}
                padroes={padroes}
                testandoIds={testandoIds}
                aoSelecionar={setSelecionadaId}
                aoAlternarAtiva={(id) => {
                  alternarAtiva(id);
                  notificar("Estado da integração atualizado.");
                }}
                aoTestar={testarUma}
              />
            )}
          </main>
        </div>
      </div>

      {selecionada && (
        <PainelDetalhesIntegracao
          key={`${selecionada.id}-${selecionada.atualizadoEm}`}
          integracao={selecionada}
          padroes={padroes}
          testando={testandoIds.includes(selecionada.id)}
          aoFechar={() => setSelecionadaId(null)}
          aoAtualizar={(dados) => atualizar(selecionada.id, dados)}
          aoLimparCredencial={() => {
            limparCredencial(selecionada.id);
            notificar("Credencial removida.", "aviso");
          }}
          aoAlternarAtiva={() => {
            alternarAtiva(selecionada.id);
            notificar("Estado da integração atualizado.");
          }}
          aoTestar={() => testarUma(selecionada.id)}
          aoDefinirPadrao={(capacidade) => {
            definirPadrao(capacidade, selecionada.id);
            notificar("Integração definida como padrão.");
          }}
          aoRestaurar={() => {
            restaurar(selecionada.id);
            notificar("Configuração padrão restaurada.");
          }}
          aoNotificar={notificar}
        />
      )}

      {notificacao && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-[90] flex max-w-[410px] items-start gap-2.5 rounded-md border bg-white px-3.5 py-3 text-[9.5px] leading-4 shadow-[0_12px_35px_rgba(20,29,27,.13)] ${notificacao.tipo === "sucesso" ? "border-[#cee5df] text-[#286d5e]" : "border-[#eadfca] text-[#8d6b31]"}`}
        >
          {notificacao.tipo === "sucesso" ? <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" /> : <CircleAlert className="mt-0.5 size-3.5 shrink-0" />}
          {notificacao.mensagem}
        </div>
      )}
    </div>
  );
}

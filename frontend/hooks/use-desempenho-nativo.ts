"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  cancelarOperacaoLote,
  consultarStatusDesempenho,
  executarManutencaoBanco,
  iniciarOperacaoLote,
  listarOperacoesLote,
  listarRegistrosPaginados,
} from "@/lib/desempenho-nativo";
import type {
  FiltroRegistros,
  MetricasSessaoDesempenho,
  OperacaoLote,
  PaginaRegistros,
  ResultadoManutencao,
  SolicitacaoOperacaoLote,
  StatusDesempenhoBanco,
} from "@/types/desempenho";

const metricasIniciais: MetricasSessaoDesempenho = {
  paginasCarregadas: 0,
  registrosVisualizados: 0,
  ultimaConsultaMs: 0,
  maiorConsultaMs: 0,
};

export function useDesempenhoNativo() {
  const [status, setStatus] = useState<StatusDesempenhoBanco | null>(null);
  const [pagina, setPagina] = useState<PaginaRegistros | null>(null);
  const [operacoes, setOperacoes] = useState<OperacaoLote[]>([]);
  const [metricas, setMetricas] = useState(metricasIniciais);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const filtroAtual = useRef<FiltroRegistros>({ limite: 100, ordem: "recentes" });

  const atualizarStatus = useCallback(async () => {
    try {
      setStatus(await consultarStatusDesempenho());
      setOperacoes(await listarOperacoesLote());
    } catch (causa) {
      setErro(causa instanceof Error ? causa.message : "Falha ao consultar o desempenho local.");
    }
  }, []);

  const consultar = useCallback(async (filtro: FiltroRegistros = filtroAtual.current) => {
    setCarregando(true);
    setErro(null);
    filtroAtual.current = filtro;
    try {
      const resultado = await listarRegistrosPaginados(filtro);
      setPagina(resultado);
      setMetricas((anterior) => ({
        paginasCarregadas: anterior.paginasCarregadas + 1,
        registrosVisualizados: anterior.registrosVisualizados + resultado.itens.length,
        ultimaConsultaMs: resultado.duracaoMs,
        maiorConsultaMs: Math.max(anterior.maiorConsultaMs, resultado.duracaoMs),
      }));
      return resultado;
    } catch (causa) {
      setErro(causa instanceof Error ? causa.message : "Falha ao carregar os registros.");
      return null;
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    const inicial = window.setTimeout(() => {
      void atualizarStatus();
      void consultar();
    }, 0);
    return () => window.clearTimeout(inicial);
  }, [atualizarStatus, consultar]);

  useEffect(() => {
    const possuiAtiva = operacoes.some((item) => item.status === "aguardando" || item.status === "processando");
    if (!possuiAtiva) return;
    const intervalo = window.setInterval(() => void atualizarStatus(), 900);
    return () => window.clearInterval(intervalo);
  }, [atualizarStatus, operacoes]);

  const iniciarLote = useCallback(async (solicitacao: SolicitacaoOperacaoLote) => {
    setErro(null);
    const operacao = await iniciarOperacaoLote(solicitacao);
    setOperacoes((atuais) => [operacao, ...atuais.filter((item) => item.id !== operacao.id)]);
    return operacao;
  }, []);

  const cancelarLote = useCallback(async (id: string) => {
    const operacao = await cancelarOperacaoLote(id);
    setOperacoes((atuais) => atuais.map((item) => (item.id === id ? operacao : item)));
  }, []);

  const executarManutencao = useCallback(async (acao: ResultadoManutencao["acao"]) => {
    const resultado = await executarManutencaoBanco(acao);
    await atualizarStatus();
    return resultado;
  }, [atualizarStatus]);

  return {
    status,
    pagina,
    operacoes,
    metricas,
    carregando,
    erro,
    consultar,
    atualizarStatus,
    iniciarLote,
    cancelarLote,
    executarManutencao,
  };
}


"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  consultarResumoObservabilidade,
  exportarPacoteDiagnostico,
  limparLogsEstruturados,
  listarLogsEstruturados,
  registrarLogEstruturado,
  revelarPacoteDiagnostico,
} from "@/lib/observabilidade-nativa";
import { criarCorrelacaoId } from "@/lib/logger-estruturado";
import type {
  CorrelacaoResumo,
  FiltrosLogs,
  LogEstruturado,
  ResultadoExportacaoDiagnostico,
  ResumoObservabilidade,
} from "@/types/observabilidade";

const filtrosPadrao: FiltrosLogs = { nivel: "todos", origem: "todas", termo: "", correlacaoId: "", limite: 500 };

export function useObservabilidadeNativa() {
  const [logs, setLogs] = useState<LogEstruturado[]>([]);
  const [resumo, setResumo] = useState<ResumoObservabilidade | null>(null);
  const [filtros, setFiltros] = useState<FiltrosLogs>(filtrosPadrao);
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const [exportacao, setExportacao] = useState<ResultadoExportacaoDiagnostico | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(async (novosFiltros?: FiltrosLogs) => {
    setCarregando(true);
    try {
      const filtroAtual = novosFiltros ?? filtros;
      const [novosLogs, novoResumo] = await Promise.all([
        listarLogsEstruturados(filtroAtual),
        consultarResumoObservabilidade(),
      ]);
      setLogs(novosLogs);
      setResumo(novoResumo);
      setErro(null);
      setSelecionadoId((atual) => atual && novosLogs.some((log) => log.id === atual) ? atual : novosLogs[0]?.id ?? null);
    } catch (causa) {
      setErro(causa instanceof Error ? causa.message : "Falha ao carregar a observabilidade.");
    } finally {
      setCarregando(false);
    }
  }, [filtros]);

  useEffect(() => {
    const temporizador = window.setTimeout(() => void recarregar(), 0);
    return () => window.clearTimeout(temporizador);
  }, [recarregar]);

  const alterarFiltros = useCallback((novos: FiltrosLogs) => {
    setFiltros(novos);
    void recarregar(novos);
  }, [recarregar]);

  const limpar = useCallback(async (retencaoDias: number) => {
    const resultado = await limparLogsEstruturados(retencaoDias);
    await recarregar();
    return resultado;
  }, [recarregar]);

  const exportar = useCallback(async () => {
    const resultado = await exportarPacoteDiagnostico(2_000);
    setExportacao(resultado);
    await recarregar();
    return resultado;
  }, [recarregar]);

  const revelar = useCallback(async () => {
    if (!exportacao) return;
    await revelarPacoteDiagnostico(exportacao.caminho);
  }, [exportacao]);

  const registrarTeste = useCallback(async () => {
    await registrarLogEstruturado({
      nivel: "info",
      origem: "sistema",
      evento: "observabilidade.teste",
      mensagem: "Registro técnico de teste criado com sucesso.",
      correlacaoId: criarCorrelacaoId("teste"),
      contexto: { origem: "central-observabilidade", senha: "valor-que-deve-ser-mascarado" },
    });
    await recarregar();
  }, [recarregar]);

  const correlacoes = useMemo<CorrelacaoResumo[]>(() => {
    const mapa = new Map<string, CorrelacaoResumo>();
    for (const log of logs) {
      const atual = mapa.get(log.correlacaoId);
      if (!atual) {
        mapa.set(log.correlacaoId, {
          id: log.correlacaoId,
          total: 1,
          erros: log.nivel === "erro" ? 1 : 0,
          primeiroEm: log.criadoEm,
          ultimoEm: log.criadoEm,
          ultimoEvento: log.evento,
        });
      } else {
        atual.total += 1;
        atual.erros += log.nivel === "erro" ? 1 : 0;
        atual.primeiroEm = Math.min(atual.primeiroEm, log.criadoEm);
        if (log.criadoEm > atual.ultimoEm) {
          atual.ultimoEm = log.criadoEm;
          atual.ultimoEvento = log.evento;
        }
      }
    }
    return [...mapa.values()].sort((a, b) => b.ultimoEm - a.ultimoEm).slice(0, 12);
  }, [logs]);

  return {
    logs,
    resumo,
    filtros,
    correlacoes,
    selecionado: logs.find((log) => log.id === selecionadoId) ?? null,
    exportacao,
    carregando,
    erro,
    selecionar: setSelecionadoId,
    alterarFiltros,
    recarregar,
    limpar,
    exportar,
    revelar,
    registrarTeste,
  };
}

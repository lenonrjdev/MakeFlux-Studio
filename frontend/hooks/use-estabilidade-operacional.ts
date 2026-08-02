"use client";

import { useCallback, useEffect, useState } from "react";

import {
  consultarEstabilidade,
  definirModoSeguro,
  exportarRelatorioEstabilidade,
  limparCacheEstabilidade,
  listarIncidentesEstabilidade,
  marcarIncidenteRecuperado,
  repararBancoEstabilidade,
  revelarArtefatoEstabilidade,
  validarArquivosEstabilidade,
} from "@/lib/estabilidade-nativa";
import type {
  IncidenteEstabilidade,
  ResultadoExportacaoEstabilidade,
  ResultadoLimpezaCache,
  ResultadoReparoBanco,
  ResultadoValidacaoEstabilidade,
  StatusEstabilidade,
} from "@/types/estabilidade";

export function useEstabilidadeOperacional() {
  const [status, setStatus] = useState<StatusEstabilidade | null>(null);
  const [incidentes, setIncidentes] = useState<IncidenteEstabilidade[]>([]);
  const [validacao, setValidacao] = useState<ResultadoValidacaoEstabilidade | null>(null);
  const [reparo, setReparo] = useState<ResultadoReparoBanco | null>(null);
  const [limpeza, setLimpeza] = useState<ResultadoLimpezaCache | null>(null);
  const [relatorio, setRelatorio] = useState<ResultadoExportacaoEstabilidade | null>(null);
  const [operacao, setOperacao] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const executar = useCallback(async <T,>(nome: string, acao: () => Promise<T>) => {
    setOperacao(nome);
    setErro(null);
    try {
      return await acao();
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "A operação de estabilidade falhou.");
      return null;
    } finally {
      setOperacao(null);
    }
  }, []);

  const recarregar = useCallback(async () => {
    const resultado = await executar("recarregar", async () => {
      const [novoStatus, novosIncidentes] = await Promise.all([
        consultarEstabilidade(),
        listarIncidentesEstabilidade(100),
      ]);
      return { novoStatus, novosIncidentes };
    });
    if (resultado) {
      setStatus(resultado.novoStatus);
      setIncidentes(resultado.novosIncidentes);
    }
  }, [executar]);

  useEffect(() => {
    const temporizador = window.setTimeout(() => void recarregar(), 0);
    return () => window.clearTimeout(temporizador);
  }, [recarregar]);

  return {
    status,
    incidentes,
    validacao,
    reparo,
    limpeza,
    relatorio,
    operacao,
    erro,
    recarregar,
    alternarModoSeguro: useCallback(async (ativo: boolean) => {
      const resultado = await executar("modo-seguro", () => definirModoSeguro(ativo));
      if (resultado) setStatus(resultado);
      return resultado;
    }, [executar]),
    validar: useCallback(async () => {
      const resultado = await executar("validar", validarArquivosEstabilidade);
      if (resultado) setValidacao(resultado);
      return resultado;
    }, [executar]),
    reparar: useCallback(async () => {
      const resultado = await executar("reparar", repararBancoEstabilidade);
      if (resultado) {
        setReparo(resultado);
        setStatus(await consultarEstabilidade());
      }
      return resultado;
    }, [executar]),
    limparCache: useCallback(async (retencaoDias: number) => {
      const resultado = await executar("limpar-cache", () => limparCacheEstabilidade(retencaoDias));
      if (resultado) {
        setLimpeza(resultado);
        setStatus(await consultarEstabilidade());
      }
      return resultado;
    }, [executar]),
    exportar: useCallback(async () => {
      const resultado = await executar("exportar", exportarRelatorioEstabilidade);
      if (resultado) setRelatorio(resultado);
      return resultado;
    }, [executar]),
    revelar: useCallback(async (caminho: string) => executar("revelar", () => revelarArtefatoEstabilidade(caminho)), [executar]),
    marcarRecuperado: useCallback(async (incidenteId: string) => {
      const resultado = await executar(`incidente:${incidenteId}`, () => marcarIncidenteRecuperado(incidenteId));
      if (resultado) setIncidentes(resultado);
      return resultado;
    }, [executar]),
  };
}

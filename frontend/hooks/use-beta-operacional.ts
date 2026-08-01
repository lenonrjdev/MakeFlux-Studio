"use client";

import { useCallback, useEffect, useState } from "react";

import {
  atualizarCheckBeta,
  consultarBetaOperacional,
  criarSnapshotBeta,
  exportarRelatorioBeta,
  finalizarSessaoBeta,
  iniciarSessaoBeta,
  revelarArtefatoBeta,
} from "@/lib/beta-nativa";
import type { ArtefatoBeta, EntradaCheckBeta, EntradaSessaoBeta, PainelBetaOperacional } from "@/types/beta";

export function useBetaOperacional() {
  const [painel, setPainel] = useState<PainelBetaOperacional | null>(null);
  const [operacao, setOperacao] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [ultimoArtefato, setUltimoArtefato] = useState<ArtefatoBeta | null>(null);

  const recarregar = useCallback(async () => {
    setErro(null);
    try {
      setPainel(await consultarBetaOperacional());
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Falha ao consultar a homologação beta.");
    }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => void recarregar(), 0);
    return () => window.clearTimeout(id);
  }, [recarregar]);

  const executar = useCallback(async <T,>(nome: string, acao: () => Promise<T>) => {
    setOperacao(nome);
    setErro(null);
    try {
      return await acao();
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "A operação beta falhou.");
      return null;
    } finally {
      setOperacao(null);
    }
  }, []);

  return {
    painel,
    operacao,
    erro,
    ultimoArtefato,
    recarregar,
    iniciar: useCallback(async (entrada: EntradaSessaoBeta) => {
      const resultado = await executar("iniciar", () => iniciarSessaoBeta(entrada));
      if (resultado) setPainel(resultado);
      return resultado;
    }, [executar]),
    atualizarCheck: useCallback(async (entrada: EntradaCheckBeta) => {
      const resultado = await executar(`check:${entrada.checkId}`, () => atualizarCheckBeta(entrada));
      if (resultado) setPainel(resultado);
      return resultado;
    }, [executar]),
    finalizar: useCallback(async () => {
      const resultado = await executar("finalizar", finalizarSessaoBeta);
      if (resultado) setPainel(resultado);
      return resultado;
    }, [executar]),
    exportar: useCallback(async () => {
      const resultado = await executar("exportar", exportarRelatorioBeta);
      if (resultado) setUltimoArtefato(resultado);
      return resultado;
    }, [executar]),
    snapshot: useCallback(async () => {
      const resultado = await executar("snapshot", criarSnapshotBeta);
      if (resultado) setUltimoArtefato(resultado);
      return resultado;
    }, [executar]),
    revelar: useCallback(async (caminho: string) => executar("revelar", () => revelarArtefatoBeta(caminho)), [executar]),
  };
}

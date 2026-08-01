"use client";

import { useCallback, useEffect, useState } from "react";

import {
  consultarConfiguracaoArmazenamento,
  limparAtivosExpirados,
  listarAtivosTemporarios,
  removerAtivoTemporario,
  salvarConfiguracaoArmazenamento,
  testarConfiguracaoArmazenamento,
} from "@/lib/distribuicao-nativa";
import type { EntradaConfiguracaoArmazenamento } from "@/types/distribuicao";

export function useDistribuicaoRobusta() {
  const [configuracao, setConfiguracao] = useState<Awaited<
    ReturnType<typeof consultarConfiguracaoArmazenamento>
  > | null>(null);
  const [ativos, setAtivos] = useState<Awaited<
    ReturnType<typeof listarAtivosTemporarios>
  >>([]);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    try {
      const [novaConfiguracao, novosAtivos] = await Promise.all([
        consultarConfiguracaoArmazenamento(),
        listarAtivosTemporarios(),
      ]);
      setConfiguracao(novaConfiguracao);
      setAtivos(novosAtivos);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    const inicial = window.setTimeout(() => void recarregar(), 0);
    const periodico = window.setInterval(() => void recarregar(), 15_000);
    return () => {
      window.clearTimeout(inicial);
      window.clearInterval(periodico);
    };
  }, [recarregar]);

  return {
    configuracao,
    ativos,
    carregando,
    recarregar,
    salvar: useCallback(
      async (entrada: EntradaConfiguracaoArmazenamento) => {
        const resultado = await salvarConfiguracaoArmazenamento(entrada);
        setConfiguracao(resultado);
        return resultado;
      },
      [],
    ),
    testar: useCallback(async () => {
      const resultado = await testarConfiguracaoArmazenamento();
      setConfiguracao(resultado);
      return resultado;
    }, []),
    remover: useCallback(
      async (ativoId: string) => {
        await removerAtivoTemporario(ativoId);
        await recarregar();
      },
      [recarregar],
    ),
    limpar: useCallback(async () => {
      const resultado = await limparAtivosExpirados();
      await recarregar();
      return resultado;
    }, [recarregar]),
  };
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  consultarResumoUsoIa,
  listarExecucoesIa,
  listarProvedoresIa,
  removerCredencialProvedorIa,
  salvarConfiguracaoProvedorIa,
  salvarCredencialProvedorIa,
  testarProvedorIa,
} from "@/lib/provedores-ia-nativos";
import type {
  ConfiguracaoProvedorIa,
  EntradaConfiguracaoProvedorIa,
  IdProvedorIa,
  RegistroExecucaoIa,
  ResultadoTesteProvedorIa,
  ResumoUsoIa,
} from "@/types/provedores-ia";

export function useProvedoresIa() {
  const [provedores, setProvedores] = useState<ConfiguracaoProvedorIa[]>([]);
  const [execucoes, setExecucoes] = useState<RegistroExecucaoIa[]>([]);
  const [resumo, setResumo] = useState<ResumoUsoIa | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [operacao, setOperacao] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [ultimoTeste, setUltimoTeste] = useState<ResultadoTesteProvedorIa | null>(null);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [novosProvedores, novasExecucoes, novoResumo] = await Promise.all([
        listarProvedoresIa(), listarExecucoesIa(80), consultarResumoUsoIa(),
      ]);
      setProvedores(novosProvedores);
      setExecucoes(novasExecucoes);
      setResumo(novoResumo);
    } catch (causa) {
      setErro(causa instanceof Error ? causa.message : String(causa));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    const temporizador = window.setTimeout(() => void recarregar(), 0);
    return () => window.clearTimeout(temporizador);
  }, [recarregar]);

  const executarOperacao = useCallback(async <T,>(id: string, tarefa: () => Promise<T>) => {
    setOperacao(id);
    setErro(null);
    try {
      const resultado = await tarefa();
      await recarregar();
      return resultado;
    } catch (causa) {
      setErro(causa instanceof Error ? causa.message : String(causa));
      return null;
    } finally {
      setOperacao(null);
    }
  }, [recarregar]);

  const salvar = useCallback((configuracao: EntradaConfiguracaoProvedorIa, credencial?: string) =>
    executarOperacao(`salvar-${configuracao.id}`, async () => {
      await salvarConfiguracaoProvedorIa(configuracao);
      if (credencial?.trim()) await salvarCredencialProvedorIa(configuracao.id, credencial.trim());
    }), [executarOperacao]);

  const testar = useCallback((provedor: IdProvedorIa) =>
    executarOperacao(`testar-${provedor}`, async () => {
      const resultado = await testarProvedorIa(provedor);
      setUltimoTeste(resultado);
      return resultado;
    }), [executarOperacao]);

  const removerCredencial = useCallback((provedor: IdProvedorIa) =>
    executarOperacao(`remover-${provedor}`, () => removerCredencialProvedorIa(provedor)), [executarOperacao]);

  return {
    provedores, execucoes, resumo, carregando, operacao, erro, ultimoTeste,
    recarregar, salvar, testar, removerCredencial,
    prontos: useMemo(() => provedores.filter((item) => item.status === "pronto"), [provedores]),
  };
}

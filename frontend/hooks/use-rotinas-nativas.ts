"use client";

import { useCallback, useEffect, useState } from "react";

import {
  alterarStatusRotina,
  consultarStatusAgendador,
  enviarNotificacaoTeste,
  executarRotinaAgora,
  listarExecucoesRotinas,
  listarNotificacoesLocais,
  listarRotinasAgendadas,
  marcarNotificacaoLida,
  marcarTodasNotificacoesLidas,
  processarRotinasPendentes,
  removerNotificacoesLidas,
  removerRotinaAgendada,
  salvarRotinaAgendada,
  solicitarPermissaoNotificacoes,
} from "@/lib/rotinas-nativas";
import type { EntradaRotinaAgendada, ExecucaoRotina, NotificacaoLocal, RotinaAgendada, StatusAgendadorRotinas } from "@/types/rotinas";

export function useRotinasNativas() {
  const [rotinas, setRotinas] = useState<RotinaAgendada[]>([]);
  const [execucoes, setExecucoes] = useState<ExecucaoRotina[]>([]);
  const [notificacoes, setNotificacoes] = useState<NotificacaoLocal[]>([]);
  const [status, setStatus] = useState<StatusAgendadorRotinas | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    try {
      const [novasRotinas, novasExecucoes, novasNotificacoes, novoStatus] = await Promise.all([
        listarRotinasAgendadas(),
        listarExecucoesRotinas(),
        listarNotificacoesLocais(),
        consultarStatusAgendador(),
      ]);
      setRotinas(novasRotinas);
      setExecucoes(novasExecucoes);
      setNotificacoes(novasNotificacoes);
      setStatus(novoStatus);
      setErro(null);
    } catch (causa) {
      setErro(causa instanceof Error ? causa.message : "Falha ao carregar as rotinas locais.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    const inicial = window.setTimeout(() => void recarregar(), 0);
    const intervalo = window.setInterval(() => void recarregar(), 15_000);
    return () => {
      window.clearTimeout(inicial);
      window.clearInterval(intervalo);
    };
  }, [recarregar]);

  const salvar = useCallback(async (entrada: EntradaRotinaAgendada) => {
    const rotina = await salvarRotinaAgendada(entrada);
    await recarregar();
    return rotina;
  }, [recarregar]);

  const alternar = useCallback(async (id: string, ativa: boolean) => {
    await alterarStatusRotina(id, ativa);
    await recarregar();
  }, [recarregar]);

  const remover = useCallback(async (id: string) => {
    await removerRotinaAgendada(id);
    await recarregar();
  }, [recarregar]);

  const executar = useCallback(async (id: string) => {
    const execucao = await executarRotinaAgora(id);
    await recarregar();
    return execucao;
  }, [recarregar]);

  const processar = useCallback(async () => {
    const resultado = await processarRotinasPendentes();
    await recarregar();
    return resultado;
  }, [recarregar]);

  const lerNotificacao = useCallback(async (id: string) => {
    await marcarNotificacaoLida(id);
    await recarregar();
  }, [recarregar]);

  const lerTodas = useCallback(async () => {
    await marcarTodasNotificacoesLidas();
    await recarregar();
  }, [recarregar]);

  const limparLidas = useCallback(async () => {
    await removerNotificacoesLidas();
    await recarregar();
  }, [recarregar]);

  const testarNotificacao = useCallback(async () => {
    const permitida = await solicitarPermissaoNotificacoes();
    if (!permitida) throw new Error("A permissão de notificações não foi concedida.");
    await enviarNotificacaoTeste();
    await recarregar();
  }, [recarregar]);

  return {
    rotinas,
    execucoes,
    notificacoes,
    status,
    carregando,
    erro,
    recarregar,
    salvar,
    alternar,
    remover,
    executar,
    processar,
    lerNotificacao,
    lerTodas,
    limparLidas,
    testarNotificacao,
  };
}

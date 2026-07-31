"use client";

import { useCallback, useEffect, useState } from "react";

import {
  atualizarSecaoConfiguracoesLocal,
  baixarBackupLocal,
  carregarConfiguracoesLocais,
  criarConfiguracoesPadrao,
  configurarPinLocal,
  EVENTO_WORKSPACE_CONFIGURACOES,
  importarBackupLocal,
  limparDadosTemporariosLocais,
  medirUsoArmazenamentoLocal,
  removerPinLocal,
  restaurarSecaoConfiguracoesLocal,
  restaurarTodasConfiguracoesLocais,
  solicitarBloqueioAplicacao,
  verificarAtualizacoesLocal,
} from "@/lib/configuracoes-locais";
import type {
  ResultadoImportacaoBackup,
  SecaoConfiguracoes,
  UsoArmazenamentoLocal,
  WorkspaceConfiguracoes,
} from "@/types/configuracoes";

const workspaceInicial = criarConfiguracoesPadrao();

export function useConfiguracoesLocais() {
  const [workspace, setWorkspace] = useState<WorkspaceConfiguracoes>(workspaceInicial);
  const [carregado, setCarregado] = useState(false);
  const [usoArmazenamento, setUsoArmazenamento] = useState<UsoArmazenamentoLocal>({ totalBytes: 0, itens: [] });
  const [verificandoAtualizacoes, setVerificandoAtualizacoes] = useState(false);

  const recarregar = useCallback(() => {
    setWorkspace(carregarConfiguracoesLocais());
    setUsoArmazenamento(medirUsoArmazenamentoLocal());
    setCarregado(true);
  }, []);

  useEffect(() => {
    const temporizadorInicial = window.setTimeout(recarregar, 0);
    window.addEventListener(EVENTO_WORKSPACE_CONFIGURACOES, recarregar);
    window.addEventListener("storage", recarregar);
    return () => {
      window.clearTimeout(temporizadorInicial);
      window.removeEventListener(EVENTO_WORKSPACE_CONFIGURACOES, recarregar);
      window.removeEventListener("storage", recarregar);
    };
  }, [recarregar]);

  const atualizar = useCallback(
    <T extends SecaoConfiguracoes>(secao: T, dados: Partial<WorkspaceConfiguracoes[T]>) => {
      atualizarSecaoConfiguracoesLocal(secao, dados);
    },
    [],
  );

  const importarBackup = useCallback((conteudo: string, substituir = false): ResultadoImportacaoBackup => {
    const resultado = importarBackupLocal(conteudo, substituir);
    if (resultado.sucesso) recarregar();
    return resultado;
  }, [recarregar]);

  const limparTemporarios = useCallback(() => {
    const removidos = limparDadosTemporariosLocais();
    recarregar();
    return removidos;
  }, [recarregar]);

  const verificarAtualizacoes = useCallback(async () => {
    setVerificandoAtualizacoes(true);
    try {
      return await verificarAtualizacoesLocal();
    } finally {
      setVerificandoAtualizacoes(false);
    }
  }, []);

  return {
    workspace,
    carregado,
    usoArmazenamento,
    verificandoAtualizacoes,
    atualizar,
    restaurarSecao: useCallback((secao: SecaoConfiguracoes) => restaurarSecaoConfiguracoesLocal(secao), []),
    restaurarTudo: useCallback(() => restaurarTodasConfiguracoesLocais(), []),
    baixarBackup: useCallback(() => baixarBackupLocal(), []),
    importarBackup,
    limparTemporarios,
    configurarPin: useCallback((pin: string) => configurarPinLocal(pin), []),
    removerPin: useCallback(() => removerPinLocal(), []),
    bloquearAgora: useCallback(() => solicitarBloqueioAplicacao(), []),
    verificarAtualizacoes,
    recarregar,
  };
}

"use client";

import type { DownloadEvent, Update } from "@tauri-apps/plugin-updater";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  baixarPacoteAtualizacao,
  carregarWorkspaceAtualizador,
  consultarStatusAtualizadorNativo,
  criarRegistroHistoricoAtualizador,
  criarWorkspaceAtualizadorPadrao,
  EVENTO_WORKSPACE_ATUALIZADOR,
  instalarPacoteAtualizacao,
  reiniciarAposAtualizacao,
  salvarWorkspaceAtualizador,
  verificarAtualizacaoAssinada,
} from "@/lib/atualizador-assinado";
import type { StatusAtualizadorNativo, WorkspaceAtualizador } from "@/types/atualizador";

const workspaceInicial = criarWorkspaceAtualizadorPadrao();

export function useAtualizadorAssinado() {
  const [workspace, setWorkspace] = useState<WorkspaceAtualizador>(workspaceInicial);
  const [runtime, setRuntime] = useState<StatusAtualizadorNativo | null>(null);
  const [carregado, setCarregado] = useState(false);
  const workspaceRef = useRef(workspaceInicial);
  const updateRef = useRef<Update | null>(null);
  const bytesRef = useRef(0);
  const totalRef = useRef(0);

  const aplicar = useCallback((novo: WorkspaceAtualizador) => {
    workspaceRef.current = salvarWorkspaceAtualizador(novo);
    setWorkspace(workspaceRef.current);
  }, []);

  const alterar = useCallback((dados: Partial<WorkspaceAtualizador>) => {
    aplicar({ ...workspaceRef.current, ...dados });
  }, [aplicar]);

  const registrar = useCallback((
    dados: Parameters<typeof criarRegistroHistoricoAtualizador>[0],
  ) => {
    const registro = criarRegistroHistoricoAtualizador(dados);
    aplicar({
      ...workspaceRef.current,
      historico: [registro, ...workspaceRef.current.historico].slice(0, 50),
    });
  }, [aplicar]);

  const recarregar = useCallback(() => {
    const carregadoLocal = carregarWorkspaceAtualizador();
    workspaceRef.current = carregadoLocal;
    setWorkspace(carregadoLocal);
    setCarregado(true);
  }, []);

  useEffect(() => {
    const inicial = window.setTimeout(() => {
      recarregar();
      void consultarStatusAtualizadorNativo().then(setRuntime);
    }, 0);
    window.addEventListener(EVENTO_WORKSPACE_ATUALIZADOR, recarregar);
    return () => {
      window.clearTimeout(inicial);
      window.removeEventListener(EVENTO_WORKSPACE_ATUALIZADOR, recarregar);
      if (updateRef.current) void updateRef.current.close();
    };
  }, [recarregar]);

  const verificar = useCallback(async (rollback = false) => {
    if (!runtime?.configurado) {
      const mensagem = "O atualizador está desativado neste build. Gere uma distribuição assinada para habilitá-lo.";
      alterar({ status: "erro", mensagem, ultimaVerificacaoEm: new Date().toISOString() });
      registrar({ operacao: rollback ? "rollback" : "verificacao", resultado: "aviso", mensagem, versao: null });
      return null;
    }

    alterar({
      status: "verificando",
      mensagem: rollback ? "Procurando ponto de recuperação assinado..." : "Consultando o manifesto assinado...",
      progresso: 0,
      bytesBaixados: 0,
      totalBytes: 0,
    });

    try {
      if (updateRef.current) await updateRef.current.close();
      const alvo = rollback ? `rollback-${runtime.alvo}` : undefined;
      const resultado = await verificarAtualizacaoAssinada({ alvo, rollback });
      const verificadoEm = new Date().toISOString();
      updateRef.current = resultado.update;
      if (!resultado.update || !resultado.metadados) {
        const mensagem = rollback
          ? "Nenhum ponto de recuperação assinado foi publicado para este alvo."
          : `O MakeFlux Studio ${runtime.versaoAtual} já está atualizado.`;
        alterar({ status: "ocioso", mensagem, atualizacao: null, ultimaVerificacaoEm: verificadoEm });
        registrar({ operacao: rollback ? "rollback" : "verificacao", resultado: "sucesso", mensagem, versao: null });
        return null;
      }
      alterar({
        status: "disponivel",
        mensagem: rollback ? "Ponto de recuperação assinado disponível." : "Nova versão assinada disponível.",
        atualizacao: resultado.metadados,
        ultimaVerificacaoEm: verificadoEm,
      });
      registrar({
        operacao: rollback ? "rollback" : "verificacao",
        resultado: "sucesso",
        mensagem: rollback ? "Rollback assinado localizado." : "Atualização assinada localizada.",
        versao: resultado.metadados.versao,
      });
      return resultado.metadados;
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : String(erro);
      alterar({ status: "erro", mensagem, ultimaVerificacaoEm: new Date().toISOString() });
      registrar({ operacao: rollback ? "rollback" : "verificacao", resultado: "erro", mensagem, versao: null });
      return null;
    }
  }, [alterar, registrar, runtime]);

  const baixar = useCallback(async () => {
    const update = updateRef.current;
    if (!update || !workspaceRef.current.atualizacao) return;
    bytesRef.current = 0;
    totalRef.current = 0;
    alterar({ status: "baixando", mensagem: "Baixando e validando o pacote assinado...", progresso: 0 });
    try {
      await baixarPacoteAtualizacao(update, (evento: DownloadEvent) => {
        if (evento.event === "Started") {
          totalRef.current = evento.data.contentLength ?? 0;
          alterar({ totalBytes: totalRef.current, bytesBaixados: 0, progresso: 0 });
        }
        if (evento.event === "Progress") {
          bytesRef.current += evento.data.chunkLength;
          const progresso = totalRef.current > 0
            ? Math.min(100, Math.round((bytesRef.current / totalRef.current) * 100))
            : 0;
          alterar({ bytesBaixados: bytesRef.current, totalBytes: totalRef.current, progresso });
        }
        if (evento.event === "Finished") {
          alterar({ status: "pronto", progresso: 100, mensagem: "Download concluído e assinatura validada." });
        }
      });
      registrar({
        operacao: "download",
        resultado: "sucesso",
        mensagem: "Pacote baixado e validado.",
        versao: workspaceRef.current.atualizacao?.versao ?? null,
      });
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : String(erro);
      alterar({ status: "erro", mensagem });
      registrar({ operacao: "download", resultado: "erro", mensagem, versao: workspaceRef.current.atualizacao?.versao ?? null });
    }
  }, [alterar, registrar]);

  const instalar = useCallback(async () => {
    const update = updateRef.current;
    if (!update || !workspaceRef.current.atualizacao) return;
    const versao = workspaceRef.current.atualizacao.versao;
    alterar({ status: "instalando", mensagem: "Instalando a versão validada. O aplicativo será reiniciado..." });
    registrar({ operacao: "instalacao", resultado: "sucesso", mensagem: "Instalação iniciada.", versao });
    try {
      await instalarPacoteAtualizacao(update);
      alterar({ status: "concluido", mensagem: "Atualização instalada. Reiniciando o aplicativo..." });
      await reiniciarAposAtualizacao();
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : String(erro);
      alterar({ status: "erro", mensagem });
      registrar({ operacao: "instalacao", resultado: "erro", mensagem, versao });
    }
  }, [alterar, registrar]);

  const limparHistorico = useCallback(() => {
    alterar({ historico: [] });
  }, [alterar]);

  return {
    workspace,
    runtime,
    carregado,
    verificar,
    baixar,
    instalar,
    limparHistorico,
    alterarCanal: useCallback((canal: WorkspaceAtualizador["canal"]) => alterar({ canal }), [alterar]),
  };
}

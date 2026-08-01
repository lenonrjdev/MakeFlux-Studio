"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  concluirOauthCanal,
  desconectarCanal,
  iniciarOauthCanal,
  listarConexoesCanais,
  listarEnviosSociais,
  publicarEmCanal,
} from "@/lib/canais-publicacao-nativos";
import type {
  ConexaoCanalPublicacao,
  CredenciaisAplicativoCanal,
  EnvioPublicacaoSocial,
  EntradaPublicacaoSocial,
} from "@/types/canais-publicacao";

export function useCanaisPublicacao() {
  const [conexoes, setConexoes] = useState<ConexaoCanalPublicacao[]>([]);
  const [envios, setEnvios] = useState<EnvioPublicacaoSocial[]>([]);
  const [carregando, setCarregando] = useState(true);
  const intervaloOauth = useRef<number | null>(null);

  const recarregar = useCallback(async () => {
    try {
      const [novasConexoes, novosEnvios] = await Promise.all([listarConexoesCanais(), listarEnviosSociais()]);
      setConexoes(novasConexoes);
      setEnvios(novosEnvios);
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
      if (intervaloOauth.current) window.clearInterval(intervaloOauth.current);
    };
  }, [recarregar]);

  const conectar = useCallback(async (credenciais: CredenciaisAplicativoCanal) => {
    const inicio = await iniciarOauthCanal(credenciais);
    return new Promise<ConexaoCanalPublicacao>((resolve, reject) => {
      let tentativas = 0;
      intervaloOauth.current = window.setInterval(() => {
        tentativas += 1;
        void concluirOauthCanal(inicio.sessaoId, credenciais)
          .then((resultado) => {
            if (resultado.concluido && resultado.conexao) {
              if (intervaloOauth.current) window.clearInterval(intervaloOauth.current);
              intervaloOauth.current = null;
              void recarregar();
              resolve(resultado.conexao);
            } else if (!resultado.pendente) {
              throw new Error(resultado.mensagem);
            } else if (tentativas >= 180) {
              throw new Error("A autorização expirou antes de ser concluída.");
            }
          })
          .catch((erro: unknown) => {
            if (intervaloOauth.current) window.clearInterval(intervaloOauth.current);
            intervaloOauth.current = null;
            reject(erro instanceof Error ? erro : new Error(String(erro)));
          });
      }, 1_500);
    });
  }, [recarregar]);

  return {
    conexoes,
    envios,
    carregando,
    recarregar,
    conectar,
    desconectar: useCallback(async (provedor: CredenciaisAplicativoCanal["provedor"]) => {
      await desconectarCanal(provedor);
      await recarregar();
    }, [recarregar]),
    publicar: useCallback(async (entrada: EntradaPublicacaoSocial) => {
      const resultado = await publicarEmCanal(entrada);
      await recarregar();
      return resultado;
    }, [recarregar]),
  };
}

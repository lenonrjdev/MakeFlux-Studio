"use client";

import { Lock, Unlock } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Botao } from "@/components/ui/botao";
import {
  carregarConfiguracoesLocais,
  criarConfiguracoesPadrao,
  EVENTO_BLOQUEAR_APLICACAO,
  EVENTO_WORKSPACE_CONFIGURACOES,
  validarPinLocal,
} from "@/lib/configuracoes-locais";
import type { WorkspaceConfiguracoes } from "@/types/configuracoes";

export function ProvedorConfiguracoes({ children }: { children: ReactNode }) {
  const [configuracoes, setConfiguracoes] = useState<WorkspaceConfiguracoes>(criarConfiguracoesPadrao);
  const [bloqueado, setBloqueado] = useState(false);
  const [pin, setPin] = useState("");
  const [erro, setErro] = useState("");
  const [validando, setValidando] = useState(false);
  const temporizadorInatividade = useRef<number | null>(null);

  const aplicarPreferencias = useCallback((workspace: WorkspaceConfiguracoes) => {
    const raiz = document.documentElement;
    raiz.dataset.aparencia = "claro";
    raiz.dataset.temaPreferido = "claro";
    raiz.dataset.densidade = workspace.aparencia.densidade;
    raiz.dataset.escala = workspace.aparencia.escala;
    raiz.dataset.reduzirAnimacoes = String(workspace.aparencia.reduzirAnimacoes);
    raiz.dataset.altoContraste = String(workspace.aparencia.altoContraste);
    raiz.dataset.sidebarCompacta = String(workspace.aparencia.sidebarCompacta);
    raiz.style.colorScheme = "light";
  }, []);

  const recarregar = useCallback(() => {
    const workspace = carregarConfiguracoesLocais();
    setConfiguracoes(workspace);
    aplicarPreferencias(workspace);
  }, [aplicarPreferencias]);

  const reiniciarTemporizador = useCallback(() => {
    if (temporizadorInatividade.current) window.clearTimeout(temporizadorInatividade.current);
    if (!configuracoes.seguranca.bloqueioAtivo || !configuracoes.seguranca.pinHash) return;
    const minutos = Math.max(1, configuracoes.seguranca.bloquearAposMinutos);
    temporizadorInatividade.current = window.setTimeout(() => {
      setBloqueado(true);
      setPin("");
      setErro("");
    }, minutos * 60 * 1000);
  }, [configuracoes.seguranca.bloquearAposMinutos, configuracoes.seguranca.bloqueioAtivo, configuracoes.seguranca.pinHash]);

  useEffect(() => {
    const temporizadorInicial = window.setTimeout(() => {
      const workspace = carregarConfiguracoesLocais();
      setConfiguracoes(workspace);
      aplicarPreferencias(workspace);
      if (workspace.seguranca.bloqueioAtivo && workspace.seguranca.pinHash) setBloqueado(true);
    }, 0);
    window.addEventListener(EVENTO_WORKSPACE_CONFIGURACOES, recarregar);
    return () => {
      window.clearTimeout(temporizadorInicial);
      window.removeEventListener(EVENTO_WORKSPACE_CONFIGURACOES, recarregar);
    };
  }, [aplicarPreferencias, recarregar]);

  useEffect(() => {
    const bloquear = () => {
      if (!configuracoes.seguranca.bloqueioAtivo || !configuracoes.seguranca.pinHash) return;
      setBloqueado(true);
      setPin("");
      setErro("");
    };
    const eventos: Array<keyof WindowEventMap> = ["pointerdown", "keydown", "mousemove"];
    eventos.forEach((evento) => window.addEventListener(evento, reiniciarTemporizador, { passive: true }));
    window.addEventListener(EVENTO_BLOQUEAR_APLICACAO, bloquear);
    const temporizador = window.setTimeout(reiniciarTemporizador, 0);
    return () => {
      window.clearTimeout(temporizador);
      if (temporizadorInatividade.current) window.clearTimeout(temporizadorInatividade.current);
      eventos.forEach((evento) => window.removeEventListener(evento, reiniciarTemporizador));
      window.removeEventListener(EVENTO_BLOQUEAR_APLICACAO, bloquear);
    };
  }, [configuracoes.seguranca.bloqueioAtivo, configuracoes.seguranca.pinHash, reiniciarTemporizador]);

  async function desbloquear() {
    if (!pin) return;
    setValidando(true);
    setErro("");
    const valido = await validarPinLocal(pin, configuracoes.seguranca.pinHash);
    if (valido) {
      setBloqueado(false);
      setPin("");
      reiniciarTemporizador();
    } else {
      setErro("PIN incorreto. Tente novamente.");
    }
    setValidando(false);
  }

  return (
    <>
      {children}
      {bloqueado && (
        <div className="fixed inset-0 z-[200] grid place-items-center bg-[#edf1f0]/92 px-5 backdrop-blur-sm">
          <form
            onSubmit={(evento) => {
              evento.preventDefault();
              void desbloquear();
            }}
            className="w-full max-w-[380px] rounded-lg border border-[#dce3e1] bg-white p-6 text-[#202827] shadow-[0_30px_90px_rgba(31,46,42,.16)]"
          >
            <div className="grid size-11 place-items-center rounded-md bg-[#e7f4f0] text-[#24816d] ring-1 ring-[#d2e7e1]">
              <Lock className="size-5" />
            </div>
            <h1 className="mt-5 text-[20px] font-semibold tracking-[-0.03em]">MakeFlux Studio bloqueado</h1>
            <p className="mt-2 text-[10.5px] leading-5 text-[#71807d]">
              Olá, {configuracoes.perfil.nome || "usuário"}. Digite seu PIN local para continuar.
            </p>
            <input
              autoFocus
              inputMode="numeric"
              type="password"
              value={pin}
              maxLength={8}
              onChange={(evento) => setPin(evento.target.value.replace(/\D/g, ""))}
              className="mt-5 h-11 w-full rounded-md border border-[#dce3e1] bg-[#f7f9f9] px-3 text-center text-[18px] tracking-[0.35em] text-[#24302e] outline-none focus:border-[#72b8a8] focus:bg-white"
              aria-label="PIN local"
            />
            {erro && <p className="mt-2 text-[9.5px] text-[#b65454]">{erro}</p>}
            <Botao type="submit" variante="primario" disabled={validando || pin.length < 4} className="mt-4 w-full">
              <Unlock className="size-3.5" />
              {validando ? "Validando..." : "Desbloquear"}
            </Botao>
            <p className="mt-4 text-center text-[8.5px] leading-4 text-[#7f8c89]">
              Proteção local de conveniência. O PIN não recupera credenciais externas.
            </p>
          </form>
        </div>
      )}
    </>
  );
}

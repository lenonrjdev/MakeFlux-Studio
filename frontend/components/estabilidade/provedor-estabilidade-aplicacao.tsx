"use client";

import { AlertTriangle, RotateCcw, ShieldAlert, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";

import { Botao } from "@/components/ui/botao";
import {
  consultarEstabilidade,
  descartarRestauracaoEstabilidade,
  registrarSessaoEstabilidade,
} from "@/lib/estabilidade-nativa";
import { emAmbienteTauri } from "@/lib/runtime-nativo";
import type { StatusEstabilidade } from "@/types/estabilidade";

export function ProvedorEstabilidadeAplicacao({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [status, setStatus] = useState<StatusEstabilidade | null>(null);
  const [oculto, setOculto] = useState(false);

  const recarregar = useCallback(async () => {
    if (!emAmbienteTauri()) return;
    try {
      setStatus(await consultarEstabilidade());
    } catch {
      // A inicialização não deve ser bloqueada quando o diagnóstico não estiver disponível.
    }
  }, []);

  useEffect(() => {
    const temporizador = window.setTimeout(() => void recarregar(), 0);
    return () => window.clearTimeout(temporizador);
  }, [recarregar]);

  useEffect(() => {
    if (!emAmbienteTauri()) return;
    const temporizador = window.setTimeout(() => {
      void registrarSessaoEstabilidade({
        rota: pathname,
        contexto: { titulo: document.title, origem: "navegacao" },
      });
    }, 250);
    return () => window.clearTimeout(temporizador);
  }, [pathname]);

  const restaurar = useCallback(() => {
    const rota = status?.rotaUltimaSessao;
    if (!rota || !rota.startsWith("/")) return;
    setOculto(true);
    router.push(rota);
    void descartarRestauracaoEstabilidade().then(setStatus).catch(() => undefined);
  }, [router, status?.rotaUltimaSessao]);

  const descartar = useCallback(() => {
    setOculto(true);
    void descartarRestauracaoEstabilidade().then(setStatus).catch(() => undefined);
  }, []);

  const mostrarRestauracao = Boolean(
    status?.restauracaoPendente &&
      status.rotaUltimaSessao &&
      status.rotaUltimaSessao !== pathname &&
      !oculto,
  );
  const mostrarModoSeguro = Boolean(status?.modoSeguro && !oculto);

  return (
    <>
      {children}
      {(mostrarRestauracao || mostrarModoSeguro) && (
        <div className="fixed bottom-5 left-1/2 z-[80] w-[min(640px,calc(100vw-32px))] -translate-x-1/2 rounded-md border border-[#d9e2df] bg-white p-4 shadow-[0_14px_40px_rgba(43,56,53,.18)]">
          <div className="flex items-start gap-3">
            <span className={`grid size-8 shrink-0 place-items-center rounded-md ${mostrarModoSeguro ? "bg-[#fff4df] text-[#916926]" : "bg-[#eaf5f1] text-[#287662]"}`}>
              {mostrarModoSeguro ? <ShieldAlert className="size-4" /> : <AlertTriangle className="size-4" />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <strong className="text-[10px] text-[#303738]">
                    {mostrarModoSeguro ? "Aplicativo iniciado em modo seguro" : "Sessão anterior disponível"}
                  </strong>
                  <p className="mt-1 text-[7.8px] leading-4 text-[#758081]">
                    {mostrarModoSeguro
                      ? "Rotinas automáticas e retomadas de publicação estão pausadas até o modo seguro ser desativado e o aplicativo reiniciado."
                      : `A execução anterior terminou inesperadamente. Você pode voltar para ${status?.rotaUltimaSessao}.`}
                  </p>
                </div>
                <button type="button" aria-label="Ocultar aviso" onClick={() => setOculto(true)} className="text-[#929a9b] hover:text-[#4d5556]">
                  <X className="size-3.5" />
                </button>
              </div>
              <div className="mt-3 flex gap-2">
                {mostrarRestauracao && (
                  <Botao variante="primario" onClick={restaurar} className="h-8 text-[8px]">
                    <RotateCcw className="size-3.5" />
                    Restaurar sessão
                  </Botao>
                )}
                <Botao onClick={descartar} className="h-8 text-[8px]">
                  {mostrarModoSeguro ? "Entendi" : "Descartar restauração"}
                </Botao>
                {mostrarModoSeguro && (
                  <Botao onClick={() => router.push("/estabilidade")} className="h-8 text-[8px]">
                    Abrir estabilidade
                  </Botao>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

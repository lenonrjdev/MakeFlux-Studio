"use client";

import { CheckCircle2, CircleAlert } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  consultarStatusCofre,
  listarSegredosCofre,
} from "@/lib/cofre-nativo";
import { consultarStatusBancoLocal } from "@/lib/persistencia-nativa";
import { emAmbienteTauri } from "@/lib/runtime-nativo";
import {
  carregarPreferenciasTelemetria,
  limparTelemetriaLocal,
  listarTelemetriaLocal,
  registrarEventoTelemetriaLocal,
  salvarPreferenciasTelemetria,
} from "@/lib/telemetria-local";
import type {
  EventoTelemetriaLocal,
  PreferenciasTelemetriaLocal,
  SegredoCofreResumo,
  StatusBancoLocal,
  StatusCofreNativo,
} from "@/types/qualidade";

import { CabecalhoQualidade } from "./cabecalho-qualidade";
import { PainelCofreCredenciais } from "./painel-cofre-credenciais";
import { PainelDistribuicao } from "./painel-distribuicao";
import { PainelMigracaoSqlite } from "./painel-migracao-sqlite";
import { PainelQualidadeE2E } from "./painel-qualidade-e2e";
import { PainelTelemetriaLocal } from "./painel-telemetria-local";
import { ResumoQualidade } from "./resumo-qualidade";

export function CentralQualidade() {
  const [banco, setBanco] = useState<StatusBancoLocal | null>(null);
  const [cofre, setCofre] = useState<StatusCofreNativo | null>(null);
  const [segredos, setSegredos] = useState<SegredoCofreResumo[]>([]);
  const [eventos, setEventos] = useState<EventoTelemetriaLocal[]>([]);
  const [preferencias, setPreferencias] = useState<PreferenciasTelemetriaLocal>({
    ativa: false,
    reterDias: 30,
    atualizadoEm: new Date(0).toISOString(),
  });
  const [notificacao, setNotificacao] = useState<{ mensagem: string; tipo: "sucesso" | "aviso" } | null>(null);
  const temporizador = useRef<number | null>(null);

  const atualizarBanco = useCallback(async () => {
    if (!emAmbienteTauri()) return;
    setBanco(await consultarStatusBancoLocal());
  }, []);

  const atualizarCofre = useCallback(async () => {
    if (!emAmbienteTauri()) return;
    const status = await consultarStatusCofre();
    setCofre(status);
    setSegredos(status.desbloqueado ? await listarSegredosCofre() : []);
  }, []);

  const atualizarTelemetria = useCallback(async () => {
    setPreferencias(carregarPreferenciasTelemetria());
    setEventos(await listarTelemetriaLocal());
  }, []);

  useEffect(() => {
    const inicial = window.setTimeout(() => {
      void Promise.all([atualizarBanco(), atualizarCofre(), atualizarTelemetria()]);
      void registrarEventoTelemetriaLocal("navegacao", "abrir-qualidade", "Central de qualidade aberta");
    }, 0);
    return () => window.clearTimeout(inicial);
  }, [atualizarBanco, atualizarCofre, atualizarTelemetria]);

  useEffect(() => () => {
    if (temporizador.current) window.clearTimeout(temporizador.current);
  }, []);

  function notificar(mensagem: string, tipo: "sucesso" | "aviso" = "sucesso") {
    if (temporizador.current) window.clearTimeout(temporizador.current);
    setNotificacao({ mensagem, tipo });
    temporizador.current = window.setTimeout(() => setNotificacao(null), 3800);
  }

  async function limparEventos() {
    await limparTelemetriaLocal();
    await atualizarTelemetria();
    notificar("Telemetria local removida.");
  }

  function alterarTelemetria(ativa: boolean) {
    const proximas = salvarPreferenciasTelemetria({ ativa });
    setPreferencias(proximas);
    notificar(ativa ? "Telemetria local ativada." : "Telemetria local desativada.");
  }

  return (
    <div className="min-h-[calc(100vh-62px)] bg-[#f7f8f9]">
      <CabecalhoQualidade />
      <div className="space-y-4 px-8 py-5">
        {!emAmbienteTauri() && (
          <div className="rounded-md border border-[#eadfca] bg-[#fbf7ef] px-4 py-3 text-[9px] leading-5 text-[#866d46]">
            A prévia web mostra a interface, mas SQLite e cofre funcionam somente no aplicativo desktop.
          </div>
        )}
        <ResumoQualidade banco={banco} cofre={cofre} />
        <div className="grid grid-cols-2 items-start gap-4">
          <div className="space-y-4">
            <PainelMigracaoSqlite status={banco} aoAtualizar={atualizarBanco} aoNotificar={notificar} />
            <PainelTelemetriaLocal
              preferencias={preferencias}
              eventos={eventos}
              aoAlterar={alterarTelemetria}
              aoLimpar={limparEventos}
              aoNotificar={notificar}
            />
          </div>
          <div className="space-y-4">
            <PainelCofreCredenciais
              status={cofre}
              segredos={segredos}
              aoAtualizar={atualizarCofre}
              aoNotificar={notificar}
            />
            <PainelDistribuicao />
          </div>
        </div>
        <PainelQualidadeE2E />
      </div>
      {notificacao && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-[90] flex max-w-[410px] items-start gap-2.5 rounded-md border bg-white px-3.5 py-3 text-[9.5px] leading-4 shadow-[0_12px_35px_rgba(20,29,27,.13)] ${
            notificacao.tipo === "sucesso"
              ? "border-[#cee5df] text-[#286d5e]"
              : "border-[#eadfca] text-[#8d6b31]"
          }`}
        >
          {notificacao.tipo === "sucesso" ? (
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" />
          ) : (
            <CircleAlert className="mt-0.5 size-3.5 shrink-0" />
          )}
          {notificacao.mensagem}
        </div>
      )}
    </div>
  );
}

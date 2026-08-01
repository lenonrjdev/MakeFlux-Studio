"use client";

import { AlertTriangle } from "lucide-react";

import { conteudoAtualizador } from "@/content/atualizador";
import { useAtualizadorAssinado } from "@/hooks/use-atualizador-assinado";
import { emAmbienteTauri } from "@/lib/runtime-nativo";

import { CabecalhoAtualizacoes } from "./cabecalho-atualizacoes";
import { HistoricoAtualizacoes } from "./historico-atualizacoes";
import { PainelAtualizacaoDisponivel } from "./painel-atualizacao-disponivel";
import { PainelCanalAtualizacao } from "./painel-canal-atualizacao";
import { PainelProgressoAtualizacao } from "./painel-progresso-atualizacao";
import { PainelSegurancaAtualizador } from "./painel-seguranca-atualizador";
import { ResumoAtualizacoes } from "./resumo-atualizacoes";

export function CentralAtualizacoes() {
  const atualizador = useAtualizadorAssinado();
  if (!atualizador.carregado) return <div className="min-h-[calc(100vh-62px)] animate-pulse bg-[#f7f8f9]" />;
  return (
    <div className="min-h-[calc(100vh-62px)] bg-[#f7f8f9]">
      <CabecalhoAtualizacoes versao={atualizador.runtime?.versaoAtual ?? "1.4.0"} />
      <div className="space-y-4 px-8 py-5">
        {!emAmbienteTauri() && <div className="flex items-start gap-2 rounded-md border border-[#eadfc7] bg-[#fff9ec] px-3 py-2.5 text-[8px] leading-4 text-[#80642e]"><AlertTriangle className="mt-0.5 size-3.5 shrink-0" /> A prévia web mostra a central, mas verificação, download, assinatura e instalação exigem o aplicativo desktop.</div>}
        <ResumoAtualizacoes workspace={atualizador.workspace} runtime={atualizador.runtime} />
        <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(330px,.65fr)] items-start gap-4">
          <div className="space-y-4"><PainelAtualizacaoDisponivel workspace={atualizador.workspace} runtime={atualizador.runtime} aoVerificar={() => atualizador.verificar(false)} aoRollback={() => atualizador.verificar(true)} aoBaixar={atualizador.baixar} /><PainelSegurancaAtualizador runtime={atualizador.runtime} /></div>
          <div className="space-y-4"><PainelProgressoAtualizacao workspace={atualizador.workspace} aoInstalar={atualizador.instalar} /><PainelCanalAtualizacao canal={atualizador.workspace.canal} aoAlterar={atualizador.alterarCanal} /></div>
        </div>
        <HistoricoAtualizacoes historico={atualizador.workspace.historico} aoLimpar={atualizador.limparHistorico} />
        <div className="rounded-md border border-[#dfe7e4] bg-white px-4 py-3 text-[7.5px] leading-4 text-[#788180]">{conteudoAtualizador.avisoAssinatura}</div>
      </div>
    </div>
  );
}

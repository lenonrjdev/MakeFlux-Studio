"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { conteudoProvedoresIa } from "@/content/provedores-ia";
import { useProvedoresIa } from "@/hooks/use-provedores-ia";
import { emAmbienteTauri } from "@/lib/runtime-nativo";

import { CabecalhoProvedoresIa } from "./cabecalho-provedores-ia";
import { CartaoProvedorIa } from "./cartao-provedor-ia";
import { HistoricoExecucoesIa } from "./historico-execucoes-ia";
import { PainelFallbackIa } from "./painel-fallback-ia";
import { ResumoProvedoresIa } from "./resumo-provedores-ia";

export function CentralProvedoresIa() {
  const estado = useProvedoresIa();
  return <div className="min-h-[calc(100vh-62px)] bg-[#f3f5f6]"><CabecalhoProvedoresIa aoAtualizar={() => void estado.recarregar()} /><div className="space-y-4 px-8 py-5">{!emAmbienteTauri() && <div className="rounded-md border border-[#eadfca] bg-[#fbf7ef] px-4 py-3 text-[9px] text-[#866d46]">{conteudoProvedoresIa.avisoWeb}</div>}{estado.erro && <div className="flex items-start gap-2 rounded-md border border-[#ebd5d5] bg-[#fbf5f5] px-4 py-3 text-[9px] text-[#9a4d4d]"><AlertTriangle className="mt-0.5 size-3.5 shrink-0" />{estado.erro}</div>}{estado.ultimoTeste && <div className="flex items-start gap-2 rounded-md border border-[#cde4dd] bg-[#f1f8f6] px-4 py-3 text-[9px] text-[#276f60]"><CheckCircle2 className="mt-0.5 size-3.5 shrink-0" />{estado.ultimoTeste.provedor}: {estado.ultimoTeste.mensagem} · {Math.round(estado.ultimoTeste.latenciaMs)} ms</div>}<ResumoProvedoresIa resumo={estado.resumo} />{estado.carregando && estado.provedores.length === 0 ? <div className="h-72 animate-pulse rounded-md border border-[#e1e7e6] bg-white" /> : <div className="grid grid-cols-2 gap-4">{estado.provedores.map((provedor) => <CartaoProvedorIa key={`${provedor.id}-${provedor.modelo}-${provedor.endpoint}-${provedor.ultimaVerificacaoEm ?? 0}`} provedor={provedor} operacao={estado.operacao} aoSalvar={estado.salvar} aoTestar={() => estado.testar(provedor.id)} aoRemoverCredencial={() => estado.removerCredencial(provedor.id)} />)}</div>}<div className="grid grid-cols-[360px_minmax(0,1fr)] items-start gap-4"><PainelFallbackIa provedores={estado.provedores} /><HistoricoExecucoesIa execucoes={estado.execucoes} /></div></div></div>;
}

"use client";

import { AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";

import { conteudoRotinas } from "@/content/rotinas";
import { useRotinasNativas } from "@/hooks/use-rotinas-nativas";
import { emAmbienteTauri } from "@/lib/runtime-nativo";

import { CabecalhoRotinas } from "./cabecalho-rotinas";
import { EditorRotina } from "./editor-rotina";
import { HistoricoRotinas } from "./historico-rotinas";
import { ListaRotinas } from "./lista-rotinas";
import { PainelAgendador } from "./painel-agendador";
import { PainelNotificacoes } from "./painel-notificacoes";
import { ResumoRotinas } from "./resumo-rotinas";

export function CentralRotinas() {
  const rotinas = useRotinasNativas();
  const [editorAberto, setEditorAberto] = useState(false);
  const [selecionadaId, setSelecionadaId] = useState<string | null>(null);
  const selecionada = useMemo(() => rotinas.rotinas.find((item) => item.id === selecionadaId) ?? null, [rotinas.rotinas, selecionadaId]);

  function criar() { setSelecionadaId(null); setEditorAberto(true); }
  function editar(id: string) { setSelecionadaId(id); setEditorAberto(true); }

  return <div className="min-h-[calc(100vh-62px)] bg-[#f7f8f9]"><CabecalhoRotinas aoCriar={criar} aoTestar={rotinas.testarNotificacao} /><div className="space-y-4 px-8 py-5">{!emAmbienteTauri() && <div className="rounded-md border border-[#eadfca] bg-[#fbf7ef] px-4 py-3 text-[9px] leading-5 text-[#866d46]">{conteudoRotinas.avisoWeb}</div>}{rotinas.erro && <div className="flex items-start gap-2 rounded-md border border-[#ebd5d5] bg-[#fbf5f5] px-4 py-3 text-[9px] text-[#9a4d4d]"><AlertTriangle className="mt-0.5 size-3.5 shrink-0" />{rotinas.erro}</div>}<ResumoRotinas status={rotinas.status} /><div className="grid grid-cols-[minmax(0,1.45fr)_340px] items-start gap-4"><ListaRotinas rotinas={rotinas.rotinas} selecionadaId={selecionadaId} aoSelecionar={editar} aoAlternar={rotinas.alternar} aoExecutar={rotinas.executar} aoRemover={rotinas.remover} /><div className="space-y-4">{editorAberto ? <EditorRotina key={selecionada?.id ?? "nova"} rotina={selecionada} aoSalvar={rotinas.salvar} aoFechar={() => setEditorAberto(false)} /> : <PainelAgendador status={rotinas.status} aoProcessar={rotinas.processar} />}<HistoricoRotinas execucoes={rotinas.execucoes} /></div></div><PainelNotificacoes notificacoes={rotinas.notificacoes} aoLer={rotinas.lerNotificacao} aoLerTodas={rotinas.lerTodas} aoLimparLidas={rotinas.limparLidas} /></div></div>;
}

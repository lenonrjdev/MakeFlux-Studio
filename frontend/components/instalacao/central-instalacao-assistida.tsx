
"use client";

import { AlertTriangle, Info } from "lucide-react";

import { conteudoInstalacao } from "@/content/instalacao";
import { useInstalacaoAssistida } from "@/hooks/use-instalacao-assistida";

import { CabecalhoInstalacao } from "./cabecalho-instalacao";
import { EtapasInstalacao } from "./etapas-instalacao";
import { PainelDependencias } from "./painel-dependencias";
import { PainelHomologacao } from "./painel-homologacao";
import { PainelMoneyPrinter } from "./painel-moneyprinter";
import { PainelWorkspace } from "./painel-workspace";
import { ResumoInstalacao } from "./resumo-instalacao";

export function CentralInstalacaoAssistida() {
  const instalacao = useInstalacaoAssistida();
  const workspace = instalacao.diagnostico?.workspace ?? null;
  return <div className="min-h-[calc(100vh-62px)] bg-[#f3f5f6]"><CabecalhoInstalacao carregando={instalacao.operacao === "diagnostico"} aoDiagnosticar={() => void instalacao.diagnosticar()} /><div className="space-y-4 px-8 py-5">{!instalacao.desktop && <div className="flex items-start gap-2 rounded-md border border-[#eadfca] bg-[#fffaf0] px-4 py-3 text-[9px] leading-5 text-[#866d46]"><Info className="mt-0.5 size-3.5 shrink-0" />{conteudoInstalacao.avisoWeb}</div>}{instalacao.erro && <div className="flex items-start gap-2 rounded-md border border-[#ebd5d5] bg-[#fbf5f5] px-4 py-3 text-[9px] text-[#9a4d4d]"><AlertTriangle className="mt-0.5 size-3.5 shrink-0" />{instalacao.erro}</div>}<ResumoInstalacao diagnostico={instalacao.diagnostico} /><div className="grid grid-cols-[260px_minmax(0,1fr)] items-start gap-4"><EtapasInstalacao etapa={instalacao.etapa} progresso={instalacao.progresso} aoSelecionar={instalacao.definirEtapa} /><div className="space-y-4">{instalacao.etapa === "diagnostico" && <section className="rounded-md border border-[#e0e6e5] bg-white p-5"><h2 className="text-[12px] font-semibold text-[#303738]">Resultado do diagnóstico</h2><p className="mt-2 text-[9px] leading-5 text-[#6f797a]">{instalacao.diagnostico?.mensagem ?? "Aguardando a primeira verificação do ambiente."}</p><div className="mt-4 rounded-md border border-[#dbe8e4] bg-[#f3faf7] px-4 py-3 text-[8px] leading-4 text-[#376e62]">{conteudoInstalacao.seguranca}</div></section>}{instalacao.etapa === "workspace" && <PainelWorkspace raiz={instalacao.raizWorkspace} workspace={workspace} carregando={instalacao.operacao === "workspace"} aoAlterar={instalacao.definirRaizWorkspace} aoPreparar={() => void instalacao.prepararWorkspace()} aoAbrir={(caminho) => void instalacao.abrirPasta(caminho)} />}{instalacao.etapa === "dependencias" && <PainelDependencias dependencias={instalacao.diagnostico?.dependencias ?? []} operacao={instalacao.operacao} winget={Boolean(instalacao.diagnostico?.wingetDisponivel)} aoInstalar={(id) => void instalacao.instalarDependencia(id)} />}{instalacao.etapa === "motor" && <PainelMoneyPrinter diagnostico={instalacao.diagnostico} resultado={instalacao.instalacaoMotor} operacao={instalacao.operacao} aoInstalar={() => void instalacao.instalarMotor()} aoAbrir={(caminho) => void instalacao.abrirPasta(caminho)} />}{instalacao.etapa === "homologacao" && <PainelHomologacao validacao={instalacao.validacao} operacao={instalacao.operacao} aoValidar={() => void instalacao.validarMotor()} aoTestarApi={() => void instalacao.testarApi()} />}{instalacao.registros.length > 0 && <section className="rounded-md border border-[#e0e6e5] bg-white"><div className="border-b border-[#e7ebea] px-4 py-3"><strong className="text-[9px] text-[#3d4546]">Histórico desta sessão</strong></div><div className="max-h-44 divide-y divide-[#edf0ef] overflow-auto">{instalacao.registros.map((registro) => <div key={registro.id} className="flex items-start justify-between gap-4 px-4 py-2.5"><span className={`text-[8px] leading-4 ${registro.tipo === "erro" ? "text-[#a04e4e]" : registro.tipo === "sucesso" ? "text-[#277361]" : "text-[#697374]"}`}>{registro.mensagem}</span><time className="shrink-0 text-[6.5px] text-[#a0a7a8]">{new Date(registro.criadoEm).toLocaleTimeString("pt-BR")}</time></div>)}</div></section>}</div></div></div></div>;
}

"use client";

import { KeyRound, LoaderCircle, Save, TestTube2, Trash2 } from "lucide-react";
import { useState } from "react";

import { Botao } from "@/components/ui/botao";
import { CampoFormulario, classesCampo } from "@/components/ui/campo-formulario";
import { rotulosStatusProvedorIa } from "@/data/provedores-ia";
import type { ConfiguracaoProvedorIa, EntradaConfiguracaoProvedorIa } from "@/types/provedores-ia";

function entrada(config: ConfiguracaoProvedorIa): EntradaConfiguracaoProvedorIa {
  return {
    id: config.id, endpoint: config.endpoint, modelo: config.modelo, habilitado: config.habilitado,
    prioridade: config.prioridade, timeoutSegundos: config.timeoutSegundos,
    limiteDiarioRequisicoes: config.limiteDiarioRequisicoes, maxTokensSaida: config.maxTokensSaida,
    temperaturaPadrao: config.temperaturaPadrao, custoEntradaMilhao: config.custoEntradaMilhao,
    custoSaidaMilhao: config.custoSaidaMilhao,
  };
}

export function CartaoProvedorIa({ provedor, operacao, aoSalvar, aoTestar, aoRemoverCredencial }: {
  provedor: ConfiguracaoProvedorIa;
  operacao: string | null;
  aoSalvar: (configuracao: EntradaConfiguracaoProvedorIa, credencial?: string) => Promise<unknown>;
  aoTestar: () => Promise<unknown>;
  aoRemoverCredencial: () => Promise<unknown>;
}) {
  const [configuracao, setConfiguracao] = useState(() => entrada(provedor));
  const [credencial, setCredencial] = useState("");
  const ocupado = Boolean(operacao?.endsWith(provedor.id));
  const tom = provedor.status === "pronto" ? "border-[#c8e4dc] bg-[#eef8f5] text-[#24705f]" : provedor.status === "indisponivel" ? "border-[#ead5d5] bg-[#fbf4f4] text-[#965656]" : "border-[#e5dfcf] bg-[#fbf8f0] text-[#866d46]";
  return (
    <article className="overflow-hidden rounded-md border border-[#e0e6e5] bg-white">
      <header className="flex items-start justify-between gap-4 border-b border-[#e8eceb] bg-[#fafbfb] px-4 py-3.5">
        <div><h2 className="text-[11px] font-semibold text-[#293031]">{provedor.nome}</h2><p className="mt-1 text-[7.5px] text-[#879091]">{provedor.descricao}</p></div>
        <span className={`rounded border px-2 py-1 text-[7px] font-medium ${tom}`}>{rotulosStatusProvedorIa[provedor.status]}</span>
      </header>
      <div className="space-y-3 p-4">
        <div className="grid grid-cols-[1fr_130px] gap-3">
          <CampoFormulario rotulo="Endpoint"><input className={`${classesCampo} h-9`} value={configuracao.endpoint} onChange={(e) => setConfiguracao((atual) => ({ ...atual, endpoint: e.target.value }))} /></CampoFormulario>
          <CampoFormulario rotulo="Prioridade"><input type="number" min={1} max={20} className={`${classesCampo} h-9`} value={configuracao.prioridade} onChange={(e) => setConfiguracao((atual) => ({ ...atual, prioridade: Number(e.target.value) }))} /></CampoFormulario>
        </div>
        <CampoFormulario rotulo="Modelo"><input className={`${classesCampo} h-9`} value={configuracao.modelo} onChange={(e) => setConfiguracao((atual) => ({ ...atual, modelo: e.target.value }))} /></CampoFormulario>
        {provedor.requerCredencial && <CampoFormulario rotulo="Nova chave de API" descricao={provedor.credencialConfigurada ? "Uma credencial já está protegida no cofre. Preencha somente para substituí-la." : "A chave será enviada diretamente ao cofre criptografado."}><input type="password" autoComplete="new-password" className={`${classesCampo} h-9`} value={credencial} onChange={(e) => setCredencial(e.target.value)} placeholder={provedor.credencialConfigurada ? "••••••••••••••••" : "Cole a chave de API"} /></CampoFormulario>}
        <div className="grid grid-cols-3 gap-3">
          <CampoFormulario rotulo="Timeout (s)"><input type="number" min={5} max={300} className={`${classesCampo} h-9`} value={configuracao.timeoutSegundos} onChange={(e) => setConfiguracao((a) => ({ ...a, timeoutSegundos: Number(e.target.value) }))} /></CampoFormulario>
          <CampoFormulario rotulo="Limite diário"><input type="number" min={0} className={`${classesCampo} h-9`} value={configuracao.limiteDiarioRequisicoes} onChange={(e) => setConfiguracao((a) => ({ ...a, limiteDiarioRequisicoes: Number(e.target.value) }))} /></CampoFormulario>
          <CampoFormulario rotulo="Máx. tokens"><input type="number" min={64} max={64000} className={`${classesCampo} h-9`} value={configuracao.maxTokensSaida} onChange={(e) => setConfiguracao((a) => ({ ...a, maxTokensSaida: Number(e.target.value) }))} /></CampoFormulario>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <CampoFormulario rotulo="USD / 1M tokens de entrada"><input type="number" min={0} step="0.01" className={`${classesCampo} h-9`} value={configuracao.custoEntradaMilhao} onChange={(e) => setConfiguracao((a) => ({ ...a, custoEntradaMilhao: Number(e.target.value) }))} /></CampoFormulario>
          <CampoFormulario rotulo="USD / 1M tokens de saída"><input type="number" min={0} step="0.01" className={`${classesCampo} h-9`} value={configuracao.custoSaidaMilhao} onChange={(e) => setConfiguracao((a) => ({ ...a, custoSaidaMilhao: Number(e.target.value) }))} /></CampoFormulario>
        </div>
        <label className="flex items-center justify-between rounded-md border border-[#e5e9e8] bg-[#fafbfb] px-3 py-2.5"><span><strong className="block text-[8.5px] font-medium text-[#424a4b]">Provedor ativo</strong><span className="mt-0.5 block text-[7px] text-[#8c9495]">Participa da ordem de execução e fallback.</span></span><input type="checkbox" checked={configuracao.habilitado} onChange={(e) => setConfiguracao((a) => ({ ...a, habilitado: e.target.checked }))} className="size-4 accent-[#238771]" /></label>
        <div className="rounded-md border border-[#e7ebea] bg-[#fbfcfc] px-3 py-2 text-[7.5px] leading-4 text-[#788182]">{provedor.mensagem}{provedor.latenciaMs !== null ? ` · ${Math.round(provedor.latenciaMs)} ms` : ""} · {provedor.requisicoesHoje} requisições hoje</div>
      </div>
      <footer className="flex items-center justify-between border-t border-[#e8eceb] bg-[#fafbfb] px-4 py-3">
        <div>{provedor.requerCredencial && provedor.credencialConfigurada && <Botao className="h-8 px-2.5 text-[8px]" onClick={() => void aoRemoverCredencial()} disabled={ocupado}><Trash2 className="size-3" /> Remover chave</Botao>}</div>
        <div className="flex gap-2"><Botao className="h-8 px-2.5 text-[8px]" onClick={() => void aoTestar()} disabled={ocupado}>{ocupado ? <LoaderCircle className="size-3 animate-spin" /> : <TestTube2 className="size-3" />} Testar</Botao><Botao variante="primario" className="h-8 px-2.5 text-[8px]" onClick={() => void aoSalvar(configuracao, credencial).then(() => setCredencial(""))} disabled={ocupado}>{ocupado ? <LoaderCircle className="size-3 animate-spin" /> : credencial ? <KeyRound className="size-3" /> : <Save className="size-3" />} Salvar</Botao></div>
      </footer>
    </article>
  );
}

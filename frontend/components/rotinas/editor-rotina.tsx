"use client";

import { Save } from "lucide-react";
import { useState } from "react";

import { Botao } from "@/components/ui/botao";
import { frequenciasRotina, tiposRotina } from "@/data/rotinas";
import type { EntradaRotinaAgendada, FrequenciaRotina, RotinaAgendada, TipoRotina } from "@/types/rotinas";

function dataLocal(valor: number | null | undefined) {
  if (!valor) return "";
  const data = new Date(valor);
  const ajuste = data.getTimezoneOffset() * 60_000;
  return new Date(data.getTime() - ajuste).toISOString().slice(0, 16);
}

export function EditorRotina({ rotina, aoSalvar, aoFechar }: { rotina: RotinaAgendada | null; aoSalvar: (entrada: EntradaRotinaAgendada) => Promise<unknown>; aoFechar: () => void }) {
  const [nome, setNome] = useState(rotina?.nome ?? "");
  const [descricao, setDescricao] = useState(rotina?.descricao ?? "");
  const [tipo, setTipo] = useState<TipoRotina>(rotina?.tipo ?? "lembrete");
  const [frequencia, setFrequencia] = useState<FrequenciaRotina>(rotina?.frequencia ?? "uma-vez");
  const [intervalo, setIntervalo] = useState(rotina?.intervaloMinutos ?? 60);
  const [proxima, setProxima] = useState(dataLocal(rotina?.proximaExecucaoEm));
  const [notificar, setNotificar] = useState(rotina?.notificar ?? true);
  const [parametros, setParametros] = useState(rotina?.parametros ?? "{}");
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    if (!nome.trim()) return;
    setSalvando(true);
    try {
      await aoSalvar({ id: rotina?.id, nome: nome.trim(), descricao: descricao.trim(), tipo, frequencia, intervaloMinutos: frequencia === "intervalo" ? intervalo : null, proximaExecucaoEm: proxima ? new Date(proxima).getTime() : null, ativa: rotina?.ativa ?? true, notificar, parametros });
      aoFechar();
    } finally { setSalvando(false); }
  }

  return <aside className="rounded-md border border-[#e1e7e6] bg-white p-4"><div className="mb-4"><h2 className="text-[10px] font-semibold text-[#303737]">{rotina ? "Editar rotina" : "Nova rotina"}</h2><p className="mt-1 text-[8px] text-[#929a99]">Configure uma ação local segura e sua repetição.</p></div><div className="space-y-3"><label className="block text-[8px] font-medium text-[#697372]">Nome<input value={nome} onChange={(evento) => setNome(evento.target.value)} className="foco-acessivel mt-1 h-8 w-full rounded-md border border-[#dfe5e4] px-2.5 text-[9px]" placeholder="Ex.: Verificar banco toda segunda" /></label><label className="block text-[8px] font-medium text-[#697372]">Descrição<textarea value={descricao} onChange={(evento) => setDescricao(evento.target.value)} className="foco-acessivel mt-1 min-h-16 w-full resize-none rounded-md border border-[#dfe5e4] px-2.5 py-2 text-[9px]" /></label><div className="grid grid-cols-2 gap-2"><label className="block text-[8px] font-medium text-[#697372]">Ação<select value={tipo} onChange={(evento) => setTipo(evento.target.value as TipoRotina)} className="foco-acessivel mt-1 h-8 w-full rounded-md border border-[#dfe5e4] bg-white px-2 text-[8.5px]">{tiposRotina.map((item) => <option key={item.id} value={item.id}>{item.titulo}</option>)}</select></label><label className="block text-[8px] font-medium text-[#697372]">Frequência<select value={frequencia} onChange={(evento) => setFrequencia(evento.target.value as FrequenciaRotina)} className="foco-acessivel mt-1 h-8 w-full rounded-md border border-[#dfe5e4] bg-white px-2 text-[8.5px]">{frequenciasRotina.map((item) => <option key={item.id} value={item.id}>{item.titulo}</option>)}</select></label></div>{frequencia === "intervalo" && <label className="block text-[8px] font-medium text-[#697372]">Intervalo em minutos<input type="number" min={5} max={10_080} value={intervalo} onChange={(evento) => setIntervalo(Number(evento.target.value))} className="foco-acessivel mt-1 h-8 w-full rounded-md border border-[#dfe5e4] px-2 text-[9px]" /></label>}<label className="block text-[8px] font-medium text-[#697372]">Primeira execução<input type="datetime-local" value={proxima} onChange={(evento) => setProxima(evento.target.value)} className="foco-acessivel mt-1 h-8 w-full rounded-md border border-[#dfe5e4] px-2 text-[9px]" /></label><label className="flex items-center justify-between rounded-md border border-[#e5e9e8] px-3 py-2 text-[8.5px] text-[#596261]"><span>Notificar ao concluir ou falhar</span><input type="checkbox" checked={notificar} onChange={(evento) => setNotificar(evento.target.checked)} /></label>{tipo === "limpar-telemetria" && <label className="block text-[8px] font-medium text-[#697372]">Parâmetros JSON<textarea value={parametros} onChange={(evento) => setParametros(evento.target.value)} className="foco-acessivel mt-1 min-h-14 w-full rounded-md border border-[#dfe5e4] px-2 py-1.5 font-mono text-[8px]" placeholder='{"dias":30}' /></label>}<div className="flex justify-end gap-2 pt-2"><Botao onClick={aoFechar}>Cancelar</Botao><Botao variante="primario" disabled={salvando || !nome.trim()} onClick={() => void salvar()}><Save className="size-3.5" /> {salvando ? "Salvando..." : "Salvar rotina"}</Botao></div></div></aside>;
}

"use client";

import { Cpu, Gauge } from "lucide-react";

import { CartaoConfiguracao } from "@/components/configuracoes/cartao-configuracao";
import { CampoFormulario, classesCampo } from "@/components/ui/campo-formulario";
import { Interruptor } from "@/components/ui/interruptor";
import type { ConfiguracaoDesempenho } from "@/types/configuracoes";

export function SecaoDesempenho({ desempenho, aoAtualizar }: { desempenho: ConfiguracaoDesempenho; aoAtualizar: (dados: Partial<ConfiguracaoDesempenho>) => void }) {
  return (
    <div className="space-y-4">
      <CartaoConfiguracao titulo="Processamento local" descricao="Controle como o aplicativo utiliza CPU, GPU, RAM e fila.">
        <div className="grid grid-cols-3 gap-4">
          <CampoFormulario rotulo="Processamento"><select value={desempenho.processamento} onChange={(e) => aoAtualizar({ processamento: e.target.value as ConfiguracaoDesempenho["processamento"] })} className={`${classesCampo} h-10`}><option value="automatico">Automático</option><option value="cpu">Somente CPU</option><option value="gpu">Priorizar GPU</option></select></CampoFormulario>
          <CampoFormulario rotulo="Codificador"><select value={desempenho.codificador} onChange={(e) => aoAtualizar({ codificador: e.target.value as ConfiguracaoDesempenho["codificador"] })} className={`${classesCampo} h-10`}><option value="automatico">Automático</option><option value="nvenc">NVIDIA NVENC</option><option value="quick-sync">Intel Quick Sync</option><option value="amf">AMD AMF</option><option value="libx264">CPU libx264</option></select></CampoFormulario>
          <CampoFormulario rotulo="Prioridade do processo"><select value={desempenho.prioridadeProcesso} onChange={(e) => aoAtualizar({ prioridadeProcesso: e.target.value as ConfiguracaoDesempenho["prioridadeProcesso"] })} className={`${classesCampo} h-10`}><option value="baixa">Baixa</option><option value="normal">Normal</option><option value="alta">Alta</option></select></CampoFormulario>
          <CampoFormulario rotulo="Threads"><input type="number" min={1} max={64} value={desempenho.threads} onChange={(e) => aoAtualizar({ threads: Number(e.target.value) })} className={`${classesCampo} h-10`} /></CampoFormulario>
          <CampoFormulario rotulo="Tarefas simultâneas"><input type="number" min={1} max={8} value={desempenho.tarefasSimultaneas} onChange={(e) => aoAtualizar({ tarefasSimultaneas: Number(e.target.value) })} className={`${classesCampo} h-10`} /></CampoFormulario>
          <CampoFormulario rotulo="Limite da fila"><input type="number" min={1} max={100} value={desempenho.limiteFila} onChange={(e) => aoAtualizar({ limiteFila: Number(e.target.value) })} className={`${classesCampo} h-10`} /></CampoFormulario>
          <CampoFormulario rotulo="Limite de RAM"><div className="relative"><input type="number" min={2} max={128} value={desempenho.limiteRamGb} onChange={(e) => aoAtualizar({ limiteRamGb: Number(e.target.value) })} className={`${classesCampo} h-10 pr-10`} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-[#92999a]">GB</span></div></CampoFormulario>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Interruptor ativo={desempenho.pausarEmBateria} aoAlterar={(valor) => aoAtualizar({ pausarEmBateria: valor })} rotulo="Pausar quando estiver na bateria" descricao="Evita renderizações pesadas sem energia externa." />
          <Interruptor ativo={desempenho.reduzirPreviaDuranteRenderizacao} aoAlterar={(valor) => aoAtualizar({ reduzirPreviaDuranteRenderizacao: valor })} rotulo="Reduzir qualidade da prévia" descricao="Libera recursos durante a renderização." />
        </div>
      </CartaoConfiguracao>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-md border border-[#e2e7e6] bg-white p-4"><Cpu className="size-4 text-[#208a75]" /><strong className="mt-3 block text-[11px]">Uso equilibrado</strong><p className="mt-1 text-[9px] leading-4 text-[#8b9293]">Uma tarefa simultânea é o padrão mais seguro para computadores com 8 GB de RAM.</p></div>
        <div className="rounded-md border border-[#e2e7e6] bg-white p-4"><Gauge className="size-4 text-[#208a75]" /><strong className="mt-3 block text-[11px]">Aplicação futura</strong><p className="mt-1 text-[9px] leading-4 text-[#8b9293]">O adaptador nativo usará estes limites ao controlar FFmpeg, Whisper e o motor.</p></div>
      </div>
    </div>
  );
}

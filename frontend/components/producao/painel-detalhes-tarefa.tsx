"use client";

import {
  AlertTriangle,
  Ban,
  CirclePause,
  CirclePlay,
  Clock3,
  Copy,
  ExternalLink,
  FileAudio2,
  FileCode2,
  FileText,
  FileVideo2,
  FolderOpen,
  RotateCcw,
  TerminalSquare,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import Link from "next/link";

import { Botao } from "@/components/ui/botao";
import { SeloStatus } from "@/components/ui/selo-status";
import { conteudoProducao } from "@/content/producao";
import { rotulosPrioridade, rotulosStatusTarefa, tonsStatusTarefa } from "@/data/producao";
import {
  formatarHorarioProducao,
  formatarTempoProducao,
  rotuloEtapaAtual,
  statusPermitePausa,
  tempoRestanteTarefa,
} from "@/lib/producao-local";
import type { PrioridadeTarefaProducao, TarefaProducao } from "@/types/producao";

import { ProgressoEtapas } from "./progresso-etapas";

const iconesArquivo = {
  video: FileVideo2,
  audio: FileAudio2,
  legenda: FileText,
  log: FileCode2,
};

const coresLog = {
  info: "bg-[#dfe9e7]",
  sucesso: "bg-[#55a391]",
  aviso: "bg-[#c68a52]",
  erro: "bg-[#c65e5e]",
};

export function PainelDetalhesTarefa({
  tarefa,
  aoFechar,
  aoPausar,
  aoRetomar,
  aoCancelar,
  aoTentarNovamente,
  aoDuplicar,
  aoExcluir,
  aoAlterarPrioridade,
  aoSimularErro,
}: {
  tarefa: TarefaProducao;
  aoFechar: () => void;
  aoPausar: () => void;
  aoRetomar: () => void;
  aoCancelar: () => void;
  aoTentarNovamente: () => void;
  aoDuplicar: () => void;
  aoExcluir: () => void;
  aoAlterarPrioridade: (prioridade: PrioridadeTarefaProducao) => void;
  aoSimularErro: () => void;
}) {
  const restante = tempoRestanteTarefa(tarefa);
  const podeRetomar = ["pausada", "cancelada"].includes(tarefa.status);
  const podeExcluir = ["concluida", "cancelada", "erro"].includes(tarefa.status);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#17211f]/18 backdrop-blur-[1px]" onMouseDown={aoFechar}>
      <aside className="flex h-full w-[430px] flex-col border-l border-[#dce2e1] bg-[#f8f9f9] shadow-[-18px_0_50px_rgba(22,31,29,.12)]" onMouseDown={(evento) => evento.stopPropagation()}>
        <header className="flex items-start justify-between gap-4 border-b border-[#e1e6e5] bg-white px-5 py-4">
          <div className="min-w-0">
            <span className="text-[8px] font-medium uppercase tracking-[0.07em] text-[#8f9798]">{conteudoProducao.detalhesTitulo}</span>
            <h2 className="mt-1.5 truncate text-[14px] font-semibold tracking-[-0.02em] text-[#222728]">{tarefa.nome}</h2>
            <div className="mt-2 flex items-center gap-2">
              <SeloStatus texto={rotulosStatusTarefa[tarefa.status]} tom={tonsStatusTarefa[tarefa.status]} />
              <span className="text-[8px] text-[#909798]">{rotuloEtapaAtual(tarefa.etapaAtual)} · {tarefa.modoExecucao === "moneyprinter" ? "MoneyPrinterTurbo" : "Simulação"}</span>
            </div>
          </div>
          <button type="button" onClick={aoFechar} aria-label="Fechar detalhes" className="foco-acessivel grid size-8 shrink-0 place-items-center rounded-md text-[#798182] hover:bg-[#f1f4f4]"><X className="size-4" /></button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <section className="painel-superficie rounded-md p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-[7.5px] font-medium uppercase tracking-[0.06em] text-[#969d9e]">Progresso geral</span>
                <strong className="mt-1 block text-[22px] font-semibold tracking-[-0.04em] text-[#272c2d]">{tarefa.progresso}%</strong>
              </div>
              <div className="text-right text-[8px] leading-4 text-[#858d8e]">
                <span className="block">Decorrido {formatarTempoProducao(tarefa.tempoDecorridoSegundos)}</span>
                <span className="block">Restante ~{formatarTempoProducao(restante)}</span>
              </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#edf0f0]"><div className={`h-full rounded-full ${tarefa.status === "erro" ? "bg-[#c65e5e]" : "bg-[#2a9a84]"}`} style={{ width: `${tarefa.progresso}%` }} /></div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-md border border-[#e5e9e9] bg-[#fafbfb] p-3"><span className="block text-[7px] uppercase tracking-[0.055em] text-[#9aa1a2]">Saída</span><strong className="mt-1 block text-[8.5px] text-[#4b5253]">{tarefa.formato} · {tarefa.qualidade.split(" · ")[0]}</strong></div>
              <div className="rounded-md border border-[#e5e9e9] bg-[#fafbfb] p-3"><span className="block text-[7px] uppercase tracking-[0.055em] text-[#9aa1a2]">Versões</span><strong className="mt-1 block text-[8.5px] text-[#4b5253]">{tarefa.quantidadeVersoes} saída(s)</strong></div>
              <div className="rounded-md border border-[#e5e9e9] bg-[#fafbfb] p-3"><span className="block text-[7px] uppercase tracking-[0.055em] text-[#9aa1a2]">Codificador</span><strong className="mt-1 block text-[8.5px] leading-4 text-[#4b5253]">{tarefa.codificador}</strong></div>
              <label className="rounded-md border border-[#e5e9e9] bg-[#fafbfb] p-3"><span className="block text-[7px] uppercase tracking-[0.055em] text-[#9aa1a2]">Prioridade</span><select value={tarefa.prioridade} onChange={(evento) => aoAlterarPrioridade(evento.target.value as PrioridadeTarefaProducao)} className="mt-1 w-full bg-transparent text-[8.5px] font-medium text-[#4b5253] outline-none">{(["baixa", "normal", "alta"] as PrioridadeTarefaProducao[]).map((prioridade) => <option key={prioridade} value={prioridade}>{rotulosPrioridade[prioridade]}</option>)}</select></label>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {statusPermitePausa(tarefa.status) && <Botao onClick={aoPausar} className="h-9"><CirclePause className="size-3.5" /> Pausar tarefa</Botao>}
              {podeRetomar && <Botao onClick={aoRetomar} className="h-9"><CirclePlay className="size-3.5" /> Retomar tarefa</Botao>}
              {tarefa.status === "erro" && <Botao onClick={aoTentarNovamente} variante="primario" className="h-9"><RotateCcw className="size-3.5" /> Tentar novamente</Botao>}
              <Botao onClick={aoDuplicar} className="h-9"><Copy className="size-3.5" /> Duplicar</Botao>
              {!(["concluida", "cancelada"].includes(tarefa.status)) && <Botao onClick={aoCancelar} variante="fantasma" className="h-9 text-[#8c5c54]"><Ban className="size-3.5" /> Cancelar</Botao>}
              <Link href={`/criar-video?projeto=${encodeURIComponent(tarefa.projetoId)}`} className="foco-acessivel inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#dfe4e4] bg-white px-3 text-[9px] font-medium text-[#596162] hover:bg-[#f7f9f9]"><ExternalLink className="size-3.5" /> Abrir projeto</Link>
            </div>
          </section>

          {tarefa.erro && (
            <section className="mt-4 rounded-md border border-[#ebcccc] bg-[#fff6f5] p-4">
              <div className="flex items-start gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-white text-[#b95656] shadow-sm"><AlertTriangle className="size-4" /></span>
                <div>
                  <h3 className="text-[10px] font-semibold text-[#8f4444]">{tarefa.erro.titulo}</h3>
                  <p className="mt-1 text-[8.5px] leading-4 text-[#8c6764]">{tarefa.erro.descricao}</p>
                </div>
              </div>
              <div className="mt-3 space-y-2 rounded-md border border-[#efdddd] bg-white/70 p-3 text-[8px] leading-4 text-[#7a6260]">
                <p><strong>Causa provável:</strong> {tarefa.erro.causaProvavel}</p>
                <p><strong>Ação sugerida:</strong> {tarefa.erro.acaoSugerida}</p>
                {tarefa.erro.codigoTecnico && <code className="block rounded bg-[#f8eeee] px-2 py-1 text-[7.5px] text-[#9b5555]">{tarefa.erro.codigoTecnico}</code>}
              </div>
            </section>
          )}

          <section className="mt-4 painel-superficie rounded-md p-4">
            <h3 className="text-[10px] font-semibold text-[#303637]">Etapas do processamento</h3>
            <p className="mt-1 text-[8px] text-[#92999a]">A retomada poderá continuar a partir da etapa que falhou.</p>
            <div className="mt-3"><ProgressoEtapas etapas={tarefa.etapas} /></div>
          </section>

          <section className="mt-4 painel-superficie rounded-md p-4">
            <div className="flex items-center justify-between gap-4">
              <div><h3 className="flex items-center gap-2 text-[10px] font-semibold text-[#303637]"><FolderOpen className="size-3.5 text-[#74817e]" /> {conteudoProducao.arquivosTitulo}</h3><p className="mt-1 text-[8px] text-[#92999a]">Resultados vinculados a esta renderização.</p></div>
              <span className="rounded-full bg-[#edf4f2] px-2 py-1 text-[8px] font-medium text-[#287565]">{tarefa.arquivos.length}</span>
            </div>
            <div className="mt-3 space-y-2">
              {tarefa.arquivos.length === 0 ? <div className="rounded-md border border-dashed border-[#dfe4e4] px-3 py-6 text-center text-[8px] text-[#949b9c]">Os arquivos aparecerão após a finalização.</div> : tarefa.arquivos.map((arquivo) => { const Icone = iconesArquivo[arquivo.tipo]; return <div key={arquivo.id} className="flex items-center gap-3 rounded-md border border-[#e4e8e8] bg-[#fafbfb] p-3"><span className="grid size-8 shrink-0 place-items-center rounded-md bg-white text-[#6f7d79] ring-1 ring-[#e1e6e5]"><Icone className="size-3.5" /></span><div className="min-w-0 flex-1"><strong className="block truncate text-[8.5px] font-medium text-[#4b5253]">{arquivo.nome}</strong><span className="mt-1 block truncate text-[7px] text-[#969d9e]">{arquivo.tamanho} · {arquivo.caminho}</span></div></div>; })}
            </div>
          </section>

          <section className="mt-4 painel-superficie rounded-md p-4">
            <div className="flex items-center justify-between gap-4"><div><h3 className="flex items-center gap-2 text-[10px] font-semibold text-[#303637]"><TerminalSquare className="size-3.5 text-[#74817e]" /> {conteudoProducao.logsTitulo}</h3><p className="mt-1 text-[8px] text-[#92999a]">Mensagens simplificadas e histórico técnico da tarefa.</p></div>{tarefa.modoExecucao !== "moneyprinter" && !["concluida", "erro", "cancelada"].includes(tarefa.status) && <button type="button" onClick={aoSimularErro} className="foco-acessivel inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-[7.5px] text-[#91654d] hover:bg-[#faf2ec]"><TriangleAlert className="size-3" /> Simular falha</button>}</div>
            <div className="relative mt-4 space-y-3 pl-5 before:absolute before:bottom-1 before:left-[6px] before:top-1 before:w-px before:bg-[#e0e5e4]">
              {tarefa.logs.slice(0, 18).map((log) => <div key={log.id} className="relative"><span className={`absolute -left-5 top-1 size-3 rounded-full border-[3px] border-white ring-1 ring-[#d8e3e0] ${coresLog[log.nivel]}`} /><p className="text-[8px] leading-3.5 text-[#667071]">{log.mensagem}</p><span className="mt-1 flex items-center gap-1 text-[7px] text-[#a0a6a7]"><Clock3 className="size-2.5" /> {formatarHorarioProducao(log.criadoEm)}</span></div>)}
            </div>
          </section>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-md border border-[#e7e1d9] bg-[#fbf8f4] p-3 text-[8px] leading-4 text-[#826d58]"><span>Identificador: {tarefa.id.slice(0, 18)}…{tarefa.motorTarefaId ? ` · Motor ${tarefa.motorTarefaId.slice(0, 12)}…` : ""}</span>{podeExcluir && <button type="button" onClick={aoExcluir} className="foco-acessivel inline-flex items-center gap-1.5 rounded px-2 py-1 text-[#a04d4d] hover:bg-white"><Trash2 className="size-3" /> Excluir</button>}</div>
        </div>
      </aside>
    </div>
  );
}

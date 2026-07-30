"use client";

import {
  Archive,
  CheckCircle2,
  Clock3,
  Copy,
  Download,
  FileClock,
  FolderInput,
  History,
  RotateCcw,
  Save,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";

import { Botao } from "@/components/ui/botao";
import { SeloStatus } from "@/components/ui/selo-status";
import { conteudoProjetos } from "@/content/projetos";
import { rotulosStatusProjeto, tonsStatusProjeto } from "@/data/projetos";
import { formatarDataProjeto } from "@/lib/projetos-locais";
import type { PastaProjetoStudio, ProjetoStudio, StatusProjetoStudio } from "@/types/projeto";

const rotulosEvento = {
  criado: "Projeto criado",
  autosave: "Salvamento automático",
  versao: "Versão salva",
  restaurado: "Versão restaurada",
  duplicado: "Projeto duplicado",
  movido: "Pasta alterada",
  status: "Status atualizado",
  exportado: "Projeto exportado",
} as const;

export function PainelDetalhesProjeto({
  projeto,
  pastas,
  aoFechar,
  aoDuplicar,
  aoArquivar,
  aoMover,
  aoMudarStatus,
  aoCriarVersao,
  aoRestaurarVersao,
  aoExportar,
}: {
  projeto: ProjetoStudio;
  pastas: PastaProjetoStudio[];
  aoFechar: () => void;
  aoDuplicar: () => void;
  aoArquivar: () => void;
  aoMover: (pastaId: string | null) => void;
  aoMudarStatus: (status: StatusProjetoStudio) => void;
  aoCriarVersao: () => void;
  aoRestaurarVersao: (versaoId: string) => void;
  aoExportar: () => void;
}) {
  const arquivado = projeto.status === "arquivado";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#17211f]/18 backdrop-blur-[1px]" onMouseDown={aoFechar}>
      <aside
        className="flex h-full w-[390px] flex-col border-l border-[#dce2e1] bg-[#f8f9f9] shadow-[-18px_0_50px_rgba(22,31,29,.12)]"
        onMouseDown={(evento) => evento.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-[#e1e6e5] bg-white px-5 py-4">
          <div className="min-w-0">
            <span className="text-[8px] font-medium uppercase tracking-[0.07em] text-[#8f9798]">{conteudoProjetos.detalhesTitulo}</span>
            <h2 className="mt-1.5 truncate text-[14px] font-semibold tracking-[-0.02em] text-[#222728]">{projeto.nome}</h2>
            <div className="mt-2 flex items-center gap-2">
              <SeloStatus texto={rotulosStatusProjeto[projeto.status]} tom={tonsStatusProjeto[projeto.status]} />
              <span className="text-[8px] text-[#909798]">Atualizado {formatarDataProjeto(projeto.atualizadoEm).toLowerCase()}</span>
            </div>
          </div>
          <button type="button" onClick={aoFechar} aria-label="Fechar detalhes" className="foco-acessivel grid size-8 shrink-0 place-items-center rounded-md text-[#798182] hover:bg-[#f1f4f4]">
            <X className="size-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <section className="painel-superficie rounded-md p-4">
            <p className="text-[9px] leading-4 text-[#747c7d]">{projeto.descricao}</p>

            <div className="mt-4 grid grid-cols-3 divide-x divide-[#e7ebeb] rounded-md border border-[#e4e8e8] bg-[#fafbfb] py-3">
              <div className="px-3"><strong className="block text-[11px] text-[#303536]">{projeto.progresso}%</strong><span className="mt-1 block text-[7px] uppercase tracking-[0.06em] text-[#989fa0]">Progresso</span></div>
              <div className="px-3"><strong className="block text-[11px] text-[#303536]">{projeto.versoes.length}</strong><span className="mt-1 block text-[7px] uppercase tracking-[0.06em] text-[#989fa0]">Versões</span></div>
              <div className="px-3"><strong className="block capitalize text-[11px] text-[#303536]">{projeto.configuracao.formato}</strong><span className="mt-1 block text-[7px] uppercase tracking-[0.06em] text-[#989fa0]">Formato</span></div>
            </div>

            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-[8px] font-medium uppercase tracking-[0.055em] text-[#8d9596]"><FolderInput className="size-3" /> Pasta</span>
                <select value={projeto.pastaId ?? ""} onChange={(evento) => aoMover(evento.target.value || null)} className="foco-acessivel h-9 w-full rounded-md border border-[#dfe4e4] bg-white px-3 text-[9.5px] text-[#4f5758]">
                  <option value="">Sem pasta</option>
                  {pastas.map((pasta) => <option key={pasta.id} value={pasta.id}>{pasta.nome}</option>)}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-[8px] font-medium uppercase tracking-[0.055em] text-[#8d9596]"><CheckCircle2 className="size-3" /> Status</span>
                <select value={projeto.status} onChange={(evento) => aoMudarStatus(evento.target.value as StatusProjetoStudio)} className="foco-acessivel h-9 w-full rounded-md border border-[#dfe4e4] bg-white px-3 text-[9.5px] text-[#4f5758]">
                  <option value="rascunho">Rascunho</option>
                  <option value="em-edicao">Em edição</option>
                  <option value="pronto">Pronto para renderizar</option>
                  <option value="concluido">Concluído</option>
                  <option value="arquivado">Arquivado</option>
                </select>
              </label>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {!arquivado && (
                <Link href={`/criar-video?projeto=${encodeURIComponent(projeto.id)}`} className="foco-acessivel inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#18806c] bg-[#1f9b83] px-3 text-[9.5px] font-medium text-white hover:bg-[#18866f]">
                  <Sparkles className="size-3.5" /> Continuar edição
                </Link>
              )}
              <Botao onClick={aoCriarVersao} className="h-9 px-3"><Save className="size-3.5" /> Salvar versão</Botao>
              <Botao onClick={aoDuplicar} className="h-9 px-3"><Copy className="size-3.5" /> Duplicar</Botao>
              <Botao onClick={aoExportar} className="h-9 px-3"><Download className="size-3.5" /> Exportar JSON</Botao>
              <Botao onClick={aoArquivar} className="col-span-2 h-9 px-3" variante="fantasma"><Archive className="size-3.5" /> {arquivado ? "Restaurar como rascunho" : "Arquivar projeto"}</Botao>
            </div>
          </section>

          <section className="mt-4 painel-superficie rounded-md p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="flex items-center gap-2 text-[10px] font-semibold text-[#303536]"><FileClock className="size-3.5 text-[#73807d]" /> {conteudoProjetos.versoesTitulo}</h3>
                <p className="mt-1 text-[8px] text-[#92999a]">Restaure configurações sem perder o histórico atual.</p>
              </div>
              <span className="rounded-full bg-[#edf4f2] px-2 py-1 text-[8px] font-medium text-[#287565]">{projeto.versoes.length}</span>
            </div>

            <div className="mt-3 space-y-2">
              {projeto.versoes.map((versao) => (
                <div key={versao.id} className="flex items-center gap-3 rounded-md border border-[#e5e9e9] bg-[#fafbfb] p-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-md bg-white text-[9px] font-semibold text-[#397a6d] ring-1 ring-[#dfe6e4]">V{versao.numero}</span>
                  <div className="min-w-0 flex-1">
                    <strong className="block truncate text-[9px] font-medium text-[#434a4b]">{versao.nome}</strong>
                    <span className="mt-1 block text-[7.5px] text-[#92999a]">{formatarDataProjeto(versao.criadaEm)} · etapa {versao.etapa}</span>
                  </div>
                  <button type="button" onClick={() => aoRestaurarVersao(versao.id)} className="foco-acessivel grid size-7 place-items-center rounded-md text-[#73807d] hover:bg-white" aria-label={`Restaurar ${versao.nome}`}>
                    <RotateCcw className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-4 painel-superficie rounded-md p-4">
            <h3 className="flex items-center gap-2 text-[10px] font-semibold text-[#303536]"><History className="size-3.5 text-[#73807d]" /> {conteudoProjetos.historicoTitulo}</h3>
            <div className="relative mt-4 space-y-4 pl-5 before:absolute before:bottom-1 before:left-[6px] before:top-1 before:w-px before:bg-[#e0e5e4]">
              {projeto.historico.slice(0, 12).map((evento) => (
                <div key={evento.id} className="relative">
                  <span className="absolute -left-5 top-1 size-3 rounded-full border-[3px] border-white bg-[#74a99e] ring-1 ring-[#d8e3e0]" />
                  <strong className="block text-[8.5px] font-medium text-[#4d5556]">{rotulosEvento[evento.tipo]}</strong>
                  <p className="mt-1 text-[8px] leading-3.5 text-[#858d8e]">{evento.descricao}</p>
                  <span className="mt-1.5 flex items-center gap-1 text-[7px] text-[#a0a6a7]"><Clock3 className="size-2.5" /> {formatarDataProjeto(evento.criadoEm)}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-4 rounded-md border border-[#e7e1d9] bg-[#fbf8f4] p-3 text-[8px] leading-4 text-[#826d58]">{conteudoProjetos.avisoLocal}</div>
        </div>
      </aside>
    </div>
  );
}

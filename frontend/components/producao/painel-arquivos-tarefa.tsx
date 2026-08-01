"use client";

import {
  AlertCircle,
  ExternalLink,
  FileAudio2,
  FileCode2,
  FileText,
  FileVideo2,
  FolderOpen,
  LoaderCircle,
  Play,
} from "lucide-react";
import { useState } from "react";

import {
  abrirArquivoExportado,
  abrirPastaExportacao,
  revelarArquivoExportado,
} from "@/lib/exportacoes-nativas";
import type { ArquivoTarefaProducao, TarefaProducao } from "@/types/producao";

const iconesArquivo = {
  video: FileVideo2,
  audio: FileAudio2,
  legenda: FileText,
  log: FileCode2,
};

function caminhoAbsoluto(caminho: string) {
  return /^[a-zA-Z]:[\\/]/.test(caminho) || caminho.startsWith("/");
}

function CartaoArquivo({ arquivo }: { arquivo: ArquivoTarefaProducao }) {
  const [acao, setAcao] = useState<"abrir" | "revelar" | null>(null);
  const [erro, setErro] = useState("");
  const Icone = iconesArquivo[arquivo.tipo];
  const reproduzivel = arquivo.tipo === "video" || arquivo.tipo === "audio";

  async function executar(tipo: "abrir" | "revelar") {
    setErro("");
    setAcao(tipo);
    try {
      if (tipo === "abrir") await abrirArquivoExportado(arquivo.caminho);
      else await revelarArquivoExportado(arquivo.caminho);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : String(falha));
    } finally {
      setAcao(null);
    }
  }

  return (
    <div className="rounded-md border border-[#e2e7e6] bg-[#fafbfb] p-3">
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-white text-[#5f716d] ring-1 ring-[#dfe5e4]">
          <Icone className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <strong className="block truncate text-[10px] font-medium text-[#28302f]">{arquivo.nome}</strong>
          <span className="mt-1 block truncate text-[8px] text-[#7e8887]">{arquivo.tamanho}</span>
          <span title={arquivo.caminho} className="mt-0.5 block truncate text-[7.5px] text-[#a0a7a6]">
            {arquivo.caminho}
          </span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => void executar("abrir")}
          disabled={acao !== null}
          className="foco-acessivel inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-[#b9d9d1] bg-[#edf7f4] px-2 text-[8.5px] font-medium text-[#1d7866] hover:bg-[#e3f2ee] disabled:opacity-60"
        >
          {acao === "abrir" ? <LoaderCircle className="size-3 animate-spin" /> : reproduzivel ? <Play className="size-3" /> : <ExternalLink className="size-3" />}
          {reproduzivel ? "Reproduzir" : "Abrir arquivo"}
        </button>
        <button
          type="button"
          onClick={() => void executar("revelar")}
          disabled={acao !== null}
          className="foco-acessivel inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-[#dfe4e3] bg-white px-2 text-[8.5px] font-medium text-[#586260] hover:bg-[#f4f6f6] disabled:opacity-60"
        >
          {acao === "revelar" ? <LoaderCircle className="size-3 animate-spin" /> : <FolderOpen className="size-3" />}
          Mostrar na pasta
        </button>
      </div>

      {erro && (
        <p className="mt-2 flex items-start gap-1.5 rounded-md bg-[#fff2f1] px-2.5 py-2 text-[8px] leading-4 text-[#9b5550]">
          <AlertCircle className="mt-0.5 size-3 shrink-0" />
          {erro}
        </p>
      )}
    </div>
  );
}

export function PainelArquivosTarefa({ tarefa }: { tarefa: TarefaProducao }) {
  const [abrindoPasta, setAbrindoPasta] = useState(false);
  const [erroPasta, setErroPasta] = useState("");
  const simulada = tarefa.modoExecucao !== "moneyprinter";
  const pastaPronta = !simulada && caminhoAbsoluto(tarefa.pastaSaida);

  async function abrirPasta() {
    setErroPasta("");
    setAbrindoPasta(true);
    try {
      await abrirPastaExportacao(tarefa.pastaSaida);
    } catch (falha) {
      setErroPasta(falha instanceof Error ? falha.message : String(falha));
    } finally {
      setAbrindoPasta(false);
    }
  }

  return (
    <section className="mt-4 painel-superficie rounded-md p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2 text-[10.5px] font-semibold text-[#28302f]">
            <FolderOpen className="size-3.5 text-[#2a907b]" />
            Arquivos gerados
          </h3>
          <p className="mt-1 text-[8.5px] text-[#858e8d]">
            Vídeos reais são copiados para uma pasta permanente do MakeFlux Studio.
          </p>
        </div>
        <span className="rounded-full bg-[#edf5f2] px-2 py-1 text-[8px] font-medium text-[#287565]">
          {tarefa.arquivos.length}
        </span>
      </div>

      {simulada ? (
        <div className="mt-3 rounded-md border border-[#eadfc8] bg-[#fcf8ef] p-3.5">
          <strong className="block text-[9.5px] font-medium text-[#765f37]">Nenhum vídeo foi renderizado</strong>
          <p className="mt-1 text-[8.5px] leading-4 text-[#8b7651]">
            Esta tarefa foi executada em modo simulação. Ela valida apenas o fluxo da interface. Conecte o MoneyPrinterTurbo em Integrações e crie uma nova renderização para gerar arquivos reais.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-3 flex items-center justify-between gap-3 rounded-md border border-[#e2e7e6] bg-[#f7f9f9] p-3">
            <div className="min-w-0">
              <span className="block text-[7.5px] font-medium uppercase tracking-[0.05em] text-[#969e9d]">Pasta desta renderização</span>
              <strong title={tarefa.pastaSaida} className="mt-1 block truncate text-[8.5px] font-medium text-[#4d5755]">
                {tarefa.pastaSaida}
              </strong>
            </div>
            <button
              type="button"
              onClick={() => void abrirPasta()}
              disabled={!pastaPronta || abrindoPasta}
              className="foco-acessivel inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-[#dce3e1] bg-white px-2.5 text-[8.5px] font-medium text-[#52605d] hover:bg-[#f2f5f4] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {abrindoPasta ? <LoaderCircle className="size-3 animate-spin" /> : <FolderOpen className="size-3" />}
              Abrir pasta
            </button>
          </div>

          {erroPasta && (
            <p className="mt-2 flex items-start gap-1.5 rounded-md bg-[#fff2f1] px-2.5 py-2 text-[8px] leading-4 text-[#9b5550]">
              <AlertCircle className="mt-0.5 size-3 shrink-0" />
              {erroPasta}
            </p>
          )}

          <div className="mt-3 space-y-2">
            {tarefa.arquivos.length === 0 ? (
              <div className="rounded-md border border-dashed border-[#dbe2e0] px-3 py-6 text-center text-[8.5px] leading-4 text-[#8a9392]">
                {tarefa.status === "concluida"
                  ? "A renderização terminou sem arquivos disponíveis. Consulte os logs da tarefa."
                  : "A pasta já será criada no início da produção. Os arquivos aparecerão aqui após a finalização."}
              </div>
            ) : (
              tarefa.arquivos.map((arquivo) => <CartaoArquivo key={arquivo.id} arquivo={arquivo} />)
            )}
          </div>
        </>
      )}
    </section>
  );
}

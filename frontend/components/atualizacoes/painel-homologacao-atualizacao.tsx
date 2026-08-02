import { CheckCircle2, CircleAlert, Database, FileKey2, RotateCcw, ShieldCheck } from "lucide-react";

import { Botao } from "@/components/ui/botao";
import type { PainelHomologacaoAtualizador, RegistroAtualizacaoReal } from "@/types/atualizador";

function dataHora(valor: number | null) {
  return valor ? new Date(valor).toLocaleString("pt-BR") : "Aguardando";
}

function seloStatus(status: string) {
  if (status.startsWith("confirmada")) return "bg-[#e7f4f0] text-[#247762]";
  if (["dados-inconsistentes", "dados-inconsistentes-legado", "versao-inesperada", "nao-aplicada"].includes(status)) {
    return "bg-[#fff0e9] text-[#a34f3f]";
  }
  return "bg-[#fff3dc] text-[#8c692d]";
}

function ResumoOperacao({ operacao }: { operacao: RegistroAtualizacaoReal }) {
  const preservado = operacao.bancoIntegroDepois === true
    && (operacao.workspaceRegistrosDepois ?? 0) >= operacao.workspaceRegistrosAntes
    && (!operacao.cofreExistiaAntes || operacao.cofreExisteDepois === true);
  return (
    <div className="rounded-md border border-[#e6ebea] bg-[#fafbfb] p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <strong className="text-[9px] text-[#343b3a]">
            {operacao.tipo === "rollback" ? "Rollback" : "Atualização"} {operacao.versaoOrigem} → {operacao.versaoDestino}
          </strong>
          <p className="mt-1 text-[7.5px] leading-4 text-[#7c8584]">{operacao.mensagem}</p>
          {!operacao.checkpointPrevio ? <span className="mt-1.5 inline-block rounded bg-[#fff3dc] px-2 py-1 text-[6.5px] font-semibold text-[#8c692d]">Primeira transição sem checkpoint prévio</span> : null}
        </div>
        <span className={`rounded-full px-2 py-1 text-[6.5px] font-semibold ${seloStatus(operacao.status)}`}>
          {operacao.status.replaceAll("-", " ")}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-[7px]">
        <div className="rounded bg-white px-2.5 py-2 text-[#747d7c]">
          <Database className="mb-1 size-3 text-[#288a76]" />
          SQLite {operacao.bancoIntegroDepois === null ? "aguardando" : operacao.bancoIntegroDepois ? "íntegro" : "com falha"}
        </div>
        <div className="rounded bg-white px-2.5 py-2 text-[#747d7c]">
          <FileKey2 className="mb-1 size-3 text-[#288a76]" />
          Cofre {operacao.cofreExistiaAntes ? (operacao.cofreExisteDepois === null ? "aguardando" : operacao.cofreExisteDepois ? "preservado" : "ausente") : "não inicializado"}
        </div>
        <div className="rounded bg-white px-2.5 py-2 text-[#747d7c]">
          {preservado ? <CheckCircle2 className="mb-1 size-3 text-[#288a76]" /> : <CircleAlert className="mb-1 size-3 text-[#a67a35]" />}
          {operacao.checkpointPrevio ? "Dados comparados" : "Integridade atual"}: {dataHora(operacao.concluidaEm)}
        </div>
      </div>
    </div>
  );
}

export function PainelHomologacaoAtualizacao({
  painel,
  aoRecarregar,
  aoDescartar,
}: {
  painel: PainelHomologacaoAtualizador | null;
  aoRecarregar: () => Promise<unknown>;
  aoDescartar: () => Promise<unknown>;
}) {
  const pendente = painel?.checkpointPendente ?? null;
  const ultima = painel?.ultimaOperacao ?? null;
  return (
    <section className="rounded-md border border-[#e1e7e6] bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold text-[#303737]">
            <ShieldCheck className="size-3.5 text-[#278a76]" /> Homologação pós-atualização
          </div>
          <p className="mt-1 text-[7.5px] text-[#87908f]">
            Confirma a nova versão e a preservação do SQLite e do cofre após o reinício.
          </p>
        </div>
        <Botao variante="fantasma" className="h-7 px-2 text-[8px]" onClick={() => void aoRecarregar()}>
          Atualizar estado
        </Botao>
      </div>

      <div className="mt-4">
        {pendente ? (
          <div className="rounded-md border border-[#eadfc7] bg-[#fff9ec] p-3">
            <div className="flex items-start gap-2">
              <RotateCcw className="mt-0.5 size-3.5 shrink-0 text-[#9c7331]" />
              <div className="min-w-0 flex-1">
                <strong className="text-[8.5px] text-[#72551f]">Checkpoint aguardando confirmação</strong>
                <p className="mt-1 text-[7.5px] leading-4 text-[#806b43]">{pendente.mensagem}</p>
                <p className="mt-1 truncate text-[6.5px] text-[#9a8969]">Snapshot: {pendente.snapshotPath}</p>
              </div>
              <Botao className="h-7 px-2 text-[7.5px]" onClick={() => void aoDescartar()}>Descartar</Botao>
            </div>
          </div>
        ) : ultima ? (
          <ResumoOperacao operacao={ultima} />
        ) : (
          <div className="rounded-md bg-[#f7f9f9] px-3 py-5 text-center text-[8px] text-[#899190]">
            A primeira atualização real ainda não foi executada nesta instalação.
          </div>
        )}
      </div>

      {painel?.historico.length ? (
        <div className="mt-3 border-t border-[#edf0f0] pt-3">
          <div className="flex items-center justify-between text-[7px] text-[#8a9392]">
            <span>{painel.historico.length} operação(ões) nativa(s) registrada(s)</span>
            <span>Rollback local: {painel.rollbackDisponivel ? "snapshot disponível" : "indisponível"}</span>
          </div>
        </div>
      ) : null}
    </section>
  );
}

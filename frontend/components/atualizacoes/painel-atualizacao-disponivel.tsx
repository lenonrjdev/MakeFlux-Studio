import { Download, RefreshCw, RotateCcw, ShieldCheck } from "lucide-react";

import { Botao } from "@/components/ui/botao";
import { rotulosStatusAtualizador } from "@/data/atualizador";
import type {
  StatusAtualizadorNativo,
  WorkspaceAtualizador,
} from "@/types/atualizador";

export function PainelAtualizacaoDisponivel({
  workspace,
  runtime,
  aoVerificar,
  aoRollback,
  aoBaixar,
}: {
  workspace: WorkspaceAtualizador;
  runtime: StatusAtualizadorNativo | null;
  aoVerificar: () => Promise<unknown>;
  aoRollback: () => Promise<unknown>;
  aoBaixar: () => Promise<unknown>;
}) {
  const ocupado = ["verificando", "baixando", "instalando"].includes(
    workspace.status,
  );
  const atualizacaoDisponivel =
    workspace.status === "disponivel" ? workspace.atualizacao : null;

  return (
    <section className="rounded-md border border-[#e1e7e6] bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold text-[#303737]">
            <RefreshCw
              className={`size-3.5 text-[#278a76] ${workspace.status === "verificando" ? "animate-spin" : ""}`}
            />
            Verificação de versão
          </div>
          <p className="mt-1 text-[7.5px] text-[#87908f]">
            Status: {rotulosStatusAtualizador[workspace.status]}
          </p>
        </div>

        <div className="flex gap-2">
          <Botao
            disabled={ocupado || !runtime?.configurado}
            onClick={() => void aoRollback()}
          >
            <RotateCcw className="size-3.5" />
            Procurar rollback
          </Botao>
          <Botao
            variante="primario"
            disabled={ocupado || !runtime?.configurado}
            onClick={() => void aoVerificar()}
          >
            <RefreshCw className="size-3.5" />
            Verificar agora
          </Botao>
        </div>
      </div>

      <div className="mt-4 rounded-md border border-[#e8eceb] bg-[#f8faf9] p-4">
        {atualizacaoDisponivel ? (
          <div className="flex items-start justify-between gap-5">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-[#258773]" />
                <strong className="text-[13px] tracking-[-0.025em] text-[#303737]">
                  {atualizacaoDisponivel.rollback
                    ? "Ponto de recuperação"
                    : "Nova versão"}{" "}
                  {atualizacaoDisponivel.versao}
                </strong>
              </div>
              <p className="mt-2 max-w-[620px] whitespace-pre-wrap text-[8px] leading-4 text-[#737c7b]">
                {atualizacaoDisponivel.notas}
              </p>
              {atualizacaoDisponivel.publicadaEm ? (
                <span className="mt-2 block text-[7px] text-[#9aa1a1]">
                  Publicada em{" "}
                  {new Date(atualizacaoDisponivel.publicadaEm).toLocaleString(
                    "pt-BR",
                  )}
                </span>
              ) : null}
            </div>
            <Botao variante="primario" onClick={() => void aoBaixar()}>
              <Download className="size-3.5" />
              Baixar pacote
            </Botao>
          </div>
        ) : (
          <p className="text-[8.5px] leading-5 text-[#77807f]">
            {workspace.mensagem}
          </p>
        )}
      </div>
    </section>
  );
}

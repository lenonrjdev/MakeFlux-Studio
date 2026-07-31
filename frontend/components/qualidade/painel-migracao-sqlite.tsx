"use client";

import { Database, Download, RefreshCw } from "lucide-react";
import { useState } from "react";

import { CartaoConfiguracao } from "@/components/configuracoes/cartao-configuracao";
import { Botao } from "@/components/ui/botao";
import { SeloStatus } from "@/components/ui/selo-status";
import { conteudoQualidade } from "@/content/qualidade";
import {
  hidratarLocalStorageDoSqlite,
  sincronizarWorkspaceComSqlite,
} from "@/lib/persistencia-nativa";
import type { StatusBancoLocal } from "@/types/qualidade";

export function PainelMigracaoSqlite({
  status,
  aoAtualizar,
  aoNotificar,
}: {
  status: StatusBancoLocal | null;
  aoAtualizar: () => Promise<void>;
  aoNotificar: (mensagem: string, tipo?: "sucesso" | "aviso") => void;
}) {
  const [processando, setProcessando] = useState(false);

  async function sincronizar() {
    setProcessando(true);
    try {
      const resultado = await sincronizarWorkspaceComSqlite();
      await aoAtualizar();
      aoNotificar(`${resultado.migrados} registros sincronizados com o SQLite.`);
    } catch (erro) {
      aoNotificar(erro instanceof Error ? erro.message : "Falha na migração.", "aviso");
    } finally {
      setProcessando(false);
    }
  }

  async function restaurarFallback() {
    setProcessando(true);
    try {
      const restaurados = await hidratarLocalStorageDoSqlite();
      aoNotificar(`${restaurados} registros restaurados para o fallback local.`);
    } catch (erro) {
      aoNotificar(erro instanceof Error ? erro.message : "Falha ao restaurar.", "aviso");
    } finally {
      setProcessando(false);
    }
  }

  return (
    <CartaoConfiguracao
      titulo="Migração e persistência SQLite"
      descricao="Cópia transacional e idempotente dos workspaces locais para o banco nativo."
      acao={<SeloStatus texto={status?.disponivel ? "Banco disponível" : "Aguardando desktop"} tom={status?.disponivel ? "verde" : "neutro"} />}
    >
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-md border border-[#e3e8e7] bg-[#fafbfb] p-3">
          <span className="text-[8px] uppercase tracking-[0.08em] text-[#909798]">Registros</span>
          <strong className="mt-2 block text-[16px] text-[#2c3233]">{status?.registros ?? 0}</strong>
        </div>
        <div className="rounded-md border border-[#e3e8e7] bg-[#fafbfb] p-3">
          <span className="text-[8px] uppercase tracking-[0.08em] text-[#909798]">Tamanho aproximado</span>
          <strong className="mt-2 block text-[16px] text-[#2c3233]">
            {Math.max(0, Math.round((status?.bytesAproximados ?? 0) / 1024))} KB
          </strong>
        </div>
        <div className="rounded-md border border-[#e3e8e7] bg-[#fafbfb] p-3">
          <span className="text-[8px] uppercase tracking-[0.08em] text-[#909798]">Última migração</span>
          <strong className="mt-2 block text-[11px] text-[#2c3233]">
            {status?.ultimaMigracaoEm ? new Date(status.ultimaMigracaoEm).toLocaleString("pt-BR") : "Ainda não executada"}
          </strong>
        </div>
      </div>
      <p className="text-[9px] leading-5 text-[#7c8585]">{conteudoQualidade.avisoMigracao}</p>
      <div className="flex flex-wrap gap-2">
        <Botao variante="primario" disabled={processando} onClick={() => void sincronizar()}>
          <RefreshCw className={`size-3.5 ${processando ? "animate-spin" : ""}`} />
          Sincronizar agora
        </Botao>
        <Botao disabled={processando} onClick={() => void restaurarFallback()}>
          <Download className="size-3.5" />
          Restaurar fallback
        </Botao>
        {status?.caminho && (
          <span className="flex min-w-0 items-center gap-2 rounded-md border border-[#e2e7e6] bg-[#fafbfb] px-3 text-[8.5px] text-[#7c8585]">
            <Database className="size-3" />
            <span className="max-w-[390px] truncate">{status.caminho}</span>
          </span>
        )}
      </div>
    </CartaoConfiguracao>
  );
}

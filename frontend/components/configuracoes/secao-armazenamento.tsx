"use client";

import { Trash2 } from "lucide-react";

import { CartaoConfiguracao } from "@/components/configuracoes/cartao-configuracao";
import { Botao } from "@/components/ui/botao";
import { CampoFormulario, classesCampo } from "@/components/ui/campo-formulario";
import { Interruptor } from "@/components/ui/interruptor";
import type { ConfiguracaoArmazenamento, UsoArmazenamentoLocal } from "@/types/configuracoes";

function formatarBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SecaoArmazenamento({ armazenamento, uso, aoAtualizar, aoLimpar, aoNotificar }: { armazenamento: ConfiguracaoArmazenamento; uso: UsoArmazenamentoLocal; aoAtualizar: (dados: Partial<ConfiguracaoArmazenamento>) => void; aoLimpar: () => number; aoNotificar: (mensagem: string, tipo?: "sucesso" | "aviso") => void }) {
  return (
    <div className="space-y-4">
      <CartaoConfiguracao titulo="Uso local" descricao="MediÃ§Ã£o real dos dados persistidos pelo frontend no computador." acao={<span className="rounded-md bg-[#edf7f4] px-2.5 py-1 text-[9px] font-medium text-[#1b7966]">{formatarBytes(uso.totalBytes)}</span>}>
        <div className="space-y-2">
          {uso.itens.slice(0, 8).map((item) => (
            <div key={item.chave} className="flex items-center justify-between gap-4 rounded-md border border-[#e6eaea] bg-[#fafbfb] px-3 py-2.5">
              <div className="min-w-0"><strong className="block text-[9.5px] font-medium text-[#303637]">{item.categoria}</strong><span className="block truncate text-[8px] text-[#9aa1a2]">{item.chave}</span></div>
              <span className="shrink-0 text-[9px] text-[#697172]">{formatarBytes(item.bytes)}</span>
            </div>
          ))}
          {uso.itens.length === 0 && <p className="text-[9.5px] text-[#8b9293]">Nenhum dado local medido.</p>}
        </div>
      </CartaoConfiguracao>
      <CartaoConfiguracao titulo="PolÃ­tica de armazenamento" descricao="Defina retenÃ§Ã£o, limites e avisos preventivos.">
        <div className="grid grid-cols-3 gap-4">
          <CampoFormulario rotulo="Limite do cache"><div className="relative"><input type="number" min={1} max={500} value={armazenamento.limiteCacheGb} onChange={(e) => aoAtualizar({ limiteCacheGb: Number(e.target.value) })} className={`${classesCampo} h-10 pr-10`} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-[#92999a]">GB</span></div></CampoFormulario>
          <CampoFormulario rotulo="Reter temporÃ¡rios"><div className="relative"><input type="number" min={1} max={365} value={armazenamento.retencaoTemporariosDias} onChange={(e) => aoAtualizar({ retencaoTemporariosDias: Number(e.target.value) })} className={`${classesCampo} h-10 pr-12`} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-[#92999a]">dias</span></div></CampoFormulario>
          <CampoFormulario rotulo="Avisar com espaÃ§o livre"><div className="relative"><input type="number" min={1} max={500} value={armazenamento.avisarEspacoLivreGb} onChange={(e) => aoAtualizar({ avisarEspacoLivreGb: Number(e.target.value) })} className={`${classesCampo} h-10 pr-10`} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-[#92999a]">GB</span></div></CampoFormulario>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Interruptor ativo={armazenamento.limparTemporariosAutomaticamente} aoAlterar={(valor) => aoAtualizar({ limparTemporariosAutomaticamente: valor })} rotulo="Limpeza automÃ¡tica" descricao="Remove transferÃªncias temporÃ¡rias expiradas." />
          <Interruptor ativo={armazenamento.manterExportacoes} aoAlterar={(valor) => aoAtualizar({ manterExportacoes: valor })} rotulo="Nunca remover exportaÃ§Ãµes" descricao="Protege os vÃ­deos finalizados durante limpezas." />
        </div>
        <div className="flex items-center justify-between border-t border-[#edf0f0] pt-4">
          <div><strong className="text-[10px] font-medium text-[#303637]">Limpar temporÃ¡rios agora</strong><p className="mt-1 text-[8.5px] text-[#92999a]">NÃ£o remove projetos, recursos ou exportaÃ§Ãµes.</p></div>
          <Botao onClick={() => { const total = aoLimpar(); aoNotificar(total ? `${total} registros temporÃ¡rios removidos.` : "Nenhum temporÃ¡rio encontrado."); }}><Trash2 className="size-3.5" /> Limpar</Botao>
        </div>
      </CartaoConfiguracao>
    </div>
  );
}


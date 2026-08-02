"use client";

import { CheckCircle2, ExternalLink, RefreshCw } from "lucide-react";

import { CartaoConfiguracao } from "@/components/configuracoes/cartao-configuracao";
import { Botao, BotaoLink } from "@/components/ui/botao";
import { Interruptor } from "@/components/ui/interruptor";
import { conteudoConfiguracoes } from "@/content/configuracoes";
import type { ConfiguracaoAtualizacoes } from "@/types/configuracoes";

export function SecaoAtualizacoes({ atualizacoes, verificando, aoAtualizar, aoVerificar, aoNotificar }: { atualizacoes: ConfiguracaoAtualizacoes; verificando: boolean; aoAtualizar: (dados: Partial<ConfiguracaoAtualizacoes>) => void; aoVerificar: () => Promise<{ mensagem: string }>; aoNotificar: (mensagem: string, tipo?: "sucesso" | "aviso") => void }) {
  return (
    <div className="space-y-4">
      <CartaoConfiguracao titulo="Versões instaladas" descricao="Aplicativo desktop e motor principal de geração.">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md border border-[#e2e7e6] bg-[#fafbfb] p-4"><span className="text-[8.5px] uppercase tracking-[0.06em] text-[#92999a]">MakeFlux Studio</span><strong className="mt-2 block text-[18px] tracking-[-0.03em]">v{atualizacoes.versaoAplicativo}</strong><span className="mt-2 inline-flex items-center gap-1 text-[9px] text-[#27816d]"><CheckCircle2 className="size-3" /> Instalado</span></div>
          <div className="rounded-md border border-[#e2e7e6] bg-[#fafbfb] p-4"><span className="text-[8.5px] uppercase tracking-[0.06em] text-[#92999a]">MoneyPrinterTurbo</span><strong className="mt-2 block text-[18px] tracking-[-0.03em]">{atualizacoes.versaoMotor}</strong><span className="mt-2 text-[9px] text-[#8b9293]">Será detectado pelo adaptador nativo.</span></div>
        </div>
        <div className="flex items-center justify-between border-t border-[#edf0f0] pt-4">
          <div><strong className="text-[10px] text-[#303637]">Última verificação</strong><p className="mt-1 text-[8.5px] text-[#92999a]">{atualizacoes.ultimaVerificacaoEm ? new Date(atualizacoes.ultimaVerificacaoEm).toLocaleString("pt-BR") : "Nunca"}</p></div>
          <div className="flex gap-2"><BotaoLink href="/atualizacoes"><ExternalLink className="size-3.5" /> Abrir central</BotaoLink><Botao variante="primario" disabled={verificando} onClick={() => void aoVerificar().then((resultado) => aoNotificar(resultado.mensagem))}><RefreshCw className={`size-3.5 ${verificando ? "animate-spin" : ""}`} /> {verificando ? "Verificando..." : "Verificar agora"}</Botao></div>
        </div>
      </CartaoConfiguracao>
      <CartaoConfiguracao titulo="Política de atualização" descricao="Configure como o aplicativo consulta e recebe releases assinadas.">
        <label className="block"><strong className="mb-2 block text-[10.5px] text-[#303637]">Canal</strong><select value={atualizacoes.canal} onChange={(e) => aoAtualizar({ canal: e.target.value as ConfiguracaoAtualizacoes["canal"] })} className="h-10 w-full rounded-md border border-[#dfe4e4] bg-white px-3 text-[10.5px]"><option value="estavel">Estável</option><option value="beta">Beta</option></select></label>
        <div className="grid grid-cols-2 gap-3">
          <Interruptor ativo={atualizacoes.verificarAutomaticamente} aoAlterar={(valor) => aoAtualizar({ verificarAutomaticamente: valor })} rotulo="Verificar automaticamente" />
          <Interruptor ativo={atualizacoes.baixarAutomaticamente} aoAlterar={(valor) => aoAtualizar({ baixarAutomaticamente: valor })} rotulo="Baixar automaticamente" />
          <Interruptor ativo={atualizacoes.incluirMotor} aoAlterar={(valor) => aoAtualizar({ incluirMotor: valor })} rotulo="Incluir o motor" descricao="Verifica compatibilidade do MoneyPrinterTurbo." />
          <Interruptor ativo={atualizacoes.permitirRollback} aoAlterar={(valor) => aoAtualizar({ permitirRollback: valor })} rotulo="Permitir rollback" descricao="Mantém a versão anterior para recuperação." />
        </div>
      </CartaoConfiguracao>
      <div className="rounded-md border border-[#e6e2d7] bg-[#fbf8f1] p-4 text-[9.5px] leading-5 text-[#7f6c45]">{conteudoConfiguracoes.avisoAtualizacoes}</div>
    </div>
  );
}

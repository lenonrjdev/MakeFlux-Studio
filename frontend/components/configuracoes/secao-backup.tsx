"use client";

import { Archive, Download, Upload } from "lucide-react";
import { useRef, useState } from "react";

import { CartaoConfiguracao } from "@/components/configuracoes/cartao-configuracao";
import { Botao } from "@/components/ui/botao";
import { BotaoSelecionarPasta } from "@/components/ui/botao-selecionar-pasta";
import { Interruptor } from "@/components/ui/interruptor";
import type { ConfiguracaoBackup, ResultadoImportacaoBackup } from "@/types/configuracoes";

export function SecaoBackup({ backup, aoAtualizar, aoBaixar, aoImportar, aoNotificar }: { backup: ConfiguracaoBackup; aoAtualizar: (dados: Partial<ConfiguracaoBackup>) => void; aoBaixar: () => void; aoImportar: (conteudo: string, substituir?: boolean) => ResultadoImportacaoBackup; aoNotificar: (mensagem: string, tipo?: "sucesso" | "aviso") => void }) {
  const arquivoRef = useRef<HTMLInputElement>(null);
  const [substituir, setSubstituir] = useState(false);

  async function importarArquivo(arquivo?: File) {
    if (!arquivo) return;
    const resultado = aoImportar(await arquivo.text(), substituir);
    aoNotificar(resultado.mensagem, resultado.sucesso ? "sucesso" : "aviso");
    if (arquivoRef.current) arquivoRef.current.value = "";
  }

  return (
    <div className="space-y-4">
      <CartaoConfiguracao titulo="Backup do workspace" descricao="Exporte um pacote JSON com as áreas selecionadas do MakeFlux Studio.">
        <div className="flex items-center justify-between gap-4 rounded-md border border-[#e3e7e7] bg-[#fafbfb] p-4">
          <div><strong className="text-[10.5px] font-medium text-[#303637]">Destino de backups automáticos</strong><p className="mt-1 text-[9px] text-[#92999a]">{backup.pastaDestino || "Nenhuma pasta selecionada"}</p></div>
          <BotaoSelecionarPasta rotulo="Escolher pasta" tituloDialogo="Escolha a pasta de backups" chaveArmazenamento="makeflux:pasta-backups" aoSelecionar={(pasta) => aoAtualizar({ pastaDestino: pasta })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Interruptor ativo={backup.automatico} aoAlterar={(valor) => aoAtualizar({ automatico: valor })} rotulo="Backup automático" descricao="Agenda cópias locais conforme a frequência." />
          <label className="rounded-md border border-[#e3e7e7] bg-[#fafbfb] px-3.5 py-3"><strong className="block text-[10.5px] font-medium text-[#303637]">Frequência</strong><select value={backup.frequencia} onChange={(e) => aoAtualizar({ frequencia: e.target.value as ConfiguracaoBackup["frequencia"] })} className="mt-2 h-8 w-full rounded-md border border-[#dfe4e4] bg-white px-2 text-[9.5px]"><option value="ao-fechar">Ao fechar</option><option value="diario">Diário</option><option value="semanal">Semanal</option><option value="manual">Somente manual</option></select></label>
          <Interruptor ativo={backup.incluirProjetos} aoAlterar={(valor) => aoAtualizar({ incluirProjetos: valor })} rotulo="Projetos e produção" />
          <Interruptor ativo={backup.incluirBiblioteca} aoAlterar={(valor) => aoAtualizar({ incluirBiblioteca: valor })} rotulo="Biblioteca" />
          <Interruptor ativo={backup.incluirIntegracoes} aoAlterar={(valor) => aoAtualizar({ incluirIntegracoes: valor })} rotulo="Integrações sem segredos" />
          <Interruptor ativo={backup.incluirHistoricos} aoAlterar={(valor) => aoAtualizar({ incluirHistoricos: valor })} rotulo="Históricos e publicação" />
        </div>
        <div className="flex items-center justify-between border-t border-[#edf0f0] pt-4">
          <div><strong className="text-[10px] text-[#303637]">Último backup</strong><p className="mt-1 text-[8.5px] text-[#92999a]">{backup.ultimoBackupEm ? new Date(backup.ultimoBackupEm).toLocaleString("pt-BR") : "Ainda não realizado"}</p></div>
          <Botao variante="primario" onClick={() => { aoBaixar(); aoNotificar("Backup gerado e baixado com sucesso."); }}><Download className="size-3.5" /> Criar backup agora</Botao>
        </div>
      </CartaoConfiguracao>
      <CartaoConfiguracao titulo="Restaurar backup" descricao="Importe um pacote criado pelo MakeFlux Studio.">
        <div className="flex items-center justify-between gap-5 rounded-md border border-[#e6e2d7] bg-[#fbf8f1] p-4">
          <div className="flex items-start gap-3"><Archive className="mt-0.5 size-4 text-[#9b773b]" /><div><strong className="text-[10.5px] text-[#534a38]">Modo de restauração</strong><p className="mt-1 text-[9px] leading-4 text-[#8b7c5e]">Mesclar preserva dados atuais. Substituir remove workspaces equivalentes antes da importação.</p></div></div>
          <label className="flex shrink-0 items-center gap-2 text-[9px] text-[#6e624c]"><input type="checkbox" checked={substituir} onChange={(e) => setSubstituir(e.target.checked)} /> Substituir dados atuais</label>
        </div>
        <input ref={arquivoRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => void importarArquivo(e.target.files?.[0])} />
        <Botao onClick={() => arquivoRef.current?.click()}><Upload className="size-3.5" /> Selecionar arquivo de backup</Botao>
      </CartaoConfiguracao>
    </div>
  );
}

import { CheckCircle2, Download, LoaderCircle, Power } from "lucide-react";

import { Botao } from "@/components/ui/botao";
import type { WorkspaceAtualizador } from "@/types/atualizador";

function formatarBytes(valor: number) {
  if (!valor) return "0 B";
  const unidades = ["B", "KB", "MB", "GB"];
  const indice = Math.min(Math.floor(Math.log(valor) / Math.log(1024)), unidades.length - 1);
  return `${(valor / 1024 ** indice).toFixed(indice === 0 ? 0 : 1)} ${unidades[indice]}`;
}

export function PainelProgressoAtualizacao({ workspace, aoInstalar }: { workspace: WorkspaceAtualizador; aoInstalar: () => Promise<unknown> }) {
  const pronto = workspace.status === "pronto";
  const ativo = ["baixando", "pronto", "preparando", "instalando", "concluido"].includes(workspace.status);
  return (
    <section className="rounded-md border border-[#e1e7e6] bg-white p-4">
      <div className="flex items-center gap-2 text-[10px] font-semibold text-[#303737]">{["baixando", "preparando", "instalando"].includes(workspace.status) ? <LoaderCircle className="size-3.5 animate-spin text-[#278a76]" /> : <Download className="size-3.5 text-[#278a76]" />} Download e instalação</div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#edf1f0]"><div className="h-full rounded-full bg-[#2b9a82] transition-[width] duration-300" style={{ width: `${ativo ? workspace.progresso : 0}%` }} /></div>
      <div className="mt-2 flex justify-between text-[7px] text-[#8b9393]"><span>{workspace.progresso}%</span><span>{formatarBytes(workspace.bytesBaixados)} / {workspace.totalBytes ? formatarBytes(workspace.totalBytes) : "tamanho desconhecido"}</span></div>
      <p className="mt-3 min-h-8 text-[8px] leading-4 text-[#737c7b]">{workspace.mensagem}</p>
      {pronto && <div className="mt-3 rounded-md border border-[#d7e9e4] bg-[#f3faf7] px-3 py-2 text-[7.5px] leading-4 text-[#377365]"><CheckCircle2 className="mr-1 inline size-3" /> A assinatura foi validada pelo atualizador antes da instalação.</div>}
      <Botao variante="primario" className="mt-3 w-full" disabled={!pronto} onClick={() => void aoInstalar()}><Power className="size-3.5" /> Instalar e reiniciar</Botao>
    </section>
  );
}

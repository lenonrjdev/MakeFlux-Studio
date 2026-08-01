import { DatabaseBackup, FileJson2, FolderOpen, LoaderCircle } from "lucide-react";

import { Botao } from "@/components/ui/botao";
import type { ArtefatoBeta } from "@/types/beta";

function formatarBytes(valor: number) {
  if (valor < 1024) return `${valor} B`;
  if (valor < 1024 * 1024) return `${(valor / 1024).toFixed(1)} KB`;
  return `${(valor / 1024 / 1024).toFixed(1)} MB`;
}

export function PainelArtefatosBeta({ artefato, operacao, sessaoAtiva, aoSnapshot, aoExportar, aoRevelar }: { artefato: ArtefatoBeta | null; operacao: string | null; sessaoAtiva: boolean; aoSnapshot: () => Promise<unknown>; aoExportar: () => Promise<unknown>; aoRevelar: (caminho: string) => Promise<unknown> }) {
  return <section className="rounded-md border border-[#e0e6e5] bg-white"><div className="border-b border-[#e7ebea] px-5 py-4"><h2 className="text-[12px] font-semibold text-[#303738]">Artefatos da release candidate</h2><p className="mt-1 text-[8px] text-[#7f8889]">Snapshot do SQLite e relatório sanitizado da sessão atual.</p></div><div className="p-5"><div className="flex flex-wrap gap-2"><Botao onClick={() => void aoSnapshot()} disabled={!sessaoAtiva || Boolean(operacao)}>{operacao === "snapshot" ? <LoaderCircle className="size-3.5 animate-spin" /> : <DatabaseBackup className="size-3.5" />} Criar snapshot</Botao><Botao variante="primario" onClick={() => void aoExportar()} disabled={!sessaoAtiva || Boolean(operacao)}>{operacao === "exportar" ? <LoaderCircle className="size-3.5 animate-spin" /> : <FileJson2 className="size-3.5" />} Exportar relatório</Botao></div>{artefato && <div className="mt-4 rounded-md border border-[#dce8e4] bg-[#f5faf8] p-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><strong className="block text-[8.5px] text-[#326b5e]">{artefato.mensagem}</strong><span className="mt-1 block truncate text-[7px] text-[#668079]">{artefato.caminho}</span><span className="mt-1 block text-[6.5px] text-[#879795]">{formatarBytes(artefato.tamanhoBytes)}{artefato.checksumSha256 ? ` · SHA-256 ${artefato.checksumSha256.slice(0, 16)}…` : ""}</span></div><Botao className="shrink-0" onClick={() => void aoRevelar(artefato.caminho)}><FolderOpen className="size-3.5" /> Mostrar</Botao></div></div>}</div></section>;
}

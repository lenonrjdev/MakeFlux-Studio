
import { CheckCircle2, CircleAlert, ExternalLink, LoaderCircle, PlayCircle } from "lucide-react";

import { Botao, BotaoLink } from "@/components/ui/botao";
import { conteudoInstalacao } from "@/content/instalacao";
import type { ValidacaoMoneyPrinterAssistida } from "@/types/instalacao";

export function PainelHomologacao({ validacao, operacao, aoValidar, aoTestarApi }: { validacao: ValidacaoMoneyPrinterAssistida | null; operacao: string | null; aoValidar: () => void; aoTestarApi: () => void }) {
  const itens = validacao ? [
    ["main.py", validacao.mainPy],
    ["pyproject.toml", validacao.pyproject],
    ["uv.lock", validacao.uvLock],
    ["config.toml", validacao.config],
    ["Python 3.11", Boolean(validacao.pythonVersao)],
    ["FFmpeg", validacao.ffmpeg],
    ["ImageMagick", validacao.imageMagick],
  ] as Array<[string, boolean]> : [];
  return <section className="rounded-md border border-[#e0e6e5] bg-white"><div className="border-b border-[#e7ebea] px-5 py-4"><h2 className="text-[12px] font-semibold text-[#303738]">Homologação do ambiente</h2><p className="mt-1 text-[8.5px] leading-4 text-[#7d8687]">{conteudoInstalacao.homologacao}</p></div><div className="p-5"><div className="grid grid-cols-2 gap-2">{itens.length ? itens.map(([nome, ok]) => <div key={nome} className="flex items-center gap-2 rounded-md border border-[#e4e9e8] bg-[#fafbfb] px-3 py-2 text-[8px] text-[#535d5e]">{ok ? <CheckCircle2 className="size-3.5 text-[#27806d]" /> : <CircleAlert className="size-3.5 text-[#a47731]" />}{nome}</div>) : <div className="col-span-2 rounded-md border border-dashed border-[#dce3e2] px-4 py-6 text-center text-[8px] text-[#8b9495]">Execute a validação técnica depois de instalar o motor.</div>}</div><div className="mt-4 flex flex-wrap gap-2"><Botao onClick={aoValidar} disabled={Boolean(operacao)}>{operacao === "validar-motor" ? <LoaderCircle className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />} Validar instalação</Botao><Botao variante="primario" onClick={aoTestarApi} disabled={!validacao?.valido || Boolean(operacao)}>{operacao === "api" ? <LoaderCircle className="size-3.5 animate-spin" /> : <PlayCircle className="size-3.5" />} Iniciar e testar API</Botao><BotaoLink href="/criar-video?homologacao=1"><ExternalLink className="size-3.5" /> Criar vídeo de teste</BotaoLink></div>{validacao && <p className={`mt-3 text-[8px] leading-4 ${validacao.valido ? "text-[#277361]" : "text-[#956d31]"}`}>{validacao.mensagem}</p>}</div></section>;
}

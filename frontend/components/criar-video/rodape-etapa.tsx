import { ArrowLeft, ArrowRight, CheckCircle2, Save } from "lucide-react";

import { Botao } from "@/components/ui/botao";
import { conteudoCriarVideo } from "@/content/criar-video";

export function RodapeEtapa({
  primeiraEtapa,
  ultimaEtapa,
  aoAnterior,
  aoProximo,
  aoSalvar,
}: {
  primeiraEtapa: boolean;
  ultimaEtapa: boolean;
  aoAnterior: () => void;
  aoProximo: () => void;
  aoSalvar: () => void;
}) {
  return (
    <footer className="fixed bottom-0 left-[218px] right-0 z-30 flex h-[64px] items-center justify-between border-t border-[#dfe4e4] bg-white/96 px-8 shadow-[0_-8px_24px_rgba(20,29,27,.035)] backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Botao onClick={aoAnterior} disabled={primeiraEtapa} variante="fantasma">
          <ArrowLeft className="size-3.5" />
          {conteudoCriarVideo.acaoAnterior}
        </Botao>
        <span className="hidden text-[9px] text-[#9aa1a2] xl:inline">As alterações ficam no rascunho local ao salvar.</span>
      </div>

      <div className="flex items-center gap-2">
        <Botao onClick={aoSalvar}>
          <Save className="size-3.5" />
          {conteudoCriarVideo.acaoSalvar}
        </Botao>
        <Botao onClick={aoProximo} variante="primario" className="min-w-[146px]">
          {ultimaEtapa ? <CheckCircle2 className="size-3.5" /> : null}
          {ultimaEtapa ? conteudoCriarVideo.acaoFinalizar : conteudoCriarVideo.acaoContinuar}
          {!ultimaEtapa ? <ArrowRight className="size-3.5" /> : null}
        </Botao>
      </div>
    </footer>
  );
}

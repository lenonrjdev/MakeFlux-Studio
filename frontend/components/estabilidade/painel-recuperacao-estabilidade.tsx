import { DatabaseBackup, Eraser, FileOutput, FolderOpen } from "lucide-react";

import { Botao } from "@/components/ui/botao";
import type {
  ResultadoExportacaoEstabilidade,
  ResultadoLimpezaCache,
  ResultadoReparoBanco,
} from "@/types/estabilidade";

export function PainelRecuperacaoEstabilidade({
  operacao,
  reparo,
  limpeza,
  relatorio,
  aoReparar,
  aoLimpar,
  aoExportar,
  aoRevelar,
}: {
  operacao: string | null;
  reparo: ResultadoReparoBanco | null;
  limpeza: ResultadoLimpezaCache | null;
  relatorio: ResultadoExportacaoEstabilidade | null;
  aoReparar: () => void;
  aoLimpar: (dias: number) => void;
  aoExportar: () => void;
  aoRevelar: (caminho: string) => void;
}) {
  return (
    <section className="rounded-md border border-[#e0e6e5] bg-white">
      <div className="border-b border-[#e7ebea] px-5 py-4">
        <h2 className="text-[12px] font-semibold text-[#303738]">Recuperação e manutenção segura</h2>
        <p className="mt-1 text-[8px] text-[#7f8889]">Ações reversíveis com backup e caminhos restritos.</p>
      </div>
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-3 gap-2">
          <Botao onClick={aoReparar} disabled={operacao === "reparar"} className="h-9 text-[8px]">
            <DatabaseBackup className="size-3.5" />
            Reparo preventivo
          </Botao>
          <Botao onClick={() => aoLimpar(7)} disabled={operacao === "limpar-cache"} className="h-9 text-[8px]">
            <Eraser className="size-3.5" />
            Limpar cache antigo
          </Botao>
          <Botao onClick={aoExportar} disabled={operacao === "exportar"} className="h-9 text-[8px]">
            <FileOutput className="size-3.5" />
            Exportar diagnóstico
          </Botao>
        </div>
        {reparo && (
          <div className={`rounded-md border px-3 py-2 text-[7.5px] leading-4 ${reparo.sucesso ? "border-[#d7e8e3] bg-[#f5faf8] text-[#306d5e]" : "border-[#ead3d3] bg-[#fcf5f5] text-[#914c4c]"}`}>
            {reparo.mensagem}
            <button type="button" className="ml-2 underline" onClick={() => aoRevelar(reparo.backupPath)}>
              Mostrar backup
            </button>
          </div>
        )}
        {limpeza && (
          <div className="rounded-md border border-[#dce8e4] bg-[#f5faf8] px-3 py-2 text-[7.5px] leading-4 text-[#426d63]">
            {limpeza.arquivosRemovidos} arquivo(s) removido(s), {limpeza.bytesLiberados} bytes liberados. {limpeza.mensagem}
          </div>
        )}
        {relatorio && (
          <div className="flex items-center justify-between rounded-md border border-[#dfe5e4] bg-[#f8faf9] px-3 py-2">
            <span className="truncate text-[7.5px] text-[#697273]">{relatorio.caminho}</span>
            <Botao onClick={() => aoRevelar(relatorio.caminho)} className="ml-3 h-7 shrink-0 px-2 text-[7.5px]">
              <FolderOpen className="size-3" />
              Mostrar
            </Botao>
          </div>
        )}
      </div>
    </section>
  );
}

import { Clipboard, Download, FileArchive, ShieldCheck } from "lucide-react";

import { Botao } from "@/components/ui/botao";
import { conteudoAjuda } from "@/content/ajuda";
import type { ResultadoDiagnostico } from "@/types/ajuda";

export function PainelSuporte({
  resultado,
  aoDiagnosticar,
  aoBaixar,
  aoCopiar,
}: {
  resultado: ResultadoDiagnostico | null;
  aoDiagnosticar: () => void;
  aoBaixar: () => void;
  aoCopiar: () => void;
}) {
  return (
    <div className="space-y-4">
      <section className="rounded-md border border-[#e2e7e6] bg-white">
        <header className="border-b border-[#edf0f0] px-5 py-4">
          <div className="flex items-center gap-2"><FileArchive className="size-4 text-[#317b6c]" /><h2 className="text-[12px] font-semibold text-[#252a2b]">Pacote de suporte</h2></div>
          <p className="mt-1 max-w-[680px] text-[9.5px] leading-4 text-[#8b9293]">{conteudoAjuda.pacoteSuporteDescricao}</p>
        </header>
        <div className="p-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border border-[#e3e8e7] p-4"><p className="text-[9px] font-semibold text-[#485051]">Incluído</p><ul className="mt-2 space-y-1.5 text-[8.8px] leading-4 text-[#778081]"><li>Versão, ambiente e idioma</li><li>Resultado completo do diagnóstico</li><li>Uso do armazenamento local</li><li>Status e parâmetros não sensíveis das integrações</li><li>Configurações sanitizadas</li></ul></div>
            <div className="rounded-md border border-[#d8e8e4] bg-[#f4faf8] p-4"><p className="flex items-center gap-2 text-[9px] font-semibold text-[#397668]"><ShieldCheck className="size-3.5" /> Removido automaticamente</p><ul className="mt-2 space-y-1.5 text-[8.8px] leading-4 text-[#648078]"><li>Credenciais, tokens e chaves</li><li>Hash do PIN e foto do perfil</li><li>Nome da pasta do usuário</li><li>Parâmetros sensíveis presentes em URLs</li><li>Conteúdo dos projetos e arquivos de vídeo</li></ul></div>
          </div>
          <div className="mt-4 rounded-md border border-[#e2e7e6] bg-[#fafbfb] px-4 py-3">
            <p className="text-[9px] font-medium text-[#5b6465]">Estado do relatório</p>
            <p className="mt-1 text-[8.8px] text-[#8b9394]">{resultado ? `Diagnóstico ${resultado.statusGeral}, executado em ${new Date(resultado.executadoEm).toLocaleString("pt-BR")}.` : "Execute o diagnóstico para liberar a exportação do pacote."}</p>
          </div>
          <div className="mt-4 flex gap-2">
            {!resultado ? <Botao variante="primario" onClick={aoDiagnosticar}>Executar diagnóstico</Botao> : <><Botao variante="primario" onClick={aoBaixar}><Download className="size-3.5" /> Baixar pacote JSON</Botao><Botao onClick={aoCopiar}><Clipboard className="size-3.5" /> Copiar resumo</Botao></>}
          </div>
        </div>
      </section>
      <section className="rounded-md border border-[#e8dfce] bg-[#fffaf3] p-4 text-[9px] leading-4 text-[#7a684b]">
        <strong className="font-semibold">Antes de compartilhar:</strong> abra o arquivo e revise o conteúdo. O pacote foi projetado para diagnóstico técnico e não substitui o backup do workspace.
      </section>
    </div>
  );
}

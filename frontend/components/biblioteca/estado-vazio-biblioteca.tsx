import { FolderSearch, Upload } from "lucide-react";

import { Botao } from "@/components/ui/botao";
import { conteudoBiblioteca } from "@/content/biblioteca";

export function EstadoVazioBiblioteca({ aoLimpar, aoImportar }: { aoLimpar: () => void; aoImportar: () => void }) {
  return (
    <section className="painel-superficie flex min-h-[390px] flex-col items-center justify-center rounded-md px-6 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-[#edf3f1] text-[#6f807c]">
        <FolderSearch className="size-5" />
      </span>
      <h2 className="mt-4 text-[12px] font-semibold text-[#303637]">{conteudoBiblioteca.vazioTitulo}</h2>
      <p className="mt-1 max-w-[380px] text-[9px] leading-4 text-[#858d8e]">{conteudoBiblioteca.vazioDescricao}</p>
      <div className="mt-4 flex gap-2">
        <Botao onClick={aoLimpar}>Limpar filtros</Botao>
        <Botao variante="primario" onClick={aoImportar}>
          <Upload className="size-3.5" /> Importar arquivos
        </Botao>
      </div>
    </section>
  );
}

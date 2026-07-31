import { Database, Files, HardDrive, Star } from "lucide-react";

import { formatarTamanhoBiblioteca } from "@/lib/biblioteca-local";
import type { ColecaoBiblioteca, RecursoBiblioteca } from "@/types/biblioteca";

export function ResumoBiblioteca({
  recursos,
  colecoes,
}: {
  recursos: RecursoBiblioteca[];
  colecoes: ColecaoBiblioteca[];
}) {
  const tamanho = recursos.reduce((total, recurso) => total + recurso.tamanhoBytes, 0);
  const favoritos = recursos.filter((recurso) => recurso.favorito).length;
  const locais = recursos.filter((recurso) => recurso.origem === "local").length;
  const itens = [
    { titulo: "Recursos", valor: recursos.length, detalhe: `${locais} arquivos locais`, icone: Files },
    { titulo: "Coleções", valor: colecoes.length, detalhe: "organização personalizada", icone: Database },
    { titulo: "Favoritos", valor: favoritos, detalhe: "acesso rápido", icone: Star },
    { titulo: "Armazenamento", valor: formatarTamanhoBiblioteca(tamanho), detalhe: "metadados indexados", icone: HardDrive },
  ];

  return (
    <section className="grid grid-cols-4 gap-3">
      {itens.map((item) => {
        const Icone = item.icone;
        return (
          <article key={item.titulo} className="painel-superficie rounded-md px-4 py-3.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[8px] font-medium uppercase tracking-[0.055em] text-[#8a9293]">
                  {item.titulo}
                </span>
                <strong className="mt-1.5 block text-[17px] font-semibold tracking-[-0.03em] text-[#252a2b]">
                  {item.valor}
                </strong>
                <span className="mt-1 block text-[8px] text-[#939a9b]">{item.detalhe}</span>
              </div>
              <span className="grid size-8 place-items-center rounded-md border border-[#dce7e4] bg-[#f3f8f6] text-[#3a8b78]">
                <Icone className="size-3.5" />
              </span>
            </div>
          </article>
        );
      })}
    </section>
  );
}

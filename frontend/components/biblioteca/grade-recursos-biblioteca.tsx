import type { ColecaoBiblioteca, RecursoBiblioteca, VisualizacaoBiblioteca } from "@/types/biblioteca";

import { CartaoRecursoBiblioteca } from "./cartao-recurso-biblioteca";

export function GradeRecursosBiblioteca({
  recursos,
  colecoes,
  visualizacao,
  aoSelecionar,
  aoFavoritar,
  aoDuplicar,
  aoExcluir,
  aoMover,
}: {
  recursos: RecursoBiblioteca[];
  colecoes: ColecaoBiblioteca[];
  visualizacao: VisualizacaoBiblioteca;
  aoSelecionar: (id: string) => void;
  aoFavoritar: (id: string) => void;
  aoDuplicar: (id: string) => void;
  aoExcluir: (id: string) => void;
  aoMover: (id: string, colecaoId?: string) => void;
}) {
  return (
    <div className={visualizacao === "grade" ? "grid grid-cols-3 gap-3 2xl:grid-cols-4" : "space-y-2"}>
      {recursos.map((recurso) => (
        <CartaoRecursoBiblioteca
          key={recurso.id}
          recurso={recurso}
          colecoes={colecoes}
          modoLista={visualizacao === "lista"}
          aoSelecionar={() => aoSelecionar(recurso.id)}
          aoFavoritar={() => aoFavoritar(recurso.id)}
          aoDuplicar={() => aoDuplicar(recurso.id)}
          aoExcluir={() => aoExcluir(recurso.id)}
          aoMover={(colecaoId) => aoMover(recurso.id, colecaoId)}
        />
      ))}
    </div>
  );
}

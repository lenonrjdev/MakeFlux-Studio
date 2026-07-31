import type { PublicacaoStudio } from "@/types/publicacao";

import { CartaoPublicacao } from "./cartao-publicacao";

export function GradePublicacoes({ publicacoes, aoSelecionar, aoFavoritar }: { publicacoes: PublicacaoStudio[]; aoSelecionar: (id: string) => void; aoFavoritar: (id: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {publicacoes.map((publicacao) => <CartaoPublicacao key={publicacao.id} publicacao={publicacao} aoSelecionar={() => aoSelecionar(publicacao.id)} aoFavoritar={() => aoFavoritar(publicacao.id)} />)}
    </div>
  );
}

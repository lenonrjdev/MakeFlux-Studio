import type {
  IntegracaoStudio,
  ModoProcessamento,
  PadroesIntegracoes,
} from "@/types/integracoes";

import { CartaoIntegracao } from "./cartao-integracao";

export function GradeIntegracoes({
  integracoes,
  modo,
  padroes,
  testandoIds,
  aoSelecionar,
  aoAlternarAtiva,
  aoTestar,
}: {
  integracoes: IntegracaoStudio[];
  modo: ModoProcessamento;
  padroes: PadroesIntegracoes;
  testandoIds: string[];
  aoSelecionar: (id: string) => void;
  aoAlternarAtiva: (id: string) => void;
  aoTestar: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
      {integracoes.map((integracao) => (
        <CartaoIntegracao
          key={integracao.id}
          integracao={integracao}
          modo={modo}
          padroes={padroes}
          testando={testandoIds.includes(integracao.id)}
          aoSelecionar={() => aoSelecionar(integracao.id)}
          aoAlternarAtiva={() => aoAlternarAtiva(integracao.id)}
          aoTestar={() => aoTestar(integracao.id)}
        />
      ))}
    </div>
  );
}

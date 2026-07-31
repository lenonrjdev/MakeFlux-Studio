import type { PrioridadeTarefaProducao, TarefaProducao } from "@/types/producao";

import { CartaoTarefaProducao } from "./cartao-tarefa-producao";
import { EstadoVazioProducao } from "./estado-vazio-producao";

export function FilaRenderizacao({
  tarefas,
  aoSelecionar,
  aoPausar,
  aoRetomar,
  aoCancelar,
  aoTentarNovamente,
  aoDuplicar,
  aoExcluir,
  aoAlterarPrioridade,
}: {
  tarefas: TarefaProducao[];
  aoSelecionar: (id: string) => void;
  aoPausar: (id: string) => void;
  aoRetomar: (id: string) => void;
  aoCancelar: (id: string) => void;
  aoTentarNovamente: (id: string) => void;
  aoDuplicar: (id: string) => void;
  aoExcluir: (id: string) => void;
  aoAlterarPrioridade: (id: string, prioridade: PrioridadeTarefaProducao) => void;
}) {
  if (tarefas.length === 0) return <EstadoVazioProducao />;

  return (
    <div className="space-y-3">
      {tarefas.map((tarefa) => (
        <CartaoTarefaProducao
          key={tarefa.id}
          tarefa={tarefa}
          aoSelecionar={() => aoSelecionar(tarefa.id)}
          aoPausar={() => aoPausar(tarefa.id)}
          aoRetomar={() => aoRetomar(tarefa.id)}
          aoCancelar={() => aoCancelar(tarefa.id)}
          aoTentarNovamente={() => aoTentarNovamente(tarefa.id)}
          aoDuplicar={() => aoDuplicar(tarefa.id)}
          aoExcluir={() => aoExcluir(tarefa.id)}
          aoAlterarPrioridade={(prioridade) => aoAlterarPrioridade(tarefa.id, prioridade)}
        />
      ))}
    </div>
  );
}

import type { TemplateStudio, VisualizacaoTemplates } from "@/types/templates";

import { CartaoTemplate } from "./cartao-template";

export function GradeTemplates({
  templates,
  visualizacao,
  aoSelecionar,
  aoFavoritar,
  aoDuplicar,
  aoArquivar,
  aoExcluir,
  aoUsar,
}: {
  templates: TemplateStudio[];
  visualizacao: VisualizacaoTemplates;
  aoSelecionar: (id: string) => void;
  aoFavoritar: (id: string) => void;
  aoDuplicar: (id: string) => void;
  aoArquivar: (id: string) => void;
  aoExcluir: (id: string) => void;
  aoUsar: (id: string) => void;
}) {
  return (
    <div className={visualizacao === "grade" ? "grid grid-cols-3 gap-3" : "space-y-2"}>
      {templates.map((template) => (
        <CartaoTemplate
          key={template.id}
          template={template}
          visualizacao={visualizacao}
          aoSelecionar={() => aoSelecionar(template.id)}
          aoFavoritar={() => aoFavoritar(template.id)}
          aoDuplicar={() => aoDuplicar(template.id)}
          aoArquivar={() => aoArquivar(template.id)}
          aoExcluir={() => aoExcluir(template.id)}
          aoUsar={() => aoUsar(template.id)}
        />
      ))}
    </div>
  );
}

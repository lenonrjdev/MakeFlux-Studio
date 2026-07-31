import { Archive, Layers3, Star, WandSparkles } from "lucide-react";

import type { TemplateStudio } from "@/types/templates";

export function ResumoTemplates({ templates }: { templates: TemplateStudio[] }) {
  const metricas = [
    {
      titulo: "Disponíveis",
      valor: templates.filter((template) => template.status === "ativo").length,
      detalhe: "Prontos para novos projetos",
      icone: Layers3,
    },
    {
      titulo: "Favoritos",
      valor: templates.filter((template) => template.favorito).length,
      detalhe: "Acesso mais rápido",
      icone: Star,
    },
    {
      titulo: "Personalizados",
      valor: templates.filter((template) => !template.sistema).length,
      detalhe: "Criados por você",
      icone: WandSparkles,
    },
    {
      titulo: "Arquivados",
      valor: templates.filter((template) => template.status === "arquivado").length,
      detalhe: "Fora da criação rápida",
      icone: Archive,
    },
  ];

  return (
    <section className="grid grid-cols-4 gap-3">
      {metricas.map((metrica) => {
        const Icone = metrica.icone;
        return (
          <article key={metrica.titulo} className="painel-superficie rounded-md p-3.5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[8px] font-medium uppercase tracking-[0.06em] text-[#92999a]">{metrica.titulo}</p>
                <p className="mt-1.5 text-[20px] font-semibold tracking-[-0.04em] text-[#232829]">{metrica.valor}</p>
                <p className="mt-1 text-[8px] text-[#8a9293]">{metrica.detalhe}</p>
              </div>
              <span className="grid size-8 place-items-center rounded-md border border-[#dfe7e5] bg-[#f7faf9] text-[#538276]">
                <Icone className="size-3.5" />
              </span>
            </div>
          </article>
        );
      })}
    </section>
  );
}

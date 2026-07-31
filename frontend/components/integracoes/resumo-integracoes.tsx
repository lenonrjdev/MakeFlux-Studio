import { CircleAlert, CircleCheck, Cloud, HardDrive } from "lucide-react";

import type { IntegracaoStudio } from "@/types/integracoes";

export function ResumoIntegracoes({ integracoes }: { integracoes: IntegracaoStudio[] }) {
  const conectadas = integracoes.filter((item) => item.status === "conectada" && item.ativa).length;
  const atencao = integracoes.filter((item) => ["atencao", "indisponivel"].includes(item.status)).length;
  const locais = integracoes.filter((item) => item.execucao === "local").length;
  const nuvem = integracoes.filter((item) => item.execucao === "nuvem").length;
  const itens = [
    { titulo: "Conectadas", valor: conectadas, descricao: "Ativas e prontas", icone: CircleCheck, destaque: "text-[#23806a] bg-[#eef8f5]" },
    { titulo: "Precisam de atenção", valor: atencao, descricao: "Revisão recomendada", icone: CircleAlert, destaque: "text-[#936f2e] bg-[#fff8e8]" },
    { titulo: "Execução local", valor: locais, descricao: "Usam este computador", icone: HardDrive, destaque: "text-[#536b78] bg-[#f0f5f7]" },
    { titulo: "Serviços em nuvem", valor: nuvem, descricao: "Dependem de internet", icone: Cloud, destaque: "text-[#6b6392] bg-[#f3f1f8]" },
  ];

  return (
    <section className="grid grid-cols-4 gap-3">
      {itens.map((item) => {
        const Icone = item.icone;
        return (
          <article key={item.titulo} className="painel-superficie flex items-center gap-3 rounded-md px-3.5 py-3">
            <div className={`grid size-9 shrink-0 place-items-center rounded-md ${item.destaque}`}>
              <Icone className="size-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-[18px] font-semibold tracking-[-0.04em] text-[#293031]">{item.valor}</span>
              <strong className="block text-[8.5px] font-medium text-[#626c6d]">{item.titulo}</strong>
              <span className="mt-0.5 block text-[7.5px] text-[#92999a]">{item.descricao}</span>
            </div>
          </article>
        );
      })}
    </section>
  );
}

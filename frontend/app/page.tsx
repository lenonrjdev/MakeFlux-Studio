import { CabecalhoAplicacao } from "@/components/layout/cabecalho-aplicacao";
import { CabecalhoInicio } from "@/components/inicio/cabecalho-inicio";
import { ProjetosRecentes } from "@/components/inicio/projetos-recentes";
import { ResumoEstudio } from "@/components/inicio/resumo-estudio";

export default function PaginaInicio() {
  return (
    <div className="min-h-screen">
      <CabecalhoAplicacao />
      <CabecalhoInicio />
      <div className="space-y-6 px-8 py-5">
        <ResumoEstudio />
        <ProjetosRecentes />
      </div>
    </div>
  );
}

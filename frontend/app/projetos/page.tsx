import { Suspense } from "react";

import { CabecalhoAplicacao } from "@/components/layout/cabecalho-aplicacao";
import { CentralProjetos } from "@/components/projetos/central-projetos";

export default function PaginaProjetos() {
  return (
    <div className="min-h-screen">
      <CabecalhoAplicacao />
      <Suspense fallback={<div className="min-h-[calc(100vh-62px)] bg-[#f7f8f9]" />}>
        <CentralProjetos />
      </Suspense>
    </div>
  );
}

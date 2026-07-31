import { Suspense } from "react";

import { CabecalhoAplicacao } from "@/components/layout/cabecalho-aplicacao";
import { CentralProducao } from "@/components/producao/central-producao";

export default function PaginaProducao() {
  return (
    <div className="min-h-screen">
      <CabecalhoAplicacao />
      <Suspense fallback={<div className="min-h-[calc(100vh-62px)] bg-[#f7f8f9]" />}>
        <CentralProducao />
      </Suspense>
    </div>
  );
}

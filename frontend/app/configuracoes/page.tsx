import { Suspense } from "react";

import { CentralConfiguracoes } from "@/components/configuracoes/central-configuracoes";

export default function PaginaConfiguracoes() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-62px)] animate-pulse bg-[#f7f8f9]" />}>
      <CentralConfiguracoes />
    </Suspense>
  );
}

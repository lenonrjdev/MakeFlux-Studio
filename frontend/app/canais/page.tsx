import { Suspense } from "react";

import { CentralCanaisPublicacao } from "@/components/canais-publicacao/central-canais-publicacao";

export default function PaginaCanais() {
  return <Suspense fallback={<div className="min-h-[calc(100vh-62px)] bg-[#f7f8f9]" />}><CentralCanaisPublicacao /></Suspense>;
}

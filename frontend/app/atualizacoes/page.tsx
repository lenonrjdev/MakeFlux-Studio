import { Suspense } from "react";

import { CentralAtualizacoes } from "@/components/atualizacoes/central-atualizacoes";

export default function PaginaAtualizacoes() {
  return <Suspense fallback={<div className="min-h-[calc(100vh-62px)] bg-[#f7f8f9]" />}><CentralAtualizacoes /></Suspense>;
}

import { Suspense } from "react";

import { CentralAjuda } from "@/components/ajuda/central-ajuda";

export default function PaginaCentralDeAjuda() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-62px)] animate-pulse bg-[#f7f8f9]" />}>
      <CentralAjuda />
    </Suspense>
  );
}

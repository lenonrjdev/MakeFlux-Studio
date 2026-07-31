import { Activity } from "lucide-react";

export function Marca({ compacta = false }: { compacta?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-md bg-[#171a1b] text-white shadow-sm">
        <Activity className="size-[17px]" strokeWidth={2.1} />
      </span>
      {!compacta && (
        <div className="leading-none">
          <strong className="block text-[13px] font-semibold tracking-[-0.02em]">MakeFlux</strong>
          <span className="mt-1 block text-[9px] font-medium uppercase tracking-[0.2em] text-[#92999a]">
            Studio
          </span>
        </div>
      )}
    </div>
  );
}

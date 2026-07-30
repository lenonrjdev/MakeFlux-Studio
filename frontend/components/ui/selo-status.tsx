import { Circle } from "lucide-react";

import { juntarClasses } from "@/lib/classes";

export function SeloStatus({
  texto,
  tom = "verde",
}: {
  texto: string;
  tom?: "verde" | "neutro" | "laranja";
}) {
  const tons = {
    verde: "border-[#cbe5de] bg-[#edf8f5] text-[#17715f]",
    neutro: "border-[#e0e4e4] bg-[#f7f8f8] text-[#5f6768]",
    laranja: "border-[#eadbcf] bg-[#fbf5f0] text-[#9d6034]",
  };

  return (
    <span
      className={juntarClasses(
        "inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-[10px] font-medium",
        tons[tom],
      )}
    >
      <Circle className="size-1.5 fill-current" strokeWidth={0} />
      {texto}
    </span>
  );
}

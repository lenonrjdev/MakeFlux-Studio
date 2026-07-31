import { Database, KeyRound, MonitorPlay, PackageCheck } from "lucide-react";

import type { StatusBancoLocal, StatusCofreNativo } from "@/types/qualidade";

function ItemResumo({
  titulo,
  valor,
  detalhe,
  icone: Icone,
}: {
  titulo: string;
  valor: string;
  detalhe: string;
  icone: typeof Database;
}) {
  return (
    <div className="rounded-md border border-[#e2e7e6] bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-medium text-[#7a8383]">{titulo}</span>
        <Icone className="size-3.5 text-[#248f78]" />
      </div>
      <strong className="mt-3 block text-[17px] font-semibold tracking-[-0.03em] text-[#293031]">
        {valor}
      </strong>
      <span className="mt-1 block text-[8.5px] leading-4 text-[#969d9e]">{detalhe}</span>
    </div>
  );
}

export function ResumoQualidade({
  banco,
  cofre,
}: {
  banco: StatusBancoLocal | null;
  cofre: StatusCofreNativo | null;
}) {
  return (
    <div className="grid grid-cols-4 gap-3">
      <ItemResumo
        titulo="Persistência"
        valor={banco?.disponivel ? "SQLite ativo" : "Fallback local"}
        detalhe={banco ? `${banco.registros} registros sincronizados` : "Aguardando runtime desktop"}
        icone={Database}
      />
      <ItemResumo
        titulo="Cofre"
        valor={cofre?.desbloqueado ? "Desbloqueado" : cofre?.inicializado ? "Bloqueado" : "Não iniciado"}
        detalhe={cofre ? `${cofre.quantidadeSegredos} segredos protegidos` : "Disponível no aplicativo desktop"}
        icone={KeyRound}
      />
      <ItemResumo
        titulo="Qualidade"
        valor="E2E ativo"
        detalhe="Fluxos críticos cobertos por contratos automatizados"
        icone={MonitorPlay}
      />
      <ItemResumo
        titulo="Distribuição"
        valor="1.0 pronta"
        detalhe="MSI, NSIS, manifesto e checksums preparados"
        icone={PackageCheck}
      />
    </div>
  );
}

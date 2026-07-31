import { AlertTriangle, CheckCircle2, CircleAlert, PackageCheck } from "lucide-react";

import { CartaoConfiguracao } from "@/components/configuracoes/cartao-configuracao";
import { BotaoLink } from "@/components/ui/botao";
import { SeloStatus } from "@/components/ui/selo-status";
import { itensProntidaoDistribuicao } from "@/data/qualidade";

export function PainelDistribuicao() {
  return (
    <CartaoConfiguracao
      titulo="Prontidão para distribuição"
      descricao="Checklist técnico para gerar, assinar e publicar os instaladores da versão 1.0."
      acao={<SeloStatus texto="3 de 4 preparados" tom="laranja" />}
    >
      <div className="space-y-2">
        {itensProntidaoDistribuicao.map((item) => (
          <div key={item.id} className="flex items-start gap-3 rounded-md border border-[#e3e8e7] px-3 py-3">
            {item.status === "aprovado" ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#248f78]" />
            ) : (
              <CircleAlert className="mt-0.5 size-4 shrink-0 text-[#b27b36]" />
            )}
            <div className="min-w-0 flex-1">
              <strong className="block text-[9.5px] text-[#303637]">{item.titulo}</strong>
              <span className="mt-1 block text-[8.5px] leading-4 text-[#8e9696]">{item.descricao}</span>
            </div>
            <SeloStatus
              texto={item.status === "aprovado" ? "Pronto" : item.status === "atencao" ? "Atenção" : "Externo"}
              tom={item.status === "aprovado" ? "verde" : "laranja"}
            />
          </div>
        ))}
      </div>
      <div className="rounded-md border border-[#eadfca] bg-[#fbf7ef] p-3 text-[9px] leading-5 text-[#866d46]">
        <AlertTriangle className="mr-2 inline size-3.5" />
        A assinatura exige um certificado de código válido. O projeto prepara o fluxo, mas não inclui nem cria certificados.
      </div>
      <div className="flex gap-2">
        <BotaoLink href="/central-de-ajuda?secao=diagnostico"><PackageCheck className="size-3.5" /> Abrir diagnóstico</BotaoLink>
        <span className="flex items-center text-[8.5px] text-[#8d9595]">
          Execute <code className="mx-1 rounded bg-[#f0f3f3] px-1.5 py-1">PREPARAR_DISTRIBUICAO_V1.cmd</code> na raiz.
        </span>
      </div>
    </CartaoConfiguracao>
  );
}

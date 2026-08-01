"use client";

import { CheckCircle2, CloudUpload, LoaderCircle, TestTube2 } from "lucide-react";
import { useState } from "react";

import { Botao } from "@/components/ui/botao";
import type {
  ConfiguracaoArmazenamentoPublicacao,
  EntradaConfiguracaoArmazenamento,
} from "@/types/distribuicao";

export function PainelArmazenamentoTemporario({
  configuracao,
  aoSalvar,
  aoTestar,
}: {
  configuracao: ConfiguracaoArmazenamentoPublicacao;
  aoSalvar: (entrada: EntradaConfiguracaoArmazenamento) => Promise<unknown>;
  aoTestar: () => Promise<unknown>;
}) {
  const [cloudName, setCloudName] = useState(configuracao.cloudName);
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [bloco, setBloco] = useState(configuracao.tamanhoBlocoMb);
  const [retencao, setRetencao] = useState(configuracao.retencaoHoras);
  const [limpeza, setLimpeza] = useState(configuracao.limpezaAutomatica);
  const [ocupado, setOcupado] = useState<"salvar" | "testar" | null>(null);
  const [mensagem, setMensagem] = useState("");

  async function salvar() {
    setOcupado("salvar");
    setMensagem("");
    try {
      await aoSalvar({
        cloudName,
        apiKey: apiKey.trim() || null,
        apiSecret: apiSecret.trim() || null,
        tamanhoBlocoMb: bloco,
        retencaoHoras: retencao,
        limpezaAutomatica: limpeza,
      });
      setApiKey("");
      setApiSecret("");
      setMensagem("Configuração salva no cofre criptografado.");
    } catch (erro) {
      setMensagem(erro instanceof Error ? erro.message : String(erro));
    } finally {
      setOcupado(null);
    }
  }

  async function testar() {
    setOcupado("testar");
    setMensagem("");
    try {
      await aoTestar();
      setMensagem("Cloudinary autenticado e pronto para hospedagem temporária.");
    } catch (erro) {
      setMensagem(erro instanceof Error ? erro.message : String(erro));
    } finally {
      setOcupado(null);
    }
  }

  return (
    <section className="rounded-md border border-[#e0e6e5] bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold text-[#303737]">
            <CloudUpload className="size-3.5 text-[#288a75]" /> Cloudinary temporário
          </div>
          <p className="mt-1 text-[7.5px] leading-4 text-[#858e8d]">
            Cria uma URL HTTPS temporária para o Instagram e remove o ativo depois da publicação.
          </p>
        </div>
        <span className={`rounded-full px-2 py-1 text-[6.5px] font-semibold ${configuracao?.status === "pronto" ? "bg-[#e8f5f1] text-[#257865]" : "bg-[#f5f2ea] text-[#846d3d]"}`}>
          {configuracao?.status === "pronto" ? "Pronto" : "Configuração pendente"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="text-[7.5px] text-[#717a79]">Cloud Name<input value={cloudName} onChange={(evento) => setCloudName(evento.target.value)} className="foco-acessivel mt-1 h-9 w-full rounded-md border border-[#dce3e2] px-3 text-[8.5px]" /></label>
        <label className="text-[7.5px] text-[#717a79]">API Key<input value={apiKey} onChange={(evento) => setApiKey(evento.target.value)} placeholder={configuracao?.apiKeyConfigurada ? "Configurada · deixe vazio para manter" : "Informe a API Key"} className="foco-acessivel mt-1 h-9 w-full rounded-md border border-[#dce3e2] px-3 text-[8.5px]" /></label>
        <label className="text-[7.5px] text-[#717a79]">API Secret<input type="password" value={apiSecret} onChange={(evento) => setApiSecret(evento.target.value)} placeholder={configuracao?.apiSecretConfigurado ? "Configurado · deixe vazio para manter" : "Informe o API Secret"} className="foco-acessivel mt-1 h-9 w-full rounded-md border border-[#dce3e2] px-3 text-[8.5px]" /></label>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-[7.5px] text-[#717a79]">Bloco (MB)<input type="number" min={6} max={64} value={bloco} onChange={(evento) => setBloco(Number(evento.target.value))} className="foco-acessivel mt-1 h-9 w-full rounded-md border border-[#dce3e2] px-3 text-[8.5px]" /></label>
          <label className="text-[7.5px] text-[#717a79]">Retenção (h)<input type="number" min={1} max={720} value={retencao} onChange={(evento) => setRetencao(Number(evento.target.value))} className="foco-acessivel mt-1 h-9 w-full rounded-md border border-[#dce3e2] px-3 text-[8.5px]" /></label>
        </div>
      </div>

      <label className="mt-3 flex items-center gap-2 text-[7.5px] text-[#687170]"><input type="checkbox" checked={limpeza} onChange={(evento) => setLimpeza(evento.target.checked)} /> Remover automaticamente o vídeo temporário após a publicação</label>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-[7px] text-[#87908f]">
          {configuracao?.status === "pronto" && <CheckCircle2 className="size-3 text-[#288a75]" />}
          {mensagem || configuracao?.mensagem}
        </div>
        <div className="flex gap-2">
          <Botao onClick={() => void testar()} disabled={ocupado !== null}><TestTube2 className="size-3.5" /> {ocupado === "testar" ? "Testando..." : "Testar"}</Botao>
          <Botao variante="primario" onClick={() => void salvar()} disabled={ocupado !== null}>{ocupado === "salvar" ? <LoaderCircle className="size-3.5 animate-spin" /> : <CloudUpload className="size-3.5" />} Salvar</Botao>
        </div>
      </div>
    </section>
  );
}

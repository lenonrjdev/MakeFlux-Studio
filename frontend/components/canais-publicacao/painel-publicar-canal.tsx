"use client";

import { LoaderCircle, Send } from "lucide-react";
import { useMemo, useState } from "react";

import { Botao } from "@/components/ui/botao";
import { provedoresCanais } from "@/data/canais-publicacao";
import type {
  ConexaoCanalPublicacao,
  EntradaPublicacaoSocial,
  ProvedorCanalPublicacao,
} from "@/types/canais-publicacao";
import type { PublicacaoStudio } from "@/types/publicacao";

export function PainelPublicarCanal({
  publicacoes,
  conexoes,
  aoPublicar,
}: {
  publicacoes: PublicacaoStudio[];
  conexoes: ConexaoCanalPublicacao[];
  aoPublicar: (entrada: EntradaPublicacaoSocial) => Promise<unknown>;
}) {
  const prontas = useMemo(
    () => publicacoes.filter((item) => item.status === "pronta" || item.status === "agendada"),
    [publicacoes],
  );
  const [publicacaoId, setPublicacaoId] = useState(prontas[0]?.id ?? "");
  const [provedor, setProvedor] = useState<ProvedorCanalPublicacao>("youtube");
  const [mediaUrl, setMediaUrl] = useState("");
  const [contaId, setContaId] = useState("");
  const [hospedar, setHospedar] = useState(true);
  const [consentimentoTiktok, setConsentimentoTiktok] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const selecionada = prontas.find((item) => item.id === publicacaoId) ?? null;
  const configuracao = provedoresCanais.find((item) => item.id === provedor) ?? provedoresCanais[0];
  const conectada = conexoes.some(
    (item) => item.provedor === provedor && item.status === "conectada",
  );

  async function publicar() {
    if (!selecionada) {
      setMensagem("Escolha uma publicação pronta.");
      return;
    }
    if (!conectada) {
      setMensagem("Conecte o canal antes de publicar.");
      return;
    }
    if (!selecionada.caminhoVideo && !(provedor === "instagram" && mediaUrl.trim())) {
      setMensagem("Esta publicação ainda não possui um arquivo de vídeo real.");
      return;
    }
    if (provedor === "instagram" && !hospedar && !mediaUrl.trim()) {
      setMensagem("Ative a hospedagem temporária ou informe uma URL HTTPS.");
      return;
    }
    if (provedor === "tiktok" && !consentimentoTiktok) {
      setMensagem("Confirme a autorização explícita para publicar no TikTok.");
      return;
    }
    setEnviando(true);
    setMensagem("");
    try {
      await aoPublicar({
        provedor,
        publicacaoId: selecionada.id,
        titulo: selecionada.titulo,
        descricao: selecionada.descricao,
        hashtags: selecionada.hashtags,
        caminhoVideo: selecionada.caminhoVideo || null,
        mediaUrl: mediaUrl.trim() || null,
        contaId: contaId.trim() || null,
        privacidade: provedor === "tiktok" ? "privada" : "publica",
        hospedarTemporariamente: provedor === "instagram" && hospedar,
        consentimentoTiktok: provedor === "tiktok" ? consentimentoTiktok : undefined,
        permitirComentarios: true,
        permitirDueto: false,
        permitirCostura: false,
      });
      setMensagem("Envio adicionado à fila robusta. Você pode acompanhar, cancelar ou repetir.");
    } catch (erro) {
      setMensagem(erro instanceof Error ? erro.message : String(erro));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="rounded-md border border-[#e0e6e5] bg-white p-4">
      <div className="flex items-center gap-2 text-[10px] font-semibold text-[#303737]"><Send className="size-3.5 text-[#288a75]" /> Publicar conteúdo pronto</div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="block text-[7.5px] text-[#717a79]">Publicação<select value={publicacaoId} onChange={(evento) => setPublicacaoId(evento.target.value)} className="foco-acessivel mt-1 h-9 w-full rounded-md border border-[#dce3e2] bg-white px-2 text-[8.5px]"><option value="">Selecione</option>{prontas.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></label>
        <label className="block text-[7.5px] text-[#717a79]">Canal<select value={provedor} onChange={(evento) => setProvedor(evento.target.value as ProvedorCanalPublicacao)} className="foco-acessivel mt-1 h-9 w-full rounded-md border border-[#dce3e2] bg-white px-2 text-[8.5px]">{provedoresCanais.map((item) => <option key={item.id} value={item.id}>{item.titulo}</option>)}</select></label>
      </div>

      {provedor === "instagram" && (
        <div className="mt-3 rounded-md border border-[#e3e8e7] bg-[#fafbfb] p-3">
          <label className="flex items-center gap-2 text-[7.5px] text-[#616b6a]"><input type="checkbox" checked={hospedar} onChange={(evento) => setHospedar(evento.target.checked)} /> Hospedar automaticamente o vídeo no Cloudinary e apagar depois da publicação</label>
          {!hospedar && <div className="mt-3 grid grid-cols-2 gap-3"><label className="block text-[7.5px] text-[#717a79]">URL HTTPS do vídeo<input value={mediaUrl} onChange={(evento) => setMediaUrl(evento.target.value)} placeholder="https://.../video.mp4" className="foco-acessivel mt-1 h-9 w-full rounded-md border border-[#dce3e2] px-3 text-[8.5px]" /></label><label className="block text-[7.5px] text-[#717a79]">ID da conta profissional<input value={contaId} onChange={(evento) => setContaId(evento.target.value)} placeholder="Opcional quando retornado pelo OAuth" className="foco-acessivel mt-1 h-9 w-full rounded-md border border-[#dce3e2] px-3 text-[8.5px]" /></label></div>}
        </div>
      )}

      {provedor === "tiktok" && (
        <div className="mt-3 rounded-md border border-[#e3e8e7] bg-[#fafbfb] p-3">
          <label className="flex items-start gap-2 text-[7.5px] leading-4 text-[#616b6a]"><input type="checkbox" className="mt-0.5" checked={consentimentoTiktok} onChange={(evento) => setConsentimentoTiktok(evento.target.checked)} /> Confirmo que revisei o conteúdo e autorizo o MakeFlux Studio a enviá-lo para a conta TikTok conectada.</label>
          <p className="mt-2 text-[7px] leading-4 text-[#8a9291]">O arquivo local será enviado em blocos. A privacidade inicial usa somente eu quando a conta ou o aplicativo não permitir publicação pública.</p>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-[7.5px] leading-4 text-[#899190]">{provedor === "instagram" ? "O contêiner será acompanhado até ficar pronto para publicação." : "O upload usa uma sessão persistida e tentativas automáticas."}</p>
        <Botao variante="primario" disabled={enviando || !conectada} onClick={() => void publicar()}>{enviando ? <LoaderCircle className="size-3.5 animate-spin" /> : <Send className="size-3.5" />} {enviando ? "Adicionando..." : "Adicionar à fila"}</Botao>
      </div>
      {mensagem && <div className="mt-3 rounded-md bg-[#f5f7f7] px-3 py-2 text-[7.5px] text-[#667170]">{mensagem}</div>}
      {configuracao.exigeUrlPublica && provedor !== "instagram" && <p className="mt-2 text-[7px] text-[#8b9392]">Este canal exige URL pública.</p>}
    </section>
  );
}

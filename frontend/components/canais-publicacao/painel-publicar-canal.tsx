"use client";

import { LoaderCircle, Send } from "lucide-react";
import { useMemo, useState } from "react";

import { Botao } from "@/components/ui/botao";
import { provedoresCanais } from "@/data/canais-publicacao";
import type { PublicacaoStudio } from "@/types/publicacao";
import type { ConexaoCanalPublicacao, EntradaPublicacaoSocial, ProvedorCanalPublicacao } from "@/types/canais-publicacao";

export function PainelPublicarCanal({ publicacoes, conexoes, aoPublicar }: { publicacoes: PublicacaoStudio[]; conexoes: ConexaoCanalPublicacao[]; aoPublicar: (entrada: EntradaPublicacaoSocial) => Promise<unknown> }) {
  const prontas = useMemo(() => publicacoes.filter((item) => item.status === "pronta" || item.status === "agendada"), [publicacoes]);
  const [publicacaoId, setPublicacaoId] = useState(prontas[0]?.id ?? "");
  const [provedor, setProvedor] = useState<ProvedorCanalPublicacao>("youtube");
  const [mediaUrl, setMediaUrl] = useState("");
  const [contaId, setContaId] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const selecionada = prontas.find((item) => item.id === publicacaoId) ?? null;
  const configuracao = provedoresCanais.find((item) => item.id === provedor) ?? provedoresCanais[0];
  const conectada = conexoes.some((item) => item.provedor === provedor && item.status === "conectada");

  async function publicar() {
    if (!selecionada) { setMensagem("Escolha uma publicação pronta."); return; }
    if (!conectada) { setMensagem("Conecte o canal antes de publicar."); return; }
    if (configuracao.exigeUrlPublica && !mediaUrl.trim()) { setMensagem("Informe uma URL pública de vídeo aceita pela plataforma."); return; }
    setEnviando(true); setMensagem("");
    try {
      await aoPublicar({ provedor, publicacaoId: selecionada.id, titulo: selecionada.titulo, descricao: selecionada.descricao, hashtags: selecionada.hashtags, caminhoVideo: selecionada.caminhoVideo || null, mediaUrl: mediaUrl.trim() || null, contaId: contaId.trim() || null, privacidade: "publica" });
      setMensagem("Envio iniciado e registrado na fila nativa.");
    } catch (erro) { setMensagem(erro instanceof Error ? erro.message : String(erro)); }
    finally { setEnviando(false); }
  }

  return <section className="rounded-md border border-[#e0e6e5] bg-white p-4"><div className="flex items-center gap-2 text-[10px] font-semibold text-[#303737]"><Send className="size-3.5 text-[#288a75]" /> Publicar conteúdo pronto</div><div className="mt-4 grid grid-cols-2 gap-3"><label className="block text-[7.5px] text-[#717a79]">Publicação<select value={publicacaoId} onChange={(evento) => setPublicacaoId(evento.target.value)} className="foco-acessivel mt-1 h-9 w-full rounded-md border border-[#dce3e2] bg-white px-2 text-[8.5px]"><option value="">Selecione</option>{prontas.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></label><label className="block text-[7.5px] text-[#717a79]">Canal<select value={provedor} onChange={(evento) => setProvedor(evento.target.value as ProvedorCanalPublicacao)} className="foco-acessivel mt-1 h-9 w-full rounded-md border border-[#dce3e2] bg-white px-2 text-[8.5px]">{provedoresCanais.map((item) => <option key={item.id} value={item.id}>{item.titulo}</option>)}</select></label></div>{configuracao.exigeUrlPublica && <div className="mt-3 grid grid-cols-2 gap-3"><label className="block text-[7.5px] text-[#717a79]">URL pública do vídeo<input value={mediaUrl} onChange={(evento) => setMediaUrl(evento.target.value)} placeholder="https://.../video.mp4" className="foco-acessivel mt-1 h-9 w-full rounded-md border border-[#dce3e2] px-3 text-[8.5px]" /></label><label className="block text-[7.5px] text-[#717a79]">ID da conta profissional<input value={contaId} onChange={(evento) => setContaId(evento.target.value)} placeholder="Opcional quando retornado pelo OAuth" className="foco-acessivel mt-1 h-9 w-full rounded-md border border-[#dce3e2] px-3 text-[8.5px]" /></label></div>}<div className="mt-3 flex items-center justify-between gap-3"><p className="text-[7.5px] leading-4 text-[#899190]">{configuracao.exigeUrlPublica ? "A plataforma buscará o vídeo pela URL informada." : "O arquivo local será enviado com protocolo retomável."}</p><Botao variante="primario" disabled={enviando || !conectada} onClick={() => void publicar()}>{enviando ? <LoaderCircle className="size-3.5 animate-spin" /> : <Send className="size-3.5" />} {enviando ? "Enviando..." : "Publicar agora"}</Botao></div>{mensagem && <div className="mt-3 rounded-md bg-[#f5f7f7] px-3 py-2 text-[7.5px] text-[#667170]">{mensagem}</div>}</section>;
}

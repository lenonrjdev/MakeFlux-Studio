"use client";

import { KeyRound, LoaderCircle, ShieldCheck, X } from "lucide-react";
import { useState } from "react";

import { Botao } from "@/components/ui/botao";
import { conteudoCanaisPublicacao } from "@/content/canais-publicacao";
import { provedoresCanais } from "@/data/canais-publicacao";
import type { CredenciaisAplicativoCanal, ProvedorCanalPublicacao } from "@/types/canais-publicacao";

export function ModalOauthCanal({ provedor, aoFechar, aoConectar }: { provedor: ProvedorCanalPublicacao; aoFechar: () => void; aoConectar: (credenciais: CredenciaisAplicativoCanal) => Promise<unknown> }) {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");
  const dados = provedoresCanais.find((item) => item.id === provedor) ?? provedoresCanais[0];

  async function conectar() {
    if (!clientId.trim()) { setErro("Informe o Client ID do aplicativo."); return; }
    setProcessando(true); setErro("");
    try { await aoConectar({ provedor, clientId: clientId.trim(), clientSecret: clientSecret.trim() }); aoFechar(); }
    catch (falha) { setErro(falha instanceof Error ? falha.message : String(falha)); }
    finally { setProcessando(false); }
  }

  return <div className="fixed inset-0 z-[85] grid place-items-center bg-[#18211f]/25 px-4 backdrop-blur-[1px]"><section className="w-full max-w-md rounded-md border border-[#dce3e1] bg-white shadow-[0_24px_70px_rgba(15,28,24,.18)]"><header className="flex items-start justify-between border-b border-[#e7ebea] px-5 py-4"><div><div className="flex items-center gap-2 text-[7px] font-semibold uppercase tracking-[0.08em] text-[#2b836f]"><KeyRound className="size-3" /> OAuth seguro</div><h2 className="mt-1.5 text-[15px] font-semibold text-[#29302f]">Conectar {dados.titulo}</h2></div><button type="button" onClick={aoFechar} className="foco-acessivel grid size-8 place-items-center rounded-md text-[#7a8382] hover:bg-[#f2f4f4]"><X className="size-4" /></button></header><div className="space-y-3 p-5"><div className="rounded-md border border-[#dce9e5] bg-[#f3faf8] px-3 py-2 text-[7.5px] leading-4 text-[#50736b]"><ShieldCheck className="mr-1 inline size-3" /> {conteudoCanaisPublicacao.avisoCofre}</div><label className="block text-[8px] font-medium text-[#636d6c]">Client ID<input value={clientId} onChange={(evento) => setClientId(evento.target.value)} className="foco-acessivel mt-1 h-9 w-full rounded-md border border-[#dce3e2] px-3 text-[9px]" autoComplete="off" /></label><label className="block text-[8px] font-medium text-[#636d6c]">Client Secret <span className="font-normal text-[#9aa19f]">(quando exigido)</span><input type="password" value={clientSecret} onChange={(evento) => setClientSecret(evento.target.value)} className="foco-acessivel mt-1 h-9 w-full rounded-md border border-[#dce3e2] px-3 text-[9px]" autoComplete="new-password" /></label><p className="text-[7px] leading-3.5 text-[#929a99]">O segredo fica somente na memória durante a troca do código. Tokens recebidos são criptografados no cofre local.</p>{erro && <div className="rounded-md border border-[#ebd5d2] bg-[#fff5f3] px-3 py-2 text-[7.5px] text-[#a14d43]">{erro}</div>}</div><footer className="flex justify-end gap-2 border-t border-[#e7ebea] bg-[#fafbfb] px-5 py-3"><Botao onClick={aoFechar}>Cancelar</Botao><Botao variante="primario" disabled={processando} onClick={() => void conectar()}>{processando ? <LoaderCircle className="size-3.5 animate-spin" /> : <KeyRound className="size-3.5" />} {processando ? "Aguardando autorização..." : "Abrir autorização"}</Botao></footer></section></div>;
}

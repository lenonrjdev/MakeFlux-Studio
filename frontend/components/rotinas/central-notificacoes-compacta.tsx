"use client";

import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { listarNotificacoesLocais, marcarNotificacaoLida, marcarTodasNotificacoesLidas } from "@/lib/rotinas-nativas";
import type { NotificacaoLocal } from "@/types/rotinas";

export function CentralNotificacoesCompacta() {
  const [aberta, setAberta] = useState(false);
  const [notificacoes, setNotificacoes] = useState<NotificacaoLocal[]>([]);

  const recarregar = useCallback(async () => {
    try { setNotificacoes(await listarNotificacoesLocais()); } catch { setNotificacoes([]); }
  }, []);

  useEffect(() => {
    const inicial = window.setTimeout(() => void recarregar(), 0);
    const intervalo = window.setInterval(() => void recarregar(), 20_000);
    return () => { window.clearTimeout(inicial); window.clearInterval(intervalo); };
  }, [recarregar]);

  const naoLidas = notificacoes.filter((item) => !item.lida).length;
  return <div className="relative"><button type="button" aria-label="Abrir notificações" onClick={() => setAberta((valor) => !valor)} className="foco-acessivel relative grid size-8 place-items-center rounded-md text-[#697172] hover:bg-[#f2f4f4]"><Bell className="size-4" />{naoLidas > 0 && <span className="absolute right-0.5 top-0.5 grid min-w-3.5 place-items-center rounded-full bg-[#d85e5e] px-0.5 text-[6px] font-semibold leading-3.5 text-white ring-2 ring-white">{Math.min(99, naoLidas)}</span>}</button>{aberta && <div className="absolute right-0 top-10 z-50 w-80 rounded-md border border-[#dfe5e4] bg-white p-2 shadow-[0_14px_36px_rgba(35,47,45,.16)]"><div className="flex items-center justify-between px-2 py-1.5"><strong className="text-[9px] text-[#343b3a]">Notificações</strong><button type="button" onClick={() => void marcarTodasNotificacoesLidas().then(recarregar)} className="flex items-center gap-1 text-[7.5px] text-[#267c69]"><CheckCheck className="size-3" /> Marcar todas</button></div><div className="max-h-72 space-y-1 overflow-auto">{notificacoes.length === 0 && <div className="px-3 py-8 text-center text-[8px] text-[#969d9c]">Nenhuma notificação.</div>}{notificacoes.slice(0, 8).map((item) => <button key={item.id} type="button" onClick={() => void marcarNotificacaoLida(item.id).then(recarregar)} className={`w-full rounded-md px-3 py-2 text-left ${item.lida ? "bg-white" : "bg-[#f1f8f6]"}`}><div className="flex items-start justify-between gap-2"><strong className="text-[8px] font-medium text-[#3b4342]">{item.titulo}</strong><span className="text-[6.5px] text-[#a0a6a5]">{new Intl.DateTimeFormat("pt-BR", { timeStyle: "short" }).format(new Date(item.criadaEm))}</span></div><p className="mt-1 line-clamp-2 text-[7.5px] leading-3.5 text-[#7f8887]">{item.corpo}</p></button>)}</div><Link href="/rotinas" onClick={() => setAberta(false)} className="mt-1 flex items-center justify-center gap-1 rounded-md border-t border-[#edf0ef] px-2 py-2 text-[8px] font-medium text-[#267c69]"><ExternalLink className="size-3" /> Abrir central de rotinas</Link></div>}</div>;
}

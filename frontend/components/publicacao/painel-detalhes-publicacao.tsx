"use client";

import { Archive, CalendarDays, Copy, ExternalLink, Hash, Save, Send, Sparkles, Star, Trash2, X } from "lucide-react";
import { useState } from "react";

import { Botao } from "@/components/ui/botao";
import { coresThumbnail, estilosThumbnail, plataformasPublicacao, rotulosStatusPublicacao } from "@/data/publicacao";
import { formatarDataPublicacao } from "@/lib/publicacao-local";
import { juntarClasses } from "@/lib/classes";
import type { EstiloThumbnail, PublicacaoStudio } from "@/types/publicacao";

export function PainelDetalhesPublicacao({ publicacao, aoFechar, aoAtualizar, aoGerarMetadados, aoAgendar, aoMarcarPublicada, aoFavoritar, aoDuplicar, aoArquivar, aoExcluir, aoNotificar }: { publicacao: PublicacaoStudio; aoFechar: () => void; aoAtualizar: (alteracoes: Partial<PublicacaoStudio>) => void; aoGerarMetadados: () => void; aoAgendar: (data: string) => void; aoMarcarPublicada: (link: string) => void; aoFavoritar: () => void; aoDuplicar: () => void; aoArquivar: () => void; aoExcluir: () => void; aoNotificar: (mensagem: string, tipo?: "sucesso" | "aviso") => void }) {
  const [nome, setNome] = useState(publicacao.nome);
  const [titulo, setTitulo] = useState(publicacao.titulo);
  const [descricao, setDescricao] = useState(publicacao.descricao);
  const [hashtags, setHashtags] = useState(publicacao.hashtags.join(", "));
  const [chamada, setChamada] = useState(publicacao.chamadaParaAcao);
  const [textoThumbnail, setTextoThumbnail] = useState(publicacao.textoThumbnail);
  const [estiloThumbnail, setEstiloThumbnail] = useState<EstiloThumbnail>(publicacao.estiloThumbnail);
  const [corThumbnail, setCorThumbnail] = useState(publicacao.corThumbnail);
  const [agendamento, setAgendamento] = useState(publicacao.agendadaPara?.slice(0, 16) ?? "");
  const [link, setLink] = useState(publicacao.linkPublicado);
  const plataforma = plataformasPublicacao.find((item) => item.id === publicacao.plataforma) ?? plataformasPublicacao[0];
  const gradiente = estilosThumbnail.find((item) => item.id === estiloThumbnail)?.gradiente ?? estilosThumbnail[0].gradiente;

  function salvar() {
    aoAtualizar({ nome, titulo, descricao, hashtags: hashtags.split(",").map((tag) => tag.trim().replace(/^#/, "")).filter(Boolean), chamadaParaAcao: chamada, textoThumbnail, estiloThumbnail, corThumbnail });
  }

  async function copiarMetadados() {
    const texto = `${titulo}\n\n${descricao}\n\n${hashtags.split(",").map((tag) => `#${tag.trim().replace(/^#/, "")}`).join(" ")}\n\n${chamada}`;
    try { await navigator.clipboard.writeText(texto); aoNotificar("Metadados copiados."); } catch { aoNotificar("Não foi possível acessar a área de transferência.", "aviso"); }
  }

  function agendar() {
    if (!agendamento) { aoNotificar("Escolha uma data e horário para agendar.", "aviso"); return; }
    aoAgendar(new Date(agendamento).toISOString());
  }

  function publicar() {
    if (!link.trim()) { aoNotificar("Informe o link publicado para concluir o registro.", "aviso"); return; }
    aoMarcarPublicada(link.trim());
  }

  return (
    <div className="fixed inset-0 z-[75] flex justify-end bg-[#17201f]/20 backdrop-blur-[1px]">
      <aside className="flex h-full w-[500px] flex-col border-l border-[#dce3e1] bg-white shadow-[-18px_0_50px_rgba(19,31,28,.13)]">
        <header className="flex items-start justify-between border-b border-[#e7ebea] px-5 py-4"><div className="min-w-0"><div className="flex items-center gap-2 text-[7px] font-medium uppercase tracking-[0.08em] text-[#86908f]"><span className="size-2 rounded-full" style={{ backgroundColor: plataforma.cor }} />{plataforma.titulo} · {rotulosStatusPublicacao[publicacao.status]}</div><h2 className="mt-1.5 truncate text-[15px] font-semibold tracking-[-0.025em] text-[#252a2b]">{publicacao.nome}</h2><p className="mt-1 text-[7px] text-[#8a9293]">Atualizada em {formatarDataPublicacao(publicacao.atualizadoEm)}</p></div><button type="button" onClick={aoFechar} className="foco-acessivel grid size-8 place-items-center rounded-md text-[#758080] hover:bg-[#f0f3f3]" aria-label="Fechar detalhes"><X className="size-4" /></button></header>
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <section className="relative h-[170px] overflow-hidden rounded-md border border-[#dfe5e4]" style={{ background: gradiente }}><div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.16)_1px,transparent_1px)] [background-size:28px_28px]" /><div className="absolute left-4 top-4 rounded border border-white/20 bg-black/15 px-2 py-1 text-[6.5px] text-white">{publicacao.formato || "9:16"} · {publicacao.duracao || "Sem duração"}</div><p className="absolute inset-x-5 bottom-5 max-w-[390px] text-[20px] font-bold uppercase leading-[1.02] tracking-[-0.05em] text-white drop-shadow-sm">{textoThumbnail || titulo}</p></section>

          <section className="space-y-3"><div className="flex items-center justify-between"><h3 className="text-[9px] font-semibold text-[#363c3c]">Metadados da publicação</h3><Botao onClick={aoGerarMetadados} className="h-7 px-2 text-[7.5px]"><Sparkles className="size-3" /> Gerar sugestão</Botao></div><label className="block"><span className="mb-1.5 block text-[7.5px] text-[#697273]">Nome interno</span><input value={nome} onChange={(evento) => setNome(evento.target.value)} className="h-9 w-full rounded-md border border-[#dfe5e4] px-3 text-[9px] outline-none focus:border-[#9fcfc4]" /></label><label className="block"><span className="mb-1.5 block text-[7.5px] text-[#697273]">Título</span><input value={titulo} onChange={(evento) => setTitulo(evento.target.value)} className="h-9 w-full rounded-md border border-[#dfe5e4] px-3 text-[9px] outline-none focus:border-[#9fcfc4]" /></label><label className="block"><span className="mb-1.5 block text-[7.5px] text-[#697273]">Descrição</span><textarea value={descricao} onChange={(evento) => setDescricao(evento.target.value)} rows={4} className="w-full resize-none rounded-md border border-[#dfe5e4] px-3 py-2 text-[9px] leading-4 outline-none focus:border-[#9fcfc4]" /></label><label className="block"><span className="mb-1.5 flex items-center gap-1 text-[7.5px] text-[#697273]"><Hash className="size-3" /> Hashtags separadas por vírgula</span><input value={hashtags} onChange={(evento) => setHashtags(evento.target.value)} className="h-9 w-full rounded-md border border-[#dfe5e4] px-3 text-[9px] outline-none focus:border-[#9fcfc4]" /></label><label className="block"><span className="mb-1.5 block text-[7.5px] text-[#697273]">Chamada para ação</span><input value={chamada} onChange={(evento) => setChamada(evento.target.value)} className="h-9 w-full rounded-md border border-[#dfe5e4] px-3 text-[9px] outline-none focus:border-[#9fcfc4]" /></label><div className="grid grid-cols-2 gap-2"><Botao variante="primario" onClick={salvar}><Save className="size-3.5" /> Salvar</Botao><Botao onClick={copiarMetadados}><Copy className="size-3.5" /> Copiar tudo</Botao></div></section>

          <section className="space-y-3"><h3 className="text-[9px] font-semibold text-[#363c3c]">Thumbnail</h3><label className="block"><span className="mb-1.5 block text-[7.5px] text-[#697273]">Texto principal</span><input value={textoThumbnail} onChange={(evento) => setTextoThumbnail(evento.target.value)} maxLength={42} className="h-9 w-full rounded-md border border-[#dfe5e4] px-3 text-[9px] outline-none focus:border-[#9fcfc4]" /></label><div className="grid grid-cols-2 gap-2">{estilosThumbnail.map((estilo) => <button key={estilo.id} type="button" onClick={() => setEstiloThumbnail(estilo.id)} className={`foco-acessivel rounded-md border p-2.5 text-left ${estiloThumbnail === estilo.id ? "border-[#81bdae] bg-[#edf7f4]" : "border-[#e2e7e6]"}`}><span className="block text-[8px] font-medium text-[#384040]">{estilo.titulo}</span><span className="mt-0.5 block text-[6.5px] text-[#8a9293]">{estilo.descricao}</span></button>)}</div><div className="flex gap-1.5">{coresThumbnail.map((cor) => <button key={cor} type="button" onClick={() => setCorThumbnail(cor)} aria-label={`Selecionar cor ${cor}`} className={juntarClasses("size-6 rounded-full border-2", corThumbnail === cor ? "border-[#202526]" : "border-white")} style={{ backgroundColor: cor }} />)}</div></section>

          <section className="space-y-3"><h3 className="text-[9px] font-semibold text-[#363c3c]">Planejamento</h3><div className="grid grid-cols-[1fr_auto] gap-2"><input type="datetime-local" value={agendamento} onChange={(evento) => setAgendamento(evento.target.value)} className="h-9 rounded-md border border-[#dfe5e4] px-3 text-[8.5px] outline-none focus:border-[#9fcfc4]" /><Botao onClick={agendar}><CalendarDays className="size-3.5" /> Agendar</Botao></div><div className="grid grid-cols-[1fr_auto] gap-2"><input value={link} onChange={(evento) => setLink(evento.target.value)} placeholder="https://..." className="h-9 rounded-md border border-[#dfe5e4] px-3 text-[8.5px] outline-none placeholder:text-[#a2a8a8] focus:border-[#9fcfc4]" /><Botao onClick={publicar}><Send className="size-3.5" /> Marcar publicada</Botao></div>{publicacao.linkPublicado && <button type="button" onClick={() => window.open(publicacao.linkPublicado, "_blank", "noopener,noreferrer")} className="foco-acessivel flex w-full items-center justify-between rounded-md border border-[#dce7e3] bg-[#f2faf7] px-3 py-2 text-[7.5px] text-[#24715f]"><span className="truncate">{publicacao.linkPublicado}</span><ExternalLink className="size-3" /></button>}</section>

          <section><h3 className="mb-2 text-[9px] font-semibold text-[#363c3c]">Histórico</h3><div className="space-y-1.5">{publicacao.historico.slice().reverse().slice(0, 6).map((evento) => <div key={evento.id} className="rounded-md border border-[#e6eae9] bg-[#fafbfb] px-3 py-2"><p className="text-[7.5px] text-[#4f5858]">{evento.descricao}</p><p className="mt-1 text-[6.5px] text-[#979e9e]">{formatarDataPublicacao(evento.criadoEm)}</p></div>)}</div></section>
        </div>
        <footer className="space-y-2 border-t border-[#e7ebea] bg-[#fafbfb] p-4"><div className="grid grid-cols-3 gap-2"><Botao onClick={aoFavoritar}><Star className={juntarClasses("size-3.5", publicacao.favorito && "fill-[#d39b36] text-[#d39b36]")} /> Favorito</Botao><Botao onClick={aoDuplicar}><Copy className="size-3.5" /> Duplicar</Botao><Botao onClick={aoArquivar}><Archive className="size-3.5" /> {publicacao.status === "arquivada" ? "Restaurar" : "Arquivar"}</Botao></div><Botao onClick={aoExcluir} className="w-full border-[#eadada] text-[#9b5f5f] hover:bg-[#fbf2f2]"><Trash2 className="size-3.5" /> Excluir publicação</Botao></footer>
      </aside>
    </div>
  );
}

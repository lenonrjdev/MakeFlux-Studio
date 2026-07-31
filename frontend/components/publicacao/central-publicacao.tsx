"use client";

import { CheckCircle2, CircleAlert } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useProducaoLocal } from "@/hooks/use-producao-local";
import { useProjetosLocais } from "@/hooks/use-projetos-locais";
import { usePublicacoesLocais } from "@/hooks/use-publicacoes-locais";
import type { TarefaProducao } from "@/types/producao";
import type { DadosCriarPublicacao, FiltroPublicacoes, OrdenacaoPublicacoes, VisualizacaoPublicacoes } from "@/types/publicacao";

import { BarraFiltrosPublicacao } from "./barra-filtros-publicacao";
import { CabecalhoPublicacao } from "./cabecalho-publicacao";
import { CalendarioPublicacoes } from "./calendario-publicacoes";
import { EstadoVazioPublicacao } from "./estado-vazio-publicacao";
import { GradePublicacoes } from "./grade-publicacoes";
import { ModalCriarPublicacao } from "./modal-criar-publicacao";
import { PainelCanaisPublicacao } from "./painel-canais-publicacao";
import { PainelDetalhesPublicacao } from "./painel-detalhes-publicacao";
import { ResumoPublicacao } from "./resumo-publicacao";

const dataInicialCalendario = new Date();
const mesInicialCalendario = new Date(dataInicialCalendario.getFullYear(), dataInicialCalendario.getMonth(), 1);

export function CentralPublicacao() {
  const { projetos } = useProjetosLocais();
  const { tarefas } = useProducaoLocal();
  const { publicacoes, carregado, criar, atualizar, gerarMetadados, agendar, marcarPublicada, alternarFavorito, duplicar, arquivar, excluir } = usePublicacoesLocais();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<FiltroPublicacoes>("todas");
  const [ordenacao, setOrdenacao] = useState<OrdenacaoPublicacoes>("recentes");
  const [visualizacao, setVisualizacao] = useState<VisualizacaoPublicacoes>("grade");
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const [criando, setCriando] = useState(false);
  const [tarefaInicialId, setTarefaInicialId] = useState<string | null>(null);
  const [mesCalendario, setMesCalendario] = useState(mesInicialCalendario);
  const [notificacao, setNotificacao] = useState<{ mensagem: string; tipo: "sucesso" | "aviso" } | null>(null);
  const temporizadorNotificacao = useRef<number | null>(null);

  useEffect(() => () => { if (temporizadorNotificacao.current) window.clearTimeout(temporizadorNotificacao.current); }, []);

  const selecionada = publicacoes.find((item) => item.id === selecionadoId) ?? null;
  const tarefasDisponiveis = useMemo(() => tarefas.filter((tarefa) => tarefa.status === "concluida" && !publicacoes.some((publicacao) => publicacao.tarefaId === tarefa.id && publicacao.status !== "arquivada")), [publicacoes, tarefas]);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return [...publicacoes].filter((publicacao) => {
      if (filtro === "rascunhos" && publicacao.status !== "rascunho") return false;
      if (filtro === "prontas" && publicacao.status !== "pronta") return false;
      if (filtro === "agendadas" && publicacao.status !== "agendada") return false;
      if (filtro === "publicadas" && publicacao.status !== "publicada") return false;
      if (filtro === "falhas" && publicacao.status !== "falha") return false;
      if (filtro === "arquivadas" && publicacao.status !== "arquivada") return false;
      if (["youtube-shorts", "instagram-reels", "tiktok", "youtube"].includes(filtro) && publicacao.plataforma !== filtro) return false;
      if (filtro !== "arquivadas" && publicacao.status === "arquivada") return false;
      if (!termo) return true;
      return [publicacao.nome, publicacao.titulo, publicacao.descricao, publicacao.plataforma, publicacao.hashtags.join(" ")].join(" ").toLowerCase().includes(termo);
    }).sort((a, b) => {
      if (ordenacao === "antigas") return new Date(a.atualizadoEm).getTime() - new Date(b.atualizadoEm).getTime();
      if (ordenacao === "titulo-az") return a.titulo.localeCompare(b.titulo, "pt-BR");
      if (ordenacao === "agendamento") return new Date(a.agendadaPara || "9999-12-31").getTime() - new Date(b.agendadaPara || "9999-12-31").getTime();
      return new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime();
    });
  }, [busca, filtro, ordenacao, publicacoes]);

  function notificar(mensagem: string, tipo: "sucesso" | "aviso" = "sucesso") {
    if (temporizadorNotificacao.current) window.clearTimeout(temporizadorNotificacao.current);
    setNotificacao({ mensagem, tipo });
    temporizadorNotificacao.current = window.setTimeout(() => setNotificacao(null), 3600);
  }

  function abrirCriacao(tarefa?: TarefaProducao) { setTarefaInicialId(tarefa?.id ?? null); setCriando(true); }
  function criarNova(dados: DadosCriarPublicacao) { const nova = criar(dados); setCriando(false); setSelecionadoId(nova.id); notificar(`Publicação “${nova.nome}” criada.`); }
  function duplicarAtual(id: string) { const nova = duplicar(id); if (!nova) return; setSelecionadoId(nova.id); notificar("Publicação duplicada como novo rascunho."); }
  function excluirAtual(id: string) { const atual = publicacoes.find((item) => item.id === id); if (!atual || !window.confirm(`Excluir definitivamente “${atual.nome}”?`)) return; excluir(id); setSelecionadoId(null); notificar("Publicação excluída."); }
  function limparFiltros() { setBusca(""); setFiltro("todas"); }

  if (!carregado) return <div className="min-h-[calc(100vh-62px)] bg-[#f7f8f9]"><div className="h-[148px] animate-pulse border-b border-[#e2e7e6] bg-white" /><div className="space-y-4 px-8 py-5"><div className="h-[82px] animate-pulse rounded-md border border-[#e2e7e6] bg-white" /><div className="grid grid-cols-[220px_minmax(0,1fr)] gap-5"><div className="h-[560px] animate-pulse rounded-md border border-[#e2e7e6] bg-white" /><div className="h-[560px] animate-pulse rounded-md border border-[#e2e7e6] bg-white" /></div></div></div>;

  return (
    <div className="min-h-[calc(100vh-62px)] bg-[#f7f8f9]">
      <CabecalhoPublicacao total={publicacoes.length} agendadas={publicacoes.filter((item) => item.status === "agendada").length} aoCriar={() => abrirCriacao()} />
      <div className="space-y-4 px-8 py-5"><ResumoPublicacao publicacoes={publicacoes} /><div className="grid grid-cols-[220px_minmax(0,1fr)] items-start gap-5"><PainelCanaisPublicacao publicacoes={publicacoes} selecionado={filtro} tarefasDisponiveis={tarefasDisponiveis} aoSelecionar={setFiltro} aoCriarDeTarefa={abrirCriacao} /><main className="min-w-0 space-y-3"><BarraFiltrosPublicacao busca={busca} ordenacao={ordenacao} visualizacao={visualizacao} total={filtradas.length} aoBuscar={setBusca} aoOrdenar={setOrdenacao} aoMudarVisualizacao={setVisualizacao} />{filtradas.length === 0 ? <EstadoVazioPublicacao aoLimpar={limparFiltros} aoCriar={() => abrirCriacao()} /> : visualizacao === "calendario" ? <CalendarioPublicacoes publicacoes={filtradas} mes={mesCalendario} aoMudarMes={setMesCalendario} aoSelecionar={setSelecionadoId} /> : <GradePublicacoes publicacoes={filtradas} aoSelecionar={setSelecionadoId} aoFavoritar={alternarFavorito} />}</main></div></div>
      {criando && <ModalCriarPublicacao projetos={projetos} tarefas={tarefas} tarefaInicialId={tarefaInicialId} aoFechar={() => setCriando(false)} aoCriar={criarNova} />}
      {selecionada && <PainelDetalhesPublicacao key={`${selecionada.id}-${selecionada.atualizadoEm}`} publicacao={selecionada} aoFechar={() => setSelecionadoId(null)} aoAtualizar={(alteracoes) => { atualizar(selecionada.id, alteracoes); notificar("Publicação atualizada."); }} aoGerarMetadados={() => { gerarMetadados(selecionada.id); notificar("Nova sugestão de metadados gerada."); }} aoAgendar={(data) => { agendar(selecionada.id, data); notificar("Publicação agendada."); }} aoMarcarPublicada={(link) => { marcarPublicada(selecionada.id, link); notificar("Publicação concluída e link registrado."); }} aoFavoritar={() => alternarFavorito(selecionada.id)} aoDuplicar={() => duplicarAtual(selecionada.id)} aoArquivar={() => { arquivar(selecionada.id); setSelecionadoId(null); notificar("Status de arquivo atualizado."); }} aoExcluir={() => excluirAtual(selecionada.id)} aoNotificar={notificar} />}
      {notificacao && <div role="status" className={`fixed bottom-6 right-6 z-[90] flex max-w-[390px] items-start gap-2.5 rounded-md border bg-white px-3.5 py-3 text-[9.5px] leading-4 shadow-[0_12px_35px_rgba(20,29,27,.13)] ${notificacao.tipo === "sucesso" ? "border-[#cee5df] text-[#286d5e]" : "border-[#eadfca] text-[#8d6b31]"}`}>{notificacao.tipo === "sucesso" ? <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" /> : <CircleAlert className="mt-0.5 size-3.5 shrink-0" />}{notificacao.mensagem}</div>}
    </div>
  );
}

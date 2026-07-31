"use client";

import { CheckCircle2, CircleAlert } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { guiasAjuda, perguntasFrequentes, problemasConhecidos } from "@/data/ajuda";
import { useAjudaLocal } from "@/hooks/use-ajuda-local";
import { baixarPacoteSuporteLocal, copiarResumoDiagnosticoLocal } from "@/lib/ajuda-local";
import type { CategoriaGuia, GuiaAjuda, SecaoAjuda } from "@/types/ajuda";

import { BibliotecaGuias } from "./biblioteca-guias";
import { CabecalhoCentralAjuda } from "./cabecalho-central-ajuda";
import { NavegacaoCentralAjuda } from "./navegacao-central-ajuda";
import { PainelDiagnostico } from "./painel-diagnostico";
import { PainelGuia } from "./painel-guia";
import { PainelNovidades } from "./painel-novidades";
import { PainelPrimeirosPassos } from "./painel-primeiros-passos";
import { PainelSolucaoProblemas } from "./painel-solucao-problemas";
import { PainelSuporte } from "./painel-suporte";
import { PainelVisaoGeral } from "./painel-visao-geral";
import { ResumoAjuda } from "./resumo-ajuda";

const secoesValidas: SecaoAjuda[] = [
  "visao-geral",
  "primeiros-passos",
  "guias",
  "diagnostico",
  "solucao-problemas",
  "suporte",
  "novidades",
];

function normalizarSecao(valor: string | null): SecaoAjuda {
  return secoesValidas.includes(valor as SecaoAjuda) ? (valor as SecaoAjuda) : "visao-geral";
}

export function CentralAjuda() {
  const router = useRouter();
  const parametros = useSearchParams();
  const {
    workspace,
    carregado,
    diagnosticando,
    alternarEtapa,
    concluirOnboarding,
    reiniciarOnboarding,
    registrarGuia,
    alternarFavorito,
    alternarProblemaResolvido,
    marcarNovidadeLida,
    executarDiagnostico,
  } = useAjudaLocal();
  const [secao, setSecao] = useState<SecaoAjuda>(() => normalizarSecao(parametros.get("secao")));
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<CategoriaGuia | "todas">("todas");
  const [guiaAberto, setGuiaAberto] = useState<GuiaAjuda | null>(null);
  const [problemaAbertoId, setProblemaAbertoId] = useState<string | null>(null);
  const [notificacao, setNotificacao] = useState<{ mensagem: string; tipo: "sucesso" | "aviso" } | null>(null);
  const temporizador = useRef<number | null>(null);

  useEffect(() => () => {
    if (temporizador.current) window.clearTimeout(temporizador.current);
  }, []);

  const termo = busca.trim().toLowerCase();
  const guiasFiltrados = useMemo(() => guiasAjuda.filter((guia) => {
    if (categoria !== "todas" && guia.categoria !== categoria) return false;
    if (!termo) return true;
    return [guia.titulo, guia.resumo, guia.categoria, guia.nivel, guia.tags.join(" ")].join(" ").toLowerCase().includes(termo);
  }), [categoria, termo]);
  const perguntasFiltradas = useMemo(() => perguntasFrequentes.filter((pergunta) => !termo || [pergunta.pergunta, pergunta.resposta, pergunta.categoria].join(" ").toLowerCase().includes(termo)), [termo]);
  const problemasFiltrados = useMemo(() => problemasConhecidos.filter((problema) => !termo || [problema.titulo, problema.sintoma, problema.causaProvavel, problema.categoria, problema.passos.join(" ")].join(" ").toLowerCase().includes(termo)), [termo]);

  function notificar(mensagem: string, tipo: "sucesso" | "aviso" = "sucesso") {
    if (temporizador.current) window.clearTimeout(temporizador.current);
    setNotificacao({ mensagem, tipo });
    temporizador.current = window.setTimeout(() => setNotificacao(null), 3600);
  }

  function selecionarSecao(novaSecao: SecaoAjuda) {
    setSecao(novaSecao);
    router.replace(`/central-de-ajuda?secao=${novaSecao}`, { scroll: false });
  }

  function abrirGuia(guia: GuiaAjuda) {
    registrarGuia(guia.id);
    setGuiaAberto(guia);
  }

  async function diagnosticar() {
    const resultado = await executarDiagnostico();
    notificar(
      resultado.statusGeral === "aprovado"
        ? "Diagnóstico concluído sem pendências."
        : `Diagnóstico concluído com ${resultado.resumo.atencoes} atenção(ões) e ${resultado.resumo.erros} erro(s).`,
      resultado.statusGeral === "aprovado" ? "sucesso" : "aviso",
    );
  }

  if (!carregado || !workspace) {
    return (
      <div className="min-h-[calc(100vh-62px)] bg-[#f7f8f9]">
        <div className="h-[132px] animate-pulse border-b border-[#e2e7e6] bg-white" />
        <div className="space-y-4 px-8 py-5">
          <div className="h-[76px] animate-pulse rounded-md border border-[#e2e7e6] bg-white" />
          <div className="grid grid-cols-[220px_minmax(0,1fr)] gap-5"><div className="h-[510px] animate-pulse rounded-md border border-[#e2e7e6] bg-white" /><div className="h-[510px] animate-pulse rounded-md border border-[#e2e7e6] bg-white" /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-62px)] bg-[#f7f8f9]">
      <CabecalhoCentralAjuda busca={busca} aoBuscar={setBusca} />
      <div className="space-y-4 px-8 py-5">
        <ResumoAjuda workspace={workspace} totalGuias={guiasAjuda.length} />
        <div className="grid grid-cols-[220px_minmax(0,1fr)] items-start gap-5">
          <NavegacaoCentralAjuda secao={secao} aoSelecionar={selecionarSecao} />
          <main className="min-w-0">
            {secao === "visao-geral" && <PainelVisaoGeral perguntas={perguntasFiltradas} aoSelecionar={selecionarSecao} />}
            {secao === "primeiros-passos" && <PainelPrimeirosPassos workspace={workspace} aoAlternar={alternarEtapa} aoConcluir={() => { concluirOnboarding(); notificar("Onboarding marcado como concluído."); }} aoReiniciar={() => { reiniciarOnboarding(); notificar("Onboarding reiniciado.", "aviso"); }} />}
            {secao === "guias" && <BibliotecaGuias guias={guiasFiltrados} categoria={categoria} favoritos={workspace.guiasFavoritos} visualizados={workspace.guiasVisualizados} aoMudarCategoria={setCategoria} aoAbrir={abrirGuia} aoFavoritar={(id) => { alternarFavorito(id); notificar("Favoritos atualizados."); }} />}
            {secao === "diagnostico" && <PainelDiagnostico resultado={workspace.ultimoDiagnostico} diagnosticando={diagnosticando} aoExecutar={diagnosticar} />}
            {secao === "solucao-problemas" && <PainelSolucaoProblemas problemas={problemasFiltrados} resolvidos={workspace.problemasResolvidos} abertoId={problemaAbertoId} aoAbrir={(id) => setProblemaAbertoId((atual) => atual === id ? null : id)} aoAlternarResolvido={(id) => { alternarProblemaResolvido(id); notificar("Checklist de solução atualizado."); }} />}
            {secao === "suporte" && <PainelSuporte resultado={workspace.ultimoDiagnostico} aoDiagnosticar={diagnosticar} aoBaixar={() => { try { baixarPacoteSuporteLocal(workspace.ultimoDiagnostico ?? undefined); notificar("Pacote de suporte gerado."); } catch (erro) { notificar(erro instanceof Error ? erro.message : "Não foi possível gerar o pacote.", "aviso"); } }} aoCopiar={() => { if (!workspace.ultimoDiagnostico) return; copiarResumoDiagnosticoLocal(workspace.ultimoDiagnostico).then(() => notificar("Resumo copiado para a área de transferência.")).catch(() => notificar("Não foi possível copiar o resumo.", "aviso")); }} />}
            {secao === "novidades" && <PainelNovidades lidas={workspace.novidadesLidas} aoMarcarLida={(versao) => { marcarNovidadeLida(versao); notificar(`Versão ${versao} marcada como lida.`); }} />}
          </main>
        </div>
      </div>
      {guiaAberto && <PainelGuia guia={guiaAberto} favorito={workspace.guiasFavoritos.includes(guiaAberto.id)} aoFechar={() => setGuiaAberto(null)} aoFavoritar={() => { alternarFavorito(guiaAberto.id); notificar("Favoritos atualizados."); }} />}
      {notificacao && <div role="status" className={`fixed bottom-6 right-6 z-[95] flex max-w-[410px] items-start gap-2.5 rounded-md border bg-white px-3.5 py-3 text-[9.5px] leading-4 shadow-[0_12px_35px_rgba(20,29,27,.13)] ${notificacao.tipo === "sucesso" ? "border-[#cee5df] text-[#286d5e]" : "border-[#eadfca] text-[#8d6b31]"}`}>{notificacao.tipo === "sucesso" ? <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" /> : <CircleAlert className="mt-0.5 size-3.5 shrink-0" />}{notificacao.mensagem}</div>}
    </div>
  );
}

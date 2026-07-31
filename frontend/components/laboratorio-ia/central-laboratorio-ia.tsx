"use client";

import { CheckCircle2, CircleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useLaboratorioIaLocal } from "@/hooks/use-laboratorio-ia-local";
import type {
  ConfiguracaoNovoExperimento,
  PresetPromptLaboratorio,
  TipoFerramentaLaboratorio,
} from "@/types/laboratorio-ia";

import { BibliotecaPresetsPrompts } from "./biblioteca-presets-prompts";
import { CabecalhoLaboratorioIa } from "./cabecalho-laboratorio-ia";
import { EstadoVazioLaboratorio } from "./estado-vazio-laboratorio";
import { HistoricoExperimentos } from "./historico-experimentos";
import { NavegacaoFerramentasLaboratorio } from "./navegacao-ferramentas-laboratorio";
import { PainelConfiguracaoExperimento } from "./painel-configuracao-experimento";
import { PainelResultadosLaboratorio } from "./painel-resultados-laboratorio";
import { ResumoLaboratorioIa } from "./resumo-laboratorio-ia";

export function CentralLaboratorioIa() {
  const router = useRouter();
  const {
    experimentos,
    presets,
    carregado,
    executandoId,
    criar,
    atualizar,
    executar,
    selecionarMelhor,
    duplicar,
    excluir,
    aplicarPreset,
    alternarFavoritoPreset,
    salvarComoPreset,
    prepararParaEstudio,
  } = useLaboratorioIaLocal();

  const [ferramentaAtiva, setFerramentaAtiva] = useState<TipoFerramentaLaboratorio>("roteiro");
  const [experimentoSelecionadoId, setExperimentoSelecionadoId] = useState<string | null>(null);
  const [comparar, setComparar] = useState(false);
  const [presetAplicadoId, setPresetAplicadoId] = useState<string | null>(null);
  const [notificacao, setNotificacao] = useState<{ mensagem: string; tipo: "sucesso" | "aviso" } | null>(null);
  const temporizadorNotificacao = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (temporizadorNotificacao.current) window.clearTimeout(temporizadorNotificacao.current);
    };
  }, []);

  const totais = useMemo<Record<TipoFerramentaLaboratorio, number>>(
    () => ({
      roteiro: experimentos.filter((item) => item.tipo === "roteiro").length,
      "prompt-sistema": experimentos.filter((item) => item.tipo === "prompt-sistema").length,
      gancho: experimentos.filter((item) => item.tipo === "gancho").length,
      "termos-visuais": experimentos.filter((item) => item.tipo === "termos-visuais").length,
      metadados: experimentos.filter((item) => item.tipo === "metadados").length,
    }),
    [experimentos],
  );

  const experimentosDaFerramenta = experimentos.filter((item) => item.tipo === ferramentaAtiva);
  const experimentoSelecionado =
    experimentosDaFerramenta.find((item) => item.id === experimentoSelecionadoId) ??
    experimentosDaFerramenta[0] ??
    null;
  const executando = Boolean(experimentoSelecionado && executandoId === experimentoSelecionado.id);

  function notificar(mensagem: string, tipo: "sucesso" | "aviso" = "sucesso") {
    if (temporizadorNotificacao.current) window.clearTimeout(temporizadorNotificacao.current);
    setNotificacao({ mensagem, tipo });
    temporizadorNotificacao.current = window.setTimeout(() => setNotificacao(null), 3600);
  }

  function criarNovo(tipo = ferramentaAtiva) {
    const experimento = criar(tipo);
    setFerramentaAtiva(tipo);
    setExperimentoSelecionadoId(experimento.id);
    setComparar(false);
    setPresetAplicadoId(null);
    notificar("Novo experimento criado e salvo localmente.");
  }

  function trocarFerramenta(tipo: TipoFerramentaLaboratorio) {
    setFerramentaAtiva(tipo);
    const primeiro = experimentos.find((item) => item.tipo === tipo);
    setExperimentoSelecionadoId(primeiro?.id ?? null);
    setComparar(false);
    setPresetAplicadoId(null);
  }

  function selecionarExperimento(id: string) {
    const experimento = experimentos.find((item) => item.id === id);
    if (!experimento) return;
    setFerramentaAtiva(experimento.tipo);
    setExperimentoSelecionadoId(id);
    setComparar(false);
    setPresetAplicadoId(null);
  }

  function atualizarSelecionado(alteracoes: Partial<ConfiguracaoNovoExperimento>) {
    if (!experimentoSelecionado) return;
    atualizar(experimentoSelecionado.id, alteracoes);
  }

  function executarSelecionado() {
    if (!experimentoSelecionado) return;
    if (!experimentoSelecionado.tema.trim() || !experimentoSelecionado.promptUsuario.trim()) {
      notificar("Preencha o tema e a instrução do experimento antes de gerar as variações.", "aviso");
      return;
    }
    executar(experimentoSelecionado.id);
    setComparar(false);
    notificar("Experimento iniciado. As condições do teste foram preservadas.");
  }

  function duplicarSelecionado(id: string) {
    const criado = duplicar(id);
    if (!criado) return;
    setExperimentoSelecionadoId(criado.id);
    setFerramentaAtiva(criado.tipo);
    setComparar(false);
    notificar("Experimento duplicado sem alterar o histórico original.");
  }

  function excluirSelecionado(id: string) {
    const experimento = experimentos.find((item) => item.id === id);
    if (!experimento) return;
    if (!window.confirm(`Excluir o experimento “${experimento.nome}”?`)) return;
    excluir(id);
    if (experimentoSelecionadoId === id) setExperimentoSelecionadoId(null);
    notificar("Experimento removido do histórico.");
  }

  function aplicarPresetSelecionado(preset: PresetPromptLaboratorio) {
    if (!experimentoSelecionado) return;
    aplicarPreset(experimentoSelecionado.id, preset);
    setFerramentaAtiva(preset.tipo);
    setPresetAplicadoId(preset.id);
    notificar(`Preset “${preset.nome}” aplicado ao experimento.`);
  }

  function salvarPresetSelecionado() {
    if (!experimentoSelecionado) return;
    const preset = salvarComoPreset(experimentoSelecionado.id);
    if (!preset) {
      notificar("Não foi possível salvar este preset.", "aviso");
      return;
    }
    setPresetAplicadoId(preset.id);
    notificar("Prompt salvo na biblioteca como um novo preset favorito.");
  }

  function usarNoProjeto(resultadoId: string) {
    if (!experimentoSelecionado) return;
    const transferencia = prepararParaEstudio(experimentoSelecionado.id, resultadoId);
    if (!transferencia) {
      notificar("Não foi possível preparar o resultado para o estúdio.", "aviso");
      return;
    }
    router.push("/criar-video?origem=laboratorio");
  }

  async function copiarResultado(conteudo: string) {
    try {
      await navigator.clipboard.writeText(conteudo);
      notificar("Resultado copiado para a área de transferência.");
    } catch {
      notificar("O navegador não permitiu copiar automaticamente.", "aviso");
    }
  }

  if (!carregado) {
    return (
      <div className="min-h-[calc(100vh-62px)] bg-[#f7f8f9]">
        <div className="h-[150px] animate-pulse border-b border-[#e2e7e6] bg-white" />
        <div className="space-y-4 px-8 py-5">
          <div className="h-[82px] animate-pulse rounded-md border border-[#e2e7e6] bg-white" />
          <div className="h-[64px] animate-pulse rounded-md border border-[#e2e7e6] bg-white" />
          <div className="grid grid-cols-[210px_minmax(0,1fr)_245px] gap-4">
            <div className="h-[560px] animate-pulse rounded-md border border-[#e2e7e6] bg-white" />
            <div className="h-[560px] animate-pulse rounded-md border border-[#e2e7e6] bg-white" />
            <div className="h-[560px] animate-pulse rounded-md border border-[#e2e7e6] bg-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-62px)] bg-[#f7f8f9]">
      <CabecalhoLaboratorioIa
        totalExperimentos={experimentos.length}
        executando={Boolean(executandoId)}
        aoCriar={() => criarNovo()}
      />

      <div className="space-y-4 px-8 py-5">
        <ResumoLaboratorioIa experimentos={experimentos} presets={presets} />
        <NavegacaoFerramentasLaboratorio
          ativa={ferramentaAtiva}
          totais={totais}
          aoSelecionar={trocarFerramenta}
        />

        {experimentoSelecionado ? (
          <div className="grid grid-cols-[205px_minmax(0,1fr)_235px] items-start gap-4">
            <div className="sticky top-[78px]">
              <HistoricoExperimentos
                experimentos={experimentos}
                selecionadoId={experimentoSelecionado.id}
                ferramentaAtiva={ferramentaAtiva}
                aoSelecionar={selecionarExperimento}
                aoCriar={() => criarNovo()}
                aoDuplicar={duplicarSelecionado}
                aoExcluir={excluirSelecionado}
              />
            </div>

            <main className="min-w-0 space-y-4">
              <PainelConfiguracaoExperimento
                experimento={experimentoSelecionado}
                executando={executando}
                aoAtualizar={atualizarSelecionado}
                aoExecutar={executarSelecionado}
                aoSalvarPreset={salvarPresetSelecionado}
              />
              <PainelResultadosLaboratorio
                experimento={experimentoSelecionado}
                executando={executando}
                comparar={comparar}
                aoAlternarComparacao={() => setComparar((atual) => !atual)}
                aoSelecionarMelhor={(resultadoId) =>
                  selecionarMelhor(experimentoSelecionado.id, resultadoId)
                }
                aoUsarNoProjeto={usarNoProjeto}
                aoCopiar={copiarResultado}
              />
            </main>

            <div className="sticky top-[78px]">
              <BibliotecaPresetsPrompts
                presets={presets}
                ferramentaAtiva={ferramentaAtiva}
                presetAplicadoId={presetAplicadoId}
                aoAplicar={aplicarPresetSelecionado}
                aoFavoritar={alternarFavoritoPreset}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-[205px_minmax(0,1fr)_235px] items-start gap-4">
            <HistoricoExperimentos
              experimentos={experimentos}
              selecionadoId={null}
              ferramentaAtiva={ferramentaAtiva}
              aoSelecionar={selecionarExperimento}
              aoCriar={() => criarNovo()}
              aoDuplicar={duplicarSelecionado}
              aoExcluir={excluirSelecionado}
            />
            <EstadoVazioLaboratorio aoCriar={() => criarNovo()} />
            <BibliotecaPresetsPrompts
              presets={presets}
              ferramentaAtiva={ferramentaAtiva}
              presetAplicadoId={presetAplicadoId}
              aoAplicar={(preset) => {
                const novo = criar(preset.tipo);
                setExperimentoSelecionadoId(novo.id);
                setFerramentaAtiva(preset.tipo);
                aplicarPreset(novo.id, preset);
                setPresetAplicadoId(preset.id);
                notificar(`Experimento criado com o preset “${preset.nome}”.`);
              }}
              aoFavoritar={alternarFavoritoPreset}
            />
          </div>
        )}
      </div>

      {notificacao && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-50 flex max-w-[390px] items-start gap-2.5 rounded-md border bg-white px-3.5 py-3 text-[9.5px] leading-4 shadow-[0_12px_35px_rgba(20,29,27,.13)] ${
            notificacao.tipo === "aviso"
              ? "border-[#ead9cb] text-[#8b5e3b]"
              : "border-[#cce4de] text-[#276f60]"
          }`}
        >
          {notificacao.tipo === "aviso" ? (
            <CircleAlert className="mt-0.5 size-3.5 shrink-0" />
          ) : (
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" />
          )}
          {notificacao.mensagem}
        </div>
      )}
    </div>
  );
}

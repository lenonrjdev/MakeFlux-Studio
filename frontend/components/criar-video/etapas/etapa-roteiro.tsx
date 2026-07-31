"use client";

import { FileText, LoaderCircle, RotateCcw, Sparkles, WandSparkles } from "lucide-react";
import { useState } from "react";

import { Botao } from "@/components/ui/botao";
import { CampoFormulario, classesCampo } from "@/components/ui/campo-formulario";
import { modelosIa } from "@/data/criar-video";
import type { AtualizarConfiguracaoVideo, ConfiguracaoCriacaoVideo } from "@/types/criar-video";

function criarRoteiroDemonstracao(tema: string) {
  const assunto = tema.trim() || "hábitos que reduzem a produtividade";
  return `Você pode estar perdendo horas do seu dia sem perceber. ${assunto} não começa com uma grande decisão, mas com pequenas interrupções repetidas. Primeiro, observe o que quebra seu foco. Depois, escolha apenas três prioridades para o dia e reserve períodos sem notificações. Por fim, encerre cada tarefa antes de abrir outra. Uma mudança simples já pode devolver clareza à sua rotina. Qual distração você vai eliminar hoje?`;
}

export function EtapaRoteiro({
  configuracao,
  atualizar,
  notificar,
}: {
  configuracao: ConfiguracaoCriacaoVideo;
  atualizar: AtualizarConfiguracaoVideo;
  notificar: (mensagem: string) => void;
}) {
  const [gerando, setGerando] = useState(false);
  const palavras = configuracao.roteiro.trim() ? configuracao.roteiro.trim().split(/\s+/).length : 0;
  const duracaoEstimada = Math.max(0, Math.round((palavras / 150) * 60));

  function gerarRoteiro() {
    setGerando(true);
    window.setTimeout(() => {
      atualizar("roteiro", criarRoteiroDemonstracao(configuracao.tema));
      setGerando(false);
      notificar("Roteiro de demonstração criado para validar a interface.");
    }, 650);
  }

  return (
    <div className="grid grid-cols-[320px_minmax(0,1fr)] gap-5">
      <div className="space-y-5 border-r border-[#edf0f0] pr-5">
        <CampoFormulario rotulo="Modelo de escrita" descricao="O provedor real será validado na etapa de integrações.">
          <select
            value={configuracao.modeloIa}
            onChange={(evento) => atualizar("modeloIa", evento.target.value)}
            className={`${classesCampo} h-9`}
          >
            {modelosIa.map((modelo) => (
              <option key={modelo}>{modelo}</option>
            ))}
          </select>
        </CampoFormulario>

        <CampoFormulario
          rotulo="Prompt do roteiro"
          descricao="Explique estrutura, ritmo, tom e resultado esperado."
        >
          <textarea
            value={configuracao.promptRoteiro}
            onChange={(evento) => atualizar("promptRoteiro", evento.target.value)}
            className={`${classesCampo} min-h-[132px] resize-none py-3 leading-5`}
          />
        </CampoFormulario>

        <details className="rounded-md border border-[#e1e5e5] bg-[#fafbfb] p-3" open={configuracao.modo === "avancado"}>
          <summary className="cursor-pointer text-[10px] font-medium text-[#3d4445]">System prompt avançado</summary>
          <textarea
            value={configuracao.systemPrompt}
            onChange={(evento) => atualizar("systemPrompt", evento.target.value)}
            className={`${classesCampo} mt-3 min-h-[108px] resize-none py-3 text-[9.5px] leading-4`}
          />
        </details>

        <Botao onClick={gerarRoteiro} disabled={gerando} variante="primario" className="w-full">
          {gerando ? <LoaderCircle className="size-3.5 animate-spin" /> : <WandSparkles className="size-3.5" />}
          {gerando ? "Preparando demonstração" : "Gerar roteiro de demonstração"}
        </Botao>

        <div className="rounded-md border border-[#e6e1d9] bg-[#fbf8f4] p-3 text-[8.5px] leading-4 text-[#816d59]">
          A geração desta fase é apenas uma simulação visual. Nenhuma chamada de API é feita agora.
        </div>
      </div>

      <div className="min-w-0">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-md bg-[#eef5f3] text-[#248975]">
              <FileText className="size-3.5" />
            </span>
            <div>
              <strong className="block text-[10.5px] font-semibold text-[#303637]">Editor do roteiro</strong>
              <span className="mt-0.5 block text-[8px] text-[#92999a]">Edite livremente antes de criar as cenas.</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Botao
              onClick={() => atualizar("roteiro", "")}
              variante="fantasma"
              className="h-8 px-2.5"
              disabled={!configuracao.roteiro}
            >
              <RotateCcw className="size-3" />
              Limpar
            </Botao>
            <Botao
              onClick={() => notificar("A comparação de versões será aprofundada no Laboratório de IA.")}
              className="h-8 px-2.5"
            >
              <Sparkles className="size-3" />
              Criar variação
            </Botao>
          </div>
        </div>

        <textarea
          value={configuracao.roteiro}
          onChange={(evento) => atualizar("roteiro", evento.target.value)}
          className={`${classesCampo} min-h-[425px] resize-none px-5 py-5 text-[12px] leading-7`}
          placeholder="O roteiro aparecerá aqui. Você também pode colar um texto próprio e continuar sem utilizar IA."
        />

        <div className="mt-3 grid grid-cols-3 divide-x divide-[#e5e9e9] rounded-md border border-[#e5e9e9] bg-[#fafbfb] py-2.5">
          <div className="px-3">
            <strong className="block text-[10px] font-medium text-[#333839]">{palavras}</strong>
            <span className="mt-1 block text-[7.5px] uppercase tracking-[0.05em] text-[#9aa1a2]">Palavras</span>
          </div>
          <div className="px-3">
            <strong className="block text-[10px] font-medium text-[#333839]">~{duracaoEstimada}s</strong>
            <span className="mt-1 block text-[7.5px] uppercase tracking-[0.05em] text-[#9aa1a2]">Duração estimada</span>
          </div>
          <div className="px-3">
            <strong className="block text-[10px] font-medium text-[#333839]">Português natural</strong>
            <span className="mt-1 block text-[7.5px] uppercase tracking-[0.05em] text-[#9aa1a2]">Leitura</span>
          </div>
        </div>
      </div>
    </div>
  );
}

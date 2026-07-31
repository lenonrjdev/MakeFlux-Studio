"use client";

import { Play, Save, SlidersHorizontal } from "lucide-react";

import { Botao } from "@/components/ui/botao";
import { CampoFormulario, classesCampo } from "@/components/ui/campo-formulario";
import { idiomasLaboratorio, modelosLaboratorio, plataformasLaboratorio } from "@/data/laboratorio-ia";
import type {
  ConfiguracaoNovoExperimento,
  ExperimentoLaboratorio,
} from "@/types/laboratorio-ia";

export function PainelConfiguracaoExperimento({
  experimento,
  executando,
  aoAtualizar,
  aoExecutar,
  aoSalvarPreset,
}: {
  experimento: ExperimentoLaboratorio;
  executando: boolean;
  aoAtualizar: (alteracoes: Partial<ConfiguracaoNovoExperimento>) => void;
  aoExecutar: () => void;
  aoSalvarPreset: () => void;
}) {
  return (
    <section className="painel-superficie overflow-hidden rounded-md">
      <header className="flex items-start justify-between gap-4 border-b border-[#e7ebeb] bg-[#fafbfb] px-4 py-3.5">
        <div>
          <h2 className="text-[10px] font-semibold text-[#303637]">Configuração do experimento</h2>
          <p className="mt-1 text-[8px] leading-3.5 text-[#8b9293]">
            Defina contexto, comportamento e parâmetros antes de comparar as variações.
          </p>
        </div>
        <span className="inline-flex h-7 items-center gap-1.5 rounded-md border border-[#dfe5e4] bg-white px-2 text-[7.5px] font-medium text-[#727a7b]">
          <SlidersHorizontal className="size-3" /> Modo avançado
        </span>
      </header>

      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-3">
          <CampoFormulario rotulo="Nome do experimento">
            <input
              value={experimento.nome}
              onChange={(evento) => aoAtualizar({ nome: evento.target.value })}
              className={`${classesCampo} h-9`}
            />
          </CampoFormulario>
          <CampoFormulario rotulo="Modelo">
            <select
              value={experimento.modelo}
              onChange={(evento) => aoAtualizar({ modelo: evento.target.value })}
              className={`${classesCampo} h-9`}
            >
              {modelosLaboratorio.map((modelo) => (
                <option key={modelo}>{modelo}</option>
              ))}
            </select>
          </CampoFormulario>
        </div>

        <CampoFormulario
          rotulo="Tema ou contexto"
          descricao="Use uma descrição concreta para manter as versões comparáveis."
        >
          <textarea
            value={experimento.tema}
            onChange={(evento) => aoAtualizar({ tema: evento.target.value })}
            rows={3}
            className={`${classesCampo} resize-y py-2.5 leading-4`}
          />
        </CampoFormulario>

        <div className="grid grid-cols-3 gap-3">
          <CampoFormulario rotulo="Público">
            <input
              value={experimento.publico}
              onChange={(evento) => aoAtualizar({ publico: evento.target.value })}
              className={`${classesCampo} h-9`}
            />
          </CampoFormulario>
          <CampoFormulario rotulo="Plataforma">
            <select
              value={experimento.plataforma}
              onChange={(evento) => aoAtualizar({ plataforma: evento.target.value })}
              className={`${classesCampo} h-9`}
            >
              {plataformasLaboratorio.map((plataforma) => (
                <option key={plataforma}>{plataforma}</option>
              ))}
            </select>
          </CampoFormulario>
          <CampoFormulario rotulo="Idioma">
            <select
              value={experimento.idioma}
              onChange={(evento) => aoAtualizar({ idioma: evento.target.value })}
              className={`${classesCampo} h-9`}
            >
              {idiomasLaboratorio.map((idioma) => (
                <option key={idioma}>{idioma}</option>
              ))}
            </select>
          </CampoFormulario>
        </div>

        <CampoFormulario
          rotulo="Prompt do sistema"
          descricao="Define o papel, as restrições e o padrão editorial da IA."
        >
          <textarea
            value={experimento.promptSistema}
            onChange={(evento) => aoAtualizar({ promptSistema: evento.target.value })}
            rows={4}
            className={`${classesCampo} resize-y py-2.5 leading-4`}
          />
        </CampoFormulario>

        <CampoFormulario
          rotulo="Instrução do experimento"
          descricao="Escreva o que deve mudar entre as variações e o que precisa permanecer igual."
        >
          <textarea
            value={experimento.promptUsuario}
            onChange={(evento) => aoAtualizar({ promptUsuario: evento.target.value })}
            rows={5}
            className={`${classesCampo} resize-y py-2.5 leading-4`}
          />
        </CampoFormulario>

        <div className="grid grid-cols-[1fr_1fr_1.4fr] gap-3 rounded-md border border-[#e3e7e7] bg-[#fafbfb] p-3">
          <CampoFormulario rotulo="Variações">
            <select
              value={experimento.quantidadeVariacoes}
              onChange={(evento) => aoAtualizar({ quantidadeVariacoes: Number(evento.target.value) })}
              className={`${classesCampo} h-9 bg-white`}
            >
              {[2, 3, 4].map((quantidade) => (
                <option key={quantidade} value={quantidade}>
                  {quantidade} versões
                </option>
              ))}
            </select>
          </CampoFormulario>
          <CampoFormulario rotulo={`Criatividade · ${experimento.temperatura.toFixed(1)}`}>
            <input
              type="range"
              min="0.2"
              max="1"
              step="0.1"
              value={experimento.temperatura}
              onChange={(evento) => aoAtualizar({ temperatura: Number(evento.target.value) })}
              className="mt-2 h-5 w-full accent-[#238771]"
            />
          </CampoFormulario>
          <CampoFormulario rotulo="Observações" opcional>
            <input
              value={experimento.observacoes}
              onChange={(evento) => aoAtualizar({ observacoes: evento.target.value })}
              placeholder="O que você pretende avaliar?"
              className={`${classesCampo} h-9 bg-white`}
            />
          </CampoFormulario>
        </div>
      </div>

      <footer className="flex items-center justify-between border-t border-[#e7ebeb] bg-[#fafbfb] px-4 py-3">
        <p className="max-w-[460px] text-[7.5px] leading-3.5 text-[#8b9293]">
          Os resultados ficam salvos no histórico local junto com o modelo, os prompts e as pontuações usadas na comparação.
        </p>
        <div className="flex items-center gap-2">
          <Botao onClick={aoSalvarPreset} className="h-8 px-2.5 text-[9px]">
            <Save className="size-3.5" /> Salvar como preset
          </Botao>
          <Botao
            onClick={aoExecutar}
            variante="primario"
            className="h-8 min-w-[142px] px-3 text-[9px]"
            disabled={executando}
          >
            <Play className={`size-3.5 ${executando ? "animate-pulse" : ""}`} />
            {executando ? "Gerando variações..." : "Executar experimento"}
          </Botao>
        </div>
      </footer>
    </section>
  );
}

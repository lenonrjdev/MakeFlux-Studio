"use client";

import {
  Check,
  CircleAlert,
  Clock3,
  Eye,
  EyeOff,
  KeyRound,
  Power,
  RefreshCw,
  RotateCcw,
  Save,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";

import { Botao } from "@/components/ui/botao";
import { Interruptor } from "@/components/ui/interruptor";
import {
  coresStatusIntegracao,
  iconesIntegracoes,
  rotulosCapacidades,
  rotulosStatusIntegracao,
} from "@/data/integracoes";
import type {
  AtualizacaoIntegracao,
  CapacidadeIntegracao,
  IntegracaoStudio,
  PadroesIntegracoes,
} from "@/types/integracoes";

function formatarData(data: string | null) {
  if (!data) return "Nunca verificada";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(data));
}

export function PainelDetalhesIntegracao({
  integracao,
  padroes,
  testando,
  aoFechar,
  aoAtualizar,
  aoLimparCredencial,
  aoAlternarAtiva,
  aoTestar,
  aoDefinirPadrao,
  aoRestaurar,
  aoNotificar,
}: {
  integracao: IntegracaoStudio;
  padroes: PadroesIntegracoes;
  testando: boolean;
  aoFechar: () => void;
  aoAtualizar: (dados: AtualizacaoIntegracao) => void;
  aoLimparCredencial: () => void;
  aoAlternarAtiva: () => void;
  aoTestar: () => void;
  aoDefinirPadrao: (capacidade: CapacidadeIntegracao) => void;
  aoRestaurar: () => void;
  aoNotificar: (mensagem: string, tipo?: "sucesso" | "aviso") => void;
}) {
  const Icone = iconesIntegracoes[integracao.id] ?? ShieldCheck;
  const [endpoint, setEndpoint] = useState(integracao.endpoint);
  const [modelo, setModelo] = useState(integracao.modelo);
  const [credencial, setCredencial] = useState("");
  const [mostrarCredencial, setMostrarCredencial] = useState(false);
  const [configuracoes, setConfiguracoes] = useState<Record<string, string | number | boolean>>({ ...integracao.configuracoes });

  function alterarConfiguracao(id: string, valor: string | number | boolean) {
    setConfiguracoes((atuais) => ({ ...atuais, [id]: valor }));
  }

  function salvar() {
    aoAtualizar({ endpoint, modelo, configuracoes, credencial });
    setCredencial("");
    aoNotificar("Configuração salva. Execute um teste para confirmar a integração.");
  }

  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-[#15201e]/25 backdrop-blur-[1px]" role="dialog" aria-modal="true" aria-label={`Detalhes de ${integracao.nome}`}>
      <button type="button" className="absolute inset-0" onClick={aoFechar} aria-label="Fechar painel" />
      <aside className="relative z-10 flex h-full w-[520px] flex-col border-l border-[#dce2e1] bg-white shadow-[-18px_0_50px_rgba(23,34,32,.13)]">
        <header className="flex items-start justify-between gap-4 border-b border-[#e6eae9] px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-md border border-[#dce6e3] bg-[#f2f8f6] text-[#277763]">
              <Icone className="size-4.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-[13px] font-semibold text-[#293031]">{integracao.nome}</h2>
                <span className={`rounded border px-1.5 py-0.5 text-[6.8px] ${coresStatusIntegracao[integracao.status]}`}>
                  {rotulosStatusIntegracao[integracao.status]}
                </span>
              </div>
              <p className="mt-1 text-[8px] text-[#879091]">{integracao.fornecedor} · {integracao.execucao}</p>
            </div>
          </div>
          <button type="button" onClick={aoFechar} className="foco-acessivel grid size-8 place-items-center rounded-md text-[#737d7e] hover:bg-[#f0f3f3]" aria-label="Fechar">
            <X className="size-4" />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <section className="rounded-md border border-[#e1e6e5] bg-[#fafbfb] p-3.5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <strong className="text-[9px] font-semibold text-[#303637]">Estado da integração</strong>
                <p className="mt-1 text-[8px] leading-4 text-[#7e8788]">{integracao.mensagemStatus}</p>
              </div>
              <button
                type="button"
                onClick={aoAlternarAtiva}
                className={`foco-acessivel flex h-8 shrink-0 items-center gap-1.5 rounded-md border px-2.5 text-[8px] ${integracao.ativa ? "border-[#cce1dc] bg-[#eef8f5] text-[#28735f]" : "border-[#e0e5e4] bg-white text-[#858e8f]"}`}
              >
                <Power className="size-3.5" /> {integracao.ativa ? "Ativa" : "Desativada"}
              </button>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[#e7ebea] pt-3 text-[7.5px] text-[#7f8889]">
              <span><strong className="block text-[#4d5758]">Versão</strong>{integracao.versao}</span>
              <span><strong className="block text-[#4d5758]">Último teste</strong>{formatarData(integracao.ultimaVerificacaoEm)}</span>
              <span><strong className="block text-[#4d5758]">Latência</strong>{integracao.latenciaMs ? `${integracao.latenciaMs} ms` : "—"}</span>
            </div>
          </section>

          <section>
            <div className="mb-2.5 flex items-center justify-between">
              <div>
                <strong className="text-[9px] font-semibold text-[#303637]">Configuração</strong>
                <p className="mt-0.5 text-[7.5px] text-[#91999a]">Parâmetros usados pelo adaptador do motor.</p>
              </div>
              {integracao.requerCredencial && (
                <span className="flex items-center gap-1 text-[7px] text-[#778182]"><KeyRound className="size-3" /> {integracao.credencialMascara}</span>
              )}
            </div>
            <div className="space-y-2.5">
              {integracao.campos.map((campo) => {
                if (campo.tipo === "interruptor") {
                  return (
                    <Interruptor
                      key={campo.id}
                      ativo={Boolean(configuracoes[campo.id])}
                      aoAlterar={(valor) => alterarConfiguracao(campo.id, valor)}
                      rotulo={campo.rotulo}
                      descricao={campo.descricao}
                    />
                  );
                }
                const valor = campo.id === "endpoint"
                  ? endpoint
                  : campo.id === "modelo"
                    ? modelo
                    : campo.id === "credencial"
                      ? credencial
                      : configuracoes[campo.id] ?? "";
                return (
                  <label key={campo.id} className="block">
                    <span className="mb-1.5 block text-[8px] font-medium text-[#566061]">{campo.rotulo}</span>
                    {campo.descricao && <span className="mb-1.5 block text-[7px] leading-3.5 text-[#969d9e]">{campo.descricao}</span>}
                    <div className="relative">
                      {campo.tipo === "selecao" ? (
                        <select
                          value={String(valor)}
                          onChange={(evento) => {
                            if (campo.id === "modelo") setModelo(evento.target.value);
                            else alterarConfiguracao(campo.id, evento.target.value);
                          }}
                          className="foco-acessivel h-9 w-full rounded-md border border-[#dfe5e4] bg-white px-3 text-[8.5px] text-[#424b4c]"
                        >
                          {campo.opcoes?.map((opcao) => <option key={opcao.valor} value={opcao.valor}>{opcao.rotulo}</option>)}
                        </select>
                      ) : (
                        <input
                          type={campo.tipo === "segredo" && !mostrarCredencial ? "password" : campo.tipo === "numero" ? "number" : "text"}
                          value={String(valor)}
                          min={campo.minimo}
                          max={campo.maximo}
                          step={campo.passo}
                          placeholder={campo.placeholder}
                          onChange={(evento) => {
                            const proximo = campo.tipo === "numero" ? Number(evento.target.value) : evento.target.value;
                            if (campo.id === "endpoint") setEndpoint(String(proximo));
                            else if (campo.id === "modelo") setModelo(String(proximo));
                            else if (campo.id === "credencial") setCredencial(String(proximo));
                            else alterarConfiguracao(campo.id, proximo);
                          }}
                          className="foco-acessivel h-9 w-full rounded-md border border-[#dfe5e4] bg-white px-3 pr-9 text-[8.5px] text-[#424b4c] placeholder:text-[#a2a9aa]"
                        />
                      )}
                      {campo.tipo === "segredo" && (
                        <button type="button" onClick={() => setMostrarCredencial((atual) => !atual)} className="foco-acessivel absolute right-1 top-1 grid size-7 place-items-center rounded text-[#7e8889] hover:bg-[#f1f4f4]" aria-label="Mostrar ou ocultar credencial">
                          {mostrarCredencial ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                        </button>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
            {integracao.requerCredencial && integracao.credencialConfigurada && (
              <button type="button" onClick={aoLimparCredencial} className="foco-acessivel mt-2.5 flex h-8 items-center gap-1.5 rounded-md px-2 text-[7.5px] text-[#9a5a52] hover:bg-[#fff3f1]">
                <Trash2 className="size-3.5" /> Remover credencial configurada
              </button>
            )}
          </section>

          <section className="rounded-md border border-[#e1e6e5] p-3.5">
            <strong className="text-[9px] font-semibold text-[#303637]">Uso padrão</strong>
            <p className="mt-1 text-[7.5px] leading-4 text-[#909899]">Defina este provedor como principal para as capacidades compatíveis.</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {integracao.capacidades.map((capacidade) => {
                const ativo = padroes[capacidade] === integracao.id;
                return (
                  <button
                    key={capacidade}
                    type="button"
                    onClick={() => aoDefinirPadrao(capacidade)}
                    className={`foco-acessivel flex items-center justify-between gap-2 rounded-md border px-2.5 py-2 text-left text-[7.5px] ${ativo ? "border-[#cce2dc] bg-[#eef8f5] text-[#26735f]" : "border-[#e1e6e5] bg-[#fafbfb] text-[#687273]"}`}
                  >
                    {rotulosCapacidades[capacidade]} {ativo && <Check className="size-3.5" />}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <div className="mb-2.5 flex items-center gap-2">
              <Clock3 className="size-3.5 text-[#778182]" />
              <strong className="text-[9px] font-semibold text-[#303637]">Histórico</strong>
            </div>
            <div className="space-y-2">
              {[...integracao.historico].reverse().slice(0, 6).map((evento) => (
                <div key={evento.id} className="rounded-md border border-[#e5e9e8] bg-[#fafbfb] px-3 py-2">
                  <p className="text-[7.5px] leading-4 text-[#667071]">{evento.descricao}</p>
                  <span className="mt-1 block text-[6.8px] text-[#9aa1a2]">{formatarData(evento.criadoEm)}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="flex items-start gap-2 rounded-md border border-[#e8dfca] bg-[#fffaf0] p-3 text-[7.5px] leading-4 text-[#876b37]">
            <CircleAlert className="mt-0.5 size-3.5 shrink-0" />
            As verificações desta fase são demonstrativas. A conexão real e o cofre seguro serão ativados pelo adaptador Tauri e pela API do MoneyPrinterTurbo.
          </div>
        </div>

        <footer className="border-t border-[#e5e9e8] bg-white px-5 py-3.5">
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={aoRestaurar} className="foco-acessivel flex h-9 items-center gap-1.5 rounded-md px-2 text-[8px] text-[#727c7d] hover:bg-[#f2f5f5]">
              <RotateCcw className="size-3.5" /> Restaurar padrão
            </button>
            <div className="flex items-center gap-2">
              <Botao onClick={aoTestar} disabled={testando}>
                <RefreshCw className={`size-3.5 ${testando ? "animate-spin" : ""}`} /> {testando ? "Testando" : "Testar"}
              </Botao>
              <Botao variante="primario" onClick={salvar}>
                <Save className="size-3.5" /> Salvar configuração
              </Botao>
            </div>
          </div>
        </footer>
      </aside>
    </div>
  );
}

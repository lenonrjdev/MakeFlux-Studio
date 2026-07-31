"use client";

import {
  CheckCircle2,
  CircleAlert,
  Cpu,
  HardDrive,
  Play,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Square,
  Terminal,
  WifiOff,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Botao } from "@/components/ui/botao";
import { useRuntimeNativo } from "@/hooks/use-runtime-nativo";
import {
  atualizarMotorSeguro,
  iniciarMotorMoneyPrinter,
  inspecionarRepositorioMotor,
  pararMotorMoneyPrinter,
  rollbackMotorSeguro,
  verificarAtualizacaoMotor,
  verificarMoneyPrinter,
} from "@/lib/runtime-nativo";
import type { AtualizacaoIntegracao, IntegracaoStudio } from "@/types/integracoes";
import type { EstadoRepositorioMotor } from "@/types/runtime-nativo";

function caminhoCurto(caminho: string | null) {
  if (!caminho) return "Não detectado";
  return caminho.length > 48 ? `…${caminho.slice(-46)}` : caminho;
}

export function PainelRuntimeNativo({
  integracao,
  aoAtualizar,
  aoNotificar,
}: {
  integracao: IntegracaoStudio | null;
  aoAtualizar: (dados: AtualizacaoIntegracao) => void;
  aoNotificar: (mensagem: string, tipo?: "sucesso" | "aviso") => void;
}) {
  const { desktop, capacidades, motor, carregando, erro, detectar, definirMotor, definirErro } = useRuntimeNativo();
  const [diretorio, setDiretorio] = useState(() => String(integracao?.configuracoes.diretorioProjeto ?? ""));
  const [python, setPython] = useState(() => String(integracao?.configuracoes.pythonExecutavel ?? "python"));
  const [repositorio, setRepositorio] = useState<EstadoRepositorioMotor | null>(null);
  const [operacao, setOperacao] = useState<string | null>(null);

  const resumo = useMemo(() => {
    if (!desktop) return { titulo: "Prévia web", descricao: "Abra o aplicativo Tauri para usar processos, diagnóstico e atualização nativa.", pronto: false };
    if (!capacidades) return { titulo: "Aguardando diagnóstico", descricao: "Detecte Python, FFmpeg, Git, memória e GPU deste computador.", pronto: false };
    return {
      titulo: capacidades.modoOfflinePronto ? "Modo offline preparado" : "Modo offline incompleto",
      descricao: capacidades.modoOfflinePronto
        ? "Python e FFmpeg estão disponíveis para o pipeline local."
        : "Instale ou configure Python e FFmpeg antes de renderizar sem internet.",
      pronto: capacidades.modoOfflinePronto,
    };
  }, [capacidades, desktop]);

  async function executar(nome: string, tarefa: () => Promise<void>) {
    setOperacao(nome);
    definirErro(null);
    try {
      await tarefa();
    } catch (falha) {
      const mensagem = falha instanceof Error ? falha.message : String(falha);
      definirErro(mensagem);
      aoNotificar(mensagem, "aviso");
    } finally {
      setOperacao(null);
    }
  }

  function salvarCaminhos() {
    aoAtualizar({
      configuracoes: {
        diretorioProjeto: diretorio.trim(),
        pythonExecutavel: python.trim() || "python",
      },
    });
    aoNotificar("Pasta e executável do motor salvos.");
  }

  async function iniciar() {
    await executar("iniciar", async () => {
      salvarCaminhos();
      const estado = await iniciarMotorMoneyPrinter({ diretorio: diretorio.trim(), python: python.trim() || "python" });
      definirMotor(estado);
      aoNotificar(`MoneyPrinterTurbo iniciado${estado.pid ? ` no processo ${estado.pid}` : ""}.`);
    });
  }

  async function parar() {
    await executar("parar", async () => {
      definirMotor(await pararMotorMoneyPrinter());
      aoNotificar("Processo do MoneyPrinterTurbo encerrado.", "aviso");
    });
  }

  async function testarApi() {
    if (!integracao) return;
    await executar("api", async () => {
      const resultado = await verificarMoneyPrinter(integracao.endpoint);
      aoNotificar(resultado.mensagem, resultado.disponivel ? "sucesso" : "aviso");
    });
  }

  async function verificarRepositorio() {
    await executar("repositorio", async () => {
      salvarCaminhos();
      const estado = await verificarAtualizacaoMotor(diretorio.trim());
      setRepositorio(estado);
      aoNotificar(
        estado.atualizacaoDisponivel
          ? `${estado.commitsPendentes} atualização(ões) do motor disponível(is).`
          : "O motor já está atualizado.",
        estado.limpo ? "sucesso" : "aviso",
      );
    });
  }

  async function atualizar() {
    if (!window.confirm("Atualizar o motor por fast-forward e criar um ponto de rollback antes de continuar?")) return;
    await executar("atualizar", async () => {
      const resultado = await atualizarMotorSeguro(diretorio.trim());
      setRepositorio(await inspecionarRepositorioMotor(diretorio.trim()));
      aoNotificar(resultado.mensagem);
    });
  }

  async function rollback() {
    if (!window.confirm("Restaurar o commit salvo no último ponto de rollback do motor?")) return;
    await executar("rollback", async () => {
      const resultado = await rollbackMotorSeguro(diretorio.trim());
      setRepositorio(await inspecionarRepositorioMotor(diretorio.trim()));
      aoNotificar(resultado.mensagem, "aviso");
    });
  }

  return (
    <section className="painel-superficie overflow-hidden rounded-md">
      <div className="flex items-start justify-between gap-5 border-b border-[#e4e9e8] px-4 py-3.5">
        <div className="flex items-start gap-3">
          <div className={`grid size-9 shrink-0 place-items-center rounded-md ${resumo.pronto ? "bg-[#eef8f5] text-[#23806a]" : "bg-[#fff8e8] text-[#906d30]"}`}>
            {resumo.pronto ? <ShieldCheck className="size-4" /> : <WifiOff className="size-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <strong className="text-[10px] font-semibold text-[#303637]">Runtime nativo e motor offline</strong>
              <span className={`rounded px-1.5 py-0.5 text-[6.8px] font-semibold uppercase tracking-[0.08em] ${desktop ? "bg-[#edf7f4] text-[#26735f]" : "bg-[#f1f3f3] text-[#7b8586]"}`}>
                {desktop ? "Tauri ativo" : "Modo web"}
              </span>
            </div>
            <p className="mt-1 text-[8px] leading-4 text-[#7d8687]">{resumo.titulo} · {resumo.descricao}</p>
          </div>
        </div>
        <Botao onClick={() => void detectar()} disabled={!desktop || carregando || Boolean(operacao)}>
          <RefreshCw className={`size-3.5 ${carregando ? "animate-spin" : ""}`} /> Detectar ambiente
        </Botao>
      </div>

      <div className="grid grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)] gap-0">
        <div className="border-r border-[#e4e9e8] p-4">
          <div className="grid grid-cols-2 gap-2.5">
            <article className="rounded-md border border-[#e3e8e7] bg-[#fafbfb] p-3">
              <div className="flex items-center gap-2 text-[#657071]"><Cpu className="size-3.5" /><strong className="text-[8px]">Computador</strong></div>
              <p className="mt-2 text-[8px] text-[#4f595a]">{capacidades ? `${capacidades.nucleosLogicos} threads · ${Math.round(capacidades.memoriaTotalMb / 1024)} GB RAM` : "Aguardando detecção"}</p>
              <span className="mt-1 block truncate text-[6.8px] text-[#969d9e]">{capacidades?.gpu ?? "GPU não identificada"}</span>
            </article>
            <article className="rounded-md border border-[#e3e8e7] bg-[#fafbfb] p-3">
              <div className="flex items-center gap-2 text-[#657071]"><HardDrive className="size-3.5" /><strong className="text-[8px]">Dependências locais</strong></div>
              <p className="mt-2 text-[8px] text-[#4f595a]">Python {capacidades?.python.disponivel ? "pronto" : "pendente"} · FFmpeg {capacidades?.ffmpeg.disponivel ? "pronto" : "pendente"}</p>
              <span className="mt-1 block truncate text-[6.8px] text-[#969d9e]">Git {capacidades?.git.disponivel ? caminhoCurto(capacidades.git.caminho) : "não detectado"}</span>
            </article>
          </div>

          <div className="mt-3 grid grid-cols-[minmax(0,1fr)_150px_auto] items-end gap-2">
            <label className="min-w-0">
              <span className="mb-1.5 block text-[7.5px] font-medium text-[#596364]">Pasta do MoneyPrinterTurbo</span>
              <input value={diretorio} onChange={(evento) => setDiretorio(evento.target.value)} placeholder="C:\\Ferramentas\\MoneyPrinterTurbo" className="foco-acessivel h-9 w-full rounded-md border border-[#dfe5e4] bg-white px-3 text-[8px] text-[#424b4c] placeholder:text-[#a1a8a9]" />
            </label>
            <label>
              <span className="mb-1.5 block text-[7.5px] font-medium text-[#596364]">Executável Python</span>
              <input value={python} onChange={(evento) => setPython(evento.target.value)} className="foco-acessivel h-9 w-full rounded-md border border-[#dfe5e4] bg-white px-3 text-[8px] text-[#424b4c]" />
            </label>
            <Botao onClick={salvarCaminhos} disabled={!integracao}>Salvar</Botao>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {motor?.executando ? (
              <Botao onClick={() => void parar()} disabled={Boolean(operacao)}><Square className="size-3.5" /> Parar motor</Botao>
            ) : (
              <Botao variante="primario" onClick={() => void iniciar()} disabled={!desktop || !diretorio.trim() || Boolean(operacao)}><Play className="size-3.5" /> Iniciar motor</Botao>
            )}
            <Botao onClick={() => void testarApi()} disabled={!desktop || !integracao || Boolean(operacao)}><Terminal className="size-3.5" /> Testar API</Botao>
            <span className={`ml-auto inline-flex items-center gap-1.5 text-[7.5px] ${motor?.executando ? "text-[#26735f]" : "text-[#8b9495]"}`}>
              {motor?.executando ? <CheckCircle2 className="size-3.5" /> : <CircleAlert className="size-3.5" />}
              {motor?.executando ? `Executando${motor.pid ? ` · PID ${motor.pid}` : ""}` : "Processo não iniciado pelo MakeFlux"}
            </span>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <strong className="text-[9px] font-semibold text-[#303637]">Atualização segura do motor</strong>
              <p className="mt-1 text-[7.5px] leading-4 text-[#879091]">Bloqueia repositórios com alterações locais, usa fast-forward e cria uma branch de recuperação antes da atualização.</p>
            </div>
            <Botao onClick={() => void verificarRepositorio()} disabled={!desktop || !diretorio.trim() || Boolean(operacao)}><RefreshCw className={`size-3.5 ${operacao === "repositorio" ? "animate-spin" : ""}`} /> Verificar</Botao>
          </div>

          <div className="mt-3 rounded-md border border-[#e3e8e7] bg-[#fafbfb] p-3">
            {repositorio ? (
              <div className="space-y-1.5 text-[7.5px] text-[#687273]">
                <div className="flex justify-between gap-3"><span>Branch</span><strong className="text-[#41494a]">{repositorio.branch || "HEAD destacado"}</strong></div>
                <div className="flex justify-between gap-3"><span>Commit</span><strong className="font-mono text-[#41494a]">{repositorio.commitAtual.slice(0, 10)}</strong></div>
                <div className="flex justify-between gap-3"><span>Estado</span><strong className={repositorio.limpo ? "text-[#26735f]" : "text-[#9a6d2c]"}>{repositorio.limpo ? "Limpo" : "Alterações locais"}</strong></div>
                <div className="flex justify-between gap-3"><span>Atualizações</span><strong className="text-[#41494a]">{repositorio.commitsPendentes}</strong></div>
                <p className="border-t border-[#e4e8e7] pt-2 leading-4 text-[#848d8e]">{repositorio.mensagem}</p>
              </div>
            ) : (
              <p className="text-[7.5px] leading-4 text-[#8a9394]">Verifique o repositório para comparar o commit local com a branch remota e descobrir se existe rollback disponível.</p>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Botao variante="primario" onClick={() => void atualizar()} disabled={!repositorio?.atualizacaoDisponivel || !repositorio.limpo || Boolean(operacao)}>Atualizar com backup</Botao>
            <Botao onClick={() => void rollback()} disabled={!repositorio?.rollbackDisponivel || !repositorio.limpo || Boolean(operacao)}><RotateCcw className="size-3.5" /> Rollback</Botao>
          </div>
        </div>
      </div>

      {erro && <div className="flex items-start gap-2 border-t border-[#eadfca] bg-[#fffaf0] px-4 py-2.5 text-[7.5px] leading-4 text-[#876b37]"><CircleAlert className="mt-0.5 size-3.5 shrink-0" />{erro}</div>}
    </section>
  );
}

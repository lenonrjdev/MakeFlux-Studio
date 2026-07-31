"use client";

import { CheckCircle2, CircleAlert, RotateCcw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Botao } from "@/components/ui/botao";
import { useConfiguracoesLocais } from "@/hooks/use-configuracoes-locais";
import type { SecaoConfiguracoes } from "@/types/configuracoes";

import { CabecalhoConfiguracoes } from "./cabecalho-configuracoes";
import { NavegacaoConfiguracoes } from "./navegacao-configuracoes";
import { SecaoAparencia } from "./secao-aparencia";
import { SecaoArmazenamento } from "./secao-armazenamento";
import { SecaoAtualizacoes } from "./secao-atualizacoes";
import { SecaoBackup } from "./secao-backup";
import { SecaoDesempenho } from "./secao-desempenho";
import { SecaoPadroesCriacao } from "./secao-padroes-criacao";
import { SecaoPerfil } from "./secao-perfil";
import { SecaoSeguranca } from "./secao-seguranca";
import { SecaoWorkspace } from "./secao-workspace";

const secoesConfiguracoes: SecaoConfiguracoes[] = [
  "perfil",
  "workspace",
  "padroes",
  "desempenho",
  "armazenamento",
  "aparencia",
  "backup",
  "seguranca",
  "atualizacoes",
];

function normalizarSecaoConfiguracoes(valor: string | null): SecaoConfiguracoes {
  return secoesConfiguracoes.includes(valor as SecaoConfiguracoes) ? (valor as SecaoConfiguracoes) : "perfil";
}

export function CentralConfiguracoes() {
  const parametros = useSearchParams();
  const {
    workspace,
    carregado,
    usoArmazenamento,
    verificandoAtualizacoes,
    atualizar,
    restaurarSecao,
    restaurarTudo,
    baixarBackup,
    importarBackup,
    limparTemporarios,
    configurarPin,
    removerPin,
    bloquearAgora,
    verificarAtualizacoes,
  } = useConfiguracoesLocais();
  const [secao, setSecao] = useState<SecaoConfiguracoes>(() => normalizarSecaoConfiguracoes(parametros.get("secao")));
  const [notificacao, setNotificacao] = useState<{ mensagem: string; tipo: "sucesso" | "aviso" } | null>(null);
  const temporizadorNotificacao = useRef<number | null>(null);

  useEffect(() => () => {
    if (temporizadorNotificacao.current) window.clearTimeout(temporizadorNotificacao.current);
  }, []);

  function notificar(mensagem: string, tipo: "sucesso" | "aviso" = "sucesso") {
    if (temporizadorNotificacao.current) window.clearTimeout(temporizadorNotificacao.current);
    setNotificacao({ mensagem, tipo });
    temporizadorNotificacao.current = window.setTimeout(() => setNotificacao(null), 3600);
  }

  function restaurarAtual() {
    if (!window.confirm("Restaurar esta seção para os valores padrão?")) return;
    restaurarSecao(secao);
    notificar("Seção restaurada para os valores padrão.");
  }

  function restaurarConfiguracoes() {
    if (!window.confirm("Restaurar todas as configurações do MakeFlux Studio? Projetos e recursos não serão removidos.")) return;
    restaurarTudo();
    setSecao("perfil");
    notificar("Todas as configurações foram restauradas.");
  }

  if (!carregado) {
    return (
      <div className="min-h-[calc(100vh-62px)] bg-[#f7f8f9]">
        <div className="h-[132px] animate-pulse border-b border-[#e2e7e6] bg-white" />
        <div className="grid grid-cols-[230px_minmax(0,1fr)] gap-5 px-8 py-5">
          <div className="h-[610px] animate-pulse rounded-md border border-[#e2e7e6] bg-white" />
          <div className="h-[610px] animate-pulse rounded-md border border-[#e2e7e6] bg-white" />
        </div>
      </div>
    );
  }

  const conteudo = (() => {
    switch (secao) {
      case "perfil":
        return <SecaoPerfil perfil={workspace.perfil} aoAtualizar={(dados) => atualizar("perfil", dados)} aoNotificar={notificar} />;
      case "workspace":
        return <SecaoWorkspace workspace={workspace.workspace} aoAtualizar={(dados) => atualizar("workspace", dados)} />;
      case "padroes":
        return <SecaoPadroesCriacao padroes={workspace.padroes} aoAtualizar={(dados) => atualizar("padroes", dados)} />;
      case "desempenho":
        return <SecaoDesempenho desempenho={workspace.desempenho} aoAtualizar={(dados) => atualizar("desempenho", dados)} />;
      case "armazenamento":
        return <SecaoArmazenamento armazenamento={workspace.armazenamento} uso={usoArmazenamento} aoAtualizar={(dados) => atualizar("armazenamento", dados)} aoLimpar={limparTemporarios} aoNotificar={notificar} />;
      case "aparencia":
        return <SecaoAparencia aparencia={workspace.aparencia} aoAtualizar={(dados) => atualizar("aparencia", dados)} />;
      case "backup":
        return <SecaoBackup backup={workspace.backup} aoAtualizar={(dados) => atualizar("backup", dados)} aoBaixar={baixarBackup} aoImportar={importarBackup} aoNotificar={notificar} />;
      case "seguranca":
        return <SecaoSeguranca seguranca={workspace.seguranca} aoAtualizar={(dados) => atualizar("seguranca", dados)} aoConfigurarPin={configurarPin} aoRemoverPin={removerPin} aoBloquearAgora={bloquearAgora} aoNotificar={notificar} />;
      case "atualizacoes":
        return <SecaoAtualizacoes atualizacoes={workspace.atualizacoes} verificando={verificandoAtualizacoes} aoAtualizar={(dados) => atualizar("atualizacoes", dados)} aoVerificar={verificarAtualizacoes} aoNotificar={notificar} />;
    }
  })();

  return (
    <div className="min-h-[calc(100vh-62px)] bg-[#f7f8f9]">
      <CabecalhoConfiguracoes atualizadoEm={workspace.atualizadoEm} />
      <div className="grid grid-cols-[230px_minmax(0,1fr)] items-start gap-5 px-8 py-5">
        <NavegacaoConfiguracoes secao={secao} aoSelecionar={setSecao} aoRestaurarTudo={restaurarConfiguracoes} />
        <main className="min-w-0">
          <div className="mb-3 flex justify-end">
            <Botao variante="fantasma" className="h-8" onClick={restaurarAtual}>
              <RotateCcw className="size-3.5" /> Restaurar seção
            </Botao>
          </div>
          {conteudo}
        </main>
      </div>

      {notificacao && (
        <div role="status" className={`fixed bottom-6 right-6 z-[90] flex max-w-[420px] items-start gap-2.5 rounded-md border bg-white px-3.5 py-3 text-[9.5px] leading-4 shadow-[0_12px_35px_rgba(20,29,27,.13)] ${notificacao.tipo === "sucesso" ? "border-[#cee5df] text-[#286d5e]" : "border-[#eadfca] text-[#8d6b31]"}`}>
          {notificacao.tipo === "sucesso" ? <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" /> : <CircleAlert className="mt-0.5 size-3.5 shrink-0" />}
          {notificacao.mensagem}
        </div>
      )}
    </div>
  );
}

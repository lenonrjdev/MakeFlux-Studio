"use client";

import { CheckCircle2, CircleAlert } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { conteudoCriarVideo } from "@/content/criar-video";
import { configuracaoInicialVideo, etapasCriacaoVideo } from "@/data/criar-video";
import {
  criarProjetoLocal,
  criarVersaoProjetoLocal,
  obterProjetoLocal,
  salvarConfiguracaoProjetoLocal,
} from "@/lib/projetos-locais";
import { consumirTransferenciaBibliotecaParaEstudio } from "@/lib/biblioteca-local";
import { consumirTransferenciaLaboratorioParaEstudio } from "@/lib/laboratorio-ia-local";
import { consumirTransferenciaTemplateParaEstudio, criarTemplateLocal } from "@/lib/templates-locais";
import { criarTarefaProducaoLocal } from "@/lib/producao-local";
import type {
  AtualizarConfiguracaoVideo,
  ConfiguracaoCriacaoVideo,
  IdEtapaCriacao,
} from "@/types/criar-video";

import { CabecalhoProjetoVideo } from "./cabecalho-projeto-video";
import { NavegacaoEtapas } from "./navegacao-etapas";
import { ResumoProjetoVideo } from "./resumo-projeto-video";
import { RodapeEtapa } from "./rodape-etapa";
import { EtapaCenas } from "./etapas/etapa-cenas";
import { EtapaExportacao } from "./etapas/etapa-exportacao";
import { EtapaIdeia } from "./etapas/etapa-ideia";
import { EtapaLegendas } from "./etapas/etapa-legendas";
import { EtapaMusica } from "./etapas/etapa-musica";
import { EtapaNarracao } from "./etapas/etapa-narracao";
import { EtapaRoteiro } from "./etapas/etapa-roteiro";

type EstadoSalvamento = "carregando" | "salvando" | "salvo" | "erro";

function aplicarTransferenciaLaboratorio() {
  const transferencia = consumirTransferenciaLaboratorioParaEstudio();
  if (!transferencia) return { configuracao: configuracaoInicialVideo, etapa: "ideia" as IdEtapaCriacao };

  const configuracao: ConfiguracaoCriacaoVideo = {
    ...configuracaoInicialVideo,
    nomeProjeto: `Experimento · ${transferencia.tema.slice(0, 54)}`,
    tema: transferencia.tema,
    modeloIa: transferencia.modelo,
    promptRoteiro: transferencia.promptUsuario,
    systemPrompt: transferencia.promptSistema,
  };

  if (["roteiro", "gancho"].includes(transferencia.tipo)) {
    configuracao.roteiro = transferencia.conteudo;
    return { configuracao, etapa: "roteiro" as IdEtapaCriacao };
  }

  if (transferencia.tipo === "prompt-sistema") {
    configuracao.systemPrompt = transferencia.conteudo;
    return { configuracao, etapa: "roteiro" as IdEtapaCriacao };
  }

  if (transferencia.tipo === "termos-visuais") {
    const termos = transferencia.conteudo
      .split("\n")
      .map((linha) => linha.replace(/^\d+[.)]\s*/, "").trim())
      .filter((linha) => linha.length > 8 && !linha.toLowerCase().startsWith("tema de referência"))
      .slice(0, 8);
    configuracao.cenas = termos.map((termo, indice) => ({
      id: indice + 1,
      titulo: `Cena ${String(indice + 1).padStart(2, "0")}`,
      trecho: "Trecho a definir conforme o roteiro aprovado.",
      termo,
      duracao: 6,
      origem: "Laboratório de IA",
    }));
    return { configuracao, etapa: "cenas" as IdEtapaCriacao };
  }

  configuracao.roteiro = transferencia.conteudo;
  return { configuracao, etapa: "roteiro" as IdEtapaCriacao };
}

function aplicarTransferenciaBiblioteca() {
  const transferencia = consumirTransferenciaBibliotecaParaEstudio();
  if (!transferencia) return { configuracao: configuracaoInicialVideo, etapa: "ideia" as IdEtapaCriacao };

  const configuracao: ConfiguracaoCriacaoVideo = {
    ...configuracaoInicialVideo,
    nomeProjeto: `Biblioteca · ${transferencia.nome.slice(0, 48)}`,
    cenas: [...configuracaoInicialVideo.cenas],
  };

  if (["video", "imagem"].includes(transferencia.tipo)) {
    configuracao.fonteMateriais = "Biblioteca local";
    configuracao.cenas = [
      {
        id: Date.now(),
        titulo: transferencia.nome,
        trecho: transferencia.descricao || "Material selecionado na Biblioteca.",
        termo: transferencia.caminho,
        duracao: transferencia.tipo === "imagem" ? 5 : 8,
        origem: "Biblioteca local",
        arquivoLocal: transferencia.caminho,
      },
      ...configuracao.cenas,
    ];
    return { configuracao, etapa: "cenas" as IdEtapaCriacao };
  }

  if (transferencia.tipo === "musica") {
    configuracao.musicaAtiva = true;
    configuracao.musica = "biblioteca-local";
    configuracao.musicaLocal = { nome: transferencia.nome, caminho: transferencia.caminho };
    return { configuracao, etapa: "musica" as IdEtapaCriacao };
  }

  if (transferencia.tipo === "narracao") {
    configuracao.provedorVoz = "Áudio próprio";
    configuracao.narracaoLocal = { nome: transferencia.nome, caminho: transferencia.caminho };
    return { configuracao, etapa: "narracao" as IdEtapaCriacao };
  }

  if (transferencia.tipo === "legenda") {
    configuracao.legendasAtivas = true;
    configuracao.legendaLocal = { nome: transferencia.nome, caminho: transferencia.caminho };
    return { configuracao, etapa: "legendas" as IdEtapaCriacao };
  }

  if (transferencia.tipo === "prompt") {
    configuracao.promptRoteiro = transferencia.conteudo || transferencia.descricao;
    return { configuracao, etapa: "roteiro" as IdEtapaCriacao };
  }

  return { configuracao, etapa: "ideia" as IdEtapaCriacao };
}

function aplicarTransferenciaTemplate() {
  const transferencia = consumirTransferenciaTemplateParaEstudio();
  if (!transferencia) return { configuracao: configuracaoInicialVideo, etapa: "ideia" as IdEtapaCriacao };

  const configuracao: ConfiguracaoCriacaoVideo = {
    ...transferencia.configuracao,
    nomeProjeto: `${transferencia.nome} · novo projeto`,
    cenas: transferencia.configuracao.cenas.map((cena) => ({ ...cena })),
  };
  return { configuracao, etapa: "ideia" as IdEtapaCriacao };
}

export function EstudioCriacaoVideo() {
  const router = useRouter();
  const [etapaAtual, setEtapaAtual] = useState<IdEtapaCriacao>("ideia");
  const [configuracao, setConfiguracao] = useState<ConfiguracaoCriacaoVideo>(configuracaoInicialVideo);
  const [projetoId, setProjetoId] = useState<string | null>(null);
  const [estadoSalvamento, setEstadoSalvamento] = useState<EstadoSalvamento>("carregando");
  const [salvoEm, setSalvoEm] = useState<string>();
  const [prontoParaAutosave, setProntoParaAutosave] = useState(false);
  const [notificacao, setNotificacao] = useState<{ mensagem: string; tipo: "sucesso" | "aviso" } | null>(null);
  const temporizadorNotificacao = useRef<number | null>(null);
  const inicializado = useRef(false);

  useEffect(() => {
    if (inicializado.current) return;
    inicializado.current = true;

    const temporizadorInicializacao = window.setTimeout(() => {
      const idInformado = new URLSearchParams(window.location.search).get("projeto");
      const existente = idInformado ? obterProjetoLocal(idInformado) : null;

      if (existente) {
        setProjetoId(existente.id);
        setConfiguracao(existente.configuracao);
        setEtapaAtual(existente.etapaAtual);
      } else {
        const origem = new URLSearchParams(window.location.search).get("origem");
        const origemLaboratorio = origem === "laboratorio";
        const origemBiblioteca = origem === "biblioteca";
        const origemTemplate = origem === "template";
        const transferencia = origemLaboratorio
          ? aplicarTransferenciaLaboratorio()
          : origemBiblioteca
            ? aplicarTransferenciaBiblioteca()
            : origemTemplate
              ? aplicarTransferenciaTemplate()
              : { configuracao: configuracaoInicialVideo, etapa: "ideia" as IdEtapaCriacao };
        const criado = criarProjetoLocal(transferencia.configuracao);
        setProjetoId(criado.id);
        setConfiguracao(transferencia.configuracao);
        setEtapaAtual(transferencia.etapa);
        window.history.replaceState(null, "", `/criar-video?projeto=${encodeURIComponent(criado.id)}`);
      }

      setEstadoSalvamento("salvo");
      setSalvoEm(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
      setProntoParaAutosave(true);
    }, 0);

    return () => window.clearTimeout(temporizadorInicializacao);
  }, []);

  useEffect(() => {
    return () => {
      if (temporizadorNotificacao.current) window.clearTimeout(temporizadorNotificacao.current);
    };
  }, []);

  useEffect(() => {
    if (!prontoParaAutosave || !projetoId) return;

    const temporizadorEstado = window.setTimeout(() => setEstadoSalvamento("salvando"), 0);
    const temporizadorSalvamento = window.setTimeout(() => {
      try {
        salvarConfiguracaoProjetoLocal({ id: projetoId, configuracao, etapaAtual });
        setEstadoSalvamento("salvo");
        setSalvoEm(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
      } catch {
        setEstadoSalvamento("erro");
      }
    }, 850);

    return () => {
      window.clearTimeout(temporizadorEstado);
      window.clearTimeout(temporizadorSalvamento);
    };
  }, [configuracao, etapaAtual, projetoId, prontoParaAutosave]);

  const atualizar: AtualizarConfiguracaoVideo = useCallback((campo, valor) => {
    setConfiguracao((estado) => ({ ...estado, [campo]: valor }));
  }, []);

  const notificar = useCallback((mensagem: string, tipo: "sucesso" | "aviso" = "sucesso") => {
    if (temporizadorNotificacao.current) window.clearTimeout(temporizadorNotificacao.current);
    setNotificacao({ mensagem, tipo });
    temporizadorNotificacao.current = window.setTimeout(() => setNotificacao(null), 3600);
  }, []);

  const indiceAtual = useMemo(
    () => etapasCriacaoVideo.findIndex((etapa) => etapa.id === etapaAtual),
    [etapaAtual],
  );
  const etapa = etapasCriacaoVideo[indiceAtual];
  const conteudoEtapa = conteudoCriarVideo.etapas[etapaAtual];

  function salvarVersao() {
    if (!projetoId) return;
    try {
      salvarConfiguracaoProjetoLocal({
        id: projetoId,
        configuracao,
        etapaAtual,
        registrarAutosave: false,
      });
      const projetoAtual = obterProjetoLocal(projetoId);
      const numero = (projetoAtual?.versoes[0]?.numero ?? 0) + 1;
      criarVersaoProjetoLocal(projetoId, `Versão ${numero}`);
      setEstadoSalvamento("salvo");
      setSalvoEm(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
      notificar(`Versão ${numero} salva no histórico do projeto.`);
    } catch {
      setEstadoSalvamento("erro");
      notificar("Não foi possível salvar esta versão.", "aviso");
    }
  }

  function salvarComoTemplate() {
    const template = criarTemplateLocal({
      nome: configuracao.nomeProjeto || "Template sem título",
      descricao: configuracao.tema || "Template criado a partir do estúdio de criação.",
      categoria: "personalizado",
      tags: [configuracao.plataforma, configuracao.formato, configuracao.objetivo],
      configuracao,
      projetoOrigemId: projetoId ?? undefined,
    });
    notificar(`Template “${template.nome}” salvo e disponível no módulo Templates.`);
  }

  function irParaAnterior() {
    const anterior = etapasCriacaoVideo[indiceAtual - 1];
    if (anterior) setEtapaAtual(anterior.id);
  }

  function irParaProximo() {
    if (etapaAtual === "ideia" && !configuracao.tema.trim()) {
      notificar("Descreva a ideia do vídeo para continuar pelo fluxo guiado.", "aviso");
      return;
    }

    const proxima = etapasCriacaoVideo[indiceAtual + 1];
    if (proxima) {
      setEtapaAtual(proxima.id);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (projetoId) {
      salvarConfiguracaoProjetoLocal({
        id: projetoId,
        configuracao,
        etapaAtual,
        status: "pronto",
        registrarAutosave: false,
      });
      criarVersaoProjetoLocal(projetoId, "Enviado para produção");
      const projetoAtualizado = obterProjetoLocal(projetoId);
      if (projetoAtualizado) {
        const tarefa = criarTarefaProducaoLocal(projetoAtualizado);
        router.push(`/producao?tarefa=${encodeURIComponent(tarefa.id)}`);
        return;
      }
    }
    notificar("Não foi possível enviar este projeto para a fila de produção.", "aviso");
  }

  function renderizarEtapa() {
    const propriedades = { configuracao, atualizar };

    switch (etapaAtual) {
      case "ideia":
        return <EtapaIdeia {...propriedades} />;
      case "roteiro":
        return <EtapaRoteiro {...propriedades} notificar={notificar} />;
      case "cenas":
        return <EtapaCenas {...propriedades} notificar={notificar} />;
      case "narracao":
        return <EtapaNarracao {...propriedades} notificar={notificar} />;
      case "legendas":
        return <EtapaLegendas {...propriedades} />;
      case "musica":
        return <EtapaMusica {...propriedades} notificar={notificar} />;
      case "exportacao":
        return <EtapaExportacao {...propriedades} />;
    }
  }

  return (
    <div className="min-h-screen pb-[82px]">
      <CabecalhoProjetoVideo
        nomeProjeto={configuracao.nomeProjeto}
        modo={configuracao.modo}
        estadoSalvamento={estadoSalvamento}
        salvoEm={salvoEm}
        aoSalvar={salvarVersao}
        aoSalvarComoTemplate={salvarComoTemplate}
      />
      <div className="border-b border-[#e4e8e8] bg-[#f7f8f9] px-8">
        <NavegacaoEtapas etapaAtual={etapaAtual} aoSelecionar={setEtapaAtual} />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-5 px-8 py-5">
        <section className="painel-superficie min-w-0 overflow-hidden rounded-md">
          <header className="flex items-start justify-between gap-6 border-b border-[#e7ebeb] bg-[#fafbfb] px-5 py-4">
            <div className="flex items-start gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-md border border-[#cce3dd] bg-white text-[10px] font-semibold text-[#238872] shadow-sm">
                {String(indiceAtual + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="text-[12px] font-semibold tracking-[-0.015em] text-[#252a2b]">{conteudoEtapa.titulo}</h2>
                <p className="mt-1 max-w-[720px] text-[9px] leading-4 text-[#858d8e]">{conteudoEtapa.descricao}</p>
              </div>
            </div>
            <span className="rounded-md border border-[#e0e5e5] bg-white px-2 py-1 text-[8px] font-medium text-[#747c7d]">
              Etapa {indiceAtual + 1} de {etapasCriacaoVideo.length} · {etapa.titulo}
            </span>
          </header>

          <div className="p-5">{renderizarEtapa()}</div>
        </section>

        <ResumoProjetoVideo configuracao={configuracao} />
      </div>

      <RodapeEtapa
        primeiraEtapa={indiceAtual === 0}
        ultimaEtapa={indiceAtual === etapasCriacaoVideo.length - 1}
        aoAnterior={irParaAnterior}
        aoProximo={irParaProximo}
        aoSalvar={salvarVersao}
      />

      {notificacao && (
        <div
          role="status"
          className={`fixed bottom-[78px] right-6 z-50 flex max-w-[390px] items-start gap-2.5 rounded-md border bg-white px-3.5 py-3 text-[9.5px] leading-4 shadow-[0_12px_35px_rgba(20,29,27,.13)] ${
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

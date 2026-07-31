"use client";

import { CheckCircle2, CircleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useProjetosLocais } from "@/hooks/use-projetos-locais";
import { useTemplatesLocais } from "@/hooks/use-templates-locais";
import type {
  FiltroTemplates,
  OrdenacaoTemplates,
  VisualizacaoTemplates,
} from "@/types/templates";

import { BarraFiltrosTemplates } from "./barra-filtros-templates";
import { CabecalhoTemplates } from "./cabecalho-templates";
import { EstadoVazioTemplates } from "./estado-vazio-templates";
import { GradeTemplates } from "./grade-templates";
import { ModalCriarTemplate, type DadosNovoTemplate } from "./modal-criar-template";
import { PainelCategoriasTemplates } from "./painel-categorias-templates";
import { PainelDetalhesTemplate } from "./painel-detalhes-template";
import { ResumoTemplates } from "./resumo-templates";

export function CentralTemplates() {
  const router = useRouter();
  const { projetos } = useProjetosLocais();
  const {
    templates,
    carregado,
    criarTemplate,
    criarDeProjeto,
    atualizarTemplate,
    alternarFavorito,
    duplicarTemplate,
    alterarStatus,
    excluirTemplate,
    prepararParaEstudio,
    exportarTemplate,
    importarTemplate,
  } = useTemplatesLocais();

  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<FiltroTemplates>("todos");
  const [ordenacao, setOrdenacao] = useState<OrdenacaoTemplates>("recentes");
  const [visualizacao, setVisualizacao] = useState<VisualizacaoTemplates>("grade");
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const [criando, setCriando] = useState(false);
  const [notificacao, setNotificacao] = useState<{ mensagem: string; tipo: "sucesso" | "aviso" } | null>(null);
  const temporizadorNotificacao = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (temporizadorNotificacao.current) window.clearTimeout(temporizadorNotificacao.current);
    };
  }, []);

  const selecionado = templates.find((template) => template.id === selecionadoId) ?? null;

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return [...templates]
      .filter((template) => {
        if (filtro === "favoritos" && !template.favorito) return false;
        if (filtro === "sistema" && !template.sistema) return false;
        if (filtro === "meus" && (template.sistema || template.status === "arquivado")) return false;
        if (filtro === "arquivados" && template.status !== "arquivado") return false;
        if (!["todos", "favoritos", "sistema", "meus", "arquivados"].includes(filtro) && template.categoria !== filtro) return false;
        if (filtro !== "arquivados" && template.status === "arquivado") return false;
        if (!termo) return true;
        return [template.nome, template.descricao, template.categoria, template.tags.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(termo);
      })
      .sort((a, b) => {
        if (ordenacao === "nome-az") return a.nome.localeCompare(b.nome, "pt-BR");
        if (ordenacao === "mais-usados") return b.usos - a.usos;
        if (ordenacao === "favoritos") return Number(b.favorito) - Number(a.favorito) || b.usos - a.usos;
        return new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime();
      });
  }, [busca, filtro, ordenacao, templates]);

  function notificar(mensagem: string, tipo: "sucesso" | "aviso" = "sucesso") {
    if (temporizadorNotificacao.current) window.clearTimeout(temporizadorNotificacao.current);
    setNotificacao({ mensagem, tipo });
    temporizadorNotificacao.current = window.setTimeout(() => setNotificacao(null), 3600);
  }

  function criar(dados: DadosNovoTemplate) {
    let template = null;
    if (dados.projetoId) {
      template = criarDeProjeto(dados.projetoId, dados.nome);
      if (template) {
        template = atualizarTemplate(template.id, {
          descricao: dados.descricao,
          categoria: dados.categoria,
          tags: dados.tags,
          corDestaque: dados.corDestaque,
        });
      }
    } else {
      template = criarTemplate(dados);
    }
    if (!template) {
      notificar("Não foi possível criar o template a partir do projeto selecionado.", "aviso");
      return;
    }
    setCriando(false);
    setSelecionadoId(template.id);
    setFiltro("meus");
    notificar(`Template “${template.nome}” criado.`);
  }

  function usar(id: string) {
    const transferencia = prepararParaEstudio(id);
    if (!transferencia) {
      notificar("Este template não está disponível para novos projetos.", "aviso");
      return;
    }
    router.push("/criar-video?origem=template");
  }

  function duplicar(id: string) {
    const duplicado = duplicarTemplate(id);
    if (!duplicado) return;
    setFiltro("meus");
    setSelecionadoId(duplicado.id);
    notificar("Template duplicado. A nova versão já pode ser editada.");
  }

  function arquivar(id: string) {
    const template = templates.find((item) => item.id === id);
    if (!template || template.sistema) return;
    const proximoStatus = template.status === "arquivado" ? "ativo" : "arquivado";
    alterarStatus(id, proximoStatus);
    if (proximoStatus === "arquivado") setSelecionadoId(null);
    notificar(proximoStatus === "arquivado" ? "Template arquivado." : "Template restaurado.");
  }

  function excluir(id: string) {
    const template = templates.find((item) => item.id === id);
    if (!template || template.sistema) return;
    if (!window.confirm(`Excluir definitivamente o template “${template.nome}”?`)) return;
    excluirTemplate(id);
    setSelecionadoId(null);
    notificar("Template personalizado excluído.");
  }

  function exportar(id: string) {
    const template = templates.find((item) => item.id === id);
    if (!template) return;
    const conteudo = exportarTemplate(template);
    const url = URL.createObjectURL(new Blob([conteudo], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${template.nome.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "template"}.makeflux.json`;
    link.click();
    URL.revokeObjectURL(url);
    notificar("Template exportado em JSON.");
  }

  function importar(conteudo: string) {
    const template = importarTemplate(conteudo);
    if (!template) {
      notificar("O arquivo não contém um template compatível com o MakeFlux Studio.", "aviso");
      return;
    }
    setFiltro("meus");
    setSelecionadoId(template.id);
    notificar(`Template “${template.nome}” importado.`);
  }

  function limparFiltros() {
    setBusca("");
    setFiltro("todos");
  }

  if (!carregado) {
    return (
      <div className="min-h-[calc(100vh-62px)] bg-[#f7f8f9]">
        <div className="h-[150px] animate-pulse border-b border-[#e2e7e6] bg-white" />
        <div className="space-y-4 px-8 py-5">
          <div className="h-[92px] animate-pulse rounded-md border border-[#e2e7e6] bg-white" />
          <div className="grid grid-cols-[220px_minmax(0,1fr)] gap-5">
            <div className="h-[560px] animate-pulse rounded-md border border-[#e2e7e6] bg-white" />
            <div className="h-[560px] animate-pulse rounded-md border border-[#e2e7e6] bg-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-62px)] bg-[#f7f8f9]">
      <CabecalhoTemplates
        total={templates.length}
        personalizados={templates.filter((template) => !template.sistema).length}
        aoCriar={() => setCriando(true)}
        aoImportar={importar}
      />

      <div className="space-y-4 px-8 py-5">
        <ResumoTemplates templates={templates} />
        <div className="grid grid-cols-[220px_minmax(0,1fr)] items-start gap-5">
          <PainelCategoriasTemplates templates={templates} selecionado={filtro} aoSelecionar={setFiltro} />
          <main className="min-w-0 space-y-3">
            <BarraFiltrosTemplates
              busca={busca}
              ordenacao={ordenacao}
              visualizacao={visualizacao}
              total={filtrados.length}
              aoBuscar={setBusca}
              aoOrdenar={setOrdenacao}
              aoMudarVisualizacao={setVisualizacao}
            />
            {filtrados.length > 0 ? (
              <GradeTemplates
                templates={filtrados}
                visualizacao={visualizacao}
                aoSelecionar={setSelecionadoId}
                aoFavoritar={alternarFavorito}
                aoDuplicar={duplicar}
                aoArquivar={arquivar}
                aoExcluir={excluir}
                aoUsar={usar}
              />
            ) : (
              <EstadoVazioTemplates aoLimpar={limparFiltros} aoCriar={() => setCriando(true)} />
            )}
          </main>
        </div>
      </div>

      {criando && <ModalCriarTemplate projetos={projetos} aoFechar={() => setCriando(false)} aoCriar={criar} />}

      {selecionado && (
        <PainelDetalhesTemplate
          key={selecionado.id}
          template={selecionado}
          aoFechar={() => setSelecionadoId(null)}
          aoAtualizar={(alteracoes) => {
            atualizarTemplate(selecionado.id, alteracoes);
            notificar("Template atualizado.");
          }}
          aoFavoritar={() => alternarFavorito(selecionado.id)}
          aoDuplicar={() => duplicar(selecionado.id)}
          aoArquivar={() => arquivar(selecionado.id)}
          aoExcluir={() => excluir(selecionado.id)}
          aoExportar={() => exportar(selecionado.id)}
          aoUsar={() => usar(selecionado.id)}
        />
      )}

      {notificacao && (
        <div role="status" className={`fixed bottom-6 right-6 z-[90] flex max-w-[390px] items-start gap-2.5 rounded-md border bg-white px-3.5 py-3 text-[9.5px] leading-4 shadow-[0_12px_35px_rgba(20,29,27,.13)] ${notificacao.tipo === "aviso" ? "border-[#ead9cb] text-[#8b5e3b]" : "border-[#cce4de] text-[#276f60]"}`}>
          {notificacao.tipo === "aviso" ? <CircleAlert className="mt-0.5 size-3.5 shrink-0" /> : <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" />}
          {notificacao.mensagem}
        </div>
      )}
    </div>
  );
}

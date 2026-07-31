"use client";

import { Folder, Info } from "lucide-react";

import { CartaoConfiguracao } from "@/components/configuracoes/cartao-configuracao";
import { BotaoSelecionarPasta } from "@/components/ui/botao-selecionar-pasta";
import { CampoFormulario, classesCampo } from "@/components/ui/campo-formulario";
import { Interruptor } from "@/components/ui/interruptor";
import type { ConfiguracaoWorkspace } from "@/types/configuracoes";

export function SecaoWorkspace({ workspace, aoAtualizar }: { workspace: ConfiguracaoWorkspace; aoAtualizar: (dados: Partial<ConfiguracaoWorkspace>) => void }) {
  const pastas = [
    { campo: "pastaPrincipal", titulo: "Pasta principal", descricao: "Projetos e dados do workspace", chave: "makeflux:pasta-workspace" },
    { campo: "pastaExportacoes", titulo: "Exportações", descricao: "Vídeos e arquivos finalizados", chave: "makeflux:pasta-exportacoes" },
    { campo: "pastaCache", titulo: "Cache", descricao: "Materiais e arquivos temporários", chave: "makeflux:pasta-cache" },
    { campo: "pastaModelos", titulo: "Modelos locais", descricao: "Whisper, TTS e modelos offline", chave: "makeflux:pasta-modelos" },
  ] as const;

  return (
    <div className="space-y-4">
      <CartaoConfiguracao titulo="Workspace" descricao="Defina onde o MakeFlux Studio organiza seus dados locais.">
        <div className="grid grid-cols-2 gap-4">
          <CampoFormulario rotulo="Nome do workspace"><input value={workspace.nome} onChange={(e) => aoAtualizar({ nome: e.target.value })} className={`${classesCampo} h-10`} /></CampoFormulario>
          <CampoFormulario rotulo="Padrão do nome de arquivo" descricao="Variáveis: {projeto}, {data} e {versao}."><input value={workspace.padraoNomeArquivo} onChange={(e) => aoAtualizar({ padraoNomeArquivo: e.target.value })} className={`${classesCampo} h-10 font-mono`} /></CampoFormulario>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {pastas.map((pasta) => (
            <div key={pasta.campo} className="flex items-center justify-between gap-3 rounded-md border border-[#e3e7e7] bg-[#fafbfb] p-3.5">
              <div className="min-w-0">
                <div className="flex items-center gap-2"><Folder className="size-3.5 text-[#218b75]" /><strong className="text-[10px] font-medium text-[#303637]">{pasta.titulo}</strong></div>
                <p className="mt-1 text-[8.5px] text-[#92999a]">{workspace[pasta.campo] || pasta.descricao}</p>
              </div>
              <BotaoSelecionarPasta rotulo="Escolher" tituloDialogo={`Escolha: ${pasta.titulo}`} chaveArmazenamento={pasta.chave} className="h-8 px-2.5" aoSelecionar={(valor) => aoAtualizar({ [pasta.campo]: valor })} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Interruptor ativo={workspace.organizarPorProjeto} aoAlterar={(valor) => aoAtualizar({ organizarPorProjeto: valor })} rotulo="Organizar exportações por projeto" descricao="Cria uma pasta para cada projeto." />
          <Interruptor ativo={workspace.abrirUltimoProjeto} aoAlterar={(valor) => aoAtualizar({ abrirUltimoProjeto: valor })} rotulo="Abrir último projeto" descricao="Retoma automaticamente o trabalho recente." />
        </div>
      </CartaoConfiguracao>
      <div className="rounded-md border border-[#e6e2d7] bg-[#fbf8f1] p-4 text-[9.5px] leading-5 text-[#7f6c45]"><Info className="mr-2 inline size-3.5" /> No navegador, o seletor guarda somente o nome da pasta. No aplicativo Tauri, o caminho completo é preservado.</div>
    </div>
  );
}

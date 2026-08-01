import { invoke } from "@tauri-apps/api/core";

import { emAmbienteTauri } from "@/lib/runtime-nativo";
import type { ArquivoTarefaProducao, TarefaProducao } from "@/types/producao";
import type { ProjetoStudio } from "@/types/projeto";

export type PastaExportacaoPreparada = {
  caminho: string;
  pastaPadrao: boolean;
};

export type ArquivoOrigemExportacao = {
  nome: string;
  tipo: ArquivoTarefaProducao["tipo"];
  caminho: string;
};

export type ArquivoExportadoNativo = {
  nome: string;
  tipo: ArquivoTarefaProducao["tipo"];
  caminho: string;
  tamanhoBytes: number;
};

export type ResultadoConsolidacaoExportacao = {
  pastaSaida: string;
  arquivos: ArquivoExportadoNativo[];
  avisos: string[];
};

function exigirDesktop() {
  if (!emAmbienteTauri()) {
    throw new Error("A criação e abertura de arquivos exige o aplicativo desktop do MakeFlux Studio.");
  }
}

export function prepararPastaExportacao({
  projeto,
  tarefa,
  pastaPreferida,
  organizarPorProjeto,
}: {
  projeto: ProjetoStudio;
  tarefa: TarefaProducao;
  pastaPreferida: string;
  organizarPorProjeto: boolean;
}) {
  exigirDesktop();
  return invoke<PastaExportacaoPreparada>("preparar_pasta_exportacao", {
    solicitacao: {
      nomeProjeto: projeto.nome,
      tarefaId: tarefa.id,
      pastaPreferida: pastaPreferida || null,
      organizarPorProjeto,
    },
  });
}

export function consolidarArquivosExportacao({
  pastaSaida,
  diretorioMotor,
  arquivos,
}: {
  pastaSaida: string;
  diretorioMotor: string;
  arquivos: ArquivoOrigemExportacao[];
}) {
  exigirDesktop();
  return invoke<ResultadoConsolidacaoExportacao>("consolidar_arquivos_exportacao", {
    solicitacao: {
      pastaSaida,
      diretorioMotor: diretorioMotor || null,
      arquivos: arquivos.map(({ caminho, tipo }) => ({ caminho, tipo })),
    },
  });
}

export function abrirArquivoExportado(caminho: string) {
  exigirDesktop();
  return invoke<void>("abrir_arquivo_exportado", { caminho });
}

export function revelarArquivoExportado(caminho: string) {
  exigirDesktop();
  return invoke<void>("revelar_arquivo_exportado", { caminho });
}

export function abrirPastaExportacao(caminho: string) {
  exigirDesktop();
  return invoke<void>("abrir_pasta_exportacao", { caminho });
}

export function formatarTamanhoArquivo(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "Arquivo gerado";
  const unidades = ["B", "KB", "MB", "GB"];
  const indice = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), unidades.length - 1);
  const valor = bytes / 1024 ** indice;
  return `${valor >= 10 || indice === 0 ? valor.toFixed(0) : valor.toFixed(1)} ${unidades[indice]}`;
}

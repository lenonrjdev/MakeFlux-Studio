
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { atualizarSecaoConfiguracoesLocal } from "@/lib/configuracoes-locais";
import { configurarMoneyPrinterInstaladoLocal } from "@/lib/integracoes-local";
import {
  abrirPastaInstalacaoAssistida,
  diagnosticarInstalacaoAssistida,
  instalarDependenciaAssistida,
  instalarMoneyPrinterAssistido,
  prepararWorkspaceAssistido,
  validarMoneyPrinterAssistido,
} from "@/lib/instalacao-nativa";
import { emAmbienteTauri, iniciarMotorMoneyPrinter, verificarMoneyPrinter } from "@/lib/runtime-nativo";
import type {
  DiagnosticoInstalacaoAssistida,
  EtapaInstalacao,
  IdDependenciaInstalacao,
  RegistroInstalacao,
  ResultadoInstalacaoMoneyPrinter,
  ValidacaoMoneyPrinterAssistida,
} from "@/types/instalacao";

const CHAVE_INSTALACAO = "makeflux:instalacao-assistida:v1";

function novoRegistro(tipo: RegistroInstalacao["tipo"], mensagem: string): RegistroInstalacao {
  return { id: crypto.randomUUID(), tipo, mensagem, criadoEm: Date.now() };
}

function raizSalva() {
  if (typeof window === "undefined") return "";
  try {
    const valor = JSON.parse(window.localStorage.getItem(CHAVE_INSTALACAO) ?? "{}") as { raizWorkspace?: string };
    return valor.raizWorkspace ?? "";
  } catch {
    return "";
  }
}

export function useInstalacaoAssistida() {
  const desktop = emAmbienteTauri();
  const [etapa, setEtapa] = useState<EtapaInstalacao>("diagnostico");
  const [raizWorkspace, setRaizWorkspace] = useState(raizSalva);
  const [diagnostico, setDiagnostico] = useState<DiagnosticoInstalacaoAssistida | null>(null);
  const [instalacaoMotor, setInstalacaoMotor] = useState<ResultadoInstalacaoMoneyPrinter | null>(null);
  const [validacao, setValidacao] = useState<ValidacaoMoneyPrinterAssistida | null>(null);
  const [registros, setRegistros] = useState<RegistroInstalacao[]>([]);
  const [operacao, setOperacao] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const registrar = useCallback((tipo: RegistroInstalacao["tipo"], mensagem: string) => {
    setRegistros((atuais) => [novoRegistro(tipo, mensagem), ...atuais].slice(0, 80));
  }, []);

  const executar = useCallback(async <T,>(nome: string, tarefa: () => Promise<T>) => {
    setOperacao(nome);
    setErro(null);
    try {
      return await tarefa();
    } catch (falha) {
      const mensagem = falha instanceof Error ? falha.message : String(falha);
      setErro(mensagem);
      registrar("erro", mensagem);
      return null;
    } finally {
      setOperacao(null);
    }
  }, [registrar]);

  const diagnosticar = useCallback(async () => executar("diagnostico", async () => {
    const resultado = await diagnosticarInstalacaoAssistida(raizWorkspace);
    setDiagnostico(resultado);
    registrar(resultado.prontoParaProducao ? "sucesso" : "info", resultado.mensagem);
    return resultado;
  }), [executar, raizWorkspace, registrar]);

  useEffect(() => {
    if (!desktop) return;
    const temporizador = window.setTimeout(() => void diagnosticar(), 0);
    return () => window.clearTimeout(temporizador);
  }, [desktop, diagnosticar]);

  const prepararWorkspace = useCallback(async () => executar("workspace", async () => {
    const workspace = await prepararWorkspaceAssistido(raizWorkspace);
    setRaizWorkspace(workspace.raiz);
    window.localStorage.setItem(CHAVE_INSTALACAO, JSON.stringify({ raizWorkspace: workspace.raiz, concluidaEm: null }));
    atualizarSecaoConfiguracoesLocal("workspace", {
      pastaPrincipal: workspace.raiz,
      pastaExportacoes: workspace.exportacoes,
      pastaCache: workspace.cache,
      pastaModelos: workspace.modelos,
    });
    registrar("sucesso", `Workspace preparado em ${workspace.raiz}.`);
    setEtapa("dependencias");
    await diagnosticar();
    return workspace;
  }), [diagnosticar, executar, raizWorkspace, registrar]);

  const instalarDependencia = useCallback(async (dependencia: IdDependenciaInstalacao) => executar(`dependencia:${dependencia}`, async () => {
    const resultado = await instalarDependenciaAssistida(dependencia);
    registrar(resultado.sucesso ? "sucesso" : "aviso", resultado.mensagem);
    await diagnosticar();
    return resultado;
  }), [diagnosticar, executar, registrar]);

  const instalarMotor = useCallback(async () => executar("motor", async () => {
    if (!raizWorkspace.trim()) throw new Error("Prepare o workspace antes de instalar o motor.");
    const resultado = await instalarMoneyPrinterAssistido(raizWorkspace);
    setInstalacaoMotor(resultado);
    configurarMoneyPrinterInstaladoLocal({
      diretorio: resultado.diretorio,
      pythonExecutavel: resultado.pythonExecutavel,
    });
    registrar("sucesso", resultado.mensagem);
    setEtapa("homologacao");
    await diagnosticar();
    return resultado;
  }), [diagnosticar, executar, raizWorkspace, registrar]);

  const validarMotor = useCallback(async () => executar("validar-motor", async () => {
    const diretorio = instalacaoMotor?.diretorio ?? diagnostico?.diretorioMoneyPrinter;
    if (!diretorio) throw new Error("O diretório do MoneyPrinterTurbo ainda não foi definido.");
    const resultado = await validarMoneyPrinterAssistido(diretorio);
    setValidacao(resultado);
    registrar(resultado.valido ? "sucesso" : "aviso", resultado.mensagem);
    return resultado;
  }), [diagnostico?.diretorioMoneyPrinter, executar, instalacaoMotor?.diretorio, registrar]);

  const testarApi = useCallback(async () => executar("api", async () => {
    const diretorio = instalacaoMotor?.diretorio ?? diagnostico?.diretorioMoneyPrinter;
    const pythonExecutavel = instalacaoMotor?.pythonExecutavel ?? validacao?.pythonExecutavel;
    if (!diretorio || !pythonExecutavel) throw new Error("Valide a instalação do motor antes de iniciar a API.");
    await iniciarMotorMoneyPrinter({ diretorio, python: pythonExecutavel });
    let ultimaFalha = "A API ainda não respondeu.";
    for (let tentativa = 1; tentativa <= 12; tentativa += 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 1_500));
      try {
        const resultado = await verificarMoneyPrinter("http://127.0.0.1:8080");
        if (resultado.disponivel) {
          registrar("sucesso", "API do MoneyPrinterTurbo iniciada e validada em http://127.0.0.1:8080.");
          window.localStorage.setItem(CHAVE_INSTALACAO, JSON.stringify({ raizWorkspace, concluidaEm: new Date().toISOString() }));
          await diagnosticar();
          return resultado;
        }
        ultimaFalha = resultado.mensagem;
      } catch (falha) {
        ultimaFalha = falha instanceof Error ? falha.message : String(falha);
      }
    }
    throw new Error(`O motor foi iniciado, mas a API não respondeu no tempo esperado. ${ultimaFalha}`);
  }), [diagnosticar, diagnostico?.diretorioMoneyPrinter, executar, instalacaoMotor, raizWorkspace, registrar, validacao?.pythonExecutavel]);

  const abrirPasta = useCallback(async (caminho: string) => executar("abrir-pasta", () => abrirPastaInstalacaoAssistida(caminho)), [executar]);

  const progresso = useMemo(() => {
    const itens = [
      Boolean(diagnostico),
      Boolean(diagnostico?.workspace),
      Boolean(diagnostico?.dependencias.filter((item) => item.obrigatoria).every((item) => item.disponivel)),
      Boolean(diagnostico?.moneyPrinterDetectado),
      Boolean(diagnostico?.prontoParaProducao),
    ];
    return Math.round((itens.filter(Boolean).length / itens.length) * 100);
  }, [diagnostico]);

  return {
    desktop,
    etapa,
    definirEtapa: setEtapa,
    raizWorkspace,
    definirRaizWorkspace: setRaizWorkspace,
    diagnostico,
    instalacaoMotor,
    validacao,
    registros,
    operacao,
    erro,
    progresso,
    diagnosticar,
    prepararWorkspace,
    instalarDependencia,
    instalarMotor,
    validarMotor,
    testarApi,
    abrirPasta,
  };
}

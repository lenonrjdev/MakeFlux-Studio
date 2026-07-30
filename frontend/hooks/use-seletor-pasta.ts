"use client";

import { useCallback, useEffect, useState } from "react";

export function useSeletorPasta({
  chaveArmazenamento = "makeflux:pasta-estudio",
  tituloDialogo = "Escolha uma pasta",
}: {
  chaveArmazenamento?: string;
  tituloDialogo?: string;
} = {}) {
  const [pasta, setPasta] = useState<string>("");
  const [selecionando, setSelecionando] = useState(false);
  const [erro, setErro] = useState<string>("");

  useEffect(() => {
    const pastaSalva = window.localStorage.getItem(chaveArmazenamento);
    if (pastaSalva) setPasta(pastaSalva);
  }, [chaveArmazenamento]);

  const selecionarPasta = useCallback(async () => {
    setSelecionando(true);
    setErro("");

    try {
      let pastaSelecionada: string | null = null;

      if (window.__TAURI_INTERNALS__) {
        const { open } = await import("@tauri-apps/plugin-dialog");
        const resultado = await open({
          directory: true,
          multiple: false,
          title: tituloDialogo,
        });

        pastaSelecionada = typeof resultado === "string" ? resultado : null;
      } else if (window.showDirectoryPicker) {
        const diretorio = await window.showDirectoryPicker();
        pastaSelecionada = diretorio.name;
      } else {
        setErro("A seleção nativa de pasta estará disponível no aplicativo desktop.");
      }

      if (pastaSelecionada) {
        setPasta(pastaSelecionada);
        window.localStorage.setItem(chaveArmazenamento, pastaSelecionada);
      }
    } catch (causa) {
      const cancelado = causa instanceof Error && causa.name === "AbortError";
      if (!cancelado) setErro("Não foi possível abrir o seletor de pasta.");
    } finally {
      setSelecionando(false);
    }
  }, [chaveArmazenamento, tituloDialogo]);

  return { pasta, selecionando, erro, selecionarPasta };
}

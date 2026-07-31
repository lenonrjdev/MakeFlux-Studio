import { invoke } from "@tauri-apps/api/core";

import { emAmbienteTauri } from "@/lib/runtime-nativo";
import type {
  RegistroPersistenciaLocal,
  ResultadoMigracaoSqlite,
  StatusBancoLocal,
} from "@/types/qualidade";

export const CHAVE_MIGRACAO_SQLITE = "makeflux:migracao-sqlite:v1";
const PREFIXO_MAKEFLUX = "makeflux:";

function invocarPersistencia<T>(comando: string, argumentos?: Record<string, unknown>) {
  if (!emAmbienteTauri()) {
    throw new Error("A persistência SQLite exige o aplicativo desktop.");
  }
  return invoke<T>(comando, argumentos);
}

export function coletarRegistrosMakeFlux(): RegistroPersistenciaLocal[] {
  if (typeof window === "undefined") return [];
  const agora = Date.now();
  const registros: RegistroPersistenciaLocal[] = [];

  for (let indice = 0; indice < window.localStorage.length; indice += 1) {
    const chave = window.localStorage.key(indice);
    if (!chave?.startsWith(PREFIXO_MAKEFLUX)) continue;
    const valor = window.localStorage.getItem(chave);
    if (valor === null) continue;
    registros.push({ chave, valor, atualizadoEm: agora, origem: "localStorage" });
  }

  return registros;
}

export function consultarStatusBancoLocal() {
  return invocarPersistencia<StatusBancoLocal>("status_banco_local");
}

export function migrarWorkspaceParaSqlite(registros = coletarRegistrosMakeFlux()) {
  return invocarPersistencia<ResultadoMigracaoSqlite>("migrar_workspace_sqlite", { registros });
}

export function listarRegistrosSqlite() {
  return invocarPersistencia<RegistroPersistenciaLocal[]>("listar_registros_sqlite");
}

export async function hidratarLocalStorageDoSqlite() {
  const registros = await listarRegistrosSqlite();
  let restaurados = 0;

  for (const registro of registros) {
    if (!registro.chave.startsWith(PREFIXO_MAKEFLUX)) continue;
    if (window.localStorage.getItem(registro.chave) !== null) continue;
    window.localStorage.setItem(registro.chave, registro.valor);
    restaurados += 1;
  }

  return restaurados;
}

export async function sincronizarWorkspaceComSqlite() {
  const resultado = await migrarWorkspaceParaSqlite();
  window.localStorage.setItem(
    CHAVE_MIGRACAO_SQLITE,
    JSON.stringify({
      versao: 1,
      sincronizadoEm: new Date().toISOString(),
      registros: resultado.registros,
      caminho: resultado.caminho,
    }),
  );
  return resultado;
}

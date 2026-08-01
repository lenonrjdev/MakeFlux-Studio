import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const raiz = dirname(dirname(fileURLToPath(import.meta.url)));
const ler = (caminho) => readFileSync(join(raiz, caminho), "utf8");

test("a Fase 10 possui a Central de Configurações completa", () => {
  const arquivos = [
    "components/configuracoes/central-configuracoes.tsx",
    "components/configuracoes/provedor-configuracoes.tsx",
    "components/configuracoes/navegacao-configuracoes.tsx",
    "components/configuracoes/secao-perfil.tsx",
    "components/configuracoes/secao-workspace.tsx",
    "components/configuracoes/secao-padroes-criacao.tsx",
    "components/configuracoes/secao-desempenho.tsx",
    "components/configuracoes/secao-armazenamento.tsx",
    "components/configuracoes/secao-aparencia.tsx",
    "components/configuracoes/secao-backup.tsx",
    "components/configuracoes/secao-seguranca.tsx",
    "components/configuracoes/secao-atualizacoes.tsx",
  ];
  for (const arquivo of arquivos) assert.equal(existsSync(join(raiz, arquivo)), true, `Arquivo ausente: ${arquivo}`);
});

test("o workspace de Configurações é persistente e versionado", () => {
  const fonte = ler("lib/configuracoes-locais.ts");
  assert.match(fonte, /CHAVE_WORKSPACE_CONFIGURACOES\s*=\s*["']makeflux:workspace-configuracoes:v1["']/);
  assert.match(fonte, /EVENTO_WORKSPACE_CONFIGURACOES/);
  assert.match(fonte, /carregarConfiguracoesLocais/);
  assert.match(fonte, /salvarConfiguracoesLocais/);
  assert.match(fonte, /versao:\s*1/);
});

test("o contrato cobre todas as áreas obrigatórias da Fase 10", () => {
  const tipos = ler("types/configuracoes.ts");
  for (const secao of ["perfil", "workspace", "padroes", "desempenho", "armazenamento", "aparencia", "backup", "seguranca", "atualizacoes"]) {
    assert.match(tipos, new RegExp(`\\b${secao}\\b`));
  }
});

test("backup e restauração utilizam um pacote próprio do MakeFlux Studio", () => {
  const fonte = ler("lib/configuracoes-locais.ts");
  assert.match(fonte, /formato:\s*["']makeflux-backup["']/);
  assert.match(fonte, /criarPacoteBackupLocal/);
  assert.match(fonte, /baixarBackupLocal/);
  assert.match(fonte, /importarBackupLocal/);
  assert.match(fonte, /chave\.startsWith\(["']makeflux:/);
});

test("o PIN local é armazenado como hash e possui bloqueio por inatividade", () => {
  const fonte = ler("lib/configuracoes-locais.ts");
  const provedor = ler("components/configuracoes/provedor-configuracoes.tsx");
  assert.match(fonte, /crypto\.subtle\.digest\(["']SHA-256["']/);
  assert.match(fonte, /pinHash/);
  const tipos = ler("types/configuracoes.ts");
  assert.doesNotMatch(tipos, /\bpin:\s*string/);
  assert.match(provedor, /EVENTO_BLOQUEAR_APLICACAO/);
  assert.match(provedor, /bloquearAposMinutos/);
});

test("as preferências visuais são aplicadas globalmente", () => {
  const provedor = ler("components/configuracoes/provedor-configuracoes.tsx");
  const estilos = ler("app/globals.css");
  assert.match(provedor, /dataset\.aparencia/);
  assert.match(provedor, /dataset\.densidade/);
  assert.match(provedor, /dataset\.sidebarCompacta/);
  assert.match(provedor, /dataset\.aparencia = "claro"/);
  assert.match(estilos, /color-scheme:\s*light only/);
  assert.doesNotMatch(estilos, /data-aparencia="escuro"/);
  assert.match(estilos, /data-sidebar-compacta="true"/);
});

test("a página Configurações entrega a central real", () => {
  const pagina = ler("app/configuracoes/page.tsx");
  assert.match(pagina, /CentralConfiguracoes/);
  assert.doesNotMatch(pagina, /PaginaEmConstrucao/);
});

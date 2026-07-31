import type { ItemProntidaoDistribuicao } from "@/types/qualidade";

export const itensProntidaoDistribuicao: ItemProntidaoDistribuicao[] = [
  {
    id: "versao",
    titulo: "Versão 1.0 sincronizada",
    descricao: "package.json, Cargo e Tauri usam a mesma versão.",
    status: "aprovado",
  },
  {
    id: "instalador",
    titulo: "Instaladores Windows",
    descricao: "Build Tauri produz MSI e NSIS no Windows.",
    status: "aprovado",
  },
  {
    id: "assinatura",
    titulo: "Assinatura de código",
    descricao: "Exige certificado ou serviço de assinatura configurado pelo distribuidor.",
    status: "pendente",
  },
  {
    id: "checksums",
    titulo: "Checksums de release",
    descricao: "O script de distribuição gera SHA-256 e manifesto da versão.",
    status: "aprovado",
  },
];

export const verificacoesQualidade = [
  "Fluxo completo: projeto → produção → biblioteca → publicação",
  "Migração idempotente do localStorage para SQLite",
  "Cofre criptografado sem segredo em texto aberto",
  "Telemetria local desativada por padrão",
  "Build Next.js estático e rotas exportadas",
  "Cargo fmt, cargo check e instalador Tauri",
];

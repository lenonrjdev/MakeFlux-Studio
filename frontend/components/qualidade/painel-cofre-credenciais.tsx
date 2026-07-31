"use client";

import { KeyRound, Lock, Save, Trash2, Unlock } from "lucide-react";
import { useState } from "react";

import { CartaoConfiguracao } from "@/components/configuracoes/cartao-configuracao";
import { Botao } from "@/components/ui/botao";
import { CampoFormulario, classesCampo } from "@/components/ui/campo-formulario";
import { SeloStatus } from "@/components/ui/selo-status";
import { conteudoQualidade } from "@/content/qualidade";
import {
  bloquearCofre,
  desbloquearCofre,
  inicializarCofre,
  removerSegredoCofre,
  salvarSegredoCofre,
} from "@/lib/cofre-nativo";
import type { SegredoCofreResumo, StatusCofreNativo } from "@/types/qualidade";

export function PainelCofreCredenciais({
  status,
  segredos,
  aoAtualizar,
  aoNotificar,
}: {
  status: StatusCofreNativo | null;
  segredos: SegredoCofreResumo[];
  aoAtualizar: () => Promise<void>;
  aoNotificar: (mensagem: string, tipo?: "sucesso" | "aviso") => void;
}) {
  const [senha, setSenha] = useState("");
  const [chave, setChave] = useState("integracao:openai");
  const [valor, setValor] = useState("");
  const [processando, setProcessando] = useState(false);

  async function executar(acao: () => Promise<unknown>, sucesso: string) {
    setProcessando(true);
    try {
      await acao();
      setSenha("");
      setValor("");
      await aoAtualizar();
      aoNotificar(sucesso);
    } catch (erro) {
      aoNotificar(erro instanceof Error ? erro.message : "Operação não concluída.", "aviso");
    } finally {
      setProcessando(false);
    }
  }

  return (
    <CartaoConfiguracao
      titulo="Cofre criptografado de credenciais"
      descricao="Segredos são cifrados no disco e a chave permanece apenas na memória."
      acao={
        <SeloStatus
          texto={status?.desbloqueado ? "Desbloqueado" : status?.inicializado ? "Bloqueado" : "Não inicializado"}
          tom={status?.desbloqueado ? "verde" : status?.inicializado ? "laranja" : "neutro"}
        />
      }
    >
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <CampoFormulario rotulo={status?.inicializado ? "Senha mestra" : "Criar senha mestra"} descricao="Use ao menos oito caracteres. Ela não pode ser recuperada.">
          <input
            type="password"
            value={senha}
            onChange={(evento) => setSenha(evento.target.value)}
            className={`${classesCampo} h-10`}
            placeholder="Senha mestra do cofre"
          />
        </CampoFormulario>
        <div className="flex items-end gap-2">
          {!status?.inicializado ? (
            <Botao
              variante="primario"
              disabled={processando || senha.length < 8}
              onClick={() => void executar(() => inicializarCofre(senha), "Cofre inicializado e desbloqueado.")}
            >
              <KeyRound className="size-3.5" /> Inicializar
            </Botao>
          ) : status.desbloqueado ? (
            <Botao disabled={processando} onClick={() => void executar(bloquearCofre, "Cofre bloqueado.")}>
              <Lock className="size-3.5" /> Bloquear
            </Botao>
          ) : (
            <Botao
              variante="primario"
              disabled={processando || !senha}
              onClick={() => void executar(() => desbloquearCofre(senha), "Cofre desbloqueado.")}
            >
              <Unlock className="size-3.5" /> Desbloquear
            </Botao>
          )}
        </div>
      </div>

      {status?.desbloqueado && (
        <div className="grid grid-cols-[0.8fr_1.4fr_auto] items-end gap-3 rounded-md border border-[#e3e8e7] bg-[#fafbfb] p-3">
          <CampoFormulario rotulo="Identificador">
            <input value={chave} onChange={(evento) => setChave(evento.target.value)} className={`${classesCampo} h-10`} />
          </CampoFormulario>
          <CampoFormulario rotulo="Segredo">
            <input type="password" value={valor} onChange={(evento) => setValor(evento.target.value)} className={`${classesCampo} h-10`} placeholder="Chave ou token" />
          </CampoFormulario>
          <Botao
            variante="primario"
            disabled={processando || !chave.trim() || !valor}
            onClick={() => void executar(() => salvarSegredoCofre(chave.trim(), valor), "Segredo salvo no cofre.")}
          >
            <Save className="size-3.5" /> Salvar
          </Botao>
        </div>
      )}

      <div className="space-y-2">
        {segredos.length === 0 ? (
          <p className="rounded-md border border-dashed border-[#dfe5e4] px-3 py-4 text-center text-[9px] text-[#92999a]">
            Nenhuma credencial armazenada.
          </p>
        ) : (
          segredos.map((segredo) => (
            <div key={segredo.chave} className="flex items-center justify-between rounded-md border border-[#e4e8e8] px-3 py-2.5">
              <div>
                <strong className="block text-[9.5px] text-[#303637]">{segredo.chave}</strong>
                <span className="mt-0.5 block text-[8px] text-[#959c9d]">
                  Atualizado em {new Date(segredo.atualizadoEm).toLocaleString("pt-BR")}
                </span>
              </div>
              {status?.desbloqueado && (
                <Botao
                  variante="fantasma"
                  disabled={processando}
                  onClick={() => void executar(() => removerSegredoCofre(segredo.chave), "Segredo removido.")}
                >
                  <Trash2 className="size-3.5" /> Remover
                </Botao>
              )}
            </div>
          ))
        )}
      </div>
      <p className="text-[9px] leading-5 text-[#7c8585]">{conteudoQualidade.avisoCofre}</p>
    </CartaoConfiguracao>
  );
}

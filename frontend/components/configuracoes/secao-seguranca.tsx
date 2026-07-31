"use client";

import { Key, Lock, Shield } from "lucide-react";
import { useState } from "react";

import { CartaoConfiguracao } from "@/components/configuracoes/cartao-configuracao";
import { Botao } from "@/components/ui/botao";
import { CampoFormulario, classesCampo } from "@/components/ui/campo-formulario";
import { Interruptor } from "@/components/ui/interruptor";
import { conteudoConfiguracoes } from "@/content/configuracoes";
import type { ConfiguracaoSeguranca } from "@/types/configuracoes";

export function SecaoSeguranca({ seguranca, aoAtualizar, aoConfigurarPin, aoRemoverPin, aoBloquearAgora, aoNotificar }: { seguranca: ConfiguracaoSeguranca; aoAtualizar: (dados: Partial<ConfiguracaoSeguranca>) => void; aoConfigurarPin: (pin: string) => Promise<string>; aoRemoverPin: () => void; aoBloquearAgora: () => void; aoNotificar: (mensagem: string, tipo?: "sucesso" | "aviso") => void }) {
  const [pin, setPin] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function salvarPin() {
    if (pin.length < 4 || pin.length > 8 || pin !== confirmacao) {
      aoNotificar("Use um PIN de 4 a 8 dígitos e confirme corretamente.", "aviso");
      return;
    }
    setSalvando(true);
    await aoConfigurarPin(pin);
    setPin("");
    setConfirmacao("");
    setSalvando(false);
    aoNotificar("Bloqueio local configurado.");
  }

  return (
    <div className="space-y-4">
      <CartaoConfiguracao titulo="Bloqueio local" descricao="Proteja a abertura e o uso após um período de inatividade.">
        <div className="grid grid-cols-3 gap-4">
          <CampoFormulario rotulo="Novo PIN"><input type="password" inputMode="numeric" maxLength={8} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} className={`${classesCampo} h-10 tracking-[0.25em]`} placeholder="4 a 8 dígitos" /></CampoFormulario>
          <CampoFormulario rotulo="Confirmar PIN"><input type="password" inputMode="numeric" maxLength={8} value={confirmacao} onChange={(e) => setConfirmacao(e.target.value.replace(/\D/g, ""))} className={`${classesCampo} h-10 tracking-[0.25em]`} /></CampoFormulario>
          <CampoFormulario rotulo="Bloquear após"><select value={seguranca.bloquearAposMinutos} onChange={(e) => aoAtualizar({ bloquearAposMinutos: Number(e.target.value) })} className={`${classesCampo} h-10`}><option value={1}>1 minuto</option><option value={5}>5 minutos</option><option value={15}>15 minutos</option><option value={30}>30 minutos</option><option value={60}>1 hora</option></select></CampoFormulario>
        </div>
        <div className="flex flex-wrap gap-2">
          <Botao variante="primario" disabled={salvando} onClick={() => void salvarPin()}><Key className="size-3.5" /> {salvando ? "Salvando..." : seguranca.pinHash ? "Alterar PIN" : "Ativar bloqueio"}</Botao>
          {seguranca.pinHash && <Botao onClick={() => { aoBloquearAgora(); }}><Lock className="size-3.5" /> Bloquear agora</Botao>}
          {seguranca.pinHash && <Botao variante="fantasma" onClick={() => { aoRemoverPin(); aoNotificar("Bloqueio local removido.", "aviso"); }}>Remover PIN</Botao>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Interruptor ativo={seguranca.ocultarCaminhosRecentes} aoAlterar={(valor) => aoAtualizar({ ocultarCaminhosRecentes: valor })} rotulo="Ocultar caminhos recentes" descricao="Reduz exposição visual de pastas pessoais." />
          <Interruptor ativo={seguranca.removerDadosSensiveisDosLogs} aoAlterar={(valor) => aoAtualizar({ removerDadosSensiveisDosLogs: valor })} rotulo="Sanitizar logs" descricao="Remove chaves, tokens e caminhos ao exportar suporte." />
          <Interruptor ativo={seguranca.confirmarExclusoesDefinitivas} aoAlterar={(valor) => aoAtualizar({ confirmarExclusoesDefinitivas: valor })} rotulo="Confirmar exclusões definitivas" descricao="Exige confirmação antes de remover dados." />
        </div>
      </CartaoConfiguracao>
      <div className="rounded-md border border-[#dce8e5] bg-[#f2f8f6] p-4 text-[9.5px] leading-5 text-[#55736c]"><Shield className="mr-2 inline size-3.5" /> {conteudoConfiguracoes.avisoSeguranca}</div>
    </div>
  );
}

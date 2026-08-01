"use client";

import { AlertTriangle } from "lucide-react";
import { useState } from "react";

import { conteudoCanaisPublicacao } from "@/content/canais-publicacao";
import { provedoresCanais } from "@/data/canais-publicacao";
import { useCanaisPublicacao } from "@/hooks/use-canais-publicacao";
import { usePublicacoesLocais } from "@/hooks/use-publicacoes-locais";
import { emAmbienteTauri } from "@/lib/runtime-nativo";
import type { ProvedorCanalPublicacao } from "@/types/canais-publicacao";

import { CabecalhoCanais } from "./cabecalho-canais";
import { CartaoCanal } from "./cartao-canal";
import { ModalOauthCanal } from "./modal-oauth-canal";
import { PainelEnviosSociais } from "./painel-envios-sociais";
import { PainelPublicarCanal } from "./painel-publicar-canal";
import { ResumoCanais } from "./resumo-canais";

export function CentralCanaisPublicacao() {
  const canais = useCanaisPublicacao();
  const { publicacoes } = usePublicacoesLocais();
  const [conectando, setConectando] = useState<ProvedorCanalPublicacao | null>(null);

  return <div className="min-h-[calc(100vh-62px)] bg-[#f7f8f9]"><CabecalhoCanais conectadas={canais.conexoes.filter((item) => item.status === "conectada").length} /><div className="space-y-4 px-8 py-5">{!emAmbienteTauri() && <div className="flex items-start gap-2 rounded-md border border-[#eadfc7] bg-[#fff9ec] px-3 py-2.5 text-[8px] leading-4 text-[#80642e]"><AlertTriangle className="mt-0.5 size-3.5 shrink-0" /> A prévia web mostra a interface, mas OAuth, cofre e uploads reais exigem o aplicativo desktop.</div>}<ResumoCanais conexoes={canais.conexoes} envios={canais.envios} /><section className="grid grid-cols-3 gap-3">{provedoresCanais.map((provedor) => <CartaoCanal key={provedor.id} provedor={provedor.id} conexao={canais.conexoes.find((item) => item.provedor === provedor.id) ?? null} aoConectar={() => setConectando(provedor.id)} aoDesconectar={() => void canais.desconectar(provedor.id)} />)}</section><div className="grid grid-cols-[minmax(0,1.1fr)_minmax(360px,.9fr)] items-start gap-4"><PainelPublicarCanal publicacoes={publicacoes} conexoes={canais.conexoes} aoPublicar={canais.publicar} /><PainelEnviosSociais envios={canais.envios} aoCancelar={canais.cancelarEnvio} aoRepetir={canais.repetirEnvio} /></div><div className="rounded-md border border-[#dfe7e4] bg-white px-4 py-3 text-[7.5px] leading-4 text-[#788180]">{conteudoCanaisPublicacao.avisoAprovacao}</div></div>{conectando && <ModalOauthCanal provedor={conectando} aoFechar={() => setConectando(null)} aoConectar={canais.conectar} />}</div>;
}

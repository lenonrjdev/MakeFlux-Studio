"use client";

import { Camera, User } from "lucide-react";
import Image from "next/image";
import type { ChangeEvent } from "react";

import { CartaoConfiguracao } from "@/components/configuracoes/cartao-configuracao";
import { CampoFormulario, classesCampo } from "@/components/ui/campo-formulario";
import { idiomasInterface } from "@/data/configuracoes";
import type { PerfilLocal } from "@/types/configuracoes";

export function SecaoPerfil({ perfil, aoAtualizar, aoNotificar }: { perfil: PerfilLocal; aoAtualizar: (dados: Partial<PerfilLocal>) => void; aoNotificar: (mensagem: string, tipo?: "sucesso" | "aviso") => void }) {
  function selecionarFoto(evento: ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;
    if (!arquivo.type.startsWith("image/") || arquivo.size > 1_500_000) {
      aoNotificar("Use uma imagem de até 1,5 MB.", "aviso");
      return;
    }
    const leitor = new FileReader();
    leitor.onload = () => {
      aoAtualizar({ fotoDataUrl: typeof leitor.result === "string" ? leitor.result : "" });
      aoNotificar("Foto do perfil atualizada.");
    };
    leitor.readAsDataURL(arquivo);
  }

  const iniciais = perfil.nome.split(" ").filter(Boolean).slice(0, 2).map((parte) => parte[0]).join("").toUpperCase() || "MF";

  return (
    <div className="space-y-4">
      <CartaoConfiguracao titulo="Identidade local" descricao="Informações usadas na interface e nos metadados dos conteúdos.">
        <div className="flex items-center gap-4 rounded-md border border-[#e5e9e9] bg-[#fafbfb] p-4">
          <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-full bg-[#e4f1ed] text-[15px] font-semibold text-[#1c7b67]">
            {perfil.fotoDataUrl ? <Image src={perfil.fotoDataUrl} alt="Foto do perfil" width={56} height={56} unoptimized className="size-full object-cover" /> : iniciais}
          </div>
          <div className="min-w-0 flex-1">
            <strong className="block text-[11px] font-medium text-[#303637]">Imagem do perfil</strong>
            <p className="mt-1 text-[9px] leading-4 text-[#8b9293]">PNG, JPG ou WebP. A imagem fica somente neste computador.</p>
          </div>
          <label className="foco-acessivel inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-[#dfe4e4] bg-white px-3 text-[10px] font-medium text-[#4b5253] hover:bg-[#f7f9f9]">
            <Camera className="size-3.5" /> Alterar foto
            <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={selecionarFoto} />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <CampoFormulario rotulo="Nome exibido"><input value={perfil.nome} onChange={(e) => aoAtualizar({ nome: e.target.value })} className={`${classesCampo} h-10`} /></CampoFormulario>
          <CampoFormulario rotulo="E-mail local" descricao="Opcional, não é enviado para servidores." opcional><input type="email" value={perfil.email} onChange={(e) => aoAtualizar({ email: e.target.value })} className={`${classesCampo} h-10`} placeholder="voce@exemplo.com" /></CampoFormulario>
          <CampoFormulario rotulo="Autor nos metadados"><input value={perfil.autorMetadados} onChange={(e) => aoAtualizar({ autorMetadados: e.target.value })} className={`${classesCampo} h-10`} /></CampoFormulario>
          <CampoFormulario rotulo="Idioma da interface"><select value={perfil.idioma} onChange={(e) => aoAtualizar({ idioma: e.target.value as PerfilLocal["idioma"] })} className={`${classesCampo} h-10`}>{idiomasInterface.map((item) => <option key={item.id} value={item.id}>{item.titulo}</option>)}</select></CampoFormulario>
        </div>
      </CartaoConfiguracao>
      <div className="rounded-md border border-[#dce8e5] bg-[#f2f8f6] p-4 text-[9.5px] leading-5 text-[#55736c]">
        <User className="mr-2 inline size-3.5" /> Este perfil é local e não cria uma conta online. A sincronização entre computadores não está ativa.
      </div>
    </div>
  );
}

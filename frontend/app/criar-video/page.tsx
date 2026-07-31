import { CabecalhoAplicacao } from "@/components/layout/cabecalho-aplicacao";
import { EstudioCriacaoVideo } from "@/components/criar-video/estudio-criacao-video";

export default function PaginaCriarVideo() {
  return (
    <div className="min-h-screen">
      <CabecalhoAplicacao />
      <EstudioCriacaoVideo />
    </div>
  );
}

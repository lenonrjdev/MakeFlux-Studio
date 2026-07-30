import { PaginaEmConstrucao } from "@/components/modulos/pagina-em-construcao";
import { modulosPlanejados } from "@/content/modulos";

export default function PaginaConfiguracoes() {
  return <PaginaEmConstrucao {...modulosPlanejados["/configuracoes"]} />;
}

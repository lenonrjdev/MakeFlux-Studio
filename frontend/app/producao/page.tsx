import { PaginaEmConstrucao } from "@/components/modulos/pagina-em-construcao";
import { modulosPlanejados } from "@/content/modulos";

export default function PaginaProducao() {
  return <PaginaEmConstrucao {...modulosPlanejados["/producao"]} />;
}

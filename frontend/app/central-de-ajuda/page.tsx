import { PaginaEmConstrucao } from "@/components/modulos/pagina-em-construcao";
import { modulosPlanejados } from "@/content/modulos";

export default function PaginaCentralDeAjuda() {
  return <PaginaEmConstrucao {...modulosPlanejados["/central-de-ajuda"]} />;
}

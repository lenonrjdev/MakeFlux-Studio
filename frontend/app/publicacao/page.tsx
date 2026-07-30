import { PaginaEmConstrucao } from "@/components/modulos/pagina-em-construcao";
import { modulosPlanejados } from "@/content/modulos";

export default function PaginaPublicacao() {
  return <PaginaEmConstrucao {...modulosPlanejados["/publicacao"]} />;
}

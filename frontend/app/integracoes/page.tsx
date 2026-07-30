import { PaginaEmConstrucao } from "@/components/modulos/pagina-em-construcao";
import { modulosPlanejados } from "@/content/modulos";

export default function PaginaIntegracoes() {
  return <PaginaEmConstrucao {...modulosPlanejados["/integracoes"]} />;
}

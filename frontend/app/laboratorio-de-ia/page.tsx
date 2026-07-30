import { PaginaEmConstrucao } from "@/components/modulos/pagina-em-construcao";
import { modulosPlanejados } from "@/content/modulos";

export default function PaginaLaboratorioDeIa() {
  return <PaginaEmConstrucao {...modulosPlanejados["/laboratorio-de-ia"]} />;
}

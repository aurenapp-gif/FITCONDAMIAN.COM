import { almacenListo, leer } from "../_panel/store";
import PanelClient, { type Datos } from "./PanelClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Panel() {
  const listo = almacenListo();
  const [embudo, contenido, seguidores, agendas, perfil, publicaciones, origenes, resultados, meta] = await Promise.all([
    leer<Datos["embudo"]>("embudo", {}),
    leer<Datos["contenido"]>("contenido", {}),
    leer<Datos["seguidores"]>("seguidores", {}),
    leer<Datos["agendas"]>("agendas", []),
    leer<Datos["perfil"]>("perfil", null),
    leer<Datos["publicaciones"]>("publicaciones", []),
    leer<Datos["origenes"]>("origenes", {}),
    leer<Datos["resultados"]>("resultados", {}),
    leer<Datos["meta"]>("meta", {}),
  ]);
  return <PanelClient almacen={listo} datos={{ embudo, contenido, seguidores, agendas, perfil, publicaciones, origenes, resultados, meta }} />;
}

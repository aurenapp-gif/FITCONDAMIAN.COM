import { ninjoListo } from "../_panel/ninjo";
import { ejecutar } from "../_panel/sincronizar";
import { almacenListo, leer } from "../_panel/store";
import { hotmartListo, stripeListo } from "../_panel/ventas";
import { metaListo } from "../_panel/meta";
import PanelClient, { type Datos } from "./PanelClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

const VIEJO_MIN = 30; // al abrir, si los datos tienen más de 30 minutos, se refrescan solos

export default async function Panel() {
  const listo = almacenListo();
  const conNinjo = ninjoListo();
  if (listo && conNinjo) {
    const meta = await leer<Record<string, string>>("meta", {});
    const edad = meta.agendas ? (Date.now() - new Date(meta.agendas).getTime()) / 60000 : Infinity;
    if (edad > VIEJO_MIN) {
      await Promise.race([ejecutar("apertura", false).catch(() => null), new Promise((r) => setTimeout(r, 12000))]);
    }
  }
  const [embudo, contenido, seguidores, agendas, perfil, publicaciones, origenes, resultados, meta, registro, control, ventas, ventasManuales, anuncios, instagram] = await Promise.all([
    leer<Datos["embudo"]>("embudo", {}),
    leer<Datos["contenido"]>("contenido", {}),
    leer<Datos["seguidores"]>("seguidores", {}),
    leer<Datos["agendas"]>("agendas", []),
    leer<Datos["perfil"]>("perfil", null),
    leer<Datos["publicaciones"]>("publicaciones", []),
    leer<Datos["origenes"]>("origenes", {}),
    leer<Datos["resultados"]>("resultados", {}),
    leer<Datos["meta"]>("meta", {}),
    leer<{ ok?: boolean; error?: string; fin?: string; via?: string }[]>("registro", []),
    leer<Datos["control"]>("control", null),
    leer<Datos["ventas"]>("ventas", []),
    leer<Datos["ventasManuales"]>("ventas_manuales", []),
    leer<Datos["anuncios"]>("anuncios", null),
    leer<Datos["instagram"]>("instagram", null),
  ]);
  const ultimo = registro[0] || null;
  return (
    <PanelClient
      almacen={listo}
      conexiones={{ ninjo: conNinjo, ultimoError: ultimo && !ultimo.ok ? ultimo.error || "error" : null, meta: metaListo(), stripe: stripeListo(), hotmart: hotmartListo() }}
      datos={{ embudo, contenido, seguidores, agendas, perfil, publicaciones, origenes, resultados, meta, control, ventas, ventasManuales, anuncios, instagram }}
    />
  );
}

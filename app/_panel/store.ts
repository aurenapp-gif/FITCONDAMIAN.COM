// Almacén privado del panel en Vercel Blob (acceso "private"): un JSON por tipo de dato.
// Necesita BLOB_READ_WRITE_TOKEN o BLOB_STORE_ID, que Vercel crea al conectar un Blob store al proyecto.
import { get, put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";

// Solo para probar en local (npm run dev): con PANEL_LOCAL_DIR los datos se leen y escriben en esa carpeta.
const LOCAL = process.env.NODE_ENV !== "production" ? process.env.PANEL_LOCAL_DIR : undefined;

const PREFIJO = "panel/";

export const TIPOS = ["embudo", "contenido", "seguidores", "agendas", "perfil", "publicaciones", "origenes", "resultados", "meta", "registro", "control", "ventas", "ventas_manuales", "anuncios", "instagram"] as const;
export type Tipo = (typeof TIPOS)[number];

export function almacenListo(): boolean {
  // Vale la clave de lectura/escritura o la conexión nueva de Vercel (BLOB_STORE_ID + OIDC).
  return Boolean(LOCAL || process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

export async function leer<T>(tipo: Tipo, porDefecto: T): Promise<T> {
  if (!almacenListo()) return porDefecto;
  if (LOCAL) return fs.readFile(path.join(LOCAL, `${tipo}.json`), "utf8").then((t) => JSON.parse(t) as T, () => porDefecto);
  try {
    const r = await get(`${PREFIJO}${tipo}.json`, { access: "private", useCache: false });
    if (!r || r.statusCode !== 200 || !r.stream) return porDefecto;
    return JSON.parse(await new Response(r.stream).text()) as T;
  } catch (e) {
    if (e instanceof Error && /not.?found/i.test(e.name + e.message)) return porDefecto;
    throw e;
  }
}

export async function guardar(tipo: Tipo, datos: unknown): Promise<void> {
  if (LOCAL) { await fs.mkdir(LOCAL, { recursive: true }); await fs.writeFile(path.join(LOCAL, `${tipo}.json`), JSON.stringify(datos)); return; }
  await put(`${PREFIJO}${tipo}.json`, JSON.stringify(datos), {
    access: "private",
    allowOverwrite: true,
    addRandomSuffix: false,
    contentType: "application/json",
  });
}

// Tipos que se guardan como diccionario { id: documento } y se fusionan en cada sincronización.
export const FUSIONABLES: Tipo[] = ["embudo", "contenido", "seguidores", "resultados"];

export async function marcarSync(tipo: Tipo): Promise<void> {
  const meta = await leer<Record<string, string>>("meta", {});
  meta[tipo] = new Date().toISOString();
  await guardar("meta", meta);
}

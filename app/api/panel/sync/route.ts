import { NextResponse } from "next/server";
import { tokenSyncCorrecto } from "../../../_panel/auth";
import { FUSIONABLES, TIPOS, type Tipo, almacenListo, guardar, leer, marcarSync } from "../../../_panel/store";

// Entrada de datos del panel. La usa la tarea de Claude que lee Ninjo cada día.
// POST con "Authorization: Bearer <PANEL_SYNC_TOKEN, o PANEL_PASSWORD si no hay token aparte>" y cuerpo { tipo, datos }:
//   embudo / contenido / seguidores / resultados → { id: documento }  (se fusiona con lo guardado)
//   agendas / publicaciones → [filas]   perfil → { ... }   origenes → { "7": [...], "14": [...], ... }  (se reemplaza)
// GET con el mismo token devuelve la fecha de la última sincronización de cada tipo.

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!tokenSyncCorrecto(req.headers.get("authorization"))) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.json({ almacen: almacenListo(), meta: await leer("meta", {}) });
}

export async function POST(req: Request) {
  if (!tokenSyncCorrecto(req.headers.get("authorization"))) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!almacenListo()) return NextResponse.json({ error: "Falta conectar el Blob store (BLOB_READ_WRITE_TOKEN)." }, { status: 503 });
  let cuerpo: { tipo?: string; datos?: unknown };
  try {
    cuerpo = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON no válido" }, { status: 400 });
  }
  const tipo = cuerpo.tipo as Tipo;
  if (!TIPOS.includes(tipo) || tipo === "meta" || cuerpo.datos === undefined) {
    return NextResponse.json({ error: "Tipo o datos no válidos" }, { status: 400 });
  }
  if (FUSIONABLES.includes(tipo)) {
    if (!cuerpo.datos || typeof cuerpo.datos !== "object" || Array.isArray(cuerpo.datos)) {
      return NextResponse.json({ error: "Para este tipo, datos debe ser { id: documento }" }, { status: 400 });
    }
    const actual = await leer<Record<string, unknown>>(tipo, {});
    const nuevos = cuerpo.datos as Record<string, unknown>;
    for (const [id, doc] of Object.entries(nuevos)) {
      if (doc === null) delete actual[id];
      else actual[id] = doc;
    }
    await guardar(tipo, actual);
    await marcarSync(tipo);
    return NextResponse.json({ ok: true, tipo, documentos: Object.keys(actual).length, escritos: Object.keys(nuevos).length });
  }
  await guardar(tipo, cuerpo.datos);
  await marcarSync(tipo);
  return NextResponse.json({ ok: true, tipo });
}

import { NextResponse } from "next/server";
import { cronCorrecto } from "../../../_panel/auth";
import { ninjo } from "../../../_panel/ninjo";

// Diagnóstico (solo con CRON_SECRET): prueba parámetros de la búsqueda de conversaciones de Ninjo
// y devuelve solo los recuentos, nunca las conversaciones.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!cronCorrecto(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const q = Object.fromEntries(new URL(req.url).searchParams);
  const ruta = q._ruta || "/api/v1/analytics/conversations/search";
  delete q._ruta;
  try {
    const r = await ninjo<Record<string, unknown>>(ruta, { query: { limit: 1, ...q } });
    const { conversations, ...resto } = r as { conversations?: unknown[] };
    return NextResponse.json({ ...resto, devueltas: Array.isArray(conversations) ? conversations.length : null });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

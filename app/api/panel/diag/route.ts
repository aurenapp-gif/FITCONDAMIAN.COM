import { NextResponse } from "next/server";
import { cronCorrecto } from "../../../_panel/auth";
import { ninjo, ninjoHerramienta } from "../../../_panel/ninjo";

// Diagnóstico (solo con CRON_SECRET): prueba parámetros de la búsqueda de conversaciones de Ninjo
// y devuelve solo los recuentos, nunca las conversaciones.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!cronCorrecto(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const q = Object.fromEntries(new URL(req.url).searchParams);
  const ruta = q._ruta || "/api/v1/analytics/conversations/search";
  delete q._ruta;
  if (q._entorno) {
    // Solo nombres y longitud de las variables de conexión, nunca sus valores.
    const nombres = Object.keys(process.env).filter((k) => /meta|fb|facebook|insta|ig_|hotmart|stripe|ads|token|cuenta|account/i.test(k) && !/^(VERCEL|NEXT|NODE|npm_|TURBO)/.test(k));
    return NextResponse.json({ entorno: process.env.VERCEL_ENV, commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7), variables: nombres.sort().map((k) => ({ nombre: k, largo: (process.env[k] || "").length })) });
  }
  try {
    if (q._herramienta) {
      const nombre = q._herramienta; delete q._herramienta;
      const args: Record<string, unknown> = { limit: 1 };
      for (const [k, v] of Object.entries(q)) args[k] = /^\d+$/.test(v) ? Number(v) : v;
      const r = await ninjoHerramienta<Record<string, unknown>>(nombre, args);
      const { conversations, ...resto } = r as { conversations?: unknown[] };
      return NextResponse.json({ via: "mcp", ...resto, devueltas: Array.isArray(conversations) ? conversations.length : null });
    }
    const r = await ninjo<Record<string, unknown>>(ruta, { query: { limit: 1, ...q } });
    const { conversations, ...resto } = r as { conversations?: unknown[] };
    return NextResponse.json({ ...resto, devueltas: Array.isArray(conversations) ? conversations.length : null });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

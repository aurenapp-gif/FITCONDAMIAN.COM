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
  if (q._meta) {
    // Pruebas mínimas contra Meta: solo devuelve estados y mensajes de error, nunca el token.
    const tk = process.env.META_ACCESS_TOKEN || process.env.METAACCESSTOKEN || "";
    const cta = (process.env.META_AD_ACCOUNT_ID || process.env.METAADACCOUNTID || "").replace(/^act_/i, "").replace(/\D/g, "");
    const pruebas: Record<string, string> = {
      cuenta: `act_${cta}?fields=name,account_status,currency`,
      insights_simple: `act_${cta}/insights?fields=spend&date_preset=last_7d`,
      insights_ad: `act_${cta}/insights?level=ad&fields=ad_name,spend,actions&date_preset=last_7d&limit=5`,
      mis_cuentas: `me/adaccounts?fields=name,account_id&limit=10`,
    };
    const out: Record<string, unknown> = { cuenta_largo: cta.length };
    for (const v of [q._meta === "1" ? "v26.0" : q._meta]) {
      for (const [k, ruta] of Object.entries(pruebas)) {
        const r = await fetch(`https://graph.facebook.com/${v}/${ruta}&access_token=${encodeURIComponent(tk)}`.replace(/\?([^?]*)&access/, (m) => m).replace(/^([^?]*)&/, "$1?"), { cache: "no-store" });
        const j = await r.json().catch(() => ({}));
        out[`${v}:${k}`] = j.error ? `ERROR ${j.error.code}/${j.error.error_subcode || ""}: ${j.error.message}` : JSON.stringify(j).slice(0, 300);
      }
    }
    return NextResponse.json(out);
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

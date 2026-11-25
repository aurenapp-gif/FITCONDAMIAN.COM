import { NextResponse } from "next/server";
import { cronCorrecto } from "../../../_panel/auth";
import { ninjo, ninjoHerramienta } from "../../../_panel/ninjo";
import { estudioAperturas } from "../../../_panel/sincronizar";

// Diagnóstico (solo con CRON_SECRET): prueba parámetros de la búsqueda de conversaciones de Ninjo
// y devuelve solo los recuentos, nunca las conversaciones.
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(req: Request) {
  if (!cronCorrecto(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const q = Object.fromEntries(new URL(req.url).searchParams);
  const ruta = q._ruta || "/api/v1/analytics/conversations/search";
  delete q._ruta;
  if (q._aperturas) {
    try { return NextResponse.json(await estudioAperturas(Number(q._aperturas) > 1 ? Number(q._aperturas) : 30)); }
    catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 }); }
  }
  if (q._origenes) {
    // Cómo empiezan las conversaciones: tipos de mensaje, campos disponibles y primeros textos (recortados).
    const dias = Number(q._origenes) > 1 ? Number(q._origenes) : 7;
    const desde = new Date(Date.now() - dias * 864e5).toISOString();
    type M = Record<string, unknown> & { direction?: string; type?: string; content?: string; sent_at?: string; author?: string };
    const p = await ninjoHerramienta<{ conversations: { messages?: M[]; meta?: Record<string, unknown> }[]; total_pages: number }>("search_conversations", { has_agent: "any", channel: "INSTAGRAM", sort_by: "first_message_at", limit: 100, first_message_after: desde, page: 1 });
    const tipos: Record<string, number> = {}, campos: Record<string, number> = {}, metaCampos: Record<string, number> = {};
    const ejemplos: Record<string, string[]> = {};
    for (const c of p.conversations || []) {
      Object.keys(c.meta || {}).forEach((k) => { metaCampos[k] = (metaCampos[k] || 0) + 1; });
      const ms = (c.messages || []).slice().sort((a, b) => String(a.sent_at).localeCompare(String(b.sent_at)));
      const m0 = ms[0]; if (!m0) continue;
      Object.keys(m0).forEach((k) => { campos[k] = (campos[k] || 0) + 1; });
      const k = `${m0.direction}|${m0.type}|${m0.author}`;
      tipos[k] = (tipos[k] || 0) + 1;
      const l = (ejemplos[k] ||= []);
      if (l.length < 12) l.push(JSON.stringify(Object.fromEntries(Object.entries(m0).filter(([kk]) => !["content"].includes(kk)))).slice(0, 300) + " || " + String(m0.content || "").slice(0, 90));
    }
    return NextResponse.json({ total: (p.conversations || []).length, tipos, campos, metaCampos, ejemplos, metaEjemplo: JSON.stringify(p.conversations?.[0]?.meta || {}).slice(0, 1500) });
  }
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
    if (q._meta === "raw") {
      // Ruta libre relativa a la cuenta publicitaria, p. ej. p=insights?fields=spend
      const u = new URL(`https://graph.facebook.com/v26.0/act_${cta}/${q.p || ""}`);
      u.searchParams.set("access_token", tk);
      const r = await fetch(u, { cache: "no-store" });
      const j = await r.json().catch(() => ({}));
      return NextResponse.json(j.error ? { error: `${j.error.code}/${j.error.error_subcode || ""}: ${j.error.message}` } : { ok: true, filas: j.data?.length, muestra: JSON.stringify(j.data?.[0] || {}).slice(0, 400), acciones: Object.fromEntries(((j.data?.[0]?.actions || []) as { action_type: string; value: string }[]).map((x) => [x.action_type, x.value])) });
    }
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

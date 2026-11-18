import { NextResponse } from "next/server";

// Recibe el formulario propio del quiz (public/fcd-quiz.js) y envía un correo
// con los datos de contacto y todas las respuestas.
//
// Variables de entorno (Vercel → Settings → Environment Variables):
//   RESEND_API_KEY   clave de https://resend.com (obligatoria)
//   LEAD_EMAIL_TO    correo donde llegan las leads (opcional; por defecto fitcondamian@gmail.com;
//                    varios separados por comas)
//   LEAD_EMAIL_FROM  remitente (opcional). Sin dominio verificado en Resend usa
//                    «onboarding@resend.dev», que solo puede enviar al correo de la cuenta de Resend.
//   GHL_WEBHOOK_URL  (opcional) webhook de entrada de un workflow de GoHighLevel:
//                    si existe, también se le envía la lead para que salte la automatización.
//
// Si falta la configuración o falla el envío, la lead queda registrada en los
// logs de Vercel (Deployments → Logs, busca «quiz-lead») y la usuaria ve su
// plan igualmente. GET devuelve { ready } para saber si el correo está activo.

export const dynamic = "force-dynamic";

const ORIGENES = /^https:\/\/([a-z0-9-]+\.)*fitcondamian\.com$|^http:\/\/localhost(:\d+)?$/;

function cors(req: Request) {
  const o = req.headers.get("origin") ?? "";
  const h: Record<string, string> = { Vary: "Origin" };
  if (ORIGENES.test(o)) {
    h["Access-Control-Allow-Origin"] = o;
    h["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
    h["Access-Control-Allow-Headers"] = "Content-Type";
  }
  return h;
}

const DESTINO = process.env.LEAD_EMAIL_TO || "fitcondamian@gmail.com";

function listo() {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204, headers: cors(req) });
}

export async function GET(req: Request) {
  return NextResponse.json({ ready: listo() }, { headers: { ...cors(req), "Cache-Control": "no-store" } });
}

type Respuesta = { q: string; a: string };
type Lead = {
  nombre: string;
  email: string;
  telefono: string;
  respuestas: Respuesta[];
  diagnostico?: { media?: number; freno?: string; areas?: { n: string; v: number }[] };
  plan?: string; // plan ya redactado, listo para enviar por WhatsApp
  pagina?: string;
  utm?: Record<string, string>;
  web?: string; // trampa para bots: debe llegar vacío
};

const txt = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function validar(b: unknown): Lead | null {
  if (!b || typeof b !== "object") return null;
  const o = b as Record<string, unknown>;
  const nombre = txt(o.nombre, 80);
  const email = txt(o.email, 160).toLowerCase();
  const telefono = txt(o.telefono, 24).replace(/[^\d+]/g, "");
  if (!nombre || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || !/^\+\d{7,15}$/.test(telefono)) return null;
  const respuestas = Array.isArray(o.respuestas)
    ? o.respuestas.slice(0, 20).map((r) => ({ q: txt((r as Respuesta)?.q, 200), a: txt((r as Respuesta)?.a, 600) })).filter((r) => r.q)
    : [];
  const d = (o.diagnostico ?? {}) as Record<string, unknown>;
  const areas = Array.isArray(d.areas) ? d.areas.slice(0, 8).map((x) => ({ n: txt((x as { n: string }).n, 40), v: Number((x as { v: number }).v) || 0 })) : [];
  const utm: Record<string, string> = {};
  if (o.utm && typeof o.utm === "object") {
    for (const [k, v] of Object.entries(o.utm as Record<string, unknown>).slice(0, 10)) utm[txt(k, 30)] = txt(v, 200);
  }
  return {
    nombre, email, telefono, respuestas,
    diagnostico: { media: Number(d.media) || 0, freno: txt(d.freno, 40), areas },
    plan: txt(o.plan, 6000), pagina: txt(o.pagina, 300), utm, web: txt(o.web, 100),
  };
}

function correo(l: Lead) {
  const wa = l.telefono.replace(/\D/g, "");
  const fila = (k: string, v: string) =>
    `<tr><td style="padding:8px 12px;border-bottom:1px solid #e6edf2;color:#5a6f7d;vertical-align:top;width:38%">${esc(k)}</td><td style="padding:8px 12px;border-bottom:1px solid #e6edf2;color:#0f2230;white-space:pre-wrap">${esc(v)}</td></tr>`;
  const areas = (l.diagnostico?.areas ?? []).map((a) => `${a.n}: ${a.v}/100`).join(" · ");
  const utm = Object.entries(l.utm ?? {}).map(([k, v]) => `${k}=${v}`).join(" · ");
  const html = `<!doctype html><html><body style="margin:0;background:#f3f6f8;font-family:-apple-system,Segoe UI,Roboto,sans-serif">
<div style="max-width:640px;margin:0 auto;padding:24px 16px">
<h1 style="font-size:20px;color:#0f2230;margin:0 0 4px">Nueva lead del quiz · ${esc(l.nombre)}</h1>
<p style="color:#5a6f7d;margin:0 0 16px">Mayor freno: <b>${esc(l.diagnostico?.freno || "—")}</b> · Puntuación ${l.diagnostico?.media ?? "—"}/100</p>
<p style="margin:0 0 18px">${l.plan ? `<a href="https://wa.me/${wa}?text=${encodeURIComponent(l.plan)}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;font-weight:700;padding:10px 16px;border-radius:8px;margin:0 8px 8px 0">Enviarle el plan por WhatsApp</a>` : ""}<a href="https://wa.me/${wa}" style="display:inline-block;background:#343337;color:#fff;text-decoration:none;font-weight:700;padding:10px 16px;border-radius:8px">Abrir chat vacío</a></p>
<h2 style="font-size:15px;color:#0f2230;margin:0 0 6px">Contacto</h2>
<table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;font-size:14px;margin-bottom:18px">
${fila("Nombre", l.nombre)}${fila("Email", l.email)}${fila("WhatsApp", l.telefono)}
</table>
<h2 style="font-size:15px;color:#0f2230;margin:0 0 6px">Respuestas</h2>
<table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;font-size:14px;margin-bottom:18px">
${l.respuestas.map((r) => fila(r.q, r.a || "—")).join("")}
</table>
${l.plan ? `<h2 style="font-size:15px;color:#0f2230;margin:0 0 6px">Su plan (para enviárselo por WhatsApp)</h2>
<div style="background:#fff;border-radius:8px;font-size:14px;line-height:1.55;color:#0f2230;padding:14px;margin-bottom:18px;white-space:pre-wrap">${esc(l.plan)}</div>` : ""}
<h2 style="font-size:15px;color:#0f2230;margin:0 0 6px">Diagnóstico</h2>
<table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;font-size:14px;margin-bottom:18px">
${fila("Áreas", areas || "—")}${fila("Página", l.pagina || "—")}${utm ? fila("Campaña (UTM)", utm) : ""}
</table>
</div></body></html>`;
  const text = [
    `Nueva lead del quiz: ${l.nombre}`, `Email: ${l.email}`, `WhatsApp: ${l.telefono} (https://wa.me/${wa})`,
    `Mayor freno: ${l.diagnostico?.freno || "—"} · Puntuación ${l.diagnostico?.media ?? "—"}/100`, areas, "",
    ...l.respuestas.map((r) => `${r.q}\n→ ${r.a || "—"}\n`), l.plan ? `--- Su plan ---\n${l.plan}\n` : "", utm ? `UTM: ${utm}` : "", `Página: ${l.pagina || "—"}`,
  ].join("\n");
  return { html, text };
}

export async function POST(req: Request) {
  const h = cors(req);
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "json" }, { status: 400, headers: h }); }
  const l = validar(body);
  if (!l) return NextResponse.json({ ok: false, error: "datos" }, { status: 400, headers: h });
  if (l.web) return NextResponse.json({ ok: true }, { headers: h }); // bot: se ignora en silencio

  // Copia de seguridad en los logs de Vercel por si el correo no llega.
  const copia = () => console.warn("quiz-lead SIN CORREO", JSON.stringify({ nombre: l.nombre, email: l.email, telefono: l.telefono, freno: l.diagnostico?.freno, respuestas: l.respuestas, utm: l.utm }));

  if (!listo()) {
    copia();
    return NextResponse.json({ ok: true, correo: false }, { headers: h });
  }

  const { html, text } = correo(l);
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.LEAD_EMAIL_FROM || "Quiz Método RHS <onboarding@resend.dev>",
      to: DESTINO.split(",").map((s) => s.trim()).filter(Boolean),
      reply_to: l.email,
      subject: `Nueva lead del quiz: ${l.nombre} · freno: ${l.diagnostico?.freno || "—"}`,
      html, text,
    }),
  }).catch(() => null);

  // Opcional: también a GoHighLevel (webhook de entrada de un workflow).
  if (process.env.GHL_WEBHOOK_URL) {
    const respuestas = Object.fromEntries(l.respuestas.map((x) => [x.q, x.a]));
    await fetch(process.env.GHL_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ first_name: l.nombre, email: l.email, phone: l.telefono, source: "quiz", freno: l.diagnostico?.freno, puntuacion: l.diagnostico?.media, ...respuestas, ...l.utm }),
    }).catch(() => null);
  }

  if (!r || !r.ok) {
    console.error("quiz-lead: fallo al enviar el correo", r?.status, r ? await r.text().catch(() => "") : "sin respuesta");
    copia();
    return NextResponse.json({ ok: true, correo: false }, { headers: h });
  }
  return NextResponse.json({ ok: true, correo: true }, { headers: h });
}

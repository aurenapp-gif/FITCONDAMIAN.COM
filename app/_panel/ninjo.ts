// Cliente de la API de Ninjo (cortex-gateway). Entra con el usuario de Ninjo y pide un token temporal.
// Variables de entorno: NINJO_EMAIL y NINJO_PASSWORD (opcional NINJO_API_URL).

const BASE = process.env.NINJO_API_URL || "https://cortex-gateway.ninjoaiplatform.com";
export const AGENTE = "01a0c9dc-7bd0-703c-892f-392b73fbdd0e"; // Damián — Setter Instagram

let cache: { token: string; exp: number } | null = null;

export function ninjoListo(): boolean {
  return Boolean(process.env.NINJO_EMAIL && process.env.NINJO_PASSWORD);
}

async function token(): Promise<string> {
  if (cache && cache.exp - 120_000 > Date.now()) return cache.token;
  const r = await fetch(`${BASE}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: process.env.NINJO_EMAIL, password: process.env.NINJO_PASSWORD }),
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`Ninjo no acepta el usuario o la contraseña (${r.status})`);
  const { token } = (await r.json()) as { token: string };
  let exp = Date.now() + 20 * 60_000;
  try {
    const p = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8")) as { exp?: number };
    if (p.exp) exp = p.exp * 1000;
  } catch {}
  cache = { token, exp };
  return token;
}

type Opciones = { method?: "GET" | "POST"; query?: Record<string, string | number | boolean | undefined>; body?: unknown };

export async function ninjo<T = unknown>(ruta: string, { method = "GET", query, body }: Opciones = {}): Promise<T> {
  const url = new URL(ruta, BASE);
  for (const [k, v] of Object.entries(query || {})) if (v !== undefined) url.searchParams.set(k, String(v));
  for (let intento = 0; intento < 3; intento++) {
    const r = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${await token()}`, ...(body ? { "Content-Type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
    if (r.ok) return (await r.json()) as T;
    if (r.status === 401) cache = null;
    if (r.status >= 500 || r.status === 401 || r.status === 429) { await new Promise((s) => setTimeout(s, 800 * (intento + 1))); continue; }
    throw new Error(`Ninjo ${ruta} respondió ${r.status}: ${(await r.text()).slice(0, 200)}`);
  }
  throw new Error(`Ninjo ${ruta} no respondió tras 3 intentos`);
}

// Ejecuta tareas con un máximo de N a la vez.
export async function enParalelo<T, R>(items: T[], n: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) { const k = i++; out[k] = await fn(items[k]); }
  }));
  return out;
}

// Herramientas de Ninjo por su conexión MCP (la misma que usa Claude). Algunas opciones, como incluir las
// conversaciones sin agente, solo están ahí.
let mcpSesion: string | null = null;

async function mcpPost(cuerpo: unknown): Promise<{ texto: string; sesion: string | null }> {
  const r = await fetch(new URL("/mcp", BASE), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await token()}`,
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      ...(mcpSesion ? { "Mcp-Session-Id": mcpSesion } : {}),
    },
    body: JSON.stringify(cuerpo),
    cache: "no-store",
  });
  const texto = await r.text();
  if (!r.ok) throw new Error(`Ninjo MCP respondió ${r.status}: ${texto.slice(0, 200)}`);
  return { texto, sesion: r.headers.get("mcp-session-id") };
}

function leerRespuesta(texto: string): { result?: { content?: { type: string; text?: string }[]; isError?: boolean }; error?: { message: string } } {
  const t = texto.trim();
  if (t.startsWith("{")) return JSON.parse(t);
  const datos = t.split("\n").filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim()).filter(Boolean);
  return JSON.parse(datos[datos.length - 1] || "{}");
}

let mcpId = 1;
export async function ninjoHerramienta<T = unknown>(nombre: string, args: Record<string, unknown>): Promise<T> {
  if (!mcpSesion) {
    const ini = await mcpPost({ jsonrpc: "2.0", id: mcpId++, method: "initialize", params: { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "panel-fcd", version: "1.0" } } });
    mcpSesion = ini.sesion;
    await mcpPost({ jsonrpc: "2.0", method: "notifications/initialized" }).catch(() => null);
  }
  const { texto } = await mcpPost({ jsonrpc: "2.0", id: mcpId++, method: "tools/call", params: { name: nombre, arguments: args } });
  const res = leerRespuesta(texto);
  if (res.error) throw new Error(`Ninjo ${nombre}: ${res.error.message}`);
  const txt = (res.result?.content || []).filter((c) => c.type === "text").map((c) => c.text || "").join("");
  if (res.result?.isError) throw new Error(`Ninjo ${nombre}: ${txt.slice(0, 200)}`);
  return JSON.parse(txt) as T;
}

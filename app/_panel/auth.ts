// Sesión del panel privado: una cookie firmada con HMAC (Web Crypto, vale para middleware y rutas).
// Variables de entorno: PANEL_PASSWORD (contraseña de acceso). Opcional: PANEL_SYNC_TOKEN, clave aparte para
// la sincronización; si no existe, la sincronización usa la misma contraseña.

export const COOKIE = "fcd_panel";
export const DURACION_S = 60 * 60 * 24 * 30; // 30 días

const enc = new TextEncoder();

function secreto(): string | null {
  const p = process.env.PANEL_PASSWORD;
  if (!p) return null;
  // Cambiar la contraseña invalida todas las sesiones abiertas.
  return `fcd-panel::${p}::${process.env.PANEL_SYNC_TOKEN || ""}`;
}

async function firmar(texto: string, clave: string): Promise<string> {
  const k = await crypto.subtle.importKey("raw", enc.encode(clave), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", k, enc.encode(texto));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function iguales(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export async function crearSesion(): Promise<string | null> {
  const s = secreto();
  if (!s) return null;
  const exp = Math.floor(Date.now() / 1000) + DURACION_S;
  return `${exp}.${await firmar(String(exp), s)}`;
}

export async function sesionValida(valor: string | undefined): Promise<boolean> {
  const s = secreto();
  if (!s || !valor) return false;
  const [exp, sig] = valor.split(".");
  if (!exp || !sig || !/^\d+$/.test(exp) || Number(exp) < Date.now() / 1000) return false;
  return iguales(sig, await firmar(exp, s));
}

export function contrasenaCorrecta(intento: string): boolean {
  const p = process.env.PANEL_PASSWORD;
  return Boolean(p) && iguales(intento, p as string);
}

export function tokenSyncCorrecto(cabecera: string | null): boolean {
  const t = process.env.PANEL_SYNC_TOKEN || process.env.PANEL_PASSWORD;
  if (!t || !cabecera) return false;
  const m = cabecera.match(/^Bearer\s+(.+)$/i);
  return Boolean(m) && iguales(m![1].trim(), t);
}

// Clave de las tareas programadas (CRON_SECRET): en "Authorization: Bearer" (como la manda Vercel) o en "x-cron-secret".
export function cronCorrecto(req: Request): boolean {
  const t = process.env.CRON_SECRET;
  if (!t) return false;
  return iguales(req.headers.get("authorization") || "", `Bearer ${t}`) || iguales(req.headers.get("x-cron-secret") || "", t);
}

import { NextResponse } from "next/server";
import { COOKIE, DURACION_S, contrasenaCorrecta, crearSesion } from "../../../_panel/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let clave = "";
  try {
    clave = String(((await req.json()) as { clave?: unknown }).clave ?? "");
  } catch {}
  if (!process.env.PANEL_PASSWORD) {
    return NextResponse.json({ error: "El panel aún no tiene contraseña configurada en Vercel." }, { status: 503 });
  }
  if (!contrasenaCorrecta(clave)) {
    await new Promise((r) => setTimeout(r, 900)); // frena los intentos a lo bruto
    return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, (await crearSesion()) as string, {
    httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: DURACION_S,
  });
  return res;
}

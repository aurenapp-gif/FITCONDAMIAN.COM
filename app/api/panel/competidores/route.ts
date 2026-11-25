import { NextResponse } from "next/server";
import { guardar, leer, marcarSync } from "../../../_panel/store";

// Cuentas de Instagram del sector que se estudian cada noche (solo con sesión del panel).
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ cuentas: await leer<string[]>("competidores", []) });
}

export async function POST(req: Request) {
  let c: { cuentas?: unknown };
  try { c = await req.json(); } catch { return NextResponse.json({ error: "JSON no válido" }, { status: 400 }); }
  const cuentas = Array.from(new Set((Array.isArray(c.cuentas) ? c.cuentas : [])
    .map((x) => String(x).trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/^@/, "").replace(/[/?#].*$/, "").toLowerCase())
    .filter((x) => /^[a-z0-9._]{1,30}$/.test(x)))).slice(0, 15);
  await guardar("competidores", cuentas);
  // Fuerza que la próxima actualización lea ya las cuentas nuevas.
  const meta = await leer<Record<string, string>>("meta", {});
  delete meta.competencia;
  await guardar("meta", meta);
  await marcarSync("competidores");
  return NextResponse.json({ ok: true, cuentas });
}

import { NextResponse } from "next/server";
import { guardar, marcarSync } from "../../../_panel/store";

// Comisión (%) por método de cobro, para los cobros que no traen la comisión exacta (solo con sesión).
// POST { "Sequra": 6, "PayPal": 3.4, "hotmart": 9.9, ... }
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let c: Record<string, unknown>;
  try { c = await req.json(); } catch { return NextResponse.json({ error: "JSON no válido" }, { status: 400 }); }
  const limpio: Record<string, number> = {};
  for (const [k, v] of Object.entries(c || {}).slice(0, 30)) {
    const n = Number(String(v).replace(",", "."));
    if (k.length <= 40 && Number.isFinite(n) && n >= 0 && n <= 60) limpio[k] = Math.round(n * 100) / 100;
  }
  await guardar("comisiones", limpio); await marcarSync("comisiones");
  return NextResponse.json({ ok: true, comisiones: limpio });
}

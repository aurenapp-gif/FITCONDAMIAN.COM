import { NextResponse } from "next/server";
import { guardar, leer, marcarSync } from "../../../_panel/store";

// Cobros de Hotmart o Stripe que no deben contar en la contabilidad del panel (solo con sesión).
// POST { id, excluir: true|false, motivo? }
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let c: { id?: unknown; excluir?: unknown; motivo?: unknown };
  try { c = await req.json(); } catch { return NextResponse.json({ error: "JSON no válido" }, { status: 400 }); }
  const id = String(c.id || "").slice(0, 120);
  if (!/^(hotmart|stripe):/.test(id)) return NextResponse.json({ error: "Solo se pueden quitar cobros de Hotmart o Stripe; las ventas manuales se borran" }, { status: 400 });
  const lista = await leer<Record<string, { fecha: string; motivo?: string }>>("ventas_excluidas", {});
  if (c.excluir === false) delete lista[id];
  else lista[id] = { fecha: new Date().toISOString(), motivo: String(c.motivo || "").slice(0, 200) || undefined };
  await guardar("ventas_excluidas", lista); await marcarSync("ventas_excluidas");
  return NextResponse.json({ ok: true, excluidas: Object.keys(lista).length });
}

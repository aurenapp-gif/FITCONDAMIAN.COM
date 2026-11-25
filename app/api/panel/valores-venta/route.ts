import { NextResponse } from "next/server";
import { guardar, leer, marcarSync } from "../../../_panel/store";

// Valor total de una venta (lo facturado), por clienta (correo o id del cobro). Solo con sesión del panel.
// POST { clave, valor } — valor null o vacío borra el valor y se vuelve al cálculo automático.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let c: { clave?: unknown; valor?: unknown };
  try { c = await req.json(); } catch { return NextResponse.json({ error: "JSON no válido" }, { status: 400 }); }
  const clave = String(c.clave || "").trim().toLowerCase().slice(0, 200);
  if (!clave) return NextResponse.json({ error: "Falta la clienta" }, { status: 400 });
  const valores = await leer<Record<string, number>>("valores_venta", {});
  const v = c.valor === null || c.valor === "" || c.valor === undefined ? null : Number(String(c.valor).replace(",", "."));
  if (v === null) delete valores[clave];
  else if (!Number.isFinite(v) || v < 0 || v > 1e6) return NextResponse.json({ error: "Importe no válido" }, { status: 400 });
  else valores[clave] = Math.round(v * 100) / 100;
  await guardar("valores_venta", valores);
  await marcarSync("valores_venta");
  return NextResponse.json({ ok: true, clave, valor: valores[clave] ?? null });
}

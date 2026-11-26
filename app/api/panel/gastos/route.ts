import { NextResponse } from "next/server";
import { guardar, leer, marcarSync } from "../../../_panel/store";

// Gastos del negocio que se editan desde el panel (solo con sesión).
// POST { id?, concepto, categoria, importe, tipo: "mensual"|"puntual", fecha?, desde?, hasta?, captacion } crea o actualiza.
// DELETE ?id=… borra.
export const dynamic = "force-dynamic";

export type Gasto = { id: string; concepto: string; categoria: string; importe: number; tipo: "mensual" | "puntual"; fecha?: string; desde?: string; hasta?: string; captacion: boolean; nota?: string };
const dia = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined);

export async function GET() {
  return NextResponse.json({ gastos: await leer<Gasto[]>("gastos", []) });
}

export async function POST(req: Request) {
  let c: Record<string, unknown>;
  try { c = await req.json(); } catch { return NextResponse.json({ error: "JSON no válido" }, { status: 400 }); }
  const importe = Number(String(c.importe ?? "").replace(",", "."));
  const concepto = String(c.concepto || "").trim().slice(0, 120);
  const tipo = c.tipo === "puntual" ? "puntual" : "mensual";
  if (!concepto) return NextResponse.json({ error: "Falta el concepto" }, { status: 400 });
  if (!Number.isFinite(importe) || importe < 0 || importe > 1e7) return NextResponse.json({ error: "Importe no válido" }, { status: 400 });
  const g: Gasto = {
    id: typeof c.id === "string" && c.id ? c.id.slice(0, 60) : `g_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    concepto, categoria: String(c.categoria || "Otros").slice(0, 60), importe: Math.round(importe * 100) / 100, tipo,
    captacion: Boolean(c.captacion), nota: String(c.nota || "").slice(0, 300) || undefined,
  };
  if (tipo === "puntual") { g.fecha = dia(c.fecha); if (!g.fecha) return NextResponse.json({ error: "Falta la fecha del gasto" }, { status: 400 }); }
  else { g.desde = dia(c.desde); g.hasta = dia(c.hasta); if (!g.desde) return NextResponse.json({ error: "Falta desde cuándo se paga" }, { status: 400 }); }
  const lista = await leer<Gasto[]>("gastos", []);
  const i = lista.findIndex((x) => x.id === g.id);
  if (i >= 0) lista[i] = g; else lista.push(g);
  await guardar("gastos", lista); await marcarSync("gastos");
  return NextResponse.json({ ok: true, gasto: g });
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id") || "";
  const lista = await leer<Gasto[]>("gastos", []);
  await guardar("gastos", lista.filter((x) => x.id !== id)); await marcarSync("gastos");
  return NextResponse.json({ ok: true });
}

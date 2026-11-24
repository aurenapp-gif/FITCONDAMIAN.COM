import { NextResponse } from "next/server";
import { almacenListo, guardar, leer } from "../../../_panel/store";

// Guarda lo que se marca a mano en el panel: si vino a la llamada, si compró y el importe.
// Protegida por la sesión del panel (middleware).

export const dynamic = "force-dynamic";

type Resultado = { asistio: "" | "si" | "no"; vendido: "" | "si" | "no"; importe: number | null; actualizado: string };

export async function POST(req: Request) {
  if (!almacenListo()) return NextResponse.json({ error: "Falta conectar el almacenamiento." }, { status: 503 });
  let b: Partial<Resultado> & { id?: string };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON no válido" }, { status: 400 });
  }
  if (!b.id || !/^[A-Za-z0-9-]{8,64}$/.test(b.id)) return NextResponse.json({ error: "Llamada no válida" }, { status: 400 });
  const sn = (v: unknown) => (v === "si" || v === "no" ? v : "");
  const todos = await leer<Record<string, Resultado>>("resultados", {});
  const r: Resultado = {
    asistio: sn(b.asistio),
    vendido: sn(b.vendido),
    importe: typeof b.importe === "number" && Number.isFinite(b.importe) && b.importe >= 0 ? Math.round(b.importe) : null,
    actualizado: new Date().toISOString(),
  };
  if (r.asistio !== "si") { r.vendido = ""; r.importe = null; }
  if (r.vendido !== "si") r.importe = null;
  todos[b.id] = r;
  await guardar("resultados", todos);
  return NextResponse.json({ ok: true, resultado: r });
}

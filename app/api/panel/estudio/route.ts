import { NextResponse } from "next/server";
import { cronCorrecto, estudioCorrecto } from "../../../_panel/auth";
import { almacenListo, guardar, leer, marcarSync } from "../../../_panel/store";

// Guarda el estudio nocturno del analista (lo muestra la pestaña "Estudio" del panel). Se conservan los 60 últimos.
export const dynamic = "force-dynamic";

type Item = { titulo: string; etiqueta?: string; texto?: string; bloque?: string; medir?: string };
type Seccion = { id?: string; titulo: string; intro?: string; items: Item[] };
const txt = (v: unknown, max = 8000) => (typeof v === "string" ? v.slice(0, max) : undefined);

export async function POST(req: Request) {
  if (!cronCorrecto(req) && !(await estudioCorrecto(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!almacenListo()) return NextResponse.json({ error: "Falta el almacén" }, { status: 503 });
  let c: Record<string, unknown>;
  try { c = await req.json(); } catch { return NextResponse.json({ error: "JSON no válido" }, { status: 400 }); }
  if (!Array.isArray(c.secciones) || !c.secciones.length || !txt(c.titular)) return NextResponse.json({ error: "Faltan titular o secciones" }, { status: 400 });
  const secciones: Seccion[] = (c.secciones as Record<string, unknown>[]).slice(0, 12).map((s) => ({
    id: txt(s.id, 40), titulo: txt(s.titulo, 200) || "", intro: txt(s.intro, 3000),
    items: (Array.isArray(s.items) ? s.items : []).slice(0, 20).map((i: Record<string, unknown>) => ({ titulo: txt(i.titulo, 300) || "", etiqueta: txt(i.etiqueta, 60), texto: txt(i.texto), bloque: txt(i.bloque), medir: txt(i.medir, 1500) })),
  }));
  const cu = (c.cuello && typeof c.cuello === "object" ? c.cuello : {}) as Record<string, unknown>;
  const estudio = {
    id: new Date().toISOString(), fecha: txt(c.fecha, 10) || new Date().toISOString().slice(0, 10), titular: txt(c.titular, 400),
    cuello: { paso: txt(cu.paso, 200), tasa: Number(cu.tasa) || null, objetivo: Number(cu.objetivo) || null, detalle: txt(cu.detalle, 3000) },
    secciones, fuentes: (Array.isArray(c.fuentes) ? c.fuentes : []).slice(0, 30).map((f) => txt(f, 400)).filter(Boolean),
  };
  const lista = await leer<Record<string, unknown>[]>("estudios", []);
  lista.unshift(estudio);
  await guardar("estudios", lista.slice(0, 60));
  await marcarSync("estudios");
  return NextResponse.json({ ok: true, id: estudio.id, secciones: secciones.length });
}

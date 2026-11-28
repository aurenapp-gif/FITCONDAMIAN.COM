import { NextResponse } from "next/server";
import { almacenListo, guardar, leer } from "../../../_panel/store";

// Ventas apuntadas a mano (transferencia, Bizum, efectivo…). Protegida por la sesión del panel (middleware).
export const dynamic = "force-dynamic";

export type VentaManual = {
  id: string; fuente: "manual"; fecha: string; estado: "PAID"; importe: number; neto?: number; moneda: "EUR";
  producto: string; email: string; nombre: string; metodo: string; agendaId: string; nota: string; creada: string;
};

const texto = (v: unknown, max = 200) => String(v ?? "").trim().slice(0, max);

export async function POST(req: Request) {
  if (!almacenListo()) return NextResponse.json({ error: "Falta conectar el almacenamiento." }, { status: 503 });
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return NextResponse.json({ error: "Datos no válidos" }, { status: 400 }); }
  const importe = Number(b.importe);
  const fecha = texto(b.fecha, 10);
  if (!Number.isFinite(importe) || importe <= 0) return NextResponse.json({ error: "Pon un importe mayor que 0." }, { status: 400 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return NextResponse.json({ error: "Pon la fecha de la venta." }, { status: 400 });
  const netoNum = b.neto === "" || b.neto == null ? NaN : Number(String(b.neto).replace(",", "."));
  if (Number.isFinite(netoNum) && (netoNum < 0 || netoNum > importe)) return NextResponse.json({ error: "Lo que te llega no puede ser mayor que lo vendido." }, { status: 400 });
  const venta: VentaManual = {
    id: `manual:${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, fuente: "manual",
    fecha: `${fecha}T12:00:00.000Z`, estado: "PAID", importe: Math.round(importe * 100) / 100, moneda: "EUR",
    producto: texto(b.producto) || "Venta manual", email: texto(b.email).toLowerCase(), nombre: texto(b.nombre),
    ...(Number.isFinite(netoNum) ? { neto: Math.round(netoNum * 100) / 100 } : {}),
    metodo: texto(b.metodo, 40) || "Transferencia", agendaId: texto(b.agendaId, 64), nota: texto(b.nota, 500), creada: new Date().toISOString(),
  };
  const todas = await leer<VentaManual[]>("ventas_manuales", []);
  todas.push(venta);
  await guardar("ventas_manuales", todas);
  return NextResponse.json({ ok: true, venta });
}

export async function DELETE(req: Request) {
  if (!almacenListo()) return NextResponse.json({ error: "Falta conectar el almacenamiento." }, { status: 503 });
  const id = new URL(req.url).searchParams.get("id") || "";
  const todas = await leer<VentaManual[]>("ventas_manuales", []);
  const quedan = todas.filter((v) => v.id !== id);
  if (quedan.length === todas.length) return NextResponse.json({ error: "No existe esa venta." }, { status: 404 });
  await guardar("ventas_manuales", quedan);
  return NextResponse.json({ ok: true });
}

// Corregir una venta manual ya apuntada: lo que te llega (neto) y el método de cobro.
export async function PATCH(req: Request) {
  if (!almacenListo()) return NextResponse.json({ error: "Falta conectar el almacenamiento." }, { status: 503 });
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return NextResponse.json({ error: "Datos no válidos" }, { status: 400 }); }
  const todas = await leer<VentaManual[]>("ventas_manuales", []);
  const v = todas.find((x) => x.id === String(b.id || ""));
  if (!v) return NextResponse.json({ error: "No existe esa venta." }, { status: 404 });
  if ("neto" in b) {
    if (b.neto === null || b.neto === "") delete v.neto;
    else {
      const n = Number(String(b.neto).replace(",", "."));
      if (!Number.isFinite(n) || n < 0 || n > v.importe) return NextResponse.json({ error: "Lo que te llega tiene que estar entre 0 y lo que pagó la clienta." }, { status: 400 });
      v.neto = Math.round(n * 100) / 100;
    }
  }
  if (typeof b.metodo === "string" && b.metodo.trim()) v.metodo = b.metodo.trim().slice(0, 40);
  await guardar("ventas_manuales", todas);
  return NextResponse.json({ ok: true, venta: v });
}

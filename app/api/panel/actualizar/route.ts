import { NextResponse } from "next/server";
import { ninjoListo } from "../../../_panel/ninjo";
import { ejecutar } from "../../../_panel/sincronizar";
import { almacenListo } from "../../../_panel/store";

// Botón "Actualizar ahora" del panel (protegido por la sesión). ?completo=1 recalcula también el embudo.
// También acepta la clave de sincronización (Bearer) para lanzarlo desde fuera.

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: Request) {
  if (!almacenListo() || !ninjoListo()) return NextResponse.json({ error: "Falta conectar Ninjo (NINJO_EMAIL y NINJO_PASSWORD en Vercel)." }, { status: 503 });
  const informe = await ejecutar("boton", new URL(req.url).searchParams.get("completo") === "1");
  return NextResponse.json(informe, { status: informe.ok ? 200 : 500 });
}

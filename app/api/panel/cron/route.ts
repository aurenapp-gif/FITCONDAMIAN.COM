import { NextResponse } from "next/server";
import { iguales } from "../../../_panel/auth";
import { ninjoListo } from "../../../_panel/ninjo";
import { ejecutar } from "../../../_panel/sincronizar";
import { almacenListo } from "../../../_panel/store";

// Tarea programada de Vercel (vercel.json → crons). Vercel la llama con "Authorization: Bearer <CRON_SECRET>".
// ?solo=rapida actualiza agendas, seguidores, publicaciones y orígenes; sin parámetro, también el embudo.

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(req: Request) {
  const secreto = process.env.CRON_SECRET;
  if (!secreto || !iguales(req.headers.get("authorization") || "", `Bearer ${secreto}`)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!almacenListo() || !ninjoListo()) return NextResponse.json({ error: "Falta configurar el almacén o el acceso a Ninjo" }, { status: 503 });
  const informe = await ejecutar("cron", new URL(req.url).searchParams.get("solo") !== "rapida");
  return NextResponse.json(informe, { status: informe.ok ? 200 : 500 });
}

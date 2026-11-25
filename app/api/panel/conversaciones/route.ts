import { NextResponse } from "next/server";
import { cronCorrecto, estudioCorrecto } from "../../../_panel/auth";
import { configuracionSetter, conversacionesParaEstudio } from "../../../_panel/sincronizar";

// Para el analista nocturno: conversaciones anonimizadas de un paso del embudo (?paso=responden|final|llegan&dias=14&n=30)
// o la configuración actual del setter (?setter=1). Solo lectura. Con CRON_SECRET o la clave del analista.
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(req: Request) {
  if (!cronCorrecto(req) && !(await estudioCorrecto(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const q = new URL(req.url).searchParams;
  try {
    if (q.get("setter")) return NextResponse.json(await configuracionSetter());
    const paso = (["responden", "final", "llegan"].includes(q.get("paso") || "") ? q.get("paso") : "final") as "responden" | "final" | "llegan";
    const dias = Math.min(60, Math.max(1, Number(q.get("dias")) || 14));
    const n = Math.min(60, Math.max(1, Number(q.get("n")) || 30));
    return NextResponse.json(await conversacionesParaEstudio(paso, dias, n));
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

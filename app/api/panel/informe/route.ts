import { NextResponse } from "next/server";
import { cronCorrecto, estudioCorrecto } from "../../../_panel/auth";
import { leer } from "../../../_panel/store";
import { estudioAperturas } from "../../../_panel/sincronizar";

// Informe compacto para el analista nocturno: todos los números del panel sin datos personales
// (ni nombres, ni correos, ni teléfonos). Solo con CRON_SECRET o la clave del analista.
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const OBJETIVOS = { responden: 15, final: 25, datos: 70, agendan: 60, vienen: 70, compran: 25 };
const COBRADAS = new Set(["APPROVED", "COMPLETE", "PAID"]);
const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" });
const sumar = (iso: string, n: number) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const r1 = (n: number) => Math.round(n * 100) / 100;
const pct = (a: number, b: number) => (b ? Math.round((1000 * a) / b) / 10 : null);

type Fila = Record<string, unknown> & { fecha: string };

export async function GET(req: Request) {
  if (!cronCorrecto(req) && !(await estudioCorrecto(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const hoy = fmt.format(new Date());
  const d30 = sumar(hoy, -30), d60 = sumar(hoy, -60), d90 = sumar(hoy, -90);
  const [embudo, agendas, resultados, ventas, manuales, anuncios, creativos, instagram, publicaciones, contenido, origenes, competencia, competidores, estudios, perfil, control] = await Promise.all([
    leer<Record<string, Fila>>("embudo", {}),
    leer<Record<string, string>[]>("agendas", []),
    leer<Record<string, { asistio?: string; vendido?: string; importe?: number | null }>>("resultados", {}),
    leer<Record<string, unknown>[]>("ventas", []),
    leer<Record<string, unknown>[]>("ventas_manuales", []),
    leer<{ filas?: { fecha: string; campana: string; conjunto: string; anuncio: string; anuncio_id: string; gasto: number; impresiones: number; alcance: number; clics: number }[] }>("anuncios", {}),
    leer<{ anuncios?: Record<string, Record<string, unknown>> }>("creativos", {}),
    leer<{ seguidores_dia?: Record<string, number>; medios?: Record<string, Record<string, number>> }>("instagram", {}),
    leer<{ id?: string; codigo: string; fecha: string; tipo: string; texto: string; enlace: string; likes: number; comentarios: number }[]>("publicaciones", []),
    leer<Record<string, { post: string; entran: number; conversan: number; final: number; datos: number }>>("contenido", {}),
    leer<Record<string, unknown>>("origenes", {}),
    leer<Record<string, unknown>>("competencia", {}),
    leer<string[]>("competidores", []),
    leer<Record<string, unknown>[]>("estudios", []),
    leer<Record<string, unknown> | null>("perfil", null),
    leer<Record<string, unknown> | null>("control", null),
  ]);

  // Embudo por día de entrada (sin listas de ids).
  const dias = Object.values(embudo).filter((d) => d.fecha >= d60).sort((a, b) => (a.fecha < b.fecha ? -1 : 1))
    .map((d) => Object.fromEntries(Object.entries(d).filter(([k]) => k !== "ids")));
  const suma = (filas: Record<string, unknown>[], k: string) => filas.reduce((t, f) => t + (Number(f[k]) || 0), 0);
  const ORS = ["bienvenida", "saludo", "historia", "leadmagnet", "comentario", "palabra", "mensaje"];
  const bloque = (desde: string) => {
    const f = dias.filter((d) => String(d.fecha) >= desde);
    const porOrigen = Object.fromEntries(ORS.map((o) => {
      const x = { entran: suma(f, `${o}_entran`), conversan: suma(f, `${o}_conversan`), final: suma(f, `${o}_final`), datos: suma(f, `${o}_datos`) };
      return [o, { ...x, tasa_responden: pct(x.conversan, x.entran), tasa_final: pct(x.final, x.conversan), tasa_datos: pct(x.datos, x.final) }];
    }));
    const tot = ["entran", "conversan", "final", "datos"].reduce((t, k) => ({ ...t, [k]: ORS.reduce((u, o) => u + suma(f, `${o}_${k}`), 0) }), {} as Record<string, number>);
    const aperturas = {
      bienvenidas: suma(f, "ap_b"), bienvenidas_resp: suma(f, "ap_b_resp"), a_seguidoras: suma(f, "ap_s"), a_seguidoras_resp: suma(f, "ap_s_resp"),
      otros: suma(f, "ap_o") + suma(f, "ap_h"), otros_resp: suma(f, "ap_o_resp") + suma(f, "ap_h_resp"), manuales_totales: suma(f, "ap_manual"),
    };
    return { desde, total: { ...tot, tasa_responden: pct(tot.conversan, tot.entran), tasa_final: pct(tot.final, tot.conversan), tasa_datos: pct(tot.datos, tot.final) }, por_origen: porOrigen, aperturas: { ...aperturas, tasa_bienvenida: pct(aperturas.bienvenidas_resp, aperturas.bienvenidas), tasa_seguidoras: pct(aperturas.a_seguidoras_resp, aperturas.a_seguidoras) } };
  };

  // Llamadas: estado, asistencia y cierre (marcados a mano o por venta enlazada).
  const excluidas = await leer<Record<string, unknown>>("ventas_excluidas", {});
  const cobradas = [...ventas, ...manuales].filter((v) => COBRADAS.has(String(v.estado).toUpperCase()) && !excluidas[String(v.id)]);
  const llamadas = agendas.filter((a) => String(a.fecha).slice(0, 10) >= d90).map((a) => {
    const r = resultados[a.id] || {};
    const em = String(a.email || "").toLowerCase();
    const t = new Date(a.fecha).getTime();
    const venta = cobradas.find((v) => v.agendaId === a.id) || (em ? cobradas.find((v) => v.email === em && new Date(String(v.fecha)).getTime() >= t - 2 * 864e5 && new Date(String(v.fecha)).getTime() <= t + 30 * 864e5) : undefined);
    const pasada = t < Date.now();
    const asistio = r.asistio || (venta ? "si" : a.estado === "SHOWED" ? "si" : a.estado === "NO_SHOW" ? "no" : "");
    const vendido = r.vendido || (venta ? "si" : "");
    return { contacto: a.contacto, fecha: a.fecha, reservada: a.reservada, estado: a.estado, origen: a.origen, setter: a.setter, pasada, asistio, vendido, importe: r.importe ?? (venta ? venta.importe : null) };
  });
  const resumenLlamadas = (desde: string) => {
    const l = llamadas.filter((x) => String(x.fecha).slice(0, 10) >= desde && x.estado !== "CANCELLED");
    const p = l.filter((x) => x.pasada);
    const si = p.filter((x) => x.asistio === "si").length, no = p.filter((x) => x.asistio === "no").length;
    const cerr = p.filter((x) => x.vendido === "si").length, nocerr = p.filter((x) => x.vendido === "no").length;
    return { agendadas: l.length, canceladas: llamadas.filter((x) => String(x.fecha).slice(0, 10) >= desde && x.estado === "CANCELLED").length, pasadas: p.length, vinieron: si, no_vinieron: no, sin_marcar: p.length - si - no, show_rate: pct(si, si + no), cerradas: cerr, no_cerradas: nocerr, cierre: pct(cerr, cerr + nocerr) };
  };

  const ventasDesde = (desde: string) => {
    const l = cobradas.filter((v) => String(v.fecha).slice(0, 10) >= desde);
    const total = l.reduce((t, v) => t + (Number(v.importe) || 0), 0);
    const clientas = new Set(l.map((v) => v.email || v.id)).size;
    const porProducto: Record<string, { cobros: number; importe: number }> = {};
    l.forEach((v) => { const k = String(v.producto || "—"); porProducto[k] = porProducto[k] || { cobros: 0, importe: 0 }; porProducto[k].cobros++; porProducto[k].importe += Number(v.importe) || 0; });
    return { nota: "cash_collect = todo lo cobrado en el periodo (incluye cuotas de clientas anteriores); la facturación de ventas nuevas se ve en el panel", cobros: l.length, clientas, cash_collect: Math.round(total), ticket_por_clienta: clientas ? Math.round(total / clientas) : null, por_producto: porProducto };
  };

  // Anuncios agregados por anuncio (7 y 30 días) con su texto.
  const filasAd = anuncios.filas || [];
  const porAnuncio = (desde: string) => {
    const m = new Map<string, { anuncio_id: string; anuncio: string; campana: string; conjunto: string; gasto: number; impresiones: number; alcance: number; clics: number; dias: number; primer_dia: string; ultimo_dia: string }>();
    filasAd.filter((f) => f.fecha >= desde).forEach((f) => {
      const a = m.get(f.anuncio_id) || { anuncio_id: f.anuncio_id, anuncio: f.anuncio, campana: f.campana, conjunto: f.conjunto, gasto: 0, impresiones: 0, alcance: 0, clics: 0, dias: 0, primer_dia: f.fecha, ultimo_dia: f.fecha };
      a.gasto += f.gasto; a.impresiones += f.impresiones; a.alcance += f.alcance; a.clics += f.clics; if (f.gasto > 0) a.dias++;
      if (f.fecha < a.primer_dia) a.primer_dia = f.fecha; if (f.fecha > a.ultimo_dia) a.ultimo_dia = f.fecha;
      m.set(f.anuncio_id, a);
    });
    return Array.from(m.values()).filter((a) => a.gasto > 0).sort((a, b) => b.gasto - a.gasto).map((a) => ({
      ...a, gasto: r1(a.gasto), ctr: pct(a.clics, a.impresiones), cpc: a.clics ? r1(a.gasto / a.clics) : null, cpm: a.impresiones ? r1((1000 * a.gasto) / a.impresiones) : null,
      creativo: creativos.anuncios?.[a.anuncio_id] || null,
    }));
  };
  const gastoDia: Record<string, number> = {};
  filasAd.filter((f) => f.fecha >= d60).forEach((f) => { gastoDia[f.fecha] = r1((gastoDia[f.fecha] || 0) + f.gasto); });

  // Contenido propio: estadísticas de Instagram + cuánta gente entra a hablar por cada publicación.
  const porPost = new Map<string, { entran: number; conversan: number; final: number; datos: number }>();
  Object.values(contenido).forEach((r) => { const t = porPost.get(r.post) || { entran: 0, conversan: 0, final: 0, datos: 0 }; t.entran += Number(r.entran) || 0; t.conversan += Number(r.conversan) || 0; t.final += Number(r.final) || 0; t.datos += Number(r.datos) || 0; porPost.set(r.post, t); });
  const posts = publicaciones.map((p) => ({ fecha: p.fecha, tipo: p.tipo, texto: String(p.texto || "").slice(0, 700), enlace: p.enlace, likes: p.likes, comentarios: p.comentarios, instagram: (p.id && instagram.medios?.[p.id]) || null, setter: porPost.get(p.codigo) || null }));

  // Con ?aperturas=1: estudio de los primeros mensajes (variantes, franja horaria, seguimientos y respuestas). Tarda ~1 min.
  let aperturas: unknown = undefined;
  if (new URL(req.url).searchParams.get("aperturas")) {
    try { aperturas = await estudioAperturas(30); } catch (e) { aperturas = { error: e instanceof Error ? e.message : String(e) }; }
  }
  const gastos = await leer<{ concepto: string; categoria: string; importe: number; tipo: string; fecha?: string; desde?: string; hasta?: string; captacion: boolean }[]>("gastos", []);
  return NextResponse.json({
    gastos_configurados: { nota: "Gastos fijos y puntuales que Damián introduce en el panel; 'mensual' se reparte por días; 'captacion' = cuenta en el coste por conversación/agenda/venta junto con Meta Ads.", lista: gastos },
    aperturas_detalle: aperturas,
    generado: new Date().toISOString(), hoy, objetivos_pct: OBJETIVOS,
    explicacion: {
      embudo: "Personas por día de su PRIMER mensaje de Instagram. entran → conversan (responden) → final (el setter llega a ofrecer la llamada) → datos (dan su correo). Orígenes: bienvenida = seguidora nueva a la que el setter da la bienvenida; saludo = seguidora existente a la que se escribe; historia = reaccionó a una historia y el setter le escribe; leadmagnet = comenta una palabra clave en una publicación; comentario = otro comentario; palabra = nos escribe por privado una palabra clave (QUIERO, INFO…); mensaje = nos escribe ella sin palabra clave.",
      aperturas: "Primeros mensajes del setter contados por plantilla: bienvenidas ('me has pillado con el móvil…'), a seguidoras ('te llevo viendo un tiempo…'), otros (consejo, vídeo de turnos, historias).",
      llamadas: "Llamadas de los últimos 90 días; asistio/vendido marcados a mano en el panel o por venta enlazada (mismo correo).",
      seguidores_dia: "Seguidores nuevos de Instagram por día (incluye orgánico y anuncios).",
    },
    perfil, mensajes_manuales_ninjo: control?.manuales_ninjo || null,
    embudo: { ultimos_7: bloque(sumar(hoy, -7)), ultimos_30: bloque(d30), mes_actual: bloque(`${hoy.slice(0, 8)}01`), por_dia: dias },
    llamadas: { ultimos_30: resumenLlamadas(d30), ultimos_90: resumenLlamadas(d90), lista: llamadas },
    ventas: { ultimos_30: ventasDesde(d30), ultimos_90: ventasDesde(d90) },
    anuncios: { ultimos_7: porAnuncio(sumar(hoy, -7)), ultimos_30: porAnuncio(d30), gasto_por_dia: gastoDia },
    instagram: { seguidores_dia: instagram.seguidores_dia || {}, publicaciones: posts },
    origenes_conversaciones: origenes,
    competencia: { cuentas_configuradas: competidores, ...competencia },
    estudios_anteriores: estudios.slice(0, 5).map((e) => ({ fecha: e.fecha, titular: e.titular, cuello: e.cuello, propuestas: (Array.isArray(e.secciones) ? e.secciones : []).flatMap((x: { titulo?: string; items?: { titulo?: string }[] }) => (x.items || []).map((i) => `${x.titulo}: ${i.titulo}`)) })),
  });
}

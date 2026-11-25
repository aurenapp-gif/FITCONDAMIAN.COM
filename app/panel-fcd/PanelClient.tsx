"use client";

import { useEffect, useMemo, useState } from "react";

// ---------- Tipos de los datos guardados ----------
type Origen = "bienvenida" | "saludo" | "comentario" | "mensaje";
type DiaEmbudo = { fecha: string; ids?: Partial<Record<Origen, string[]>> } & Record<string, unknown>;
type Agenda = { id: string; contacto: string; fecha: string; reservada: string; estado: string; nombre: string; instagram: string; telefono: string; setter: string };
type Resultado = { asistio: "" | "si" | "no"; vendido: "" | "si" | "no"; importe: number | null };
type Publicacion = { codigo: string; fecha: string; tipo: string; texto: string; enlace: string; likes: number; comentarios: number };
type FilaContenido = { post: string; fecha: string; entran: number; conversan: number; final: number; datos: number; ids?: string[] };
type FilaOrigen = { origen: string; conversaciones: number; agendas: number };

export type Datos = {
  embudo: Record<string, DiaEmbudo>;
  contenido: Record<string, FilaContenido>;
  seguidores: Record<string, { fecha: string; seguidores: number }>;
  agendas: Agenda[];
  perfil: { cuenta?: string; seguidores: number; publicaciones?: number } | null;
  publicaciones: Publicacion[];
  origenes: Record<string, FilaOrigen[]>;
  resultados: Record<string, Resultado>;
  meta: Record<string, string>;
  control: { manuales_ninjo?: Record<string, number>; leido?: string } | null;
};
export type Conexiones = { ninjo: boolean; ultimoError: string | null; meta: boolean; stripe: boolean };

const ORIGENES: [Origen, string][] = [
  ["bienvenida", "Seguidoras nuevas"],
  ["saludo", "Seguidoras de antes"],
  ["comentario", "Comentan un reel"],
  ["mensaje", "Nos escriben ellas"],
];
const COLOR_ORIGEN: Record<Origen, string> = { bienvenida: "#343337", saludo: "#b58fd6", comentario: "#e77fc5", mensaje: "#d9a441" };
const PERIODOS: (number | "mes")[] = ["mes", 7, 14, 30, 90];

// Objetivos orientativos de cada paso del embudo (en %). Sirven para señalar el cuello de botella.
const OBJETIVOS = { responden: 15, final: 25, datos: 70, agendan: 60, vienen: 70, compran: 25 };

const PESTANAS = [
  ["resumen", "Resumen"],
  ["embudo", "Embudo"],
  ["captacion", "Captación"],
  ["ventas", "Llamadas y ventas"],
  ["contenido", "Contenido"],
  ["fuentes", "Anuncios y conexiones"],
] as const;
type Pestana = (typeof PESTANAS)[number][0];

// ---------- Utilidades ----------
const fmtDia = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" });
const hoyMadrid = () => fmtDia.format(new Date());
const sumarDias = (iso: string, n: number) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const MESES_LARGOS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const ANIO_ACTUAL = new Date().getFullYear();
const dia = (iso: string) => { const s = String(iso).slice(0, 10); const y = Number(s.slice(0, 4)); return `${Number(s.slice(8, 10))} ${MESES[Number(s.slice(5, 7)) - 1]}${y && y !== ANIO_ACTUAL ? ` ${y}` : ""}`; };
const fechaHora = (iso: string) => `${dia(iso)} · ${String(iso).slice(11, 16)}`;
const int = (n: number | null | undefined) => (n == null || Number.isNaN(n) ? "—" : Math.round(n).toLocaleString("es-ES"));
const pct = (n: number | null | undefined) => (n == null ? "—" : `${n}%`);
const eur = (n: number | null | undefined) => (n == null ? "—" : `${Math.round(n).toLocaleString("es-ES")} €`);
const ratio = (a: number, b: number) => (b ? Math.round((100 * a) / b) : null);
const num = (v: unknown) => Number(v) || 0;
const hace = (iso?: string) => {
  if (!iso) return "nunca";
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "ahora mismo";
  if (min < 60) return `hace ${min} min`;
  if (min < 60 * 36) return `hace ${Math.round(min / 60)} h`;
  return `hace ${Math.round(min / 1440)} días`;
};
type Tono = "ok" | "warn" | "bad" | "neutro";
const tonoObjetivo = (v: number | null, objetivo: number): Tono => (v == null ? "neutro" : v >= objetivo ? "ok" : v >= objetivo * 0.7 ? "warn" : "bad");

// ---------- Piezas visuales ----------
function Spark({ valores, color = "var(--pn-ink)" }: { valores: number[]; color?: string }) {
  if (valores.length < 2 || valores.every((v) => v === 0)) return <div className="pn-spark pn-spark-vacia" />;
  const max = Math.max(...valores, 1);
  const pts = valores.map((v, i) => `${(i / (valores.length - 1)) * 100},${30 - (v / max) * 26 - 2}`);
  return (
    <svg className="pn-spark" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
      <polygon points={`0,30 ${pts.join(" ")} 100,30`} fill={color} opacity="0.12" />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}

function Kpi({ etiqueta, valor, pie, spark, tono = "neutro", destacado }: { etiqueta: string; valor: string; pie?: React.ReactNode; spark?: number[]; tono?: Tono; destacado?: boolean }) {
  return (
    <div className={`pn-kpi tono-${tono}${destacado ? " is-dest" : ""}`}>
      <div className="pn-kpi-top"><span className="pn-kpi-label">{etiqueta}</span>{tono !== "neutro" && <span className={`pn-dot tono-${tono}`} aria-hidden="true" />}</div>
      <span className="pn-kpi-valor">{valor}</span>
      {pie && <span className="pn-kpi-pie">{pie}</span>}
      {spark && <Spark valores={spark} />}
    </div>
  );
}

function Donut({ partes, centro, sub }: { partes: { etiqueta: string; valor: number; color: string }[]; centro: string; sub: string }) {
  const total = partes.reduce((t, p) => t + p.valor, 0);
  const R = 42, C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div className="pn-donut">
      <svg viewBox="0 0 100 100" role="img" aria-label={partes.map((p) => `${p.etiqueta}: ${p.valor}`).join(", ")}>
        <circle cx="50" cy="50" r={R} fill="none" stroke="var(--pn-track)" strokeWidth="12" />
        {total > 0 && partes.map((p) => {
          const largo = (p.valor / total) * C;
          const el = <circle key={p.etiqueta} cx="50" cy="50" r={R} fill="none" stroke={p.color} strokeWidth="12" strokeDasharray={`${largo} ${C - largo}`} strokeDashoffset={-acc} transform="rotate(-90 50 50)" />;
          acc += largo;
          return el;
        })}
        <text x="50" y="49" textAnchor="middle" className="pn-donut-c">{centro}</text>
        <text x="50" y="62" textAnchor="middle" className="pn-donut-s">{sub}</text>
      </svg>
      <ul className="pn-leyenda">
        {partes.map((p) => <li key={p.etiqueta}><i style={{ background: p.color }} />{p.etiqueta}<b>{int(p.valor)}</b></li>)}
      </ul>
    </div>
  );
}

type Serie = { clave: string; nombre: string; color: string };
function Barras({ filas, series, etiqueta, vacio, extra, alto = 190 }: { filas: ({ x: string } & Record<string, number | string>)[]; series: Serie[]; etiqueta: (x: string) => string; vacio: string; extra?: (f: Record<string, number | string>) => string; alto?: number }) {
  const [activo, setActivo] = useState<number | null>(null);
  const total = (f: Record<string, number | string>) => series.reduce((t, s) => t + num(f[s.clave]), 0);
  const max = Math.max(1, ...filas.map(total));
  if (!filas.length || filas.every((f) => total(f) === 0)) return <p className="pn-vacio">{vacio}</p>;
  const cada = Math.max(1, Math.ceil(filas.length / 10));
  const i = activo ?? filas.length - 1;
  return (
    <div className="pn-chart" onMouseLeave={() => setActivo(null)}>
      <div className="pn-tip" aria-live="polite">
        <b>{etiqueta(filas[i].x)}</b>
        {series.map((s) => <span key={s.clave}><i style={{ background: s.color }} />{s.nombre}: <b>{int(num(filas[i][s.clave]))}</b></span>)}
        {extra && <span>{extra(filas[i])}</span>}
      </div>
      <div className="pn-bars" style={{ height: alto }} role="img" aria-label={`Gráfico por días: ${series.map((s) => s.nombre).join(", ")}`}>
        {filas.map((f, k) => (
          <div key={f.x} className={`pn-col${k === i ? " is-on" : ""}`} onMouseEnter={() => setActivo(k)} onClick={() => setActivo(k)}>
            <div className="pn-stack" style={{ height: `${(100 * total(f)) / max}%` }}>
              {series.map((s) => num(f[s.clave]) > 0 && <div key={s.clave} style={{ flexGrow: num(f[s.clave]), background: s.color }} />)}
            </div>
            <span className="pn-xlab">{k % cada === 0 ? etiqueta(f.x) : ""}</span>
          </div>
        ))}
      </div>
      {series.length > 1 && <ul className="pn-leyenda pn-leyenda-h">{series.map((s) => <li key={s.clave}><i style={{ background: s.color }} />{s.nombre}</li>)}</ul>}
    </div>
  );
}

function SiNo({ valor, onCambio, desactivado, etiqueta }: { valor: string; onCambio: (v: "" | "si" | "no") => void; desactivado?: boolean; etiqueta: string }) {
  return (
    <span className="pn-seg" role="group" aria-label={etiqueta}>
      {(["si", "no"] as const).map((v) => (
        <button key={v} type="button" className={v} disabled={desactivado} aria-pressed={valor === v} onClick={() => onCambio(valor === v ? "" : v)}>
          {v === "si" ? "Sí" : "No"}
        </button>
      ))}
    </span>
  );
}

function Seccion({ titulo, sub, children, accion }: { titulo: string; sub?: string; children: React.ReactNode; accion?: React.ReactNode }) {
  return (
    <section className="pn-panel">
      <div className="pn-panel-head">
        <div><h2>{titulo}</h2>{sub && <p className="pn-sub">{sub}</p>}</div>
        {accion}
      </div>
      {children}
    </section>
  );
}

// ---------- Panel ----------
export default function PanelClient({ datos, almacen, conexiones }: { datos: Datos; almacen: boolean; conexiones: Conexiones }) {
  const [pestana, setPestana] = useState<Pestana>("resumen");
  const [periodo, setPeriodo] = useState<number | "mes">("mes");
  const [origen, setOrigen] = useState<"todas" | Origen>("todas");
  const [resultados, setResultados] = useState<Record<string, Resultado>>(datos.resultados || {});
  const [error, setError] = useState("");
  const [actualizando, setActualizando] = useState<"" | "rapida" | "completa">("");
  const [msgAct, setMsgAct] = useState("");

  useEffect(() => {
    const leer = () => { const h = window.location.hash.slice(1); if (PESTANAS.some(([k]) => k === h)) setPestana(h as Pestana); };
    leer();
    window.addEventListener("hashchange", leer);
    return () => window.removeEventListener("hashchange", leer);
  }, []);
  const irA = (p: Pestana) => { setPestana(p); history.replaceState(null, "", `#${p}`); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const hoy = hoyMadrid();
  const desde = periodo === "mes" ? `${hoy.slice(0, 8)}01` : sumarDias(hoy, -periodo);
  const dias = Math.max(1, Math.round((Date.parse(`${hoy}T12:00:00Z`) - Date.parse(`${desde}T12:00:00Z`)) / 864e5));
  const nombrePeriodo = periodo === "mes" ? `en ${MESES_LARGOS[Number(hoy.slice(5, 7)) - 1]}` : `en los últimos ${periodo} días`;

  // ----- Llamadas -----
  const llamadas = useMemo(() => {
    const ahora = Date.now();
    return datos.agendas
      .filter((a) => a.estado !== "CANCELLED" && String(a.fecha).slice(0, 10) >= desde)
      .map((a) => {
        const r = resultados[a.id];
        const asistio = r && (r.asistio === "si" || r.asistio === "no") ? r.asistio : a.estado === "SHOWED" ? "si" : a.estado === "NO_SHOW" ? "no" : "";
        const vendido = asistio === "si" && r && (r.vendido === "si" || r.vendido === "no") ? r.vendido : "";
        const importe = vendido === "si" && r && typeof r.importe === "number" ? r.importe : null;
        return { ...a, pasada: new Date(a.fecha).getTime() < ahora, asistio, vendido, importe };
      });
  }, [datos.agendas, resultados, desde]);

  const ventas = useMemo(() => {
    const reservadas = datos.agendas.filter((a) => String(a.reservada).slice(0, 10) >= desde);
    const pasadas = llamadas.filter((l) => l.pasada);
    const vinieron = pasadas.filter((l) => l.asistio === "si");
    const noVinieron = pasadas.filter((l) => l.asistio === "no").length;
    const cerradas = vinieron.filter((l) => l.vendido === "si");
    const noCerradas = vinieron.filter((l) => l.vendido === "no").length;
    const facturacion = cerradas.reduce((s, v) => s + (v.importe || 0), 0);
    const conImporte = cerradas.filter((v) => (v.importe || 0) > 0).length;
    return {
      reservadas: reservadas.filter((a) => a.estado !== "CANCELLED").length,
      canceladas: reservadas.filter((a) => a.estado === "CANCELLED").length,
      pasadas: pasadas.length, vinieron: vinieron.length, noVinieron, sinMarcar: pasadas.length - vinieron.length - noVinieron,
      show: ratio(vinieron.length, vinieron.length + noVinieron), noshow: ratio(noVinieron, vinieron.length + noVinieron),
      cerradas: cerradas.length, noCerradas, ventaSinMarcar: vinieron.length - cerradas.length - noCerradas,
      cierre: ratio(cerradas.length, cerradas.length + noCerradas), cierreSobreLlamadas: ratio(cerradas.length, vinieron.length),
      facturacion: Math.round(facturacion), ticket: conImporte ? Math.round(facturacion / conImporte) : null,
      proximas: llamadas.filter((l) => !l.pasada).length,
    };
  }, [datos.agendas, llamadas, desde]);

  // ----- Embudo por día de entrada -----
  const diasEmbudo = useMemo(() => Object.values(datos.embudo).filter((d) => d.fecha >= desde).sort((a, b) => (a.fecha < b.fecha ? -1 : 1)), [datos.embudo, desde]);

  const calcularEmbudo = useMemo(() => (ors: Origen[]) => {
    const suma = (k: string) => diasEmbudo.reduce((t, d) => t + ors.reduce((u, o) => u + num(d[`${o}_${k}`]), 0), 0);
    const ids = new Set<string>();
    diasEmbudo.forEach((d) => ors.forEach((o) => (d.ids?.[o] || []).forEach((x) => ids.add(x))));
    const agendaron = new Set(datos.agendas.filter((a) => a.estado !== "CANCELLED" && ids.has(a.contacto)).map((a) => a.contacto)).size;
    const vinieron = new Set(llamadas.filter((l) => l.asistio === "si" && ids.has(l.contacto)).map((l) => l.contacto)).size;
    const pag = llamadas.filter((l) => l.vendido === "si" && ids.has(l.contacto));
    return {
      entran: suma("entran"), conversan: suma("conversan"), final: suma("final"), datos: suma("datos"),
      agendan: agendaron, vienen: vinieron, pagan: new Set(pag.map((l) => l.contacto)).size,
      facturacion: Math.round(pag.reduce((s, l) => s + (l.importe || 0), 0)),
    };
  }, [diasEmbudo, datos.agendas, llamadas]);

  const e = useMemo(() => calcularEmbudo(origen === "todas" ? ORIGENES.map((o) => o[0]) : [origen]), [calcularEmbudo, origen]);

  const pasos = useMemo(() => {
    const lista = [
      { id: "responden", nombre: "Responden al primer mensaje", de: e.entran, a: e.conversan, obj: OBJETIVOS.responden },
      { id: "final", nombre: "Llegan al final de la conversación", de: e.conversan, a: e.final, obj: OBJETIVOS.final },
      { id: "datos", nombre: "Nos dan sus datos", de: e.final, a: e.datos, obj: OBJETIVOS.datos },
      { id: "agendan", nombre: "Agendan la llamada", de: e.datos, a: e.agendan, obj: OBJETIVOS.agendan },
      { id: "vienen", nombre: "Vienen a la llamada", de: e.agendan, a: e.vienen, obj: OBJETIVOS.vienen },
      { id: "compran", nombre: "Compran", de: e.vienen, a: e.pagan, obj: OBJETIVOS.compran },
    ];
    return lista.map((p) => { const tasa = ratio(p.a, p.de); return { ...p, tasa, tono: tonoObjetivo(tasa, p.obj), perdidas: Math.max(0, p.de - p.a), indice: tasa == null ? Infinity : tasa / p.obj }; });
  }, [e]);
  const cuello = useMemo(() => pasos.filter((p) => p.de >= 5 && p.tasa != null).sort((a, b) => a.indice - b.indice)[0] || null, [pasos]);

  const porOrigen = useMemo(() => ORIGENES.map(([o, n]) => ({ o, n, ...calcularEmbudo([o]) })), [calcularEmbudo]);

  // ----- Aperturas (bienvenidas y mensajes a seguidoras) -----
  const aperturas = useMemo(() => {
    const filas = diasEmbudo.map((d) => {
      const nuevo = d.ap_b !== undefined;
      return {
        fecha: d.fecha,
        b_env: num(nuevo ? d.ap_b : d.bienvenida_entran), b_resp: num(nuevo ? d.ap_b_resp : d.bienvenida_conversan),
        s_env: num(nuevo ? d.ap_s : d.saludo_entran), s_resp: num(nuevo ? d.ap_s_resp : d.saludo_conversan),
        o_env: num(d.ap_o) + num(d.ap_h), o_resp: num(d.ap_o_resp) + num(d.ap_h_resp),
        manual: d.ap_manual === undefined ? null : num(d.ap_manual),
        entran: ORIGENES.reduce((t, [o]) => t + num(d[`${o}_entran`]), 0),
        conversan: ORIGENES.reduce((t, [o]) => t + num(d[`${o}_conversan`]), 0),
      };
    });
    const tot = filas.reduce((t, f) => ({ b_env: t.b_env + f.b_env, b_resp: t.b_resp + f.b_resp, s_env: t.s_env + f.s_env, s_resp: t.s_resp + f.s_resp, o_env: t.o_env + f.o_env, o_resp: t.o_resp + f.o_resp, manual: t.manual + (f.manual || 0) }), { b_env: 0, b_resp: 0, s_env: 0, s_resp: 0, o_env: 0, o_resp: 0, manual: 0 });
    return { filas, tot, n: filas.length };
  }, [diasEmbudo]);
  const aperturasEnviadas = aperturas.tot.b_env + aperturas.tot.s_env + aperturas.tot.o_env;
  const aperturasResp = aperturas.tot.b_resp + aperturas.tot.s_resp + aperturas.tot.o_resp;
  const tasaContestacion = ratio(aperturasResp, aperturasEnviadas);

  // ----- Series diarias para mini-gráficos -----
  const serieDias = useMemo(() => { const out: string[] = []; for (let d = desde; d <= hoy; d = sumarDias(d, 1)) out.push(d); return out; }, [desde, hoy]);
  const porDia = (fn: (d: string) => number) => serieDias.map(fn);
  const embPorFecha = useMemo(() => new Map(aperturas.filas.map((f) => [f.fecha, f])), [aperturas.filas]);
  const sparkEntran = porDia((d) => embPorFecha.get(d)?.entran || 0);
  const sparkResp = porDia((d) => { const f = embPorFecha.get(d); return f ? ratio(f.b_resp + f.s_resp + f.o_resp, f.b_env + f.s_env + f.o_env) || 0 : 0; });
  const sparkAgendas = porDia((d) => datos.agendas.filter((a) => a.estado !== "CANCELLED" && String(a.reservada).slice(0, 10) === d).length);
  const sparkVentas = porDia((d) => llamadas.filter((l) => l.vendido === "si" && String(l.fecha).slice(0, 10) === d).reduce((s, l) => s + (l.importe || 0), 0));

  // ----- Contenido -----
  const contenido = useMemo(() => {
    const conAgenda = new Set(datos.agendas.filter((a) => a.estado !== "CANCELLED").map((a) => a.contacto));
    const por = new Map<string, { entran: number; conversan: number; final: number; ids: string[] }>();
    Object.values(datos.contenido).forEach((r) => {
      const t = por.get(r.post) || { entran: 0, conversan: 0, final: 0, ids: [] };
      t.entran += num(r.entran); t.conversan += num(r.conversan); t.final += num(r.final); t.ids.push(...(r.ids || []));
      por.set(r.post, t);
    });
    return datos.publicaciones
      .map((p) => { const t = por.get(p.codigo) || { entran: 0, conversan: 0, final: 0, ids: [] }; return { ...p, ...t, agendan: new Set(t.ids.filter((x) => conAgenda.has(x))).size }; })
      .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  }, [datos.publicaciones, datos.contenido, datos.agendas]);
  const maxLikes = Math.max(1, ...contenido.map((c) => c.likes));

  const semanas = useMemo(() => {
    const lunes = (iso: string) => { const d = new Date(`${String(iso).slice(0, 10)}T12:00:00Z`); d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7)); return d.toISOString().slice(0, 10); };
    const m = new Map<string, { x: string; cerradas: number; nocerradas: number; novino: number; pendiente: number }>();
    for (let s = lunes(desde); s <= hoy; s = sumarDias(s, 7)) m.set(s, { x: s, cerradas: 0, nocerradas: 0, novino: 0, pendiente: 0 });
    llamadas.filter((l) => l.pasada).forEach((l) => {
      const k = m.get(lunes(l.fecha)); if (!k) return;
      if (l.vendido === "si") k.cerradas++; else if (l.vendido === "no") k.nocerradas++; else if (l.asistio === "no") k.novino++; else k.pendiente++;
    });
    return Array.from(m.values());
  }, [llamadas, desde, hoy]);

  const seguidoresNeto = useMemo(() => {
    const f = Object.values(datos.seguidores).filter((x) => x.fecha >= desde).sort((a, b) => (a.fecha < b.fecha ? -1 : 1));
    return f.length > 1 ? f[f.length - 1].seguidores - f[0].seguidores : null;
  }, [datos.seguidores, desde]);

  // ----- Acciones -----
  async function marcar(id: string, cambios: Partial<Resultado>) {
    const prev = resultados[id] || { asistio: "", vendido: "", importe: null };
    const nuevo: Resultado = { ...prev, ...cambios };
    if (nuevo.asistio !== "si") { nuevo.vendido = ""; nuevo.importe = null; }
    if (nuevo.vendido !== "si") nuevo.importe = null;
    setResultados((r) => ({ ...r, [id]: nuevo }));
    setError("");
    try {
      const r = await fetch("/api/panel/resultados", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...nuevo }) });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "Error");
    } catch (err) {
      setResultados((r) => ({ ...r, [id]: prev }));
      setError(`No se ha guardado: ${err instanceof Error ? err.message : "error"}. Vuelve a intentarlo.`);
    }
  }

  async function actualizar(completo: boolean) {
    setActualizando(completo ? "completa" : "rapida");
    setMsgAct(completo ? "Recalculando todo con los datos de Ninjo…" : "Actualizando…");
    try {
      const r = await fetch(`/api/panel/actualizar${completo ? "?completo=1" : ""}`, { method: "POST" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(j.error || `error ${r.status}`);
      window.location.reload();
      return;
    } catch (err) {
      setMsgAct(`No se pudo actualizar: ${err instanceof Error ? err.message : "error"}`);
    }
    setActualizando("");
  }

  async function salir() {
    await fetch("/api/panel/logout", { method: "POST" });
    window.location.href = "/panel-fcd/entrar";
  }

  const pasadas = llamadas.filter((l) => l.pasada).sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  const proximas = llamadas.filter((l) => !l.pasada).sort((a, b) => (a.fecha < b.fecha ? -1 : 1));
  const ventanaOrigen = [7, 14, 30, 90].find((v) => v >= dias) || 90;
  const origenesPeriodo = (datos.origenes[String(ventanaOrigen)] || []).slice().sort((a, b) => b.conversaciones - a.conversaciones);
  const maxOrigen = Math.max(1, ...origenesPeriodo.map((o) => o.conversaciones));
  const pendientes = ventas.sinMarcar + ventas.ventaSinMarcar;
  const manualNinjo = datos.control?.manuales_ninjo;

  // ----- Bloques reutilizables -----
  const bloqueCuello = (
    <div className={`pn-cuello tono-${cuello?.tono || "neutro"}`}>
      <span className="pn-cuello-eti">Cuello de botella {nombrePeriodo}</span>
      {cuello ? (
        <>
          <strong>{cuello.nombre}</strong>
          <p>Solo el <b>{pct(cuello.tasa)}</b> pasa este paso (objetivo {cuello.obj}%). Se quedan por el camino <b>{int(cuello.perdidas)}</b> personas de {int(cuello.de)}.</p>
          <button type="button" className="pn-link" onClick={() => irA("embudo")}>Ver el embudo completo →</button>
        </>
      ) : <p>Aún no hay datos suficientes en este periodo.</p>}
    </div>
  );

  const bloqueEmbudo = (
    <div className="pn-embudo">
      {[{ nombre: "Entran", n: e.entran }, ...pasos.map((p) => ({ nombre: p.nombre, n: p.a }))].map((s, k) => {
        const p = k > 0 ? pasos[k - 1] : null;
        const ancho = Math.max(6, (100 * s.n) / Math.max(1, e.entran));
        return (
          <div key={s.nombre} className="pn-et">
            {p && (
              <div className={`pn-et-conv tono-${p.tono}${cuello?.id === p.id ? " is-cuello" : ""}`}>
                <span>↓ {pct(p.tasa)}</span><small>objetivo {p.obj}%</small>{cuello?.id === p.id && <em>cuello de botella</em>}
              </div>
            )}
            <div className="pn-et-fila">
              <span className="pn-et-nombre">{s.nombre}</span>
              <div className="pn-et-barra"><div style={{ width: `${Math.min(100, ancho)}%` }}><b>{int(s.n)}</b></div></div>
            </div>
          </div>
        );
      })}
      {e.facturacion > 0 && <p className="pn-sub">Facturación de estas personas: <b>{eur(e.facturacion)}</b></p>}
    </div>
  );

  return (
    <div className="pn-app">
      <aside className="pn-side">
        <div className="pn-marca"><span className="pn-logo">FCD</span><div><b>Fit con Damián</b><small>Panel interno</small></div></div>
        <nav className="pn-nav" aria-label="Secciones">
          {PESTANAS.map(([k, n]) => (
            <button key={k} type="button" aria-current={pestana === k ? "page" : undefined} onClick={() => irA(k)}>{n}{k === "ventas" && pendientes > 0 && <span className="pn-badge">{pendientes}</span>}</button>
          ))}
        </nav>
        <div className="pn-side-pie">
          <span>Ninjo {conexiones.ninjo ? "conectado" : "sin conectar"}</span>
          <span>Datos {hace(datos.meta.agendas)}</span>
          <button type="button" className="pn-link" onClick={salir}>Salir</button>
        </div>
      </aside>

      <main className="pn-main">
        <header className="pn-top">
          <div>
            <h1>{PESTANAS.find(([k]) => k === pestana)?.[1]}</h1>
            <p className="pn-sub">{nombrePeriodo.charAt(0).toUpperCase() + nombrePeriodo.slice(1)} · embudo actualizado {hace(datos.meta.embudo)}</p>
          </div>
          <div className="pn-top-acc">
            <div className="pn-chips" role="group" aria-label="Periodo">
              {PERIODOS.map((p) => <button key={p} type="button" aria-pressed={periodo === p} onClick={() => setPeriodo(p)}>{p === "mes" ? "Este mes" : `${p} d`}</button>)}
            </div>
            <button type="button" className="pn-btn" disabled={!!actualizando || !conexiones.ninjo} onClick={() => actualizar(true)}>{actualizando ? "Actualizando…" : "↻ Actualizar"}</button>
          </div>
        </header>

        {msgAct && <p className="pn-aviso" role="status">{msgAct}</p>}
        {conexiones.ultimoError && <p className="pn-aviso">La última actualización automática falló: {conexiones.ultimoError}</p>}
        {!almacen && <p className="pn-aviso">Falta conectar el almacenamiento del panel en Vercel.</p>}

        {pestana === "resumen" && (
          <>
            <div className="pn-kpis">
              <Kpi destacado etiqueta="Gente que entra" valor={int(e.entran)} pie={`${int(aperturas.n ? Math.round(e.entran / aperturas.n) : null)} al día`} spark={sparkEntran} />
              <Kpi destacado etiqueta="Tasa de contestación" valor={pct(tasaContestacion)} tono={tonoObjetivo(tasaContestacion, OBJETIVOS.responden)} pie={`${int(aperturasResp)} de ${int(aperturasEnviadas)} primeros mensajes`} spark={sparkResp} />
              <Kpi destacado etiqueta="Llegan al final" valor={pct(ratio(e.final, e.conversan))} tono={tonoObjetivo(ratio(e.final, e.conversan), OBJETIVOS.final)} pie={`${int(e.final)} de ${int(e.conversan)} que conversan`} />
              <Kpi destacado etiqueta="Nos dan sus datos" valor={pct(ratio(e.datos, e.conversan))} pie={`${int(e.datos)} · ${pct(ratio(e.datos, e.final))} de las que llegan al final`} />
              <Kpi etiqueta="Agendas" valor={int(ventas.reservadas)} pie={`${int(ventas.canceladas)} canceladas`} spark={sparkAgendas} />
              <Kpi etiqueta="Show rate" valor={pct(ventas.show)} tono={tonoObjetivo(ventas.show, OBJETIVOS.vienen)} pie={`${int(ventas.vinieron)} vinieron · ${int(ventas.noVinieron)} no`} />
              <Kpi etiqueta="Tasa de cierre" valor={pct(ventas.cierre)} tono={tonoObjetivo(ventas.cierre, OBJETIVOS.compran)} pie={`${int(ventas.cerradas)} cerradas · ${int(ventas.noCerradas)} no`} />
              <Kpi etiqueta="Facturación" valor={eur(ventas.facturacion)} pie={`ticket medio ${eur(ventas.ticket)}`} spark={sparkVentas} />
            </div>
            <div className="pn-dos">
              {bloqueCuello}
              <Seccion titulo="Embudo" sub="De cada 100 personas que entran, cuántas avanzan.">{bloqueEmbudo}</Seccion>
            </div>
            <Seccion titulo="Gente que entra cada día" sub="Por dónde llega cada persona el día en que empieza a hablar con nosotros.">
              <Barras
                filas={diasEmbudo.map((d) => ({ x: d.fecha, ...Object.fromEntries(ORIGENES.map(([o]) => [o, num(d[`${o}_entran`])])), conv: ORIGENES.reduce((t, [o]) => t + num(d[`${o}_conversan`]), 0) }))}
                series={ORIGENES.map(([o, n]) => ({ clave: o, nombre: n, color: COLOR_ORIGEN[o] }))}
                etiqueta={dia} extra={(f) => `Conversan: ${int(num(f.conv))}`} vacio="Todavía no hay días calculados en este periodo."
              />
            </Seccion>
            {pendientes > 0 && (
              <button type="button" className="pn-aviso pn-aviso-btn" onClick={() => irA("ventas")}>Tienes {ventas.sinMarcar} llamadas sin marcar si vinieron y {ventas.ventaSinMarcar} sin marcar si compraron → marcar ahora</button>
            )}
          </>
        )}

        {pestana === "embudo" && (
          <>
            <div className="pn-chips" role="group" aria-label="Por dónde entran">
              <button type="button" aria-pressed={origen === "todas"} onClick={() => setOrigen("todas")}>Todas</button>
              {ORIGENES.map(([o, n]) => <button key={o} type="button" aria-pressed={origen === o} onClick={() => setOrigen(o)}>{n}</button>)}
            </div>
            <div className="pn-dos">
              <Seccion titulo="Embudo completo" sub="Cada flecha es el porcentaje que pasa al siguiente paso, comparado con su objetivo.">{bloqueEmbudo}</Seccion>
              <div className="pn-col-v">
                {bloqueCuello}
                <Seccion titulo="Dónde se pierde la gente" sub="Personas que no pasan cada paso.">
                  <div className="pn-perdidas">
                    {pasos.map((p) => (
                      <div key={p.id} className={`pn-perd tono-${p.tono}`}>
                        <span>{p.nombre}</span>
                        <div className="pn-perd-barra"><div style={{ width: `${(100 * p.perdidas) / Math.max(1, ...pasos.map((x) => x.perdidas))}%` }} /></div>
                        <b>−{int(p.perdidas)}</b>
                      </div>
                    ))}
                  </div>
                </Seccion>
              </div>
            </div>
            <Seccion titulo="Comparativa por origen" sub="Qué tipo de entrada convierte mejor en cada paso.">
              <div className="pn-tablewrap">
                <table className="pn-table">
                  <thead><tr><th>Origen</th><th className="r">Entran</th><th className="r">Responden</th><th className="r">Llegan al final</th><th className="r">Dan datos</th><th className="r">Agendan</th><th className="r">Entran → agendan</th></tr></thead>
                  <tbody>
                    {porOrigen.map((r) => (
                      <tr key={r.o}>
                        <td><i className="pn-cuadro" style={{ background: COLOR_ORIGEN[r.o] }} />{r.n}</td>
                        <td className="r">{int(r.entran)}</td>
                        <td className="r"><span className={`pn-pill tono-${tonoObjetivo(ratio(r.conversan, r.entran), OBJETIVOS.responden)}`}>{pct(ratio(r.conversan, r.entran))}</span></td>
                        <td className="r"><span className={`pn-pill tono-${tonoObjetivo(ratio(r.final, r.conversan), OBJETIVOS.final)}`}>{pct(ratio(r.final, r.conversan))}</span></td>
                        <td className="r">{pct(ratio(r.datos, r.final))}</td>
                        <td className="r">{int(r.agendan)}</td>
                        <td className="r"><b>{pct(ratio(r.agendan, r.entran))}</b></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Seccion>
            <details className="pn-details">
              <summary>Cómo se calcula y objetivos</summary>
              <dl>
                <dt>Entran</dt><dd>Personas cuya primera conversación de Instagram empezó en el periodo.</dd>
                <dt>Responden</dt><dd>Nos escriben por privado después de nuestro primer mensaje. Las que nos escriben ellas cuentan siempre.</dd>
                <dt>Llegan al final</dt><dd>El agente ya les pidió los datos para la llamada (&quot;Datos ya solicitados&quot; en Ninjo).</dd>
                <dt>Nos dan sus datos</dt><dd>Dejaron su correo en la conversación.</dd>
                <dt>Agendan, vienen, compran</dt><dd>Llamada reservada en GoHighLevel sin cancelar; las que vinieron y las que compraron según lo marcado.</dd>
                <dt>Objetivos</dt><dd>Responden {OBJETIVOS.responden}% · final {OBJETIVOS.final}% · datos {OBJETIVOS.datos}% · agendan {OBJETIVOS.agendan}% · vienen {OBJETIVOS.vienen}% · compran {OBJETIVOS.compran}%. Verde si se cumple, ámbar si está cerca, rojo si está lejos. Dime si quieres otros.</dd>
              </dl>
            </details>
          </>
        )}

        {pestana === "captacion" && (
          <>
            <div className="pn-kpis">
              <Kpi destacado etiqueta="Bienvenidas enviadas" valor={int(aperturas.tot.b_env)} pie={`${int(aperturas.n ? Math.round(aperturas.tot.b_env / aperturas.n) : null)} al día`} spark={porDia((d) => embPorFecha.get(d)?.b_env || 0)} />
              <Kpi destacado etiqueta="Responden a la bienvenida" valor={pct(ratio(aperturas.tot.b_resp, aperturas.tot.b_env))} tono={tonoObjetivo(ratio(aperturas.tot.b_resp, aperturas.tot.b_env), OBJETIVOS.responden)} pie={`${int(aperturas.tot.b_resp)} de ${int(aperturas.tot.b_env)}`} />
              <Kpi destacado etiqueta="Mensajes a seguidoras" valor={int(aperturas.tot.s_env)} pie={`${int(aperturas.n ? Math.round(aperturas.tot.s_env / aperturas.n) : null)} al día`} spark={porDia((d) => embPorFecha.get(d)?.s_env || 0)} />
              <Kpi destacado etiqueta="Responden al mensaje" valor={pct(ratio(aperturas.tot.s_resp, aperturas.tot.s_env))} tono={tonoObjetivo(ratio(aperturas.tot.s_resp, aperturas.tot.s_env), OBJETIVOS.responden)} pie={`${int(aperturas.tot.s_resp)} de ${int(aperturas.tot.s_env)}`} />
              <Kpi etiqueta="Mensajes manuales del setter" valor={int(aperturas.tot.manual)} pie={manualNinjo ? `Ninjo registra ${int(manualNinjo["1"])} en 24 h` : "aperturas y seguimientos"} spark={porDia((d) => embPorFecha.get(d)?.manual || 0)} />
              <Kpi etiqueta="Seguidores" valor={int(datos.perfil?.seguidores)} pie={seguidoresNeto == null ? "crecimiento neto: en unos días" : `${seguidoresNeto >= 0 ? "+" : ""}${int(seguidoresNeto)} ${nombrePeriodo}`} />
            </div>
            <Seccion titulo="Primeros mensajes enviados y respondidos cada día">
              <Barras
                filas={aperturas.filas.map((f) => ({ x: f.fecha, b: f.b_env, s: f.s_env, o: f.o_env, r: f.b_resp + f.s_resp + f.o_resp }))}
                series={[{ clave: "b", nombre: "Bienvenidas", color: "#343337" }, { clave: "s", nombre: "Mensajes a seguidoras", color: "#b58fd6" }, { clave: "o", nombre: "Otros", color: "#d9a441" }]}
                etiqueta={dia} extra={(f) => `Respondieron: ${int(num(f.r))}`} vacio="Todavía no hay días calculados."
              />
            </Seccion>
            <Seccion titulo="Detalle por día" sub='Bienvenidas: "me has pillado (justo) con el móvil…". Seguidoras: "te llevo viendo un tiempo…" y "llevo un tiempo viéndote…". Otros: consejo, vídeo de turnos e historias.'>
              <div className="pn-tablewrap">
                <table className="pn-table">
                  <thead><tr><th>Día</th><th className="r">Bienvenidas</th><th className="r">Responden</th><th className="r">%</th><th className="r">A seguidoras</th><th className="r">Responden</th><th className="r">%</th><th className="r">Otros</th><th className="r">Manuales totales</th></tr></thead>
                  <tbody>
                    {aperturas.filas.length ? aperturas.filas.slice().reverse().map((f) => (
                      <tr key={f.fecha}>
                        <td>{dia(f.fecha)}{f.fecha === hoy && <span className="pn-vivo">hoy</span>}</td>
                        <td className="r">{int(f.b_env)}</td><td className="r">{int(f.b_resp)}</td><td className="r"><span className={`pn-pill tono-${tonoObjetivo(ratio(f.b_resp, f.b_env), OBJETIVOS.responden)}`}>{pct(ratio(f.b_resp, f.b_env))}</span></td>
                        <td className="r">{int(f.s_env)}</td><td className="r">{int(f.s_resp)}</td><td className="r"><span className={`pn-pill tono-${tonoObjetivo(ratio(f.s_resp, f.s_env), OBJETIVOS.responden)}`}>{pct(ratio(f.s_resp, f.s_env))}</span></td>
                        <td className="r">{int(f.o_env)}</td><td className="r">{int(f.manual)}</td>
                      </tr>
                    )) : <tr><td colSpan={9} className="pn-vacio">Todavía no hay días calculados.</td></tr>}
                    {aperturas.filas.length > 0 && (
                      <tr className="pn-total">
                        <td>Total</td>
                        <td className="r">{int(aperturas.tot.b_env)}</td><td className="r">{int(aperturas.tot.b_resp)}</td><td className="r">{pct(ratio(aperturas.tot.b_resp, aperturas.tot.b_env))}</td>
                        <td className="r">{int(aperturas.tot.s_env)}</td><td className="r">{int(aperturas.tot.s_resp)}</td><td className="r">{pct(ratio(aperturas.tot.s_resp, aperturas.tot.s_env))}</td>
                        <td className="r">{int(aperturas.tot.o_env)}</td><td className="r">{int(aperturas.tot.manual)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Seccion>
          </>
        )}

        {pestana === "ventas" && (
          <>
            <div className="pn-kpis">
              <Kpi destacado etiqueta="Agendas" valor={int(ventas.reservadas)} pie={`${int(ventas.proximas)} próximas · ${int(ventas.canceladas)} canceladas`} spark={sparkAgendas} />
              <Kpi destacado etiqueta="Show rate" valor={pct(ventas.show)} tono={tonoObjetivo(ventas.show, OBJETIVOS.vienen)} pie={`no-show ${pct(ventas.noshow)}`} />
              <Kpi destacado etiqueta="Tasa de cierre" valor={pct(ventas.cierre)} tono={tonoObjetivo(ventas.cierre, OBJETIVOS.compran)} pie={`${int(ventas.cerradas)} cerradas de ${int(ventas.cerradas + ventas.noCerradas)} decididas`} />
              <Kpi destacado etiqueta="Facturación" valor={eur(ventas.facturacion)} pie={`ticket medio ${eur(ventas.ticket)}`} spark={sparkVentas} />
            </div>
            <div className="pn-dos">
              <Seccion titulo="Resultado de las llamadas" sub="Llamadas ya pasadas del periodo.">
                <Donut
                  centro={pct(ventas.cierre)} sub="cierre"
                  partes={[
                    { etiqueta: "Cerradas", valor: ventas.cerradas, color: "#2f8f5b" },
                    { etiqueta: "No cerradas", valor: ventas.noCerradas, color: "#d06a4f" },
                    { etiqueta: "No vinieron", valor: ventas.noVinieron, color: "#c9c3b6" },
                    { etiqueta: "Sin marcar", valor: ventas.sinMarcar + ventas.ventaSinMarcar, color: "#efe9da" },
                  ]}
                />
              </Seccion>
              <Seccion titulo="Llamadas por semana">
                <Barras
                  filas={semanas}
                  series={[{ clave: "cerradas", nombre: "Cerradas", color: "#2f8f5b" }, { clave: "nocerradas", nombre: "No cerradas", color: "#d06a4f" }, { clave: "novino", nombre: "No vinieron", color: "#c9c3b6" }, { clave: "pendiente", nombre: "Sin marcar", color: "#efe9da" }]}
                  etiqueta={(x) => `sem. ${dia(x)}`} vacio="Todavía no hay llamadas pasadas en este periodo." alto={160}
                />
              </Seccion>
            </div>
            <Seccion titulo="Marca cada llamada" sub="Si en GoHighLevel la marcaste como presentada o no, ya aparece marcada; lo que marques aquí manda." accion={pendientes > 0 ? <span className="pn-badge pn-badge-g">{pendientes} pendientes</span> : undefined}>
              {error && <p className="pn-err" role="alert">{error}</p>}
              <div className="pn-tablewrap">
                <table className="pn-table">
                  <thead><tr><th>Fecha</th><th>Nombre</th><th>Instagram</th><th>¿Vino?</th><th>¿Compró?</th><th>Importe (€)</th></tr></thead>
                  <tbody>
                    {pasadas.length ? pasadas.map((l) => (
                      <tr key={l.id} className={!l.asistio || (l.asistio === "si" && !l.vendido) ? "is-pend" : ""}>
                        <td>{fechaHora(l.fecha)}</td><td>{l.nombre || "—"}</td><td>{l.instagram ? `@${l.instagram}` : "—"}</td>
                        <td><SiNo valor={l.asistio} etiqueta={`¿Vino ${l.nombre}?`} onCambio={(v) => marcar(l.id, { asistio: v })} /></td>
                        <td><SiNo valor={l.vendido} etiqueta={`¿Compró ${l.nombre}?`} desactivado={l.asistio !== "si"} onCambio={(v) => marcar(l.id, { asistio: "si", vendido: v })} /></td>
                        <td>
                          <input className="pn-importe" type="number" min={0} step={1} inputMode="numeric" placeholder="€" aria-label={`Importe de ${l.nombre}`}
                            key={`${l.id}-${l.importe ?? ""}`} defaultValue={l.importe ?? ""} disabled={l.vendido !== "si"}
                            onBlur={(ev) => { const v = ev.target.value === "" ? null : Math.max(0, Number(ev.target.value)); if (v !== l.importe) marcar(l.id, { asistio: "si", vendido: "si", importe: Number.isFinite(v as number) ? v : null }); }} />
                        </td>
                      </tr>
                    )) : <tr><td colSpan={6} className="pn-vacio">No hay llamadas pasadas en este periodo.</td></tr>}
                  </tbody>
                </table>
              </div>
            </Seccion>
            <Seccion titulo="Próximas llamadas">
              <div className="pn-proximas">
                {proximas.length ? proximas.map((l) => (
                  <div key={l.id} className="pn-prox">
                    <span className="pn-prox-fecha">{fechaHora(l.fecha)}</span>
                    <b>{l.nombre || "—"}</b>
                    <span>{l.instagram ? `@${l.instagram}` : l.telefono || "—"}</span>
                    {l.setter === "sí" && <span className="pn-pill tono-neutro">setter</span>}
                  </div>
                )) : <p className="pn-vacio">No hay llamadas programadas.</p>}
              </div>
            </Seccion>
          </>
        )}

        {pestana === "contenido" && (
          <Seccion titulo="Publicaciones" sub="Me gusta, comentarios y cuánta gente entra comentando cada publicación y hasta dónde llega.">
            <div className="pn-posts">
              {contenido.length ? contenido.map((p) => (
                <article key={p.codigo} className="pn-post">
                  <div className="pn-post-top"><span className="pn-pill tono-neutro">{p.tipo}</span><span className="pn-sub">{dia(p.fecha)}</span></div>
                  <p className="pn-post-txt">{/^https:\/\//.test(p.enlace) ? <a href={p.enlace} target="_blank" rel="noopener noreferrer">{p.texto || "Ver publicación"}</a> : p.texto}</p>
                  <div className="pn-post-bar"><div style={{ width: `${(100 * p.likes) / maxLikes}%` }} /></div>
                  <div className="pn-post-nums">
                    <span><b>{int(p.likes)}</b> me gusta</span><span><b>{int(p.comentarios)}</b> coment.</span>
                    <span><b>{int(p.entran)}</b> entran</span><span><b>{int(p.final)}</b> al final</span><span><b>{int(p.agendan)}</b> agendan</span>
                  </div>
                </article>
              )) : <p className="pn-vacio">Sin publicaciones todavía.</p>}
            </div>
          </Seccion>
        )}

        {pestana === "fuentes" && (
          <>
            <Seccion titulo="Origen de las conversaciones del setter" sub={`Últimos ${ventanaOrigen} días. Si un anuncio de Meta trae conversaciones, sale aquí con su nombre.`}>
              <div className="pn-perdidas">
                {origenesPeriodo.length ? origenesPeriodo.map((o) => (
                  <div key={o.origen} className="pn-perd tono-neutro">
                    <span>{o.origen}</span>
                    <div className="pn-perd-barra"><div style={{ width: `${(100 * o.conversaciones) / maxOrigen}%` }} /></div>
                    <b>{int(o.conversaciones)}</b><small>{int(o.agendas)} a la agenda</small>
                  </div>
                )) : <p className="pn-vacio">Sin datos todavía.</p>}
              </div>
            </Seccion>
            <Seccion titulo="Conexiones">
              <div className="pn-conex">
                {[
                  { n: "Ninjo", ok: conexiones.ninjo, t: "Conversaciones, embudo, agendas, seguidores y publicaciones", e: conexiones.ninjo ? `Conectado · ${hace(datos.meta.agendas)}` : "Falta el usuario de Ninjo en Vercel" },
                  { n: "Meta Ads", ok: conexiones.meta, t: "Gasto, coste por seguidor, por conversación, por agenda y por venta", e: conexiones.meta ? "Conectado" : "Pendiente de conectar" },
                  { n: "Estadísticas de Instagram", ok: conexiones.meta, t: "Visualizaciones, alcance y seguidores por reel e historias", e: conexiones.meta ? "Conectado" : "Pendiente de conectar" },
                  { n: "Hotmart y Stripe", ok: conexiones.stripe, t: "Ventas y facturación automáticas", e: conexiones.stripe ? "Conectado" : "Pendiente de conectar" },
                ].map((c) => (
                  <div key={c.n} className={`pn-conx ${c.ok ? "is-ok" : ""}`}>
                    <span className={`pn-dot ${c.ok ? "tono-ok" : "tono-warn"}`} aria-hidden="true" />
                    <div><b>{c.n}</b><small>{c.t}</small></div>
                    <span className="pn-conx-e">{c.e}</span>
                  </div>
                ))}
              </div>
            </Seccion>
          </>
        )}
      </main>
    </div>
  );
}

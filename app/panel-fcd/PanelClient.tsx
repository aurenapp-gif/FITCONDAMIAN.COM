"use client";

import { useEffect, useMemo, useState } from "react";

// ---------- Tipos de los datos guardados ----------
type Origen = "bienvenida" | "saludo" | "historia" | "leadmagnet" | "comentario" | "palabra" | "mensaje";
type DetPerdida = { estado: Record<string, number>; turnos: Record<string, number>; cat: Record<string, number>; ej: Record<string, string[]> };
type PerdidasDia = { p1_franja: Record<string, number>; p1_perdidas_franja: Record<string, number>; p1_seguimiento: number; p1_sin_seguimiento: number; p2: DetPerdida; p3: DetPerdida; sin_contestar: { u: string; c: string; ult: string; h: number }[]; datos: { u: string; c: string }[] };
type DiaEmbudo = { fecha: string; ids?: Partial<Record<Origen, string[]>>; pd?: Partial<Record<Origen, PerdidasDia>> } & Record<string, unknown>;
type Agenda = { id: string; contacto: string; fecha: string; reservada: string; estado: string; nombre: string; instagram: string; telefono: string; setter: string; email?: string };
type Venta = { id: string; fuente: "hotmart" | "stripe" | "manual"; fecha: string; estado: string; importe: number; neto?: number; comision?: number; moneda: string; producto: string; email: string; nombre: string; metodo?: string; agendaId?: string; nota?: string };
const COBRADAS = new Set(["APPROVED", "COMPLETE", "PAID"]);
type Resultado = { asistio: "" | "si" | "no"; vendido: "" | "si" | "no"; importe: number | null };
type Publicacion = { id?: string; codigo: string; fecha: string; tipo: string; texto: string; enlace: string; likes: number; comentarios: number };
type FilaContenido = { post: string; fecha: string; entran: number; conversan: number; final: number; datos: number; ids?: string[] };
type FilaOrigen = { origen: string; conversaciones: number; agendas: number };
type FilaAnuncio = { fecha: string; campana: string; conjunto: string; anuncio: string; anuncio_id: string; gasto: number; impresiones: number; alcance: number; clics: number; conversaciones: number; seguidores: number; visitas_perfil: number };
type ItemEstudio = { titulo: string; etiqueta?: string; texto?: string; bloque?: string; medir?: string };
type Estudio = { id: string; fecha: string; titular: string; cuello?: { paso?: string; tasa?: number | null; objetivo?: number | null; detalle?: string }; secciones: { id?: string; titulo: string; intro?: string; items: ItemEstudio[] }[]; fuentes?: string[] };
type DatosInstagram = { seguidores_dia?: Record<string, number>; medios?: Record<string, Record<string, number>>; leido?: string };

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
  ventas: Venta[];
  ventasManuales: Venta[];
  anuncios: { desde?: string; hasta?: string; filas?: FilaAnuncio[] } | null;
  instagram: DatosInstagram | null;
  estudios: Estudio[];
  competidores: string[];
  valoresVenta: Record<string, number>;
  gastos: Gasto[];
  ventasExcluidas: Record<string, { fecha: string; motivo?: string }>;
  comisiones: Record<string, number>;
};
// Métodos de cobro manual y comisión por defecto (%) cuando no se apunta lo que llega neto.
const METODOS_COBRO: [string, number][] = [["Transferencia", 0], ["Bizum", 0], ["Efectivo", 0], ["Sequra", 0], ["PayPal", 3.4], ["Tarjeta (TPV)", 1.5], ["Otro", 0]];
type Gasto = { id: string; concepto: string; categoria: string; importe: number; tipo: "mensual" | "puntual"; fecha?: string; desde?: string; hasta?: string; captacion: boolean; nota?: string };
const CATEGORIAS_GASTO: [string, boolean][] = [
  ["Marketing / agencia", true], ["Consultoría / mentoría", true], ["Equipo de ventas (setter, closer)", true], ["Publicidad (otras plataformas)", true],
  ["Contenido (grabación, edición)", true], ["Herramientas y software", false], ["Equipo y salarios", false], ["Otros", false],
];
export type Conexiones = { ninjo: boolean; ultimoError: string | null; meta: boolean; stripe: boolean; hotmart?: boolean };

const ORIGENES: [Origen, string][] = [
  ["bienvenida", "Bienvenidas (seguidoras nuevas)"],
  ["saludo", "Mensajes a seguidoras existentes"],
  ["historia", "Reaccionan a una historia"],
  ["leadmagnet", "Lead magnet en publicación"],
  ["palabra", "Escriben una palabra clave (QUIERO…)"],
  ["comentario", "Otros comentarios"],
  ["mensaje", "Nos escriben ellas"],
];
const COLOR_ORIGEN: Record<Origen, string> = { bienvenida: "#343337", saludo: "#b58fd6", historia: "#5aa6c8", leadmagnet: "#e77fc5", palabra: "#2f8f5b", comentario: "#f2b8dc", mensaje: "#d9a441" };
const PERIODOS: (number | "mes")[] = ["mes", 7, 14, 30, 90];

// Objetivos orientativos de cada paso del embudo (en %). Sirven para señalar el cuello de botella.
const OBJETIVOS = { responden: 15, final: 25, datos: 70, agendan: 60, vienen: 70, compran: 25 };

const PESTANAS = [
  ["resumen", "Resumen"],
  ["agenda", "Agenda"],
  ["estudio", "Estudio y propuestas"],
  ["embudo", "Embudo"],
  ["captacion", "Captación"],
  ["anuncios", "Anuncios"],
  ["gastos", "Gastos y beneficio"],
  ["ventas", "Llamadas y ventas"],
  ["contenido", "Contenido"],
  ["fuentes", "Orígenes y conexiones"],
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
const franjaHora = (iso: string) => { const h = Number(String(iso).slice(11, 13)); return h < 6 ? "00-05" : h < 10 ? "06-09" : h < 14 ? "10-13" : h < 19 ? "14-18" : "19-23"; };
const fechaHora = (iso: string) => `${dia(iso)} · ${String(iso).slice(11, 16)}`;
const int = (n: number | null | undefined) => (n == null || Number.isNaN(n) ? "—" : Math.round(n).toLocaleString("es-ES"));
const pct = (n: number | null | undefined) => (n == null ? "—" : `${n}%`);
const eur = (n: number | null | undefined) => (n == null ? "—" : `${Math.round(n).toLocaleString("es-ES")} €`);
const eur2 = (n: number | null | undefined) => (n == null || !Number.isFinite(n) ? "—" : `${n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`);
const coste = (gasto: number, n: number) => (n > 0 && gasto > 0 ? gasto / n : null);
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

const CAT_PREGUNTA: Record<string, string> = {
  llamada: "Cuando les proponemos la llamada", datos: "Cuando les pedimos el correo o el teléfono", dinero: "Cuando sale el dinero o la inversión",
  probado: "Al preguntar qué han probado antes", tiempo: "Al preguntar cuánto tiempo llevan así", motivo: "Al preguntar por qué ahora o cuánto les importa",
  situacion: "Al preguntar por su situación (trabajo, turnos, hijos…)", objetivo: "Al preguntar por su objetivo (peso, energía, ropa…)",
  apertura: "Tras el primer mensaje", agradecimiento: "Tras un «gracias» sin pregunta", otra: "Otros mensajes",
};
const FRANJAS = ["00-05", "06-09", "10-13", "14-18", "19-23"];
function FilaBarra({ etiqueta, valor, max, derecha, tono = "neutro", sub }: { etiqueta: React.ReactNode; valor: number; max: number; derecha: React.ReactNode; tono?: Tono; sub?: React.ReactNode }) {
  return (
    <div className={`pn-fb tono-${tono}`}>
      <div className="pn-fb-top"><span>{etiqueta}</span><b>{derecha}</b></div>
      <div className="pn-fb-barra"><div style={{ width: `${max ? Math.max(2, (100 * valor) / max) : 0}%` }} /></div>
      {sub && <small>{sub}</small>}
    </div>
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
  const [manuales, setManuales] = useState<Venta[]>(datos.ventasManuales || []);
  const [excluidas, setExcluidas] = useState<Record<string, { fecha: string; motivo?: string }>>(datos.ventasExcluidas || {});
  const cobradas = useMemo(() => [...(datos.ventas || []), ...manuales].filter((v) => COBRADAS.has(String(v.estado).toUpperCase()) && !excluidas[v.id]), [datos.ventas, manuales, excluidas]);
  const [comisiones, setComisiones] = useState<Record<string, number>>(datos.comisiones || {});
  const pctComision = (v: Venta) => {
    const k = v.fuente === "manual" ? String(v.metodo || "Transferencia") : v.fuente;
    if (typeof comisiones[k] === "number") return comisiones[k];
    return v.fuente === "manual" ? (METODOS_COBRO.find((m) => m[0] === k)?.[1] ?? 0) : 0;
  };
  // Lo que llega de verdad: el neto exacto si la plataforma lo da o lo apuntaste; si no, se descuenta el % del método.
  const netoDe = (v: Venta) => (typeof v.neto === "number" ? v.neto : Math.round(v.importe * (1 - pctComision(v) / 100) * 100) / 100);
  const ventasExcluidasLista = useMemo(() => (datos.ventas || []).filter((v) => excluidas[v.id]).sort((a, b) => (a.fecha < b.fecha ? 1 : -1)), [datos.ventas, excluidas]);
  async function excluirVenta(v: Venta, excluir: boolean) {
    const prev = excluidas;
    setExcluidas((e) => { const n = { ...e }; if (excluir) n[v.id] = { fecha: new Date().toISOString() }; else delete n[v.id]; return n; });
    try {
      const r = await fetch("/api/panel/ventas-excluidas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: v.id, excluir }) });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "Error");
    } catch (err) {
      setExcluidas(prev);
      setErrVenta(`No se ha podido ${excluir ? "quitar" : "recuperar"} la venta: ${err instanceof Error ? err.message : "error"}`);
    }
  }
  const hayVentasAuto = Boolean(conexiones.hotmart || conexiones.stripe || manuales.length);
  // Venta de Hotmart/Stripe del mismo correo, desde 2 días antes hasta 30 días después de la llamada.
  const ventaDeLlamada = useMemo(() => (a: Agenda) => {
    const porLlamada = cobradas.find((v) => v.agendaId === a.id);
    if (porLlamada) return porLlamada;
    const em = String(a.email || "").toLowerCase();
    if (!em) return null;
    const t = new Date(a.fecha).getTime();
    return cobradas.find((v) => v.email === em && new Date(v.fecha).getTime() >= t - 2 * 864e5 && new Date(v.fecha).getTime() <= t + 30 * 864e5) || null;
  }, [cobradas]);

  const evaluar = useMemo(() => {
    const ahora = Date.now();
    return (a: Agenda) => {
        const r = resultados[a.id];
        const auto = ventaDeLlamada(a);
        if (auto && auto.agendaId === a.id) {
          // Venta unida a esta llamada a propósito: manda sobre lo marcado.
          const imp = r && r.vendido === "si" && typeof r.importe === "number" ? r.importe : auto.importe;
          return { ...a, pasada: new Date(a.fecha).getTime() < ahora, asistio: "si", vendido: "si", importe: imp, auto: true };
        }
        const asistio = r && (r.asistio === "si" || r.asistio === "no") ? r.asistio : auto ? "si" : a.estado === "SHOWED" ? "si" : a.estado === "NO_SHOW" ? "no" : "";
        const vendido = asistio === "si" && r && (r.vendido === "si" || r.vendido === "no") ? r.vendido : asistio === "si" && auto ? "si" : "";
        const importe = vendido === "si" && r && typeof r.importe === "number" ? r.importe : vendido === "si" && auto ? auto.importe : null;
        return { ...a, pasada: new Date(a.fecha).getTime() < ahora, asistio, vendido, importe, auto: Boolean(auto && !(r && r.vendido)) };
    };
  }, [resultados, ventaDeLlamada]);
  const llamadas = useMemo(() => datos.agendas.filter((a) => a.estado !== "CANCELLED" && String(a.fecha).slice(0, 10) >= desde).map(evaluar), [datos.agendas, desde, evaluar]);

  const [valores, setValores] = useState<Record<string, number>>(datos.valoresVenta || {});
  const claveCli = (v: Venta) => String(v.email || v.id).toLowerCase();
  const ventasPeriodo = useMemo(() => {
    const lista = cobradas.filter((v) => String(v.fecha).slice(0, 10) >= desde).sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
    const emailsLlamada = new Set(datos.agendas.map((a) => String(a.email || "").toLowerCase()).filter(Boolean));
    const bruto = lista.reduce((s, v) => s + v.importe, 0); // lo que pagaron las clientas en el periodo
    const total = lista.reduce((s, v) => s + netoDe(v), 0); // cash collect: lo que te llega tras comisiones
    const compradoras = new Set(lista.map((v) => v.email || v.id));
    const idsAgenda = new Set(datos.agendas.map((a) => a.id));
    const conLlamada = (v: Venta) => emailsLlamada.has(v.email) || Boolean(v.agendaId && idsAgenda.has(v.agendaId));
    const deLlamada = lista.filter(conLlamada);
    const compradorasLlamada = new Set(deLlamada.map((v) => v.email || v.agendaId || v.id));

    // Ventas (no clientas): cada compra de Hotmart es una venta; un cobro de Stripe o manual que llega poco después
    // de otro parecido de la misma clienta es una cuota de esa venta; el resto son ventas nuevas.
    type VentaAgr = { clave: string; claveCli: string; nombre: string; email: string; producto: string; primero: string; cobros: Venta[]; cobrado: number; base: number };
    const ventasAgr: VentaAgr[] = [];
    const actual = new Map<string, VentaAgr>();
    [...cobradas].sort((a, b) => (a.fecha < b.fecha ? -1 : 1)).forEach((v) => {
      const kc = claveCli(v);
      const va = actual.get(kc);
      const ult = va?.cobros[va.cobros.length - 1];
      const gap = ult ? (new Date(v.fecha).getTime() - new Date(ult.fecha).getTime()) / 864e5 : Infinity;
      const desc = String(v.producto || "").toLowerCase();
      const parecido = va ? Math.abs(v.importe - va.base) <= Math.max(5, va.base * 0.15) : false;
      const esCuota = Boolean(va) && v.fuente !== "hotmart" && (desc.includes("subscription update") ? gap <= 120 : gap <= 75 && parecido);
      if (esCuota && va) { va.cobros.push(v); va.cobrado += v.importe; if (!va.nombre && v.nombre) va.nombre = v.nombre; return; }
      const nueva: VentaAgr = { clave: String(v.id).toLowerCase(), claveCli: kc, nombre: v.nombre, email: v.email, producto: v.producto, primero: v.fecha, cobros: [v], cobrado: v.importe, base: v.importe };
      ventasAgr.push(nueva); actual.set(kc, nueva);
    });
    // Precios completos conocidos (compras de Hotmart) para estimar el total de las ventas a plazos.
    const precios = Array.from(new Set(cobradas.filter((v) => v.fuente === "hotmart" && v.importe >= 300).map((v) => Math.round(v.importe)))).sort((a, b) => a - b);
    const estimar = (cuota: number) => {
      for (const p of precios) for (let n = 2; n <= 12; n++) if (Math.abs(p - n * cuota) <= p * 0.015) return { valor: p, n };
      return null;
    };
    // Importe que marcaste a mano en su llamada (valor de la venta), por correo.
    const marcadoPorEmail = new Map<string, number>();
    datos.agendas.forEach((a) => { const r = resultados[a.id]; const em = String(a.email || "").toLowerCase(); if (em && r && r.vendido === "si" && typeof r.importe === "number" && r.importe > 0) marcadoPorEmail.set(em, r.importe); });
    const valorDe = (c: VentaAgr): { valor: number; fuente: string } => {
      if (typeof valores[c.clave] === "number") return { valor: valores[c.clave], fuente: "tú" };
      const m = c.email ? marcadoPorEmail.get(c.email.toLowerCase()) : undefined;
      if (m && m >= c.cobrado) return { valor: m, fuente: "llamada" };
      if (c.cobros[0].fuente !== "hotmart") { const e = estimar(c.base); if (e && e.valor >= c.cobrado) return { valor: e.valor, fuente: `estimado: ${e.n} cuotas de ${Math.round(c.base)} €` }; }
      return { valor: c.cobrado, fuente: "cobrado" };
    };
    const nuevas = ventasAgr.filter((c) => String(c.primero).slice(0, 10) >= desde)
      .map((c) => { const v = valorDe(c); return { ...c, valor: v.valor, fuente: v.fuente, pendiente: Math.max(0, v.valor - c.cobrado), netoCobrado: c.cobros.reduce((t, x) => t + netoDe(x), 0) }; })
      .sort((a, b) => (a.primero < b.primero ? 1 : -1));
    // Ventas cerradas en llamadas del periodo, con importe, sin ningún cobro registrado (pendientes de cobrar del todo).
    const emailsCobro = new Set(cobradas.map((v) => String(v.email || "").toLowerCase()).filter(Boolean));
    const sinCobro = datos.agendas.filter((a) => {
      const r = resultados[a.id]; const em = String(a.email || "").toLowerCase();
      return String(a.fecha).slice(0, 10) >= desde && a.estado !== "CANCELLED" && r && r.vendido === "si" && typeof r.importe === "number" && r.importe > 0 && !(em && emailsCobro.has(em)) && !cobradas.some((v) => v.agendaId === a.id);
    }).map((a) => ({ id: a.id, nombre: a.nombre, fecha: a.fecha, valor: resultados[a.id].importe as number }));
    const facturacion = nuevas.reduce((t, c) => t + c.valor, 0) + sinCobro.reduce((t, x) => t + x.valor, 0);
    const pendiente = nuevas.reduce((t, c) => t + c.pendiente, 0) + sinCobro.reduce((t, x) => t + x.valor, 0);
    const idsNuevas = new Set(nuevas.flatMap((c) => c.cobros.map((v) => v.id)));
    const cashNuevas = lista.filter((v) => idsNuevas.has(v.id)).reduce((t, v) => t + netoDe(v), 0);
    const brutoNuevas = lista.filter((v) => idsNuevas.has(v.id)).reduce((t, v) => t + v.importe, 0);
    const nVentas = nuevas.length + sinCobro.length;
    return {
      conLlamada, lista, total: Math.round(total), n: compradoras.size, cobros: lista.length, deLlamada: compradorasLlamada.size, totalLlamada: Math.round(deLlamada.reduce((s, v) => s + v.importe, 0)), emailsLlamada,
      nuevas, sinCobro, facturacion: Math.round(facturacion), pendiente: Math.round(pendiente), nVentas,
      ticket: nVentas ? Math.round(facturacion / nVentas) : null, cashNuevas: Math.round(cashNuevas), cashAnteriores: Math.round(total - cashNuevas),
      bruto: Math.round(bruto), comisionesPeriodo: Math.round(bruto - total), brutoNuevas: Math.round(brutoNuevas),
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cobradas, desde, datos.agendas, resultados, valores, comisiones]);

  const gastoVacio = () => ({ id: "", concepto: "", categoria: CATEGORIAS_GASTO[0][0], importe: "", tipo: "mensual" as "mensual" | "puntual", fecha: hoyMadrid(), desde: `${hoyMadrid().slice(0, 8)}01`, hasta: "", captacion: true });
  const [formGasto, setFormGasto] = useState<ReturnType<typeof gastoVacio> | null>(null);
  const [guardandoGasto, setGuardandoGasto] = useState(false);
  const [errGasto, setErrGasto] = useState("");
  async function enviarGasto(cuerpo: Record<string, unknown>) {
    const r = await fetch("/api/panel/gastos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cuerpo) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.ok) throw new Error(j.error || `error ${r.status}`);
    setGastos((l) => { const i = l.findIndex((x) => x.id === j.gasto.id); if (i >= 0) { const n = [...l]; n[i] = j.gasto; return n; } return [...l, j.gasto]; });
  }
  async function guardarGasto(ev: React.FormEvent) {
    ev.preventDefault(); if (!formGasto) return;
    setGuardandoGasto(true); setErrGasto("");
    try { await enviarGasto({ ...formGasto, id: formGasto.id || undefined, hasta: formGasto.hasta || undefined }); setFormGasto(null); }
    catch (err) { setErrGasto(err instanceof Error ? err.message : "No se pudo guardar"); }
    setGuardandoGasto(false);
  }
  async function guardarGastoDirecto(g: Gasto) { try { await enviarGasto(g as unknown as Record<string, unknown>); } catch (err) { setError(`No se ha guardado: ${err instanceof Error ? err.message : "error"}`); } }
  async function borrarGasto(id: string) {
    const r = await fetch(`/api/panel/gastos?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (r.ok) setGastos((l) => l.filter((x) => x.id !== id));
  }

  async function guardarValor(clave: string, valor: number | null) {
    const prev = valores[clave];
    setValores((v) => { const n = { ...v }; if (valor == null) delete n[clave]; else n[clave] = valor; return n; });
    try {
      const r = await fetch("/api/panel/valores-venta", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clave, valor }) });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "Error");
    } catch (err) {
      setValores((v) => { const n = { ...v }; if (prev == null) delete n[clave]; else n[clave] = prev; return n; });
      setError(`No se ha guardado el valor: ${err instanceof Error ? err.message : "error"}`);
    }
  }

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

  // ----- Detalle de pérdidas por paso (embudo interactivo) -----
  const [pasoSel, setPasoSel] = useState<string>("");
  const pdAgg = useMemo(() => {
    const ors = origen === "todas" ? ORIGENES.map((o) => o[0]) : [origen];
    const vacioDet = (): DetPerdida => ({ estado: {}, turnos: {}, cat: {}, ej: {} });
    const t = { franja: {} as Record<string, number>, perdFranja: {} as Record<string, number>, seg: 0, sinSeg: 0, p2: vacioDet(), p3: vacioDet(), sinContestar: [] as { u: string; c: string; ult: string; h: number; dia: string }[], datos: [] as { u: string; c: string; dia: string }[], dias: 0 };
    const suma = (a: Record<string, number>, b?: Record<string, number>) => Object.entries(b || {}).forEach(([k, v]) => { a[k] = (a[k] || 0) + (Number(v) || 0); });
    const sumaDet = (a: DetPerdida, b?: DetPerdida) => { if (!b) return; suma(a.estado, b.estado); suma(a.turnos, b.turnos); suma(a.cat, b.cat); Object.entries(b.ej || {}).forEach(([k, v]) => { const l = (a.ej[k] ||= []); v.forEach((x) => { if (l.length < 4 && !l.includes(x)) l.push(x); }); }); };
    diasEmbudo.forEach((d) => {
      if (!d.pd) return;
      t.dias++;
      ors.forEach((o) => {
        const p = d.pd?.[o]; if (!p) return;
        suma(t.franja, p.p1_franja); suma(t.perdFranja, p.p1_perdidas_franja); t.seg += p.p1_seguimiento || 0; t.sinSeg += p.p1_sin_seguimiento || 0;
        sumaDet(t.p2, p.p2); sumaDet(t.p3, p.p3);
        (p.sin_contestar || []).forEach((x) => t.sinContestar.push({ ...x, dia: d.fecha }));
        (p.datos || []).forEach((x) => t.datos.push({ ...x, dia: d.fecha }));
      });
    });
    return t;
  }, [diasEmbudo, origen]);

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
  const sparkVentas = hayVentasAuto
    ? porDia((d) => cobradas.filter((v) => String(v.fecha).slice(0, 10) === d).reduce((s, v) => s + v.importe, 0))
    : porDia((d) => llamadas.filter((l) => l.vendido === "si" && String(l.fecha).slice(0, 10) === d).reduce((s, l) => s + (l.importe || 0), 0));
  const facturacionMostrada = hayVentasAuto ? ventasPeriodo.facturacion : ventas.facturacion;
  const cashMostrado = hayVentasAuto ? ventasPeriodo.total : null;
  const ticketMostrado = hayVentasAuto ? ventasPeriodo.ticket : ventas.ticket;

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
      .map((p) => { const t = por.get(p.codigo) || { entran: 0, conversan: 0, final: 0, ids: [] }; const ig = (p.id && datos.instagram?.medios?.[p.id]) || {}; return { ...p, ...t, ig, agendan: new Set(t.ids.filter((x) => conAgenda.has(x))).size }; })
      .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  }, [datos.publicaciones, datos.contenido, datos.agendas, datos.instagram]);
  const hayIg = contenido.some((c) => Object.keys(c.ig).length > 0);
  const medidaPost = (c: (typeof contenido)[number]) => (hayIg ? num(c.ig.views) || num(c.ig.reach) : c.likes);
  const maxLikes = Math.max(1, ...contenido.map(medidaPost));
  const [ordenPosts, setOrdenPosts] = useState<"fecha" | "views" | "follows" | "entran">("fecha");
  const postsOrdenados = useMemo(() => {
    const l = contenido.slice();
    if (ordenPosts === "views") l.sort((a, b) => num(b.ig.views) - num(a.ig.views));
    if (ordenPosts === "follows") l.sort((a, b) => num(b.ig.follows) - num(a.ig.follows));
    if (ordenPosts === "entran") l.sort((a, b) => b.entran - a.entran);
    return l;
  }, [contenido, ordenPosts]);

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

  // ----- Anuncios (Meta) -----
  const igDia = useMemo(() => datos.instagram?.seguidores_dia || {}, [datos.instagram]);
  const anuncios = useMemo(() => {
    const filas = (datos.anuncios?.filas || []).filter((f) => f.fecha >= desde && f.fecha <= hoy);
    const porDiaM = new Map<string, { gasto: number; clics: number; impresiones: number }>();
    const porAnuncio = new Map<string, { anuncio: string; campana: string; gasto: number; impresiones: number; alcance: number; clics: number; dias: Set<string>; ultimo: string }>();
    const porCampana = new Map<string, { campana: string; gasto: number; impresiones: number; clics: number; anuncios: Set<string>; dias: Set<string> }>();
    for (const f of filas) {
      const d = porDiaM.get(f.fecha) || { gasto: 0, clics: 0, impresiones: 0 };
      d.gasto += f.gasto; d.clics += f.clics; d.impresiones += f.impresiones; porDiaM.set(f.fecha, d);
      const a = porAnuncio.get(f.anuncio_id) || { anuncio: f.anuncio, campana: f.campana, gasto: 0, impresiones: 0, alcance: 0, clics: 0, dias: new Set<string>(), ultimo: "" };
      a.gasto += f.gasto; a.impresiones += f.impresiones; a.alcance += f.alcance; a.clics += f.clics; if (f.gasto > 0) a.dias.add(f.fecha); if (f.fecha > a.ultimo && f.gasto > 0) a.ultimo = f.fecha; porAnuncio.set(f.anuncio_id, a);
      const c = porCampana.get(f.campana) || { campana: f.campana, gasto: 0, impresiones: 0, clics: 0, anuncios: new Set<string>(), dias: new Set<string>() };
      c.gasto += f.gasto; c.impresiones += f.impresiones; c.clics += f.clics; c.anuncios.add(f.anuncio_id); if (f.gasto > 0) c.dias.add(f.fecha); porCampana.set(f.campana, c);
    }
    const gasto = filas.reduce((t, f) => t + f.gasto, 0);
    const impresiones = filas.reduce((t, f) => t + f.impresiones, 0);
    const clics = filas.reduce((t, f) => t + f.clics, 0);
    const diasIg = Object.keys(igDia).filter((d) => d >= desde && d <= hoy);
    const seguidoresIg = diasIg.reduce((t, d) => t + num(igDia[d]), 0);
    return {
      gasto, impresiones, clics, seguidoresIg, diasIg: diasIg.length, porDia: porDiaM,
      anuncios: Array.from(porAnuncio.values()).filter((a) => a.gasto > 0).sort((a, b) => b.gasto - a.gasto),
      campanas: Array.from(porCampana.values()).filter((c) => c.gasto > 0).sort((a, b) => b.gasto - a.gasto),
    };
  }, [datos.anuncios, igDia, desde, hoy]);
  const hayAnuncios = Boolean(datos.anuncios?.filas?.length);

  // ----- Gastos (editables) prorrateados al periodo -----
  const [gastos, setGastos] = useState<Gasto[]>(datos.gastos || []);
  const gastosPeriodo = useMemo(() => {
    const diasEntre = (a: string, b: string) => Math.max(0, Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 864e5) + 1);
    const lineas = gastos.map((g) => {
      let imp = 0;
      if (g.tipo === "puntual") imp = g.fecha && g.fecha >= desde && g.fecha <= hoy ? g.importe : 0;
      else if (g.desde) {
        const ini = g.desde > desde ? g.desde : desde, fin = g.hasta && g.hasta < hoy ? g.hasta : hoy;
        imp = ini <= fin ? (g.importe * 12 / 365) * diasEntre(ini, fin) : 0;
      }
      return { g, imp };
    });
    const total = lineas.reduce((t, l) => t + l.imp, 0);
    const captacion = lineas.filter((l) => l.g.captacion).reduce((t, l) => t + l.imp, 0);
    const porCat: Record<string, { total: number; captacion: number }> = {};
    lineas.forEach((l) => { const c = (porCat[l.g.categoria] ||= { total: 0, captacion: 0 }); c.total += l.imp; if (l.g.captacion) c.captacion += l.imp; });
    return { lineas, total, captacion, porCat };
  }, [gastos, desde, hoy]);
  const [incluirGastos, setIncluirGastos] = useState(true);
  const costeCaptacion = anuncios.gasto + gastosPeriodo.captacion;
  const baseCoste = incluirGastos ? costeCaptacion : anuncios.gasto;
  const gastoTotal = anuncios.gasto + gastosPeriodo.total;
  const cpm = anuncios.impresiones ? (1000 * anuncios.gasto) / anuncios.impresiones : null;
  const diasAnuncios = useMemo(() => serieDias.map((d) => {
    const m = anuncios.porDia.get(d) || { gasto: 0, clics: 0, impresiones: 0 };
    const f = embPorFecha.get(d);
    return { fecha: d, gasto: m.gasto, clics: m.clics, seguidores: igDia[d] == null ? null : num(igDia[d]), bienvenidas: f ? f.b_env : null };
  }), [serieDias, anuncios.porDia, embPorFecha, igDia]);

  // ----- Agenda semanal -----
  const [semana, setSemana] = useState(0);
  const lunesDe = (iso: string) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7)); return d.toISOString().slice(0, 10); };
  const lunes = sumarDias(lunesDe(hoy), 7 * semana);
  const diasSemana = Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i));
  const agendaSemana = useMemo(() => datos.agendas
    .filter((a) => { const d = String(a.fecha).slice(0, 10); return d >= lunes && d <= sumarDias(lunes, 6); })
    .sort((a, b) => (a.fecha < b.fecha ? -1 : 1))
    .map((a) => ({ ...evaluar(a), cancelada: a.estado === "CANCELLED" })), [datos.agendas, lunes, evaluar]);
  const resSemana = useMemo(() => {
    const act = agendaSemana.filter((l) => !l.cancelada);
    const pas = act.filter((l) => l.pasada);
    return {
      total: act.length, canceladas: agendaSemana.length - act.length, proximas: act.length - pas.length,
      vinieron: pas.filter((l) => l.asistio === "si").length, novinieron: pas.filter((l) => l.asistio === "no").length,
      sinMarcar: pas.filter((l) => !l.asistio || (l.asistio === "si" && !l.vendido)).length,
      vendidas: act.filter((l) => l.vendido === "si").length, facturado: act.reduce((t, l) => t + (l.vendido === "si" ? l.importe || 0 : 0), 0),
    };
  }, [agendaSemana]);
  const DIAS_SEM = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const estadoLlamada = (l: (typeof agendaSemana)[number]): [string, Tono] =>
    l.cancelada ? ["Cancelada", "neutro"] : !l.pasada ? ["Próxima", "neutro"] : l.vendido === "si" ? ["Vendida", "ok"] : l.asistio === "si" && l.vendido === "no" ? ["Vino, no compró", "warn"] : l.asistio === "no" ? ["No vino", "bad"] : l.asistio === "si" ? ["Vino · ¿compró?", "warn"] : ["Sin marcar", "warn"];

  // ----- Estudio nocturno -----
  const [estudioSel, setEstudioSel] = useState(0);
  const estudio = datos.estudios?.[estudioSel] || null;
  const [copiado, setCopiado] = useState("");
  const copiar = async (clave: string, texto: string) => { try { await navigator.clipboard.writeText(texto); setCopiado(clave); setTimeout(() => setCopiado(""), 1800); } catch {} };
  const [cuentasTxt, setCuentasTxt] = useState((datos.competidores || []).map((c) => `@${c}`).join("\n"));
  const [msgCuentas, setMsgCuentas] = useState("");
  async function guardarCuentas() {
    setMsgCuentas("Guardando…");
    try {
      const r = await fetch("/api/panel/competidores", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cuentas: cuentasTxt.split(/[\s,;]+/).filter(Boolean) }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(j.error || `error ${r.status}`);
      setCuentasTxt(j.cuentas.map((c: string) => `@${c}`).join("\n"));
      setMsgCuentas(`Guardadas ${j.cuentas.length} cuentas. Se leen en la próxima actualización.`);
    } catch (err) { setMsgCuentas(`No se pudo guardar: ${err instanceof Error ? err.message : "error"}`); }
  }

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

  const vacio = { fecha: hoyMadrid(), importe: "", neto: "", nombre: "", email: "", producto: "", metodo: "Transferencia", agendaId: "", nota: "" };
  const [formVenta, setFormVenta] = useState<typeof vacio | null>(null);
  const [guardandoVenta, setGuardandoVenta] = useState(false);
  const [errVenta, setErrVenta] = useState("");

  async function guardarVenta(ev: React.FormEvent) {
    ev.preventDefault();
    if (!formVenta) return;
    setGuardandoVenta(true); setErrVenta("");
    const ag = datos.agendas.find((a) => a.id === formVenta.agendaId);
    const cuerpo = { ...formVenta, importe: Number(String(formVenta.importe).replace(",", ".")), nombre: formVenta.nombre || ag?.nombre || "", email: formVenta.email || ag?.email || "" };
    try {
      const r = await fetch("/api/panel/ventas-manuales", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cuerpo) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(j.error || `error ${r.status}`);
      setManuales((m) => [...m, j.venta]);
      setFormVenta(null);
    } catch (err) {
      setErrVenta(err instanceof Error ? err.message : "No se pudo guardar");
    }
    setGuardandoVenta(false);
  }

  async function borrarVenta(id: string) {
    const r = await fetch(`/api/panel/ventas-manuales?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (r.ok) setManuales((m) => m.filter((v) => v.id !== id));
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
          {datos.estudios?.length > 0 && <button type="button" className="pn-link" onClick={() => irA("estudio")}>Ver propuestas para romperlo →</button>}
        </>
      ) : <p>Aún no hay datos suficientes en este periodo.</p>}
    </div>
  );

  // ----- Embudo interactivo -----
  const capas = [{ id: "entran", nombre: "Entran", n: e.entran }, ...pasos.map((p) => ({ id: p.id, nombre: p.nombre, n: p.a }))];
  const anchoCapa = (n: number) => 24 + 76 * Math.pow(Math.max(0, n) / Math.max(1, e.entran), 0.45);
  const COLORES_CAPA = ["#2b2a2e", "#4a3b57", "#6b4a82", "#8f57a8", "#b46bbf", "#d77fc4", "#ec9ccd"];
  const sel = pasos.find((p) => p.id === (pasoSel || cuello?.id || "responden")) || pasos[0];
  const vistaEmbudo = (
    <div className="pn-fun">
      {capas.map((c, i) => {
        const w = anchoCapa(c.n), w2 = i < capas.length - 1 ? anchoCapa(capas[i + 1].n) : w * 0.85;
        const inset = Math.max(0, ((w - Math.min(w, w2)) / 2 / w) * 100);
        const p = i > 0 ? pasos[i - 1] : null;
        return (
          <div key={c.id} className="pn-fun-fila">
            {p && (
              <button type="button" className={`pn-fun-drop tono-${p.tono}${sel?.id === p.id ? " is-sel" : ""}`} onClick={() => setPasoSel(p.id)} aria-pressed={sel?.id === p.id}>
                <span className="pn-fun-drop-pasa">↓ pasa el {pct(p.tasa)}</span>
                <span className="pn-fun-drop-pierde">se pierden <b>{int(p.perdidas)}</b>{p.tasa != null && ` (${100 - p.tasa}%)`}</span>
                <small>objetivo {p.obj}%{cuello?.id === p.id ? " · cuello de botella" : ""}</small>
              </button>
            )}
            <button type="button" className={`pn-fun-capa${sel && (sel.id === c.id || (i === 0 && sel.id === "responden")) ? " is-sel" : ""}`}
              style={{ width: `${w}%`, background: COLORES_CAPA[i], clipPath: `polygon(0 0, 100% 0, ${100 - inset}% 100%, ${inset}% 100%)` }}
              onClick={() => setPasoSel(i === 0 ? "responden" : c.id)} aria-label={`${c.nombre}: ${int(c.n)}`}>
              <span>{c.nombre}</span><b>{int(c.n)}</b>
            </button>
          </div>
        );
      })}
      {e.facturacion > 0 && <p className="pn-sub pn-fun-pie">Facturación de estas personas: <b>{eur(e.facturacion)}</b></p>}
    </div>
  );

  const conAgendaIds = new Set(datos.agendas.filter((a) => a.estado !== "CANCELLED").map((a) => a.contacto));
  const igLink = (u: string) => (u ? <a href={`https://instagram.com/${u}`} target="_blank" rel="noopener noreferrer">@{u}</a> : <span className="pn-sub">sin usuario</span>);
  const bloqueParada = (d: DetPerdida, total: number, sinContestar: typeof pdAgg.sinContestar) => {
    const est = d.estado, tot = (est.curso || 0) + (est.persona || 0) + (est.setter || 0);
    const cats = Object.entries(d.cat).sort((a, b) => b[1] - a[1]);
    const maxCat = Math.max(1, ...cats.map((x) => x[1]));
    const turnos = ["1", "2", "3", "4-5", "6+"].map((k) => [k, d.turnos[k] || 0] as const);
    const maxT = Math.max(1, ...turnos.map((x) => x[1]));
    if (!tot) return <p className="pn-sub">El detalle se calcula en la próxima actualización completa (cada hora). Personas en este paso: {int(total)}.</p>;
    return (
      <>
        <h4>Quién dejó de contestar</h4>
        <FilaBarra etiqueta="Dejaron de contestarnos ellas" valor={est.persona || 0} max={tot} derecha={`${int(est.persona)} · ${pct(ratio(est.persona || 0, tot))}`} />
        <FilaBarra etiqueta="Les dejamos sin contestar nosotros" valor={est.setter || 0} max={tot} tono={(est.setter || 0) > 0 ? "bad" : "ok"} derecha={`${int(est.setter)} · ${pct(ratio(est.setter || 0, tot))}`} sub={(est.setter || 0) > 0 ? "Su último mensaje lleva más de 24 h sin respuesta. Son las más fáciles de recuperar: abajo tienes la lista." : undefined} />
        <FilaBarra etiqueta="Siguen hablando (menos de 24 h)" valor={est.curso || 0} max={tot} derecha={`${int(est.curso)} · ${pct(ratio(est.curso || 0, tot))}`} sub="Aún no se pueden dar por perdidas." />
        {cats.length > 0 && (
          <>
            <h4>Después de qué mensaje del setter se callan</h4>
            {cats.map(([k, v]) => (
              <details key={k} className="pn-fun-cat">
                <summary><FilaBarra etiqueta={CAT_PREGUNTA[k] || k} valor={v} max={maxCat} tono={k === cats[0][0] ? "bad" : "neutro"} derecha={`${int(v)} · ${pct(ratio(v, est.persona || 0))}`} /></summary>
                {(d.ej[k] || []).length > 0 && <ul>{(d.ej[k] || []).map((x) => <li key={x}>«{x}»</li>)}</ul>}
              </details>
            ))}
            <p className="pn-sub">Pincha en cada fila para ver ejemplos del mensaje exacto.</p>
          </>
        )}
        <h4>Cuántas veces respondieron antes de pararse</h4>
        <div className="pn-fun-turnos">
          {turnos.map(([k, v]) => (
            <div key={k}><div className="pn-fun-turno-barra"><div style={{ height: `${(100 * v) / maxT}%` }} /></div><b>{int(v)}</b><small>{k === "1" ? "1 vez" : `${k} veces`}</small></div>
          ))}
        </div>
        {sinContestar.length > 0 && (
          <>
            <h4>Escríbeles hoy: se quedaron sin respuesta</h4>
            <ul className="pn-fun-lista">
              {sinContestar.slice(0, 25).map((x) => <li key={x.c}>{igLink(x.u)} <span className="pn-sub">· hace {x.h >= 48 ? `${Math.round(x.h / 24)} días` : `${x.h} h`}</span><q>{x.ult}</q></li>)}
            </ul>
          </>
        )}
      </>
    );
  };

  const llamadasPasadas = llamadas.filter((l) => l.pasada);
  const antelacion = (l: { fecha: string; reservada: string }) => { const d = Math.round((new Date(l.fecha).getTime() - new Date(l.reservada).getTime()) / 864e5); return d < 1 ? "El mismo día" : d <= 2 ? "1-2 días antes" : d <= 6 ? "3-6 días antes" : "7 días o más"; };
  const grupoTasa = <T,>(lista: T[], clave: (x: T) => string, ok: (x: T) => boolean, orden: string[]) => orden.map((k) => { const g = lista.filter((x) => clave(x) === k); return { k, n: g.length, ok: g.filter(ok).length }; }).filter((x) => x.n > 0);

  let detalleEmbudo: React.ReactNode = null;
  if (sel) {
    const cab = (
      <div className={`pn-fun-det-cab tono-${sel.tono}`}>
        <span className="pn-cuello-eti">{capas[pasos.indexOf(sel)].nombre} → {sel.nombre}{cuello?.id === sel.id ? " · cuello de botella" : ""}</span>
        <strong>Se pierden {int(sel.perdidas)} de {int(sel.de)} ({sel.tasa == null ? "—" : `${100 - sel.tasa}%`})</strong>
        <p>Pasa el <b>{pct(sel.tasa)}</b>; el objetivo es el {sel.obj}%.{sel.tasa != null && sel.tasa < sel.obj && sel.de > 0 ? ` Llegar al objetivo serían ${int(Math.round((sel.obj * sel.de) / 100) - sel.a)} personas más en este paso.` : ""}</p>
      </div>
    );
    let cuerpo: React.ReactNode = null;
    if (sel.id === "responden") {
      const filasF = FRANJAS.map((f) => ({ f, n: pdAgg.franja[f] || 0, perd: pdAgg.perdFranja[f] || 0 })).filter((x) => x.n > 0);
      const perdTot = pdAgg.seg + pdAgg.sinSeg;
      cuerpo = (
        <>
          <h4>Por dónde entraron</h4>
          {porOrigen.filter((r) => r.entran > 0).map((r) => (
            <FilaBarra key={r.o} etiqueta={r.n} valor={Math.max(0, r.entran - r.conversan)} max={Math.max(1, ...porOrigen.map((x) => x.entran - x.conversan))} tono={tonoObjetivo(ratio(r.conversan, r.entran), OBJETIVOS.responden)}
              derecha={`no responden ${int(Math.max(0, r.entran - r.conversan))}`} sub={`responde el ${pct(ratio(r.conversan, r.entran))} (${int(r.conversan)} de ${int(r.entran)})`} />
          ))}
          {filasF.length > 0 && (
            <>
              <h4>Según la hora de nuestro primer mensaje</h4>
              {filasF.map((x) => { const t = ratio(x.n - x.perd, x.n); return (
                <FilaBarra key={x.f} etiqueta={`${x.f} h`} valor={x.n - x.perd} max={Math.max(1, ...filasF.map((y) => y.n - y.perd))} tono={x.n < 30 ? "neutro" : tonoObjetivo(t, OBJETIVOS.responden)} derecha={`responde el ${pct(t)}`} sub={`${int(x.n - x.perd)} de ${int(x.n)} envíos${x.n < 30 ? " · pocos casos" : ""}`} />
              ); })}
              <p className="pn-sub">Solo bienvenidas y mensajes a seguidoras. Con menos de 30 envíos en una franja, el porcentaje no es fiable.</p>
            </>
          )}
          {perdTot > 0 && (
            <>
              <h4>¿Recibieron un segundo mensaje?</h4>
              <FilaBarra etiqueta="No: solo el primer mensaje" valor={pdAgg.sinSeg} max={perdTot} tono={pdAgg.sinSeg / perdTot > 0.8 ? "bad" : "neutro"} derecha={`${int(pdAgg.sinSeg)} · ${pct(ratio(pdAgg.sinSeg, perdTot))}`} />
              <FilaBarra etiqueta="Sí, y tampoco respondieron" valor={pdAgg.seg} max={perdTot} derecha={`${int(pdAgg.seg)} · ${pct(ratio(pdAgg.seg, perdTot))}`} />
            </>
          )}
          <button type="button" className="pn-link" onClick={() => irA("captacion")}>Ver cada plantilla de primer mensaje en Captación →</button>
        </>
      );
    } else if (sel.id === "final") {
      cuerpo = bloqueParada(pdAgg.p2, sel.perdidas, pdAgg.sinContestar);
    } else if (sel.id === "datos") {
      cuerpo = bloqueParada(pdAgg.p3, sel.perdidas, []);
    } else if (sel.id === "agendan") {
      const sinAgenda = pdAgg.datos.filter((x) => !conAgendaIds.has(x.c));
      cuerpo = (
        <>
          <h4>Dieron sus datos y no han reservado la llamada ({int(sinAgenda.length)})</h4>
          {sinAgenda.length ? <ul className="pn-fun-lista">{sinAgenda.slice(0, 40).map((x) => <li key={x.c}>{igLink(x.u)} <span className="pn-sub">· entró el {dia(x.dia)}</span></li>)}</ul> : <p className="pn-sub">Nadie en este periodo (o se calcula en la próxima actualización).</p>}
          <p className="pn-sub">Son las más calientes del embudo: ya han dado su correo. Un mensaje o un audio con el enlace del calendario suele bastar.</p>
        </>
      );
    } else if (sel.id === "vienen") {
      const conMarca = llamadasPasadas.filter((l) => l.asistio === "si" || l.asistio === "no");
      const porAnt = grupoTasa(conMarca, antelacion, (l) => l.asistio === "si", ["El mismo día", "1-2 días antes", "3-6 días antes", "7 días o más"]);
      const porHora = grupoTasa(conMarca, (l) => franjaHora(l.fecha), (l) => l.asistio === "si", FRANJAS);
      const porSetter = grupoTasa(conMarca, (l) => (l.setter === "sí" ? "La agendó el setter" : "Reservó por su cuenta"), (l) => l.asistio === "si", ["La agendó el setter", "Reservó por su cuenta"]);
      const noVinieron = conMarca.filter((l) => l.asistio === "no");
      const filas = (g: { k: string; n: number; ok: number }[]) => g.map((x) => <FilaBarra key={x.k} etiqueta={x.k} valor={x.ok} max={Math.max(1, ...g.map((y) => y.n))} tono={x.n < 5 ? "neutro" : tonoObjetivo(ratio(x.ok, x.n), OBJETIVOS.vienen)} derecha={`vienen ${pct(ratio(x.ok, x.n))}`} sub={`${int(x.ok)} de ${int(x.n)}${x.n < 5 ? " · pocos casos" : ""}`} />);
      cuerpo = (
        <>
          <p className="pn-sub">Llamadas pasadas del periodo que tienen marcado si vino o no: {int(conMarca.length)}.</p>
          <h4>Según cuánto antes reservaron</h4>{filas(porAnt)}
          <h4>Según la hora de la llamada</h4>{filas(porHora)}
          <h4>Según quién la agendó</h4>{filas(porSetter)}
          {noVinieron.length > 0 && <><h4>No vinieron</h4><ul className="pn-fun-lista">{noVinieron.map((l) => <li key={l.id}><b>{l.nombre || "Sin nombre"}</b> {l.instagram && igLink(l.instagram)} <span className="pn-sub">· {fechaHora(l.fecha)} · reservó {antelacion(l).toLowerCase()}</span></li>)}</ul></>}
        </>
      );
    } else if (sel.id === "compran") {
      const vinieron = llamadasPasadas.filter((l) => l.asistio === "si");
      const marcadas = vinieron.filter((l) => l.vendido === "si" || l.vendido === "no");
      const porSetter = grupoTasa(marcadas, (l) => (l.setter === "sí" ? "La agendó el setter" : "Reservó por su cuenta"), (l) => l.vendido === "si", ["La agendó el setter", "Reservó por su cuenta"]);
      const porAnt = grupoTasa(marcadas, antelacion, (l) => l.vendido === "si", ["El mismo día", "1-2 días antes", "3-6 días antes", "7 días o más"]);
      const noCompraron = marcadas.filter((l) => l.vendido === "no");
      const sinMarcar = vinieron.filter((l) => !l.vendido);
      const filas = (g: { k: string; n: number; ok: number }[]) => g.map((x) => <FilaBarra key={x.k} etiqueta={x.k} valor={x.ok} max={Math.max(1, ...g.map((y) => y.n))} tono={x.n < 5 ? "neutro" : tonoObjetivo(ratio(x.ok, x.n), OBJETIVOS.compran)} derecha={`compran ${pct(ratio(x.ok, x.n))}`} sub={`${int(x.ok)} de ${int(x.n)}${x.n < 5 ? " · pocos casos" : ""}`} />);
      cuerpo = (
        <>
          <p className="pn-sub">Llamadas del periodo en las que la persona vino: {int(vinieron.length)}{sinMarcar.length ? ` (${int(sinMarcar.length)} sin marcar si compró)` : ""}.</p>
          <h4>Según quién la agendó</h4>{filas(porSetter)}
          <h4>Según cuánto antes reservaron</h4>{filas(porAnt)}
          {noCompraron.length > 0 && <><h4>Vinieron y no compraron (seguimiento)</h4><ul className="pn-fun-lista">{noCompraron.map((l) => <li key={l.id}><b>{l.nombre || "Sin nombre"}</b> {l.instagram && igLink(l.instagram)} <span className="pn-sub">· {fechaHora(l.fecha)}</span></li>)}</ul></>}
        </>
      );
    }
    detalleEmbudo = <>{cab}<div className="pn-fun-det-cuerpo">{cuerpo}</div></>;
  }

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
              <Kpi etiqueta="Facturación" valor={eur(facturacionMostrada)} pie={`${hayVentasAuto ? `${int(ventasPeriodo.nVentas)} ventas nuevas · ` : ""}ticket medio ${eur(ticketMostrado)}`} />
              {cashMostrado != null && <Kpi etiqueta="Cash collect" valor={eur(cashMostrado)} pie={`cobrado en el periodo · ${eur(ventasPeriodo.pendiente)} pendiente de cobro`} spark={sparkVentas} />}
              {cashMostrado != null && <Kpi etiqueta="Beneficio (caja)" valor={eur(cashMostrado - gastoTotal)} tono={cashMostrado - gastoTotal >= 0 ? "ok" : "bad"} pie={`cash ${eur(cashMostrado)} − gastos ${eur(gastoTotal)}`} />}
              <Kpi etiqueta="Coste por agenda" valor={eur(coste(costeCaptacion, ventas.reservadas))} pie={`captación ${eur(costeCaptacion)} · venta ${eur(coste(costeCaptacion, hayVentasAuto ? ventasPeriodo.nVentas : ventas.cerradas))}`} />
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
            <div className="pn-fun-layout">
              <Seccion titulo="Embudo" sub="Pincha en una capa o en lo que se pierde entre dos capas para ver exactamente dónde se queda la gente.">
                {vistaEmbudo}
              </Seccion>
              <div className="pn-fun-det" aria-live="polite">{detalleEmbudo}</div>
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
            <Seccion titulo="De dónde entra cada conversación, día a día" sub="Personas que empiezan a hablar con nosotros cada día, según cómo llegan. Entre paréntesis, cuántas de ellas conversan (responden por privado).">
              <div className="pn-tablewrap">
                <table className="pn-table">
                  <thead><tr><th>Día</th>{ORIGENES.map(([o, n]) => <th key={o} className="r"><i className="pn-cuadro" style={{ background: COLOR_ORIGEN[o] }} />{n}</th>)}<th className="r">Total</th></tr></thead>
                  <tbody>
                    {diasEmbudo.length ? diasEmbudo.slice().reverse().map((d) => (
                      <tr key={d.fecha}>
                        <td>{dia(d.fecha)}{d.fecha === hoy && <span className="pn-vivo">hoy</span>}</td>
                        {ORIGENES.map(([o]) => <td key={o} className="r">{num(d[`${o}_entran`]) ? <>{int(num(d[`${o}_entran`]))} <span className="pn-sub">({int(num(d[`${o}_conversan`]))})</span></> : "—"}</td>)}
                        <td className="r"><b>{int(ORIGENES.reduce((t, [o]) => t + num(d[`${o}_entran`]), 0))}</b> <span className="pn-sub">({int(ORIGENES.reduce((t, [o]) => t + num(d[`${o}_conversan`]), 0))})</span></td>
                      </tr>
                    )) : <tr><td colSpan={ORIGENES.length + 2} className="pn-vacio">Todavía no hay días calculados.</td></tr>}
                    {diasEmbudo.length > 0 && (
                      <tr className="pn-total">
                        <td>Total</td>
                        {ORIGENES.map(([o]) => { const en = diasEmbudo.reduce((t, d) => t + num(d[`${o}_entran`]), 0), cv = diasEmbudo.reduce((t, d) => t + num(d[`${o}_conversan`]), 0); return <td key={o} className="r">{int(en)} <span className="pn-sub">({int(cv)} · {pct(ratio(cv, en))})</span></td>; })}
                        <td className="r">{int(e.entran)} <span className="pn-sub">({int(e.conversan)})</span></td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="pn-sub">Lead magnet: comentan una palabra clave (o una o dos palabras) en un reel y les escribimos por privado. Palabra clave: nos escriben por privado QUIERO, INFO u otra palabra de los disparadores de Ninjo. Historia: el setter les escribe porque reaccionaron a una historia.</p>
            </Seccion>
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

        {pestana === "agenda" && (
          <>
            <div className="pn-sem-nav">
              <button type="button" className="pn-btn pn-btn-sec" onClick={() => setSemana((x) => x - 1)} aria-label="Semana anterior">←</button>
              <div><b>{semana === 0 ? "Esta semana" : semana === 1 ? "La semana que viene" : semana === -1 ? "La semana pasada" : `Semana del ${dia(lunes)}`}</b><small>{dia(lunes)} – {dia(sumarDias(lunes, 6))}</small></div>
              <button type="button" className="pn-btn pn-btn-sec" onClick={() => setSemana((x) => x + 1)} aria-label="Semana siguiente">→</button>
              {semana !== 0 && <button type="button" className="pn-link" onClick={() => setSemana(0)}>Volver a esta semana</button>}
            </div>
            <div className="pn-kpis">
              <Kpi destacado etiqueta="Llamadas" valor={int(resSemana.total)} pie={`${int(resSemana.proximas)} por hacer · ${int(resSemana.canceladas)} canceladas`} />
              <Kpi etiqueta="Vinieron" valor={int(resSemana.vinieron)} pie={`${int(resSemana.novinieron)} no vinieron`} tono={resSemana.vinieron + resSemana.novinieron ? tonoObjetivo(ratio(resSemana.vinieron, resSemana.vinieron + resSemana.novinieron), OBJETIVOS.vienen) : "neutro"} />
              <Kpi etiqueta="Ventas" valor={int(resSemana.vendidas)} pie={resSemana.facturado ? `${eur(resSemana.facturado)} facturados` : "en llamadas de esta semana"} />
              <Kpi etiqueta="Por marcar" valor={int(resSemana.sinMarcar)} pie="llamadas pasadas sin resultado" tono={resSemana.sinMarcar ? "warn" : "ok"} />
            </div>
            {error && <p className="pn-err" role="alert">{error}</p>}
            <div className="pn-sem">
              {diasSemana.map((d, i) => {
                const delDia = agendaSemana.filter((l) => String(l.fecha).slice(0, 10) === d);
                return (
                  <section key={d} className={`pn-sem-dia${d === hoy ? " is-hoy" : ""}${d < hoy ? " is-pasado" : ""}`} aria-label={`${DIAS_SEM[i]} ${dia(d)}`}>
                    <header><b>{DIAS_SEM[i]}</b><span>{dia(d)}</span>{d === hoy && <span className="pn-vivo">hoy</span>}</header>
                    {delDia.length ? delDia.map((l) => {
                      const [txt, tono] = estadoLlamada(l);
                      return (
                        <article key={l.id} className={`pn-cita tono-${tono}${l.cancelada ? " is-cancelada" : ""}`}>
                          <div className="pn-cita-top"><span className="pn-cita-hora">{String(l.fecha).slice(11, 16)}</span><span className={`pn-pill tono-${tono}`}>{txt}</span></div>
                          <b className="pn-cita-nombre">{l.nombre || "Sin nombre"}</b>
                          <div className="pn-cita-datos">
                            {l.instagram && <a href={`https://instagram.com/${l.instagram}`} target="_blank" rel="noopener noreferrer">@{l.instagram}</a>}
                            {l.telefono && <a href={`tel:${l.telefono}`}>{l.telefono}</a>}
                            {l.setter === "sí" && <span className="pn-pill tono-neutro">la agendó el setter</span>}
                          </div>
                          {l.pasada && !l.cancelada && (
                            <div className="pn-cita-marcar">
                              <span>¿Vino?</span><SiNo valor={l.asistio} etiqueta={`¿Vino ${l.nombre}?`} onCambio={(v) => marcar(l.id, { asistio: v })} />
                              <span>¿Compró?</span><SiNo valor={l.vendido} etiqueta={`¿Compró ${l.nombre}?`} desactivado={l.asistio !== "si"} onCambio={(v) => marcar(l.id, { asistio: "si", vendido: v })} />
                              {l.vendido === "si" && l.importe ? <span className="pn-cita-imp">{eur(l.importe)}{l.auto ? " · auto" : ""}</span> : null}
                            </div>
                          )}
                        </article>
                      );
                    }) : <p className="pn-sem-vacio">Sin llamadas</p>}
                  </section>
                );
              })}
            </div>
            <p className="pn-sub">Llamadas del calendario de GoHighLevel (las lee Ninjo; se actualiza cada hora y al abrir el panel). El importe se pone en «Llamadas y ventas».</p>
          </>
        )}

        {pestana === "estudio" && (
          <>
            {!estudio ? (
              <Seccion titulo="Todavía no hay ningún estudio" sub="Cada noche Claude revisa los números del panel, lee las conversaciones de Ninjo donde más gente se pierde, estudia tu contenido, el de las cuentas del sector y tus anuncios, y deja aquí propuestas concretas para probar.">
                <p className="pn-sub">El primero aparecerá mañana por la mañana.</p>
              </Seccion>
            ) : (
              <>
                <div className="pn-est-cab">
                  <div>
                    <span className="pn-cuello-eti">Estudio del {dia(estudio.fecha)}</span>
                    <h2>{estudio.titular}</h2>
                  </div>
                  {datos.estudios.length > 1 && (
                    <label className="pn-est-sel">Ver otro día
                      <select value={estudioSel} onChange={(ev) => setEstudioSel(Number(ev.target.value))}>
                        {datos.estudios.map((x, i) => <option key={x.id} value={i}>{dia(x.fecha)} · {x.titular.slice(0, 50)}</option>)}
                      </select>
                    </label>
                  )}
                </div>
                {estudio.cuello?.paso && (
                  <div className={`pn-cuello tono-${estudio.cuello.tasa != null && estudio.cuello.objetivo ? tonoObjetivo(estudio.cuello.tasa, estudio.cuello.objetivo) : "warn"}`}>
                    <span className="pn-cuello-eti">Cuello de botella detectado</span>
                    <strong>{estudio.cuello.paso}{estudio.cuello.tasa != null && ` · ${estudio.cuello.tasa}%`}{estudio.cuello.objetivo ? ` (objetivo ${estudio.cuello.objetivo}%)` : ""}</strong>
                    {estudio.cuello.detalle && <p className="pn-est-txt">{estudio.cuello.detalle}</p>}
                  </div>
                )}
                {estudio.secciones.map((sec, si) => (
                  <Seccion key={`${sec.titulo}-${si}`} titulo={sec.titulo} sub={sec.intro}>
                    <div className="pn-est-items">
                      {sec.items.map((it, ii) => (
                        <article key={ii} className="pn-est-item">
                          <div className="pn-est-item-top">{it.etiqueta && <span className={`pn-pill ${/alta|urgente/i.test(it.etiqueta) ? "tono-bad" : /media/i.test(it.etiqueta) ? "tono-warn" : "tono-neutro"}`}>{it.etiqueta}</span>}<h3>{it.titulo}</h3></div>
                          {it.texto && <p className="pn-est-txt">{it.texto}</p>}
                          {it.bloque && (
                            <div className="pn-est-bloque">
                              <pre>{it.bloque}</pre>
                              <button type="button" className="pn-link" onClick={() => copiar(`${si}-${ii}`, it.bloque || "")}>{copiado === `${si}-${ii}` ? "Copiado ✓" : "Copiar"}</button>
                            </div>
                          )}
                          {it.medir && <p className="pn-est-medir"><b>Cómo sabremos si funciona:</b> {it.medir}</p>}
                        </article>
                      ))}
                    </div>
                  </Seccion>
                ))}
                {estudio.fuentes && estudio.fuentes.length > 0 && (
                  <details className="pn-ayuda"><summary>Fuentes consultadas</summary><ul className="pn-est-fuentes">{estudio.fuentes.map((f) => <li key={f}>{/^https?:\/\//.test(f) ? <a href={f} target="_blank" rel="noopener noreferrer">{f}</a> : f}</li>)}</ul></details>
                )}
              </>
            )}
            <Seccion titulo="Cuentas del sector que se estudian" sub="Cuentas profesionales de Instagram (de creadoras o negocios) cuyo contenido se analiza cada noche: qué publicaciones traen más comentarios e interacción. Una por línea.">
              <div className="pn-est-cuentas">
                <textarea rows={6} value={cuentasTxt} onChange={(ev) => setCuentasTxt(ev.target.value)} placeholder={"@cuenta1\n@cuenta2"} aria-label="Cuentas del sector" />
                <div><button type="button" className="pn-btn" onClick={guardarCuentas}>Guardar cuentas</button>{msgCuentas && <p className="pn-sub">{msgCuentas}</p>}</div>
              </div>
            </Seccion>
          </>
        )}

        {pestana === "anuncios" && (
          !conexiones.meta ? <p className="pn-aviso">Meta Ads no está conectado: faltan META_ACCESS_TOKEN y META_AD_ACCOUNT_ID en Vercel.</p> :
          !hayAnuncios ? <p className="pn-aviso">Meta está conectado; los anuncios aparecerán en la próxima actualización.</p> : (
          <>
            <div className="pn-coste-modo">
              <div className="pn-chips" role="group" aria-label="Qué gastos se cuentan">
                <button type="button" aria-pressed={incluirGastos} onClick={() => setIncluirGastos(true)}>Anuncios + otros gastos de captación</button>
                <button type="button" aria-pressed={!incluirGastos} onClick={() => setIncluirGastos(false)}>Solo anuncios</button>
              </div>
              <p className="pn-sub">{incluirGastos ? <>Los costes por bienvenida, conversación, agenda y venta usan <b>{eur(costeCaptacion)}</b>: {eur(anuncios.gasto)} de Meta Ads + {eur(gastosPeriodo.captacion)} de otros gastos de captación del periodo. <button type="button" className="pn-link" onClick={() => irA("gastos")}>Editar gastos →</button></> : <>Solo el gasto de Meta Ads: {eur(anuncios.gasto)}.</>}</p>
            </div>
            <div className="pn-kpis">
              <Kpi destacado etiqueta="Gasto en anuncios" valor={eur(anuncios.gasto)} pie={`${eur(anuncios.gasto / dias)} al día · ${int(anuncios.campanas.length)} campañas`} spark={diasAnuncios.map((d) => d.gasto)} />
              <Kpi destacado etiqueta="Coste por seguidor" valor={eur2(coste(anuncios.gasto, anuncios.seguidoresIg))} pie={anuncios.diasIg ? `${int(anuncios.seguidoresIg)} seguidores nuevos en Instagram` : "sin datos de seguidores todavía"} spark={diasAnuncios.map((d) => d.seguidores || 0)} />
              <Kpi destacado etiqueta="Coste por bienvenida" valor={eur2(coste(baseCoste, aperturas.tot.b_env))} pie={`${int(aperturas.tot.b_env)} bienvenidas del setter`} />
              <Kpi destacado etiqueta="Coste por conversación" valor={eur2(coste(baseCoste, e.conversan))} pie={`${int(e.conversan)} personas responden y conversan`} />
              <Kpi destacado etiqueta="Coste por agenda" valor={eur(coste(baseCoste, ventas.reservadas))} pie={`${int(ventas.reservadas)} llamadas agendadas`} />
              <Kpi destacado etiqueta="Coste por venta" valor={eur(coste(baseCoste, hayVentasAuto ? ventasPeriodo.nVentas : ventas.cerradas))} pie={`${int(hayVentasAuto ? ventasPeriodo.nVentas : ventas.cerradas)} ventas nuevas`} />
              <Kpi etiqueta={incluirGastos ? "Retorno de la captación" : "Retorno (ROAS)"} valor={baseCoste ? `${(facturacionMostrada / baseCoste).toLocaleString("es-ES", { maximumFractionDigits: 1 })}x` : "—"} tono={!baseCoste ? "neutro" : facturacionMostrada / baseCoste >= 3 ? "ok" : facturacionMostrada / baseCoste >= 1 ? "warn" : "bad"} pie={`${eur(facturacionMostrada)} facturados${cashMostrado != null ? ` (${eur(cashMostrado)} cobrados)` : ""} por ${eur(baseCoste)}`} />
              <Kpi etiqueta="CPM · coste por clic" valor={eur2(cpm)} pie={`${int(anuncios.impresiones)} impresiones · ${eur2(coste(anuncios.gasto, anuncios.clics))} por clic`} />
            </div>
            <Seccion titulo="Gasto y seguidores cada día" sub="Barras: gasto del día. Al pasar por encima: seguidores nuevos de Instagram ese día y cuánto costó cada uno.">
              <Barras
                filas={diasAnuncios.map((d) => ({ x: d.fecha, g: Math.round(d.gasto), s: d.seguidores ?? -1, b: d.bienvenidas ?? -1 }))}
                series={[{ clave: "g", nombre: "Gasto (€)", color: "#343337" }]}
                etiqueta={dia} extra={(f) => `${num(f.s) >= 0 ? `${int(num(f.s))} seguidores · ${eur2(coste(num(f.g), num(f.s)))} c/u` : "seguidores: sin dato"}${num(f.b) >= 0 ? ` · ${int(num(f.b))} bienvenidas` : ""}`}
                vacio="Sin gasto en este periodo."
              />
            </Seccion>
            <Seccion titulo="Detalle por día" sub="Los seguidores nuevos son todos los de Instagram ese día (anuncios y orgánico). Meta no separa los que vienen del anuncio.">
              <div className="pn-tablewrap">
                <table className="pn-table">
                  <thead><tr><th>Día</th><th className="r">Gasto</th><th className="r">Seguidores nuevos</th><th className="r">€ / seguidor</th><th className="r">Bienvenidas</th><th className="r">€ / bienvenida</th><th className="r">Clics</th></tr></thead>
                  <tbody>
                    {diasAnuncios.slice().reverse().map((d) => (
                      <tr key={d.fecha}>
                        <td>{dia(d.fecha)}{d.fecha === hoy && <span className="pn-vivo">hoy</span>}</td>
                        <td className="r">{eur2(d.gasto)}</td><td className="r">{int(d.seguidores)}</td><td className="r">{eur2(coste(d.gasto, d.seguidores || 0))}</td>
                        <td className="r">{int(d.bienvenidas)}</td><td className="r">{eur2(coste(d.gasto, d.bienvenidas || 0))}</td><td className="r">{int(d.clics)}</td>
                      </tr>
                    ))}
                    <tr className="pn-total">
                      <td>Total</td><td className="r">{eur2(anuncios.gasto)}</td><td className="r">{int(anuncios.seguidoresIg)}</td><td className="r">{eur2(coste(anuncios.gasto, anuncios.seguidoresIg))}</td>
                      <td className="r">{int(aperturas.tot.b_env)}</td><td className="r">{eur2(coste(anuncios.gasto, aperturas.tot.b_env))}</td><td className="r">{int(anuncios.clics)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Seccion>
            <Seccion titulo="Campañas" sub={`Gasto ${nombrePeriodo}, de mayor a menor.`}>
              <div className="pn-tablewrap">
                <table className="pn-table">
                  <thead><tr><th>Campaña</th><th className="r">Gasto</th><th className="r">% del gasto</th><th className="r">Anuncios</th><th className="r">Días activa</th><th className="r">Impresiones</th><th className="r">Clics</th><th className="r">€ / clic</th><th className="r">CPM</th></tr></thead>
                  <tbody>
                    {anuncios.campanas.map((c) => (
                      <tr key={c.campana}>
                        <td className="pn-td-larga">{c.campana}</td><td className="r">{eur2(c.gasto)}</td><td className="r">{pct(ratio(c.gasto, anuncios.gasto))}</td>
                        <td className="r">{int(c.anuncios.size)}</td><td className="r">{int(c.dias.size)}</td><td className="r">{int(c.impresiones)}</td><td className="r">{int(c.clics)}</td>
                        <td className="r">{eur2(coste(c.gasto, c.clics))}</td><td className="r">{eur2(c.impresiones ? (1000 * c.gasto) / c.impresiones : null)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Seccion>
            <Seccion titulo="Anuncios" sub="Cada anuncio con su gasto y rendimiento en el periodo.">
              <div className="pn-tablewrap">
                <table className="pn-table">
                  <thead><tr><th>Anuncio</th><th className="r">Gasto</th><th className="r">Último día con gasto</th><th className="r">Impresiones</th><th className="r">Clics</th><th className="r">CTR</th><th className="r">€ / clic</th></tr></thead>
                  <tbody>
                    {anuncios.anuncios.map((a) => (
                      <tr key={`${a.campana}|${a.anuncio}|${a.ultimo}`}>
                        <td className="pn-td-larga"><b>{a.anuncio}</b><small>{a.campana}</small></td><td className="r">{eur2(a.gasto)}</td><td className="r">{a.ultimo ? dia(a.ultimo) : "—"}</td>
                        <td className="r">{int(a.impresiones)}</td><td className="r">{int(a.clics)}</td>
                        <td className="r">{a.impresiones ? `${((100 * a.clics) / a.impresiones).toLocaleString("es-ES", { maximumFractionDigits: 1 })}%` : "—"}</td><td className="r">{eur2(coste(a.gasto, a.clics))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Seccion>
          </>
          )
        )}

        {pestana === "gastos" && (
          <>
            <div className="pn-kpis">
              <Kpi destacado etiqueta="Gastos del periodo" valor={eur(gastoTotal)} pie={`${eur(anuncios.gasto)} Meta Ads + ${eur(gastosPeriodo.total)} otros`} />
              <Kpi destacado etiqueta="Coste de captación" valor={eur(costeCaptacion)} pie={`${eur(anuncios.gasto)} anuncios + ${eur(gastosPeriodo.captacion)} otros de captación`} />
              {cashMostrado != null && <Kpi destacado etiqueta="Beneficio (caja)" valor={eur(cashMostrado - gastoTotal)} tono={cashMostrado - gastoTotal >= 0 ? "ok" : "bad"} pie={`margen ${pct(ratio(cashMostrado - gastoTotal, cashMostrado))} del cash collect`} />}
              <Kpi destacado etiqueta="Beneficio (facturación)" valor={eur(facturacionMostrada - gastoTotal)} tono={facturacionMostrada - gastoTotal >= 0 ? "ok" : "bad"} pie={`margen ${pct(ratio(facturacionMostrada - gastoTotal, facturacionMostrada))} de lo facturado`} />
              <Kpi etiqueta="Coste por conversación" valor={eur2(coste(costeCaptacion, e.conversan))} pie={`${int(e.conversan)} conversaciones`} />
              <Kpi etiqueta="Coste por agenda" valor={eur(coste(costeCaptacion, ventas.reservadas))} pie={`${int(ventas.reservadas)} agendas`} />
              <Kpi etiqueta="Coste por venta (CAC)" valor={eur(coste(costeCaptacion, hayVentasAuto ? ventasPeriodo.nVentas : ventas.cerradas))} pie={`${int(hayVentasAuto ? ventasPeriodo.nVentas : ventas.cerradas)} ventas nuevas · ticket ${eur(ticketMostrado)}`} />
              <Kpi etiqueta="Retorno de la captación" valor={costeCaptacion ? `${(facturacionMostrada / costeCaptacion).toLocaleString("es-ES", { maximumFractionDigits: 1 })}x` : "—"} pie="facturación ÷ coste de captación" />
            </div>
            <Seccion titulo="Tus gastos" sub={`Los mensuales se reparten por días: en "${nombrePeriodo}" cuenta solo la parte de esos días. Marca "captación" en lo que sirve para conseguir clientas (marketing, consultoría, setter…): entra en el coste por conversación, agenda y venta. Todo entra en el beneficio. Meta Ads se suma solo.`}
              accion={<button type="button" className="pn-btn" onClick={() => { setErrGasto(""); setFormGasto(formGasto ? null : gastoVacio()); }}>{formGasto ? "Cancelar" : "+ Añadir gasto"}</button>}>
              {formGasto && (
                <form className="pn-form" onSubmit={guardarGasto}>
                  <label className="pn-form-ancho">Concepto<input type="text" required placeholder="Consultoría de ventas" value={formGasto.concepto} onChange={(ev) => setFormGasto({ ...formGasto, concepto: ev.target.value })} /></label>
                  <label>Categoría
                    <select value={formGasto.categoria} onChange={(ev) => { const c = CATEGORIAS_GASTO.find((x) => x[0] === ev.target.value); setFormGasto({ ...formGasto, categoria: ev.target.value, captacion: c ? c[1] : formGasto.captacion }); }}>
                      {CATEGORIAS_GASTO.map(([c]) => <option key={c}>{c}</option>)}
                    </select>
                  </label>
                  <label>Importe (€)<input type="text" inputMode="decimal" required placeholder="1500" value={formGasto.importe} onChange={(ev) => setFormGasto({ ...formGasto, importe: ev.target.value })} /></label>
                  <label>Tipo
                    <select value={formGasto.tipo} onChange={(ev) => setFormGasto({ ...formGasto, tipo: ev.target.value as "mensual" | "puntual" })}>
                      <option value="mensual">Cada mes</option><option value="puntual">Una sola vez</option>
                    </select>
                  </label>
                  {formGasto.tipo === "puntual"
                    ? <label>Fecha<input type="date" required value={formGasto.fecha} onChange={(ev) => setFormGasto({ ...formGasto, fecha: ev.target.value })} /></label>
                    : <>
                        <label>Desde<input type="date" required value={formGasto.desde} onChange={(ev) => setFormGasto({ ...formGasto, desde: ev.target.value })} /></label>
                        <label>Hasta (vacío si sigue)<input type="date" value={formGasto.hasta} onChange={(ev) => setFormGasto({ ...formGasto, hasta: ev.target.value })} /></label>
                      </>}
                  <label className="pn-form-check"><input type="checkbox" checked={formGasto.captacion} onChange={(ev) => setFormGasto({ ...formGasto, captacion: ev.target.checked })} /> Es gasto de captación (cuenta en el coste por agenda y por venta)</label>
                  {errGasto && <p className="pn-err pn-form-ancho" role="alert">{errGasto}</p>}
                  <div className="pn-form-ancho"><button type="submit" className="pn-btn" disabled={guardandoGasto}>{guardandoGasto ? "Guardando…" : formGasto.id ? "Guardar cambios" : "Añadir gasto"}</button></div>
                </form>
              )}
              <div className="pn-tablewrap">
                <table className="pn-table">
                  <thead><tr><th>Concepto</th><th>Categoría</th><th>Tipo</th><th className="r">Importe</th><th className="r">En este periodo</th><th>Captación</th><th></th></tr></thead>
                  <tbody>
                    <tr className="pn-fila-auto"><td>Meta Ads</td><td>Publicidad</td><td>automático</td><td className="r">—</td><td className="r">{eur(anuncios.gasto)}</td><td><span className="pn-pill tono-ok">sí</span></td><td className="pn-sub">se lee de Meta</td></tr>
                    {gastosPeriodo.lineas.map(({ g, imp }) => (
                      <tr key={g.id}>
                        <td>{g.concepto}</td><td>{g.categoria}</td>
                        <td>{g.tipo === "puntual" ? `puntual · ${dia(g.fecha || "")}` : `mensual · desde ${dia(g.desde || "")}${g.hasta ? ` hasta ${dia(g.hasta)}` : ""}`}</td>
                        <td className="r">{eur(g.importe)}{g.tipo === "mensual" ? "/mes" : ""}</td>
                        <td className="r">{eur(imp)}</td>
                        <td><button type="button" className={`pn-pill ${g.captacion ? "tono-ok" : "tono-neutro"} pn-pill-btn`} onClick={() => guardarGastoDirecto({ ...g, captacion: !g.captacion })} title="Cambiar">{g.captacion ? "sí" : "no"}</button></td>
                        <td className="pn-acc"><button type="button" className="pn-link" onClick={() => { setErrGasto(""); setFormGasto({ id: g.id, concepto: g.concepto, categoria: g.categoria, importe: String(g.importe), tipo: g.tipo, fecha: g.fecha || hoy, desde: g.desde || hoy, hasta: g.hasta || "", captacion: g.captacion }); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Editar</button> <button type="button" className="pn-link" onClick={() => { if (confirm(`¿Borrar «${g.concepto}»?`)) borrarGasto(g.id); }}>Borrar</button></td>
                      </tr>
                    ))}
                    {!gastos.length && <tr><td colSpan={7} className="pn-vacio">Añade aquí consultoría, marketing, setter, herramientas… para ver el coste real por agenda y por venta.</td></tr>}
                    <tr className="pn-total"><td colSpan={4}>Total del periodo</td><td className="r">{eur(gastoTotal)}</td><td colSpan={2} className="pn-sub">captación {eur(costeCaptacion)}</td></tr>
                  </tbody>
                </table>
              </div>
            </Seccion>
            {Object.keys(gastosPeriodo.porCat).length > 0 && (
              <Seccion titulo="Por categoría" sub={`Gasto ${nombrePeriodo}, incluido Meta Ads.`}>
                <div className="pn-perdidas">
                  {[["Meta Ads", { total: anuncios.gasto, captacion: anuncios.gasto }] as const, ...Object.entries(gastosPeriodo.porCat)].sort((a, b) => b[1].total - a[1].total).map(([c, v]) => (
                    <div key={c} className="pn-perd tono-neutro">
                      <span>{c}</span>
                      <div className="pn-perd-barra"><div style={{ width: `${(100 * v.total) / Math.max(1, gastoTotal)}%` }} /></div>
                      <b>{eur(v.total)}</b><small>{pct(ratio(v.total, gastoTotal))}</small>
                    </div>
                  ))}
                </div>
              </Seccion>
            )}
          </>
        )}

        {pestana === "ventas" && (
          <>
            <div className="pn-kpis">
              <Kpi destacado etiqueta="Agendas" valor={int(ventas.reservadas)} pie={`${int(ventas.proximas)} próximas · ${int(ventas.canceladas)} canceladas`} spark={sparkAgendas} />
              <Kpi destacado etiqueta="Show rate" valor={pct(ventas.show)} tono={tonoObjetivo(ventas.show, OBJETIVOS.vienen)} pie={`no-show ${pct(ventas.noshow)}`} />
              <Kpi destacado etiqueta="Tasa de cierre" valor={pct(ventas.cierre)} tono={tonoObjetivo(ventas.cierre, OBJETIVOS.compran)} pie={`${int(ventas.cerradas)} cerradas de ${int(ventas.cerradas + ventas.noCerradas)} decididas`} />
              <Kpi destacado etiqueta="Facturación" valor={eur(facturacionMostrada)} pie={`ventas nuevas · ticket medio ${eur(ticketMostrado)}`} />
              {cashMostrado != null && <Kpi destacado etiqueta="Cash collect" valor={eur(cashMostrado)} pie={`lo que ha entrado · ${eur(ventasPeriodo.cashAnteriores)} de cuotas de clientas anteriores`} spark={sparkVentas} />}
            </div>
            {(
              <Seccion titulo="Ventas registradas" sub={`Cobros de ${[conexiones.hotmart && "Hotmart", conexiones.stripe && "Stripe", "ventas manuales"].filter(Boolean).join(", ")} ${nombrePeriodo}. Las que coinciden con una llamada (por correo o porque las uniste) la marcan sola como compra.`}
                accion={<button type="button" className="pn-btn" onClick={() => { setErrVenta(""); setFormVenta(formVenta ? null : vacio); }}>{formVenta ? "Cancelar" : "+ Añadir venta"}</button>}>
                {formVenta && (
                  <form className="pn-form" onSubmit={guardarVenta}>
                    <label>Fecha<input id="v-fecha" type="date" required value={formVenta.fecha} onChange={(ev) => setFormVenta({ ...formVenta, fecha: ev.target.value })} /></label>
                    <label>Lo que paga la clienta (€)<input id="v-importe" type="text" inputMode="decimal" required placeholder="1200" value={formVenta.importe} onChange={(ev) => setFormVenta({ ...formVenta, importe: ev.target.value })} /></label>
                    <label>Lo que te llega (€, opcional)<input id="v-neto" type="text" inputMode="decimal" placeholder={formVenta.importe ? String(Math.round(Number(String(formVenta.importe).replace(",", ".")) * (1 - ((comisiones[formVenta.metodo] ?? METODOS_COBRO.find((m) => m[0] === formVenta.metodo)?.[1] ?? 0) / 100)) * 100) / 100) : "si hay comisión"} value={formVenta.neto} onChange={(ev) => setFormVenta({ ...formVenta, neto: ev.target.value })} /></label>
                    <label>Cómo pagó
                      <select id="v-metodo" value={formVenta.metodo} onChange={(ev) => setFormVenta({ ...formVenta, metodo: ev.target.value })}>
                        {METODOS_COBRO.map(([m]) => <option key={m}>{m}</option>)}
                      </select>
                    </label>
                    <label className="pn-form-ancho">¿De qué llamada viene? (opcional)
                      <select id="v-llamada" value={formVenta.agendaId} onChange={(ev) => { const ag = datos.agendas.find((a) => a.id === ev.target.value); setFormVenta({ ...formVenta, agendaId: ev.target.value, nombre: ag?.nombre || formVenta.nombre, email: ag?.email || formVenta.email }); }}>
                        <option value="">— Sin llamada —</option>
                        {datos.agendas.filter((a) => a.estado !== "CANCELLED" && new Date(a.fecha).getTime() < Date.now()).sort((a, b) => (a.fecha < b.fecha ? 1 : -1)).slice(0, 80).map((a) => <option key={a.id} value={a.id}>{fechaHora(a.fecha)} · {a.nombre}{a.instagram ? ` (@${a.instagram})` : ""}</option>)}
                      </select>
                    </label>
                    <label>Nombre<input id="v-nombre" type="text" value={formVenta.nombre} onChange={(ev) => setFormVenta({ ...formVenta, nombre: ev.target.value })} /></label>
                    <label>Correo (opcional)<input id="v-email" type="email" value={formVenta.email} onChange={(ev) => setFormVenta({ ...formVenta, email: ev.target.value })} /></label>
                    <label>Producto (opcional)<input id="v-producto" type="text" placeholder="Programa Método RHS" value={formVenta.producto} onChange={(ev) => setFormVenta({ ...formVenta, producto: ev.target.value })} /></label>
                    <label className="pn-form-ancho">Nota (opcional)<input id="v-nota" type="text" value={formVenta.nota} onChange={(ev) => setFormVenta({ ...formVenta, nota: ev.target.value })} /></label>
                    {errVenta && <p className="pn-err pn-form-ancho" role="alert">{errVenta}</p>}
                    <div className="pn-form-ancho"><button type="submit" className="pn-btn" disabled={guardandoVenta}>{guardandoVenta ? "Guardando…" : "Guardar venta"}</button></div>
                  </form>
                )}
                <div className="pn-kpis">
                  <Kpi etiqueta="Facturación (ventas nuevas)" valor={eur(ventasPeriodo.facturacion)} pie={`${int(ventasPeriodo.nVentas)} ventas · ticket ${eur(ventasPeriodo.ticket)}`} />
                  <Kpi etiqueta="Cash collect (te llega)" valor={eur(ventasPeriodo.total)} pie={`cobrado ${eur(ventasPeriodo.bruto)} − comisiones ${eur(ventasPeriodo.comisionesPeriodo)} · ${eur(ventasPeriodo.cashAnteriores)} de cuotas anteriores`} />
                  <Kpi etiqueta="Pendiente de cobro" valor={eur(ventasPeriodo.pendiente)} tono={ventasPeriodo.pendiente > 0 ? "warn" : "ok"} pie="de las ventas nuevas del periodo" />
                  <Kpi etiqueta="Cobros" valor={int(ventasPeriodo.cobros)} pie={`${int(ventasPeriodo.n)} clientas pagaron · ${int(ventasPeriodo.deLlamada)} con llamada`} />
                </div>
                <h3 className="pn-h3">Ventas nuevas del periodo (facturación)</h3>
                <p className="pn-sub">Cada compra cuenta como venta, también si la clienta ya había comprado antes. Las ventas a plazos se valoran por el precio del programa que encaja con la cuota (estimado); si no es así, escribe el valor real y lo pendiente se recalcula. El cash collect puede superar a la facturación en un mes en el que entran muchas cuotas de ventas de meses anteriores.</p>
                <p className="pn-cuadre">Facturación (lo vendido) {eur(ventasPeriodo.facturacion)} = {eur(ventasPeriodo.brutoNuevas)} ya pagados por las clientas + {eur(ventasPeriodo.pendiente)} pendientes · Cash collect (lo que te llega) {eur(ventasPeriodo.total)} = {eur(ventasPeriodo.bruto)} cobrados − {eur(ventasPeriodo.comisionesPeriodo)} de comisiones (incluye {eur(ventasPeriodo.cashAnteriores)} de cuotas de ventas anteriores)</p>
                <div className="pn-tablewrap">
                  <table className="pn-table">
                    <thead><tr><th>Fecha de la venta</th><th>Clienta</th><th>Producto</th><th className="r">Cobros</th><th className="r">Pagado</th><th className="r">Te llega</th><th className="r">Valor de la venta (€)</th><th className="r">Pendiente</th><th></th></tr></thead>
                    <tbody>
                      {ventasPeriodo.nuevas.map((c) => (
                        <tr key={c.clave}>
                          <td>{dia(c.primero)}</td><td>{c.nombre || c.email || "—"}</td><td>{c.producto || "—"}</td>
                          <td className="r">{int(c.cobros.length)}</td><td className="r">{eur(c.cobrado)}</td><td className="r">{eur(c.netoCobrado)}</td>
                          <td className="r">
                            <input className="pn-importe" type="number" min={0} step={1} inputMode="numeric" aria-label={`Valor de la venta de ${c.nombre || c.email}`}
                              key={`${c.clave}-${c.valor}`} defaultValue={Math.round(c.valor)}
                              onBlur={(ev) => { const raw = ev.target.value; const v = raw === "" ? null : Math.max(0, Number(raw)); if (v === null || v !== Math.round(c.valor)) guardarValor(c.clave, v); }} />
                            <small className="pn-fuente">{c.fuente === "tú" ? "puesto por ti" : c.fuente === "llamada" ? "de la llamada" : c.fuente === "cobrado" ? "lo cobrado" : c.fuente}</small>
                          </td>
                          <td className="r">{c.pendiente > 0 ? <span className="pn-pill tono-warn">{eur(c.pendiente)}</span> : "—"}</td>
                          <td><button type="button" className="pn-link" onClick={() => {
                            if (!confirm(`¿Quitar de la contabilidad la venta de ${c.nombre || c.email || "esta clienta"} (${c.cobros.length} cobro${c.cobros.length > 1 ? "s" : ""}, ${eur(c.cobrado)})? Los cobros de Hotmart o Stripe se pueden recuperar; los manuales se borran.`)) return;
                            c.cobros.forEach((v) => { if (v.fuente === "manual") borrarVenta(v.id); else excluirVenta(v, true); });
                          }}>Quitar</button></td>
                        </tr>
                      ))}
                      {ventasPeriodo.sinCobro.map((x) => (
                        <tr key={x.id}><td>{dia(x.fecha)}</td><td>{x.nombre || "—"}</td><td>venta marcada en la llamada</td><td className="r">0</td><td className="r">0 €</td><td className="r">0 €</td><td className="r">{eur(x.valor)}</td><td className="r"><span className="pn-pill tono-warn">{eur(x.valor)}</span></td><td className="pn-sub">se quita desmarcando la llamada</td></tr>
                      ))}
                      {!ventasPeriodo.nuevas.length && !ventasPeriodo.sinCobro.length && <tr><td colSpan={9} className="pn-vacio">No hay ventas nuevas en este periodo.</td></tr>}
                    </tbody>
                  </table>
                </div>
                <h3 className="pn-h3">Cobros del periodo (cash collect)</h3>
                <div className="pn-tablewrap">
                  <table className="pn-table">
                    <thead><tr><th>Fecha</th><th>Producto</th><th>Compradora</th><th className="r">Pagado</th><th className="r">Comisión</th><th className="r">Te llega</th><th>Origen</th><th>Tuvo llamada</th><th></th></tr></thead>
                    <tbody>
                      {ventasPeriodo.lista.length ? ventasPeriodo.lista.map((v) => (
                        <tr key={v.id}>
                          <td>{v.fuente === "manual" ? dia(v.fecha) : fechaHora(v.fecha)}</td><td className="pn-texto" title={v.nota || ""}>{v.producto || "—"}</td><td>{v.nombre || v.email || "—"}</td>
                          <td className="r">{v.moneda && v.moneda !== "EUR" ? `${Math.round(v.importe).toLocaleString("es-ES")} ${v.moneda}` : eur2(v.importe)}</td>
                          <td className="r pn-sub" title={typeof v.neto === "number" ? "comisión real" : `estimada: ${pctComision(v)} %`}>{v.importe - netoDe(v) > 0 ? `−${eur2(v.importe - netoDe(v))}` : "0 €"}{typeof v.neto !== "number" && v.importe - netoDe(v) > 0 ? " *" : ""}</td>
                          <td className="r"><b>{eur2(netoDe(v))}</b></td>
                          <td><span className="pn-pill tono-neutro">{v.fuente === "hotmart" ? "Hotmart" : v.fuente === "stripe" ? "Stripe" : v.metodo || "Manual"}</span></td>
                          <td>{ventasPeriodo.conLlamada(v) ? <span className="pn-pill tono-ok">sí</span> : "—"}</td>
                          <td className="pn-acc">{v.fuente === "manual"
                            ? <button type="button" className="pn-link" onClick={() => { if (confirm(`¿Borrar la venta manual de ${v.nombre || v.email || "esta clienta"} (${eur(v.importe)})?`)) borrarVenta(v.id); }}>Borrar</button>
                            : <button type="button" className="pn-link" onClick={() => { if (confirm(`¿Quitar de la contabilidad este cobro de ${v.fuente === "hotmart" ? "Hotmart" : "Stripe"} (${v.nombre || v.email || "—"}, ${eur(v.importe)})? Podrás recuperarlo abajo.`)) excluirVenta(v, true); }}>Quitar</button>}</td>
                        </tr>
                      )) : <tr><td colSpan={9} className="pn-vacio">No hay ventas cobradas en este periodo.</td></tr>}
                    </tbody>
                  </table>
                </div>
                <p className="pn-sub">«Pagado» es lo que pagó la clienta (cuenta en la facturación); «Te llega» es lo que recibes tras la comisión (cuenta en el cash collect). Stripe y Hotmart dan la comisión exacta de cada cobro; las marcadas con * son estimadas con el % de abajo.</p>
                <details className="pn-ayuda">
                  <summary>Comisiones por método de cobro (%)</summary>
                  <p className="pn-sub">Se usan solo cuando el cobro no trae la comisión exacta ni apuntaste lo que te llega. Para Sequra pon el % que te descuentan.</p>
                  <div className="pn-comis">
                    {[...METODOS_COBRO.map((m) => m[0]), "hotmart", "stripe"].map((k) => (
                      <label key={k}>{k === "hotmart" ? "Hotmart (si no da la comisión)" : k === "stripe" ? "Stripe (si no da la comisión)" : k}
                        <input type="number" min={0} max={60} step={0.1} inputMode="decimal" defaultValue={comisiones[k] ?? (METODOS_COBRO.find((m) => m[0] === k)?.[1] ?? 0)}
                          onBlur={async (ev) => {
                            const val = Number(ev.target.value); if (!Number.isFinite(val)) return;
                            const nuevo = { ...comisiones, [k]: val }; setComisiones(nuevo);
                            await fetch("/api/panel/comisiones", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(nuevo) }).catch(() => null);
                          }} /> %
                      </label>
                    ))}
                  </div>
                </details>
                {ventasExcluidasLista.length > 0 && (
                  <details className="pn-ayuda">
                    <summary>Cobros quitados de la contabilidad ({ventasExcluidasLista.length})</summary>
                    <p className="pn-sub">No cuentan en la facturación, el cash collect, el ticket ni el coste por venta. Siguen existiendo en Hotmart o Stripe; aquí solo se ignoran.</p>
                    <div className="pn-tablewrap">
                      <table className="pn-table">
                        <thead><tr><th>Fecha</th><th>Producto</th><th>Compradora</th><th className="r">Importe</th><th>Origen</th><th></th></tr></thead>
                        <tbody>
                          {ventasExcluidasLista.map((v) => (
                            <tr key={v.id}>
                              <td>{fechaHora(v.fecha)}</td><td>{v.producto || "—"}</td><td>{v.nombre || v.email || "—"}</td><td className="r">{eur(v.importe)}</td>
                              <td><span className="pn-pill tono-neutro">{v.fuente === "hotmart" ? "Hotmart" : "Stripe"}</span></td>
                              <td><button type="button" className="pn-link" onClick={() => excluirVenta(v, false)}>Recuperar</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </details>
                )}
              </Seccion>
            )}
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
            <Seccion titulo="Marca cada llamada" sub={hayVentasAuto ? "Las compras de Hotmart/Stripe con el mismo correo se marcan solas (etiqueta auto). Lo que marques aquí manda." : "Si en GoHighLevel la marcaste como presentada o no, ya aparece marcada; lo que marques aquí manda."} accion={pendientes > 0 ? <span className="pn-badge pn-badge-g">{pendientes} pendientes</span> : undefined}>
              {error && <p className="pn-err" role="alert">{error}</p>}
              <div className="pn-tablewrap">
                <table className="pn-table">
                  <thead><tr><th>Fecha</th><th>Nombre</th><th>Instagram</th><th>¿Vino?</th><th>¿Compró?</th><th>Importe (€)</th></tr></thead>
                  <tbody>
                    {pasadas.length ? pasadas.map((l) => (
                      <tr key={l.id} className={!l.asistio || (l.asistio === "si" && !l.vendido) ? "is-pend" : ""}>
                        <td>{fechaHora(l.fecha)}</td><td>{l.nombre || "—"}{l.auto && <span className="pn-pill tono-ok pn-auto">auto</span>}</td><td>{l.instagram ? `@${l.instagram}` : "—"}</td>
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
          <Seccion titulo="Publicaciones" sub={hayIg ? "Estadísticas de Instagram de cada publicación (desde que se publicó) y cuánta gente entra a hablar con el setter por ella y hasta dónde llega." : "Me gusta, comentarios y cuánta gente entra comentando cada publicación y hasta dónde llega."}
            accion={hayIg ? (
              <div className="pn-chips" role="group" aria-label="Ordenar publicaciones">
                {([["fecha", "Recientes"], ["views", "Más vistas"], ["follows", "Más seguidores"], ["entran", "Más conversaciones"]] as const).map(([k, n]) => (
                  <button key={k} type="button" aria-pressed={ordenPosts === k} onClick={() => setOrdenPosts(k)}>{n}</button>
                ))}
              </div>
            ) : undefined}>
            <div className="pn-posts">
              {postsOrdenados.length ? postsOrdenados.map((p) => (
                <article key={p.codigo} className="pn-post">
                  <div className="pn-post-top"><span className="pn-pill tono-neutro">{p.tipo}</span><span className="pn-sub">{dia(p.fecha)}</span></div>
                  <p className="pn-post-txt">{/^https:\/\//.test(p.enlace) ? <a href={p.enlace} target="_blank" rel="noopener noreferrer">{p.texto || "Ver publicación"}</a> : p.texto}</p>
                  <div className="pn-post-bar"><div style={{ width: `${(100 * medidaPost(p)) / maxLikes}%` }} /></div>
                  {Object.keys(p.ig).length > 0 && (
                    <div className="pn-post-ig">
                      <span><b>{int(p.ig.views)}</b> visualiz.</span><span><b>{int(p.ig.reach)}</b> alcance</span>
                      <span className="is-dest"><b>{int(p.ig.follows)}</b> seguidores</span><span><b>{int(p.ig.saved)}</b> guardados</span>
                      <span><b>{int(p.ig.shares)}</b> compartidos</span><span><b>{int(p.ig.profile_visits)}</b> visitas perfil</span>
                    </div>
                  )}
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
                  { n: "Meta Ads", ok: conexiones.meta, t: "Gasto, coste por seguidor, por conversación, por agenda y por venta", e: conexiones.meta ? `Conectado · ${hace(datos.meta.anuncios)}` : "Pendiente de conectar" },
                  { n: "Estadísticas de Instagram", ok: conexiones.meta, t: "Visualizaciones, alcance, guardados y seguidores por publicación; seguidores nuevos al día", e: conexiones.meta ? `Conectado · ${hace(datos.instagram?.leido)}` : "Pendiente de conectar" },
                  { n: "Hotmart", ok: Boolean(conexiones.hotmart), t: "Ventas y facturación automáticas", e: conexiones.hotmart ? `Conectado · ${hace(datos.meta.ventas)}` : "Pendiente de conectar" },
                  { n: "Stripe", ok: conexiones.stripe, t: "Ventas y facturación automáticas", e: conexiones.stripe ? `Conectado · ${hace(datos.meta.ventas)}` : "Pendiente de conectar" },
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

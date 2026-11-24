"use client";

import { useMemo, useState } from "react";

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
};

const ORIGENES: [Origen, string][] = [
  ["bienvenida", "Seguidoras nuevas"],
  ["saludo", "Seguidoras de antes"],
  ["comentario", "Comentan un reel"],
  ["mensaje", "Nos escriben ellas"],
];
const COLORES: Record<Origen, string> = { bienvenida: "#343337", saludo: "#8a8790", comentario: "#e48be0", mensaje: "#c9a227" };
const PERIODOS = [7, 14, 30, 90];

// ---------- Utilidades ----------
const fmtDia = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" });
const hoyMadrid = () => fmtDia.format(new Date());
const sumarDias = (iso: string, n: number) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const dia = (iso: string) => { const s = String(iso).slice(0, 10); return `${Number(s.slice(8, 10))} ${MESES[Number(s.slice(5, 7)) - 1]}`; };
const fechaHora = (iso: string) => `${dia(iso)} · ${String(iso).slice(11, 16)}`;
const int = (n: number | null | undefined) => (n == null || Number.isNaN(n) ? "—" : n.toLocaleString("es-ES"));
const pct = (n: number | null | undefined) => (n == null ? "—" : `${n} %`);
const eur = (n: number | null | undefined) => (n == null ? "—" : `${n.toLocaleString("es-ES")} €`);
const ratio = (a: number, b: number) => (b ? Math.round((100 * a) / b) : null);
const num = (v: unknown) => Number(v) || 0;
const hace = (iso?: string) => {
  if (!iso) return "nunca";
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 60) return `hace ${min} min`;
  if (min < 60 * 36) return `hace ${Math.round(min / 60)} h`;
  return `hace ${Math.round(min / 1440)} días`;
};

// ---------- Componentes pequeños ----------
function Tarjeta({ titulo, valor, pie, grande }: { titulo: string; valor: string; pie?: React.ReactNode; grande?: boolean }) {
  return (
    <div className={`pn-card${grande ? " is-key" : ""}`}>
      <span className="pn-label">{titulo}</span>
      <span className="pn-num">{valor}</span>
      {pie && <span className="pn-foot">{pie}</span>}
    </div>
  );
}

type Serie = { clave: string; nombre: string; color: string };
function Barras({ filas, series, etiqueta, vacio, extra }: { filas: ({ x: string } & Record<string, number | string>)[]; series: Serie[]; etiqueta: (x: string) => string; vacio: string; extra?: (f: Record<string, number | string>) => string }) {
  const [activo, setActivo] = useState<number | null>(null);
  const total = (f: Record<string, number | string>) => series.reduce((t, s) => t + num(f[s.clave]), 0);
  const max = Math.max(1, ...filas.map(total));
  if (!filas.length || filas.every((f) => total(f) === 0)) return <p className="pn-empty">{vacio}</p>;
  const cada = Math.max(1, Math.ceil(filas.length / 10));
  return (
    <div className="pn-chart" onMouseLeave={() => setActivo(null)}>
      <div className="pn-bars" role="img" aria-label={`Gráfico: ${series.map((s) => s.nombre).join(", ")}`}>
        {filas.map((f, i) => (
          <div key={f.x} className={`pn-col${activo === i ? " is-on" : ""}`} onMouseEnter={() => setActivo(i)} onClick={() => setActivo(i)}>
            <div className="pn-stack" style={{ height: `${(100 * total(f)) / max}%` }}>
              {series.map((s) => num(f[s.clave]) > 0 && <div key={s.clave} style={{ flexGrow: num(f[s.clave]), background: s.color }} />)}
            </div>
            <span className="pn-xlab">{i % cada === 0 ? etiqueta(f.x) : ""}</span>
          </div>
        ))}
      </div>
      <div className="pn-tip" aria-live="polite">
        {activo != null ? (
          <>
            <b>{etiqueta(filas[activo].x)}</b>
            {series.map((s) => <span key={s.clave}><i style={{ background: s.color }} />{s.nombre}: {int(num(filas[activo][s.clave]))}</span>)}
            {extra && <span>{extra(filas[activo])}</span>}
          </>
        ) : <span className="pn-muted">Pasa el ratón o toca una barra para ver el detalle</span>}
      </div>
      <ul className="pn-legend">{series.map((s) => <li key={s.clave}><i style={{ background: s.color }} />{s.nombre}</li>)}</ul>
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

// ---------- Panel ----------
export default function PanelClient({ datos, almacen }: { datos: Datos; almacen: boolean }) {
  const [dias, setDias] = useState(30);
  const [origen, setOrigen] = useState<"todas" | Origen>("todas");
  const [resultados, setResultados] = useState<Record<string, Resultado>>(datos.resultados || {});
  const [error, setError] = useState("");

  const hoy = hoyMadrid();
  const desde = sumarDias(hoy, -dias);

  // Llamadas no canceladas desde el inicio del periodo, con su resultado.
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

  const kLlamadas = useMemo(() => {
    const reservadas = datos.agendas.filter((a) => String(a.reservada).slice(0, 10) >= desde);
    const pasadas = llamadas.filter((l) => l.pasada);
    const si = pasadas.filter((l) => l.asistio === "si").length;
    const no = pasadas.filter((l) => l.asistio === "no").length;
    const ventas = pasadas.filter((l) => l.vendido === "si");
    return {
      reservadas: reservadas.filter((a) => a.estado !== "CANCELLED").length,
      canceladas: reservadas.filter((a) => a.estado === "CANCELLED").length,
      asistieron: si, no_vinieron: no, marcadas: si + no, sin_marcar: pasadas.length - si - no,
      show: ratio(si, si + no), noshow: ratio(no, si + no), ventas: ventas.length, cierre: ratio(ventas.length, si),
      venta_sin_marcar: pasadas.filter((l) => l.asistio === "si" && !l.vendido).length,
      facturacion: Math.round(ventas.reduce((s, v) => s + (v.importe || 0), 0)),
    };
  }, [datos.agendas, llamadas, desde]);

  const diasEmbudo = useMemo(() => Object.values(datos.embudo).filter((d) => d.fecha >= desde).sort((a, b) => (a.fecha < b.fecha ? -1 : 1)), [datos.embudo, desde]);

  const embudo = useMemo(() => {
    const ors = origen === "todas" ? ORIGENES.map((o) => o[0]) : [origen];
    const suma = (k: string) => diasEmbudo.reduce((t, d) => t + ors.reduce((u, o) => u + num(d[`${o}_${k}`]), 0), 0);
    const ids = new Set<string>();
    diasEmbudo.forEach((d) => ors.forEach((o) => (d.ids?.[o] || []).forEach((x) => ids.add(x))));
    const agendaron = new Set(datos.agendas.filter((a) => a.estado !== "CANCELLED" && ids.has(a.contacto)).map((a) => a.contacto));
    const vinieron = new Set(llamadas.filter((l) => l.asistio === "si" && ids.has(l.contacto)).map((l) => l.contacto));
    const pagaron = llamadas.filter((l) => l.vendido === "si" && ids.has(l.contacto));
    const entran = suma("entran"), conversan = suma("conversan"), final = suma("final"), datosN = suma("datos");
    const pasos = [
      { paso: "Entran", n: entran, pct: null as number | null, ref: "" },
      { paso: "No responden", n: entran - conversan, pct: ratio(entran - conversan, entran), ref: "de las que entran", gris: true },
      { paso: "Entablan conversación", n: conversan, pct: ratio(conversan, entran), ref: "de las que entran" },
      { paso: "Llegan al final", n: final, pct: ratio(final, conversan), ref: "de las que conversan" },
      { paso: "Nos dan sus datos", n: datosN, pct: ratio(datosN, final), ref: "de las que llegan al final" },
      { paso: "Agendan la llamada", n: agendaron.size, pct: ratio(agendaron.size, datosN), ref: "de las que dan datos" },
      { paso: "Vienen a la llamada", n: vinieron.size, pct: ratio(vinieron.size, agendaron.size), ref: "de las que agendan" },
      { paso: "Pagan", n: new Set(pagaron.map((l) => l.contacto)).size, pct: ratio(new Set(pagaron.map((l) => l.contacto)).size, vinieron.size), ref: "de las que vienen" },
    ];
    return { pasos, facturacion: Math.round(pagaron.reduce((s, l) => s + (l.importe || 0), 0)) };
  }, [diasEmbudo, origen, datos.agendas, llamadas]);

  const entradas = useMemo(() => {
    const s = (k: string) => diasEmbudo.reduce((t, d) => t + num(d[k]), 0);
    const total = ORIGENES.reduce((t, [o]) => t + s(`${o}_entran`), 0);
    const fotos = Object.values(datos.seguidores).filter((f) => f.fecha >= desde).sort((a, b) => (a.fecha < b.fecha ? -1 : 1));
    return {
      n: diasEmbudo.length,
      entranDia: diasEmbudo.length ? Math.round(total / diasEmbudo.length) : null,
      nuevasDia: diasEmbudo.length ? Math.round(s("bienvenida_entran") / diasEmbudo.length) : null,
      bienvenidas: s("bienvenida_entran"), responden: s("bienvenida_conversan"),
      tasa: ratio(s("bienvenida_conversan"), s("bienvenida_entran")),
      neto: fotos.length > 1 ? fotos[fotos.length - 1].seguidores - fotos[0].seguidores : null,
    };
  }, [diasEmbudo, datos.seguidores, desde]);

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

  const semanasLlamadas = useMemo(() => {
    const lunes = (iso: string) => { const d = new Date(`${String(iso).slice(0, 10)}T12:00:00Z`); d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7)); return d.toISOString().slice(0, 10); };
    const m = new Map<string, { x: string; si: number; no: number; pendiente: number }>();
    for (let s = lunes(desde); s <= hoy; s = sumarDias(s, 7)) m.set(s, { x: s, si: 0, no: 0, pendiente: 0 });
    llamadas.filter((l) => l.pasada).forEach((l) => { const k = m.get(lunes(l.fecha)); if (!k) return; if (l.asistio === "si") k.si++; else if (l.asistio === "no") k.no++; else k.pendiente++; });
    return Array.from(m.values());
  }, [llamadas, desde, hoy]);

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
    } catch (e) {
      setResultados((r) => ({ ...r, [id]: prev }));
      setError(`No se ha guardado: ${e instanceof Error ? e.message : "error"}. Vuelve a intentarlo.`);
    }
  }

  async function salir() {
    await fetch("/api/panel/logout", { method: "POST" });
    window.location.href = "/panel-fcd/entrar";
  }

  const pasadas = llamadas.filter((l) => l.pasada).sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  const proximas = llamadas.filter((l) => !l.pasada).sort((a, b) => (a.fecha < b.fecha ? -1 : 1));
  const origenesPeriodo = (datos.origenes[String(dias)] || []).slice().sort((a, b) => b.conversaciones - a.conversaciones);
  const pendientes = kLlamadas.sin_marcar + kLlamadas.venta_sin_marcar;
  const maxEmbudo = Math.max(1, ...embudo.pasos.map((p) => p.n));

  return (
    <main className="pn-wrap">
      <header className="pn-head">
        <div>
          <h1>Fit con Damián · panel</h1>
          <p className="pn-lede">
            En los últimos {dias} días entraron <b>{int(embudo.pasos[0].n)}</b> personas, <b>{int(embudo.pasos[5].n)}</b> agendaron y <b>{int(embudo.pasos[7].n)}</b> pagaron.
            {kLlamadas.sin_marcar ? ` Faltan por marcar ${kLlamadas.sin_marcar} llamadas.` : ""}
          </p>
          <p className="pn-sync">Datos de Ninjo actualizados {hace(datos.meta.agendas)} · embudo {hace(datos.meta.embudo)}</p>
        </div>
        <div className="pn-head-r">
          <div className="pn-chips" role="group" aria-label="Periodo">
            {PERIODOS.map((p) => <button key={p} type="button" aria-pressed={dias === p} onClick={() => setDias(p)}>{p} días</button>)}
          </div>
          <button type="button" className="pn-link" onClick={salir}>Salir</button>
        </div>
      </header>

      {!almacen && (
        <p className="pn-aviso">Falta conectar el almacenamiento del panel en Vercel (Storage → Blob). Hasta entonces no hay datos que mostrar ni se puede marcar nada.</p>
      )}
      {pendientes > 0 && (
        <p className="pn-aviso">Tienes {kLlamadas.sin_marcar} llamadas pasadas sin marcar si vinieron y {kLlamadas.venta_sin_marcar} sin marcar si compraron. Márcalas abajo.</p>
      )}

      <section className="pn-sec" id="embudo">
        <h2>Embudo del negocio</h2>
        <p className="pn-sub">Gente que entró en el periodo y hasta dónde ha llegado, contada por el día en que entró. Las de los últimos días aún pueden avanzar.</p>
        <div className="pn-chips" role="group" aria-label="Por dónde entran">
          <button type="button" aria-pressed={origen === "todas"} onClick={() => setOrigen("todas")}>Todas</button>
          {ORIGENES.map(([o, n]) => <button key={o} type="button" aria-pressed={origen === o} onClick={() => setOrigen(o)}>{n}</button>)}
        </div>
        <div className="pn-funnel">
          {embudo.pasos.map((p, i) => (
            <div className="pn-step" key={p.paso}>
              <span className="pn-step-name">{p.paso}</span>
              <div className="pn-step-bar">
                <div className="pn-step-fill" style={{ width: `${Math.max(1, (100 * p.n) / maxEmbudo)}%`, background: p.gris ? "#d9d6cf" : "#343337", opacity: p.gris ? 1 : Math.max(0.35, 1 - i * 0.08) }} />
                <span className="pn-step-val"><b>{int(p.n)}</b>{p.paso === "Pagan" && embudo.facturacion ? <small>{eur(embudo.facturacion)}</small> : null}</span>
              </div>
              <span className="pn-step-pct">{p.pct != null ? `${pct(p.pct)} ${p.ref}` : ""}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="pn-sec" id="entradas">
        <h2>Gente que nos entra</h2>
        <div className="pn-grid">
          <Tarjeta titulo="Seguidores ahora" valor={int(datos.perfil?.seguidores)} pie={entradas.neto == null ? "el crecimiento neto aparece con fotos de varios días" : `${entradas.neto >= 0 ? "+" : ""}${int(entradas.neto)} en el periodo`} />
          <Tarjeta titulo="Seguidoras nuevas al día" valor={int(entradas.nuevasDia)} pie="media del periodo, según las bienvenidas" />
          <Tarjeta titulo="Entradas al día" valor={int(entradas.entranDia)} pie="todos los orígenes" />
          <Tarjeta titulo="Responden a la bienvenida" valor={pct(entradas.tasa)} pie={`${int(entradas.responden)} de ${int(entradas.bienvenidas)} bienvenidas`} />
        </div>
        <Barras
          filas={diasEmbudo.map((d) => ({ x: d.fecha, ...Object.fromEntries(ORIGENES.map(([o]) => [o, num(d[`${o}_entran`])])), conv: ORIGENES.reduce((t, [o]) => t + num(d[`${o}_conversan`]), 0) }))}
          series={ORIGENES.map(([o, n]) => ({ clave: o, nombre: n, color: COLORES[o] }))}
          etiqueta={dia}
          extra={(f) => `Conversan: ${int(num(f.conv))}`}
          vacio="Todavía no hay días calculados en este periodo."
        />
      </section>

      <section className="pn-sec" id="anuncios">
        <h2>Anuncios y origen de las conversaciones</h2>
        <p className="pn-sub">Conversaciones del setter en el periodo según por dónde llegaron. Si un anuncio de Meta trae conversaciones, sale aquí con su nombre.</p>
        <div className="pn-tablewrap">
          <table className="pn-table">
            <thead><tr><th>Origen</th><th className="r">Conversaciones</th><th className="r">Llegan a la agenda</th></tr></thead>
            <tbody>
              {origenesPeriodo.length ? origenesPeriodo.map((r) => <tr key={r.origen}><td>{r.origen}</td><td className="r">{int(r.conversaciones)}</td><td className="r">{int(r.agendas)}</td></tr>)
                : <tr><td colSpan={3} className="pn-empty">Sin datos para este periodo todavía.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="pn-pend">
          <b>Inversión, coste por seguidor y coste por agenda: falta conectar Meta Ads</b>
          <p>En cuanto la cuenta publicitaria esté conectada a Claude (Windsor.ai o Supermetrics), se añade aquí y se rellena sola.</p>
        </div>
      </section>

      <section className="pn-sec" id="contenido">
        <h2>Contenido</h2>
        <p className="pn-sub">Últimas publicaciones y cuánta gente entra comentándolas. Visualizaciones, alcance y seguidores por reel llegarán al conectar las estadísticas de Instagram.</p>
        <div className="pn-tablewrap">
          <table className="pn-table">
            <thead><tr><th>Fecha</th><th>Tipo</th><th>Publicación</th><th className="r">Me gusta</th><th className="r">Coment.</th><th className="r">Entran</th><th className="r">Conversan</th><th className="r">Final</th><th className="r">Agendan</th></tr></thead>
            <tbody>
              {contenido.length ? contenido.map((p) => (
                <tr key={p.codigo}>
                  <td>{dia(p.fecha)}</td><td>{p.tipo}</td>
                  <td className="pn-texto" title={p.texto}>{/^https:\/\//.test(p.enlace) ? <a href={p.enlace} target="_blank" rel="noopener noreferrer">{p.texto || "Ver publicación"}</a> : p.texto}</td>
                  <td className="r">{int(p.likes)}</td><td className="r">{int(p.comentarios)}</td><td className="r">{int(p.entran)}</td><td className="r">{int(p.conversan)}</td><td className="r">{int(p.final)}</td><td className="r">{int(p.agendan)}</td>
                </tr>
              )) : <tr><td colSpan={9} className="pn-empty">Sin publicaciones todavía.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="pn-sec" id="llamadas">
        <h2>Llamadas</h2>
        <div className="pn-grid">
          <Tarjeta grande titulo="Agendas conseguidas" valor={int(kLlamadas.reservadas)} pie={`${int(kLlamadas.canceladas)} canceladas aparte`} />
          <Tarjeta grande titulo="Show rate" valor={pct(kLlamadas.show)} pie={`${int(kLlamadas.asistieron)} vinieron de ${int(kLlamadas.marcadas)} marcadas`} />
          <Tarjeta grande titulo="No-show" valor={pct(kLlamadas.noshow)} pie={`${int(kLlamadas.no_vinieron)} no vinieron`} />
          <Tarjeta grande titulo="Ventas" valor={int(kLlamadas.ventas)} pie={kLlamadas.venta_sin_marcar ? `${kLlamadas.venta_sin_marcar} con venta sin marcar` : "todas marcadas"} />
          <Tarjeta grande titulo="Tasa de cierre" valor={pct(kLlamadas.cierre)} pie="ventas entre las que vinieron" />
          <Tarjeta grande titulo="Facturación" valor={eur(kLlamadas.facturacion)} pie="suma de los importes marcados" />
        </div>
        <Barras
          filas={semanasLlamadas}
          series={[{ clave: "si", nombre: "Vinieron", color: "#3f8f5a" }, { clave: "no", nombre: "No vinieron", color: "#c4453c" }, { clave: "pendiente", nombre: "Sin marcar", color: "#d9d6cf" }]}
          etiqueta={(x) => `sem. ${dia(x)}`}
          vacio="Todavía no hay llamadas pasadas en este periodo."
        />
      </section>

      <section className="pn-sec" id="marcar">
        <h2>Marca cada llamada</h2>
        <p className="pn-sub">Llamadas pasadas del periodo, la más reciente arriba. Si en GoHighLevel la marcaste como presentada o no, ya aparece marcada; lo que marques aquí manda.</p>
        {error && <p className="pn-err" role="alert">{error}</p>}
        <div className="pn-tablewrap">
          <table className="pn-table">
            <thead><tr><th>Fecha</th><th>Nombre</th><th>Instagram</th><th>¿Vino?</th><th>¿Compró?</th><th>Importe (€)</th></tr></thead>
            <tbody>
              {pasadas.length ? pasadas.map((l) => (
                <tr key={l.id}>
                  <td>{fechaHora(l.fecha)}</td><td>{l.nombre || "—"}</td><td>{l.instagram ? `@${l.instagram}` : "—"}</td>
                  <td><SiNo valor={l.asistio} etiqueta={`¿Vino ${l.nombre}?`} onCambio={(v) => marcar(l.id, { asistio: v })} /></td>
                  <td><SiNo valor={l.vendido} etiqueta={`¿Compró ${l.nombre}?`} desactivado={l.asistio !== "si"} onCambio={(v) => marcar(l.id, { asistio: "si", vendido: v })} /></td>
                  <td>
                    <input className="pn-importe" type="number" min={0} step={1} inputMode="numeric" placeholder="€" aria-label={`Importe de ${l.nombre}`}
                      key={`${l.id}-${l.importe ?? ""}`} defaultValue={l.importe ?? ""} disabled={l.vendido !== "si"}
                      onBlur={(e) => { const v = e.target.value === "" ? null : Math.max(0, Number(e.target.value)); if (v !== l.importe) marcar(l.id, { asistio: "si", vendido: "si", importe: Number.isFinite(v as number) ? v : null }); }} />
                  </td>
                </tr>
              )) : <tr><td colSpan={6} className="pn-empty">No hay llamadas pasadas en este periodo.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="pn-sec" id="proximas">
        <h2>Próximas llamadas</h2>
        <div className="pn-tablewrap">
          <table className="pn-table">
            <thead><tr><th>Fecha</th><th>Nombre</th><th>Instagram</th><th>Teléfono</th><th>Viene del setter</th></tr></thead>
            <tbody>
              {proximas.length ? proximas.map((l) => (
                <tr key={l.id}><td>{fechaHora(l.fecha)}</td><td>{l.nombre || "—"}</td><td>{l.instagram ? `@${l.instagram}` : "—"}</td><td>{l.telefono || "—"}</td><td>{l.setter}</td></tr>
              )) : <tr><td colSpan={5} className="pn-empty">No hay llamadas programadas.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <details className="pn-details">
        <summary>Cómo se calcula cada número</summary>
        <dl>
          <dt>Entran</dt><dd>Personas cuya primera conversación de Instagram empezó ese día. Seguidoras nuevas: reciben la bienvenida. Seguidoras de antes: reciben el saludo &quot;te llevo viendo un tiempo&quot;. Comentan un reel: entran por un comentario. Nos escriben ellas: el primer mensaje es suyo (DM, historia o anuncio).</dd>
          <dt>Entablan conversación</dt><dd>Nos escriben por privado después de nuestro primer mensaje.</dd>
          <dt>Llegan al final</dt><dd>El agente ya les pidió los datos para la llamada (&quot;Datos ya solicitados&quot; en Ninjo).</dd>
          <dt>Nos dan sus datos</dt><dd>Dejaron su correo en la conversación.</dd>
          <dt>Agendan, vienen y pagan</dt><dd>Tienen una llamada reservada en GoHighLevel sin cancelar; de esas, las que vinieron y las que compraron según lo marcado.</dd>
          <dt>Show rate y no-show</dt><dd>De las llamadas pasadas del periodo ya marcadas, qué parte vino y qué parte no.</dd>
          <dt>Actualización</dt><dd>Claude lee Ninjo y manda los datos a este panel varias veces al día; el embudo se recalcula cada noche.</dd>
        </dl>
      </details>
    </main>
  );
}

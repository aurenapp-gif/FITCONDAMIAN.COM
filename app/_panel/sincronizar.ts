// Lee Ninjo y guarda en el almacén del panel. Lo usan el cron diario, el botón "Actualizar" y la apertura del panel.
import { AGENTE, enParalelo, ninjo, ninjoHerramienta } from "./ninjo";
import { guardar, leer, marcarSync } from "./store";
import { anunciosMeta, competenciaMeta, creativosMeta, instagramMeta, metaListo, type Creativo } from "./meta";
import { hotmartListo, stripeListo, type Venta, ventasHotmart, ventasStripe } from "./ventas";

const fmtDia = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" });
export const diaMadrid = (iso: string | Date) => {
  const d = typeof iso === "string" ? new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(iso) ? iso : `${iso}Z`) : iso;
  return fmtDia.format(d);
};
const sumarDias = (iso: string, n: number) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
// Desfase de Madrid (+01:00 / +02:00) en una fecha dada.
const offsetMadrid = (dia: string) => {
  const h = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Madrid", hour: "2-digit", hour12: false }).format(new Date(`${dia}T12:00:00Z`));
  return Number(h) - 12 === 2 ? "+02:00" : "+01:00";
};

// ---------- Actualización rápida ----------
type Schedule = { schedule_id: string; contact_id?: string; email?: string; datetime: string; created_at: string; status: string; source?: string; name?: string; first_name?: string; last_name?: string; instagram_username?: string; phone_number?: string; agent_id?: string | null };

export async function syncRapida(): Promise<Record<string, number | string>> {
  const res: Record<string, number | string> = {};
  const hoy = diaMadrid(new Date());

  // Agendas (todas las páginas)
  const todas: Schedule[] = [];
  for (let page = 1; page <= 20; page++) {
    const r = await ninjo<{ schedules: Schedule[]; total_pages: number }>("/api/v1/schedules/search", { method: "POST", body: { timezone: "Europe/Madrid", limit: 100, page, sort: "datetime_desc" } });
    todas.push(...(r.schedules || []));
    if (page >= (r.total_pages || 1)) break;
  }
  const agendas = todas.map((s) => {
    const titulo = String(s.name || "").split(" - ")[0].trim();
    return {
      id: s.schedule_id, contacto: s.contact_id || "", fecha: s.datetime, reservada: s.created_at, estado: s.status, origen: s.source || "",
      nombre: titulo || [s.first_name, s.last_name].filter((x) => x && x !== "Llamada Agendada").join(" "),
      instagram: s.instagram_username || "", telefono: s.phone_number || "", setter: s.agent_id ? "sí" : "no",
      email: String(s.email || "").toLowerCase(),
    };
  });
  await guardar("agendas", agendas); await marcarSync("agendas"); res.agendas = agendas.length;

  // Perfil y foto diaria de seguidores
  const p = await ninjo<{ username?: string; followers_count: number; media_count?: number }>("/api/v1/instagram-profile");
  await guardar("perfil", { cuenta: p.username, seguidores: p.followers_count, publicaciones: p.media_count }); await marcarSync("perfil");
  const seg = await leer<Record<string, unknown>>("seguidores", {});
  seg[hoy] = { fecha: hoy, seguidores: p.followers_count, publicaciones: p.media_count };
  await guardar("seguidores", seg); await marcarSync("seguidores"); res.seguidores = p.followers_count;

  // Publicaciones
  const tipos: Record<string, string> = { VIDEO: "Reel", CAROUSEL_ALBUM: "Carrusel", IMAGE: "Foto" };
  const posts = await ninjo<{ posts: { id: string; permalink?: string; timestamp?: string; media_type?: string; caption?: string; like_count?: number; comments_count?: number }[] }>("/api/v1/instagram-posts", { query: { limit: 30 } });
  const publicaciones = (posts.posts || []).map((x) => {
    const m = String(x.permalink || "").match(/instagram\.com\/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/);
    return { id: x.id, codigo: m ? m[1] : x.id, fecha: x.timestamp, tipo: tipos[x.media_type || ""] || x.media_type || "", texto: String(x.caption || "").replace(/\s+/g, " ").slice(0, 90), enlace: x.permalink || "", likes: x.like_count || 0, comentarios: x.comments_count || 0 };
  });
  await guardar("publicaciones", publicaciones); await marcarSync("publicaciones"); res.publicaciones = publicaciones.length;

  // Origen de las conversaciones del setter
  const nombres: Record<string, string> = { "Organic DM": "DM orgánico", Comment: "Comentario", "Story Reply": "Respuesta a historia" };
  const origenes: Record<string, { origen: string; conversaciones: number; agendas: number }[]> = {};
  await enParalelo([7, 14, 30, 90], 4, async (dias) => {
    const r = await ninjo<{ sources?: { source: string; total_conversations?: number; bookings_sent?: number }[] }>("/api/v1/analytics/agent-insights", { query: { agent_id: AGENTE, days: dias, sections: "sources" } });
    origenes[String(dias)] = (r.sources || []).map((s) => ({ origen: nombres[s.source] || s.source, conversaciones: s.total_conversations || 0, agendas: s.bookings_sent || 0 }));
  });
  await guardar("origenes", origenes); await marcarSync("origenes");

  // Comprobación cruzada: recuento propio de Ninjo de mensajes manuales (autor "automation") por ventana de días.
  const manuales: Record<string, number> = {};
  await enParalelo([1, 7, 14, 30], 4, async (dias) => {
    const r = await ninjo<{ channels?: { messages?: { automation?: number } }[] }>("/api/v1/analytics/agent-insights", { query: { days: dias, sections: "channels" } });
    manuales[String(dias)] = (r.channels || []).reduce((t, c) => t + (c.messages?.automation || 0), 0);
  });
  await guardar("control", { manuales_ninjo: manuales, leido: new Date().toISOString() });
  return res;
}

// ---------- Embudo por día de entrada ----------
type Mensaje = { direction?: string; author?: string; type?: string; status?: string; sent_at?: string; content?: string; comment?: { post_url?: string | null } };
type Conversacion = { conversation_id: string; contact_id: string; messages?: Mensaje[] };
type Origen = "bienvenida" | "saludo" | "comentario" | "mensaje";
const ORIGENES: Origen[] = ["bienvenida", "saludo", "comentario", "mensaje"];

// Plantillas de apertura (sin acentos ni mayúsculas): b = bienvenida, s = mensaje a seguidora, o = otros, h = reacción a historia
const sinAcentos = (t: string) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
function tipoApertura(texto: string): "b" | "s" | "o" | "h" | null {
  const n = sinAcentos(texto);
  if ((n.includes("pillado") && n.includes("movil")) || n.includes("darte la bienvenida")) return "b";
  if (n.includes("llevo viendo") || n.includes("llevo un tiempo viendote") || n.includes("llevo viendote")) return "s";
  if (n.includes("darle algun consejo") || n.includes("video de trabajo a turnos")) return "o";
  if (n.includes("reaccionado a mi historia")) return "h";
  return null;
}

function clasificar(c: Conversacion) {
  const msgs = (c.messages || []).slice().sort((a, b) => String(a.sent_at || "").localeCompare(String(b.sent_at || "")));
  const m0 = msgs[0];
  if (!m0 || !m0.sent_at) return null;
  let origen: Origen; let post: string | null = null;
  if (m0.direction === "OUTBOUND") {
    if (m0.type === "COMMENT" || m0.type === "PRIVATE_REPLY" || m0.status === "FAILED") return null;
    origen = /bienvenida/i.test(m0.content || "") ? "bienvenida" : "saludo";
  } else if (m0.type === "COMMENT") {
    origen = "comentario";
    const m = String(m0.comment?.post_url || "").match(/instagram\.com\/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/);
    post = m ? m[1] : null;
  } else origen = "mensaje";
  const t0 = m0.sent_at;
  const conversan = origen === "mensaje" || msgs.slice(1).some((m) => m.direction === "INBOUND" && m.type !== "COMMENT" && String(m.sent_at || "") > t0);
  return { dia: diaMadrid(t0), origen, post, conversan, contacto: c.contact_id };
}

async function idsContactos(filtro: { id: string; value: string }, desde: string, hasta: string): Promise<Set<string>> {
  const ids = new Set<string>();
  for (let page = 1; page <= 20; page++) {
    type Lista = { contacts?: { id: string }[]; totalCount?: number };
    const r = await ninjo<Lista & { data?: Lista & { data?: Lista }; result?: Lista & { data?: Lista } }>("/api/v1/crm/list_crm_contacts", {
      method: "POST", body: { input: { page, pageSize: 100, columnFilters: [filtro, { id: "createdAt", value: [desde, hasta] }] } },
    });
    const d: Lista = [r.data?.data, r.data, r.result?.data, r.result, r].find((x) => x && Array.isArray(x.contacts)) || {};
    (d.contacts || []).forEach((c) => ids.add(c.id));
    if (page * 100 >= (d.totalCount || 0)) break;
  }
  return ids;
}

export async function syncEmbudo(diasAtras = 21): Promise<Record<string, number | string>> {
  const hoy = diaMadrid(new Date());
  // Cubre al menos las últimas `diasAtras` jornadas y, siempre, el mes en curso desde el día 1.
  const inicioMes = `${hoy.slice(0, 8)}01`;
  const hace = sumarDias(hoy, -diasAtras);
  const desde = inicioMes < hace ? inicioMes : hace, hasta = hoy; // hoy va parcial y se completa en la siguiente lectura
  const base = { has_agent: "any", channel: "INSTAGRAM", sort_by: "first_message_at", limit: 100,
    // Todas las conversaciones con actividad desde `desde`: así entran también los mensajes enviados en conversaciones antiguas.
    last_message_after: `${desde}T00:00:00${offsetMadrid(desde)}` };
  type Pagina = { conversations: Conversacion[]; total_pages: number; total_count: number; excluded_by_has_agent?: number };
  // Por MCP: la API normal solo devuelve conversaciones con agente y aquí hacen falta todas (has_agent "any").
  const buscar = (page: number) => ninjoHerramienta<Pagina>("search_conversations", { ...base, page });
  const p1 = await buscar(1);
  // Si la API deja fuera las conversaciones sin agente (bienvenidas sin respuesta), el embudo saldría mal: no se toca lo guardado.
  if ((p1.excluded_by_has_agent || 0) > 0) {
    return { omitido: `La API de Ninjo dejó fuera ${p1.excluded_by_has_agent} conversaciones sin agente; se conserva el embudo guardado.` };
  }
  const resto = await enParalelo(Array.from({ length: Math.max(0, (p1.total_pages || 1) - 1) }, (_, i) => i + 2), 4,
    (page) => buscar(page));
  const convs = new Map<string, Conversacion>();
  [p1, ...resto].forEach((p) => (p.conversations || []).forEach((c) => convs.set(c.conversation_id, c)));

  const desdeContactos = sumarDias(hoy, -(diasAtras + 40));
  const [final, datos] = await Promise.all([
    idsContactos({ id: "booking_data_requested", value: "true" }, desdeContactos, sumarDias(hoy, 1)),
    idsContactos({ id: "email_shared", value: "@" }, desdeContactos, sumarDias(hoy, 1)),
  ]);

  type Dia = Record<string, unknown> & { ids: Record<Origen, string[]> };
  const embudo: Record<string, Dia> = {};
  for (let d = desde; d <= hasta; d = sumarDias(d, 1)) {
    const doc: Dia = { fecha: d, conversaciones_revisadas: 0, ids: { bienvenida: [], saludo: [], comentario: [], mensaje: [] } };
    ORIGENES.forEach((o) => ["entran", "conversan", "final", "datos"].forEach((k) => { doc[`${o}_${k}`] = 0; }));
    ["b", "s", "o", "h"].forEach((t) => { doc[`ap_${t}`] = 0; doc[`ap_${t}_resp`] = 0; });
    doc.ap_manual = 0;
    embudo[d] = doc;
  }
  const contenido: Record<string, { post: string; fecha: string; entran: number; conversan: number; final: number; datos: number; ids: string[] }> = {};
  const vistos = new Set<string>();
  convs.forEach((c) => {
    const r = clasificar(c);
    if (!r || !embudo[r.dia]) return;
    const e = embudo[r.dia];
    e.conversaciones_revisadas = (e.conversaciones_revisadas as number) + 1;
    const clave = `${r.dia}|${r.origen}|${r.contacto}`;
    if (vistos.has(clave)) return;
    vistos.add(clave);
    const inc = (k: string, v = 1) => { e[`${r.origen}_${k}`] = (e[`${r.origen}_${k}`] as number) + v; };
    const llega = final.has(r.contacto), da = datos.has(r.contacto);
    inc("entran");
    if (r.conversan) { inc("conversan"); e.ids[r.origen].push(r.contacto); }
    if (llega) inc("final");
    if (da) inc("datos");
    if (r.origen === "comentario" && r.post) {
      const id = `${r.post}_${r.dia}`;
      const p = (contenido[id] ||= { post: r.post, fecha: r.dia, entran: 0, conversan: 0, final: 0, datos: 0, ids: [] });
      p.entran++; if (r.conversan) { p.conversan++; p.ids.push(r.contacto); } if (llega) p.final++; if (da) p.datos++;
    }
  });

  // Mensajes de apertura enviados cada día (estén o no al principio de la conversación) y si respondieron después.
  convs.forEach((c) => {
    const msgs = (c.messages || []).slice().sort((a, b) => String(a.sent_at || "").localeCompare(String(b.sent_at || "")));
    msgs.forEach((m, i) => {
      if (m.direction !== "OUTBOUND" || m.status === "FAILED" || !m.sent_at) return;
      if (m.author === "automation") {
        const em = embudo[diaMadrid(m.sent_at)];
        if (em) em.ap_manual = ((em.ap_manual as number) || 0) + 1; // todo lo que el setter manda a mano (fuera de Ninjo)
      }
      const t = tipoApertura(m.content || "");
      if (!t) return;
      const e = embudo[diaMadrid(m.sent_at)];
      if (!e) return;
      const resp = msgs.slice(i + 1).some((x) => x.direction === "INBOUND" && x.type !== "COMMENT" && String(x.sent_at || "") > String(m.sent_at));
      e[`ap_${t}`] = ((e[`ap_${t}`] as number) || 0) + 1;
      e[`ap_${t}_resp`] = ((e[`ap_${t}_resp`] as number) || 0) + (resp ? 1 : 0);
    });
  });

  const ahora = new Date().toISOString();
  const embGuardado = await leer<Record<string, unknown>>("embudo", {});
  Object.entries(embudo).forEach(([k, v]) => { embGuardado[k] = { ...v, calculado_en: ahora }; });
  await guardar("embudo", embGuardado); await marcarSync("embudo");
  const contGuardado = await leer<Record<string, { fecha?: string }>>("contenido", {});
  Object.keys(contGuardado).forEach((k) => { const f = contGuardado[k]?.fecha; if (f && f >= desde && f <= hasta) delete contGuardado[k]; });
  Object.entries(contenido).forEach(([k, v]) => { contGuardado[k] = { ...v, calculado_en: ahora } as never; });
  await guardar("contenido", contGuardado); await marcarSync("contenido");
  const sumaAp = (k: string) => Object.values(embudo).reduce((t, d) => t + (Number(d[k]) || 0), 0);
  return { bienvenidas: sumaAp("ap_b"), bienvenidas_resp: sumaAp("ap_b_resp"), seguidoras: sumaAp("ap_s"), seguidoras_resp: sumaAp("ap_s_resp"),
    conversaciones: convs.size, total_count: p1.total_count, excluidas: p1.excluded_by_has_agent ?? "—", final: final.size, datos: datos.size, desde, hasta };
}

// ---------- Ventas (Hotmart y Stripe) ----------
export async function syncVentas(): Promise<Record<string, number | string>> {
  const desdeMs = Date.now() - 400 * 864e5; // algo más de un año
  const res: Record<string, number | string> = {};
  const todas: Venta[] = [];
  if (hotmartListo()) { const h = await ventasHotmart(desdeMs); todas.push(...h.ventas); res.hotmart = h.ventas.length; }
  if (stripeListo()) { const st = await ventasStripe(desdeMs); todas.push(...st.ventas); res.stripe = st.ventas.length; }
  if (!hotmartListo() && !stripeListo()) return { omitido: "sin claves de Hotmart ni Stripe" };
  await guardar("ventas", todas); await marcarSync("ventas");
  // Resumen sin datos personales: cuántas por estado y suma por moneda.
  const estados: Record<string, number> = {}, sumas: Record<string, number> = {};
  todas.forEach((v) => { estados[v.estado] = (estados[v.estado] || 0) + 1; sumas[v.moneda] = Math.round((sumas[v.moneda] || 0) + v.importe); });
  res.estados = JSON.stringify(estados); res.sumas = JSON.stringify(sumas);
  res.ultima = todas.map((v) => v.fecha).sort().pop() || "";
  return res;
}

// ---------- Meta Ads e Instagram ----------
export async function syncMeta(): Promise<Record<string, unknown>> {
  if (!metaListo()) return { omitido: "sin token de Meta" };
  const res: Record<string, unknown> = {};
  const hoy = diaMadrid(new Date());
  const desde = sumarDias(`${hoy.slice(0, 8)}01`, -62); // el mes en curso y los dos anteriores
  try {
    const filas = await anunciosMeta(desde, hoy);
    await guardar("anuncios", { desde, hasta: hoy, filas });
    res.anuncios = filas.length;
    res.gasto = Math.round(filas.reduce((t, f) => t + f.gasto, 0));
    res.conversaciones = filas.reduce((t, f) => t + f.conversaciones, 0);
    res.seguidores_anuncios = filas.reduce((t, f) => t + f.seguidores, 0);
  } catch (e) { res.anuncios_error = e instanceof Error ? e.message : String(e); }
  try {
    const pubs = await leer<{ id?: string }[]>("publicaciones", []);
    const ig = await instagramMeta(pubs.map((p) => p.id || "").filter(Boolean));
    const previo = await leer<{ seguidores_dia?: Record<string, number> }>("instagram", {});
    await guardar("instagram", { ...ig, seguidores_dia: { ...(previo.seguidores_dia || {}), ...ig.seguidores_dia }, leido: new Date().toISOString() });
    res.instagram_dias = Object.keys(ig.seguidores_dia).length;
    res.instagram_medios = Object.values(ig.medios).filter((m) => Object.keys(m).length).length;
    res.metricas_ejemplo = Object.keys(Object.values(ig.medios).find((m) => Object.keys(m).length) || {}).join(",");
    if (ig.avisos.length) res.instagram_avisos = ig.avisos;
  } catch (e) { res.instagram_error = e instanceof Error ? e.message : String(e); }
  // Textos de los anuncios con gasto reciente y cuentas del sector: cada 12 horas como mucho.
  const meta = await leer<Record<string, string>>("meta", {});
  const viejo = (k: string) => !meta[k] || Date.now() - new Date(meta[k]).getTime() > 12 * 3600e3;
  try {
    const guardados = await leer<{ anuncios?: Record<string, Creativo> }>("creativos", {});
    const an = await leer<{ filas?: { fecha: string; anuncio_id: string; gasto: number }[] }>("anuncios", {});
    const limite = sumarDias(hoy, -40);
    const ids = Array.from(new Set((an.filas || []).filter((f) => f.fecha >= limite && f.gasto > 0).map((f) => f.anuncio_id)));
    const faltan = ids.filter((id) => !guardados.anuncios?.[id]);
    if (faltan.length || viejo("creativos")) {
      const nuevos = await creativosMeta(viejo("creativos") ? ids : faltan);
      await guardar("creativos", { anuncios: { ...(guardados.anuncios || {}), ...nuevos } });
      await marcarSync("creativos");
      res.creativos = Object.keys(nuevos).length;
    }
  } catch (e) { res.creativos_error = e instanceof Error ? e.message : String(e); }
  try {
    const usuarios = await leer<string[]>("competidores", []);
    if (usuarios.length && viejo("competencia")) {
      const cuentas = await competenciaMeta(usuarios);
      await guardar("competencia", { leido: new Date().toISOString(), cuentas });
      await marcarSync("competencia");
      res.competencia = cuentas.map((c) => `${c.usuario}:${c.error ? "error" : c.publicaciones.length}`).join(",");
    }
  } catch (e) { res.competencia_error = e instanceof Error ? e.message : String(e); }
  await marcarSync("anuncios");
  return res;
}

// ---------- Ejecución con registro ----------
export async function ejecutar(via: string, completo: boolean): Promise<Record<string, unknown>> {
  const informe: Record<string, unknown> = { via, inicio: new Date().toISOString() };
  try {
    informe.rapida = await syncRapida();
    try { informe.meta = await syncMeta(); } catch (e) { informe.meta = { error: e instanceof Error ? e.message : String(e) }; }
    try { informe.ventas = await syncVentas(); } catch (e) { informe.ventas = { error: e instanceof Error ? e.message : String(e) }; }
    if (completo) informe.embudo = await syncEmbudo();
    informe.ok = true;
  } catch (e) {
    informe.ok = false;
    informe.error = e instanceof Error ? e.message : String(e);
  }
  informe.fin = new Date().toISOString();
  try {
    const registro = await leer<Record<string, unknown>[]>("registro", []);
    registro.unshift(informe);
    await guardar("registro", registro.slice(0, 60));
  } catch {}
  return informe;
}

// ---------- Estudio de los primeros mensajes (bienvenidas y mensajes a seguidoras) ----------
// Agrupa cada plantilla por su texto (con el nombre de la persona sustituido por {n}) y mide cuántas responden,
// a qué hora se envían, si el seguimiento sin respuesta funciona y qué contesta la gente. Solo para diagnóstico.
const horaMadrid = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Madrid", hour: "2-digit", hour12: false, weekday: "short" });
function plantilla(texto: string): string {
  const t = texto.replace(/\s+/g, " ").trim().split(" ");
  return t.map((w, i) => (i > 0 && /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+[,.!?]*$/.test(w) && !/[.!?]$/.test(t[i - 1]) ? `{n}${w.match(/[,.!?]*$/)?.[0] || ""}` : w)).join(" ");
}
export async function estudioAperturas(dias = 30) {
  const hoy = diaMadrid(new Date());
  const desde = sumarDias(hoy, -dias);
  const base = { has_agent: "any", channel: "INSTAGRAM", sort_by: "first_message_at", limit: 100, last_message_after: `${desde}T00:00:00${offsetMadrid(desde)}` };
  type Pagina = { conversations: Conversacion[]; total_pages: number };
  const buscar = (page: number) => ninjoHerramienta<Pagina>("search_conversations", { ...base, page });
  const p1 = await buscar(1);
  const resto = await enParalelo(Array.from({ length: Math.max(0, (p1.total_pages || 1) - 1) }, (_, i) => i + 2), 4, (page) => buscar(page));
  const convs = new Map<string, Conversacion>();
  [p1, ...resto].forEach((p) => (p.conversations || []).forEach((c) => convs.set(c.conversation_id, c)));

  type Est = { enviados: number; responden: number; minutos: number[] };
  const nuevo = (): Est => ({ enviados: 0, responden: 0, minutos: [] });
  const variantes: Record<string, Record<string, Est & { ejemplo: string; largo: number; franjas: Record<string, Est>; primero: string; ultimo: string }>> = { b: {}, s: {} };
  const franja = (h: number) => (h < 10 ? "06-09" : h < 14 ? "10-13" : h < 19 ? "14-18" : "19-23");
  const porHora: Record<string, Record<string, Est>> = { b: {}, s: {} };
  const porDiaSemana: Record<string, Record<string, Est>> = { b: {}, s: {} };
  const seguimiento: Record<string, { sin_respuesta: number; con_seguimiento: number; responden_tras_seguimiento: number; textos: Record<string, number> }> = { b: { sin_respuesta: 0, con_seguimiento: 0, responden_tras_seguimiento: 0, textos: {} }, s: { sin_respuesta: 0, con_seguimiento: 0, responden_tras_seguimiento: 0, textos: {} } };
  const respuestas: Record<string, string[]> = { b: [], s: [] };
  const despuesDeResponder: Record<string, { siguiente_setter: string; segunda_respuesta: boolean }[]> = { b: [], s: [] };
  convs.forEach((c) => {
    const msgs = (c.messages || []).filter((m) => m.sent_at && m.status !== "FAILED").sort((a, b) => String(a.sent_at).localeCompare(String(b.sent_at)));
    msgs.forEach((m, i) => {
      if (m.direction !== "OUTBOUND") return;
      const t = tipoApertura(m.content || "");
      if (t !== "b" && t !== "s") return;
      if (diaMadrid(String(m.sent_at)) < desde) return;
      // Solo la primera apertura de cada conversación (las repeticiones cuentan como seguimiento).
      if (msgs.slice(0, i).some((x) => x.direction === "OUTBOUND" && tipoApertura(x.content || "") === t)) return;
      const tras = msgs.slice(i + 1);
      const iResp = tras.findIndex((x) => x.direction === "INBOUND" && x.type !== "COMMENT");
      const resp = iResp >= 0 ? tras[iResp] : null;
      const minutos = resp ? Math.round((new Date(String(resp.sent_at)).getTime() - new Date(String(m.sent_at)).getTime()) / 60000) : null;
      const k = plantilla(m.content || "");
      const v = (variantes[t][k] ||= { ...nuevo(), ejemplo: k, largo: (m.content || "").length, franjas: {}, primero: String(m.sent_at), ultimo: String(m.sent_at) });
      if (String(m.sent_at) < v.primero) v.primero = String(m.sent_at); if (String(m.sent_at) > v.ultimo) v.ultimo = String(m.sent_at);
      const partes = horaMadrid.formatToParts(new Date(String(m.sent_at)));
      const hora = partes.find((x) => x.type === "hour")?.value || "?";
      const dsem = partes.find((x) => x.type === "weekday")?.value || "?";
      const h = (porHora[t][hora] ||= nuevo()), d = (porDiaSemana[t][dsem] ||= nuevo());
      const fr = (v.franjas[franja(Number(hora))] ||= nuevo());
      [v, h, d, fr].forEach((x) => { x.enviados++; if (resp) { x.responden++; if (minutos != null) x.minutos.push(minutos); } });
      // Mensajes del setter antes de la primera respuesta (seguimientos).
      const previos = (iResp >= 0 ? tras.slice(0, iResp) : tras).filter((x) => x.direction === "OUTBOUND");
      const sg = seguimiento[t];
      if (previos.length) {
        sg.con_seguimiento++;
        const pk = plantilla(previos[0].content || "").slice(0, 160);
        sg.textos[pk] = (sg.textos[pk] || 0) + 1;
        if (resp) sg.responden_tras_seguimiento++;
      }
      if (!resp) sg.sin_respuesta++;
      if (resp && respuestas[t].length < 60) respuestas[t].push(String(resp.content || `[${resp.type}]`).replace(/\s+/g, " ").slice(0, 140));
      if (resp && despuesDeResponder[t].length < 40) {
        const resto2 = tras.slice(iResp + 1);
        const sig = resto2.find((x) => x.direction === "OUTBOUND");
        const iSig = sig ? resto2.indexOf(sig) : -1;
        despuesDeResponder[t].push({ siguiente_setter: String(sig?.content || "").replace(/\s+/g, " ").slice(0, 220), segunda_respuesta: iSig >= 0 && resto2.slice(iSig + 1).some((x) => x.direction === "INBOUND") });
      }
    });
  });
  const res = (e: Est) => ({ enviados: e.enviados, responden: e.responden, tasa: e.enviados ? Math.round((1000 * e.responden) / e.enviados) / 10 : null, mediana_min: e.minutos.length ? e.minutos.sort((a, b) => a - b)[Math.floor(e.minutos.length / 2)] : null });
  const out = (t: "b" | "s") => ({
    variantes: Object.values(variantes[t]).sort((a, b) => b.enviados - a.enviados).slice(0, 15).map((v) => ({ texto: v.ejemplo, largo: v.largo, ...res(v), desde: diaMadrid(v.primero), hasta: diaMadrid(v.ultimo), franjas: Object.fromEntries(Object.entries(v.franjas).sort().map(([k, x]) => [k, res(x)])) })),
    por_hora: Object.fromEntries(Object.entries(porHora[t]).sort().map(([k, v]) => [k, res(v)])),
    por_dia_semana: Object.fromEntries(Object.entries(porDiaSemana[t]).map(([k, v]) => [k, res(v)])),
    seguimiento: { ...seguimiento[t], textos: Object.entries(seguimiento[t].textos).sort((a, b) => b[1] - a[1]).slice(0, 6) },
    primeras_respuestas: respuestas[t],
    despues_de_responder: despuesDeResponder[t],
  });
  return { desde, conversaciones: convs.size, bienvenidas: out("b"), a_seguidoras: out("s") };
}

// ---------- Conversaciones anonimizadas para el analista nocturno ----------
// paso "responden": aperturas con y sin respuesta · "final": respondieron pero no llegaron a la oferta de llamada ·
// "llegan": llegaron al final (para comparar). Sin nombres de usuario, correos, teléfonos ni enlaces personales.
type ConvConUsuario = Conversacion & { contact_username?: string | null };
function anonimizar(texto: string, usuario?: string | null): string {
  let t = String(texto || "");
  if (usuario) t = t.split(usuario).join("[usuario]");
  return t
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "[correo]")
    .replace(/\+?\d[\d\s-]{7,}\d/g, "[teléfono]")
    .replace(/@[\w.]{2,30}/g, "@[cuenta]")
    .replace(/https?:\/\/\S+/g, (u) => (/instagram\.com\/(p|reel)\//.test(u) ? u : "[enlace]"))
    .slice(0, 900);
}
export async function conversacionesParaEstudio(paso: "responden" | "final" | "llegan", dias = 14, n = 30) {
  const hoy = diaMadrid(new Date());
  const desde = sumarDias(hoy, -dias);
  const base = { has_agent: "any", channel: "INSTAGRAM", sort_by: "first_message_at", limit: 100, first_message_after: `${desde}T00:00:00${offsetMadrid(desde)}` };
  type Pagina = { conversations: ConvConUsuario[]; total_pages: number };
  const p1 = await ninjoHerramienta<Pagina>("search_conversations", { ...base, page: 1 });
  const paginas = Math.min(6, p1.total_pages || 1);
  const resto = await enParalelo(Array.from({ length: paginas - 1 }, (_, i) => i + 2), 4, (page) => ninjoHerramienta<Pagina>("search_conversations", { ...base, page }));
  const convs = [p1, ...resto].flatMap((p) => p.conversations || []);
  const final = await idsContactos({ id: "booking_data_requested", value: "true" }, sumarDias(hoy, -(dias + 40)), sumarDias(hoy, 1));
  const responde = (c: Conversacion) => (c.messages || []).some((m) => m.direction === "INBOUND" && m.type !== "COMMENT" && m.status !== "FAILED");
  const nInbound = (c: Conversacion) => (c.messages || []).filter((m) => m.direction === "INBOUND" && m.type !== "COMMENT").length;
  const conApertura = (c: Conversacion) => (c.messages || []).some((m) => m.direction === "OUTBOUND" && tipoApertura(m.content || ""));
  let elegidas: (ConvConUsuario & { grupo: string })[] = [];
  if (paso === "responden") {
    const ap = convs.filter(conApertura);
    elegidas = [...ap.filter(responde).slice(0, Math.ceil(n / 2)).map((c) => ({ ...c, grupo: "respondió" })), ...ap.filter((c) => !responde(c)).slice(0, Math.floor(n / 2)).map((c) => ({ ...c, grupo: "no respondió" }))];
  } else if (paso === "final") {
    elegidas = convs.filter((c) => responde(c) && !final.has(c.contact_id)).sort((a, b) => nInbound(b) - nInbound(a)).slice(0, n).map((c) => ({ ...c, grupo: "respondió pero no llegó al final" }));
  } else {
    elegidas = convs.filter((c) => final.has(c.contact_id)).slice(0, n).map((c) => ({ ...c, grupo: "llegó al final" }));
  }
  return {
    paso, desde, revisadas: convs.length, total_que_cumplen: elegidas.length,
    conversaciones: elegidas.map((c, i) => {
      const msgs = (c.messages || []).filter((m) => m.sent_at).sort((a, b) => String(a.sent_at).localeCompare(String(b.sent_at)));
      const t0 = msgs.length ? new Date(String(msgs[0].sent_at)).getTime() : 0;
      return {
        n: i + 1, grupo: c.grupo,
        mensajes: msgs.slice(0, 40).map((m) => ({
          de: m.direction === "INBOUND" ? "persona" : m.author === "automation" ? "setter humano" : m.author === "agent" || m.author === "ai" ? "setter IA" : `setter (${m.author || "?"})`,
          min: Math.round((new Date(String(m.sent_at)).getTime() - t0) / 60000),
          tipo: m.type && m.type !== "TEXT" ? m.type : undefined, fallido: m.status === "FAILED" || undefined,
          texto: anonimizar(m.content || "", c.contact_username),
        })),
      };
    }),
  };
}

// Configuración del setter (prompt y ajustes), para que el analista proponga cambios sobre lo que hay.
export async function configuracionSetter() {
  const r = await ninjoHerramienta<Record<string, unknown>>("get_agent_config", { agent_id: AGENTE });
  const txt = JSON.stringify(r);
  return txt.length > 60000 ? { recortado: true, config: txt.slice(0, 60000) } : r;
}

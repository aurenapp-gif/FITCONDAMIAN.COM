// Meta Ads e Instagram (Graph API) con el token de un usuario del sistema.
// Variables: META_ACCESS_TOKEN y META_AD_ACCOUNT_ID (también sin guiones bajos). Opcional: META_IG_ID.

const env = (...n: string[]) => n.map((k) => process.env[k]).find((v) => v && v.trim())?.trim() || "";
// Además de los nombres exactos, acepta cualquier variable con un nombre parecido (META_TOKEN, FB_ACCESS_TOKEN…).
const parecida = (re: RegExp) => Object.keys(process.env).filter((k) => re.test(k)).map((k) => process.env[k]).find((v) => v && v.trim())?.trim() || "";
const token = () => env("META_ACCESS_TOKEN", "METAACCESSTOKEN") || parecida(/^(META|FB|FACEBOOK)_?(ADS_?)?(ACCESS_?)?TOKEN$/i);
const cuenta = () => (env("META_AD_ACCOUNT_ID", "METAADACCOUNTID") || parecida(/^(META|FB|FACEBOOK)_?(AD_?)?(ACCOUNT|CUENTA)(_?ID)?$/i)).replace(/^act_/i, "").replace(/\D/g, "");
const BASE = `https://graph.facebook.com/${env("META_API_VERSION") || "v26.0"}`;

export const metaListo = () => Boolean(token());

async function graph<T>(ruta: string, params: Record<string, string> = {}): Promise<T> {
  const url = ruta.startsWith("http") ? new URL(ruta) : new URL(`${BASE}/${ruta.replace(/^\//, "")}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  if (!url.searchParams.has("access_token")) url.searchParams.set("access_token", token());
  const r = await fetch(url, { cache: "no-store" });
  const j = (await r.json().catch(() => ({}))) as T & { error?: { message?: string; code?: number } };
  if (!r.ok || j.error) throw new Error(`Meta: ${j.error?.message || r.status}`);
  return j;
}

type Accion = { action_type: string; value: string };
export type FilaAnuncio = { fecha: string; campana: string; conjunto: string; anuncio: string; anuncio_id: string; gasto: number; impresiones: number; alcance: number; clics: number; conversaciones: number; seguidores: number; visitas_perfil: number };

export async function anunciosMeta(desde: string, hasta: string): Promise<FilaAnuncio[]> {
  if (!cuenta()) throw new Error("Falta META_AD_ACCOUNT_ID");
  const filas: FilaAnuncio[] = [];
  const ruta = `act_${cuenta()}/insights`;
  const params: Record<string, string> = {
    level: "ad", time_increment: "1", limit: "500",
    fields: "date_start,campaign_name,adset_name,ad_name,ad_id,spend,impressions,reach,clicks,actions",
    time_range: JSON.stringify({ since: desde, until: hasta }),
  };
  // Se pagina con el cursor "after" y la misma versión de la API (el enlace "next" de Meta apunta a una versión antigua).
  let despues = "";
  for (let i = 0; i < 40; i++) {
    const r: { data: (Record<string, string> & { actions?: Accion[] })[]; paging?: { next?: string; cursors?: { after?: string } } } = await graph(ruta, despues ? { ...params, after: despues } : params);
    for (const d of r.data || []) {
      const acc = (tipo: RegExp) => (d.actions || []).filter((a) => tipo.test(a.action_type)).reduce((t, a) => t + (Number(a.value) || 0), 0);
      filas.push({
        fecha: d.date_start, campana: d.campaign_name || "", conjunto: d.adset_name || "", anuncio: d.ad_name || "", anuncio_id: d.ad_id || "",
        gasto: Number(d.spend) || 0, impresiones: Number(d.impressions) || 0, alcance: Number(d.reach) || 0, clics: Number(d.clicks) || 0,
        conversaciones: acc(/messaging_conversation_started/),
        seguidores: acc(/(^|\.)(follow|like)$|instagram_profile_follow|page_like/),
        visitas_perfil: acc(/profile_visit|instagram_profile_visit/),
      });
    }
    despues = r.paging?.next ? r.paging?.cursors?.after || "" : "";
    if (!despues) break;
  }
  return filas;
}

// Cuenta de Instagram ligada al token (por las páginas a las que tiene acceso) o la de META_IG_ID.
export async function idInstagram(): Promise<string> {
  const fijo = env("META_IG_ID", "METAIGID");
  if (fijo) return fijo;
  const r = await graph<{ data: { instagram_business_account?: { id: string } }[] }>("me/accounts", { fields: "instagram_business_account" });
  const id = (r.data || []).map((p) => p.instagram_business_account?.id).find(Boolean);
  if (!id) throw new Error("El token no tiene acceso a ninguna página con Instagram");
  return id;
}

export async function instagramMeta(mediaIds: string[]): Promise<{ seguidores_dia: Record<string, number>; medios: Record<string, Record<string, number>>; avisos: string[] }> {
  const ig = await idInstagram();
  const avisos: string[] = [];
  const seguidores_dia: Record<string, number> = {};
  try {
    const hasta = Math.floor(Date.now() / 1000), desde = hasta - 29 * 86400;
    const r = await graph<{ data: { name: string; values: { value: number; end_time: string }[] }[] }>(`${ig}/insights`, { metric: "follower_count", period: "day", since: String(desde), until: String(hasta) });
    for (const v of r.data?.[0]?.values || []) seguidores_dia[v.end_time.slice(0, 10)] = Number(v.value) || 0;
  } catch (e) { avisos.push(`seguidores: ${e instanceof Error ? e.message : e}`); }

  const medios: Record<string, Record<string, number>> = {};
  const metricas = ["reach", "views", "saved", "shares", "follows", "profile_visits", "total_interactions"];
  for (const id of mediaIds.slice(0, 30)) {
    const res: Record<string, number> = {};
    try {
      const r = await graph<{ data: { name: string; values?: { value: number }[]; total_value?: { value: number } }[] }>(`${id}/insights`, { metric: metricas.join(",") });
      for (const m of r.data || []) res[m.name] = Number(m.total_value?.value ?? m.values?.[0]?.value) || 0;
    } catch {
      // Si alguna métrica no existe para ese tipo de publicación, se piden una a una.
      for (const m of metricas) {
        try {
          const r = await graph<{ data: { name: string; values?: { value: number }[]; total_value?: { value: number } }[] }>(`${id}/insights`, { metric: m });
          const d = r.data?.[0]; if (d) res[d.name] = Number(d.total_value?.value ?? d.values?.[0]?.value) || 0;
        } catch {}
      }
    }
    medios[id] = res;
  }
  return { seguidores_dia, medios, avisos };
}

// Textos y formato de cada anuncio (para estudiar qué mensajes funcionan).
export type Creativo = { titulo?: string; texto?: string; textos?: string[]; miniatura?: string; formato?: string; video?: boolean; enlace_ig?: string; cta?: string };
export async function creativosMeta(adIds: string[]): Promise<Record<string, Creativo>> {
  const out: Record<string, Creativo> = {};
  type Cr = { title?: string; body?: string; thumbnail_url?: string; object_type?: string; video_id?: string; instagram_permalink_url?: string; call_to_action_type?: string; asset_feed_spec?: { bodies?: { text?: string }[]; titles?: { text?: string }[] } };
  for (let i = 0; i < adIds.length; i += 40) {
    const lote = adIds.slice(i, i + 40);
    const r = await graph<Record<string, { creative?: Cr }>>("", { ids: lote.join(","), fields: "creative{title,body,thumbnail_url,object_type,video_id,instagram_permalink_url,call_to_action_type,asset_feed_spec}" });
    for (const [id, v] of Object.entries(r)) {
      const c = v.creative || {};
      const textos = (c.asset_feed_spec?.bodies || []).map((b) => b.text || "").filter(Boolean);
      out[id] = {
        titulo: c.title || c.asset_feed_spec?.titles?.[0]?.text || undefined, texto: c.body || textos[0] || undefined, textos: textos.length > 1 ? textos : undefined,
        miniatura: c.thumbnail_url, formato: c.object_type, video: Boolean(c.video_id), enlace_ig: c.instagram_permalink_url, cta: c.call_to_action_type,
      };
    }
  }
  return out;
}

// Publicaciones públicas de otras cuentas profesionales de Instagram (business discovery), para estudiar el sector.
export type CuentaAjena = { usuario: string; nombre?: string; seguidores?: number; publicaciones: { fecha: string; tipo: string; texto: string; enlace: string; likes: number | null; comentarios: number | null }[]; error?: string };
export async function competenciaMeta(usuarios: string[]): Promise<CuentaAjena[]> {
  const ig = await idInstagram();
  const out: CuentaAjena[] = [];
  for (const u of usuarios.slice(0, 15)) {
    try {
      type M = { caption?: string; like_count?: number; comments_count?: number; media_type?: string; media_product_type?: string; permalink?: string; timestamp?: string };
      const r = await graph<{ business_discovery?: { username: string; name?: string; followers_count?: number; media?: { data: M[] } } }>(ig, {
        fields: `business_discovery.username(${u}){username,name,followers_count,media.limit(30){caption,like_count,comments_count,media_type,media_product_type,permalink,timestamp}}`,
      });
      const b = r.business_discovery;
      if (!b) { out.push({ usuario: u, publicaciones: [], error: "sin datos" }); continue; }
      out.push({
        usuario: b.username, nombre: b.name, seguidores: b.followers_count,
        publicaciones: (b.media?.data || []).map((m) => ({ fecha: m.timestamp || "", tipo: m.media_product_type === "REELS" ? "Reel" : m.media_type || "", texto: (m.caption || "").slice(0, 600), enlace: m.permalink || "", likes: m.like_count ?? null, comentarios: m.comments_count ?? null })),
      });
    } catch (e) { out.push({ usuario: u, publicaciones: [], error: e instanceof Error ? e.message : String(e) }); }
  }
  return out;
}

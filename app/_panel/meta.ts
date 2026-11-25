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
  let url: string | null = `act_${cuenta()}/insights`;
  let params: Record<string, string> = {
    level: "ad", time_increment: "1", limit: "500",
    fields: "date_start,campaign_name,adset_name,ad_name,ad_id,spend,impressions,reach,clicks,actions",
    time_range: JSON.stringify({ since: desde, until: hasta }),
  };
  for (let i = 0; url && i < 30; i++) {
    const r: { data: (Record<string, string> & { actions?: Accion[] })[]; paging?: { next?: string } } = await graph(url, params);
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
    url = r.paging?.next || null;
    params = {};
  }
  return filas;
}

// Cuenta de Instagram ligada al token (por las páginas a las que tiene acceso) o la de META_IG_ID.
async function idInstagram(): Promise<string> {
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

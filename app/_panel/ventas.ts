// Ventas desde Hotmart y Stripe. Cada fuente se activa sola si tiene sus claves en Vercel
// (se aceptan los nombres con o sin guiones bajos: HOTMART_CLIENT_ID o HOTMARTCLIENTID).

export type Venta = { id: string; fuente: "hotmart" | "stripe"; fecha: string; estado: string; importe: number; moneda: string; producto: string; email: string; nombre: string };

const env = (...nombres: string[]) => nombres.map((n) => process.env[n]).find((v) => v && v.trim())?.trim() || "";
const hotmart = () => ({
  id: env("HOTMART_CLIENT_ID", "HOTMARTCLIENTID"),
  secreto: env("HOTMART_CLIENT_SECRET", "HOTMARTCLIENTSECRET"),
  basic: env("HOTMART_BASIC", "HOTMARTBASIC").replace(/^Basic\s+/i, ""),
});
const stripeClave = () => env("STRIPE_SECRET_KEY", "STRIPESECRETKEY");

export const hotmartListo = () => { const h = hotmart(); return Boolean(h.id && h.secreto && h.basic); };
export const stripeListo = () => Boolean(stripeClave());

// ---------- Hotmart ----------
async function tokenHotmart(): Promise<string> {
  const h = hotmart();
  const url = new URL("https://api-sec-vlc.hotmart.com/security/oauth/token");
  url.searchParams.set("grant_type", "client_credentials");
  url.searchParams.set("client_id", h.id);
  url.searchParams.set("client_secret", h.secreto);
  const r = await fetch(url, { method: "POST", headers: { Authorization: `Basic ${h.basic}`, "Content-Type": "application/json" }, cache: "no-store" });
  if (!r.ok) throw new Error(`Hotmart no acepta las credenciales (${r.status}): ${(await r.text()).slice(0, 160)}`);
  const j = (await r.json()) as { access_token?: string };
  if (!j.access_token) throw new Error("Hotmart no devolvió token");
  return j.access_token;
}

type ItemHotmart = {
  product?: { id?: number; name?: string };
  buyer?: { name?: string; email?: string };
  purchase?: { transaction?: string; order_date?: number; approved_date?: number; status?: string; price?: { value?: number; currency_code?: string } };
};

export async function ventasHotmart(desdeMs: number): Promise<{ ventas: Venta[]; total: number }> {
  const token = await tokenHotmart();
  const ventas: Venta[] = [];
  let pagina: string | undefined;
  let total = 0;
  for (let i = 0; i < 40; i++) {
    const url = new URL("https://developers.hotmart.com/payments/api/v1/sales/history");
    url.searchParams.set("start_date", String(desdeMs));
    url.searchParams.set("end_date", String(Date.now()));
    url.searchParams.set("max_results", "500");
    if (pagina) url.searchParams.set("page_token", pagina);
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, cache: "no-store" });
    if (!r.ok) throw new Error(`Hotmart ventas respondió ${r.status}: ${(await r.text()).slice(0, 160)}`);
    const j = (await r.json()) as { items?: ItemHotmart[]; page_info?: { next_page_token?: string; total_results?: number } };
    total = j.page_info?.total_results ?? total;
    for (const it of j.items || []) {
      const p = it.purchase || {};
      const f = p.approved_date || p.order_date;
      if (!p.transaction || !f) continue;
      ventas.push({
        id: `hotmart:${p.transaction}`, fuente: "hotmart", fecha: new Date(f).toISOString(), estado: String(p.status || ""),
        importe: Number(p.price?.value) || 0, moneda: String(p.price?.currency_code || "EUR"), producto: String(it.product?.name || ""),
        email: String(it.buyer?.email || "").toLowerCase(), nombre: String(it.buyer?.name || ""),
      });
    }
    pagina = j.page_info?.next_page_token;
    if (!pagina) break;
  }
  return { ventas, total };
}

// ---------- Stripe ----------
type CargoStripe = { id: string; created: number; status: string; paid: boolean; refunded: boolean; amount: number; amount_refunded: number; currency: string; description?: string | null; receipt_email?: string | null; billing_details?: { email?: string | null; name?: string | null } };

export async function ventasStripe(desdeMs: number): Promise<{ ventas: Venta[]; total: number }> {
  const ventas: Venta[] = [];
  let despues: string | undefined;
  for (let i = 0; i < 40; i++) {
    const url = new URL("https://api.stripe.com/v1/charges");
    url.searchParams.set("limit", "100");
    url.searchParams.set("created[gte]", String(Math.floor(desdeMs / 1000)));
    if (despues) url.searchParams.set("starting_after", despues);
    const r = await fetch(url, { headers: { Authorization: `Bearer ${stripeClave()}` }, cache: "no-store" });
    if (!r.ok) throw new Error(`Stripe respondió ${r.status}: ${(await r.text()).slice(0, 160)}`);
    const j = (await r.json()) as { data: CargoStripe[]; has_more: boolean };
    for (const c of j.data) {
      if (!c.paid || c.status !== "succeeded") continue;
      const neto = (c.amount - (c.amount_refunded || 0)) / 100;
      if (neto <= 0) continue;
      ventas.push({
        id: `stripe:${c.id}`, fuente: "stripe", fecha: new Date(c.created * 1000).toISOString(), estado: c.refunded ? "REFUNDED" : "PAID",
        importe: neto, moneda: c.currency.toUpperCase(), producto: String(c.description || ""),
        email: String(c.billing_details?.email || c.receipt_email || "").toLowerCase(), nombre: String(c.billing_details?.name || ""),
      });
    }
    if (!j.has_more || !j.data.length) break;
    despues = j.data[j.data.length - 1].id;
  }
  return { ventas, total: ventas.length };
}

// Estados de Hotmart que cuentan como venta cobrada.
export const ESTADOS_COBRADOS = new Set(["APPROVED", "COMPLETE", "PAID"]);

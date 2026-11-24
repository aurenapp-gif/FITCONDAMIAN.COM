import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, sesionValida } from "./app/_panel/auth";

// Protege el panel privado (/panel-fcd) y su API: sin sesión, al login.
// Todo lo del panel sale con cabeceras para que no se indexe ni se guarde en caché.
export const config = { matcher: ["/panel-fcd", "/panel-fcd/:path*", "/api/panel/:path*"] };

const LIBRES = new Set(["/panel-fcd/entrar", "/api/panel/login", "/api/panel/sync", "/api/panel/cron", "/api/panel/diag"]);

export async function middleware(req: NextRequest) {
  const ruta = req.nextUrl.pathname;
  let res: NextResponse;
  if (!LIBRES.has(ruta) && !(await sesionValida(req.cookies.get(COOKIE)?.value))) {
    if (ruta.startsWith("/api/")) {
      res = NextResponse.json({ error: "No autorizado" }, { status: 401 });
    } else {
      const url = req.nextUrl.clone();
      url.pathname = "/panel-fcd/entrar";
      url.search = "";
      res = NextResponse.redirect(url);
    }
  } else {
    res = NextResponse.next();
  }
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
  res.headers.set("Cache-Control", "private, no-store");
  res.headers.set("Referrer-Policy", "no-referrer");
  return res;
}

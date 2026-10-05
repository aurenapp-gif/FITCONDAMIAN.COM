import type { Metadata } from "next";
import Link from "next/link";
import { GUIAS } from "../_data/guias";
import "../_styles/er.css";

export const metadata: Metadata = {
  title: "Guías gratuitas · Envejecimiento Revertido",
  description: "5 guías prácticas para mujeres en perimenopausia y menopausia: sueño, antojos, hinchazón, rodillas y fines de semana.",
};

export default function GuiasPage() {
  return (
    <main className="er-page">
      <div className="er-band">Para mujeres en perimenopausia y menopausia</div>
      <header className="er-logo">
        <p aria-label="Envejecimiento Revertido"><span className="t">envejecimiento</span><span className="b">revertido<i>.</i></span></p>
      </header>

      <div className="er-wrap" style={{ paddingTop: "30px", paddingBottom: "64px" }}>
        <p className="er-eb">5 guías gratuitas</p>
        <h1 className="er-h gu-h">Pequeños problemas, <span className="er-pill">soluciones de hoy</span></h1>
        <p className="er-sub gu-sub">Elige la que más te preocupa ahora mismo y empieza en 10 minutos.</p>
        <div className="gu-more" style={{ marginTop: "28px" }}>
          {GUIAS.map((g) => (
            <Link key={g.slug} href={`/guias/${g.slug}`} className="gu-link">
              <span className="n">{g.n}</span>
              <span><b>{g.titulo}</b><small>{g.sub}</small></span>
            </Link>
          ))}
        </div>
      </div>

      <footer className="er-footer">
        © {new Date().getFullYear()} Fit con Damián · fitcondamian.com{" · "}
        <a href="/privacidad">Privacidad</a>{" · "}
        <a href="/politica-cookies">Cookies</a>{" · "}
        <a href="/aviso-legal">Aviso Legal</a>
      </footer>
    </main>
  );
}

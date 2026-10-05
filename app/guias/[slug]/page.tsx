import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIAS, guiaPorSlug } from "../../_data/guias";
import { CALENDARIO } from "../../_data/recursos";
import Checklist from "../Checklist";
import "../../_styles/er.css";

export function generateStaticParams() {
  return GUIAS.map((g) => ({ slug: g.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const g = guiaPorSlug(params.slug);
  if (!g) return {};
  return { title: `${g.titulo} · Guía gratuita`, description: g.sub };
}

export default function GuiaPage({ params }: { params: { slug: string } }) {
  const g = guiaPorSlug(params.slug);
  if (!g) notFound();
  const otras = GUIAS.filter((x) => x.slug !== g.slug);

  return (
    <main className="er-page">
      <div className="er-band">Para mujeres en perimenopausia y menopausia</div>
      <header className="er-logo">
        <p aria-label="Envejecimiento Revertido"><span className="t">envejecimiento</span><span className="b">revertido<i>.</i></span></p>
      </header>

      <div className="er-wrap gu" style={{ paddingTop: "26px", paddingBottom: "64px" }}>

        {/* PORTADA */}
        <p className="er-eb">Guía gratuita {g.n} · {g.tag}</p>
        <h1 className="er-h gu-h"><span className="er-pill">{g.titulo}</span></h1>
        <p className="er-sub gu-sub">{g.sub}</p>

        <div className="gu-dolor">
          <p className="k">¿Te pasa esto?</p>
          <p>{g.dolor}</p>
        </div>

        {/* POR QUÉ */}
        <section className="gu-sec">
          <h2 className="gu-h2">Por qué te pasa</h2>
          <ul className="gu-why">
            {g.porque.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </section>

        {/* HAZLO HOY */}
        <section className="gu-sec">
          <div className="gu-hoy">
            <p className="gu-tag">Hazlo hoy</p>
            <h2 className="gu-h2">Empieza en los próximos 10 minutos</h2>
            <ol>
              {g.hoy.map((x) => (
                <li key={x.t}><b>{x.t}</b><span>{x.d}</span></li>
              ))}
            </ol>
          </div>
        </section>

        {/* EXTRA */}
        {g.extra && (
          <section className="gu-sec">
            <h2 className="gu-h2">{g.extraTitulo}</h2>
            <div className="gu-cards">
              {g.extra.map((x) => (
                <div key={x.t} className="gu-card"><b>{x.t}</b><span>{x.d}</span></div>
              ))}
            </div>
          </section>
        )}

        {/* PLAN */}
        <section className="gu-sec">
          <h2 className="gu-h2">{g.planTitulo}</h2>
          <div className="gu-plan">
            {g.plan.map((p) => (
              <div key={p.k} className="gu-step">
                <span className="kk">{p.k}</span>
                <div><b>{p.t}</b><span>{p.d}</span></div>
              </div>
            ))}
          </div>
        </section>

        {/* CHECKLIST */}
        <section className="gu-sec">
          <h2 className="gu-h2">Tu checklist</h2>
          <p className="gu-note">Márcalo cada día. Se guarda en este móvil.</p>
          <Checklist id={g.slug} items={g.check} />
        </section>

        {g.medico && (
          <section className="gu-sec">
            <div className="gu-med"><p className="k">Importante</p><p>{g.medico}</p></div>
          </section>
        )}

        {/* LLAMADA */}
        <div className="er-box" style={{ marginTop: "40px" }}>
          <p className="er-eb" style={{ marginBottom: "8px" }}>¿Quieres ir más rápido?</p>
          <h2>Lo adaptamos a tu caso en una llamada gratuita</h2>
          <p>30 minutos. Te digo exactamente qué tienes que hacer según tu situación.</p>
          <a className="er-btn" href={CALENDARIO}>📞 Agenda tu llamada gratis</a>
          <p className="er-fine">Sin compromiso · 100% gratuito</p>
        </div>

        {/* OTRAS GUÍAS */}
        <section className="gu-sec" style={{ marginTop: "48px" }}>
          <h2 className="gu-h2" style={{ textAlign: "center" }}>Más guías gratuitas</h2>
          <div className="gu-more">
            {otras.map((o) => (
              <Link key={o.slug} href={`/guias/${o.slug}`} className="gu-link">
                <span className="n">{o.n}</span>
                <span><b>{o.titulo}</b><small>{o.sub}</small></span>
              </Link>
            ))}
          </div>
        </section>
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

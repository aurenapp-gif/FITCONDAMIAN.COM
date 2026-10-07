"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import Cover from "../_components/Cover";
import { RECURSOS, CALENDARIO_EMBED, VSL_SRC, youtubeId } from "../_data/recursos";
import "../_styles/er.css";

export default function AccesoRecursosClient() {
  const [videoAbierto, setVideoAbierto] = useState<string | null>(null);

  // Cerrar el reproductor con Escape.
  useEffect(() => {
    if (!videoAbierto) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setVideoAbierto(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [videoAbierto]);

  return (
    <main className="er-page">

      {/* REPRODUCTOR DE LOS VÍDEOS DE CADA RECURSO */}
      {videoAbierto && (
        <div className="er-modal" role="dialog" aria-modal="true" aria-label="Vídeo del recurso"
          onClick={(e) => { if (e.target === e.currentTarget) setVideoAbierto(null); }}>
          <div className="box">
            <button type="button" className="x" onClick={() => setVideoAbierto(null)} aria-label="Cerrar vídeo">✕</button>
            <div className="er-frame">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoAbierto}?autoplay=1&rel=0`}
                title="Vídeo del recurso"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      <header className="er-logo">
        <p aria-label="Envejecimiento Revertido"><span className="t">envejecimiento</span><span className="b">revertido<i>.</i></span></p>
      </header>

      <div className="er-wrap" style={{ paddingTop: "18px", paddingBottom: "64px" }}>

        {/* 1 — VSL: lo primero */}
        <div className="er-must"><span className="dot" aria-hidden="true" />Importante ver</div>
        <h1 className="er-h er-acc-h er-acc-long">Cómo volver a sentirte <span className="er-nw"><span className="er-pill">atractiva</span>,</span> ponerte de nuevo esa <span className="er-u">ropa que tanto te gustaba<svg viewBox="0 0 120 10" preserveAspectRatio="none" fill="none" aria-hidden="true"><path d="M2 6 C 30 2, 90 2, 118 6" stroke="#35C2FF" strokeWidth={3.5} strokeLinecap="round" /></svg></span> y dejar de estar <span className="er-u">cansada todo el día<svg viewBox="0 0 120 10" preserveAspectRatio="none" fill="none" aria-hidden="true"><path d="M2 6 C 30 2, 90 2, 118 6" stroke="#35C2FF" strokeWidth={3.5} strokeLinecap="round" /></svg></span>, con una metodología adaptada a los cambios hormonales de tu cuerpo</h1>
        <div className="er-frame er-frame-must">
          <iframe src={VSL_SRC} title="Vídeo Envejecimiento Revertido" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen />
        </div>

        {/* 2 — AGENDAR LLAMADA */}
        <p className="er-under">
          Si al verlo te sientes identificada, reserva un hueco para hablar conmigo personalmente.
        </p>
        <div className="er-cta-wrap">
          <a className="er-btn" href="#agendar">📞 Agenda tu llamada gratis</a>
          <p className="er-fine">30 minutos · 100% gratuito · sin compromiso</p>
        </div>

        {/* PASO 2 — RECURSOS */}
        <div className="er-step er-step-rec"><span className="er-ok">✓ Acceso desbloqueado</span>Tus 10 recursos</div>
        <div className="er-list">
          {RECURSOS.map((r) => {
            const yt = youtubeId(r.linkVideo);
            return (
              <article key={r.id} className="er-item acc">
                <Cover r={r} />
                <div>
                  <h2 className="nm">{r.name}</h2>
                  <p className="hk">{r.hook}</p>
                </div>
                <div className="er-acts">
                  {yt && (
                    <button type="button" className="er-act" onClick={() => setVideoAbierto(yt)}>▶ Ver vídeo</button>
                  )}
                  <a className={`er-act${yt ? " ghost" : ""}`} href={r.linkDoc} target="_blank" rel="noopener noreferrer">
                    {r.docLabel ?? "Abrir documento"} ↗
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        {/* CALENDARIO INCRUSTADO — los botones "Agenda tu llamada" bajan hasta aquí */}
        <section id="agendar" className="er-agendar">
          <div className="er-sh">
            <p className="k">¿Quieres ir más rápido?</p>
            <h2>Agenda tu llamada <span className="er-pill">gratuita</span></h2>
            <p className="er-fine" style={{ marginTop: "10px" }}>30 minutos · 100% gratuito · sin compromiso</p>
          </div>
          <div className="er-cal">
            <iframe src={CALENDARIO_EMBED} id="ZW1BMfIE9nqeZvmsoNRy_acceso" title="Reserva tu llamada con Damián" scrolling="no" />
          </div>
          <Script src="https://links.fitcondamian.com/js/form_embed.js" strategy="afterInteractive" />
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

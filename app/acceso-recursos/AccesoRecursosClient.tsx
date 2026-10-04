"use client";

import { useEffect, useState } from "react";
import Cover from "../_components/Cover";
import { RECURSOS, CALENDARIO, VSL_SRC, youtubeId } from "../_data/recursos";
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
        <h1 className="er-h er-acc-h">Antes de abrir tus recursos, <span className="er-pill">mira este vídeo</span></h1>
        <div className="er-frame er-frame-must">
          <iframe src={VSL_SRC} title="Vídeo Envejecimiento Revertido" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen />
        </div>

        {/* 2 — AGENDAR LLAMADA */}
        <p className="er-under">
          Si al verlo te sientes identificada, reserva un hueco para hablar conmigo personalmente.
        </p>
        <div className="er-cta-wrap">
          <a className="er-btn" href={CALENDARIO}>📞 Agenda tu llamada gratis</a>
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

        {/* LLAMADA */}
        <div className="er-box" style={{ marginTop: "40px" }}>
          <p className="er-eb" style={{ marginBottom: "8px" }}>¿Quieres ir más rápido?</p>
          <h2>Agenda una llamada gratuita conmigo</h2>
          <p>30 minutos. Te digo exactamente qué tienes que hacer según tu caso.</p>
          <a className="er-btn" href={CALENDARIO}>📞 Agenda tu llamada gratis</a>
          <p className="er-fine">Sin compromiso · 100% gratuito</p>
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

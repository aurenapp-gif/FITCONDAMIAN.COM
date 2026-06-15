"use client";

import { useState, useRef } from "react";

// 👉 Actualiza nombres, emojis, linkVideo y linkDoc cuando tengas los recursos reales
const recursos = [
  { vol: "01", nombre: "Diagnóstico Corporal",         emoji: "📋", categoria: "DIAGNÓSTICO",   linkVideo: "#", linkDoc: "#" },
  { vol: "02", nombre: "Guía de Nutrición",             emoji: "🥗", categoria: "NUTRICIÓN",     linkVideo: "#", linkDoc: "#" },
  { vol: "03", nombre: "Rutina Express",                emoji: "💪", categoria: "ENTRENAMIENTO", linkVideo: "#", linkDoc: "#" },
  { vol: "04", nombre: "Protocolo de Recuperación",     emoji: "😴", categoria: "RECUPERACIÓN",  linkVideo: "#", linkDoc: "#" },
  { vol: "05", nombre: "Plan Primera Semana",           emoji: "📅", categoria: "PLANIFICACIÓN", linkVideo: "#", linkDoc: "#" },
];

const CARD_W = 220;
const CARD_H = 300;
const GAP    = 60;

function getStyle(offset: number): React.CSSProperties {
  const abs   = Math.abs(offset);
  const sign  = offset < 0 ? -1 : 1;
  const visible = abs <= 2;
  return {
    position:  "absolute",
    width:     CARD_W,
    height:    CARD_H,
    top:       "50%",
    left:      "50%",
    transform: `
      translate(-50%, -50%)
      translateX(${offset * (CARD_W + GAP) * 0.72}px)
      rotateY(${sign * Math.min(abs * 42, 70)}deg)
      scale(${1 - abs * 0.13})
    `,
    transformStyle: "preserve-3d",
    zIndex:    visible ? 10 - abs : 0,
    opacity:   visible ? 1 - abs * 0.25 : 0,
    transition: "all 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    cursor:    offset === 0 ? "default" : "pointer",
    pointerEvents: abs > 2 ? "none" : "auto",
  };
}

export default function AccesoClient() {
  const [active, setActive]   = useState(0);
  const dragStart             = useRef<number | null>(null);
  const dragged               = useRef(false);

  const prev = () => setActive(i => Math.max(i - 1, 0));
  const next = () => setActive(i => Math.min(i + 1, recursos.length - 1));

  /* drag / swipe */
  const onPointerDown = (e: React.PointerEvent) => {
    dragStart.current = e.clientX;
    dragged.current   = false;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragStart.current === null) return;
    if (Math.abs(e.clientX - dragStart.current) > 8) dragged.current = true;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (dragStart.current === null) return;
    const dx = e.clientX - dragStart.current;
    if (dragged.current) {
      if (dx < -40) next();
      if (dx >  40) prev();
    }
    dragStart.current = null;
    dragged.current   = false;
  };

  const current = recursos[active];

  return (
    <main style={{ background: "#0D0D0D", minHeight: "100vh", color: "#fff", fontFamily: "var(--font-inter), sans-serif", overflowX: "hidden" }}>

      {/* HEADER */}
      <header style={{ borderBottom: "1px solid #1f1f1f", padding: "20px 24px", textAlign: "center" }}>
        <p style={{ margin: 0, fontWeight: 900, fontSize: "18px", letterSpacing: "-0.5px" }}>
          Fit con <span style={{ color: "#FF5C00" }}>Damián</span>
        </p>
      </header>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 24px" }}>

        {/* HERO */}
        <section style={{ paddingTop: "48px", paddingBottom: "40px", textAlign: "center" }}>
          <p style={{ color: "#666", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 16px 0" }}>
            RECURSOS GRATUITOS · ACCESO COMPLETO
          </p>
          <h1 style={{ fontSize: "clamp(2rem, 7vw, 3rem)", fontWeight: 900, lineHeight: 1.05, margin: "0 0 16px 0", letterSpacing: "-1.5px" }}>
            Bienvenido a los{" "}
            <em style={{ fontStyle: "italic", color: "#FF5C00" }}>recursos.</em>
          </h1>
          <p style={{ color: "#888", fontSize: "16px", lineHeight: 1.6, margin: "0 0 32px 0" }}>
            Todo el material que necesitas. Guárdalo antes de cerrar esta página.
          </p>

          {/* VIDEO — 👉 reemplaza con tu iframe de YouTube/Vimeo */}
          <div style={{
            borderRadius: "16px", overflow: "hidden", background: "#161616",
            aspectRatio: "16/9", display: "flex", alignItems: "center",
            justifyContent: "center", border: "1px solid #252525",
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: "72px", height: "72px", background: "#FF5C00",
                borderRadius: "50%", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "24px", paddingLeft: "6px",
                margin: "0 auto 12px", boxShadow: "0 0 0 14px rgba(255,92,0,0.12)",
              }}>▶</div>
              <p style={{ color: "#555", fontSize: "13px", margin: 0 }}>Vídeo de bienvenida — próximamente</p>
            </div>
          </div>
        </section>

        {/* FLECHA ABAJO */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <p style={{ color: "#FF5C00", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 10px 0" }}>
            ACCEDE A LOS RECURSOS
          </p>
          <div style={{ animation: "bounce 1.8s infinite" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF5C00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </div>
          <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }`}</style>
        </div>

        {/* COVERFLOW */}
        <section style={{ paddingBottom: "80px" }}>

          {/* Stage */}
          <div
            style={{
              perspective: "900px",
              perspectiveOrigin: "50% 50%",
              height: CARD_H + 40,
              position: "relative",
              userSelect: "none",
              touchAction: "pan-y",
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            {recursos.map((r, i) => {
              const offset = i - active;
              const isCenter = offset === 0;
              return (
                <div
                  key={r.vol}
                  style={getStyle(offset)}
                  onClick={() => { if (!dragged.current && !isCenter) setActive(i); }}
                >
                  {/* Card face */}
                  <div style={{
                    width: "100%", height: "100%", borderRadius: "20px",
                    background: isCenter
                      ? "linear-gradient(145deg, #1a1a1a 0%, #111 100%)"
                      : "#111",
                    border: isCenter ? "1.5px solid #FF5C00" : "1px solid #222",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    padding: "24px",
                    boxShadow: isCenter
                      ? "0 24px 60px rgba(255,92,0,0.18), 0 0 0 0 transparent"
                      : "0 8px 24px rgba(0,0,0,0.5)",
                    position: "relative", overflow: "hidden",
                  }}>
                    {/* Vol badge */}
                    <span style={{
                      position: "absolute", top: "16px", left: "16px",
                      background: isCenter ? "#FF5C00" : "#1f1f1f",
                      color: "#fff", fontSize: "10px", fontWeight: 900,
                      padding: "4px 10px", borderRadius: "99px", letterSpacing: "1px",
                    }}>
                      VOL · {r.vol}
                    </span>

                    {/* Emoji */}
                    <div style={{ fontSize: "56px", marginBottom: "16px", lineHeight: 1 }}>{r.emoji}</div>

                    {/* Categoria */}
                    <p style={{
                      color: isCenter ? "#FF5C00" : "#444",
                      fontSize: "10px", fontWeight: 700, letterSpacing: "2px",
                      textTransform: "uppercase", margin: "0 0 8px 0",
                    }}>
                      {r.categoria}
                    </p>

                    {/* Nombre */}
                    <h3 style={{
                      fontSize: "16px", fontWeight: 900, textAlign: "center",
                      margin: 0, lineHeight: 1.2, letterSpacing: "-0.3px",
                      color: isCenter ? "#fff" : "#888",
                    }}>
                      {r.nombre}
                    </h3>

                    {/* Glow isCenter */}
                    {isCenter && (
                      <div style={{
                        position: "absolute", bottom: "-40px", left: "50%",
                        transform: "translateX(-50%)",
                        width: "120px", height: "80px",
                        background: "radial-gradient(ellipse, rgba(255,92,0,0.3) 0%, transparent 70%)",
                        pointerEvents: "none",
                      }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "8px", marginBottom: "32px" }}>
            {recursos.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                style={{
                  width: i === active ? "24px" : "8px",
                  height: "8px",
                  borderRadius: "99px",
                  background: i === active ? "#FF5C00" : "#333",
                  border: "none", cursor: "pointer", padding: 0,
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>

          {/* Flecha nav */}
          <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginBottom: "40px" }}>
            <button
              onClick={prev}
              disabled={active === 0}
              style={{
                width: "48px", height: "48px", borderRadius: "50%",
                background: active === 0 ? "#1a1a1a" : "#222",
                border: "1px solid #2a2a2a", color: active === 0 ? "#444" : "#fff",
                fontSize: "20px", cursor: active === 0 ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }}
            >←</button>
            <button
              onClick={next}
              disabled={active === recursos.length - 1}
              style={{
                width: "48px", height: "48px", borderRadius: "50%",
                background: active === recursos.length - 1 ? "#1a1a1a" : "#FF5C00",
                border: "none", color: "#fff", fontSize: "20px",
                cursor: active === recursos.length - 1 ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: active === recursos.length - 1 ? 0.3 : 1,
                transition: "all 0.2s",
              }}
            >→</button>
          </div>

          {/* Panel del recurso activo */}
          <div style={{
            background: "#111", border: "1px solid #1f1f1f", borderRadius: "20px",
            padding: "28px", transition: "all 0.35s ease",
          }}>
            <p style={{ color: "#555", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 8px 0" }}>
              VOLUMEN {current.vol} · {current.categoria}
            </p>
            <h2 style={{ fontSize: "22px", fontWeight: 900, margin: "0 0 12px 0", letterSpacing: "-0.5px" }}>
              {current.nombre}
            </h2>
            <p style={{ color: "#888", fontSize: "14px", lineHeight: 1.6, margin: "0 0 20px 0" }}>
              Accede al vídeo explicativo y al documento completo con todo el material.
            </p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <a href={current.linkVideo} target="_blank" rel="noopener noreferrer" style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "#FF5C00", color: "#fff", fontWeight: 700,
                fontSize: "14px", padding: "12px 22px", borderRadius: "99px",
                textDecoration: "none",
              }}>▶ Ver el vídeo</a>
              <a href={current.linkDoc} target="_blank" rel="noopener noreferrer" style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "transparent", color: "#fff", fontWeight: 700,
                fontSize: "14px", padding: "12px 22px", borderRadius: "99px",
                textDecoration: "none", border: "1px solid #333",
              }}>Abrir documento ↗</a>
            </div>
          </div>

          {/* CTA llamada */}
          <div style={{
            background: "#FF5C00", borderRadius: "20px", padding: "36px 28px",
            textAlign: "center", marginTop: "24px",
          }}>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 10px 0", opacity: 0.8 }}>
              ¿QUIERES IR MÁS RÁPIDO?
            </p>
            <h2 style={{ fontSize: "clamp(1.3rem, 4vw, 1.8rem)", fontWeight: 900, margin: "0 0 10px 0", letterSpacing: "-0.5px", lineHeight: 1.15 }}>
              Agenda una llamada gratuita conmigo
            </h2>
            <p style={{ fontSize: "14px", margin: "0 0 22px 0", opacity: 0.85, lineHeight: 1.5 }}>
              30 minutos. Te digo exactamente qué hacer según tu caso.
            </p>
            <a href="/agendar" style={{
              display: "inline-block", background: "#0D0D0D", color: "#fff",
              fontWeight: 900, fontSize: "15px", padding: "14px 32px",
              borderRadius: "99px", textDecoration: "none",
            }}>
              Agendar llamada gratuita →
            </a>
            <p style={{ fontSize: "12px", margin: "10px 0 0 0", opacity: 0.65 }}>Sin compromiso · 100% gratuito</p>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #1f1f1f", padding: "28px 24px", textAlign: "center" }}>
        <p style={{ color: "#444", fontSize: "12px", margin: 0 }}>
          © {new Date().getFullYear()} Fit con Damián · fitcondamian.com{" · "}
          <a href="/privacidad" style={{ color: "#444", textDecoration: "none" }}>Privacidad</a>{" · "}
          <a href="/aviso-legal" style={{ color: "#444", textDecoration: "none" }}>Aviso Legal</a>
        </p>
      </footer>
    </main>
  );
}

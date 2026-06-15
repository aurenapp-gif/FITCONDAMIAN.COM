"use client";

import { useState, useRef, useEffect } from "react";
import ModalForm from "./ModalForm";

const recursos = [
  { vol: "01", nombre: "Diagnóstico Corporal",       emoji: "📋", categoria: "DIAGNÓSTICO"   },
  { vol: "02", nombre: "Guía de Nutrición",           emoji: "🥗", categoria: "NUTRICIÓN"     },
  { vol: "03", nombre: "Rutina Express",              emoji: "💪", categoria: "ENTRENAMIENTO" },
  { vol: "04", nombre: "Protocolo de Recuperación",   emoji: "😴", categoria: "RECUPERACIÓN"  },
  { vol: "05", nombre: "Plan Primera Semana",         emoji: "📅", categoria: "PLANIFICACIÓN" },
];

const stats = [
  { value: 500, suffix: "+", label: "personas transformadas" },
  { value: 3,   suffix: "+", label: "años de experiencia"    },
  { value: 30,  suffix: "",  label: "minutos de llamada gratis" },
  { value: 100, suffix: "%", label: "método basado en ciencia" },
];

const CARD_W = 220;
const CARD_H = 300;
const GAP    = 60;

function getStyle(offset: number): React.CSSProperties {
  const abs    = Math.abs(offset);
  const sign   = offset < 0 ? -1 : 1;
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
    cursor:    "pointer",
    pointerEvents: abs > 2 ? "none" : "auto",
  };
}

// — Partículas canvas —
function ParticlesCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.3,
      dx: (Math.random() - 0.5) * 0.35,
      dy: (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.45 + 0.08,
      blue: Math.random() > 0.65,
    }));
    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.blue ? "#00AAFF" : "#ffffff";
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}

// — Contador animado —
function Counter({ target, suffix, start }: { target: number; suffix: string; start: boolean }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const duration = 1800;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(ease * target));
      if (p < 1) requestAnimationFrame(step);
      else setVal(target);
    };
    requestAnimationFrame(step);
  }, [start, target]);
  return <>{val}{suffix}</>;
}

// — Scroll reveal hook —
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

export default function RecursosClient() {
  const [active, setActive]       = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const dragStart                 = useRef<number | null>(null);
  const dragged                   = useRef(false);

  const statsReveal    = useReveal(0.2);
  const carouselReveal = useReveal(0.1);

  const prev = () => setActive(i => Math.max(i - 1, 0));
  const next = () => setActive(i => Math.min(i + 1, recursos.length - 1));

  const onPointerDown = (e: React.PointerEvent) => {
    dragStart.current = e.clientX; dragged.current = false;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragStart.current === null) return;
    if (Math.abs(e.clientX - dragStart.current) > 8) dragged.current = true;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (dragStart.current === null) return;
    const dx = e.clientX - dragStart.current;
    if (dragged.current) { if (dx < -40) next(); if (dx > 40) prev(); }
    dragStart.current = null; dragged.current = false;
  };
  const handleCardClick = (offset: number, index: number) => {
    if (dragged.current) return;
    if (offset !== 0) setActive(index); else setModalOpen(true);
  };

  return (
    <main style={{ background: "#0D0D0D", minHeight: "100vh", color: "#fff", fontFamily: "var(--font-inter), sans-serif", overflowX: "hidden" }}>

      {modalOpen && <ModalForm onClose={() => setModalOpen(false)} />}

      {/* HEADER */}
      <header style={{ borderBottom: "1px solid #1f1f1f", padding: "20px 24px", textAlign: "center", position: "relative", zIndex: 10 }}>
        <p style={{ margin: 0, fontWeight: 900, fontSize: "18px", letterSpacing: "-0.5px" }}>
          Fit con <span style={{ color: "#00AAFF" }}>Damián</span>
        </p>
      </header>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 24px" }}>

        {/* HERO con partículas */}
        <section style={{ paddingTop: "48px", paddingBottom: "40px", textAlign: "center", position: "relative" }}>
          {/* Canvas partículas detrás del hero */}
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: "24px", pointerEvents: "none" }}>
            <ParticlesCanvas />
          </div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ color: "#666", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 14px 0" }}>
              ACCESO GRATUITO
            </p>
            <h1 style={{ fontSize: "clamp(2.2rem, 8vw, 3.4rem)", fontWeight: 900, lineHeight: 1.05, margin: "0 0 14px 0", letterSpacing: "-1.5px" }}>
              Accede gratis a los recursos que han transformado{" "}
              <em style={{ fontStyle: "italic", color: "#00AAFF" }}>cientos de cuerpos.</em>
            </h1>
            <p style={{ color: "#888", fontSize: "16px", lineHeight: 1.6, margin: "0 0 32px 0", fontStyle: "italic" }}>
              sin dietas imposibles ni horas en el gimnasio.
            </p>

            <button
              onClick={() => setModalOpen(true)}
              style={{
                display: "inline-flex", alignItems: "center", gap: "10px",
                background: "#00AAFF", color: "#fff", fontWeight: 900,
                fontSize: "17px", padding: "16px 36px", borderRadius: "99px",
                border: "none", cursor: "pointer", letterSpacing: "-0.3px",
                marginBottom: "14px",
              }}
            >
              Quiero acceder gratis →
            </button>
            <p style={{ color: "#555", fontSize: "13px", margin: "0 0 36px 0" }}>
              Material gratuito · Acceso en menos de 2 minutos
            </p>

            <div style={{
              borderRadius: "16px", overflow: "hidden", background: "#161616",
              aspectRatio: "16/9", display: "flex", alignItems: "center",
              justifyContent: "center", border: "1px solid #252525",
            }}>
              <div style={{ textAlign: "center" }}>
                <div
                  onClick={() => setModalOpen(true)}
                  style={{
                    width: "72px", height: "72px", background: "#00AAFF",
                    borderRadius: "50%", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "24px", paddingLeft: "6px",
                    margin: "0 auto 12px", cursor: "pointer",
                    boxShadow: "0 0 0 14px rgba(0,170,255,0.12)",
                  }}
                >▶</div>
                <p style={{ color: "#555", fontSize: "13px", margin: 0 }}>Vídeo de presentación — próximamente</p>
              </div>
            </div>
          </div>
        </section>

        {/* CONTADORES con scroll reveal */}
        <div
          ref={statsReveal.ref}
          style={{
            display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px",
            marginBottom: "48px",
            opacity: statsReveal.visible ? 1 : 0,
            transform: statsReveal.visible ? "translateY(0)" : "translateY(40px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          {stats.map((s, i) => (
            <div
              key={i}
              style={{
                background: "#111", border: "1px solid #1f1f1f",
                borderRadius: "16px", padding: "20px",
                textAlign: "center",
                opacity: statsReveal.visible ? 1 : 0,
                transform: statsReveal.visible ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`,
              }}
            >
              <p style={{ fontWeight: 900, fontSize: "clamp(1.8rem, 5vw, 2.4rem)", color: "#00AAFF", margin: "0 0 4px 0", letterSpacing: "-1px" }}>
                <Counter target={s.value} suffix={s.suffix} start={statsReveal.visible} />
              </p>
              <p style={{ color: "#888", fontSize: "12px", margin: 0, lineHeight: 1.4 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* FLECHA */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <p style={{ color: "#00AAFF", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 10px 0" }}>
            ESTO ES LO QUE TE LLEVAS
          </p>
          <div style={{ animation: "bounce 1.8s infinite" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00AAFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </div>
          <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }`}</style>
        </div>

        {/* COVERFLOW con scroll reveal */}
        <section
          ref={carouselReveal.ref}
          style={{
            paddingBottom: "80px",
            opacity: carouselReveal.visible ? 1 : 0,
            transform: carouselReveal.visible ? "translateY(0)" : "translateY(50px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}
        >
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
              const offset   = i - active;
              const isCenter = offset === 0;
              return (
                <div key={r.vol} style={getStyle(offset)} onClick={() => handleCardClick(offset, i)}>
                  <div style={{
                    width: "100%", height: "100%", borderRadius: "20px",
                    background: isCenter ? "linear-gradient(145deg, #1a1a1a 0%, #111 100%)" : "#111",
                    border: isCenter ? "1.5px solid #00AAFF" : "1px solid #222",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    padding: "24px", position: "relative", overflow: "hidden",
                    boxShadow: isCenter ? "0 24px 60px rgba(0,170,255,0.18)" : "0 8px 24px rgba(0,0,0,0.5)",
                  }}>
                    <span style={{
                      position: "absolute", top: "16px", left: "16px",
                      background: isCenter ? "#00AAFF" : "#1f1f1f",
                      color: "#fff", fontSize: "10px", fontWeight: 900,
                      padding: "4px 10px", borderRadius: "99px", letterSpacing: "1px",
                    }}>
                      VOL · {r.vol}
                    </span>
                    <div style={{ fontSize: "56px", marginBottom: "16px", lineHeight: 1 }}>{r.emoji}</div>
                    <p style={{
                      color: isCenter ? "#00AAFF" : "#444",
                      fontSize: "10px", fontWeight: 700, letterSpacing: "2px",
                      textTransform: "uppercase", margin: "0 0 8px 0",
                    }}>{r.categoria}</p>
                    <h3 style={{
                      fontSize: "16px", fontWeight: 900, textAlign: "center",
                      margin: 0, lineHeight: 1.2, color: isCenter ? "#fff" : "#888",
                    }}>{r.nombre}</h3>
                    {isCenter && (
                      <div style={{
                        position: "absolute", bottom: "16px",
                        background: "rgba(0,170,255,0.15)", border: "1px solid rgba(0,170,255,0.3)",
                        borderRadius: "99px", padding: "4px 12px",
                        fontSize: "11px", color: "#00AAFF", fontWeight: 700,
                      }}>
                        Toca para acceder →
                      </div>
                    )}
                    {isCenter && (
                      <div style={{
                        position: "absolute", bottom: "-40px", left: "50%",
                        transform: "translateX(-50%)", width: "120px", height: "80px",
                        background: "radial-gradient(ellipse, rgba(0,170,255,0.3) 0%, transparent 70%)",
                        pointerEvents: "none",
                      }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "8px", marginBottom: "24px" }}>
            {recursos.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} style={{
                width: i === active ? "24px" : "8px", height: "8px",
                borderRadius: "99px", background: i === active ? "#00AAFF" : "#333",
                border: "none", cursor: "pointer", padding: 0, transition: "all 0.3s ease",
              }} />
            ))}
          </div>

          {/* Flechas */}
          <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginBottom: "40px" }}>
            <button onClick={prev} disabled={active === 0} style={{
              width: "48px", height: "48px", borderRadius: "50%",
              background: "#1a1a1a", border: "1px solid #2a2a2a",
              color: active === 0 ? "#444" : "#fff", fontSize: "20px",
              cursor: active === 0 ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>←</button>
            <button onClick={next} disabled={active === recursos.length - 1} style={{
              width: "48px", height: "48px", borderRadius: "50%",
              background: active === recursos.length - 1 ? "#1a1a1a" : "#00AAFF",
              border: "none", color: "#fff", fontSize: "20px",
              cursor: active === recursos.length - 1 ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: active === recursos.length - 1 ? 0.3 : 1,
            }}>→</button>
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

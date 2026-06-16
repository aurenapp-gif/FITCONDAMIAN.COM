"use client";

import { useState, useRef, useEffect } from "react";
import ModalForm from "./ModalForm";

const recursos = [
  { vol: "01", nombre: "Diagnóstico Corporal",      emoji: "📋", categoria: "DIAGNÓSTICO",   desc: "Descubre en 3 minutos dónde estás y qué tienes que cambiar para ver resultados de verdad." },
  { vol: "02", nombre: "Guía de Nutrición",          emoji: "🥗", categoria: "NUTRICIÓN",     desc: "Come sin pasar hambre ni contar calorías. El sistema que aplico con todos mis clientes." },
  { vol: "03", nombre: "Rutina Express",             emoji: "💪", categoria: "ENTRENAMIENTO", desc: "30 minutos, 3 veces por semana. El programa exacto para transformar tu cuerpo sin vivir en el gym." },
  { vol: "04", nombre: "Protocolo de Recuperación",  emoji: "😴", categoria: "RECUPERACIÓN",  desc: "El factor que nadie te cuenta y que sabotea tus resultados. Lo cambia todo." },
  { vol: "05", nombre: "Plan Primera Semana",        emoji: "📅", categoria: "PLANIFICACIÓN", desc: "Tu hoja de ruta para los primeros 7 días. Paso a paso, sin improvisación." },
];

const stats = [
  { value: 500, suffix: "+", label: "personas transformadas"    },
  { value: 3,   suffix: "+", label: "años de experiencia"       },
  { value: 30,  suffix: "",  label: "minutos de llamada gratis" },
  { value: 100, suffix: "%", label: "método basado en ciencia"  },
];

const N = recursos.length;

// — Partículas —
function ParticlesCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
    resize(); window.addEventListener("resize", resize);
    const pts = Array.from({ length: 70 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      r: Math.random() * 1.8 + 0.3,
      dx: (Math.random() - 0.5) * 0.35, dy: (Math.random() - 0.5) * 0.35,
      a: Math.random() * 0.45 + 0.08, blue: Math.random() > 0.65,
    }));
    let id: number;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      for (const p of pts) {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0) p.x = c.width; if (p.x > c.width) p.x = 0;
        if (p.y < 0) p.y = c.height; if (p.y > c.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.blue ? "#00AAFF" : "#fff";
        ctx.globalAlpha = p.a; ctx.fill();
      }
      ctx.globalAlpha = 1; id = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

// — Contador —
function Counter({ target, suffix, start }: { target: number; suffix: string; start: boolean }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let t0: number | null = null;
    const step = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / 1800, 1);
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(step); else setVal(target);
    };
    requestAnimationFrame(step);
  }, [start, target]);
  return <>{val}{suffix}</>;
}

// — Scroll reveal —
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold }
    );
    obs.observe(el); return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// — Scroll horizontal bloqueado —
function HorizontalScroll({ onOpenModal }: { onOpenModal: () => void }) {
  const wrapperRef  = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [tx, setTx] = useState(0);
  const [vw, setVw] = useState(390);

  useEffect(() => {
    const update = () => setVw(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const el = wrapperRef.current; if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const p = Math.max(0, Math.min(1, scrolled / total));
      const slide = Math.round(p * (N - 1));
      setActive(slide);
      setTx(-p * (N - 1) * vw);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [vw]);

  return (
    // Wrapper alto que "consume" scroll vertical
    <div ref={wrapperRef} style={{ height: `${N * 100}vh` }}>
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", background: "#0D0D0D" }}>

        {/* Barra de progreso superior */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "#1a1a1a", zIndex: 20 }}>
          <div style={{ height: "100%", background: "#00AAFF", width: `${((active + 1) / N) * 100}%`, transition: "width 0.4s ease" }} />
        </div>

        {/* Contador de slide */}
        <div style={{ position: "absolute", top: "18px", right: "20px", zIndex: 20, color: "#444", fontSize: "12px", fontWeight: 700 }}>
          {active + 1} <span style={{ color: "#222" }}>/ {N}</span>
        </div>

        {/* Header */}
        <div style={{ position: "absolute", top: "10px", left: 0, right: 0, textAlign: "center", zIndex: 20 }}>
          <p style={{ margin: 0, fontWeight: 900, fontSize: "16px", letterSpacing: "-0.5px" }}>
            Fit con <span style={{ color: "#00AAFF" }}>Damián</span>
          </p>
        </div>

        {/* Tira horizontal */}
        <div style={{
          display: "flex",
          transform: `translateX(${tx}px)`,
          transition: "transform 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          willChange: "transform",
          height: "100%",
        }}>
          {recursos.map((r, i) => {
            const isActive = i === active;
            return (
              <div
                key={r.vol}
                style={{
                  width: vw, minWidth: vw, height: "100%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "80px 28px 40px",
                  flexShrink: 0,
                }}
              >
                <div style={{ maxWidth: "360px", width: "100%", textAlign: "center" }}>

                  {/* Emoji grande con glow */}
                  <div style={{
                    width: "120px", height: "120px",
                    background: isActive ? "rgba(0,170,255,0.08)" : "rgba(255,255,255,0.03)",
                    border: isActive ? "1.5px solid rgba(0,170,255,0.3)" : "1px solid #1f1f1f",
                    borderRadius: "32px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "64px", lineHeight: 1,
                    margin: "0 auto 28px",
                    boxShadow: isActive ? "0 0 60px rgba(0,170,255,0.15)" : "none",
                    transition: "all 0.5s ease",
                  }}>
                    {r.emoji}
                  </div>

                  {/* Badge */}
                  <span style={{
                    display: "inline-block",
                    background: "rgba(0,170,255,0.1)", border: "1px solid rgba(0,170,255,0.25)",
                    color: "#00AAFF", fontSize: "10px", fontWeight: 900,
                    padding: "4px 12px", borderRadius: "99px", letterSpacing: "2px",
                    marginBottom: "16px",
                  }}>
                    VOL · {r.vol} · {r.categoria}
                  </span>

                  {/* Título */}
                  <h2 style={{
                    fontSize: "clamp(1.6rem, 6vw, 2.2rem)", fontWeight: 900,
                    lineHeight: 1.1, letterSpacing: "-1px",
                    margin: "0 0 16px 0",
                    color: "#fff",
                  }}>
                    {r.nombre}
                  </h2>

                  {/* Descripción */}
                  <p style={{ color: "#888", fontSize: "15px", lineHeight: 1.6, margin: "0 0 32px 0" }}>
                    {r.desc}
                  </p>

                  {/* CTA */}
                  <button
                    onClick={onOpenModal}
                    style={{
                      background: "#00AAFF", color: "#fff",
                      fontWeight: 900, fontSize: "15px",
                      padding: "13px 28px", borderRadius: "99px",
                      border: "none", cursor: "pointer",
                    }}
                  >
                    Acceder gratis →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dots en la parte inferior */}
        <div style={{ position: "absolute", bottom: "32px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "8px", zIndex: 20 }}>
          {recursos.map((_, i) => (
            <div key={i} style={{
              width: i === active ? "24px" : "8px", height: "8px",
              borderRadius: "99px",
              background: i === active ? "#00AAFF" : "#2a2a2a",
              transition: "all 0.4s ease",
            }} />
          ))}
        </div>

        {/* Hint de scroll */}
        {active === 0 && (
          <div style={{ position: "absolute", bottom: "64px", left: "50%", transform: "translateX(-50%)", textAlign: "center", animation: "fadeHint 2s ease 1s both" }}>
            <p style={{ color: "#333", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", margin: 0 }}>↓ DESLIZA PARA VER MÁS</p>
            <style>{`
              @keyframes fadeHint { 0%{opacity:0} 20%{opacity:1} 80%{opacity:1} 100%{opacity:0} }
            `}</style>
          </div>
        )}

        {/* Gradientes laterales */}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "40px", background: "linear-gradient(90deg, #0D0D0D, transparent)", pointerEvents: "none", zIndex: 10 }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "40px", background: "linear-gradient(-90deg, #0D0D0D, transparent)", pointerEvents: "none", zIndex: 10 }} />
      </div>
    </div>
  );
}

export default function RecursosClient() {
  const [modalOpen, setModalOpen] = useState(false);
  const statsReveal = useReveal(0.2);

  return (
    <main style={{ background: "#0D0D0D", minHeight: "100vh", color: "#fff", fontFamily: "var(--font-inter), sans-serif", overflowX: "hidden" }}>
      {modalOpen && <ModalForm onClose={() => setModalOpen(false)} />}

      <header style={{ borderBottom: "1px solid #1f1f1f", padding: "20px 24px", textAlign: "center", position: "relative", zIndex: 10 }}>
        <p style={{ margin: 0, fontWeight: 900, fontSize: "18px", letterSpacing: "-0.5px" }}>
          Fit con <span style={{ color: "#00AAFF" }}>Damián</span>
        </p>
      </header>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 24px" }}>

        {/* HERO */}
        <section style={{ paddingTop: "48px", paddingBottom: "40px", textAlign: "center", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: "24px", pointerEvents: "none" }}>
            <ParticlesCanvas />
          </div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ color: "#666", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 14px 0" }}>ACCESO GRATUITO</p>
            <h1 style={{ fontSize: "clamp(2.2rem, 8vw, 3.4rem)", fontWeight: 900, lineHeight: 1.05, margin: "0 0 14px 0", letterSpacing: "-1.5px" }}>
              Accede gratis a los recursos que han transformado{" "}
              <em style={{ fontStyle: "italic", color: "#00AAFF" }}>cientos de cuerpos.</em>
            </h1>
            <p style={{ color: "#888", fontSize: "16px", lineHeight: 1.6, margin: "0 0 32px 0", fontStyle: "italic" }}>
              sin dietas imposibles ni horas en el gimnasio.
            </p>
            <button onClick={() => setModalOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "#00AAFF", color: "#fff", fontWeight: 900, fontSize: "17px", padding: "16px 36px", borderRadius: "99px", border: "none", cursor: "pointer", letterSpacing: "-0.3px", marginBottom: "14px" }}>
              Quiero acceder gratis →
            </button>
            <p style={{ color: "#555", fontSize: "13px", margin: "0 0 36px 0" }}>Material gratuito · Acceso en menos de 2 minutos</p>
            <div style={{ borderRadius: "16px", overflow: "hidden", background: "#161616", aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #252525" }}>
              <div style={{ textAlign: "center" }}>
                <div onClick={() => setModalOpen(true)} style={{ width: "72px", height: "72px", background: "#00AAFF", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", paddingLeft: "6px", margin: "0 auto 12px", cursor: "pointer", boxShadow: "0 0 0 14px rgba(0,170,255,0.12)" }}>▶</div>
                <p style={{ color: "#555", fontSize: "13px", margin: 0 }}>Vídeo de presentación — próximamente</p>
              </div>
            </div>
          </div>
        </section>

        {/* CONTADORES */}
        <div ref={statsReveal.ref} style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginBottom: "20px", opacity: statsReveal.visible ? 1 : 0, transform: statsReveal.visible ? "translateY(0)" : "translateY(40px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: "16px", padding: "20px", textAlign: "center", opacity: statsReveal.visible ? 1 : 0, transform: statsReveal.visible ? "translateY(0)" : "translateY(20px)", transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s` }}>
              <p style={{ fontWeight: 900, fontSize: "clamp(1.8rem, 5vw, 2.4rem)", color: "#00AAFF", margin: "0 0 4px 0", letterSpacing: "-1px" }}>
                <Counter target={s.value} suffix={s.suffix} start={statsReveal.visible} />
              </p>
              <p style={{ color: "#888", fontSize: "12px", margin: 0, lineHeight: 1.4 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Label antes del scroll */}
        <div style={{ textAlign: "center", padding: "32px 0 24px" }}>
          <p style={{ color: "#00AAFF", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 10px 0" }}>ESTO ES LO QUE TE LLEVAS</p>
          <div style={{ animation: "bounce 1.8s infinite" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00AAFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
          </div>
          <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }`}</style>
        </div>
      </div>

      {/* SCROLL HORIZONTAL — full width, fuera del contenedor */}
      <HorizontalScroll onOpenModal={() => setModalOpen(true)} />

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

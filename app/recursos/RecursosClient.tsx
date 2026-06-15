"use client";

import { useState, useRef, useEffect } from "react";
import ModalForm from "./ModalForm";

const recursos = [
  { vol: "01", nombre: "Diagnóstico Corporal",      emoji: "📋", categoria: "DIAGNÓSTICO"   },
  { vol: "02", nombre: "Guía de Nutrición",          emoji: "🥗", categoria: "NUTRICIÓN"     },
  { vol: "03", nombre: "Rutina Express",             emoji: "💪", categoria: "ENTRENAMIENTO" },
  { vol: "04", nombre: "Protocolo de Recuperación",  emoji: "😴", categoria: "RECUPERACIÓN"  },
  { vol: "05", nombre: "Plan Primera Semana",        emoji: "📅", categoria: "PLANIFICACIÓN" },
];

const stats = [
  { value: 500, suffix: "+", label: "personas transformadas"    },
  { value: 3,   suffix: "+", label: "años de experiencia"       },
  { value: 30,  suffix: "",  label: "minutos de llamada gratis" },
  { value: 100, suffix: "%", label: "método basado en ciencia"  },
];

const N      = recursos.length;
const R      = 115; // radio de la rueda
const SIZE   = 300; // tamaño del contenedor

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

// — Rueda circular —
function CircularWheel({ onOpenModal }: { onOpenModal: () => void }) {
  const [active, setActive] = useState(0);
  const [prev, setPrev]     = useState(0);

  const select = (i: number) => { setPrev(active); setActive(i); };
  const goNext = () => select((active + 1) % N);
  const goPrev = () => select((active - 1 + N) % N);

  // Ángulo de cada item con el activo siempre en el top (−90°)
  const getAngle = (i: number) => {
    let offset = i - active;
    if (offset > N / 2) offset -= N;
    if (offset < -N / 2) offset += N;
    return -90 + offset * (360 / N);
  };

  const getPos = (i: number) => {
    const deg = getAngle(i);
    const rad = deg * (Math.PI / 180);
    return {
      x: SIZE / 2 + R * Math.cos(rad),
      y: SIZE / 2 + R * Math.sin(rad),
    };
  };

  const r = recursos[active];

  return (
    <div>
      {/* Rueda */}
      <div style={{ position: "relative", width: SIZE, height: SIZE, margin: "0 auto" }}>
        {/* Órbita */}
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          width: R * 2, height: R * 2,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          border: "1px dashed rgba(0,170,255,0.2)",
        }} />

        {/* Centro */}
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          transform: "translate(-50%, -50%)",
          width: 60, height: 60, borderRadius: "50%",
          background: "rgba(0,170,255,0.08)",
          border: "1px solid rgba(0,170,255,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: "20px" }}>⚡</span>
        </div>

        {/* Items */}
        {recursos.map((item, i) => {
          const pos     = getPos(i);
          const isActive = i === active;
          let offset = Math.abs(i - active);
          if (offset > N / 2) offset = N - offset;
          const scale = isActive ? 1 : 1 - offset * 0.12;
          const opacity = isActive ? 1 : 1 - offset * 0.2;

          return (
            <button
              key={item.vol}
              onClick={() => select(i)}
              style={{
                position: "absolute",
                left: "50%", top: "50%",
                transform: `translate(calc(-50% + ${pos.x - SIZE / 2}px), calc(-50% + ${pos.y - SIZE / 2}px)) scale(${scale})`,
                transition: "transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease",
                opacity,
                zIndex: isActive ? 10 : 5 - offset,
                border: "none", background: "none", padding: 0, cursor: "pointer",
              }}
            >
              <div style={{
                width: isActive ? 72 : 54,
                height: isActive ? 72 : 54,
                borderRadius: "50%",
                background: isActive
                  ? "linear-gradient(135deg, #00AAFF, #0077CC)"
                  : "#161616",
                border: isActive ? "none" : "1px solid #2a2a2a",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: isActive ? 30 : 22,
                boxShadow: isActive
                  ? "0 0 0 8px rgba(0,170,255,0.15), 0 8px 32px rgba(0,170,255,0.3)"
                  : "none",
                transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}>
                {item.emoji}
              </div>
            </button>
          );
        })}
      </div>

      {/* Detalle del recurso activo */}
      <div style={{
        marginTop: "20px",
        background: "#111", border: "1px solid #1f1f1f",
        borderRadius: "20px", padding: "28px", textAlign: "center",
        transition: "all 0.35s ease",
      }}>
        <p style={{ color: "#00AAFF", fontSize: "10px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 8px 0" }}>
          VOL · {r.vol} · {r.categoria}
        </p>
        <h3 style={{ fontWeight: 900, fontSize: "22px", margin: "0 0 20px 0", lineHeight: 1.2 }}>
          {r.nombre}
        </h3>

        {/* Navegación */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "20px" }}>
          <button onClick={goPrev} style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#fff", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            ←
          </button>
          <div style={{ display: "flex", gap: "6px" }}>
            {recursos.map((_, i) => (
              <div key={i} onClick={() => select(i)} style={{ width: i === active ? "20px" : "6px", height: "6px", borderRadius: "99px", background: i === active ? "#00AAFF" : "#333", transition: "all 0.3s ease", cursor: "pointer" }} />
            ))}
          </div>
          <button onClick={goNext} style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#00AAFF", border: "none", color: "#fff", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            →
          </button>
        </div>

        <button
          onClick={onOpenModal}
          style={{ background: "#00AAFF", color: "#fff", fontWeight: 900, fontSize: "15px", padding: "13px 28px", borderRadius: "99px", border: "none", cursor: "pointer" }}
        >
          Acceder a todos gratis →
        </button>
      </div>
    </div>
  );
}

export default function RecursosClient() {
  const [modalOpen, setModalOpen] = useState(false);
  const statsReveal = useReveal(0.2);
  const wheelReveal = useReveal(0.1);

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
        <div ref={statsReveal.ref} style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginBottom: "56px", opacity: statsReveal.visible ? 1 : 0, transform: statsReveal.visible ? "translateY(0)" : "translateY(40px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: "16px", padding: "20px", textAlign: "center", opacity: statsReveal.visible ? 1 : 0, transform: statsReveal.visible ? "translateY(0)" : "translateY(20px)", transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s` }}>
              <p style={{ fontWeight: 900, fontSize: "clamp(1.8rem, 5vw, 2.4rem)", color: "#00AAFF", margin: "0 0 4px 0", letterSpacing: "-1px" }}>
                <Counter target={s.value} suffix={s.suffix} start={statsReveal.visible} />
              </p>
              <p style={{ color: "#888", fontSize: "12px", margin: 0, lineHeight: 1.4 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* RUEDA */}
        <section ref={wheelReveal.ref} style={{ paddingBottom: "80px", opacity: wheelReveal.visible ? 1 : 0, transform: wheelReveal.visible ? "translateY(0)" : "translateY(50px)", transition: "opacity 0.8s ease, transform 0.8s ease" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <p style={{ color: "#00AAFF", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 10px 0" }}>ESTO ES LO QUE TE LLEVAS</p>
            <div style={{ animation: "bounce 1.8s infinite" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00AAFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
            </div>
            <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }`}</style>
          </div>
          <CircularWheel onOpenModal={() => setModalOpen(true)} />
        </section>
      </div>

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

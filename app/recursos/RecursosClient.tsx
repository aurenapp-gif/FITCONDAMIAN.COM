"use client";

import { useState, useRef, useEffect } from "react";
import ModalForm from "./ModalForm";

const recursos = [
  { vol: "01", nombre: "Medidor de Edad-Muscular",  emoji: "📋", categoria: "DIAGNÓSTICO",  desc: "Sabrás en qué punto a nivel muscular te encuentras y qué deberás de hacer para mejorar en el punto en el que estás." },
  { vol: "02", nombre: "Test Inteligente de Hábitos", emoji: "🥗", categoria: "NUTRICIÓN",  desc: "Entiende qué te está haciendo verte flácida, envejecer y perder energía para así poder revertirlo." },
  { vol: "03", nombre: "IA Experta en Sistemas",    emoji: "💪", categoria: "ENTRENAMIENTO", desc: "Crea sistemas infalibles a largo plazo para nunca volver a empeorar tu físico y salud." },
  { vol: "04", nombre: "Plan de Ruta Anti Envejecimiento y Flacidez", emoji: "😴", categoria: "RECUPERACIÓN", desc: "Utiliza el plan de ruta que ha llevado a más de 1000 mujeres a conseguir verse más atractivas, eliminar la flacidez y volver a tener energía del método Envejecimiento Revertido." },
  { vol: "05", nombre: "Mapas y Técnicas Filtradas del Programa Exclusivo Envejecimiento Revertido", emoji: "📅", categoria: "EXCLUSIVO", desc: "Acceso a los mapas y técnicas filtradas del programa exclusivo Envejecimiento Revertido." },
];

const stats = [
  { value: 1000, suffix: "+", label: "personas transformadas"    },
  { value: 7,    suffix: "+", label: "años de experiencia"       },
  { value: 30,   suffix: "",  label: "minutos de llamada gratis" },
  { value: 100,  suffix: "%", label: "método basado en ciencia"  },
];

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
    let id = 0;
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
    id = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

// — Contador —
function Counter({ target, suffix, start }: { target: number; suffix: string; start: boolean }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let id = 0;
    let t0: number | null = null;
    const step = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / 1800, 1);
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) { id = requestAnimationFrame(step); } else { setVal(target); }
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
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

// — Tarjeta cinematográfica con glassmorphism —
function CinematicCard({
  r, index, onOpenModal,
}: {
  r: typeof recursos[0];
  index: number;
  onOpenModal: () => void;
}) {
  const { ref, visible } = useReveal(0.35);
  const alignRight = index % 2 === 0;

  return (
    <div ref={ref} style={{
      position: "relative",
      minHeight: "62vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "40px 0",
    }}>
      {/* Resplandor */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        <div style={{
          width: "65%", height: "65%", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,170,255,0.28), transparent 70%)",
          filter: "blur(50px)",
          opacity: visible ? 1 : 0,
          transition: "opacity 1.1s ease",
        }} />
      </div>

      {/* Número en marca de agua */}
      <p aria-hidden="true" style={{
        position: "absolute", top: "-6px",
        right: alignRight ? "0px" : "auto",
        left: alignRight ? "auto" : "0px",
        fontSize: "clamp(6rem, 18vw, 11rem)", fontWeight: 900,
        color: "rgba(255,255,255,0.045)",
        margin: 0, lineHeight: 1, letterSpacing: "-4px",
        pointerEvents: "none", userSelect: "none",
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "transform 1s ease",
      }}>
        {r.vol}
      </p>

      {/* Tarjeta de cristal */}
      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: "540px",
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: "28px",
        padding: "clamp(28px, 5vw, 44px)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(70px) scale(0.92)",
        filter: visible ? "blur(0px)" : "blur(8px)",
        transition: "opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1), filter 0.9s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "22px" }}>
          <div aria-hidden="true" style={{
            width: "60px", height: "60px", borderRadius: "18px", flexShrink: 0,
            background: "linear-gradient(135deg, #00AAFF, #0077CC)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "28px",
            boxShadow: "0 8px 24px rgba(0,170,255,0.35)",
          }}>
            {r.emoji}
          </div>
          <p style={{ color: "#00AAFF", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: 0, lineHeight: 1.6 }}>
            VOL · {r.vol}<br /><span style={{ color: "#777" }}>{r.categoria}</span>
          </p>
        </div>
        <h3 style={{ fontWeight: 900, fontSize: "clamp(1.6rem, 4vw, 2.1rem)", color: "#fff", margin: "0 0 14px 0", lineHeight: 1.15, letterSpacing: "-1px" }}>
          {r.nombre}
        </h3>
        <p style={{ color: "#999", fontSize: "15px", lineHeight: 1.7, margin: "0 0 26px 0" }}>
          {r.desc}
        </p>
        <button
          onClick={onOpenModal}
          style={{
            background: "#00AAFF", color: "#fff",
            fontWeight: 900, fontSize: "14px",
            padding: "13px 28px", borderRadius: "99px",
            border: "none", cursor: "pointer",
            boxShadow: "0 8px 24px rgba(0,170,255,0.3)",
          }}
        >
          Acceder gratis →
        </button>
      </div>
    </div>
  );
}

// — Secuencia cinematográfica completa —
function CinematicReveal({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <div style={{ position: "relative" }}>
      {recursos.map((r, i) => (
        <CinematicCard key={r.vol} r={r} index={i} onOpenModal={onOpenModal} />
      ))}
    </div>
  );
}

export default function RecursosClient() {
  const [modalOpen, setModalOpen] = useState(false);
  const statsReveal  = useReveal(0.2);
  const accordReveal = useReveal(0.1);

  return (
    <main style={{ background: "#0D0D0D", minHeight: "100vh", color: "#fff", fontFamily: "var(--font-inter), sans-serif", overflowX: "hidden" }}>
      <ModalForm open={modalOpen} onClose={() => setModalOpen(false)} />

      <header style={{ borderBottom: "1px solid #1f1f1f", padding: "20px 24px", textAlign: "center", position: "relative", zIndex: 10 }}>
        <p style={{ margin: 0, fontWeight: 900, fontSize: "18px", letterSpacing: "-0.5px" }}>
          Fit con <span style={{ color: "#00AAFF" }}>Damián</span>
        </p>
      </header>

      {/* BANNER — público objetivo */}
      <div style={{
        background: "linear-gradient(90deg, #0077CC, #00AAFF)",
        padding: "14px 24px",
        textAlign: "center",
        position: "relative",
        zIndex: 10,
      }}>
        <p style={{
          margin: 0,
          color: "#fff",
          fontSize: "clamp(13px, 3.4vw, 15px)",
          fontWeight: 900,
          lineHeight: 1.45,
          letterSpacing: "-0.3px",
        }}>
          Para mujeres que ya no se sienten atractivas, han perdido la energía y sienten que están envejeciendo
        </p>
      </div>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 24px" }}>

        {/* HERO */}
        <section style={{ paddingTop: "48px", paddingBottom: "40px", textAlign: "center", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: "24px", pointerEvents: "none" }}>
            <ParticlesCanvas />
          </div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <h1 style={{ fontSize: "clamp(2.2rem, 8vw, 3.4rem)", fontWeight: 900, lineHeight: 1.05, margin: "0 0 32px 0", letterSpacing: "-1.5px" }}>
              Accede gratis a los recursos que han transformado{" "}
              <em style={{ fontStyle: "italic", color: "#00AAFF" }}>cientos de cuerpos.</em>
            </h1>
            <button onClick={() => setModalOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "#00AAFF", color: "#fff", fontWeight: 900, fontSize: "17px", padding: "16px 36px", borderRadius: "99px", border: "none", cursor: "pointer", letterSpacing: "-0.3px", marginBottom: "14px" }}>
              Quiero acceder gratis →
            </button>
            <p style={{ color: "#555", fontSize: "13px", margin: "0 0 36px 0" }}>Empieza a ver cambios en menos de 5 días</p>
            {/* TODO: replace inner div with <iframe> YouTube/Vimeo embed when ready */}
            <div data-video-placeholder="hero" style={{ borderRadius: "16px", overflow: "hidden", background: "#161616", aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #252525" }}>
              <div style={{ textAlign: "center" }}>
                <button onClick={() => setModalOpen(true)} aria-label="Acceder a los recursos gratis" style={{ width: "72px", height: "72px", background: "#00AAFF", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", paddingLeft: "6px", margin: "0 auto 12px", cursor: "pointer", boxShadow: "0 0 0 14px rgba(0,170,255,0.12)", border: "none" }}>
                  <span aria-hidden="true">▶</span>
                </button>
                <p style={{ color: "#555", fontSize: "13px", margin: 0 }}>Vídeo de presentación — próximamente</p>
              </div>
            </div>
          </div>
        </section>

        {/* CONTADORES */}
        <div ref={statsReveal.ref} style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginBottom: "56px", opacity: statsReveal.visible ? 1 : 0, transform: statsReveal.visible ? "translateY(0)" : "translateY(40px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: "16px", padding: "20px", textAlign: "center", opacity: statsReveal.visible ? 1 : 0, transform: statsReveal.visible ? "translateY(0)" : "translateY(20px)", transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s` }}>
              <p style={{ fontWeight: 900, fontSize: "clamp(1.8rem, 5vw, 2.4rem)", color: "#00AAFF", margin: "0 0 4px 0", letterSpacing: "-1px" }}>
                <Counter target={s.value} suffix={s.suffix} start={statsReveal.visible} />
              </p>
              <p style={{ color: "#888", fontSize: "12px", margin: 0, lineHeight: 1.4 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ACORDEÓN */}
        <section
          ref={accordReveal.ref}
          style={{ paddingBottom: "80px", opacity: accordReveal.visible ? 1 : 0, transform: accordReveal.visible ? "translateY(0)" : "translateY(40px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}
        >
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <p style={{ color: "#00AAFF", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 10px 0" }}>ESTO ES LO QUE TE LLEVAS</p>
            <div style={{ animation: "bounce 1.8s infinite" }} aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00AAFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
            </div>
          </div>

          <CinematicReveal onOpenModal={() => setModalOpen(true)} />
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

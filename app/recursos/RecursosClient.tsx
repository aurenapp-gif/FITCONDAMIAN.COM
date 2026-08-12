"use client";

import { useState, useRef, useEffect } from "react";
import ModalForm from "./ModalForm";
import VideoPlayer from "../_components/VideoPlayer";
import { track } from "@vercel/analytics";

const recursos = [
  { vol: "01", nombre: "Medidor de Edad-Muscular",  emoji: "📋", categoria: "DIAGNÓSTICO",  desc: "Sabrás en qué punto a nivel muscular te encuentras y qué deberás de hacer para mejorar en el punto en el que estás." },
  { vol: "02", nombre: "Test Inteligente de Hábitos", emoji: "🥗", categoria: "NUTRICIÓN",  desc: "Entiende qué te está haciendo verte flácida, envejecer y perder energía para así poder revertirlo." },
  { vol: "03", nombre: "IA Experta en Sistemas",    emoji: "💪", categoria: "ENTRENAMIENTO", desc: "Crea sistemas infalibles a largo plazo para nunca volver a empeorar tu físico y salud." },
  { vol: "04", nombre: "Plan de Ruta Anti Envejecimiento y Flacidez", emoji: "😴", categoria: "RECUPERACIÓN", desc: "Utiliza el plan de ruta que ha llevado a más de 1000 mujeres a conseguir verse más atractivas, eliminar la flacidez y volver a tener energía del método Envejecimiento Revertido." },
  { vol: "05", nombre: "Mapas y Técnicas Filtradas del Programa Exclusivo Envejecimiento Revertido", emoji: "📅", categoria: "EXCLUSIVO", desc: "Acceso a los mapas y técnicas filtradas del programa exclusivo Envejecimiento Revertido." },
  { vol: "06", nombre: "Guía de Alimentación en la Menopausia", emoji: "🍽️", categoria: "NUTRICIÓN", desc: "La guía de alimentación para atravesar la menopausia con energía, sin flacidez y sintiéndote en tu mejor versión." },
  { vol: "07", nombre: "Pierde Grasa Más Rápido con Estos 3 Cambios", emoji: "🔥", categoria: "PÉRDIDA DE GRASA", desc: "Los 3 cambios que aceleran la pérdida de grasa sin pasar hambre ni vivir en el gimnasio. Aplícalos desde hoy." },
  { vol: "08", nombre: "Test Anti-Cansancio", emoji: "⚡", categoria: "ENERGÍA", desc: "Descubre qué te está robando la energía y cómo recuperarla para sentirte activa todo el día." },
  { vol: "09", nombre: "Estrategia para Pérdida de Grasa", emoji: "🎯", categoria: "PÉRDIDA DE GRASA", desc: "La estrategia paso a paso para perder grasa de forma sostenible y sin recuperarla." },
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

// — Tarjeta compacta de recurso (cuadrícula) —
function RecursoCard({
  r, index, visible, onOpenModal,
}: {
  r: typeof recursos[0];
  index: number;
  visible: boolean;
  onOpenModal: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onOpenModal}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        textAlign: "left", cursor: "pointer", font: "inherit", color: "inherit",
        background: hover ? "rgba(0,170,255,0.08)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${hover ? "rgba(0,170,255,0.55)" : "rgba(255,255,255,0.09)"}`,
        borderRadius: "18px",
        padding: "18px 16px",
        display: "flex", flexDirection: "column", gap: "10px",
        minHeight: "170px",
        boxShadow: hover ? "0 14px 34px rgba(0,170,255,0.25)" : "none",
        opacity: visible ? 1 : 0,
        transform: visible ? (hover ? "translateY(-4px)" : "translateY(0)") : "translateY(24px)",
        transition: `opacity 0.5s ease ${index * 0.06}s, transform 0.3s ease, background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span aria-hidden="true" style={{
          width: "44px", height: "44px", borderRadius: "13px", flexShrink: 0,
          background: "linear-gradient(135deg, #00AAFF, #0077CC)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "22px", boxShadow: "0 6px 18px rgba(0,170,255,0.35)",
        }}>
          {r.emoji}
        </span>
        <span style={{ color: "#444", fontSize: "12px", fontWeight: 900, letterSpacing: "-0.5px" }}>{r.vol}</span>
      </div>
      <span style={{ color: "#00AAFF", fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>
        {r.categoria}
      </span>
      <h3 style={{
        fontWeight: 900, fontSize: "15px", color: "#fff", margin: 0, lineHeight: 1.2, letterSpacing: "-0.3px",
        display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {r.nombre}
      </h3>
      <span style={{ marginTop: "auto", color: hover ? "#00AAFF" : "#8a8a8a", fontSize: "13px", fontWeight: 800, transition: "color 0.25s ease" }}>
        Acceder →
      </span>
    </button>
  );
}

// — Cuadrícula compacta de recursos —
function RecursosGrid({ onOpenModal }: { onOpenModal: () => void }) {
  const { ref, visible } = useReveal(0.1);
  return (
    <div ref={ref} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "12px" }}>
      {recursos.map((r, i) => (
        <RecursoCard key={r.vol} r={r} index={i} visible={visible} onOpenModal={onOpenModal} />
      ))}
    </div>
  );
}

export default function RecursosClient() {
  const [modalOpen, setModalOpen] = useState(false);
  const statsReveal  = useReveal(0.2);
  const accordReveal = useReveal(0.1);

  // Abre el formulario y registra el evento de conversión "registro".
  const openModal = () => {
    track("registro");
    setModalOpen(true);
  };

  return (
    <main style={{ background: "#0D0D0D", minHeight: "100vh", color: "#fff", fontFamily: "var(--font-inter), sans-serif", overflowX: "hidden" }}>
      <ModalForm open={modalOpen} onClose={() => setModalOpen(false)} />

      <header style={{ borderBottom: "1px solid #1f1f1f", padding: "20px 24px", textAlign: "center", position: "relative", zIndex: 10 }}>
        <p style={{ margin: 0, fontWeight: 900, fontSize: "18px", letterSpacing: "-0.5px" }}>
          Fit con <span style={{ color: "#00AAFF" }}>Damián</span>
        </p>
      </header>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 24px" }}>

        {/* HERO */}
        <section style={{ paddingTop: "40px", paddingBottom: "40px", textAlign: "center", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: "24px", pointerEvents: "none" }}>
            <ParticlesCanvas />
          </div>
          <div style={{ position: "relative", zIndex: 1 }}>

            {/* Calificador (público objetivo) */}
            <p style={{ color: "#00AAFF", fontSize: "clamp(13px, 3.4vw, 15px)", fontWeight: 800, lineHeight: 1.4, letterSpacing: "-0.2px", margin: "0 auto 20px", maxWidth: "560px" }}>
              Para mujeres que se miran al espejo y no se ven atractivas, arrastran cansancio todo el día y han dejado de ponerse la ropa que antes les encantaba
            </p>

            {/* Titular principal (dos tonos, estilo del ejemplo) */}
            <h1 style={{ fontSize: "clamp(2rem, 7.5vw, 3.2rem)", fontWeight: 900, lineHeight: 1.08, margin: "0 0 28px 0", letterSpacing: "-1.5px", textTransform: "uppercase" }}>
              Descubre cómo eliminar la flacidez, terminar con el cansancio y{" "}
              <span style={{ color: "#00AAFF" }}>recuperar tu figura sin esfuerzo</span>
            </h1>

            <button onClick={openModal} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "10px", width: "100%", maxWidth: "520px", background: "#00AAFF", color: "#fff", fontWeight: 900, fontSize: "clamp(16px, 4.2vw, 19px)", padding: "20px 32px", borderRadius: "16px", border: "none", cursor: "pointer", letterSpacing: "-0.3px", marginBottom: "16px", boxShadow: "0 10px 30px rgba(0,170,255,0.35)", textTransform: "uppercase" }}>
              Acceder a los recursos
            </button>

            {/* Subtexto / promesa */}
            <p style={{ color: "#B8B8B8", fontSize: "15px", fontWeight: 500, lineHeight: 1.6, margin: "0 auto 36px", maxWidth: "560px" }}>
              Te regalo los <strong style={{ color: "#fff" }}>9 recursos gratis</strong> que han ayudado a cientos de mujeres a verse más firmes, recuperar su energía y volver a su ropa favorita. <span style={{ color: "#00AAFF", fontWeight: 700 }}>Empieza a ver cambios en menos de 5 días.</span>
            </p>
            <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid #252525", background: "#000" }}>
              <VideoPlayer src="/inicio-lead.mp4" poster="/inicio-lead-poster.jpg" />
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

        {/* RECURSOS — cuadrícula compacta */}
        <section
          ref={accordReveal.ref}
          style={{ paddingBottom: "56px", opacity: accordReveal.visible ? 1 : 0, transform: accordReveal.visible ? "translateY(0)" : "translateY(40px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}
        >
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <p style={{ color: "#00AAFF", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 8px 0" }}>ESTO ES LO QUE TE LLEVAS</p>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(1.4rem, 5vw, 2rem)", margin: 0, letterSpacing: "-0.8px" }}>
              9 recursos, <span style={{ color: "#00AAFF" }}>acceso inmediato y gratis</span>
            </h2>
          </div>

          <RecursosGrid onOpenModal={openModal} />

          {/* CTA final */}
          <div style={{ textAlign: "center", marginTop: "32px" }}>
            <button onClick={openModal} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "10px", width: "100%", maxWidth: "520px", background: "#00AAFF", color: "#fff", fontWeight: 900, fontSize: "clamp(16px, 4.2vw, 19px)", padding: "20px 32px", borderRadius: "16px", border: "none", cursor: "pointer", letterSpacing: "-0.3px", boxShadow: "0 10px 30px rgba(0,170,255,0.35)", textTransform: "uppercase" }}>
              Acceder a los recursos
            </button>
            <p style={{ color: "#666", fontSize: "12px", margin: "12px 0 0 0" }}>Sin tarjeta · Acceso inmediato · Solo tu correo</p>
          </div>
        </section>
      </div>

      <footer style={{ borderTop: "1px solid #1f1f1f", padding: "28px 24px", textAlign: "center" }}>
        <p style={{ color: "#444", fontSize: "12px", margin: 0 }}>
          © {new Date().getFullYear()} Fit con Damián · fitcondamian.com{" · "}
          <a href="/privacidad" style={{ color: "#444", textDecoration: "none" }}>Privacidad</a>{" · "}
          <a href="/politica-cookies" style={{ color: "#444", textDecoration: "none" }}>Cookies</a>{" · "}
          <a href="/aviso-legal" style={{ color: "#444", textDecoration: "none" }}>Aviso Legal</a>
        </p>
      </footer>
    </main>
  );
}

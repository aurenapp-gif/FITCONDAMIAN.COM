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
  { value: 500, suffix: "+", label: "personas transformadas"   },
  { value: 3,   suffix: "+", label: "años de experiencia"      },
  { value: 30,  suffix: "",  label: "minutos de llamada gratis"},
  { value: 100, suffix: "%", label: "método basado en ciencia" },
];

// — Partículas —
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
    const pts = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.3,
      dx: (Math.random() - 0.5) * 0.35, dy: (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.45 + 0.08, blue: Math.random() > 0.65,
    }));
    let id: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pts) {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.blue ? "#00AAFF" : "#fff";
        ctx.globalAlpha = p.alpha; ctx.fill();
      }
      ctx.globalAlpha = 1; id = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

// — Contador —
function Counter({ target, suffix, start }: { target: number; suffix: string; start: boolean }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let t0: number | null = null;
    const dur = 1800;
    const step = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / dur, 1);
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

// — Stack tipo Tinder —
function TinderStack({ onOpenModal }: { onOpenModal: () => void }) {
  const [topIndex, setTopIndex] = useState(0);
  const [dragX, setDragX]       = useState(0);
  const [dragY, setDragY]       = useState(0);
  const [dragging, setDragging] = useState(false);
  const [flyDir, setFlyDir]     = useState<"left" | "right" | null>(null);
  const startPos                = useRef<{ x: number; y: number } | null>(null);
  const didDrag                 = useRef(false);

  const done = topIndex >= recursos.length;

  const flyOut = (dir: "left" | "right") => {
    setFlyDir(dir);
    setTimeout(() => {
      setTopIndex(i => i + 1);
      setFlyDir(null); setDragX(0); setDragY(0);
    }, 380);
  };

  const onDown = (e: React.PointerEvent) => {
    startPos.current = { x: e.clientX, y: e.clientY };
    didDrag.current = false; setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!startPos.current) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) didDrag.current = true;
    setDragX(dx); setDragY(dy);
  };
  const onUp = () => {
    if (!dragging) return;
    if (Math.abs(dragX) > 90) flyOut(dragX > 0 ? "right" : "left");
    else { setDragX(0); setDragY(0); }
    setDragging(false); startPos.current = null;
  };
  const onClick = () => { if (!didDrag.current) onOpenModal(); };

  const showRight = dragging && dragX > 35;
  const showLeft  = dragging && dragX < -35;

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px" }}>
        <div style={{ fontSize: "52px", marginBottom: "16px" }}>🎉</div>
        <h3 style={{ fontWeight: 900, fontSize: "1.4rem", margin: "0 0 10px 0" }}>¡Has visto todos los recursos!</h3>
        <p style={{ color: "#888", fontSize: "14px", margin: "0 0 24px 0" }}>Accede gratis a todos ellos ahora</p>
        <button
          onClick={onOpenModal}
          style={{ background: "#00AAFF", color: "#fff", fontWeight: 900, fontSize: "16px", padding: "14px 32px", borderRadius: "99px", border: "none", cursor: "pointer" }}
        >
          Quiero acceder gratis →
        </button>
        <br />
        <button
          onClick={() => setTopIndex(0)}
          style={{ background: "none", border: "none", color: "#555", fontSize: "13px", cursor: "pointer", marginTop: "14px", textDecoration: "underline" }}
        >
          Volver a ver las cartas
        </button>
      </div>
    );
  }

  const visible = recursos.slice(topIndex, topIndex + 3).reverse();

  return (
    <div style={{ position: "relative", height: "380px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "32px" }}>

      {/* Cartas del stack (de atrás a delante) */}
      {visible.map((r, revIdx) => {
        const stackIdx = visible.length - 1 - revIdx; // 0=top, 1=behind, 2=far behind
        const isTop = stackIdx === 0;
        const isFly = isTop && !!flyDir;

        let transform = `scale(${1 - stackIdx * 0.055}) translateY(${stackIdx * 16}px)`;
        let transition = "transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)";
        let zIndex = 10 - stackIdx;
        let opacity = 1 - stackIdx * 0.15;

        if (isTop) {
          if (isFly) {
            const fx = flyDir === "right" ? 700 : -700;
            const fr = flyDir === "right" ? 28 : -28;
            transform = `translateX(${fx}px) translateY(-40px) rotate(${fr}deg)`;
            transition = "transform 0.38s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.38s ease";
            opacity = 0;
          } else if (dragging) {
            const rot = dragX * 0.07;
            transform = `translateX(${dragX}px) translateY(${dragY * 0.25}px) rotate(${rot}deg)`;
            transition = "none";
          }
        }

        return (
          <div
            key={r.vol}
            style={{ position: "absolute", width: "280px", transform, transition, zIndex, opacity }}
            onPointerDown={isTop ? onDown : undefined}
            onPointerMove={isTop ? onMove : undefined}
            onPointerUp={isTop ? onUp : undefined}
            onClick={isTop ? onClick : undefined}
          >
            {/* Indicadores swipe */}
            {isTop && showRight && (
              <div style={{
                position: "absolute", top: "20px", left: "20px", zIndex: 20,
                background: "#00AAFF", color: "#fff", fontWeight: 900,
                fontSize: "13px", padding: "6px 14px", borderRadius: "99px",
                border: "3px solid #fff", opacity: Math.min(1, dragX / 100),
                transform: "rotate(-12deg)",
              }}>✓ QUIERO ESTE</div>
            )}
            {isTop && showLeft && (
              <div style={{
                position: "absolute", top: "20px", right: "20px", zIndex: 20,
                background: "#333", color: "#fff", fontWeight: 900,
                fontSize: "13px", padding: "6px 14px", borderRadius: "99px",
                border: "3px solid #666", opacity: Math.min(1, -dragX / 100),
                transform: "rotate(12deg)",
              }}>SIGUIENTE →</div>
            )}

            {/* Carta */}
            <div style={{
              background: isTop ? "linear-gradient(145deg, #1c1c1c, #111)" : "#111",
              border: isTop ? "1.5px solid #00AAFF" : "1px solid #222",
              borderRadius: "24px", padding: "32px 24px 24px",
              display: "flex", flexDirection: "column", alignItems: "center",
              boxShadow: isTop ? "0 30px 70px rgba(0,170,255,0.2)" : "0 10px 30px rgba(0,0,0,0.4)",
              cursor: isTop ? (dragging ? "grabbing" : "grab") : "default",
              userSelect: "none", position: "relative", overflow: "hidden",
            }}>
              <span style={{
                position: "absolute", top: "16px", left: "16px",
                background: isTop ? "#00AAFF" : "#1f1f1f",
                color: "#fff", fontSize: "10px", fontWeight: 900,
                padding: "4px 10px", borderRadius: "99px", letterSpacing: "1px",
              }}>VOL · {r.vol}</span>

              {isTop && (
                <span style={{
                  position: "absolute", top: "16px", right: "16px",
                  color: "#555", fontSize: "11px",
                }}>← desliza →</span>
              )}

              <div style={{ fontSize: "72px", lineHeight: 1, margin: "16px 0 20px 0" }}>{r.emoji}</div>

              <p style={{ color: isTop ? "#00AAFF" : "#444", fontSize: "10px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 8px 0" }}>
                {r.categoria}
              </p>
              <h3 style={{ fontSize: "20px", fontWeight: 900, textAlign: "center", margin: "0 0 20px 0", lineHeight: 1.2, color: isTop ? "#fff" : "#888" }}>
                {r.nombre}
              </h3>

              {isTop && (
                <div style={{
                  background: "rgba(0,170,255,0.12)", border: "1px solid rgba(0,170,255,0.3)",
                  borderRadius: "99px", padding: "8px 18px",
                  fontSize: "13px", color: "#00AAFF", fontWeight: 700,
                }}>
                  Toca para acceder a todo →
                </div>
              )}

              {isTop && (
                <div style={{
                  position: "absolute", bottom: "-30px", left: "50%", transform: "translateX(-50%)",
                  width: "160px", height: "60px",
                  background: "radial-gradient(ellipse, rgba(0,170,255,0.25) 0%, transparent 70%)",
                  pointerEvents: "none",
                }} />
              )}
            </div>
          </div>
        );
      })}

      {/* Contador restante */}
      <div style={{
        position: "absolute", bottom: "-36px", left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: "6px",
      }}>
        {recursos.map((_, i) => (
          <div key={i} style={{
            width: i < topIndex ? "8px" : i === topIndex ? "20px" : "8px",
            height: "6px", borderRadius: "99px",
            background: i < topIndex ? "#222" : i === topIndex ? "#00AAFF" : "#333",
            transition: "all 0.3s ease",
          }} />
        ))}
      </div>
    </div>
  );
}

export default function RecursosClient() {
  const [modalOpen, setModalOpen] = useState(false);
  const statsReveal    = useReveal(0.2);
  const stackReveal    = useReveal(0.1);

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
                border: "none", cursor: "pointer", letterSpacing: "-0.3px", marginBottom: "14px",
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
                <div onClick={() => setModalOpen(true)} style={{
                  width: "72px", height: "72px", background: "#00AAFF",
                  borderRadius: "50%", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "24px", paddingLeft: "6px",
                  margin: "0 auto 12px", cursor: "pointer",
                  boxShadow: "0 0 0 14px rgba(0,170,255,0.12)",
                }}>▶</div>
                <p style={{ color: "#555", fontSize: "13px", margin: 0 }}>Vídeo de presentación — próximamente</p>
              </div>
            </div>
          </div>
        </section>

        {/* CONTADORES */}
        <div
          ref={statsReveal.ref}
          style={{
            display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginBottom: "56px",
            opacity: statsReveal.visible ? 1 : 0,
            transform: statsReveal.visible ? "translateY(0)" : "translateY(40px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          {stats.map((s, i) => (
            <div key={i} style={{
              background: "#111", border: "1px solid #1f1f1f", borderRadius: "16px", padding: "20px", textAlign: "center",
              opacity: statsReveal.visible ? 1 : 0,
              transform: statsReveal.visible ? "translateY(0)" : "translateY(20px)",
              transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`,
            }}>
              <p style={{ fontWeight: 900, fontSize: "clamp(1.8rem, 5vw, 2.4rem)", color: "#00AAFF", margin: "0 0 4px 0", letterSpacing: "-1px" }}>
                <Counter target={s.value} suffix={s.suffix} start={statsReveal.visible} />
              </p>
              <p style={{ color: "#888", fontSize: "12px", margin: 0, lineHeight: 1.4 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* STACK TINDER */}
        <section
          ref={stackReveal.ref}
          style={{
            paddingBottom: "100px",
            opacity: stackReveal.visible ? 1 : 0,
            transform: stackReveal.visible ? "translateY(0)" : "translateY(50px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
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

          <TinderStack onOpenModal={() => setModalOpen(true)} />
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

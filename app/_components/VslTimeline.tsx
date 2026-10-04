"use client";

import { useState, useRef, useEffect } from "react";

const vslVideos: { id: string; titulo: string; lado: "izquierda" | "derecha"; youtube: string }[] = [
  { id: "01", titulo: "¿Qué es lo que te Está Restando Vitalidad y Atractivo?", lado: "izquierda", youtube: "pUwfONeAbuk" },
  { id: "02", titulo: "Cómo TRANSFORMAR tu físico de 40 años para volver a SENTIR QUE TIENES 25", lado: "derecha", youtube: "WFn9kDt3FsA" },
  { id: "03", titulo: "Cómo ELIMINAR la flacidez a los 35 años: EL SECRETO DEL MÚSCULO", lado: "izquierda", youtube: "0b7aIuPJaKo" },
  { id: "04", titulo: "¿Estás Lista para Descubrir el Secreto de las Mujeres Jóvenes a los 40 Años?", lado: "derecha", youtube: "qZArQavUepk" },
];

// Paletas: la oscura original y la de "Envejecimiento Revertido" (er).
const PALETAS = {
  base: { acc: "#00AAFF", rgb: "0,170,255", card: "#111", line: "#1f1f1f", thumb: "#161616", fondo: "#0D0D0D", off: "#1b2b33", txt: "#E0E0E0", sobreAcc: "#fff" },
  er: { acc: "#35C2FF", rgb: "53,194,255", card: "#0c1d2a", line: "rgba(255,255,255,0.09)", thumb: "#0b1c29", fondo: "#081521", off: "#16303f", txt: "#eaf3fb", sobreAcc: "#04202b" },
};

export default function VslTimeline({ er = false }: { er?: boolean }) {
  const C = er ? PALETAS.er : PALETAS.base;
  const [videoAbierto, setVideoAbierto] = useState<string | null>(null);

  // Estela de scroll: la línea se ilumina y las bolas se encienden al bajar.
  const timelineRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [fillPx, setFillPx] = useState(0);
  const [activos, setActivos] = useState<boolean[]>(() => vslVideos.map(() => false));

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const cont = timelineRef.current;
      if (!cont) return;
      const rect = cont.getBoundingClientRect();
      const refLineY = window.innerHeight * 0.5; // línea de referencia: mitad de la pantalla
      const fill = Math.max(0, Math.min(refLineY - rect.top, rect.height));
      setFillPx(fill);
      setActivos(rowRefs.current.map((row) => {
        if (!row) return false;
        const r = row.getBoundingClientRect();
        return (r.top + 28) <= refLineY; // la bola se enciende al pasar la mitad de la pantalla
      }));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={timelineRef} style={{ position: "relative", marginBottom: "60px" }}>
      {/* MODAL REPRODUCTOR */}
      {videoAbierto && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setVideoAbierto(null); }}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.9)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "16px", backdropFilter: "blur(4px)",
          }}
        >
          <div style={{ position: "relative", width: "100%", maxWidth: "900px" }}>
            <button
              onClick={() => setVideoAbierto(null)}
              aria-label="Cerrar vídeo"
              style={{
                position: "absolute", top: "-44px", right: "0",
                background: "#222", border: "none", color: "#fff",
                width: "36px", height: "36px", borderRadius: "50%",
                cursor: "pointer", fontSize: "18px", display: "flex",
                alignItems: "center", justifyContent: "center",
              }}
            >
              <span aria-hidden="true">✕</span>
            </button>
            <div style={{ position: "relative", aspectRatio: "16/9", background: "#000", borderRadius: "12px", overflow: "hidden" }}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoAbierto}?autoplay=1&rel=0`}
                title="Reproductor de vídeo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Línea vertical central (base tenue) */}
      <div style={{
        position: "absolute", left: "50%", top: 0, bottom: 0,
        width: "2px", background: `rgba(${C.rgb},0.15)`,
        transform: "translateX(-50%)",
      }} />
      {/* Estela iluminada que crece con el scroll */}
      <div aria-hidden="true" style={{
        position: "absolute", left: "50%", top: 0,
        width: "3px", height: `${fillPx}px`,
        transform: "translateX(-50%)",
        background: `linear-gradient(180deg, rgba(${C.rgb},0.2), ${C.acc})`,
        boxShadow: `0 0 12px rgba(${C.rgb},0.8), 0 0 24px rgba(${C.rgb},0.5)`,
        borderRadius: "2px",
      }} />

      <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
        {vslVideos.map((v, i) => (
          <div
            key={v.id}
            ref={(el) => { rowRefs.current[i] = el; }}
            style={{
              display: "flex",
              justifyContent: v.lado === "izquierda" ? "flex-start" : "flex-end",
              position: "relative",
            }}
          >
            {/* Punto en la línea — se ilumina al llegar a su altura */}
            <div style={{
              position: "absolute", left: "50%", top: "28px",
              transform: "translateX(-50%)",
              width: "14px", height: "14px",
              background: activos[i] ? C.acc : C.off,
              borderRadius: "50%",
              border: `3px solid ${C.fondo}`,
              boxShadow: activos[i] ? `0 0 0 4px rgba(${C.rgb},0.25), 0 0 14px rgba(${C.rgb},0.9)` : "none",
              transition: "background 0.4s ease, box-shadow 0.4s ease",
              zIndex: 1,
            }} />

            {/* Tarjeta vídeo */}
            <div style={{
              width: "clamp(200px, 46%, 260px)",
              background: C.card, border: `1px solid ${C.line}`,
              borderRadius: "14px", overflow: "hidden",
            }}>
              <button
                type="button"
                onClick={() => setVideoAbierto(v.youtube)}
                aria-label={`Ver el vídeo: ${v.titulo}`}
                style={{
                  aspectRatio: "16/9",
                  width: "100%",
                  background: C.thumb,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative",
                  borderBottom: `1px solid ${C.line}`,
                  border: "none", padding: 0, cursor: "pointer", overflow: "hidden",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://img.youtube.com/vi/${v.youtube}/maxresdefault.jpg`}
                  alt={`Miniatura: ${v.titulo}`}
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (img.dataset.step === undefined) {
                      img.dataset.step = "1";
                      img.src = `https://img.youtube.com/vi/${v.youtube}/hqdefault.jpg`;
                    } else {
                      img.style.display = "none";
                    }
                  }}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.85)" }}
                />
                <span style={{
                  position: "absolute", top: "8px", left: "8px",
                  background: C.acc, color: C.sobreAcc,
                  fontSize: "10px", fontWeight: 900,
                  padding: "3px 8px", borderRadius: "99px", zIndex: 1,
                }}>
                  VOL · {v.id}
                </span>
                <div aria-hidden="true" style={{
                  width: "36px", height: "36px",
                  background: C.acc, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "14px", paddingLeft: "3px",
                  boxShadow: `0 0 0 8px rgba(${C.rgb},0.12)`,
                  color: C.sobreAcc,
                }}>▶</div>
              </button>
              <div style={{ padding: "14px" }}>
                <p style={{ fontWeight: 800, fontSize: "12px", lineHeight: 1.4, margin: 0, color: C.txt }}>
                  {v.titulo}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

const vslVideos: { id: string; titulo: string; lado: "izquierda" | "derecha"; youtube: string }[] = [
  { id: "01", titulo: "De la FLACIDEZ a la VITALIDAD: Recupera tu atractivo, energía y confianza pasados los 35", lado: "izquierda", youtube: "pUwfONeAbuk" },
  { id: "02", titulo: "Cómo TRANSFORMAR tu físico de 40 años para volver a SENTIR QUE TIENES 25", lado: "derecha", youtube: "WFn9kDt3FsA" },
  { id: "03", titulo: "Cómo ELIMINAR la flacidez a los 35 años: EL SECRETO DEL MÚSCULO", lado: "izquierda", youtube: "0b7aIuPJaKo" },
  { id: "04", titulo: "El SISTEMA que usan las mujeres que siguen JÓVENES a los 40 años (y tú no conoces)", lado: "derecha", youtube: "qZArQavUepk" },
];

export default function VslTimeline() {
  const [videoAbierto, setVideoAbierto] = useState<string | null>(null);

  return (
    <div style={{ position: "relative", marginBottom: "60px" }}>
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

      {/* Línea vertical central */}
      <div style={{
        position: "absolute", left: "50%", top: 0, bottom: 0,
        width: "2px", background: "linear-gradient(180deg, #00AAFF, rgba(0,170,255,0.1))",
        transform: "translateX(-50%)",
      }} />

      <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
        {vslVideos.map((v) => (
          <div key={v.id} style={{
            display: "flex",
            justifyContent: v.lado === "izquierda" ? "flex-start" : "flex-end",
            position: "relative",
          }}>
            {/* Punto en la línea */}
            <div style={{
              position: "absolute", left: "50%", top: "28px",
              transform: "translateX(-50%)",
              width: "14px", height: "14px",
              background: "#00AAFF", borderRadius: "50%",
              border: "3px solid #0D0D0D",
              zIndex: 1,
            }} />

            {/* Tarjeta vídeo */}
            <div style={{
              width: "clamp(200px, 46%, 260px)",
              background: "#111", border: "1px solid #1f1f1f",
              borderRadius: "14px", overflow: "hidden",
            }}>
              <button
                type="button"
                onClick={() => setVideoAbierto(v.youtube)}
                aria-label={`Ver el vídeo: ${v.titulo}`}
                style={{
                  aspectRatio: "16/9",
                  width: "100%",
                  background: "#161616",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative",
                  borderBottom: "1px solid #1f1f1f",
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
                  background: "#00AAFF", color: "#fff",
                  fontSize: "10px", fontWeight: 900,
                  padding: "3px 8px", borderRadius: "99px", zIndex: 1,
                }}>
                  VOL · {v.id}
                </span>
                <div aria-hidden="true" style={{
                  width: "36px", height: "36px",
                  background: "#00AAFF", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "14px", paddingLeft: "3px",
                  boxShadow: "0 0 0 8px rgba(0,170,255,0.12)",
                  color: "#fff",
                }}>▶</div>
              </button>
              <div style={{ padding: "14px" }}>
                <p style={{ fontWeight: 800, fontSize: "12px", lineHeight: 1.4, margin: 0, color: "#E0E0E0" }}>
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

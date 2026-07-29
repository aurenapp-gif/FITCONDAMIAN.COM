"use client";

import { useRef, useState } from "react";

// Reproductor de vídeo nativo con barra de progreso azul que avanza con el vídeo
// (estilo VSL, sin barra de búsqueda para aumentar la retención).
export default function VideoPlayer({ src, poster }: { src: string; poster?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  return (
    <div style={{ position: "relative", cursor: "pointer", lineHeight: 0 }} onClick={toggle}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        preload="metadata"
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          if (v.duration) setProgress((v.currentTime / v.duration) * 100);
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        style={{ width: "100%", height: "auto", display: "block" }}
      />

      {/* Botón de play cuando está pausado */}
      {!playing && (
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          pointerEvents: "none",
        }}>
          <div style={{
            width: "68px", height: "68px", borderRadius: "50%",
            background: "#00AAFF", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "24px", paddingLeft: "5px",
            boxShadow: "0 0 0 12px rgba(0,170,255,0.15)",
          }}>▶</div>
        </div>
      )}

      {/* Barra de progreso (avanza con el vídeo, no permite saltar) */}
      <div aria-hidden="true" style={{
        position: "absolute", left: "8px", right: "8px", bottom: "8px",
        height: "7px", borderRadius: "99px",
        background: "rgba(255,255,255,0.25)", overflow: "hidden",
        pointerEvents: "none",
      }}>
        <div style={{
          height: "100%", width: `${progress}%`, borderRadius: "99px",
          background: "linear-gradient(90deg, #0077CC, #00AAFF)",
          boxShadow: "0 0 8px rgba(0,170,255,0.7)",
          transition: "width 0.2s linear",
        }} />
      </div>
    </div>
  );
}

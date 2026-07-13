"use client";

import { useState } from "react";

const recursos = [
  {
    vol: "01",
    categoria: "DIAGNÓSTICO",
    titulo: "Medidor de Edad-Muscular",
    descripcion:
      "Sabrás en qué punto a nivel muscular te encuentras y qué deberás de hacer para mejorar en el punto en el que estás.",
    linkVideo: "https://youtu.be/0b7aIuPJaKo",
    linkDoc: "https://docs.google.com/document/d/1V7yt1PqsGQ94hrfg0ZvKssG5anq9YQdWChuIUWF29uk/edit?usp=sharing",
  },
  {
    vol: "02",
    categoria: "NUTRICIÓN",
    titulo: "Test Inteligente de Hábitos",
    descripcion:
      "Entiende qué te está haciendo verte flácida, envejecer y perder energía para así poder revertirlo.",
    linkVideo: "https://youtu.be/WFn9kDt3FsA",
    linkDoc: "https://docs.google.com/document/d/1VZ4_MZc70PqgGliHsGplkZ6xoK_r1FdxmZi_1YRyT8I/edit?usp=sharing",
  },
  {
    vol: "03",
    categoria: "ENTRENAMIENTO",
    titulo: "IA Experta en Sistemas",
    descripcion:
      "Crea sistemas infalibles a largo plazo para nunca volver a empeorar tu físico y salud.",
    linkVideo: "https://youtu.be/qZArQavUepk",
    linkDoc: "https://docs.google.com/document/d/1Y9gKtg2GO50LH30e8dKqpp99Y2afHN4GZlgDTZiMInU/edit?usp=sharing",
  },
  {
    vol: "04",
    categoria: "RECUPERACIÓN",
    titulo: "Plan de Ruta Anti Envejecimiento y Flacidez",
    descripcion:
      "Utiliza el plan de ruta que ha llevado a más de 1000 mujeres a conseguir verse más atractivas, eliminar la flacidez y volver a tener energía del método Envejecimiento Revertido.",
    linkVideo: "https://youtu.be/pUwfONeAbuk",
    linkDoc: "https://docs.google.com/document/d/1SWwjWBsRMb1K4SEcLMGYE7ASWvjAkNXOhFFV_1u9qk8/edit?usp=sharing",
  },
  {
    vol: "05",
    categoria: "EXCLUSIVO",
    titulo: "Mapas y Técnicas Filtradas del Programa Exclusivo Envejecimiento Revertido",
    descripcion:
      "Acceso a los mapas y técnicas filtradas del programa exclusivo Envejecimiento Revertido.",
    linkVideo: "#",
    imagen: "/lead-05-laboratorio.jpg",
    linkDoc: "https://docs.google.com/document/d/1xv9LAmY7VfWKhhnN19oRk48FzuM0hssq1NvaXWUAQL4/edit?usp=sharing",
  },
];

const ctaBlock = (
  <div style={{
    background: "#00AAFF",
    borderRadius: "20px",
    padding: "36px 28px",
    textAlign: "center",
  }}>
    <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 10px 0", opacity: 0.8 }}>
      ¿QUIERES IR MÁS RÁPIDO?
    </p>
    <h2 style={{ fontSize: "clamp(1.3rem, 4vw, 1.8rem)", fontWeight: 900, margin: "0 0 10px 0", lineHeight: 1.15, letterSpacing: "-0.5px" }}>
      Agenda una llamada gratuita conmigo
    </h2>
    <p style={{ fontSize: "15px", margin: "0 0 22px 0", opacity: 0.85, lineHeight: 1.5 }}>
      30 minutos. Te digo exactamente qué tienes que hacer según tu caso. Sin rodeos.
    </p>
    <a
      href="/agendar"
      style={{
        display: "inline-block",
        background: "#0D0D0D",
        color: "#fff",
        fontWeight: 900,
        fontSize: "15px",
        padding: "14px 32px",
        borderRadius: "99px",
        textDecoration: "none",
      }}
    >
      Agendar llamada gratuita →
    </a>
    <p style={{ fontSize: "12px", margin: "12px 0 0 0", opacity: 0.65 }}>Sin compromiso · 100% gratuito</p>
  </div>
);

// Extrae el ID de un enlace de YouTube (youtu.be/ID o youtube.com/watch?v=ID) para la miniatura.
function youtubeId(url: string): string | null {
  if (!url || url === "#") return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export default function AccesoRecursosClient() {
  const [videoAbierto, setVideoAbierto] = useState<string | null>(null);

  return (
    <main style={{ background: "#0D0D0D", minHeight: "100vh", color: "#fff", fontFamily: "var(--font-inter), sans-serif" }}>

      {/* MODAL REPRODUCTOR DE VÍDEO */}
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

      {/* HEADER */}
      <header style={{ borderBottom: "1px solid #1f1f1f", padding: "20px 24px", textAlign: "center" }}>
        <p style={{ margin: 0, fontWeight: 900, fontSize: "18px", letterSpacing: "-0.5px" }}>
          Fit con <span style={{ color: "#00AAFF" }}>Damián</span>
        </p>
      </header>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "0 24px" }}>

        {/* HERO */}
        <section style={{ paddingTop: "56px", paddingBottom: "48px" }}>
          <p style={{ color: "#666", fontSize: "11px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "20px" }}>
            RECURSOS GRATUITOS · ACCESO COMPLETO
          </p>

          <h1 style={{ fontSize: "clamp(2.4rem, 8vw, 3.6rem)", fontWeight: 900, lineHeight: 1.05, margin: "0 0 20px 0", letterSpacing: "-1.5px" }}>
            Bienvenido a los{" "}
            <em style={{ fontStyle: "italic", color: "#00AAFF" }}>recursos.</em>
          </h1>

          <p style={{ color: "#A0A0A0", fontSize: "17px", lineHeight: 1.6, margin: "0 0 36px 0" }}>
            Todo el material que necesitas para transformar tu cuerpo.
            Guárdalo antes de cerrar esta página.
          </p>

          {/* Vídeo de bienvenida */}
          <div data-video-placeholder="bienvenida" style={{
            borderRadius: "16px",
            overflow: "hidden",
            background: "#161616",
            aspectRatio: "16/9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #252525",
            marginBottom: "8px",
          }}>
            <div style={{ textAlign: "center", padding: "32px" }}>
              <div aria-hidden="true" style={{ fontSize: "48px", marginBottom: "12px", color: "#00AAFF" }}>▶</div>
              <p style={{ color: "#555", fontSize: "13px", margin: 0 }}>Vídeo de bienvenida — próximamente</p>
            </div>
          </div>
          <p style={{ color: "#444", fontSize: "12px", textAlign: "center", margin: "0 0 32px 0" }}>
            🔊 Activa el sonido
          </p>

          {ctaBlock}
        </section>

        {/* SEPARADOR */}
        <div style={{ borderTop: "1px solid #1f1f1f", marginBottom: "48px" }} />

        {/* CATÁLOGO */}
        <section style={{ paddingBottom: "80px" }}>

          <div style={{ marginBottom: "36px" }}>
            <span style={{
              display: "inline-block",
              border: "1px solid #252525",
              color: "#666",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "2px",
              padding: "6px 14px",
              borderRadius: "99px",
              marginBottom: "16px",
              textTransform: "uppercase",
            }}>
              EL CATÁLOGO
            </span>
            <h2 style={{ fontSize: "clamp(1.8rem, 5vw, 2.4rem)", fontWeight: 900, margin: 0, letterSpacing: "-1px", lineHeight: 1.1 }}>
              Cada recurso,{" "}
              <em style={{ fontStyle: "italic", color: "#00AAFF" }}>tu acceso</em>
              <span style={{ color: "#00AAFF" }}>.</span>
            </h2>
          </div>

          {/* CARDS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {recursos.map((r) => (
              <article
                key={r.vol}
                style={{
                  background: "#111",
                  border: "1px solid #1f1f1f",
                  borderRadius: "16px",
                  overflow: "hidden",
                }}
              >
                {/* Thumbnail: miniatura de YouTube si hay vídeo, si no placeholder */}
                {(() => {
                  const ytId = youtubeId(r.linkVideo);
                  const customImg = (r as { imagen?: string }).imagen;
                  const volBadge = (
                    <span style={{
                      position: "absolute",
                      top: "12px",
                      left: "12px",
                      background: "#00AAFF",
                      color: "#fff",
                      fontSize: "11px",
                      fontWeight: 900,
                      padding: "4px 10px",
                      borderRadius: "99px",
                      letterSpacing: "1px",
                      zIndex: 1,
                    }}>
                      VOL · {r.vol}
                    </span>
                  );
                  const playBtn = (
                    <div aria-hidden="true" style={{
                      width: "56px",
                      height: "56px",
                      background: "#00AAFF",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      paddingLeft: "4px",
                      boxShadow: "0 0 0 10px rgba(0,170,255,0.12)",
                      color: "#fff",
                    }}>
                      ▶
                    </div>
                  );
                  const thumbInner = (
                    <>
                      {volBadge}
                      {playBtn}
                    </>
                  );
                  const baseStyle = {
                    aspectRatio: "16/8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative" as const,
                    borderBottom: "1px solid #1f1f1f",
                  };
                  // Imagen fija (recurso sin vídeo): muestra la imagen sin botón de play.
                  if (!ytId && customImg) {
                    return (
                      <div style={{ ...baseStyle, background: "#161616", overflow: "hidden" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={customImg}
                          alt={r.titulo}
                          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        {volBadge}
                      </div>
                    );
                  }
                  if (ytId) {
                    return (
                      <button
                        type="button"
                        onClick={() => setVideoAbierto(ytId)}
                        aria-label={`Ver el vídeo: ${r.titulo}`}
                        style={{
                          ...baseStyle,
                          width: "100%",
                          background: "#161616",
                          textDecoration: "none",
                          cursor: "pointer",
                          overflow: "hidden",
                          border: "none",
                          padding: 0,
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`}
                          alt={`Miniatura del vídeo: ${r.titulo}`}
                          onError={(e) => {
                            const img = e.currentTarget;
                            if (img.dataset.step === undefined) {
                              // 1er fallo: prueba con la miniatura de menor resolución.
                              img.dataset.step = "1";
                              img.src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
                            } else {
                              // 2º fallo (p. ej. vídeo privado): oculta la imagen y deja el placeholder oscuro.
                              img.style.display = "none";
                            }
                          }}
                          style={{
                            position: "absolute", inset: 0,
                            width: "100%", height: "100%",
                            objectFit: "cover",
                            filter: "brightness(0.8)",
                          }}
                        />
                        {thumbInner}
                      </button>
                    );
                  }
                  return (
                    <div style={{ ...baseStyle, background: "#161616" }}>
                      {thumbInner}
                    </div>
                  );
                })()}

                {/* Contenido */}
                <div style={{ padding: "24px" }}>
                  <p style={{ color: "#555", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 8px 0" }}>
                    VOLUMEN {r.vol} · {r.categoria}
                  </p>
                  <h3 style={{ fontSize: "19px", fontWeight: 900, margin: "0 0 10px 0", lineHeight: 1.2, letterSpacing: "-0.5px" }}>
                    {r.titulo}
                  </h3>
                  <p style={{ color: "#A0A0A0", fontSize: "14px", lineHeight: 1.6, margin: "0 0 20px 0" }}>
                    {r.descripcion}
                  </p>

                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {youtubeId(r.linkVideo) && (
                      <button
                        type="button"
                        onClick={() => setVideoAbierto(youtubeId(r.linkVideo)!)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          background: "#00AAFF",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "14px",
                          padding: "11px 20px",
                          borderRadius: "99px",
                          border: "none",
                          fontFamily: "inherit",
                          cursor: "pointer",
                        }}
                      >
                        ▶ Ver el vídeo
                      </button>
                    )}
                    <a
                      href={r.linkDoc !== "#" ? r.linkDoc : undefined}
                      onClick={r.linkDoc === "#" ? (e) => e.preventDefault() : undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-disabled={r.linkDoc === "#"}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "transparent",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "14px",
                        padding: "11px 20px",
                        borderRadius: "99px",
                        textDecoration: "none",
                        border: r.linkDoc !== "#" ? "1px solid #555" : "1px solid #2a2a2a",
                        opacity: r.linkDoc === "#" ? 0.4 : 1,
                        cursor: r.linkDoc === "#" ? "not-allowed" : "pointer",
                      }}
                    >
                      Abrir documento ↗
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div style={{ marginTop: "32px" }}>{ctaBlock}</div>
        </section>

      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #1f1f1f", padding: "28px 24px", textAlign: "center" }}>
        <p style={{ color: "#444", fontSize: "12px", margin: 0 }}>
          © {new Date().getFullYear()} Fit con Damián · fitcondamian.com
          {" · "}
          <a href="/privacidad" style={{ color: "#444", textDecoration: "none" }}>Privacidad</a>
          {" · "}
          <a href="/aviso-legal" style={{ color: "#444", textDecoration: "none" }}>Aviso Legal</a>
        </p>
      </footer>
    </main>
  );
}

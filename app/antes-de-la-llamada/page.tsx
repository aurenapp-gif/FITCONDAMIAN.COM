import type { Metadata } from "next";
import VslTimeline from "../_components/VslTimeline";

export const metadata: Metadata = {
  title: "Antes de tu llamada",
  robots: { index: false, follow: false },
};

const testimonios = [
  { nombre: "Carlos M.", texto: "En 3 meses bajé 12 kg sin pasar hambre. El método de Damián cambia la perspectiva completamente.", resultado: "-12 kg en 3 meses" },
  { nombre: "Laura P.", texto: "Nunca había conseguido mantener los resultados. Con Damián por fin entendí cómo funciona mi cuerpo.", resultado: "Resultados duraderos" },
  { nombre: "Sergio R.", texto: "Pensaba que a mis 45 años ya no podía transformar mi cuerpo. Me equivocaba totalmente.", resultado: "Transformación total" },
];

export default function AntesDeLaLlamadaPage() {
  return (
    <main style={{ background: "#0D0D0D", minHeight: "100vh", color: "#fff", fontFamily: "var(--font-inter), sans-serif", display: "flex", flexDirection: "column" }}>

      {/* HEADER */}
      <header style={{ borderBottom: "1px solid #1f1f1f", padding: "20px 24px", textAlign: "center" }}>
        <p style={{ margin: 0, fontWeight: 900, fontSize: "18px", letterSpacing: "-0.5px" }}>
          Fit con <span style={{ color: "#00AAFF" }}>Damián</span>
        </p>
      </header>

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "0 20px 80px", width: "100%" }}>

        {/* VÍDEO PREVIO A LA LLAMADA */}
        <div style={{ marginTop: "36px", marginBottom: "48px" }}>
          <h1 style={{ fontWeight: 900, fontSize: "clamp(1.6rem, 5vw, 2.2rem)", margin: "0 0 16px 0", lineHeight: 1.15, letterSpacing: "-0.5px" }}>
            Mira Este Vídeo de 3 Minutos Antes de la Llamada
          </h1>
          {/* Vídeo previo a la llamada */}
          <div style={{
            borderRadius: "16px", overflow: "hidden",
            background: "#000", border: "1px solid #1f1f1f",
            position: "relative",
          }}>
            <video
              src="/paso3-video.mp4"
              poster="/paso3-video-poster.jpg"
              controls
              playsInline
              preload="metadata"
              style={{ width: "100%", height: "auto", display: "block" }}
            />
            <div style={{
              position: "absolute", top: "14px", right: "14px",
              background: "#00AAFF", color: "#fff",
              fontSize: "11px", fontWeight: 900, padding: "4px 12px",
              borderRadius: "99px", letterSpacing: "1px", zIndex: 1,
              pointerEvents: "none",
            }}>3 MIN</div>
          </div>
        </div>

        {/* SEPARADOR TIMELINE */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ borderTop: "1px solid #1f1f1f", marginBottom: "24px" }} />
          <p style={{ color: "#AAAAAA", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 8px 0" }}>
            MIENTRAS ESPERAS LA LLAMADA
          </p>
          <p style={{ color: "#999", fontSize: "14px", margin: 0 }}>Mira estos vídeos para aprovechar al máximo nuestra sesión</p>
        </div>

        {/* TIMELINE DE VÍDEOS VSL */}
        <VslTimeline />

        {/* SEPARADOR TESTIMONIOS */}
        <div style={{ borderTop: "1px solid #1f1f1f", marginBottom: "40px" }} />
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <p style={{ color: "#AAAAAA", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 8px 0" }}>
            RESULTADOS REALES
          </p>
          <h3 style={{ fontWeight: 900, fontSize: "clamp(1.4rem, 4vw, 1.8rem)", margin: 0, letterSpacing: "-0.5px" }}>
            Lo que dicen quienes ya lo han hecho
          </h3>
        </div>

        {/* TESTIMONIOS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "48px" }}>
          {testimonios.map((t) => (
            <div key={t.nombre} style={{
              background: "#111", border: "1px solid #1f1f1f",
              borderRadius: "16px", padding: "22px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <p style={{ fontWeight: 900, fontSize: "15px", margin: 0 }}>{t.nombre}</p>
                <span style={{
                  background: "rgba(0,170,255,0.1)", border: "1px solid rgba(0,170,255,0.25)",
                  color: "#00AAFF", fontSize: "11px", fontWeight: 700,
                  padding: "4px 10px", borderRadius: "99px", whiteSpace: "nowrap",
                }}>{t.resultado}</span>
              </div>
              <p style={{ color: "#D8D8D8", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
                &quot;{t.texto}&quot;
              </p>
            </div>
          ))}
        </div>

      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #1f1f1f", padding: "24px", textAlign: "center" }}>
        <p style={{ color: "#444", fontSize: "12px", margin: 0 }}>
          © {new Date().getFullYear()} Fit con Damián · fitcondamian.com
        </p>
      </footer>
    </main>
  );
}

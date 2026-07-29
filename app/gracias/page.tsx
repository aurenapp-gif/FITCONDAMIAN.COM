import type { Metadata } from "next";
import Image from "next/image";
import VslTimeline from "../_components/VslTimeline";
import VideoPlayer from "../_components/VideoPlayer";

export const metadata: Metadata = {
  title: "¡Llamada reservada!",
  robots: { index: false, follow: false },
};

// Testimonios en vídeo (YouTube). Para añadir más, añade su ID aquí.
const testimoniosVideo = [
  "wnaKW0mFnHw",
];

export default function GraciasPage() {
  return (
    <main style={{ background: "#0D0D0D", minHeight: "100vh", color: "#fff", fontFamily: "var(--font-inter), sans-serif", display: "flex", flexDirection: "column" }}>

      {/* HEADER */}
      <header style={{ borderBottom: "1px solid #1f1f1f", padding: "20px 24px", textAlign: "center" }}>
        <p style={{ margin: 0, fontWeight: 900, fontSize: "18px", letterSpacing: "-0.5px" }}>
          Fit con <span style={{ color: "#00AAFF" }}>Damián</span>
        </p>
      </header>

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "0 20px 80px", width: "100%" }}>

        {/* BARRA DE PROGRESO */}
        <div style={{ paddingTop: "36px", marginBottom: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#AAAAAA", letterSpacing: "1px", textTransform: "uppercase" }}>Progreso de confirmación</span>
            <span style={{ fontSize: "13px", fontWeight: 900, color: "#FF3B30" }}>80%</span>
          </div>
          <div style={{ background: "#1a1a1a", borderRadius: "99px", height: "10px", overflow: "hidden" }}>
            <div style={{ width: "80%", height: "100%", background: "linear-gradient(90deg, #00AAFF, #0077CC)", borderRadius: "99px" }} />
          </div>

          {/* AVISO IMPORTANTE */}
          <div style={{
            marginTop: "20px",
            background: "rgba(255,59,48,0.08)", border: "1px solid rgba(255,59,48,0.3)",
            borderRadius: "14px", padding: "16px 20px",
            display: "flex", gap: "12px", alignItems: "center",
          }}>
            <span style={{ fontSize: "22px", flexShrink: 0 }}>⚠️</span>
            <div>
              <p style={{ fontWeight: 900, fontSize: "15px", color: "#FF3B30", margin: "0 0 2px 0" }}>
                IMPORTANTE: Tu llamada No Está Confirmada
              </p>
              <p style={{ color: "#D8D8D8", fontSize: "13px", margin: 0, lineHeight: 1.5 }}>
                Completa los pasos de abajo para asegurar tu plaza.
              </p>
            </div>
          </div>
        </div>

        {/* PASO 1 */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", gap: "14px", alignItems: "center", marginBottom: "16px" }}>
            <span style={{
              flexShrink: 0, width: "36px", height: "36px",
              background: "#00AAFF", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: "16px", color: "#fff",
            }}>1</span>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(1.2rem, 4vw, 1.5rem)", margin: 0, lineHeight: 1.2 }}>
              Mira Este Vídeo Corto
            </h2>
          </div>
          {/* Vídeo paso 1 */}
          <div style={{
            borderRadius: "16px", overflow: "hidden",
            background: "#000", border: "1px solid #1f1f1f",
          }}>
            <VideoPlayer src="/paso1-gracias.mp4" poster="/paso1-gracias-poster.jpg" />
          </div>
        </div>

        {/* PASO 2 */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", gap: "14px", alignItems: "center", marginBottom: "16px" }}>
            <span style={{
              flexShrink: 0, width: "36px", height: "36px",
              background: "#00AAFF", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: "16px", color: "#fff",
            }}>2</span>
            <div>
              <h2 style={{ fontWeight: 900, fontSize: "clamp(1.2rem, 4vw, 1.5rem)", margin: "0 0 2px 0", lineHeight: 1.2 }}>
                Confirma la Llamada en el Email
              </h2>
              <p style={{ color: "#FF3B30", fontSize: "13px", fontWeight: 700, margin: 0 }}>
                (Revisa la carpeta de Spam / Promociones)
              </p>
            </div>
          </div>

          <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: "16px", padding: "24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <span style={{ color: "#00AAFF", fontWeight: 900, flexShrink: 0, fontSize: "15px" }}>→</span>
                <p style={{ color: "#D8D8D8", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
                  Busca en tu email por: <strong style={{ color: "#fff" }}>Damián</strong> o <strong style={{ color: "#fff" }}>Fit con Damián</strong>
                </p>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <span style={{ color: "#00AAFF", fontWeight: 900, flexShrink: 0, fontSize: "15px" }}>→</span>
                <p style={{ color: "#D8D8D8", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
                  Haz clic en <strong style={{ color: "#00AAFF" }}>&quot;Añadir al calendario&quot;</strong> y luego <strong style={{ color: "#fff" }}>&quot;Sí&quot;</strong> a la invitación de calendario
                </p>
              </div>
            </div>

            {/* Imagen email de confirmación */}
            <div style={{ marginTop: "20px", borderRadius: "12px", overflow: "hidden", border: "1px solid #252525", position: "relative" }}>
              <Image
                src="/confirmar-calendario.png"
                alt="Dónde hacer clic para confirmar la llamada en el email"
                width={980}
                height={520}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
          </div>
        </div>

        {/* PASO 3 */}
        <div style={{ marginBottom: "48px" }}>
          <div style={{ display: "flex", gap: "14px", alignItems: "center", marginBottom: "16px" }}>
            <span style={{
              flexShrink: 0, width: "36px", height: "36px",
              background: "#00AAFF", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: "16px", color: "#fff",
            }}>3</span>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(1.2rem, 4vw, 1.5rem)", margin: 0, lineHeight: 1.2 }}>
              Mira Este Vídeo de 3 Minutos Antes de la Llamada
            </h2>
          </div>
          {/* Vídeo paso 3 */}
          <div style={{
            borderRadius: "16px", overflow: "hidden",
            background: "#000", border: "1px solid #1f1f1f",
            position: "relative",
          }}>
            <VideoPlayer src="/paso3-video.mp4" poster="/paso3-video-poster.jpg" />
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

        {/* TESTIMONIOS EN VÍDEO */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "48px" }}>
          {testimoniosVideo.map((id, i) => (
            <div key={id} style={{
              position: "relative", aspectRatio: "16/9",
              borderRadius: "16px", overflow: "hidden",
              border: "1px solid #1f1f1f", background: "#000",
            }}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`}
                title={`Testimonio en vídeo ${i + 1}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
              />
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

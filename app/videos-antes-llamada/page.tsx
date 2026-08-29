import type { Metadata } from "next";
import TransformacionesCarrusel from "../_components/TransformacionesCarrusel";

export const metadata: Metadata = {
  title: "Vídeos antes de la llamada",
  robots: { index: false, follow: false },
};

// Casos de éxito en vídeo (YouTube). Para añadir más, añade su ID aquí.
const casosExito = [
  "wnaKW0mFnHw",
  "hrVa6H6ankg",
  "E8AU7yjUHGA",
];

export default function VideosAntesLlamadaPage() {
  return (
    <main style={{ background: "#0D0D0D", minHeight: "100vh", color: "#fff", fontFamily: "var(--font-inter), sans-serif", display: "flex", flexDirection: "column" }}>

      {/* HEADER */}
      <header style={{ borderBottom: "1px solid #1f1f1f", padding: "20px 24px", textAlign: "center" }}>
        <p style={{ margin: 0, fontWeight: 900, fontSize: "18px", letterSpacing: "-0.5px" }}>
          Fit con <span style={{ color: "#00AAFF" }}>Damián</span>
        </p>
      </header>

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "0 20px 80px", width: "100%" }}>

        {/* TITULAR */}
        <div style={{ textAlign: "center", paddingTop: "48px", marginBottom: "36px" }}>
          <p style={{ color: "#00AAFF", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 12px 0" }}>
            ANTES DE NUESTRA LLAMADA
          </p>
          <h1 style={{ fontWeight: 900, fontSize: "clamp(1.8rem, 6vw, 2.6rem)", margin: "0 0 12px 0", lineHeight: 1.15, letterSpacing: "-1px" }}>
            Estos son los vídeos que tienes que ver antes de la llamada
          </h1>
          <p style={{ color: "#AAAAAA", fontSize: "15px", margin: 0, lineHeight: 1.6 }}>
            Míralos con calma: son casos reales de personas que ya lo han conseguido. Te van a ayudar a aprovechar al máximo nuestra sesión.
          </p>
        </div>

        {/* CASOS DE ÉXITO EN VÍDEO */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "48px" }}>
          {casosExito.map((id, i) => (
            <div key={id} style={{
              position: "relative", aspectRatio: "16/9",
              borderRadius: "16px", overflow: "hidden",
              border: "1px solid #1f1f1f", background: "#000",
            }}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`}
                title={`Caso de éxito ${i + 1}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
              />
            </div>
          ))}
        </div>

        {/* CARRUSEL DE TRANSFORMACIONES */}
        <TransformacionesCarrusel />

      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #1f1f1f", padding: "24px", textAlign: "center", marginTop: "auto" }}>
        <p style={{ color: "#444", fontSize: "12px", margin: 0 }}>
          © {new Date().getFullYear()} Fit con Damián · fitcondamian.com
        </p>
      </footer>
    </main>
  );
}

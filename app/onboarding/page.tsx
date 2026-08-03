import type { Metadata } from "next";
import OnboardingClient from "./OnboardingClient";

// Página post-pago: NO se indexa bajo ningún concepto.
export const metadata: Metadata = {
  title: "Bienvenido · Tus primeros pasos",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function OnboardingPage() {
  return (
    <main
      style={{
        background: "#0D0D0D",
        minHeight: "100vh",
        color: "#fff",
        fontFamily: "var(--font-inter), sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER */}
      <header style={{ borderBottom: "1px solid #1f1f1f", padding: "20px 24px", textAlign: "center" }}>
        <p style={{ margin: 0, fontWeight: 900, fontSize: "18px", letterSpacing: "-0.5px" }}>
          Fit con <span style={{ color: "#00AAFF" }}>Damián</span>
        </p>
      </header>

      {/* HERO DE BIENVENIDA */}
      <div style={{ textAlign: "center", padding: "44px 20px 8px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(34,169,87,0.12)",
            border: "1px solid rgba(34,169,87,0.4)",
            color: "#22A957",
            fontSize: "12px",
            fontWeight: 900,
            letterSpacing: "1px",
            textTransform: "uppercase",
            padding: "7px 16px",
            borderRadius: "99px",
            marginBottom: "18px",
          }}
        >
          ✓ Pago confirmado
        </div>
        <h1
          style={{
            fontWeight: 900,
            fontSize: "clamp(1.8rem, 6vw, 2.6rem)",
            margin: "0 auto 12px",
            lineHeight: 1.15,
            letterSpacing: "-1px",
            maxWidth: "560px",
          }}
        >
          ¡Bienvenido! Vamos a dejarlo <span style={{ color: "#00AAFF" }}>todo listo</span>
        </h1>
        <p style={{ color: "#AAAAAA", fontSize: "15px", margin: "0 auto", maxWidth: "480px", lineHeight: 1.6 }}>
          Mira el vídeo y completa los 3 pasos de abajo para activar todos tus accesos.
        </p>
      </div>

      <OnboardingClient />

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #1f1f1f", padding: "24px", textAlign: "center", marginTop: "auto" }}>
        <p style={{ color: "#444", fontSize: "12px", margin: 0 }}>
          © {new Date().getFullYear()} Fit con Damián · fitcondamian.com
        </p>
      </footer>
    </main>
  );
}

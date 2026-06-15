import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "¡Llamada confirmada!",
  robots: { index: false, follow: false },
};

const pasos = [
  { num: "1", titulo: "Revisa tu correo", desc: "Te hemos enviado un email con todos los detalles de la llamada y el link de videollamada." },
  { num: "2", titulo: "Añádela a tu calendario", desc: "Haz clic en el enlace del email para añadir la cita a Google Calendar o iCal y no olvidarte." },
  { num: "3", titulo: "Prepara tus dudas", desc: "Anota qué has intentado hasta ahora, cuál es tu objetivo y qué te frena. Así aprovechamos mejor el tiempo." },
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

      <div style={{ flex: 1, maxWidth: "520px", margin: "0 auto", padding: "48px 24px 80px", width: "100%" }}>

        {/* ICON + HEADLINE */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            width: "88px", height: "88px",
            background: "rgba(255,92,0,0.1)", border: "2px solid rgba(255,92,0,0.25)",
            borderRadius: "50%", display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 24px", fontSize: "40px",
          }}>✅</div>
          <h1 style={{ fontSize: "clamp(2rem, 7vw, 2.8rem)", fontWeight: 900, lineHeight: 1.05, margin: "0 0 12px 0", letterSpacing: "-1px" }}>
            ¡Llamada confirmada!
          </h1>
          <p style={{ color: "#A0A0A0", fontSize: "17px", margin: 0, lineHeight: 1.5 }}>
            Nos vemos pronto. Estoy deseando conocer tu caso y ayudarte.
          </p>
        </div>

        {/* PASOS */}
        <div style={{
          background: "#111", border: "1px solid #1f1f1f",
          borderRadius: "20px", padding: "28px", marginBottom: "20px",
        }}>
          <p style={{ color: "#888", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 20px 0" }}>
            QUÉ HACER AHORA
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {pasos.map((p) => (
              <div key={p.num} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <span style={{
                  flexShrink: 0, width: "28px", height: "28px",
                  background: "#00AAFF", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 900, fontSize: "13px", color: "#fff",
                }}>{p.num}</span>
                <div>
                  <p style={{ fontWeight: 800, fontSize: "15px", margin: "0 0 4px 0" }}>{p.titulo}</p>
                  <p style={{ color: "#888", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RECURSOS */}
        <div style={{
          background: "#00AAFF", borderRadius: "20px",
          padding: "28px", textAlign: "center", marginBottom: "20px",
        }}>
          <p style={{ fontSize: "13px", fontWeight: 700, margin: "0 0 8px 0", opacity: 0.85 }}>
            Mientras tanto
          </p>
          <p style={{ fontSize: "17px", fontWeight: 900, margin: "0 0 20px 0", lineHeight: 1.2 }}>
            Accede a los recursos gratuitos
          </p>
          <Link href="/acceso-recursos" style={{
            display: "inline-block", background: "#0D0D0D", color: "#fff",
            fontWeight: 900, fontSize: "15px", padding: "13px 28px",
            borderRadius: "99px", textDecoration: "none",
          }}>
            Ver recursos →
          </Link>
        </div>

        {/* RRSS */}
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#555", fontSize: "13px", margin: "0 0 14px 0" }}>Sígueme para más contenido gratuito:</p>
          <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
            {/* 👉 Reemplaza los # con tus links reales */}
            <a href="#" target="_blank" rel="noopener noreferrer" style={{
              padding: "10px 22px", background: "#111", border: "1px solid #2a2a2a",
              color: "#fff", borderRadius: "99px", fontSize: "14px",
              fontWeight: 700, textDecoration: "none",
            }}>Instagram</a>
            <a href="#" target="_blank" rel="noopener noreferrer" style={{
              padding: "10px 22px", background: "#00AAFF",
              color: "#fff", borderRadius: "99px", fontSize: "14px",
              fontWeight: 700, textDecoration: "none", border: "none",
            }}>YouTube</a>
          </div>
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

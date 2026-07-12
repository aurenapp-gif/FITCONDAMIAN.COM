import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agenda tu Llamada Gratuita",
  description: "Reserva una llamada estratégica gratuita de 30 minutos. Te digo exactamente qué necesitas para transformar tu cuerpo.",
  robots: { index: false, follow: false },
};

export default function AgendarPage() {
  return (
    <main style={{ background: "#0D0D0D", minHeight: "100vh", color: "#fff", fontFamily: "var(--font-inter), sans-serif" }}>

      {/* HEADER */}
      <header style={{ borderBottom: "1px solid #1f1f1f", padding: "20px 24px", textAlign: "center" }}>
        <p style={{ margin: 0, fontWeight: 900, fontSize: "18px", letterSpacing: "-0.5px" }}>
          Fit con <span style={{ color: "#00AAFF" }}>Damián</span>
        </p>
      </header>

      {/* BANNER — público objetivo */}
      <div style={{
        background: "linear-gradient(90deg, #0077CC, #00AAFF)",
        padding: "14px 24px",
        textAlign: "center",
      }}>
        <p style={{
          margin: 0,
          color: "#fff",
          fontSize: "clamp(13px, 3.4vw, 15px)",
          fontWeight: 900,
          lineHeight: 1.45,
          letterSpacing: "-0.3px",
        }}>
          Para mujeres que ya no se ven atractivas, han desarrollado flacidez y ya no se sienten joven
        </p>
      </div>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "0 24px 80px" }}>

        {/* BADGE */}
        <div style={{ textAlign: "center", paddingTop: "48px", marginBottom: "24px" }}>
          <span style={{
            display: "inline-block",
            background: "rgba(0,170,255,0.1)", border: "1px solid rgba(0,170,255,0.25)",
            color: "#00AAFF", fontWeight: 700, fontSize: "13px",
            padding: "8px 18px", borderRadius: "99px",
          }}>
            📞 30 minutos · 100% Gratuito · Sin compromiso
          </span>
        </div>

        {/* HEADLINE */}
        <h1 style={{ fontSize: "clamp(2.2rem, 7vw, 3.2rem)", fontWeight: 900, textAlign: "center", lineHeight: 1.05, margin: "0 0 40px 0", letterSpacing: "-1.5px" }}>
          Agenda tu llamada{" "}
          <em style={{ fontStyle: "italic", color: "#00AAFF" }}>estratégica gratuita</em>
        </h1>

        {/* SEPARADOR */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <p style={{ color: "#888", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 6px 0" }}>
            ELIGE TU HORARIO
          </p>
          <p style={{ color: "#555", fontSize: "13px", margin: 0 }}>Selecciona el día y la hora que mejor te venga</p>
        </div>

        {/* GHL CALENDAR EMBED */}
        <div style={{ borderRadius: "20px", border: "1px solid #1f1f1f", marginBottom: "36px" }}>
          <iframe
            src="https://links.fitcondamian.com/widget/bookings/reserva-de-llamada-1a1-damian"
            style={{ width: "100%", height: "1000px", border: "none", display: "block", borderRadius: "20px" }}
            title="Reserva tu llamada con Damián"
            loading="lazy"
          />
        </div>

      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #1f1f1f", padding: "24px", textAlign: "center" }}>
        <p style={{ color: "#444", fontSize: "12px", margin: 0 }}>
          © {new Date().getFullYear()} Fit con Damián · fitcondamian.com{" · "}
          <a href="/privacidad" style={{ color: "#444", textDecoration: "none" }}>Privacidad</a>{" · "}
          <a href="/politica-cookies" style={{ color: "#444", textDecoration: "none" }}>Cookies</a>{" · "}
          <a href="/aviso-legal" style={{ color: "#444", textDecoration: "none" }}>Aviso Legal</a>
        </p>
      </footer>
    </main>
  );
}

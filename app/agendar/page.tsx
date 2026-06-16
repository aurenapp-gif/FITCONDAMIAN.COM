import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agenda tu Llamada Gratuita",
  description: "Reserva una llamada estratégica gratuita de 30 minutos. Te digo exactamente qué necesitas para transformar tu cuerpo.",
  robots: { index: false, follow: false },
};

const beneficios = [
  { emoji: "🎯", texto: "Análisis personalizado de tu situación actual" },
  { emoji: "🗺️", texto: "Un plan de acción concreto para las próximas 4 semanas" },
  { emoji: "❓", texto: "Respuestas a todas tus dudas sobre nutrición y entrenamiento" },
  { emoji: "🚫", texto: "Sin presión de venta — solo valor real" },
];

export default function AgendarPage() {
  return (
    <main style={{ background: "#0D0D0D", minHeight: "100vh", color: "#fff", fontFamily: "var(--font-inter), sans-serif" }}>

      {/* HEADER */}
      <header style={{ borderBottom: "1px solid #1f1f1f", padding: "20px 24px", textAlign: "center" }}>
        <p style={{ margin: 0, fontWeight: 900, fontSize: "18px", letterSpacing: "-0.5px" }}>
          Fit con <span style={{ color: "#00AAFF" }}>Damián</span>
        </p>
      </header>

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
        <h1 style={{ fontSize: "clamp(2.2rem, 7vw, 3.2rem)", fontWeight: 900, textAlign: "center", lineHeight: 1.05, margin: "0 0 16px 0", letterSpacing: "-1.5px" }}>
          Agenda tu llamada{" "}
          <em style={{ fontStyle: "italic", color: "#00AAFF" }}>estratégica gratuita</em>
        </h1>

        <p style={{ color: "#A0A0A0", fontSize: "17px", textAlign: "center", lineHeight: 1.6, margin: "0 0 40px 0" }}>
          En 30 minutos te digo exactamente qué necesitas cambiar para empezar a ver resultados.
          Sin rodeos. Sin venderme.
        </p>

        {/* BENEFICIOS */}
        <div style={{
          background: "#111", border: "1px solid #1f1f1f",
          borderRadius: "20px", padding: "28px", marginBottom: "36px",
        }}>
          <p style={{ color: "#888", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 20px 0" }}>
            EN ESTA LLAMADA VAS A CONSEGUIR
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {beneficios.map((b) => (
              <div key={b.texto} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={{ fontSize: "22px", flexShrink: 0 }}>{b.emoji}</span>
                <span style={{ color: "#C0C0C0", fontSize: "15px", lineHeight: 1.5 }}>{b.texto}</span>
              </div>
            ))}
          </div>
        </div>

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

        {/* BIO */}
        <div style={{
          display: "flex", gap: "16px", alignItems: "flex-start",
          background: "#111", border: "1px solid #1f1f1f",
          borderRadius: "20px", padding: "24px",
        }}>
          <div style={{
            width: "52px", height: "52px", flexShrink: 0,
            background: "#00AAFF", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: "20px", color: "#fff",
          }}>D</div>
          <div>
            <p style={{ fontWeight: 900, fontSize: "16px", margin: "0 0 6px 0" }}>Damián</p>
            <p style={{ color: "#888", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
              Entrenador personal y nutricionista. Más de X años transformando cuerpos
              con un método basado en la ciencia y adaptado a la vida real.
              {/* 👉 Personaliza esta bio con tu info real */}
            </p>
          </div>
        </div>

        {/* TESTIMONIOS EN VÍDEO */}
        <div style={{ marginTop: "56px" }}>
          <div style={{ borderTop: "1px solid #1f1f1f", marginBottom: "40px" }} />

          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <p style={{ color: "#AAAAAA", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 10px 0" }}>
              RESULTADOS REALES
            </p>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(1.6rem, 5vw, 2.2rem)", margin: 0, letterSpacing: "-1px", lineHeight: 1.1 }}>
              Lo que dicen quienes ya{" "}
              <em style={{ fontStyle: "italic", color: "#00AAFF" }}>han pasado por aquí</em>
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[1, 2, 3].map((n) => (
              {/* TODO: reemplaza este bloque con <iframe> de YouTube/Vimeo cuando tengas el vídeo */}
              <div key={n} data-video-placeholder={`testimonio-${n}`} style={{
                background: "#111", border: "1px solid #1f1f1f",
                borderRadius: "16px", overflow: "hidden",
              }}>
                <div style={{
                  aspectRatio: "16/9",
                  background: "#161616",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative",
                  borderBottom: "1px solid #1f1f1f",
                }}>
                  <span style={{
                    position: "absolute", top: "12px", left: "12px",
                    background: "rgba(0,0,0,0.6)", color: "#fff",
                    fontSize: "11px", fontWeight: 700,
                    padding: "4px 10px", borderRadius: "99px",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}>Testimonio {n}</span>
                  <div aria-hidden="true" style={{
                    width: "52px", height: "52px",
                    background: "#00AAFF", borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "20px", paddingLeft: "4px",
                    boxShadow: "0 0 0 10px rgba(0,170,255,0.12)",
                    color: "#fff",
                  }}>▶</div>
                </div>
                {/* Pie */}
                <div style={{ padding: "16px 20px" }}>
                  <p style={{ fontWeight: 800, fontSize: "14px", margin: "0 0 4px 0" }}>Testimonio en vídeo {n}</p>
                  <p style={{ color: "#999", fontSize: "13px", margin: 0 }}>Próximamente</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #1f1f1f", padding: "24px", textAlign: "center" }}>
        <p style={{ color: "#444", fontSize: "12px", margin: 0 }}>
          © {new Date().getFullYear()} Fit con Damián · fitcondamian.com{" · "}
          <a href="/privacidad" style={{ color: "#444", textDecoration: "none" }}>Privacidad</a>{" · "}
          <a href="/aviso-legal" style={{ color: "#444", textDecoration: "none" }}>Aviso Legal</a>
        </p>
      </footer>
    </main>
  );
}

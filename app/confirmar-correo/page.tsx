import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Confirma tu correo",
  robots: { index: false, follow: false },
};

export default function ConfirmarCorreoPage() {
  return (
    <main style={{ background: "#0D0D0D", minHeight: "100vh", color: "#fff", fontFamily: "var(--font-inter), sans-serif", display: "flex", flexDirection: "column" }}>

      {/* HEADER */}
      <header style={{ borderBottom: "1px solid #1f1f1f", padding: "20px 24px", textAlign: "center" }}>
        <p style={{ margin: 0, fontWeight: 900, fontSize: "18px", letterSpacing: "-0.5px" }}>
          Fit con <span style={{ color: "#00AAFF" }}>Damián</span>
        </p>
      </header>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        <div style={{ maxWidth: "480px", width: "100%", textAlign: "center" }}>

          {/* ICON */}
          <div style={{
            width: "88px", height: "88px",
            background: "rgba(0,170,255,0.1)",
            border: "2px solid rgba(0,170,255,0.25)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 28px",
            fontSize: "40px",
          }}>
            📧
          </div>

          {/* HEADLINE */}
          <h1 style={{ fontSize: "clamp(2rem, 7vw, 2.8rem)", fontWeight: 900, lineHeight: 1.05, margin: "0 0 12px 0", letterSpacing: "-1px" }}>
            ¡Un paso más!
          </h1>
          <p style={{ color: "#00AAFF", fontSize: "18px", fontWeight: 700, margin: "0 0 36px 0" }}>
            Revisa tu correo electrónico
          </p>

          {/* PASOS */}
          <div style={{
            background: "#111", border: "1px solid #1f1f1f",
            borderRadius: "20px", padding: "28px", textAlign: "left", marginBottom: "20px",
          }}>
            <p style={{ color: "#888", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 20px 0" }}>
              QUÉ TIENES QUE HACER AHORA
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {[
                { n: "1", texto: <>Abre el correo que te acabamos de enviar (revisa también <strong style={{ color: "#fff" }}>Spam</strong> o <strong style={{ color: "#fff" }}>Promociones</strong>)</> },
                { n: "2", texto: <>Haz clic en el botón <strong style={{ color: "#00AAFF" }}>&quot;Acceder a los recursos&quot;</strong></> },
                { n: "3", texto: <>Entrarás directamente a todos los recursos gratuitos</> },
              ].map(({ n, texto }) => (
                <div key={n} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                  <span style={{
                    flexShrink: 0, width: "28px", height: "28px",
                    background: "#00AAFF", borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 900, fontSize: "13px", color: "#fff",
                  }}>{n}</span>
                  <p style={{ color: "#A0A0A0", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>{texto}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AVISO SPAM */}
          <div style={{
            background: "rgba(0,170,255,0.08)", border: "1px solid rgba(0,170,255,0.2)",
            borderRadius: "14px", padding: "16px 20px", marginBottom: "28px",
          }}>
            <p style={{ color: "#A0A0A0", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>
              <strong style={{ color: "#00AAFF" }}>¿No encuentras el correo?</strong> A veces tarda 1-2 minutos.
              Busca un email de <strong style={{ color: "#fff" }}>Damián</strong> en Spam o Promociones
              y márcalo como &quot;No es spam&quot;.
            </p>
          </div>

          {/* VOLVER */}
          <Link href="/recursos" style={{ color: "#555", fontSize: "13px", textDecoration: "underline", textUnderlineOffset: "3px" }}>
            ← Volver a la página de recursos
          </Link>

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

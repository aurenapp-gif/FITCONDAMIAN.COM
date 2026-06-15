import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tus Recursos Gratuitos",
  robots: { index: false, follow: false },
};

// 👉 Cuando tengas los links reales, reemplaza los "#" por tus URLs
// linkVideo → YouTube, Vimeo, etc.
// linkDoc   → Google Drive, Word Online, Boardmix, Notion, PDF...
const recursos = [
  {
    vol: "01",
    categoria: "ENTRENAMIENTO",
    titulo: "Rutina de Entrenamiento Express",
    descripcion:
      "30 minutos al día, 3 veces por semana. El programa exacto que uso con mis clientes para transformar el cuerpo sin vivir en el gimnasio.",
    linkVideo: "#",
    linkDoc: "#",
  },
  {
    vol: "02",
    categoria: "NUTRICIÓN",
    titulo: "Guía de Nutrición Sin Dietas",
    descripcion:
      "El sistema de alimentación que funciona. Pierde grasa sin pasar hambre ni contar calorías. El mismo método que aplico con mis clientes de pago.",
    linkVideo: "#",
    linkDoc: "#",
  },
  {
    vol: "03",
    categoria: "DIAGNÓSTICO",
    titulo: "Diagnóstico de Composición Corporal",
    descripcion:
      "Descubre en 3 minutos exactamente dónde estás y qué tienes que cambiar para empezar a ver resultados de verdad.",
    linkVideo: "#",
    linkDoc: "#",
  },
  {
    vol: "04",
    categoria: "RECUPERACIÓN",
    titulo: "Protocolo de Recuperación",
    descripcion:
      "El factor oculto que sabotea tus resultados. La guía de descanso y recuperación que nadie te cuenta pero que lo cambia todo.",
    linkVideo: "#",
    linkDoc: "#",
  },
];

export default function AccesoRecursosPage() {
  return (
    <main style={{ background: "#0D0D0D", minHeight: "100vh", color: "#fff", fontFamily: "var(--font-inter), sans-serif" }}>

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

          {/* VIDEO — 👉 Reemplaza este bloque con tu iframe de YouTube/Vimeo cuando lo tengas */}
          <div style={{
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
              <div style={{ fontSize: "48px", marginBottom: "12px", color: "#00AAFF" }}>▶</div>
              <p style={{ color: "#555", fontSize: "13px", margin: 0 }}>Vídeo de bienvenida — próximamente</p>
            </div>
          </div>
          <p style={{ color: "#444", fontSize: "12px", textAlign: "center", margin: "0 0 0 0" }}>
            🔊 Activa el sonido
          </p>
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
                {/* Thumbnail placeholder */}
                <div style={{
                  background: "#161616",
                  aspectRatio: "16/8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  borderBottom: "1px solid #1f1f1f",
                }}>
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
                  }}>
                    VOL · {r.vol}
                  </span>
                  <div style={{
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
                </div>

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
                    <a
                      href={r.linkVideo}
                      target="_blank"
                      rel="noopener noreferrer"
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
                        textDecoration: "none",
                      }}
                    >
                      ▶ Ver el vídeo
                    </a>
                    <a
                      href={r.linkDoc}
                      target="_blank"
                      rel="noopener noreferrer"
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
                        border: "1px solid #333",
                      }}
                    >
                      Abrir documento ↗
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* CTA LLAMADA */}
          <div style={{
            background: "#00AAFF",
            borderRadius: "20px",
            padding: "40px 28px",
            textAlign: "center",
            marginTop: "32px",
          }}>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 12px 0", opacity: 0.8 }}>
              ¿QUIERES IR MÁS RÁPIDO?
            </p>
            <h2 style={{ fontSize: "clamp(1.4rem, 4vw, 1.9rem)", fontWeight: 900, margin: "0 0 12px 0", lineHeight: 1.15, letterSpacing: "-0.5px" }}>
              Agenda una llamada gratuita conmigo
            </h2>
            <p style={{ fontSize: "15px", margin: "0 0 24px 0", opacity: 0.85, lineHeight: 1.5 }}>
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

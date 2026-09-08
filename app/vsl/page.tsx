import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vídeo | Fit con Damián",
  robots: { index: false, follow: false },
};

// ─────────────────────────────────────────────────────────────
// VSL — CONFIGURA AQUÍ EL VÍDEO cuando lo tengas.
//   Vimeo (recomendado para VSL, máxima calidad y arranque limpio):
//     { tipo: "vimeo",   id: "123456789" }
//   YouTube (vídeo oculto/no listado):
//     { tipo: "youtube", id: "abcdEFGH123" }
// Mientras "id" esté vacío, se muestra un marcador "vídeo en preparación".
const VSL: { tipo: "vimeo" | "youtube"; id: string } = {
  tipo: "vimeo",
  id: "",
};

// Enlace del calendario (botón "Agenda tu llamada").
const CALENDARIO = "https://links.fitcondamian.com/widget/bookings/reserva-de-la-llamada";

// Casos de éxito en vídeo (YouTube). Para añadir más, añade su ID aquí.
const casosExito = [
  "wnaKW0mFnHw",
  "hrVa6H6ankg",
  "E8AU7yjUHGA",
];

function vslSrc(): string | null {
  if (!VSL.id) return null;
  if (VSL.tipo === "vimeo") {
    // dnt=1 (no cookies) · sin título/autor · calidad alta por defecto
    return `https://player.vimeo.com/video/${VSL.id}?title=0&byline=0&portrait=0&badge=0&dnt=1&quality=1080p`;
  }
  return `https://www.youtube-nocookie.com/embed/${VSL.id}?rel=0&modestbranding=1`;
}

export default function VslPage() {
  const src = vslSrc();

  return (
    <main style={{ background: "#0D0D0D", minHeight: "100vh", color: "#fff", fontFamily: "var(--font-inter), sans-serif", display: "flex", flexDirection: "column" }}>

      {/* HEADER */}
      <header style={{ borderBottom: "1px solid #1f1f1f", padding: "20px 24px", textAlign: "center" }}>
        <p style={{ margin: 0, fontWeight: 900, fontSize: "18px", letterSpacing: "-0.5px" }}>
          Fit con <span style={{ color: "#00AAFF" }}>Damián</span>
        </p>
      </header>

      {/* BANNER — filtro de público objetivo */}
      <div style={{ background: "linear-gradient(90deg, #0077CC, #00AAFF)", padding: "14px 24px", textAlign: "center" }}>
        <p style={{ maxWidth: "560px", margin: "0 auto", color: "rgba(255,255,255,0.72)", fontSize: "clamp(14px, 3.9vw, 17px)", fontWeight: 800, lineHeight: 1.35, letterSpacing: "-0.2px" }}>
          Exclusivo para mujeres con <span style={{ color: "#fff", fontWeight: 900 }}>PERIMENOPAUSIA</span> O <span style={{ color: "#fff", fontWeight: 900 }}>MENOPAUSIA</span> que estén <span style={{ color: "#fff", fontWeight: 900 }}>cansadas</span> todo el día y se <span style={{ color: "#fff", fontWeight: 900 }}>odian</span> al mirarse al <span style={{ color: "#fff", fontWeight: 900 }}>espejo</span>
        </p>
      </div>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 20px 80px", width: "100%" }}>

        {/* TITULAR */}
        <div style={{ textAlign: "center", paddingTop: "44px", marginBottom: "28px" }}>
          <p style={{ color: "#00AAFF", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 12px 0" }}>
            VÍDEO IMPORTANTE · MÍRALO ENTERO
          </p>
          <h1 style={{ fontWeight: 900, fontSize: "clamp(1.2rem, 4.6vw, 2.2rem)", margin: "0 0 12px 0", lineHeight: 1.18, letterSpacing: "-0.5px" }}>
            Cómo recuperar tu <span style={{ color: "#00AAFF" }}>JUVENTUD</span> durante la{" "}
            <span style={{ color: "#00AAFF" }}>MENOPAUSIA</span> multiplicando tu{" "}
            <span style={{ color: "#00AAFF" }}>energía</span> y eliminando la{" "}
            <span style={{ color: "#00AAFF" }}>flacidez</span>, sin renunciar a tu rutina diaria
          </h1>
          <p style={{ color: "#AAAAAA", fontSize: "15px", margin: 0, lineHeight: 1.6 }}>
            Si al verlo te sientes identificada, reserva un hueco para hablar conmigo personalmente.
          </p>
        </div>

        {/* VSL — VÍDEO 16:9 */}
        <div style={{
          position: "relative", aspectRatio: "16/9",
          borderRadius: "18px", overflow: "hidden",
          border: "1px solid #1f1f1f", background: "#000",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}>
          {src ? (
            <iframe
              src={src}
              title="Vídeo Fit con Damián"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
            />
          ) : (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", color: "#666", textAlign: "center", padding: "24px" }}>
              <span style={{ fontSize: "34px" }}>🎬</span>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "15px", color: "#888" }}>Vídeo en preparación</p>
              <p style={{ margin: 0, fontSize: "13px" }}>Pásame el enlace del VSL y lo dejo activo al momento.</p>
            </div>
          )}
        </div>

        {/* CTA — Agenda tu llamada */}
        <div style={{ textAlign: "center", marginTop: "36px" }}>
          <a
            href={CALENDARIO}
            style={{
              display: "inline-block",
              background: "linear-gradient(90deg, #0077CC, #00AAFF)",
              color: "#fff",
              fontWeight: 900,
              fontSize: "clamp(1.05rem, 3.6vw, 1.35rem)",
              letterSpacing: "-0.3px",
              padding: "20px 44px",
              borderRadius: "99px",
              textDecoration: "none",
              boxShadow: "0 12px 34px rgba(0,170,255,0.35)",
            }}
          >
            📞 Agenda tu llamada
          </a>
          <p style={{ color: "#777", fontSize: "13px", margin: "16px 0 0 0" }}>
            30 minutos · 100% gratuito · sin compromiso
          </p>
        </div>

        {/* CASOS DE ÉXITO EN VÍDEO */}
        <div style={{ borderTop: "1px solid #1f1f1f", marginTop: "56px", marginBottom: "32px" }} />
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <p style={{ color: "#AAAAAA", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 8px 0" }}>
            RESULTADOS REALES
          </p>
          <h3 style={{ fontWeight: 900, fontSize: "clamp(1.4rem, 4vw, 1.8rem)", margin: 0, letterSpacing: "-0.5px" }}>
            Mujeres que ya lo han conseguido
          </h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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

      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #1f1f1f", padding: "24px", textAlign: "center", marginTop: "auto" }}>
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

import type { Metadata } from "next";
import Urgency from "./Urgency";

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
  id: "1228323445",
};

// Enlace del calendario (botón "Agenda tu llamada").
const CALENDARIO = "https://links.fitcondamian.com/widget/bookings/reserva-de-la-llamada";

// Casos de éxito en vídeo (YouTube). Para añadir más, añade su ID aquí.
const casosExito = [
  "wnaKW0mFnHw",
  "hrVa6H6ankg",
  "E8AU7yjUHGA",
];

// Mensajes reales de clientas (capturas de WhatsApp en /public).
const mensajes = [
  "/mensaje-1.jpg",
  "/mensaje-2.jpg",
  "/mensaje-3.jpg",
  "/mensaje-4.jpg",
  "/mensaje-5.jpg",
];

function vslSrc(): string | null {
  if (!VSL.id) return null;
  if (VSL.tipo === "vimeo") {
    // dnt=1 (no cookies) · sin título/autor · calidad alta por defecto
    return `https://player.vimeo.com/video/${VSL.id}?title=0&byline=0&portrait=0&badge=0&dnt=1&color=00AAFF&quality=1080p`;
  }
  return `https://www.youtube-nocookie.com/embed/${VSL.id}?rel=0&modestbranding=1`;
}

export default function VslPage() {
  const src = vslSrc();

  return (
    <main style={{ background: "radial-gradient(120% 55% at 50% -5%, #12314b, #081521 62%)", backgroundColor: "#081521", minHeight: "100vh", color: "#eaf3fb", fontFamily: "var(--font-inter), sans-serif", display: "flex", flexDirection: "column" }}>

      {/* FRANJA — filtro de público objetivo (cian sólida, estilos en globals.css) */}
      <div className="fcd-band">Para mujeres en perimenopausia y menopausia</div>

      {/* LOGO — Envejecimiento Revertido */}
      <header style={{ padding: "26px 24px 0", textAlign: "center" }}>
        <p aria-label="Envejecimiento Revertido" style={{ display: "inline-block", margin: 0, textAlign: "left", fontFamily: "var(--font-sora), sans-serif", fontSize: "22px", lineHeight: 1, letterSpacing: "-0.05em", color: "#fff" }}>
          <span style={{ display: "block", fontWeight: 300 }}>envejecimiento</span>
          <span style={{ display: "block", fontWeight: 800, marginTop: "0.04em" }}>revertido<span style={{ color: "#35C2FF" }}>.</span></span>
        </p>
      </header>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "24px 20px 80px", width: "100%" }}>

        {/* TITULAR — una sola frase en 3 líneas (Instrument Serif, estilos en globals.css) */}
        <div className="fcd-h1-wrap" style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1 className="fcd-h1">
            <span className="g">Cómo recuperar tu <em>atractivo</em> durante la menopausia</span>{" "}
            multiplicando tu{" "}
            <span className="u">
              energía
              <svg viewBox="0 0 120 10" preserveAspectRatio="none" fill="none" aria-hidden="true">
                <path d="M2 6 C 30 2, 90 2, 118 6" stroke="#35C2FF" strokeWidth={3.5} strokeLinecap="round" />
              </svg>
            </span>{" "}
            y eliminando la{" "}
            <span className="u">
              flacidez
              <svg viewBox="0 0 120 10" preserveAspectRatio="none" fill="none" aria-hidden="true">
                <path d="M2 6 C 30 2, 90 2, 118 6" stroke="#35C2FF" strokeWidth={3.5} strokeLinecap="round" />
              </svg>
            </span>
            , sin renunciar a tu rutina diaria
          </h1>
        </div>

        {/* VSL — VÍDEO 16:9 */}
        <div style={{
          position: "relative", aspectRatio: "16/9",
          borderRadius: "16px", overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.10)", background: "#06121c",
          boxShadow: "0 24px 70px rgba(0,0,0,0.55)",
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

        {/* INDICACIÓN — debajo del vídeo */}
        <p style={{ textAlign: "center", color: "#9fb7c7", fontSize: "14px", fontWeight: 600, lineHeight: 1.6, margin: "20px auto 0", maxWidth: "460px" }}>
          Si al verlo te sientes identificada, reserva un hueco para hablar conmigo personalmente.
        </p>

        {/* CTA — Agenda tu llamada */}
        <div style={{ textAlign: "center", marginTop: "28px" }}>
          <a
            href={CALENDARIO}
            style={{
              display: "inline-block",
              background: "linear-gradient(90deg, #0088d6, #35C2FF)",
              color: "#06202f",
              fontWeight: 900,
              fontSize: "clamp(1.05rem, 3.6vw, 1.35rem)",
              letterSpacing: "-0.3px",
              padding: "20px 44px",
              borderRadius: "99px",
              textDecoration: "none",
              boxShadow: "0 14px 36px rgba(53,194,255,0.34)",
            }}
          >
            📞 Agenda tu llamada
          </a>
          <p style={{ color: "#7f97a8", fontSize: "13px", margin: "16px 0 0 0" }}>
            30 minutos · 100% gratuito · sin compromiso
          </p>
          <Urgency minutos={10} plazas={5} />
        </div>

        {/* CASOS DE ÉXITO EN VÍDEO */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: "56px", marginBottom: "32px" }} />
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <p style={{ color: "#35C2FF", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 8px 0" }}>
            RESULTADOS REALES
          </p>
          <h3 style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontWeight: 600, fontSize: "clamp(1.5rem, 4.5vw, 2rem)", margin: 0, letterSpacing: "-0.3px", color: "#fff" }}>
            Mujeres que ya lo han conseguido
          </h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {casosExito.map((id, i) => (
            <div key={id} style={{
              position: "relative", aspectRatio: "16/9",
              borderRadius: "16px", overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.10)", background: "#06121c",
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

        {/* MENSAJES DE CLIENTAS (estilo WhatsApp) — después de los vídeos */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: "48px", marginBottom: "28px" }} />
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <p style={{ color: "#25D366", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 8px 0" }}>
            💬 Mensajes reales
          </p>
          <h3 style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontWeight: 600, fontSize: "clamp(1.5rem, 4.5vw, 2rem)", margin: "0 0 6px 0", letterSpacing: "-0.3px", color: "#fff" }}>
            Lo que me dicen mis clientas
          </h3>
          <p style={{ color: "#7f97a8", fontSize: "13px", margin: 0 }}>Desliza para ver más →</p>
        </div>
        <div style={{ display: "flex", gap: "12px", overflowX: "auto", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch", paddingBottom: "10px", alignItems: "flex-start" }}>
          {mensajes.map((src, i) => (
            <div key={i} style={{ flex: "0 0 auto", width: "min(80%, 300px)", scrollSnapAlign: "center", border: "1px solid rgba(255,255,255,0.10)", borderRadius: "16px", overflow: "hidden", background: "#0b1a26" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="Mensaje de una clienta" style={{ width: "100%", height: "auto", display: "block" }} />
            </div>
          ))}
        </div>

      </div>

      {/* CINTA DESLIZANTE */}
      <div style={{ overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "12px 0" }}>
        <div className="fcd-marq-track">
          {[0, 1].map((k) => (
            <span key={k} style={{ color: "#35C2FF", fontSize: "12px", fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase", paddingRight: "40px" }}>
              +1.300 mujeres ✦ Sin dietas extremas ✦ Método Envejecimiento Revertido ✦ Energía y figura después de los 40 ✦
            </span>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "24px", textAlign: "center" }}>
        <p style={{ color: "#5a7183", fontSize: "12px", margin: 0 }}>
          © {new Date().getFullYear()} Fit con Damián · fitcondamian.com{" · "}
          <a href="/privacidad" style={{ color: "#5a7183", textDecoration: "none" }}>Privacidad</a>{" · "}
          <a href="/politica-cookies" style={{ color: "#5a7183", textDecoration: "none" }}>Cookies</a>{" · "}
          <a href="/aviso-legal" style={{ color: "#5a7183", textDecoration: "none" }}>Aviso Legal</a>
        </p>
      </footer>
    </main>
  );
}

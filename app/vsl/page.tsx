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
    <main style={{ background: "#0D0D0D", minHeight: "100vh", color: "#fff", fontFamily: "var(--font-inter), sans-serif", display: "flex", flexDirection: "column" }}>

      {/* HEADER */}
      <header style={{ padding: "22px 24px 16px", textAlign: "center" }}>
        <p style={{ margin: 0, fontWeight: 900, fontSize: "18px", letterSpacing: "-0.5px" }}>
          <span style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 800, letterSpacing: "-1.2px" }}>fitcon<span style={{ color: "#00AAFF" }}>damián</span></span>
        </p>
      </header>

      {/* BANNER — filtro de público objetivo (píldora limpia) */}
      <div style={{ padding: "8px 20px 4px", textAlign: "center" }}>
        <div style={{ display: "inline-block", maxWidth: "600px", border: "1px solid rgba(255,255,255,0.10)", borderRadius: "18px", padding: "15px 22px", background: "rgba(255,255,255,0.02)" }}>
          <p style={{ color: "#6f7d89", fontSize: "10px", fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 7px 0" }}>Solo para mujeres con</p>
          <p style={{ margin: 0, color: "#fff", fontSize: "clamp(14px, 4vw, 17px)", fontWeight: 800, lineHeight: 1.4, letterSpacing: "-0.2px" }}>
            <span style={{ color: "#00AAFF", fontWeight: 900 }}>Perimenopausia</span> o <span style={{ color: "#00AAFF", fontWeight: 900 }}>menopausia</span> que estén cansadas todo el día y se odian al mirarse al espejo
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 20px 80px", width: "100%" }}>

        {/* PRUEBA SOCIAL — píldora con halo giratorio */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: "34px" }}>
          <div className="fcd-halo">
            <div className="fcd-halo-inner" style={{ display: "inline-flex", alignItems: "center", gap: "12px", padding: "7px 20px 7px 12px" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                {["/avatar-1.jpg?v=2", "/avatar-2.jpg?v=2", "/avatar-3.jpg?v=2"].map((srcAv, i) => (
                  <span key={srcAv} style={{
                    width: "34px", height: "34px", borderRadius: "50%",
                    border: "2px solid #0d0d0d",
                    marginLeft: i === 0 ? 0 : "-12px",
                    overflow: "hidden", background: "#16455f",
                    position: "relative", zIndex: 3 - i, flexShrink: 0,
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={srcAv} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </span>
                ))}
              </div>
              <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#e8eef2", letterSpacing: "-0.1px" }}>
                <span style={{ color: "#00AAFF", fontWeight: 900 }}>+1.300 mujeres</span> lo han conseguido con mi método
              </span>
            </div>
          </div>
        </div>

        {/* TITULAR */}
        <div style={{ textAlign: "center", paddingTop: "26px", marginBottom: "28px" }}>
          <h1 style={{ fontWeight: 900, fontSize: "clamp(1.2rem, 4.6vw, 2.2rem)", margin: "0 0 12px 0", lineHeight: 1.18, letterSpacing: "-0.5px" }}>
            Cómo recuperar tu <span style={{ color: "#00AAFF" }}>JUVENTUD</span> durante la menopausia multiplicando tu energía y eliminando la <span style={{ color: "#00AAFF" }}>flacidez</span>, sin renunciar a tu rutina diaria
          </h1>
          <p style={{ color: "#AAAAAA", fontSize: "15px", margin: 0, lineHeight: 1.6 }}>
            Si al verlo te sientes identificada, reserva un hueco para hablar conmigo personalmente.
          </p>
          <p style={{ color: "#cfcfcf", fontSize: "13.5px", fontWeight: 700, lineHeight: 1.6, margin: "14px 0 0 0" }}>
            <b style={{ color: "#fff", fontWeight: 900 }}>Sin</b> dietas estrictas · <b style={{ color: "#fff", fontWeight: 900 }}>Sin</b> renunciar a tus cenas y planes · <b style={{ color: "#fff", fontWeight: 900 }}>Sin</b> vivir en el gimnasio
          </p>
        </div>

        {/* INDICACIÓN — encima del vídeo */}
        <p style={{ textAlign: "center", color: "#8a8a8a", fontSize: "14px", fontWeight: 700, margin: "0 0 12px 0" }}>
          ⬇️ <span style={{ color: "#00AAFF" }}>Mira el vídeo completo</span> y reserva tu llamada
        </p>

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
          <Urgency minutos={10} plazas={5} />
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

        {/* MENSAJES DE CLIENTAS (estilo WhatsApp) — después de los vídeos */}
        <div style={{ borderTop: "1px solid #1f1f1f", marginTop: "48px", marginBottom: "28px" }} />
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <p style={{ color: "#25D366", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 8px 0" }}>
            💬 Mensajes reales
          </p>
          <h3 style={{ fontWeight: 900, fontSize: "clamp(1.4rem, 4vw, 1.8rem)", margin: "0 0 6px 0", letterSpacing: "-0.5px" }}>
            Lo que me dicen mis clientas
          </h3>
          <p style={{ color: "#777", fontSize: "13px", margin: 0 }}>Desliza para ver más →</p>
        </div>
        <div style={{ display: "flex", gap: "12px", overflowX: "auto", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch", paddingBottom: "10px", alignItems: "flex-start" }}>
          {mensajes.map((src, i) => (
            <div key={i} style={{ flex: "0 0 auto", width: "min(80%, 300px)", scrollSnapAlign: "center", border: "1px solid #1f2a30", borderRadius: "16px", overflow: "hidden", background: "#0e1317" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="Mensaje de una clienta" style={{ width: "100%", height: "auto", display: "block" }} />
            </div>
          ))}
        </div>

      </div>

      {/* CINTA DESLIZANTE */}
      <div style={{ overflow: "hidden", borderTop: "1px solid #1f1f1f", borderBottom: "1px solid #1f1f1f", padding: "12px 0" }}>
        <div className="fcd-marq-track">
          {[0, 1].map((k) => (
            <span key={k} style={{ color: "#00AAFF", fontSize: "12px", fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase", paddingRight: "40px" }}>
              +1.300 mujeres ✦ Sin dietas extremas ✦ Método Envejecimiento Revertido ✦ Energía y figura después de los 40 ✦
            </span>
          ))}
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

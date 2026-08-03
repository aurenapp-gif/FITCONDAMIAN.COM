"use client";

import { useEffect, useState } from "react";
import VideoPlayer from "../_components/VideoPlayer";

/* ────────────────────────────────────────────────────────────────
   EDITA AQUÍ los enlaces de cada paso cuando los tengas.
   (Deja "#" si todavía no tienes el enlace: el botón quedará
    desactivado y avisará de que estará disponible en breve.)
──────────────────────────────────────────────────────────────── */
const PASOS = [
  {
    id: "documento",
    icono: "📄",
    titulo: "Descarga tu documento de bienvenida",
    texto:
      "Ábrelo y guárdalo. Aquí tienes el resumen de todo lo que vas a conseguir y cómo empezar con buen pie.",
    cta: "Abrir documento",
    href: "#", // ← pega aquí el enlace al documento (Google Drive / PDF)
  },
  {
    id: "hotmart",
    icono: "🎓",
    titulo: "Entra en Hotmart y crea tu cuenta",
    texto:
      "Recibirás un email de Hotmart para acceder al contenido del programa. Crea tu contraseña y guarda el acceso.",
    cta: "Acceder a Hotmart",
    href: "#", // ← pega aquí el enlace de acceso a Hotmart
  },
  {
    id: "fitcoaurena",
    icono: "🔒",
    titulo: "Accede a la plataforma privada FitcoAurena",
    texto:
      "Es tu zona privada de seguimiento con Damián. Regístrate con el mismo correo del pago para tenerlo todo conectado.",
    cta: "Entrar en FitcoAurena",
    href: "#", // ← pega aquí el enlace a la plataforma privada FitcoAurena
  },
];

const STORAGE_KEY = "onboarding-fcd-completados";

export default function OnboardingClient() {
  const [completados, setCompletados] = useState<string[]>([]);
  const [cargado, setCargado] = useState(false);

  // Cargar progreso guardado
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCompletados(JSON.parse(raw));
    } catch {
      /* noop */
    }
    setCargado(true);
  }, []);

  // Guardar progreso
  useEffect(() => {
    if (!cargado) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completados));
    } catch {
      /* noop */
    }
  }, [completados, cargado]);

  const marcar = (id: string) => {
    setCompletados((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  // El primer paso NO completado es el "activo" (iluminado).
  const indiceActivo = PASOS.findIndex((p) => !completados.includes(p.id));
  const porcentaje = Math.round((completados.length / PASOS.length) * 100);

  return (
    <div style={{ maxWidth: "660px", margin: "0 auto", padding: "0 20px 80px", width: "100%" }}>
      {/* BARRA DE PROGRESO */}
      <div style={{ paddingTop: "36px", marginBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#AAAAAA", letterSpacing: "1px", textTransform: "uppercase" }}>
            Tu configuración inicial
          </span>
          <span style={{ fontSize: "13px", fontWeight: 900, color: "#00AAFF" }}>{porcentaje}%</span>
        </div>
        <div style={{ background: "#1a1a1a", borderRadius: "99px", height: "10px", overflow: "hidden" }}>
          <div
            style={{
              width: `${porcentaje}%`,
              height: "100%",
              background: "linear-gradient(90deg, #00AAFF, #0077CC)",
              borderRadius: "99px",
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>

      {/* VÍDEO DE BIENVENIDA */}
      <div style={{ marginBottom: "40px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
          <span style={{ fontSize: "22px" }}>👋</span>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(1.2rem, 4vw, 1.5rem)", margin: 0, lineHeight: 1.2 }}>
            Empieza por aquí: mira este vídeo
          </h2>
        </div>
        <div style={{ borderRadius: "16px", overflow: "hidden", background: "#000", border: "1px solid #1f1f1f" }}>
          {/* Sustituye por tu vídeo de onboarding cuando lo tengas */}
          <VideoPlayer src="/onboarding-bienvenida.mp4" poster="/onboarding-bienvenida-poster.jpg" />
        </div>
      </div>

      {/* SEPARADOR */}
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <div style={{ borderTop: "1px solid #1f1f1f", marginBottom: "24px" }} />
        <p style={{ color: "#AAAAAA", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 8px 0" }}>
          TUS PRIMEROS PASOS
        </p>
        <p style={{ color: "#999", fontSize: "14px", margin: 0 }}>
          Complétalos en orden. Cada paso se ilumina cuando te toca.
        </p>
      </div>

      {/* PASOS */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {PASOS.map((paso, i) => {
          const hecho = completados.includes(paso.id);
          const activo = i === indiceActivo;
          const bloqueado = !hecho && !activo;
          const tieneEnlace = paso.href && paso.href !== "#";

          // Estilos según estado
          const borde = hecho ? "#1f6b3a" : activo ? "#00AAFF" : "#1f1f1f";
          const fondo = hecho ? "rgba(31,107,58,0.08)" : activo ? "rgba(0,170,255,0.06)" : "#111";
          const halo = activo ? "0 0 0 1px #00AAFF, 0 0 22px rgba(0,170,255,0.25)" : "none";
          const opacidad = bloqueado ? 0.45 : 1;

          return (
            <div
              key={paso.id}
              style={{
                background: fondo,
                border: `1px solid ${borde}`,
                borderRadius: "16px",
                padding: "22px",
                boxShadow: halo,
                opacity: opacidad,
                transition: "all 0.35s ease",
              }}
            >
              <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                {/* Número / check */}
                <span
                  style={{
                    flexShrink: 0,
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    background: hecho ? "#22A957" : activo ? "#00AAFF" : "#2a2a2a",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: "15px",
                    transition: "background 0.35s ease",
                  }}
                >
                  {hecho ? "✓" : i + 1}
                </span>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span style={{ fontSize: "18px" }}>{paso.icono}</span>
                    <h3 style={{ fontWeight: 900, fontSize: "16px", margin: 0, lineHeight: 1.3 }}>{paso.titulo}</h3>
                  </div>
                  <p style={{ color: "#C8C8C8", fontSize: "13.5px", lineHeight: 1.6, margin: "0 0 16px 0" }}>{paso.texto}</p>

                  {/* Botón de acción */}
                  {hecho ? (
                    <button
                      onClick={() => setCompletados((prev) => prev.filter((x) => x !== paso.id))}
                      style={{
                        background: "transparent",
                        border: "1px solid #333",
                        color: "#8a8a8a",
                        fontSize: "12px",
                        fontWeight: 700,
                        padding: "8px 14px",
                        borderRadius: "10px",
                        cursor: "pointer",
                      }}
                    >
                      Completado · deshacer
                    </button>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
                      <a
                        href={tieneEnlace ? paso.href : undefined}
                        target={tieneEnlace ? "_blank" : undefined}
                        rel={tieneEnlace ? "noopener noreferrer" : undefined}
                        onClick={() => {
                          if (tieneEnlace) marcar(paso.id);
                        }}
                        aria-disabled={!tieneEnlace || bloqueado}
                        style={{
                          pointerEvents: !tieneEnlace || bloqueado ? "none" : "auto",
                          background: activo ? "linear-gradient(90deg, #00AAFF, #0077CC)" : "#222",
                          color: "#fff",
                          fontWeight: 900,
                          fontSize: "14px",
                          padding: "11px 22px",
                          borderRadius: "12px",
                          textDecoration: "none",
                          display: "inline-block",
                          boxShadow: activo ? "0 6px 20px rgba(0,170,255,0.3)" : "none",
                        }}
                      >
                        {tieneEnlace ? paso.cta : "Disponible en breve"}
                      </a>

                      {/* Marcar como hecho manualmente (por si abren el enlace por otro sitio) */}
                      {activo && (
                        <button
                          onClick={() => marcar(paso.id)}
                          style={{
                            background: "transparent",
                            border: "1px solid #2c2c2c",
                            color: "#9a9a9a",
                            fontSize: "12px",
                            fontWeight: 700,
                            padding: "10px 14px",
                            borderRadius: "12px",
                            cursor: "pointer",
                          }}
                        >
                          Marcar como hecho
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MENSAJE FINAL AL COMPLETAR TODO */}
      {completados.length === PASOS.length && (
        <div
          style={{
            marginTop: "32px",
            background: "rgba(34,169,87,0.1)",
            border: "1px solid rgba(34,169,87,0.4)",
            borderRadius: "16px",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "30px", margin: "0 0 8px 0" }}>🎉</p>
          <p style={{ fontWeight: 900, fontSize: "18px", margin: "0 0 6px 0" }}>¡Todo listo!</p>
          <p style={{ color: "#C8C8C8", fontSize: "14px", margin: 0, lineHeight: 1.6 }}>
            Ya tienes acceso a todo. Nos vemos dentro. Cualquier duda, escríbenos y te ayudamos.
          </p>
        </div>
      )}
    </div>
  );
}

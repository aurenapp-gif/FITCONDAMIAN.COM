"use client";

import { useState } from "react";
import ModalForm from "./ModalForm";

const recursos = [
  { emoji: "📋", titulo: "Diagnóstico de Composición Corporal", desc: "Descubre en 3 minutos exactamente dónde estás y qué necesitas cambiar." },
  { emoji: "🥗", titulo: "Guía de Nutrición Sin Dietas", desc: "El sistema que uso con mis clientes para perder grasa sin pasar hambre." },
  { emoji: "💪", titulo: "Rutina de Entrenamiento Express", desc: "30 minutos, 3 veces por semana. El programa que transforma cuerpos." },
  { emoji: "😴", titulo: "Protocolo de Recuperación", desc: "El factor oculto que sabotea tus resultados. La guía definitiva." },
];

export default function RecursosClient() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <main style={{ background: "#0D0D0D", minHeight: "100vh", color: "#fff", fontFamily: "var(--font-inter), sans-serif" }}>

      {modalOpen && <ModalForm onClose={() => setModalOpen(false)} />}

      {/* HEADER */}
      <header style={{ borderBottom: "1px solid #1f1f1f", padding: "20px 24px", textAlign: "center" }}>
        <p style={{ margin: 0, fontWeight: 900, fontSize: "18px", letterSpacing: "-0.5px" }}>
          Fit con <span style={{ color: "#FF5C00" }}>Damián</span>
        </p>
      </header>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "0 24px" }}>

        {/* HERO */}
        <section style={{ paddingTop: "56px", paddingBottom: "48px", textAlign: "center" }}>

          {/* Headline */}
          <h1 style={{
            fontSize: "clamp(2.2rem, 8vw, 3.4rem)", fontWeight: 900,
            lineHeight: 1.05, margin: "0 0 16px 0", letterSpacing: "-1.5px",
          }}>
            Accede gratis a los recursos que han transformado{" "}
            <em style={{ fontStyle: "italic", color: "#FF5C00" }}>cientos de cuerpos.</em>
          </h1>

          {/* Subheadline */}
          <p style={{
            color: "#A0A0A0", fontSize: "17px", lineHeight: 1.6,
            margin: "0 0 32px 0", fontStyle: "italic",
          }}>
            sin dietas imposibles ni horas en el gimnasio.
          </p>

          {/* CTA PRINCIPAL */}
          <button
            onClick={() => setModalOpen(true)}
            style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              background: "#FF5C00", color: "#fff",
              fontWeight: 900, fontSize: "17px",
              padding: "16px 36px", borderRadius: "99px",
              border: "none", cursor: "pointer",
              letterSpacing: "-0.3px",
              boxShadow: "0 0 0 0 rgba(255,92,0,0)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 30px rgba(255,92,0,0.35)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 0 0 rgba(255,92,0,0)";
            }}
          >
            Acceder a los recursos →
          </button>

          {/* Trust text */}
          <p style={{ color: "#555", fontSize: "13px", margin: "16px 0 40px 0" }}>
            Material gratuito al que puedes acceder en menos de 2 minutos.
            <br />Mira el vídeo y regístrate justo abajo.
          </p>

          {/* VIDEO */}
          <div style={{
            borderRadius: "16px", overflow: "hidden",
            background: "#161616", aspectRatio: "16/9",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "1px solid #252525", marginBottom: "8px",
          }}>
            {/* 👉 Reemplaza con tu iframe de YouTube/Vimeo */}
            <div style={{ textAlign: "center", padding: "32px" }}>
              <div
                onClick={() => setModalOpen(true)}
                style={{
                  width: "72px", height: "72px", background: "#FF5C00",
                  borderRadius: "50%", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "26px", paddingLeft: "6px",
                  margin: "0 auto 12px", cursor: "pointer",
                  boxShadow: "0 0 0 12px rgba(255,92,0,0.15)",
                }}
              >
                ▶
              </div>
              <p style={{ color: "#555", fontSize: "13px", margin: 0 }}>
                Vídeo de presentación — próximamente
              </p>
            </div>
          </div>
          <p style={{ color: "#444", fontSize: "12px", margin: "0 0 0 0" }}>🔊 Activa el sonido</p>
        </section>

        {/* SEPARADOR */}
        <div style={{ borderTop: "1px solid #1f1f1f", marginBottom: "48px" }} />

        {/* RECURSOS */}
        <section style={{ paddingBottom: "32px" }}>
          <p style={{ color: "#FF5C00", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", textAlign: "center", marginBottom: "24px" }}>
            ESTO ES LO QUE TE LLEVAS
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "40px" }}>
            {recursos.map((r, i) => (
              <div key={i} style={{
                display: "flex", gap: "16px", alignItems: "flex-start",
                background: "#111", border: "1px solid #1f1f1f",
                borderRadius: "14px", padding: "18px 20px",
              }}>
                <span style={{ fontSize: "28px", flexShrink: 0 }}>{r.emoji}</span>
                <div>
                  <p style={{ fontWeight: 800, fontSize: "15px", margin: "0 0 4px 0" }}>{r.titulo}</p>
                  <p style={{ color: "#888", fontSize: "13px", margin: 0, lineHeight: 1.5 }}>{r.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA SECUNDARIO */}
          <div style={{ textAlign: "center", paddingBottom: "56px" }}>
            <button
              onClick={() => setModalOpen(true)}
              style={{
                display: "inline-flex", alignItems: "center", gap: "10px",
                background: "#FF5C00", color: "#fff",
                fontWeight: 900, fontSize: "17px",
                padding: "16px 36px", borderRadius: "99px",
                border: "none", cursor: "pointer", letterSpacing: "-0.3px",
              }}
            >
              Quiero acceder gratis →
            </button>
            <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginTop: "16px" }}>
              <span style={{ color: "#555", fontSize: "13px" }}>✓ Sin spam</span>
              <span style={{ color: "#555", fontSize: "13px" }}>✓ Acceso inmediato</span>
              <span style={{ color: "#555", fontSize: "13px" }}>✓ 100% gratis</span>
            </div>
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

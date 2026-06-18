"use client";

import { useEffect } from "react";
import Script from "next/script";

const GHL_FORM_ID = "vmfyZr4yJIrYZYPSkuko";

export default function ModalForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      aria-hidden={!open}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.85)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
        backdropFilter: "blur(4px)",
        opacity: open ? 1 : 0,
        visibility: open ? "visible" : "hidden",
        pointerEvents: open ? "auto" : "none",
        transition: "opacity 0.2s ease",
      }}
    >
      <div style={{
        background: "#111",
        border: "1px solid #2a2a2a",
        borderRadius: "20px",
        width: "100%",
        maxWidth: "460px",
        padding: "32px 28px 28px",
        position: "relative",
        maxHeight: "92vh",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
      }}>
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          aria-label="Cerrar"
          style={{
            position: "absolute", top: "16px", right: "16px",
            background: "#222", border: "none", color: "#fff",
            width: "32px", height: "32px", borderRadius: "50%",
            cursor: "pointer", fontSize: "16px", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}
        >
          <span aria-hidden="true">✕</span>
        </button>

        {/* Badge */}
        <p style={{
          color: "#00AAFF", fontSize: "11px", fontWeight: 700,
          letterSpacing: "2px", textTransform: "uppercase",
          margin: "0 0 14px 0",
        }}>
          ACCESO INMEDIATO
        </p>

        {/* Headline */}
        <h2 style={{
          fontSize: "clamp(1.6rem, 5vw, 2rem)", fontWeight: 900,
          margin: "0 0 8px 0", lineHeight: 1.1, letterSpacing: "-0.5px", color: "#fff",
        }}>
          Accede a los recursos{" "}
          <em style={{ fontStyle: "italic", color: "#00AAFF" }}>gratis</em>
        </h2>
        <p style={{ color: "#888", fontSize: "14px", margin: "0 0 24px 0", lineHeight: 1.5 }}>
          Déjanos tu correo y te los enviamos al instante.
        </p>

        {/* GHL Form iframe — altura segura para móvil con teclado abierto */}
        <iframe
          src={`https://links.fitcondamian.com/widget/form/${GHL_FORM_ID}`}
          style={{ width: "100%", height: "clamp(520px, 75vh, 720px)", border: "none", borderRadius: "8px", display: "block" }}
          id={`inline-${GHL_FORM_ID}`}
          title="Formulario de acceso a recursos gratuitos"
        />

        {/* Script cargado correctamente fuera del ciclo de render de React */}
        <Script src="https://links.fitcondamian.com/js/form_embed.js" strategy="afterInteractive" />

        <p style={{ color: "#444", fontSize: "11px", textAlign: "center", margin: "12px 0 0 0" }}>
          Sin spam · Cancela cuando quieras
        </p>
      </div>
    </div>
  );
}

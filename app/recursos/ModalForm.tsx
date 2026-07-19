"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const GHL_FORM_ID = "vmfyZr4yJIrYZYPSkuko";

export default function ModalForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setIframeLoaded(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.85)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
        backdropFilter: "blur(4px)",
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

        {/* GHL Form iframe — embed oficial completo con auto-resize (form_embed.js) */}
        <div style={{ position: "relative", minHeight: "645px" }}>
          {!iframeLoaded && (
            <div
              aria-hidden="true"
              style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "#161616", borderRadius: "8px",
              }}
            >
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                border: "3px solid #2a2a2a", borderTopColor: "#00AAFF",
                animation: "spin 0.8s linear infinite",
              }} />
            </div>
          )}
          <iframe
            src={`https://links.fitcondamian.com/widget/form/${GHL_FORM_ID}`}
            onLoad={() => setIframeLoaded(true)}
            style={{
              width: "100%", height: "645px", border: "none", borderRadius: "8px", display: "block",
              opacity: iframeLoaded ? 1 : 0, transition: "opacity 0.3s ease",
              position: "relative",
            }}
            id={`inline-${GHL_FORM_ID}`}
            data-layout="{'id':'INLINE'}"
            data-trigger-type="alwaysShow"
            data-trigger-value=""
            data-activation-type="alwaysActivated"
            data-activation-value=""
            data-deactivation-type="neverDeactivate"
            data-deactivation-value=""
            data-form-name="01 - Formulario LM Youtube"
            data-height="645"
            data-layout-iframe-id={`inline-${GHL_FORM_ID}`}
            data-form-id={GHL_FORM_ID}
            title="01 - Formulario LM Youtube"
          />
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        {/* Script cargado correctamente fuera del ciclo de render de React */}
        <Script src="https://links.fitcondamian.com/js/form_embed.js" strategy="afterInteractive" />

        <p style={{ color: "#444", fontSize: "11px", textAlign: "center", margin: "12px 0 0 0" }}>
          Sin spam · Cancela cuando quieras
        </p>
      </div>
    </div>
  );
}

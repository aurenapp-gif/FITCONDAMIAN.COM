"use client";

import { useEffect, useState } from "react";

// Caja de urgencia: temporizador de cuenta atrás + plazas.
export default function Urgency({ minutos = 10, plazas = 5 }: { minutos?: number; plazas?: number }) {
  const [restante, setRestante] = useState(minutos * 60);

  useEffect(() => {
    if (restante <= 0) return;
    const id = setInterval(() => setRestante((r) => (r > 0 ? r - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [restante]);

  const mm = String(Math.floor(restante / 60)).padStart(2, "0");
  const ss = String(restante % 60).padStart(2, "0");

  return (
    <div style={{ maxWidth: "420px", margin: "28px auto 0", border: "1px solid rgba(53,194,255,0.30)", borderRadius: "14px", padding: "18px", textAlign: "center", background: "rgba(53,194,255,0.05)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontWeight: 900, fontSize: "30px", color: "#35C2FF", letterSpacing: "1px", fontVariantNumeric: "tabular-nums" }}>
        <span aria-hidden="true" style={{ fontSize: "24px" }}>⏱️</span>
        <span>{mm}</span><span>:</span><span>{ss}</span>
      </div>
      <p style={{ color: "#9fb7c7", fontSize: "14px", margin: "6px 0 0 0" }}>
        Solo quedan <b style={{ color: "#fff", fontWeight: 900 }}>{plazas} plazas</b> disponibles este mes
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";

export default function Entrar() {
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError("");
    try {
      const r = await fetch("/api/panel/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clave }) });
      if (r.ok) { window.location.href = "/panel-fcd"; return; }
      const j = await r.json().catch(() => ({}));
      setError(j.error || "No se pudo entrar.");
    } catch {
      setError("No hay conexión. Prueba otra vez.");
    }
    setEnviando(false);
  }

  return (
    <main className="pn-login">
      <form onSubmit={enviar} className="pn-login-box">
        <h1>Panel</h1>
        <label htmlFor="clave">Contraseña</label>
        <input id="clave" type="password" autoComplete="current-password" value={clave} onChange={(e) => setClave(e.target.value)} autoFocus required />
        {error && <p className="pn-err" role="alert">{error}</p>}
        <button type="submit" disabled={enviando}>{enviando ? "Entrando…" : "Entrar"}</button>
      </form>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";

// Checklist para marcar. Se recuerda en el navegador de la clienta (solo en su dispositivo).
export default function Checklist({ id, items }: { id: string; items: string[] }) {
  const clave = `fcd-guia-${id}`;
  const [hecho, setHecho] = useState<boolean[]>(() => items.map(() => false));

  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(clave) || "null");
      if (Array.isArray(v) && v.length === items.length) setHecho(v);
    } catch {}
  }, [clave, items.length]);

  const marcar = (i: number) => {
    const n = hecho.map((x, j) => (j === i ? !x : x));
    setHecho(n);
    try { localStorage.setItem(clave, JSON.stringify(n)); } catch {}
  };

  const total = hecho.filter(Boolean).length;
  return (
    <div className="gu-check">
      <p className="gu-count">{total} de {items.length} hechos</p>
      <ul>
        {items.map((t, i) => (
          <li key={t}>
            <label className={hecho[i] ? "on" : ""}>
              <input type="checkbox" checked={hecho[i]} onChange={() => marcar(i)} />
              <span className="box" aria-hidden="true">✓</span>
              <span>{t}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

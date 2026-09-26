import type { Recurso } from "../_data/recursos";

// Portada de color de un recurso (estilos en app/_styles/er.css).
export default function Cover({ r }: { r: Recurso }) {
  return (
    <div className={`er-cover ${r.g}`} aria-hidden="true">
      <span className="n">{r.n}</span>
      <span className="k">{r.cat}</span>
      <span className="t">{r.name}</span>
    </div>
  );
}

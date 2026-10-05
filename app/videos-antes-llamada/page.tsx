import type { Metadata } from "next";
import TransformacionesCarrusel from "../_components/TransformacionesCarrusel";
import "../_styles/er.css";

export const metadata: Metadata = {
  title: "Vídeos antes de la llamada",
  robots: { index: false, follow: false },
};

// Casos de éxito en vídeo (YouTube). Para añadir más, añade su ID aquí.
const casosExito = [
  "wnaKW0mFnHw",
  "hrVa6H6ankg",
  "E8AU7yjUHGA",
];

export default function VideosAntesLlamadaPage() {
  return (
    <main className="er-page">

      <header className="er-logo">
        <p aria-label="Envejecimiento Revertido"><span className="t">envejecimiento</span><span className="b">revertido<i>.</i></span></p>
      </header>

      <div className="er-wrap" style={{ paddingTop: "26px", paddingBottom: "64px" }}>

        {/* TITULAR */}
        <div className="er-must"><span className="dot" aria-hidden="true" />Importante ver</div>
        <h1 className="er-h er-acc-h">Mira estos vídeos <span className="er-pill">antes de la llamada</span></h1>
        <p className="er-sub" style={{ marginBottom: "24px" }}>
          Míralos con calma: son casos reales de mujeres que ya lo han conseguido. Te van a ayudar a aprovechar al máximo nuestra sesión.
        </p>

        {/* CASOS DE ÉXITO EN VÍDEO */}
        <div className="er-cases">
          {casosExito.map((id, i) => (
            <div key={id} className="er-frame">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`}
                title={`Caso de éxito ${i + 1}`}
                loading={i === 0 ? undefined : "lazy"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ))}
        </div>

        {/* CARRUSEL DE TRANSFORMACIONES */}
        <div className="gr-after">
          <TransformacionesCarrusel />
        </div>
      </div>

      <footer className="er-footer">
        © {new Date().getFullYear()} Fit con Damián · fitcondamian.com
      </footer>
    </main>
  );
}

import type { Metadata } from "next";
import VslTimeline from "../_components/VslTimeline";
import VideoPlayer from "../_components/VideoPlayer";
import "../_styles/er.css";

export const metadata: Metadata = {
  title: "Antes de tu llamada",
  robots: { index: false, follow: false },
};

// Testimonios en vídeo (YouTube). Para añadir más, añade su ID aquí.
const testimoniosVideo = [
  "wnaKW0mFnHw",
  "hrVa6H6ankg",
  "E8AU7yjUHGA",
];

export default function AntesDeLaLlamadaPage() {
  return (
    <main className="er-page">

      <header className="er-logo">
        <p aria-label="Envejecimiento Revertido"><span className="t">envejecimiento</span><span className="b">revertido<i>.</i></span></p>
      </header>

      <div className="er-wrap" style={{ paddingTop: "26px", paddingBottom: "64px" }}>

        {/* VÍDEO PREVIO A LA LLAMADA */}
        <div className="er-must"><span className="dot" aria-hidden="true" />Importante ver</div>
        <h1 className="er-h er-acc-h">Mira este vídeo de 3 minutos <span className="er-pill">antes de la llamada</span></h1>
        <div className="gr-media">
          <VideoPlayer src="/paso3-video.mp4" poster="/paso3-video-poster.jpg" />
          <span className="gr-badge">3 MIN</span>
        </div>

        {/* MIENTRAS ESPERAS */}
        <section className="er-sec gr-after">
          <div className="er-sh">
            <p className="k">Mientras esperas la llamada</p>
            <h2>Aprovecha al máximo <span className="er-pill">nuestra sesión</span></h2>
          </div>
          <VslTimeline er />
        </section>

        {/* TESTIMONIOS */}
        <section className="er-sec">
          <div className="er-sh">
            <p className="k">Resultados reales</p>
            <h2>Lo que dicen quienes <span className="er-pill">ya lo han hecho</span></h2>
          </div>
          <div className="er-cases">
            {testimoniosVideo.map((id, i) => (
              <div key={id} className="er-frame">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`}
                  title={`Testimonio en vídeo ${i + 1}`}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="er-footer">
        © {new Date().getFullYear()} Fit con Damián · fitcondamian.com
      </footer>
    </main>
  );
}

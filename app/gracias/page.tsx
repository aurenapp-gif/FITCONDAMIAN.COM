import type { Metadata } from "next";
import Image from "next/image";
import VslTimeline from "../_components/VslTimeline";
import VideoPlayer from "../_components/VideoPlayer";
import "../_styles/er.css";

export const metadata: Metadata = {
  title: "¡Llamada reservada!",
  robots: { index: false, follow: false },
};

// Testimonios en vídeo (YouTube). Para añadir más, añade su ID aquí.
const testimoniosVideo = [
  "wnaKW0mFnHw",
  "hrVa6H6ankg",
  "E8AU7yjUHGA",
];

export default function GraciasPage() {
  return (
    <main className="er-page">

      <header className="er-logo">
        <p aria-label="Envejecimiento Revertido"><span className="t">envejecimiento</span><span className="b">revertido<i>.</i></span></p>
      </header>

      <div className="er-wrap" style={{ paddingTop: "26px", paddingBottom: "64px" }}>

        {/* PROGRESO + AVISO */}
        <div className="gr-prog">
          <div className="top"><span>Progreso de confirmación</span><b>80%</b></div>
          <div className="bar"><i /></div>
        </div>
        <div className="gr-warn">
          <span className="dot" aria-hidden="true" />
          <div>
            <p className="t1">Importante: tu llamada no está confirmada</p>
            <p className="t2">Completa los 3 pasos de abajo para asegurar tu plaza.</p>
          </div>
        </div>

        <h1 className="er-h gr-h">Ya casi está. <span className="er-pill">Confirma tu llamada</span></h1>

        {/* PASO 1 */}
        <section className="gr-paso">
          <div className="gr-head"><i>1</i><h2>Mira este vídeo corto</h2></div>
          <div className="gr-media">
            <VideoPlayer src="/paso1-gracias.mp4" poster="/paso1-gracias-poster.jpg" />
          </div>
        </section>

        {/* PASO 2 */}
        <section className="gr-paso">
          <div className="gr-head"><i>2</i><div><h2>Confirma la llamada en el email</h2><p className="gr-spam">Revisa también Spam y Promociones</p></div></div>
          <div className="gr-card">
            <ul className="gr-list">
              <li>Busca en tu email: <b>Damián</b> o <b>Fit con Damián</b></li>
              <li>Haz clic en <b className="er-c">«Añadir al calendario»</b> y después en <b>«Sí»</b> en la invitación</li>
            </ul>
            <div className="gr-img">
              <Image
                src="/confirmar-calendario.png"
                alt="Dónde hacer clic para confirmar la llamada en el email"
                width={980}
                height={520}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
          </div>
        </section>

        {/* PASO 3 */}
        <section className="gr-paso">
          <div className="gr-head"><i>3</i><h2>Mira este vídeo de 3 minutos antes de la llamada</h2></div>
          <div className="gr-media">
            <VideoPlayer src="/paso3-video.mp4" poster="/paso3-video-poster.jpg" />
            <span className="gr-badge">3 MIN</span>
          </div>
        </section>

        {/* MIENTRAS ESPERAS */}
        <section className="er-sec">
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

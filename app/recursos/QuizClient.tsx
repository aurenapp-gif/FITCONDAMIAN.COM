"use client";

import Script from "next/script";
import "../_styles/er.css";

// Quiz funnel: todo el embudo (hero, preguntas, adelanto y formulario de
// GoHighLevel) lo pinta public/fcd-quiz.js, el mismo script que se usa en los
// códigos de GoHighLevel, para que web y GHL sean siempre idénticos.
declare global {
  interface Window { FCDQuiz?: { mountAll: () => void } }
}

export default function QuizClient() {
  return (
    <main className="er-page rhs">
      <header className="er-logo">
        <p aria-label="Método RHS"><span className="t">método</span><span className="b">RHS<i>.</i></span></p>
      </header>

      <div data-fcd="quiz" style={{ minHeight: "80vh" }} />
      <Script src="/fcd-quiz.js" strategy="afterInteractive" onReady={() => window.FCDQuiz?.mountAll()} />

      <footer className="er-footer">
        © {new Date().getFullYear()} Fit con Damián · fitcondamian.com{" · "}
        <a href="/privacidad">Privacidad</a>{" · "}
        <a href="/politica-cookies">Cookies</a>{" · "}
        <a href="/aviso-legal">Aviso Legal</a>
      </footer>
    </main>
  );
}

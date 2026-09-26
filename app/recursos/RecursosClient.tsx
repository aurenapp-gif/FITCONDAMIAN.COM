"use client";

import { useState } from "react";
import { track } from "@vercel/analytics";
import ModalForm from "./ModalForm";
import Cover from "../_components/Cover";
import { RECURSOS, CASOS_EXITO, recursoPorId } from "../_data/recursos";
import "../_styles/er.css";

// Test de la landing: 5 preguntas. Cada respuesta suma puntos a los recursos
// más útiles para ese caso; al final se recomiendan los 2 con más puntos.
// No calcula ninguna edad: el test completo es el recurso 01, que recibe al registrarse.
type Opcion = { t: string; p: Record<string, number> };
const PREGUNTAS: { q: string; o: Opcion[]; why: Record<string, string> }[] = [
  { q: "¿Cómo te sientes al terminar el día?",
    o: [{ t: "Agotada", p: { r08: 3, r06: 1 } }, { t: "Cansada", p: { r08: 2 } }, { t: "Normal", p: { r01: 1 } }, { t: "Con energía", p: { r01: 1 } }],
    why: { r08: "porque terminas el día sin energía" } },
  { q: "¿Cuántos días a la semana haces ejercicio de fuerza?",
    o: [{ t: "Ninguno", p: { r10: 3, r03: 1 } }, { t: "1 día", p: { r10: 2 } }, { t: "2 o 3 días", p: { r04: 1 } }, { t: "4 o más", p: { r05: 1 } }],
    why: { r10: "porque ahora apenas trabajas tu fuerza", r03: "para crear un plan que no abandones" } },
  { q: "¿Notas flacidez en brazos, abdomen o piernas?",
    o: [{ t: "Mucha", p: { r04: 3, r10: 1 } }, { t: "Bastante", p: { r04: 2 } }, { t: "Un poco", p: { r02: 1 } }, { t: "Nada", p: { r01: 1 } }],
    why: { r04: "porque la flacidez es lo que más te preocupa", r02: "para saber qué hábitos la están causando" } },
  { q: "¿Qué es lo que más te gustaría cambiar?",
    o: [{ t: "La tripa", p: { r07: 5, r09: 1 } }, { t: "La flacidez", p: { r04: 5, r10: 1 } }, { t: "El cansancio", p: { r08: 5, r06: 1 } }, { t: "Mi alimentación", p: { r06: 5 } }],
    why: { r07: "para empezar por la grasa abdominal", r06: "para comer bien en esta etapa", r09: "para perder grasa sin rebote" } },
  { q: "¿En qué etapa estás?",
    o: [{ t: "Perimenopausia", p: { r06: 1 } }, { t: "Menopausia", p: { r06: 1 } }, { t: "Postmenopausia", p: { r06: 1 } }, { t: "No lo sé", p: { r01: 2 } }],
    why: { r01: "para conocer el punto exacto en el que estás" } },
];
// Motivo por defecto si ninguna respuesta aporta uno concreto.
const MOTIVO: Record<string, string> = {
  r01: "para conocer el punto exacto en el que estás", r02: "para descubrir qué hábitos te están envejeciendo",
  r03: "para tener un plan que no abandones", r04: "para eliminar la flacidez paso a paso",
  r05: "para acceder a lo que solo ven mis alumnas", r06: "para comer bien en esta etapa",
  r07: "para empezar por la grasa abdominal", r08: "para recuperar tu energía",
  r09: "para perder grasa sin rebote", r10: "para ganar firmeza en brazos, glúteos y piernas",
};

function recomendar(respuestas: number[]) {
  const puntos: Record<string, number> = {};
  const motivo: Record<string, string> = {};
  PREGUNTAS.forEach((pr, k) => {
    const p = pr.o[respuestas[k]].p;
    for (const id of Object.keys(p)) {
      puntos[id] = (puntos[id] ?? 0) + p[id];
      if (!motivo[id] && pr.why[id]) motivo[id] = pr.why[id];
    }
  });
  // El test (r01) ya se lo lleva siempre: se recomiendan los otros.
  let top = Object.keys(puntos).filter((id) => id !== "r01").sort((a, b) => puntos[b] - puntos[a]).slice(0, 2);
  for (const extra of ["r04", "r08"]) if (top.length < 2 && !top.includes(extra)) top.push(extra);
  top = top.slice(0, 2);
  return top.map((id) => ({ r: recursoPorId(id), motivo: motivo[id] ?? MOTIVO[id] }));
}

function Test({ onAcceder }: { onAcceder: () => void }) {
  const [paso, setPaso] = useState(0);
  const [resp, setResp] = useState<number[]>([]);
  const terminado = paso >= PREGUNTAS.length;

  const elegir = (j: number) => {
    const nuevas = [...resp];
    nuevas[paso] = j;
    setResp(nuevas);
    setTimeout(() => {
      setPaso((p) => p + 1);
      if (paso + 1 === PREGUNTAS.length) track("test_completado");
    }, 180);
  };

  if (terminado) {
    return (
      <div className="er-quiz" id="test" aria-live="polite">
        <div className="er-res">
          <span className="er-ok">✓ Test completado</span>
          <h3>Tu plan de inicio está listo</h3>
          <p>Según tus respuestas, te recomiendo empezar por estos dos recursos:</p>
          <div className="er-recs">
            {recomendar(resp).map(({ r, motivo }) => (
              <div key={r.id} className="er-rec">
                <Cover r={r} />
                <p className="why"><b>{r.name}</b> {motivo}.</p>
              </div>
            ))}
          </div>
          <button type="button" className="er-btn" onClick={onAcceder}>Recibir mi test completo y los 10 recursos →</button>
        </div>
      </div>
    );
  }

  const pr = PREGUNTAS[paso];
  return (
    <div className="er-quiz" id="test" aria-live="polite">
      <div className="top">
        {paso > 0
          ? <button type="button" className="er-back" onClick={() => setPaso((p) => p - 1)}>← Atrás</button>
          : <span className="er-giftmini">🎁 9 recursos al terminar</span>}
        <span>Pregunta {paso + 1} de {PREGUNTAS.length}</span>
      </div>
      <div className="er-bar"><i style={{ width: `${(paso / PREGUNTAS.length) * 100}%` }} /></div>
      <p className="er-q">{pr.q}</p>
      <div className="er-opts">
        {pr.o.map((op, j) => (
          <button key={op.t} type="button" className={`er-opt${resp[paso] === j ? " sel" : ""}`} onClick={() => elegir(j)}>{op.t}</button>
        ))}
      </div>
    </div>
  );
}

export default function RecursosClient() {
  const [modalOpen, setModalOpen] = useState(false);

  // Abre el formulario y registra el evento de conversión "registro".
  const openModal = () => {
    track("registro");
    setModalOpen(true);
  };
  const irAlTest = () => document.getElementById("test")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <main className="er-page">
      <ModalForm open={modalOpen} onClose={() => setModalOpen(false)} />

      <div className="er-band">Para mujeres en perimenopausia y menopausia</div>
      <header className="er-logo">
        <p aria-label="Envejecimiento Revertido"><span className="t">envejecimiento</span><span className="b">revertido<i>.</i></span></p>
      </header>

      <div className="er-wrap">

        {/* HERO + TEST */}
        <div className="er-hero">
          <p className="er-eb">Test gratis · 2 minutos</p>
          <h1 className="er-h">¿Cuántos años tiene tu cuerpo <span className="er-pill">por dentro</span>?</h1>
          <p className="er-sub1">Responde 5 preguntas y te digo por dónde empezar.</p>
          <p className="er-gift"><span aria-hidden="true">🎁</span> Al terminar te regalo <b>9 recursos gratis</b></p>
          <Test onAcceder={openModal} />
          <div className="er-proof">
            <span className="av" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/avatar-1.jpg?v=2" alt="" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/avatar-2.jpg?v=2" alt="" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/avatar-3.jpg?v=2" alt="" />
            </span>
            <span><b>+1.000 mujeres</b> lo han conseguido</span>
          </div>
        </div>

        {/* CIFRAS */}
        <section className="er-sec">
          <div className="er-stats">
            <div className="er-stat"><b>+1.000</b><span>mujeres transformadas</span></div>
            <div className="er-stat"><b>+7</b><span>años de experiencia</span></div>
            <div className="er-stat"><b>10</b><span>recursos gratis</span></div>
            <div className="er-stat"><b>100%</b><span>basado en ciencia</span></div>
          </div>
        </section>

        {/* CASOS DE ÉXITO */}
        <section className="er-sec">
          <div className="er-sh"><p className="k">Casos de éxito reales</p><h2>Mujeres que ya lo han <span className="er-pill">conseguido</span></h2></div>
          <div className="er-cases">
            {CASOS_EXITO.map((id, i) => (
              <div key={id} className="er-frame">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`}
                  title={`Caso de éxito ${i + 1}`}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ))}
          </div>
        </section>

        {/* LOS 10 RECURSOS */}
        <section className="er-sec">
          <div className="er-sh"><p className="k">Esto es lo que te llevas</p><h2>El test y <span className="er-c">9 regalos más</span>, gratis</h2></div>
          <div className="er-list">
            {RECURSOS.map((r, i) => (
              <div key={r.id} className="er-item">
                <Cover r={r} />
                <div>
                  <h3 className="nm">{r.name}</h3>
                  <p className="hk">{r.hook}</p>
                  <span className="gift">{i === 0 ? "Incluido · el test" : "Regalo incluido"}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "24px" }}>
            <button type="button" className="er-btn" onClick={irAlTest}>Hacer el test gratis →</button>
          </div>
        </section>
      </div>

      <footer className="er-footer">
        © {new Date().getFullYear()} Fit con Damián · fitcondamian.com{" · "}
        <a href="/privacidad">Privacidad</a>{" · "}
        <a href="/politica-cookies">Cookies</a>{" · "}
        <a href="/aviso-legal">Aviso Legal</a>
      </footer>
    </main>
  );
}

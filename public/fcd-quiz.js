/* ─────────────────────────────────────────────────────────────────────────
   Fit con Damián · Quiz funnel «Diagnóstico gratis + plan personalizado»

   Un solo script para la web (fitcondamian.com) y para GoHighLevel:
     <div data-fcd="quiz"></div>   → hero + preguntas + adelanto + formulario
     <div data-fcd="plan"></div>   → plan personalizado (página de acceso)
     <script src="https://fitcondamian.com/fcd-quiz.js" defer></script>

   La captura de datos es el formulario de GoHighLevel tal cual
   (vmfyZr4yJIrYZYPSkuko): mismos campos, misma redirección, misma
   automatización. Las respuestas del quiz NO se envían a GoHighLevel:
   se guardan en una cookie de *.fitcondamian.com para pintar el plan en
   la página a la que redirige el formulario.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";
  if (window.FCDQuiz) { window.FCDQuiz.mountAll(); return; }

  var SCRIPT = document.currentScript;
  var BASE = "https://fitcondamian.com";
  try { if (SCRIPT && SCRIPT.src) BASE = new URL(SCRIPT.src, location.href).origin; } catch (e) {}
  var FORM_ID = "vmfyZr4yJIrYZYPSkuko";
  var COOKIE = "fcd_plan";
  var PROGRESO = "fcd_quiz_progreso";

  /* ── Preguntas ─────────────────────────────────────────────────────────── */
  var Q = [
    { id: "nombre", tipo: "nombre", q: "Antes de empezar, ¿cómo te llamas?", sub: "Así personalizo tu plan." },
    { id: "edad", q: "¿Cuántos años tienes?", o: ["24 a 29", "30 a 34", "35 a 40", "Más de 40"] },
    { id: "espejo", q: "{n}, cuando te miras al espejo, ¿qué es lo que más te molesta?", o: ["La tripa y los rollitos de la espalda", "La flacidez en brazos, piernas o glúteos", "Me veo hinchada casi siempre", "Ya no reconozco mi cuerpo"] },
    { id: "ropa", q: "¿Cómo te queda la ropa últimamente?", o: ["Me aprieta lo que antes me quedaba bien", "Evito ciertas prendas (bikini, vestidos ajustados…)", "Casi siempre voy con ropa ancha", "Bien, pero quiero verme mejor"] },
    { id: "peso", q: "¿Cuánto tiempo llevas intentando bajar de peso?", o: ["Menos de 6 meses", "Entre 6 meses y 2 años", "Más de 2 años", "Bajo y vuelvo a subir (efecto rebote)"] },
    { id: "comida", q: "¿Cómo describirías tu alimentación?", o: ["Como sano, pero no bajo", "Picoteo y como a deshoras", "Hago dietas estrictas y luego lo dejo", "Como fuera a menudo por trabajo o planes"] },
    { id: "entreno", q: "¿Qué ejercicio haces ahora mismo?", o: ["Nada o casi nada", "Cardio: caminar, correr o clases", "Pesas, pero sin un plan claro", "Pesas con un plan"] },
    { id: "tiempo", q: "¿Cuánto tiempo real tienes para entrenar?", o: ["Menos de 2 h a la semana", "2 a 3 h a la semana", "3 a 5 h a la semana", "Más de 5 h a la semana"] },
    { id: "ciclo", q: "¿Cómo es tu ciclo menstrual?", o: ["Regular y sin muchos síntomas", "Irregular o tengo SOP", "Mucha retención y antojos antes de la regla", "Tomo anticonceptivos o no lo sé"] },
    { id: "energia", q: "¿Cómo está tu energía durante el día?", o: ["Me levanto ya cansada", "Tengo un bajón después de comer", "Llego sin fuerzas a la noche", "Bien en general"] },
    { id: "sueno", q: "¿Cuánto duermes de verdad?", o: ["Menos de 6 horas", "Entre 6 y 7 horas", "7 u 8 horas, pero me despierto cansada", "7 u 8 horas y descanso bien"] },
    { id: "freno", q: "¿Qué es lo que más te frena?", o: ["Empiezo con ganas y lo dejo a las semanas", "No sé qué hacer exactamente", "No tengo tiempo", "Me cuesta controlar la ansiedad por comer"] },
    { id: "meta", tipo: "abierta", q: "Imagina que dentro de 90 días te miras al espejo y te encanta lo que ves. ¿Qué ha cambiado?", sub: "Escríbelo con tus palabras. Lo usaré en tu plan.", ph: "Ej.: Me pongo mis vaqueros de antes, tengo energía para jugar con mis hijos…" },
    { id: "invertir", q: "Si encuentras el método adecuado para ti, ¿estarías dispuesta a invertir en una profesional que te acompañe?", o: ["Sí, si veo que es para mí", "Sí, pero con un presupuesto ajustado", "De momento prefiero hacerlo sola"] }
  ];
  var L = "abcd";

  var AREAS = [
    { k: "ali", n: "Alimentación" },
    { k: "ent", n: "Entrenamiento" },
    { k: "hor", n: "Hormonas y ciclo" },
    { k: "ene", n: "Energía y descanso" },
    { k: "men", n: "Mentalidad" }
  ];

  /* ── Utilidades ────────────────────────────────────────────────────────── */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function clamp(v) { return Math.max(12, Math.min(88, Math.round(v))); }
  function nombreCorto(n) { n = String(n || "").trim().split(/\s+/)[0] || ""; return n ? n.charAt(0).toUpperCase() + n.slice(1).toLowerCase() : ""; }
  function track(name, data) { try { if (typeof window.va === "function") window.va("event", { name: name, data: data }); } catch (e) {} }
  function ls(get, k, v) { try { if (get) return window.localStorage.getItem(k); window.localStorage.setItem(k, v); } catch (e) {} return null; }
  function ss(get, k, v) { try { if (get) return window.sessionStorage.getItem(k); if (v == null) window.sessionStorage.removeItem(k); else window.sessionStorage.setItem(k, v); } catch (e) {} return null; }

  function guardar(d) {
    var v = encodeURIComponent(JSON.stringify(d));
    var dom = /(^|\.)fitcondamian\.com$/.test(location.hostname) ? "; domain=.fitcondamian.com" : "";
    var sec = location.protocol === "https:" ? "; Secure" : "";
    try { document.cookie = COOKIE + "=" + v + "; path=/; max-age=" + 60 * 60 * 24 * 90 + "; SameSite=Lax" + dom + sec; } catch (e) {}
    ls(false, COOKIE, v);
  }
  function cargar() {
    var raw = null;
    try { var m = document.cookie.match(new RegExp("(?:^|; )" + COOKIE + "=([^;]*)")); if (m) raw = m[1]; } catch (e) {}
    if (!raw) raw = ls(true, COOKIE);
    if (!raw) return null;
    try { var d = JSON.parse(decodeURIComponent(raw)); return d && d.a ? d : null; } catch (e) { return null; }
  }

  /* ── Diagnóstico: puntuación por área (más alto = mejor) ───────────────── */
  function puntuar(a) {
    var s = { ali: 50, ent: 50, hor: 55, ene: 50, men: 45 };
    s.ali = { a: 52, b: 30, c: 26, d: 36 }[a.comida] || 45;
    if (a.peso === "d") s.ali -= 8;
    if (a.espejo === "a") s.ali -= 4;
    s.ent = { a: 16, b: 34, c: 52, d: 76 }[a.entreno] || 40;
    if (a.tiempo === "a") s.ent -= 8; else if (a.tiempo === "d") s.ent += 4;
    if (a.espejo === "b") s.ent -= 6;
    s.hor = { a: 72, b: 30, c: 36, d: 52 }[a.ciclo] || 52;
    if (a.espejo === "c") s.hor -= 10;
    if (a.edad === "c" || a.edad === "d") s.hor -= 6;
    s.ene = { a: 22, b: 40, c: 34, d: 74 }[a.energia] || 45;
    s.ene += { a: -16, b: -4, c: -12, d: 8 }[a.sueno] || 0;
    s.men = { a: 30, b: 46, c: 40, d: 26 }[a.freno] || 40;
    if (a.peso === "c") s.men -= 8;
    if (a.ropa === "c") s.men -= 5;
    if (a.espejo === "d") s.men -= 4;
    Object.keys(s).forEach(function (k) { s[k] = clamp(s[k]); });
    return s;
  }
  function peorArea(s) {
    // En empate decide el orden de AREAS.
    return AREAS.slice().sort(function (x, y) { return s[x.k] - s[y.k]; })[0].k;
  }
  function media(s) { return Math.round(AREAS.reduce(function (t, x) { return t + s[x.k]; }, 0) / AREAS.length); }

  /* ── Textos del plan ───────────────────────────────────────────────────── */
  var FRENO = {
    ali: {
      a: ["Comes bien… pero no lo suficiente de lo que importa", "Que comas sano y no bajes no es culpa tuya. Lo más habitual es comer poca proteína y, en general, demasiado poco: tu cuerpo se pone en modo ahorro, pierde músculo y se aferra a la grasa. Por eso te ves igual, o más flácida, aunque lo hagas «todo bien»."],
      b: ["El picoteo te está saboteando sin que te des cuenta", "Comer a deshoras dispara tu azúcar en sangre y tu hambre. No es falta de fuerza de voluntad: es que tus comidas no te sacian. Cuando cada comida lleva la proteína y la fibra que necesitas, el picoteo baja solo."],
      c: ["Las dietas estrictas son las que te hacen rebotar", "Cada dieta muy restrictiva te quita músculo y enseña a tu cuerpo a defenderse. Al dejarla recuperas el peso… y algo más. Necesitas un plan que puedas mantener, no otra dieta de tres semanas."],
      d: ["Comer fuera no es el problema; no tener un sistema, sí", "Con tu ritmo de vida no puedes depender de cocinar perfecto. Lo que necesitas son reglas sencillas para elegir bien en cualquier restaurante o menú del día, sin contar calorías."]
    },
    ent: {
      a: ["Tu cuerpo necesita músculo para verse firme", "Sin entrenamiento de fuerza pierdes un poco de músculo cada año. Menos músculo es más flacidez y un metabolismo más lento. La buena noticia: es lo que más rápido cambia cuando empiezas bien."],
      b: ["Más cardio no te va a dar el cuerpo que quieres", "Caminar o correr es genial para la salud, pero por sí solo no tonifica: puedes bajar de peso y seguir viéndote flácida. Lo que da forma a glúteos, brazos y abdomen es la fuerza bien programada."],
      c: ["Entrenas, pero sin un plan tu cuerpo no tiene motivos para cambiar", "Sin progresión (más peso, más repeticiones, mejor técnica) tu cuerpo se acostumbra y deja de responder. Con un plan que se ajuste a ti cada semana, el mismo esfuerzo da mucho más resultado."],
      d: ["Tu entrenamiento no está alineado con el resto de tu vida", "Entrenas con plan, pero si no está adaptado a tu ciclo, a tu descanso y a tu alimentación, el resultado se queda corto. Ese ajuste fino es lo que ahora marca la diferencia."]
    },
    hor: {
      a: ["La inflamación no te deja ver tus avances", "La hinchazón y la retención pueden esconder kilos de cambio real. Cuando bajas la inflamación con alimentación, descanso y el entrenamiento adecuado, de repente «aparece» el cuerpo que has estado trabajando."],
      b: ["Tus hormonas están jugando en tu contra", "Con un ciclo irregular o SOP, la resistencia a la insulina hace que almacenes grasa con más facilidad, sobre todo en la tripa. No necesitas comer menos: necesitas comer y entrenar de forma que tus hormonas te ayuden."],
      c: ["Tu ciclo explica gran parte de tu hinchazón y tus antojos", "Esa retención y esos antojos antes de la regla son normales, pero si entrenas y comes igual todo el mes, sientes que retrocedes cada pocas semanas. Adaptando el plan a cada fase dejas de pelearte con tu cuerpo."],
      d: ["La inflamación no te deja ver tus avances", "La hinchazón y la retención pueden esconder kilos de cambio real. Cuando bajas la inflamación con alimentación, descanso y el entrenamiento adecuado, de repente «aparece» el cuerpo que has estado trabajando."]
    },
    ene: {
      a: ["Te levantas cansada porque tu cuerpo no se está recuperando", "Si duermes poco o mal, tu cuerpo produce más cortisol y más hambre, y te pide azúcar para aguantar el día. Sin arreglar tu energía, cualquier plan se hace cuesta arriba."],
      b: ["Ese bajón después de comer es una señal", "Suele aparecer cuando las comidas llevan muchos hidratos rápidos y poca proteína. El azúcar sube y baja de golpe y te deja sin energía, con sueño y con ganas de dulce."],
      c: ["Llegas a la noche sin fuerzas, y así es imposible ser constante", "Cuando el día te exprime, entrenar o cocinar bien parece imposible. Necesitas un plan que te dé energía en lugar de quitártela, empezando por lo que comes por la mañana y a mediodía."],
      d: ["Tu descanso no te está dejando recuperarte", "Aunque te notes bien, dormir poco o mal sube el cortisol y el hambre, y frena la pérdida de grasa. Ajustar tu descanso es la palanca más fácil que tienes ahora mismo."]
    },
    men: {
      a: ["No te falta disciplina; te falta un plan que puedas mantener", "Empezar fuerte y dejarlo a las semanas es lo que pasa cuando el plan es demasiado exigente para tu vida real. La clave es empezar con lo mínimo que funciona e ir subiendo."],
      b: ["No es falta de ganas: es exceso de información", "Con tanto consejo contradictorio es normal no saber por dónde empezar. Necesitas un camino claro, paso a paso, pensado para tu cuerpo y tu situación."],
      c: ["No necesitas más tiempo; necesitas usarlo mejor", "Con tres sesiones cortas bien hechas a la semana y unas pocas reglas de alimentación se consiguen cambios visibles. El problema no es tu tiempo, son los planes pensados para gente sin vida."],
      d: ["La ansiedad por comer no se arregla con fuerza de voluntad", "Suele venir de comidas que no sacian, estrés acumulado y poco descanso. Cuando corriges eso, la ansiedad baja de forma natural y dejas de sentir que pierdes el control."]
    }
  };
  var CLAVE = { ali: "comida", ent: "entreno", hor: "ciclo", ene: "energia", men: "freno" };

  var HOY = {
    ali: "En tu próxima comida, añade una ración de proteína del tamaño de la palma de tu mano: huevos, pollo, pescado, yogur griego o legumbres.",
    ent: "Haz 3 rondas de 12 sentadillas, 10 puentes de glúteo y 8 flexiones con las rodillas apoyadas. 15 minutos en casa.",
    hor: "Bebe 2 litros de agua, reduce la sal y los ultraprocesados y camina 20 minutos después de comer.",
    ene: "Esta noche, deja el móvil 30 minutos antes de dormir y acuéstate a la misma hora que mañana.",
    men: "Elige UN solo hábito de este plan y hazlo 7 días seguidos. Solo uno."
  };

  // En energía, el primer paso depende de cuándo le falta energía.
  var HOY_ENE = {
    b: "En tu próxima comida, empieza por la proteína y la verdura y deja el hidrato para el final. Después, camina 10 minutos: notarás mucho menos bajón.",
    c: "Mañana, desayuna con proteína (huevos, yogur griego o tostada con pavo) y come a mediodía un plato completo. Fíjate en cómo llegas a la noche."
  };

  var EDAD = {
    a: "Entre los 24 y los 29 años tu cuerpo responde muy rápido al entrenamiento de fuerza: es el mejor momento para construir la base.",
    b: "A partir de los 30 empiezas a perder músculo poco a poco si no lo entrenas. Por eso ahora es cuando más rinde empezar bien.",
    c: "A partir de los 35 la pérdida de músculo se acelera y las hormonas empiezan a cambiar: la fuerza y la proteína son innegociables en tu plan.",
    d: "Pasados los 40 las hormonas cambian y el músculo se pierde más rápido: tu plan prioriza fuerza, proteína y descanso."
  };

  var OBJETIVO_ROPA = { a: "volver a ponerte esa ropa que ahora te aprieta", b: "ponerte sin pensarlo esas prendas que hoy evitas", c: "dejar la ropa ancha y ponerte lo que te apetezca", d: "verte espectacular con lo que te pongas" };

  function fases(a) {
    var f1 = [], f2 = [], f3 = [];
    f1.push({ a: "Sube la proteína en cada comida: una palma de tu mano, 3 o 4 veces al día.", b: "Haz 3 comidas completas al día, con proteína y verdura, para cortar el picoteo.", c: "Deja las dietas extremas: come suficiente, con un plato equilibrado en cada comida.", d: "Aplica la regla del plato fuera de casa: proteína, verdura y una ración de hidrato." }[a.comida] || "Sube la proteína en cada comida.");
    if (a.sueno === "a" || a.energia === "a") f1.push("Adelanta 30 minutos la hora de dormir y deja las pantallas media hora antes.");
    else if (a.energia === "b") f1.push("Desayuna con proteína y deja los hidratos rápidos para después de entrenar: adiós al bajón.");
    else f1.push("Bebe 2 litros de agua al día y camina 7.000 pasos diarios.");
    f1.push({ b: "Prioriza proteína y fibra y reduce el azúcar para mejorar tu sensibilidad a la insulina.", c: "Reduce sal y ultraprocesados y sube agua y verdura para bajar la retención." }[a.ciclo] || (a.espejo === "c" ? "Reduce sal y ultraprocesados y sube agua y verdura para deshincharte." : "Apunta en qué fase de tu ciclo estás para empezar a ajustar el plan."));

    f2.push({ a: "2 o 3 sesiones de fuerza de 30 minutos a la semana, en casa o en el gimnasio.", b: "3 sesiones de fuerza de 45 minutos a la semana, de cuerpo completo.", c: "3 o 4 sesiones de fuerza a la semana con foco en glúteos, espalda y brazos.", d: "4 sesiones de fuerza a la semana con foco en glúteos, espalda y brazos." }[a.tiempo] || "3 sesiones de fuerza a la semana.");
    f2.push({ a: "Aprende la técnica de 5 ejercicios básicos: sentadilla, peso muerto, remo, press y puente de glúteo.", b: "Cambia parte del cardio por fuerza: el cardio, en forma de pasos diarios.", c: "Sigue una progresión: sube peso o repeticiones cada semana y apúntalo.", d: "Ajusta el volumen de tu plan actual a tu descanso y a tu ciclo." }[a.entreno] || "Sigue una progresión semanal.");
    f2.push(a.ciclo === "d" ? "Fíjate en cómo te encuentras cada semana y ajusta la intensidad según tu energía." : "Adapta la intensidad a tu ciclo: más fuerte en la primera mitad y más suave antes de la regla.");

    f3.push({ a: "Trabajo específico de core y espalda para reducir tripa y rollitos.", b: "Más volumen en glúteos, piernas y brazos para eliminar la flacidez.", c: "Mantén la alimentación antiinflamatoria y mide tu cintura, no solo el peso.", d: "Fotos y medidas cada 2 semanas para ver cómo cambia tu cuerpo." }[a.espejo] || "Mide tu progreso cada 2 semanas.");
    f3.push({ a: "Hábitos mínimos para los días malos: así no vuelves a empezar de cero.", b: "Una rutina semanal sencilla que puedas seguir sin pensar.", c: "Sesiones cortas e intensas que encajen en tu semana.", d: "Estrategias para la ansiedad: comidas que sacian y una rutina de noche." }[a.freno] || "Un sistema que puedas mantener.");
    f3.push("Objetivo: " + (OBJETIVO_ROPA[a.ropa] || "verte y sentirte bien") + ".");

    return [
      { k: "Semanas 1 y 2", t: "Desinflamar y ordenar", l: f1 },
      { k: "Semanas 3 a 6", t: "Activar tu metabolismo", l: f2 },
      { k: "Semanas 7 a 12", t: "Esculpir y mantener", l: f3 }
    ];
  }

  function porQue(a) {
    if (a.peso === "d") return "Llevas tiempo bajando y volviendo a subir. El efecto rebote aparece cuando pierdes peso a base de pasar hambre: pierdes músculo, tu metabolismo se frena y el cuerpo recupera lo perdido. Este plan va al revés: primero músculo y hábitos, después la grasa cae y no vuelve.";
    if (a.peso === "c") return "Llevas más de dos años intentándolo, y eso dice mucho de tus ganas. Si no ha funcionado no es por ti: es porque los planes que has probado no estaban pensados para tu cuerpo, tus hormonas ni tu día a día.";
    if (a.peso === "b") return "Llevas un tiempo intentándolo sin el resultado que mereces. No es falta de esfuerzo: te ha faltado un plan adaptado a ti que ataque lo que de verdad te frena.";
    return "Estás a tiempo de hacerlo bien desde el principio, sin dietas extremas ni horas de cardio que no te llevan a ningún sitio.";
  }

  function construir(d) {
    var a = d.a || {};
    var s = puntuar(a);
    var k = peorArea(s);
    var fr = FRENO[k][a[CLAVE[k]]] || FRENO[k].a;
    return { s: s, media: media(s), area: k, areaNombre: AREAS.filter(function (x) { return x.k === k; })[0].n, freno: fr, fases: fases(a), hoy: (k === "ene" && HOY_ENE[a.energia]) || HOY[k], edad: EDAD[a.edad] || "", porque: porQue(a) };
  }

  /* ── Estilos (se inyectan una vez) ─────────────────────────────────────── */
  var CSS = [
    ".fcdq{--b:#35C2FF;--bd:#0088d6;--ink:#04202b;--tx:#eaf3fb;--mu:#9fb7c7;--mu2:#7f97a8;--ln:rgba(255,255,255,.1);color:var(--tx);font-family:var(--font-inter,Inter),-apple-system,BlinkMacSystemFont,sans-serif;line-height:1.5;-webkit-font-smoothing:antialiased;max-width:560px;margin:0 auto;padding:0 20px;scroll-margin-top:12px}",
    ".fcdq *,.fcdq *::before,.fcdq *::after{box-sizing:border-box}",
    ".er-wrap .fcdq,.er-wrap.fcdq{padding-left:0;padding-right:0}",
    ".fcdq :where(h1,h2,h3,p,ul,ol){margin:0;padding:0}",
    ".fcdq button{font-family:inherit;cursor:pointer}",
    ".fcdq .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}",
    ".fcdq .serif{font-family:var(--font-instrument,'Instrument Serif'),Georgia,serif;font-weight:400}",
    ".fcdq .pill{display:inline-block;font-style:italic;color:var(--ink);background:linear-gradient(90deg,var(--bd),var(--b));padding:0 .26em .03em;border-radius:.3em;line-height:1.1;box-shadow:0 4px 16px rgba(53,194,255,.35)}",
    ".fcdq .eb{text-align:center;font-size:11px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:var(--b)}",
    ".fcdq .btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;text-align:center;font-weight:900;font-size:17px;padding:18px 16px;border-radius:99px;border:0;background:linear-gradient(90deg,var(--bd),var(--b));color:var(--ink);box-shadow:0 12px 30px rgba(53,194,255,.32);letter-spacing:-.2px;text-decoration:none;transition:transform .15s,opacity .2s}",
    ".fcdq .btn:active{transform:scale(.985)}",
    ".fcdq .btn[disabled]{opacity:.45;cursor:not-allowed;box-shadow:none}",
    ".fcdq .btn:focus-visible,.fcdq .opt:focus-visible,.fcdq .lnk:focus-visible,.fcdq input:focus-visible,.fcdq textarea:focus-visible{outline:3px solid #fff;outline-offset:3px}",
    ".fcdq .meta{display:flex;justify-content:center;flex-wrap:wrap;gap:4px 14px;margin-top:12px;font-size:13px;color:var(--mu)}",
    ".fcdq .meta span{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}",
    ".fcdq .meta i{font-style:normal;color:#8fe6b0}",
    ".fcdq .lnk{display:block;margin:14px auto 0;background:none;border:0;color:var(--mu);font-size:13.5px;text-decoration:underline;text-underline-offset:3px;padding:6px}",
    /* hero */
    ".fcdq .hero{padding:28px 0 8px;text-align:center}",
    ".fcdq .hero h1{font-size:clamp(31px,8.6vw,44px);line-height:1.1;color:#fff;margin-top:12px;text-wrap:balance}",
    ".fcdq .hero .sub{color:#cfe1ee;font-size:16px;line-height:1.5;margin:16px auto 0;max-width:400px;text-wrap:balance}",
    ".fcdq .mock{position:relative;margin:24px 0 22px;border-radius:20px;border:1px solid rgba(53,194,255,.35);background:linear-gradient(180deg,rgba(53,194,255,.09),rgba(53,194,255,.03));padding:18px 18px 20px;text-align:left;overflow:hidden;box-shadow:0 0 50px rgba(53,194,255,.12)}",
    ".fcdq .mock .in{filter:blur(4px);opacity:.85;pointer-events:none;user-select:none}",
    ".fcdq .mock .hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}",
    ".fcdq .mock .hd b{font-size:15px}",
    ".fcdq .mock .sc{font-family:var(--font-sora,Sora),sans-serif;font-weight:800;font-size:26px;color:var(--b)}",
    ".fcdq .mock .ln{height:9px;border-radius:9px;background:rgba(255,255,255,.12);margin-top:10px}",
    ".fcdq .lock{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:inline-flex;align-items:center;gap:8px;white-space:nowrap;font-size:13px;font-weight:800;color:#fff;background:rgba(8,21,33,.88);border:1px solid rgba(53,194,255,.5);border-radius:99px;padding:9px 16px;box-shadow:0 10px 30px rgba(0,0,0,.4)}",
    ".fcdq .gift{display:table;margin:16px auto 0;max-width:340px;font-size:13.5px;line-height:1.45;font-weight:600;color:#dff4ff;background:rgba(53,194,255,.1);border:1px solid rgba(53,194,255,.35);border-radius:18px;padding:9px 16px;text-align:center;text-wrap:balance}",
    ".fcdq .proof{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px 10px;margin-top:18px;font-size:14px;color:#cfe1ee}",
    ".fcdq .proof .av{display:flex}",
    ".fcdq .proof img{width:32px;height:32px;border-radius:50%;border:2px solid #0b1c28;margin-left:-10px;object-fit:cover;display:block;background:#16455f}",
    ".fcdq .proof img:first-child{margin-left:0}",
    ".fcdq .proof b{color:#fff}",
    ".fcdq .areas{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin-top:22px}",
    ".fcdq .areas span{font-size:12px;font-weight:700;color:var(--mu);border:1px solid var(--ln);border-radius:99px;padding:5px 10px}",
    /* barras por área */
    ".fcdq .bars{display:flex;flex-direction:column;gap:12px}",
    ".fcdq .bar .t{display:flex;justify-content:space-between;font-size:13.5px;font-weight:700;color:#dbe9f4;margin-bottom:6px}",
    ".fcdq .bar .t b{font-family:var(--font-sora,Sora),sans-serif;font-weight:800}",
    ".fcdq .bar .tr{height:9px;border-radius:9px;background:rgba(255,255,255,.08);overflow:hidden}",
    ".fcdq .bar .tr i{display:block;height:100%;border-radius:9px;background:linear-gradient(90deg,var(--bd),var(--b));transform-origin:left;animation:fcdq-grow .9s ease both}",
    ".fcdq .bar.lo .tr i{background:linear-gradient(90deg,#ff5c5c,#ff9a7a)}",
    ".fcdq .bar.lo .t b{color:#ff9a8a}",
    ".fcdq .bar.mid .tr i{background:linear-gradient(90deg,#d99a2b,#ffc65c)}",
    ".fcdq .bar.mid .t b{color:#ffd27a}",
    "@keyframes fcdq-grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}",
    /* quiz */
    ".fcdq .qz{padding:22px 0 30px;min-height:70vh}",
    ".fcdq .qtop{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:28px}",
    ".fcdq .back{background:none;border:0;color:var(--mu);font-weight:700;font-size:13px;padding:6px 0}",
    ".fcdq .count{font-size:12px;font-weight:700;color:var(--mu2)}",
    ".fcdq .pills{display:flex;gap:4px;margin:10px 0 0}",
    ".fcdq .pills i{flex:1;height:6px;border-radius:9px;background:rgba(255,255,255,.1);transition:background .3s}",
    ".fcdq .pills i.on{background:linear-gradient(90deg,var(--bd),var(--b))}",
    ".fcdq .pills i.now{background:rgba(53,194,255,.45)}",
    ".fcdq .q{font-size:clamp(25px,6.8vw,32px);line-height:1.15;color:#fff;text-align:center;margin:30px 0 8px;text-wrap:balance;outline:none}",
    ".fcdq .qs{text-align:center;color:var(--mu);font-size:14.5px;margin-bottom:6px}",
    ".fcdq .opts{display:flex;flex-direction:column;gap:10px;margin-top:22px}",
    ".fcdq .opt{display:flex;align-items:center;gap:12px;width:100%;text-align:left;font-size:16px;font-weight:600;color:var(--tx);border:1px solid rgba(255,255,255,.16);border-radius:16px;padding:16px 16px;background:rgba(255,255,255,.04);transition:border-color .2s,background .2s,transform .15s}",
    ".fcdq .opt .lt{flex:0 0 28px;width:28px;height:28px;border-radius:9px;border:1px solid rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;font-size:12.5px;font-weight:800;color:var(--mu);text-transform:uppercase}",
    "@media (hover:hover){.fcdq .opt:hover{border-color:rgba(53,194,255,.7);background:rgba(53,194,255,.1)}}",
    ".fcdq .opt:active{transform:scale(.99)}",
    ".fcdq .opt.sel{border-color:var(--b);background:rgba(53,194,255,.18)}",
    ".fcdq .opt.sel .lt{background:var(--b);border-color:var(--b);color:var(--ink)}",
    ".fcdq .fld{display:block;width:100%;margin-top:24px;font:inherit;font-size:18px;color:#fff;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.2);border-radius:16px;padding:16px 18px}",
    ".fcdq textarea.fld{min-height:130px;resize:vertical;font-size:16px;line-height:1.5}",
    ".fcdq .fld::placeholder{color:#6f8798}",
    ".fcdq .fld:focus{border-color:var(--b);outline:none}",
    ".fcdq .qz .btn{margin-top:18px}",
    /* analizando */
    ".fcdq .an{padding:60px 0 80px;text-align:center;min-height:70vh}",
    ".fcdq .spin{width:54px;height:54px;margin:0 auto 22px;border-radius:50%;border:4px solid rgba(255,255,255,.1);border-top-color:var(--b);animation:fcdq-spin .8s linear infinite}",
    "@keyframes fcdq-spin{to{transform:rotate(360deg)}}",
    ".fcdq .an h2{font-size:clamp(26px,7vw,32px);color:#fff;line-height:1.15}",
    ".fcdq .chk{list-style:none;display:flex;flex-direction:column;gap:10px;max-width:300px;margin:26px auto 0;text-align:left}",
    ".fcdq .chk li{display:flex;align-items:center;gap:10px;font-size:15px;color:var(--mu2);transition:color .3s}",
    ".fcdq .chk li i{flex:0 0 22px;width:22px;height:22px;border-radius:50%;border:2px solid rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;font-style:normal;font-size:12px;font-weight:900;color:transparent;transition:all .3s}",
    ".fcdq .chk li.ok{color:#eaf3fb}",
    ".fcdq .chk li.ok i{background:#8fe6b0;border-color:#8fe6b0;color:#06261c}",
    /* adelanto y plan */
    ".fcdq .card{border-radius:20px;border:1px solid var(--ln);background:rgba(255,255,255,.035);padding:20px 18px}",
    ".fcdq .card+.card{margin-top:14px}",
    ".fcdq .kk{font-size:11px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;color:var(--b);margin-bottom:10px}",
    ".fcdq .res{padding:28px 0 40px}",
    ".fcdq .res .ttl{font-size:clamp(28px,7.6vw,38px);line-height:1.12;color:#fff;text-align:center;margin:12px 0 20px;text-wrap:balance}",
    ".fcdq .score{display:flex;align-items:center;gap:16px;margin-bottom:18px}",
    ".fcdq .ring{flex:0 0 84px;width:84px;height:84px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-direction:column;background:conic-gradient(var(--b) calc(var(--p)*1%),rgba(255,255,255,.08) 0)}",
    ".fcdq .ring span{width:68px;height:68px;border-radius:50%;background:#0b1c2a;display:flex;align-items:center;justify-content:center;flex-direction:column;font-family:var(--font-sora,Sora),sans-serif;font-weight:800;font-size:24px;color:#fff;line-height:1}",
    ".fcdq .ring small{font-family:var(--font-inter,Inter),sans-serif;font-size:10px;font-weight:700;color:var(--mu2);margin-top:3px}",
    ".fcdq .score p{font-size:14.5px;color:#cfe1ee;line-height:1.45}",
    ".fcdq .score p b{color:#fff}",
    ".fcdq .pain{border-color:rgba(255,92,92,.4);background:rgba(255,92,92,.07)}",
    ".fcdq .pain .kk{color:#ffb3b3}",
    ".fcdq .pain h3{font-size:clamp(22px,6vw,26px);line-height:1.15;color:#fff;margin-bottom:8px}",
    ".fcdq .pain p{font-size:15px;color:#dbe9f4;line-height:1.6}",
    ".fcdq .steps{position:relative}",
    ".fcdq .step{display:flex;gap:12px;padding:12px 0;border-top:1px solid rgba(255,255,255,.06)}",
    ".fcdq .step:first-of-type{border-top:0}",
    ".fcdq .step .n{flex:0 0 30px;width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,var(--bd),var(--b));color:var(--ink);font-weight:900;font-size:14px;display:flex;align-items:center;justify-content:center}",
    ".fcdq .step b{display:block;color:#fff;font-size:15.5px}",
    ".fcdq .step small{display:block;color:var(--mu2);font-size:11.5px;font-weight:800;letter-spacing:1px;text-transform:uppercase}",
    ".fcdq .step span{display:block;color:#cfe1ee;font-size:14px;margin-top:2px}",
    ".fcdq .lockd .step span,.fcdq .lockd .step b{filter:blur(5px);user-select:none}",
    ".fcdq .lockd .lock{top:58%}",
    ".fcdq .fine{text-align:center;font-size:12.5px;color:var(--mu2);margin-top:10px}",
    /* formulario */
    ".fcdq .cap{padding:24px 0 40px}",
    ".fcdq .cap h2{font-size:clamp(27px,7.4vw,36px);line-height:1.12;color:#fff;text-align:center;margin-top:12px;text-wrap:balance}",
    ".fcdq .cap .sub{text-align:center;color:#cfe1ee;font-size:15px;margin:10px auto 18px;max-width:390px;text-wrap:balance}",
    ".fcdq .inc{list-style:none;display:flex;flex-direction:column;gap:8px;margin:0 auto 18px;max-width:360px}",
    ".fcdq .inc li{display:flex;gap:10px;font-size:14.5px;color:#dbe9f4}",
    ".fcdq .inc li::before{content:'✓';color:#8fe6b0;font-weight:900}",
    ".fcdq .frm{position:relative;min-height:792px;border-radius:16px;overflow:hidden;background:#fff}",
    ".fcdq .frm iframe{width:100%;height:792px;border:0;display:block;position:relative}",
    ".fcdq .frm .ld{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#0b1722}",
    /* plan */
    ".fcdq.plan{padding-top:22px;padding-bottom:10px}",
    ".fcdq .ok{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:800;color:#8fe6b0;background:rgba(127,224,166,.1);border:1px solid rgba(127,224,166,.3);border-radius:99px;padding:6px 12px}",
    ".fcdq .ctr{text-align:center}",
    ".fcdq .goal{font-family:var(--font-instrument,'Instrument Serif'),Georgia,serif;font-style:italic;font-size:21px;line-height:1.35;color:#fff}",
    ".fcdq .ph{position:relative;padding:0 0 18px 22px;border-left:2px solid rgba(53,194,255,.3);margin-left:7px}",
    ".fcdq .ph:last-child{padding-bottom:0;border-left-color:transparent}",
    ".fcdq .ph::before{content:'';position:absolute;left:-8px;top:3px;width:14px;height:14px;border-radius:50%;background:var(--b);box-shadow:0 0 0 4px #0b1c2a}",
    ".fcdq .ph small{display:block;font-size:11px;font-weight:900;letter-spacing:1.4px;text-transform:uppercase;color:var(--b)}",
    ".fcdq .ph h3{font-size:22px;line-height:1.15;color:#fff;margin:2px 0 8px}",
    ".fcdq .ph ul{list-style:none;display:flex;flex-direction:column;gap:7px}",
    ".fcdq .ph li{position:relative;padding-left:18px;font-size:14.5px;color:#cfe1ee;line-height:1.5}",
    ".fcdq .ph li::before{content:'→';position:absolute;left:0;color:var(--b);font-weight:900}",
    ".fcdq .today{border-color:rgba(53,194,255,.5);background:linear-gradient(180deg,rgba(53,194,255,.14),rgba(53,194,255,.04))}",
    ".fcdq .today p{font-size:15.5px;color:#fff;line-height:1.55}",
    ".fcdq .tx{font-size:15px;color:#cfe1ee;line-height:1.6}",
    ".fcdq .cta{margin-top:18px;text-align:center}",
    ".fcdq .cta h3{font-size:clamp(25px,6.8vw,30px);line-height:1.12;color:#fff;margin-bottom:8px;text-wrap:balance}",
    ".fcdq .cta p{font-size:14.5px;color:#cfe1ee;margin-bottom:16px}",
    ".fcdq .div{display:flex;align-items:center;gap:12px;margin:34px 0 0;color:var(--mu2);font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase}",
    ".fcdq .div::before,.fcdq .div::after{content:'';flex:1;height:1px;background:var(--ln)}",
    "@media (prefers-reduced-motion:reduce){.fcdq *{animation:none!important;transition:none!important}}"
  ].join("\n");

  function estilos() {
    if (document.getElementById("fcdq-css")) return;
    var st = document.createElement("style");
    st.id = "fcdq-css";
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  /* ── Piezas de interfaz ────────────────────────────────────────────────── */
  function barras(s, peor) {
    return '<div class="bars">' + AREAS.map(function (x) {
      var v = s[x.k];
      var cls = v < 40 ? " lo" : v < 60 ? " mid" : "";
      return '<div class="bar' + cls + '"><div class="t"><span>' + x.n + (x.k === peor ? " · tu mayor freno" : "") + '</span><b>' + v + '%</b></div><div class="tr"><i style="width:' + v + '%"></i></div></div>';
    }).join("") + "</div>";
  }

  function ring(p) { return '<div class="ring" style="--p:' + p + '"><span>' + p + '<small>de 100</small></span></div>'; }

  /* ── QUIZ ──────────────────────────────────────────────────────────────── */
  function montarQuiz(root) {
    var st = { paso: "hero", a: {}, n: "", meta: "" };
    try { var g = JSON.parse(ss(true, PROGRESO) || "null"); if (g && g.a) st = g; } catch (e) {}
    if (st.paso === "analizando") st.paso = "adelanto";
    var analisisTimer = null;

    function salvar() { ss(false, PROGRESO, JSON.stringify(st)); }
    function datos() { return { v: 1, n: st.n, a: st.a, o: st.meta, t: Date.now() }; }

    function ir(paso, enfocar) {
      st.paso = paso;
      salvar();
      pintar();
      var r = root.getBoundingClientRect();
      if (r.top < 0 || r.top > window.innerHeight * 0.4) root.scrollIntoView({ behavior: "smooth", block: "start" });
      if (enfocar !== false) {
        var h = root.querySelector("[data-focus]");
        if (h) try { h.focus({ preventScroll: true }); } catch (e) {}
      }
    }

    function heroHTML() {
      var mock = '<div class="mock" aria-hidden="true"><div class="in"><div class="hd"><b>Tu diagnóstico personal</b><span class="sc">58%</span></div>' +
        barras({ ali: 46, ent: 31, hor: 63, ene: 38, men: 55 }, "") +
        '<div class="ln" style="width:92%;margin-top:18px"></div><div class="ln" style="width:74%"></div><div class="ln" style="width:83%"></div></div>' +
        '<span class="lock">🔒 Tu resultado aparecerá aquí</span></div>';
      return '<section class="hero">' +
        '<p class="eb">Diagnóstico gratuito</p>' +
        '<h1 class="serif">Descubre por qué tu cuerpo <span class="pill">no responde</span> y recibe tu plan para volver a verte bien</h1>' +
        '<p class="sub">Responde unas preguntas rápidas sobre tu alimentación, entrenamiento, ciclo, energía y mentalidad, y te doy tu plan paso a paso.</p>' +
        mock +
        '<button type="button" class="btn" data-act="empezar">Obtener mi plan gratis →</button>' +
        '<div class="meta"><span><i>✓</i> Unos 2 minutos</span><span><i>✓</i> Sin llamada</span><span><i>✓</i> 100% gratis</span></div>' +
        '<p class="gift">🎁 Y de regalo, todos mis recursos gratuitos para mejorar tu salud y cómo te ves</p>' +
        '<div class="proof"><span class="av" aria-hidden="true"><img src="' + BASE + '/avatar-1.jpg?v=2" alt=""><img src="' + BASE + '/avatar-2.jpg?v=2" alt=""><img src="' + BASE + '/avatar-3.jpg?v=2" alt=""></span><span><b>+1.000 mujeres</b> lo han conseguido</span></div>' +
        '<div class="areas" aria-label="Áreas que analiza el diagnóstico">' + AREAS.map(function (x) { return "<span>" + x.n + "</span>"; }).join("") + "</div>" +
        "</section>";
    }

    function preguntaHTML(i) {
      var p = Q[i];
      var n = nombreCorto(st.n);
      var texto = p.q.replace("{n}, ", n ? n + ", " : "").replace("{n}", n);
      if (!n) texto = texto.charAt(0).toUpperCase() + texto.slice(1);
      var pills = Q.map(function (_, j) { return '<i class="' + (j < i ? "on" : j === i ? "now" : "") + '"></i>'; }).join("");
      var top = '<div class="qtop">' + (i > 0 ? '<button type="button" class="back" data-act="atras">← Atrás</button>' : "<span></span>") +
        '<span class="count">' + (i + 1) + " de " + Q.length + "</span></div>" +
        '<div class="pills" role="progressbar" aria-valuemin="1" aria-valuemax="' + Q.length + '" aria-valuenow="' + (i + 1) + '" aria-label="Progreso del diagnóstico">' + pills + "</div>";
      var cuerpo;
      if (p.tipo === "nombre") {
        cuerpo = '<label class="sr" for="fcdq-n">Tu nombre</label><input id="fcdq-n" class="fld" type="text" autocomplete="given-name" maxlength="40" placeholder="Tu nombre" value="' + esc(st.n) + '">' +
          '<button type="button" class="btn" data-act="nombre"' + (st.n.trim() ? "" : " disabled") + ">Empezar →</button>";
      } else if (p.tipo === "abierta") {
        cuerpo = '<label class="sr" for="fcdq-m">Tu respuesta</label><textarea id="fcdq-m" class="fld" maxlength="220" placeholder="' + esc(p.ph) + '">' + esc(st.meta) + "</textarea>" +
          '<button type="button" class="btn" data-act="meta">Siguiente →</button>' +
          '<button type="button" class="lnk" data-act="saltar">Prefiero saltar esta pregunta</button>';
      } else {
        cuerpo = '<div class="opts" role="group" aria-label="Opciones">' + p.o.map(function (t, j) {
          var sel = st.a[p.id] === L[j];
          return '<button type="button" class="opt' + (sel ? " sel" : "") + '" data-op="' + L[j] + '" aria-pressed="' + sel + '"><span class="lt" aria-hidden="true">' + L[j] + "</span><span>" + esc(t) + "</span></button>";
        }).join("") + "</div>";
      }
      return '<section class="qz">' + top + '<h2 class="q serif" tabindex="-1" data-focus>' + esc(texto) + "</h2>" + (p.sub ? '<p class="qs">' + esc(p.sub) + "</p>" : "") + cuerpo + "</section>";
    }

    function analizandoHTML() {
      var items = ["Alimentación", "Entrenamiento", "Hormonas y ciclo", "Energía y descanso", "Mentalidad"];
      return '<section class="an" aria-live="polite"><div class="spin" aria-hidden="true"></div><h2 class="serif" tabindex="-1" data-focus>Analizando tus respuestas…</h2>' +
        '<ul class="chk">' + items.map(function (t) { return "<li><i aria-hidden=\"true\">✓</i>" + t + "</li>"; }).join("") + "</ul></section>";
    }

    function adelantoHTML() {
      var p = construir(datos());
      var n = nombreCorto(st.n);
      var pasos = p.fases.map(function (f, i) { return '<div class="step"><span class="n">' + (i + 1) + '</span><div><small>' + f.k + "</small><b>" + esc(f.t) + "</b><span>" + esc(f.l[0]) + "</span></div></div>"; }).join("");
      return '<section class="res">' +
        '<p class="eb">Tu adelanto</p>' +
        '<h2 class="ttl serif" tabindex="-1" data-focus>' + (n ? esc(n) + ", ya " : "Ya ") + "sé qué te está frenando</h2>" +
        '<div class="card"><div class="score">' + ring(p.media) + "<p>Tu puntuación global es <b>" + p.media + " de 100</b>. Tu mayor freno ahora mismo es <b>" + esc(p.areaNombre.toLowerCase()) + "</b>.</p></div>" + barras(p.s, p.area) + "</div>" +
        '<div class="card pain"><p class="kk">Lo que te está pasando</p><h3 class="serif">' + esc(p.freno[0]) + "</h3><p>" + esc(p.freno[1]) + "</p></div>" +
        '<div class="card steps lockd"><p class="kk">Tu plan de 12 semanas</p>' + pasos + '<span class="lock">🔒 Desbloquea tu plan completo</span></div>' +
        '<div style="margin-top:20px"><button type="button" class="btn" data-act="desbloquear">Ver mi plan completo →</button></div>' +
        '<p class="fine">Gratis · Sin llamada · Lo ves al instante</p>' +
        "</section>";
    }

    function formularioHTML() {
      var n = nombreCorto(st.n);
      return '<section class="cap">' +
        '<p class="eb">Último paso</p>' +
        '<h2 class="serif" tabindex="-1" data-focus>' + (n ? esc(n) + ", ¿a" : "¿A") + " dónde te envío tu plan?</h2>" +
        '<p class="sub">Déjame tus datos y lo verás al instante en la siguiente página.</p>' +
        '<ul class="inc"><li>Tu plan personalizado de 12 semanas</li><li>Tu primer paso para empezar hoy</li><li>Todos mis recursos gratuitos</li></ul>' +
        '<div class="frm"><div class="ld" aria-hidden="true"><div class="spin" style="margin:0"></div></div>' +
        '<iframe src="https://links.fitcondamian.com/widget/form/' + FORM_ID + '" id="inline-' + FORM_ID + '" data-layout="{\'id\':\'INLINE\'}" data-trigger-type="alwaysShow" data-trigger-value="" data-activation-type="alwaysActivated" data-activation-value="" data-deactivation-type="neverDeactivate" data-deactivation-value="" data-form-name="01 - Formulario LM Youtube" data-height="792" data-layout-iframe-id="inline-' + FORM_ID + '" data-form-id="' + FORM_ID + '" title="01 - Formulario LM Youtube"></iframe></div>' +
        '<p class="fine">Sin spam · Tus datos están seguros</p>' +
        '<button type="button" class="lnk" data-act="volver-adelanto">← Volver a mi adelanto</button>' +
        "</section>";
    }

    function cargarFormEmbed() {
      var fr = root.querySelector(".frm iframe");
      var ld = root.querySelector(".frm .ld");
      if (fr && ld) fr.addEventListener("load", function () { ld.style.display = "none"; });
      var s = document.createElement("script");
      s.src = "https://links.fitcondamian.com/js/form_embed.js";
      s.type = "text/javascript";
      document.body.appendChild(s);
    }

    function pintar() {
      if (analisisTimer) { clearTimeout(analisisTimer); analisisTimer = null; }
      var p = st.paso;
      if (p === "hero") root.innerHTML = heroHTML();
      else if (typeof p === "number") root.innerHTML = preguntaHTML(p);
      else if (p === "analizando") {
        root.innerHTML = analizandoHTML();
        var lis = root.querySelectorAll(".chk li"), k = 0;
        (function tick() {
          if (k < lis.length) { lis[k].className = "ok"; k++; analisisTimer = setTimeout(tick, 520); }
          else analisisTimer = setTimeout(function () { ir("adelanto"); }, 450);
        })();
      }
      else if (p === "adelanto") root.innerHTML = adelantoHTML();
      else if (p === "form") { root.innerHTML = formularioHTML(); cargarFormEmbed(); }
      var inp = root.querySelector("#fcdq-n");
      if (inp) {
        var b = root.querySelector('[data-act="nombre"]');
        inp.addEventListener("input", function () { st.n = inp.value; b.disabled = !inp.value.trim(); });
        inp.addEventListener("keydown", function (e) { if (e.key === "Enter" && inp.value.trim()) { e.preventDefault(); siguiente(); } });
      }
      var ta = root.querySelector("#fcdq-m");
      if (ta) ta.addEventListener("input", function () { st.meta = ta.value; });
    }

    function siguiente() {
      var i = st.paso;
      if (i + 1 < Q.length) ir(i + 1);
      else {
        guardar(datos());
        track("quiz_completado", { freno: construir(datos()).area });
        ir("analizando");
      }
    }

    root.addEventListener("click", function (e) {
      var op = e.target.closest("[data-op]");
      if (op && typeof st.paso === "number") {
        var p = Q[st.paso];
        st.a[p.id] = op.getAttribute("data-op");
        root.querySelectorAll(".opt").forEach(function (b) { var on = b === op; b.classList.toggle("sel", on); b.setAttribute("aria-pressed", String(on)); });
        guardar(datos());
        setTimeout(siguiente, 220);
        return;
      }
      var act = e.target.closest("[data-act]");
      if (!act) return;
      var a = act.getAttribute("data-act");
      if (a === "empezar") { track("quiz_inicio"); ir(0); }
      else if (a === "atras") { if (typeof st.paso === "number" && st.paso > 0) ir(st.paso - 1); }
      else if (a === "nombre") { st.n = (root.querySelector("#fcdq-n") || {}).value || st.n; if (st.n.trim()) siguiente(); }
      else if (a === "meta") { var t = root.querySelector("#fcdq-m"); st.meta = t ? t.value.trim() : st.meta; siguiente(); }
      else if (a === "saltar") { st.meta = ""; siguiente(); }
      else if (a === "desbloquear") { guardar(datos()); track("registro"); ir("form"); }
      else if (a === "volver-adelanto") ir("adelanto");
    });

    pintar();
  }

  /* ── PLAN (página de acceso) ───────────────────────────────────────────── */
  function montarPlan(root) {
    var d = cargar();
    if (!d) { root.innerHTML = ""; root.style.display = "none"; return; }
    var p = construir(d);
    var n = nombreCorto(d.n);
    var fasesHTML = p.fases.map(function (f) {
      return '<div class="ph"><small>' + f.k + '</small><h3 class="serif">' + esc(f.t) + "</h3><ul>" + f.l.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>";
    }).join("");
    var invertir = d.a && d.a.invertir;
    var ctaTxt = invertir === "c"
      ? "Si en algún momento quieres ir más rápido, en una llamada gratuita de 30 minutos revisamos tu plan y te digo cómo aplicarlo a tu caso."
      : "En una llamada gratuita de 30 minutos revisamos tu plan juntos y te digo exactamente cómo aplicarlo a tu cuerpo y a tu día a día.";
    root.innerHTML = '<section class="res" style="padding-top:0">' +
      '<div class="ctr"><span class="ok">✓ Plan desbloqueado</span></div>' +
      '<h1 class="ttl serif">' + (n ? esc(n) + ", este es tu plan" : "Este es tu plan") + ' <span class="pill">personalizado</span></h1>' +
      '<div class="card"><div class="score">' + ring(p.media) + "<p>Tu puntuación global es <b>" + p.media + " de 100</b>. Tu mayor freno es <b>" + esc(p.areaNombre.toLowerCase()) + "</b>: por ahí empieza tu plan.</p></div>" + barras(p.s, p.area) + "</div>" +
      (d.o ? '<div class="card"><p class="kk">Tu objetivo a 90 días</p><p class="goal">«' + esc(d.o) + "»</p></div>" : "") +
      '<div class="card pain"><p class="kk">Lo que te está pasando</p><h3 class="serif">' + esc(p.freno[0]) + "</h3><p>" + esc(p.freno[1]) + "</p></div>" +
      '<div class="card"><p class="kk">Por qué no te ha funcionado hasta ahora</p><p class="tx">' + esc(p.porque) + (p.edad ? " " + esc(p.edad) : "") + "</p></div>" +
      '<div class="card"><p class="kk">Tu plan de 12 semanas</p>' + fasesHTML + "</div>" +
      '<div class="card today"><p class="kk">Tu primer paso, hoy mismo</p><p>' + esc(p.hoy) + "</p></div>" +
      '<div class="card cta"><h3 class="serif">¿Quieres que te ayude a aplicarlo?</h3><p>' + ctaTxt + '</p><a class="btn" href="#agendar" data-agendar>📞 Revisar mi plan en una llamada gratis</a><p class="fine">30 minutos · 100% gratuito · sin compromiso</p></div>' +
      '<div class="div">Antes de la llamada, mira este vídeo</div>' +
      "</section>";
    var a = root.querySelector("[data-agendar]");
    if (a) a.addEventListener("click", function (e) {
      var t = document.getElementById("agendar") || document.getElementById("fcd-agendar");
      track("plan_agendar");
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: "smooth", block: "start" }); }
    });
    track("plan_visto", { freno: p.area });
  }

  /* ── Arranque ──────────────────────────────────────────────────────────── */
  function mountAll() {
    estilos();
    document.querySelectorAll("[data-fcd]").forEach(function (el) {
      if (el.getAttribute("data-fcd-on")) return;
      el.setAttribute("data-fcd-on", "1");
      el.classList.add("fcdq");
      var modo = el.getAttribute("data-fcd");
      if (modo === "quiz") montarQuiz(el);
      else if (modo === "plan") { el.classList.add("plan"); montarPlan(el); }
    });
  }

  window.FCDQuiz = { mountAll: mountAll, construir: construir, cargar: cargar, preguntas: Q };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountAll);
  else mountAll();
})();

/* ─────────────────────────────────────────────────────────────────────────
   Fit con Damián · Quiz funnel «Diagnóstico gratis + plan personalizado»

   Un solo script para la web (fitcondamian.com) y para GoHighLevel:
     <div data-fcd="quiz"></div>   → portada con la pregunta 1, preguntas,
                                     adelanto y formulario
     <div data-fcd="plan"></div>   → plan personalizado (página de acceso)
     <script src="https://fitcondamian.com/fcd-quiz.js"></script>

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
  var PROGRESO = "fcd_quiz_progreso_v2";
  var MAX_TXT = 500;

  /* ── Preguntas ─────────────────────────────────────────────────────────── */
  var Q = [
    { id: "espejo", sec: "Tu cuerpo", q: "¿Qué es lo que más te molesta cuando te miras al espejo?", o: ["La tripa y los rollitos de la espalda", "La flacidez en brazos, piernas o glúteos", "Me veo hinchada casi siempre", "He ganado peso y no consigo bajarlo", "Ya no reconozco mi cuerpo"] },
    { id: "edad", sec: "Tu cuerpo", q: "¿Cuántos años tienes?", sub: "Tu cuerpo no responde igual a los 25 que a los 38.", o: ["Entre 24 y 29", "Entre 30 y 34", "Entre 35 y 40", "Más de 40"] },
    { id: "situacion", sec: "Tu cuerpo", tipo: "abierta", q: "Cuéntame tu situación: cómo te ves y te sientes ahora, y cómo te gustaría verte.", sub: "Cuanto más concreta seas, más preciso será tu plan. Respuestas vagas dan un plan vago.", ph: "Ej.: Desde que tuve a mi hija no consigo quitarme la tripa, me noto flácida y quiero volver a ponerme mis vaqueros." },
    { id: "comida", sec: "Tus hábitos", q: "¿Cómo describirías tu alimentación?", o: ["Como sano, pero no bajo", "Picoteo y como a deshoras", "Hago dietas estrictas y luego lo dejo", "Como fuera a menudo por trabajo o planes"] },
    { id: "entreno", sec: "Tus hábitos", q: "¿Qué ejercicio haces ahora mismo?", o: ["Nada o casi nada", "Cardio: caminar, correr o clases", "Pesas, pero sin un plan claro", "Pesas con un plan"] },
    { id: "tiempo", sec: "Tus hábitos", q: "¿Cuánto tiempo real tienes para entrenar?", sub: "Siendo realista con tu semana, no con la semana ideal.", o: ["Menos de 2 horas a la semana", "Entre 2 y 3 horas a la semana", "Entre 3 y 5 horas a la semana", "Más de 5 horas a la semana"] },
    { id: "ciclo", sec: "Tus hábitos", q: "¿Cómo es tu ciclo menstrual?", sub: "Tus hormonas cambian cómo quemas grasa y cómo retienes líquidos.", o: ["Regular y sin muchos síntomas", "Irregular, o tengo SOP", "Mucha retención y antojos antes de la regla", "Tomo anticonceptivos o no lo sé"] },
    { id: "energia", sec: "Tus hábitos", q: "¿Cómo está tu energía durante el día?", o: ["Me levanto ya cansada", "Tengo un bajón después de comer", "Llego sin fuerzas a la noche", "Bien en general"] },
    { id: "freno", sec: "Tu objetivo", tipo: "abierta", q: "En tu opinión, ¿qué es lo que más te frena hoy para conseguirlo?", sub: "Lo que sientes tú, aunque no estés segura de que sea la causa real.", ph: "Ej.: Empiezo con muchas ganas y a las tres semanas lo dejo." },
    { id: "peso", sec: "Tu objetivo", q: "¿Cuánto tiempo llevas intentando cambiar tu cuerpo?", o: ["Menos de 6 meses", "Entre 6 meses y 2 años", "Más de 2 años", "Bajo y vuelvo a subir (efecto rebote)"] },
    { id: "probado", sec: "Tu objetivo", tipo: "abierta", q: "¿Qué has probado que no te ha funcionado?", sub: "Así no te recomiendo repetir lo mismo. Si es la primera vez que lo intentas, escribe «nada todavía».", ph: "Ej.: Hice dieta keto dos meses, bajé 5 kilos y los recuperé todos." },
    { id: "nohacer", sec: "Tu objetivo", tipo: "abierta", q: "¿Hay algo que no quieras hacer sí o sí?", sub: "Ej.: contar calorías, ir al gimnasio, correr, dejar el pan… Si no hay nada, escribe «nada».", ph: "Ej.: No quiero pasar hambre ni pesar la comida." },
    { id: "prioridad", sec: "Tu objetivo", q: "¿Qué tan importante es para ti cambiar tu cuerpo ahora?", sub: "Me ayuda a priorizar tu plan y el seguimiento.", o: ["Es mi prioridad número uno ahora", "Muy importante: quiero conseguirlo en los próximos meses", "Importante, pero ahora tengo otras prioridades", "Poco importante: solo estoy mirando"] }
  ];
  var L = "abcde";

  var AREAS = [
    { k: "ali", n: "Alimentación" },
    { k: "ent", n: "Entrenamiento" },
    { k: "hor", n: "Hormonas y ciclo" },
    { k: "ene", n: "Energía" },
    { k: "men", n: "Constancia" }
  ];

  /* ── Utilidades ────────────────────────────────────────────────────────── */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function clamp(v) { return Math.max(12, Math.min(88, Math.round(v))); }
  function track(name, data) { try { if (typeof window.va === "function") window.va("event", { name: name, data: data }); } catch (e) {} }
  function ls(get, k, v) { try { if (get) return window.localStorage.getItem(k); window.localStorage.setItem(k, v); } catch (e) {} return null; }
  function ss(get, k, v) { try { if (get) return window.sessionStorage.getItem(k); window.sessionStorage.setItem(k, v); } catch (e) {} return null; }
  function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function vacio(s) { return !s || /^\s*(nada|nada todavia|ninguno|ninguna|no|-)\s*\.?\s*$/.test(norm(s)); }

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

  /* ── Lo que dice con sus palabras: qué la frena ─────────────────────────── */
  function tipoFreno(t) {
    t = norm(t);
    if (/ansiedad|antojo|dulce|atracon|comer emocional|picar|picoteo|hambre/.test(t)) return "d";
    if (/tiempo|trabajo|hijo|nino|nina|bebe|turno|horario|no llego|agenda/.test(t)) return "c";
    if (/no se |no se$|que hacer|informacion|perdida|por donde|confus|no entiendo|como empezar/.test(t)) return "b";
    return "a"; // constancia: empezar y dejarlo (lo más habitual)
  }

  /* ── Diagnóstico: puntuación por área (más alto = mejor) ───────────────── */
  function puntuar(a, t) {
    var s = {};
    s.ali = { a: 52, b: 30, c: 26, d: 36 }[a.comida] || 45;
    if (a.peso === "d") s.ali -= 8;
    if (a.espejo === "a" || a.espejo === "d") s.ali -= 5;
    s.ent = { a: 16, b: 34, c: 52, d: 76 }[a.entreno] || 40;
    if (a.tiempo === "a") s.ent -= 8; else if (a.tiempo === "d") s.ent += 4;
    if (a.espejo === "b") s.ent -= 6;
    s.hor = { a: 72, b: 30, c: 36, d: 52 }[a.ciclo] || 52;
    if (a.espejo === "c") s.hor -= 10;
    if (a.edad === "c" || a.edad === "d") s.hor -= 6;
    s.ene = { a: 22, b: 40, c: 34, d: 74 }[a.energia] || 45;
    s.men = { a: 30, b: 46, c: 42, d: 28 }[tipoFreno(t.freno)];
    if (a.peso === "c") s.men -= 8;
    if (a.peso === "d") s.men -= 4;
    if (a.espejo === "e") s.men -= 4;
    Object.keys(s).forEach(function (k) { s[k] = clamp(s[k]); });
    return s;
  }
  function peorArea(s) { return AREAS.slice().sort(function (x, y) { return s[x.k] - s[y.k]; })[0].k; }
  function media(s) { return Math.round(AREAS.reduce(function (t, x) { return t + s[x.k]; }, 0) / AREAS.length); }
  function etiqueta(v, peor) { return peor ? ["t-fr", "Tu freno"] : v >= 60 ? ["t-ok", "Sólido"] : ["t-mej", "Mejorar"]; }

  /* ── Textos del plan ───────────────────────────────────────────────────── */
  var CUESTA = { ali: "tu alimentación", ent: "tu entrenamiento", hor: "tus hormonas", ene: "tu energía", men: "tu constancia" };

  var FRENO = {
    ali: {
      a: "Comes sano y aun así no bajas. No es culpa tuya: lo más habitual es comer poca proteína y, en general, demasiado poco. Tu cuerpo se pone en modo ahorro, pierde músculo y se aferra a la grasa. Por eso te ves igual, o más flácida, aunque lo hagas «todo bien».",
      b: "Comer a deshoras dispara tu azúcar en sangre y tu hambre. No es falta de fuerza de voluntad: es que tus comidas no te sacian. Cuando cada comida lleva la proteína y la fibra que necesitas, el picoteo baja solo.",
      c: "Cada dieta muy estricta te quita músculo y enseña a tu cuerpo a defenderse. Al dejarla recuperas el peso… y algo más. No necesitas otra dieta de tres semanas: necesitas una forma de comer que puedas mantener.",
      d: "Con tu ritmo de vida no puedes depender de cocinar perfecto. Sin unas reglas sencillas para elegir bien fuera de casa, cada comida es una lotería, y la báscula no se mueve."
    },
    ent: {
      a: "Sin entrenamiento de fuerza pierdes un poco de músculo cada año. Menos músculo es más flacidez y un metabolismo más lento: comes lo mismo y engordas más. Es justo lo que más rápido cambia cuando empiezas bien.",
      b: "Caminar o correr es genial para la salud, pero por sí solo no tonifica: puedes bajar de peso y seguir viéndote flácida. Lo que da forma a glúteos, brazos y abdomen es la fuerza bien programada.",
      c: "Entrenas, pero sin progresión (más peso, más repeticiones, mejor técnica) tu cuerpo se acostumbra y deja de cambiar. Estás poniendo el esfuerzo sin recibir el resultado.",
      d: "Entrenas con plan, pero si no está adaptado a tu ciclo, tu descanso y tu alimentación, el resultado se queda corto. Ese ajuste fino es lo que ahora marca la diferencia."
    },
    hor: {
      a: "La hinchazón y la retención pueden esconder kilos de cambio real. Mientras tu cuerpo esté inflamado, por mucho que hagas no verás tus avances en el espejo.",
      b: "Con un ciclo irregular o SOP, la resistencia a la insulina hace que almacenes grasa con más facilidad, sobre todo en la tripa. Comer menos no lo arregla: lo empeora.",
      c: "Esa retención y esos antojos antes de la regla son normales, pero si entrenas y comes igual todo el mes, sientes que retrocedes cada pocas semanas y acabas abandonando.",
      d: "La hinchazón y la retención pueden esconder kilos de cambio real. Mientras tu cuerpo esté inflamado, por mucho que hagas no verás tus avances en el espejo."
    },
    ene: {
      a: "Levantarte ya cansada es señal de que tu cuerpo no se está recuperando. Con poco descanso produces más cortisol y más hambre, y tu cuerpo te pide azúcar para aguantar el día. Así cualquier plan se hace cuesta arriba.",
      b: "Ese bajón después de comer aparece cuando las comidas llevan muchos hidratos rápidos y poca proteína. El azúcar sube y baja de golpe y te deja sin energía, con sueño y con ganas de dulce.",
      c: "Cuando el día te exprime y llegas a la noche sin fuerzas, entrenar o cocinar bien parece imposible. Sin energía no hay constancia, y sin constancia no hay cambio.",
      d: "Aunque te notes bien, si tu energía depende del café y del azúcar, tu cuerpo almacena grasa con más facilidad. Es la palanca más fácil que tienes ahora mismo."
    },
    men: {
      a: "Empezar con ganas y dejarlo a las semanas es lo que pasa cuando el plan es demasiado exigente para tu vida real. No te falta disciplina: te falta un plan que puedas mantener.",
      b: "Con tanto consejo contradictorio es normal no saber por dónde empezar, y cuando no sabes qué hacer acabas no haciendo nada. Te falta un camino claro, paso a paso.",
      c: "Sientes que no tienes tiempo, pero el problema no es tu agenda: son los planes pensados para gente sin vida. Con tres sesiones cortas bien hechas a la semana se consiguen cambios visibles.",
      d: "La ansiedad por comer no se arregla con fuerza de voluntad. Suele venir de comidas que no sacian, estrés acumulado y poco descanso. Mientras no lo corrijas, sentirás que pierdes el control."
    }
  };

  var PASOS = {
    ali: [
      ["Proteína en cada comida", "Una ración del tamaño de la palma de tu mano 3 o 4 veces al día: huevos, pollo, pescado, yogur griego o legumbres. Te sacia, protege tu músculo y acelera la pérdida de grasa."],
      ["El método del plato", "Medio plato de verdura, un cuarto de proteína y un cuarto de hidrato. Sin pesar, sin contar calorías y sirve en casa, en el táper o en el restaurante."],
      ["Comer suficiente, sin rebote", "Tres comidas completas al día en lugar de dietas estrictas o picoteo. Bajas de forma constante y no recuperas lo perdido."]
    ],
    ent: [
      ["Fuerza 3 veces por semana", "Sesiones de 30 a 45 minutos de cuerpo completo: sentadilla, peso muerto, remo, press y puente de glúteo. Es lo que da forma y quita la flacidez."],
      ["Progresión semanal", "Cada semana un poco más de peso o una repetición más, y lo apuntas. Así tu cuerpo siempre tiene un motivo para cambiar."],
      ["El cardio, en forma de pasos", "7.000 a 9.000 pasos al día en lugar de horas de cardio. Quemas grasa sin robarle energía a tus entrenos."]
    ],
    hor: [
      ["Comer a favor de tus hormonas", "Proteína y fibra en cada comida y menos azúcar y ultraprocesados para mejorar tu sensibilidad a la insulina."],
      ["Entrenar según tu ciclo", "Más intensidad en la primera mitad del ciclo y más suave antes de la regla. Dejas de sentir que retrocedes cada mes."],
      ["Bajar la inflamación", "Más agua y verdura, menos sal y ultraprocesados, y un paseo después de comer. En dos semanas te ves menos hinchada."]
    ],
    ene: [
      ["Desayuno con proteína", "Empezar el día con proteína estabiliza tu azúcar en sangre: adiós al bajón de media mañana y después de comer."],
      ["Rutina de sueño", "Misma hora de acostarte cada día y sin pantallas 30 minutos antes. Dormir bien baja el hambre y el cortisol."],
      ["Movimiento después de comer", "10 minutos caminando después de las comidas principales. Evita el bajón y ayuda a tu cuerpo a usar lo que comes."]
    ],
    men: [
      ["Empezar por lo mínimo", "Dos o tres hábitos que puedas cumplir incluso en tu peor semana. Primero constancia, después intensidad."],
      ["Un plan cerrado, sin dudas", "Sabes exactamente qué comer y qué entrenar cada día. Sin tener que decidir, no hay excusas."],
      ["Un plan para los días malos", "Qué hacer cuando fallas un día para no volver a empezar de cero el lunes."]
    ]
  };

  var HOY = {
    ali: "En tu próxima comida, añade una ración de proteína del tamaño de la palma de tu mano: huevos, pollo, pescado, yogur griego o legumbres.",
    ent: "Haz 3 rondas de 12 sentadillas, 10 puentes de glúteo y 8 flexiones con las rodillas apoyadas. 15 minutos en casa.",
    hor: "Bebe 2 litros de agua, reduce la sal y los ultraprocesados y camina 20 minutos después de comer.",
    ene: "Esta noche, deja el móvil 30 minutos antes de dormir y acuéstate a la misma hora que mañana.",
    men: "Elige UN solo hábito de este plan y hazlo 7 días seguidos. Solo uno."
  };
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

  var OBJETIVO = { a: "una tripa más plana y una espalda sin rollitos", b: "brazos, piernas y glúteos firmes", c: "dejar de verte hinchada", d: "bajar de peso y no volver a subir", e: "volver a reconocerte en el espejo" };

  // Lo que NO quiere hacer: el plan lo respeta.
  function respetos(t) {
    var n = norm(t), r = [];
    if (vacio(t)) return r;
    if (/calori|pesar|contar|macros|gramo/.test(n)) r.push("Sin contar calorías ni pesar la comida: usarás el método del plato.");
    if (/gimnas|gym/.test(n)) r.push("Sin gimnasio: todo el entrenamiento se puede hacer en casa con poco material.");
    if (/correr|cardio|running|bici|spinning/.test(n)) r.push("Sin horas de cardio: el cardio va en forma de pasos diarios.");
    if (/hambre|ayun/.test(n)) r.push("Sin pasar hambre: comerás suficiente, con proteína en cada comida.");
    if (/pan|pasta|arroz|hidrato|carbohidrat|dulce|chocolate|azucar/.test(n)) r.push("Sin prohibir alimentos: tendrás hidratos y algún capricho, en la cantidad que te funciona.");
    if (/pastilla|suplement|batido|quemador/.test(n)) r.push("Sin pastillas, batidos ni quemadores: solo comida real y entrenamiento.");
    if (!r.length) r.push("Lo tengo en cuenta: «" + String(t).trim().slice(0, 140) + "». Tu plan se adapta a eso.");
    return r;
  }

  function fases(a, k) {
    var f1 = [], f2 = [], f3 = [];
    f1.push({ a: "Sube la proteína en cada comida: una palma de tu mano, 3 o 4 veces al día.", b: "Haz 3 comidas completas al día, con proteína y verdura, para cortar el picoteo.", c: "Deja las dietas extremas: come suficiente, con un plato equilibrado en cada comida.", d: "Aplica la regla del plato fuera de casa: proteína, verdura y una ración de hidrato." }[a.comida] || "Sube la proteína en cada comida.");
    if (a.energia === "a") f1.push("Adelanta 30 minutos la hora de dormir y deja las pantallas media hora antes.");
    else if (a.energia === "b") f1.push("Desayuna con proteína y camina 10 minutos después de comer: adiós al bajón.");
    else f1.push("Bebe 2 litros de agua al día y camina 7.000 pasos diarios.");
    f1.push({ b: "Prioriza proteína y fibra y reduce el azúcar para mejorar tu sensibilidad a la insulina.", c: "Reduce sal y ultraprocesados y sube agua y verdura para bajar la retención." }[a.ciclo] || (a.espejo === "c" ? "Reduce sal y ultraprocesados y sube agua y verdura para deshincharte." : "Apunta en qué fase de tu ciclo estás para empezar a ajustar el plan."));

    f2.push({ a: "2 o 3 sesiones de fuerza de 30 minutos a la semana, en casa o en el gimnasio.", b: "3 sesiones de fuerza de 45 minutos a la semana, de cuerpo completo.", c: "3 o 4 sesiones de fuerza a la semana con foco en glúteos, espalda y brazos.", d: "4 sesiones de fuerza a la semana con foco en glúteos, espalda y brazos." }[a.tiempo] || "3 sesiones de fuerza a la semana.");
    f2.push({ a: "Aprende la técnica de 5 ejercicios básicos: sentadilla, peso muerto, remo, press y puente de glúteo.", b: "Cambia parte del cardio por fuerza: el cardio, en forma de pasos diarios.", c: "Sigue una progresión: sube peso o repeticiones cada semana y apúntalo.", d: "Ajusta el volumen de tu plan actual a tu descanso y a tu ciclo." }[a.entreno] || "Sigue una progresión semanal.");
    f2.push(a.ciclo === "d" ? "Fíjate en cómo te encuentras cada semana y ajusta la intensidad según tu energía." : "Adapta la intensidad a tu ciclo: más fuerte en la primera mitad y más suave antes de la regla.");

    f3.push({ a: "Trabajo específico de core y espalda para reducir tripa y rollitos.", b: "Más volumen en glúteos, piernas y brazos para eliminar la flacidez.", c: "Mantén la alimentación antiinflamatoria y mide tu cintura, no solo el peso.", d: "Ajusta las cantidades según tu progreso para seguir bajando sin rebote.", e: "Fotos y medidas cada 2 semanas para ver cómo cambia tu cuerpo." }[a.espejo] || "Mide tu progreso cada 2 semanas.");
    f3.push(k === "men" ? "Hábitos mínimos para los días malos: así no vuelves a empezar de cero." : "Revisa fotos y medidas cada 2 semanas, no solo la báscula.");
    f3.push("Objetivo: " + (OBJETIVO[a.espejo] || "verte y sentirte bien") + ".");

    return [
      { k: "Semanas 1 y 2", t: "Desinflamar y ordenar", l: f1 },
      { k: "Semanas 3 a 6", t: "Activar tu metabolismo", l: f2 },
      { k: "Semanas 7 a 12", t: "Esculpir y mantener", l: f3 }
    ];
  }

  function porQue(a, probado) {
    var base;
    if (a.peso === "d") base = "Llevas tiempo bajando y volviendo a subir. El efecto rebote aparece cuando pierdes peso a base de pasar hambre: pierdes músculo, tu metabolismo se frena y el cuerpo recupera lo perdido. Este plan va al revés: primero músculo y hábitos; después la grasa cae y no vuelve.";
    else if (a.peso === "c") base = "Llevas más de dos años intentándolo, y eso dice mucho de tus ganas. Si no ha funcionado no es por ti: los planes que has probado no estaban pensados para tu cuerpo, tus hormonas ni tu día a día.";
    else if (a.peso === "b") base = "Llevas un tiempo intentándolo sin el resultado que mereces. No es falta de esfuerzo: te ha faltado un plan adaptado a ti que ataque lo que de verdad te frena.";
    else base = "Estás a tiempo de hacerlo bien desde el principio, sin dietas extremas ni horas de cardio que no llevan a ningún sitio.";
    return base;
  }

  function construir(d) {
    var a = d.a || {}, t = d.t || {};
    var s = puntuar(a, t);
    var k = peorArea(s);
    var clave = k === "men" ? tipoFreno(t.freno) : a[{ ali: "comida", ent: "entreno", hor: "ciclo", ene: "energia" }[k]];
    return {
      s: s, media: media(s), area: k,
      areaNombre: AREAS.filter(function (x) { return x.k === k; })[0].n,
      cuesta: CUESTA[k],
      freno: FRENO[k][clave] || FRENO[k].a,
      pasos: PASOS[k],
      fases: fases(a, k),
      hoy: (k === "ene" && HOY_ENE[a.energia]) || HOY[k],
      edad: EDAD[a.edad] || "",
      porque: porQue(a, t.probado),
      respetos: respetos(t.nohacer)
    };
  }

  /* ── Estilos (se inyectan una vez) ─────────────────────────────────────── */
  var SERIF = "var(--font-instrument,'Instrument Serif'),Georgia,serif";
  var SANS = "var(--font-inter,Inter),-apple-system,BlinkMacSystemFont,sans-serif";
  var NUM = "var(--font-sora,Sora),sans-serif";
  var CSS = [
    ".fcdq{--b:#35C2FF;--bd:#0088d6;--ink:#04202b;--tx:#eaf3fb;--mu:#9fb7c7;--mu2:#7f97a8;--ln:rgba(255,255,255,.1);--card:#0c1d2b;color:var(--tx);font-family:" + SANS + ";line-height:1.5;-webkit-font-smoothing:antialiased;max-width:560px;margin:0 auto;padding:0 18px;scroll-margin-top:12px}",
    ".fcdq *,.fcdq *::before,.fcdq *::after{box-sizing:border-box}",
    ".er-wrap .fcdq,.er-wrap.fcdq{padding-left:0;padding-right:0}",
    ".fcdq :where(h1,h2,h3,p,ul,ol){margin:0;padding:0}",
    ".fcdq button{font-family:inherit;cursor:pointer}",
    ".fcdq .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}",
    ".fcdq .serif{font-family:" + SERIF + ";font-weight:400}",
    ".fcdq .pill{display:inline-block;font-style:italic;color:var(--ink);background:linear-gradient(90deg,var(--bd),var(--b));padding:0 .26em .05em;border-radius:.3em;line-height:1.1;box-shadow:0 4px 16px rgba(53,194,255,.35)}",
    ".fcdq .eb{font-size:11.5px;font-weight:800;letter-spacing:2.4px;text-transform:uppercase;color:var(--b)}",
    ".fcdq .btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;text-align:center;font-weight:900;font-size:17px;padding:19px 18px;border-radius:99px;border:0;background:linear-gradient(90deg,var(--bd),var(--b));color:var(--ink);box-shadow:0 12px 30px rgba(53,194,255,.32);letter-spacing:-.2px;text-decoration:none;transition:transform .15s,opacity .2s}",
    ".fcdq .btn:active{transform:scale(.985)}",
    ".fcdq .btn[disabled]{opacity:.38;cursor:not-allowed;box-shadow:none}",
    ".fcdq .btn:focus-visible,.fcdq .opt:focus-visible,.fcdq .lnk:focus-visible,.fcdq textarea:focus-visible,.fcdq .back:focus-visible{outline:3px solid #fff;outline-offset:3px}",
    ".fcdq .ticks{display:flex;justify-content:center;flex-wrap:wrap;gap:6px 18px;margin-top:18px;font-size:14px;font-weight:600;color:var(--mu)}",
    ".fcdq .ticks span{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}",
    ".fcdq .ticks i{font-style:normal;color:#8fe6b0;font-weight:900}",
    ".fcdq .lnk{display:block;margin:12px auto 0;background:none;border:0;color:var(--mu);font-size:13.5px;text-decoration:underline;text-underline-offset:3px;padding:6px}",
    ".fcdq .fine{text-align:center;font-size:13px;color:var(--mu2);margin-top:12px;line-height:1.5}",
    /* portada */
    ".fcdq .hero{padding:22px 0 36px;text-align:center}",
    ".fcdq .chip{display:block;margin:0 auto;max-width:430px;border-radius:20px;background:rgba(255,255,255,.05);border:1px solid var(--ln);padding:11px 14px;font-size:14px;line-height:1.55;color:var(--mu)}",
    ".fcdq .chip b{color:#fff}",
    ".fcdq .chip em{font-style:normal;color:#8fe6b0;font-weight:700}",
    ".fcdq .hero h1{font-size:clamp(36px,10vw,50px);line-height:1.08;color:#fff;margin-top:26px;text-wrap:balance}",
    ".fcdq .rot{display:inline-grid;vertical-align:bottom}",
    ".fcdq .rot>span{grid-area:1/1;opacity:0;transform:translateY(.45em);transition:opacity .45s,transform .45s}",
    ".fcdq .rot>span.on{opacity:1;transform:none}",
    /* mockups */
    ".fcdq .mk{position:relative;margin:30px -6px 26px}",
    ".fcdq .mc{position:absolute;top:0;width:58%;border-radius:16px;background:#071019;border:1px solid rgba(255,255,255,.12);box-shadow:0 24px 50px rgba(0,0,0,.55);padding:12px 12px 14px;text-align:left;font-size:10.5px;color:#cfe1ee}",
    ".fcdq .mc.c{position:relative;left:auto;margin:0 auto;z-index:2}",
    ".fcdq .mc.l{left:0;top:36px;transform:perspective(700px) rotateY(16deg) rotate(-3deg);opacity:.8;width:46%}",
    ".fcdq .mc.r{right:0;top:36px;transform:perspective(700px) rotateY(-16deg) rotate(3deg);opacity:.8;width:46%}",
    ".fcdq .mc .dots{display:flex;gap:4px;align-items:center;margin-bottom:8px;font-size:8.5px;color:var(--mu2)}",
    ".fcdq .mc .dots i{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.2)}",
    ".fcdq .mc h4{margin:0 0 10px;font-size:12.5px;font-weight:800;color:#fff}",
    ".fcdq .mc .sc{display:flex;align-items:center;gap:10px;border:1px solid var(--ln);border-radius:12px;padding:9px;margin-bottom:9px}",
    ".fcdq .mc .sc .ring{flex:0 0 46px;width:46px;height:46px}",
    ".fcdq .mc .sc .ring span{width:36px;height:36px;font-size:14px;background:#071019}",
    ".fcdq .mc .sc .ring small{font-size:6.5px}",
    ".fcdq .mc .sc p{font-size:9.5px;line-height:1.55;color:var(--mu)}",
    ".fcdq .mc .sc p b{color:#fff}",
    ".fcdq .mc .k{font-size:7.5px;font-weight:800;letter-spacing:1.4px;text-transform:uppercase;color:var(--mu2);margin:4px 0 6px}",
    ".fcdq .mc .row{display:flex;align-items:center;justify-content:space-between;gap:6px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:8px;padding:6px 7px;margin-top:5px;font-weight:700;color:#fff;font-size:9.5px}",
    ".fcdq .mc .row.bad{border-color:rgba(255,92,92,.55);background:rgba(255,92,92,.08)}",
    ".fcdq .mc .row span:last-child{display:flex;align-items:center;gap:5px;color:var(--mu2);font-weight:600}",
    ".fcdq .mc .li{display:flex;gap:6px;align-items:center;background:rgba(255,255,255,.04);border-radius:7px;padding:6px 7px;margin-top:5px;font-weight:600;color:#fff;font-size:9px}",
    ".fcdq .mc .li i{flex:0 0 5px;width:5px;height:5px;border-radius:50%;background:#ff7a7a}",
    ".fcdq .mc .li.y i{background:#ffd27a}",
    ".fcdq .mc .li.g i{background:var(--b)}",
    ".fcdq .mc .nx{margin-top:9px;border-radius:9px;background:linear-gradient(90deg,var(--bd),var(--b));color:var(--ink);font-weight:800;font-size:9.5px;padding:7px 9px;display:flex;justify-content:space-between}",
    ".fcdq .tag{display:inline-block;font-size:7.5px;font-weight:900;letter-spacing:1px;text-transform:uppercase;border-radius:5px;padding:2px 5px}",
    ".fcdq .tag.t-ok{background:rgba(127,224,166,.14);color:#8fe6b0}",
    ".fcdq .tag.t-mej{background:rgba(255,198,92,.14);color:#ffd27a}",
    ".fcdq .tag.t-fr{background:rgba(255,92,92,.16);color:#ff9a8a}",
    "@media (max-width:380px){.fcdq .mc{font-size:9.5px}}",
    /* tarjeta de pregunta */
    ".fcdq .qc{background:var(--card);border:1px solid rgba(255,255,255,.1);border-radius:26px;padding:24px 20px 24px;box-shadow:0 24px 60px rgba(0,0,0,.35);text-align:left}",
    ".fcdq .hero .qc{margin-top:8px;text-align:center;border-color:rgba(53,194,255,.35);box-shadow:0 0 50px rgba(53,194,255,.12),0 24px 60px rgba(0,0,0,.35)}",
    ".fcdq .qc .hd{display:flex;align-items:center;justify-content:space-between;gap:10px}",
    ".fcdq .qc .cnt{font-size:12px;font-weight:800;letter-spacing:2.2px;text-transform:uppercase;color:var(--mu2);margin-left:auto}",
    ".fcdq .qc .cnt b{color:#fff}",
    ".fcdq .back{background:none;border:0;color:var(--mu);font-weight:700;font-size:13px;padding:4px 0}",
    ".fcdq .pills{display:flex;gap:5px;margin:14px 0 22px}",
    ".fcdq .pills i{flex:1;height:6px;border-radius:9px;background:rgba(255,255,255,.08)}",
    ".fcdq .pills i.on{background:linear-gradient(90deg,var(--bd),var(--b))}",
    ".fcdq .pills i.now{background:linear-gradient(90deg,var(--b) 50%,rgba(255,255,255,.08) 50%)}",
    ".fcdq .sec{font-size:12px;font-weight:800;letter-spacing:2.4px;text-transform:uppercase;color:var(--b);margin-bottom:10px}",
    ".fcdq .q{font-family:" + SERIF + ";font-weight:400;font-size:clamp(27px,7.4vw,34px);line-height:1.12;color:#fff;text-wrap:balance;outline:none}",
    ".fcdq .hero .q{font-size:clamp(28px,7.8vw,36px)}",
    ".fcdq .qs{color:var(--mu);font-size:15.5px;line-height:1.55;margin-top:10px}",
    ".fcdq .opts{display:flex;flex-direction:column;gap:11px;margin-top:22px}",
    ".fcdq .opt{display:flex;align-items:center;gap:14px;width:100%;text-align:left;font-size:16.5px;line-height:1.35;font-weight:700;color:var(--tx);border:1px solid rgba(255,255,255,.14);border-radius:18px;padding:17px 16px;background:rgba(255,255,255,.03);transition:border-color .2s,background .2s,transform .15s}",
    ".fcdq .opt .lt{flex:0 0 34px;width:34px;height:34px;border-radius:10px;border:1px solid rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:var(--mu);text-transform:uppercase}",
    ".fcdq .opt .tx{flex:1}",
    ".fcdq .opt .rd{flex:0 0 24px;width:24px;height:24px;border-radius:50%;border:2px solid rgba(255,255,255,.22);transition:all .2s}",
    ".fcdq .hero .opt{justify-content:center;text-align:center;background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.08);padding:19px 16px}",
    "@media (hover:hover){.fcdq .opt:hover{border-color:rgba(53,194,255,.7);background:rgba(53,194,255,.08)}}",
    ".fcdq .opt:active{transform:scale(.99)}",
    ".fcdq .opt.sel{border-color:var(--b);background:rgba(53,194,255,.14)}",
    ".fcdq .opt.sel .lt{background:var(--b);border-color:var(--b);color:var(--ink)}",
    ".fcdq .opt.sel .rd{border-color:var(--b);background:var(--b);box-shadow:inset 0 0 0 4px var(--card)}",
    ".fcdq textarea{display:block;width:100%;margin-top:22px;font:inherit;font-size:16.5px;line-height:1.5;color:#fff;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.18);border-radius:18px;padding:16px 18px;min-height:140px;resize:vertical}",
    ".fcdq textarea::placeholder{color:#6f8798}",
    ".fcdq textarea:focus{border-color:var(--b);outline:none}",
    ".fcdq .cc{text-align:right;font-size:13px;color:var(--mu2);margin-top:8px}",
    ".fcdq .cc b{color:#fff}",
    ".fcdq .qc .btn{margin-top:16px}",
    ".fcdq .qz{padding:20px 0 40px}",
    ".fcdq .intro{color:#cfe1ee;font-size:16.5px;line-height:1.6;margin:24px auto 0;max-width:460px;text-wrap:balance}",
    ".fcdq .basado{color:var(--mu2);font-size:13.5px;margin:12px auto 0;max-width:420px}",
    /* analizando */
    ".fcdq .an{padding:56px 0 80px;text-align:center;min-height:60vh}",
    ".fcdq .spin{width:54px;height:54px;margin:0 auto 22px;border-radius:50%;border:4px solid rgba(255,255,255,.1);border-top-color:var(--b);animation:fcdq-spin .8s linear infinite}",
    "@keyframes fcdq-spin{to{transform:rotate(360deg)}}",
    ".fcdq .an h2{font-size:clamp(27px,7.4vw,34px);color:#fff;line-height:1.15}",
    ".fcdq .chk{list-style:none;display:flex;flex-direction:column;gap:11px;max-width:300px;margin:26px auto 0;text-align:left}",
    ".fcdq .chk li{display:flex;align-items:center;gap:10px;font-size:15.5px;color:var(--mu2);transition:color .3s}",
    ".fcdq .chk li i{flex:0 0 22px;width:22px;height:22px;border-radius:50%;border:2px solid rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;font-style:normal;font-size:12px;font-weight:900;color:transparent;transition:all .3s}",
    ".fcdq .chk li.ok{color:#eaf3fb}",
    ".fcdq .chk li.ok i{background:#8fe6b0;border-color:#8fe6b0;color:#06261c}",
    /* adelanto */
    ".fcdq .cost{border-radius:24px;padding:24px 20px;background:radial-gradient(120% 90% at 100% 0%,rgba(255,92,92,.28),transparent 60%),#0a0f14;border:1px solid rgba(255,92,92,.25)}",
    ".fcdq .kl{display:flex;align-items:flex-start;gap:12px;font-size:12px;font-weight:900;letter-spacing:2.4px;text-transform:uppercase;line-height:1.6;color:#ff9a8a;margin-bottom:14px}",
    ".fcdq .kl::before{content:'';flex:0 0 20px;height:2px;background:currentColor;margin-top:.8em}",
    ".fcdq .kl.g{color:#8fe6b0}",
    ".fcdq .cost p{font-size:17px;line-height:1.6;color:#fff}",
    ".fcdq .rec{margin-top:14px;border-radius:24px;padding:24px 18px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03)}",
    ".fcdq .rec h3{font-size:clamp(24px,6.6vw,30px);line-height:1.15;color:#fff;margin-bottom:16px;text-wrap:balance}",
    ".fcdq .stp{display:flex;gap:14px;padding:16px 14px;border-radius:18px;background:rgba(255,255,255,.04)}",
    ".fcdq .stp+.stp{margin-top:10px}",
    ".fcdq .stp .n{flex:0 0 40px;width:40px;height:40px;border-radius:12px;background:#04121c;border:1px solid rgba(53,194,255,.35);color:var(--b);font-family:" + NUM + ";font-weight:800;font-size:17px;display:flex;align-items:center;justify-content:center}",
    ".fcdq .stp b{display:block;color:#fff;font-size:16.5px;line-height:1.3}",
    ".fcdq .stp span{display:block;color:#cfe1ee;font-size:14.5px;line-height:1.55;margin-top:5px}",
    ".fcdq .stp.lk div span{filter:blur(5.5px);user-select:none;pointer-events:none}",
    ".fcdq .res .btn{margin-top:20px}",
    /* formulario */
    ".fcdq .send{width:56px;height:56px;border-radius:16px;background:#04121c;border:1px solid rgba(53,194,255,.35);display:flex;align-items:center;justify-content:center;margin-bottom:16px}",
    ".fcdq .frm{position:relative;min-height:792px;margin-top:20px;border-radius:18px;overflow:hidden;background:#fff}",
    ".fcdq .frm iframe{width:100%;height:792px;border:0;display:block;position:relative}",
    ".fcdq .frm .ld{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#0b1722}",
    /* barras y plan */
    ".fcdq .ring{position:relative;flex:0 0 84px;width:84px;height:84px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:conic-gradient(var(--b) calc(var(--p)*1%),rgba(255,255,255,.08) 0)}",
    ".fcdq .ring span{width:68px;height:68px;border-radius:50%;background:var(--card);display:flex;align-items:center;justify-content:center;flex-direction:column;font-family:" + NUM + ";font-weight:800;font-size:24px;color:#fff;line-height:1}",
    ".fcdq .ring small{font-family:" + SANS + ";font-size:10px;font-weight:700;color:var(--mu2);margin-top:3px}",
    ".fcdq .card{border-radius:22px;border:1px solid var(--ln);background:var(--card);padding:22px 18px}",
    ".fcdq .card+.card,.fcdq .cost+.card,.fcdq .card+.cost{margin-top:14px}",
    ".fcdq .kk{font-size:11.5px;font-weight:900;letter-spacing:1.8px;text-transform:uppercase;color:var(--b);margin-bottom:12px}",
    ".fcdq .score{display:flex;align-items:center;gap:16px;margin-bottom:16px}",
    ".fcdq .score p{font-size:15px;color:#cfe1ee;line-height:1.5}",
    ".fcdq .score p b{color:#fff}",
    ".fcdq .ar{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 12px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);font-size:15px;font-weight:700;color:#fff}",
    ".fcdq .ar+.ar{margin-top:7px}",
    ".fcdq .ar.bad{border-color:rgba(255,92,92,.55);background:rgba(255,92,92,.08)}",
    ".fcdq .ar .v{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--mu2);font-weight:600;white-space:nowrap}",
    ".fcdq .ar .v b{color:#fff;font-family:" + NUM + ";font-size:15px}",
    ".fcdq .ar .tag{font-size:9.5px;padding:3px 7px}",
    ".fcdq.plan{padding-top:20px}",
    ".fcdq .ok{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:800;color:#8fe6b0;background:rgba(127,224,166,.1);border:1px solid rgba(127,224,166,.3);border-radius:99px;padding:6px 12px}",
    ".fcdq .ctr{text-align:center}",
    ".fcdq .ttl{font-size:clamp(30px,8.4vw,40px);line-height:1.1;color:#fff;text-align:center;margin:14px 0 22px;text-wrap:balance}",
    ".fcdq .quote{font-family:" + SERIF + ";font-style:italic;font-size:20px;line-height:1.4;color:#fff}",
    ".fcdq .tx{font-size:15.5px;color:#cfe1ee;line-height:1.65}",
    ".fcdq .tx+.tx{margin-top:10px}",
    ".fcdq .ph{position:relative;padding:0 0 20px 24px;border-left:2px solid rgba(53,194,255,.3);margin-left:7px}",
    ".fcdq .ph:last-child{padding-bottom:0;border-left-color:transparent}",
    ".fcdq .ph::before{content:'';position:absolute;left:-8px;top:3px;width:14px;height:14px;border-radius:50%;background:var(--b);box-shadow:0 0 0 4px var(--card)}",
    ".fcdq .ph small{display:block;font-size:11px;font-weight:900;letter-spacing:1.4px;text-transform:uppercase;color:var(--b)}",
    ".fcdq .ph h3{font-size:23px;line-height:1.15;color:#fff;margin:2px 0 8px}",
    ".fcdq .ph ul,.fcdq .lst{list-style:none;display:flex;flex-direction:column;gap:8px}",
    ".fcdq .ph li,.fcdq .lst li{position:relative;padding-left:20px;font-size:15px;color:#cfe1ee;line-height:1.55}",
    ".fcdq .ph li::before,.fcdq .lst li::before{content:'→';position:absolute;left:0;color:var(--b);font-weight:900}",
    ".fcdq .lst.ck li::before{content:'✓';color:#8fe6b0}",
    ".fcdq .today{border-color:rgba(53,194,255,.5);background:linear-gradient(180deg,rgba(53,194,255,.14),rgba(53,194,255,.04))}",
    ".fcdq .today p{font-size:16px;color:#fff;line-height:1.6}",
    ".fcdq .cta{text-align:center}",
    ".fcdq .cta h3{font-size:clamp(26px,7vw,32px);line-height:1.12;color:#fff;margin-bottom:8px;text-wrap:balance}",
    ".fcdq .cta p{font-size:15px;color:#cfe1ee;margin-bottom:16px}",
    ".fcdq .div{display:flex;align-items:center;gap:12px;margin:36px 0 0;color:var(--mu2);font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase}",
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
  function ring(p) { return '<div class="ring" style="--p:' + p + '"><span>' + p + "<small>de 100</small></span></div>"; }

  function areasHTML(s, peor) {
    return AREAS.map(function (x) {
      var v = s[x.k], e = etiqueta(v, x.k === peor);
      return '<div class="ar' + (x.k === peor ? " bad" : "") + '"><span>' + x.n + '</span><span class="v"><b>' + v + '</b>/100 <span class="tag ' + e[0] + '">' + e[1] + "</span></span></div>";
    }).join("");
  }

  function mockups() {
    var filas = [["Alimentación", 64, "t-ok"], ["Entrenamiento", 18, "t-fr"], ["Hormonas y ciclo", 41, "t-mej"], ["Energía", 36, "t-mej"], ["Constancia", 47, "t-mej"]];
    var c = '<div class="mc c"><div class="dots"><i></i><i></i><i></i>&nbsp;Envejecimiento Revertido · Diagnóstico</div><h4>Tu diagnóstico</h4>' +
      '<div class="sc">' + ring(38) + "<p>Áreas analizadas <b>5</b><br>Tu mayor freno <b>Entrenamiento</b><br>Plan <b>12 semanas</b></p></div>" +
      '<p class="k">Tus áreas</p>' + filas.map(function (f) {
        var lbl = { "t-ok": "Sólido", "t-mej": "Mejorar", "t-fr": "Tu freno" }[f[2]];
        return '<div class="row' + (f[2] === "t-fr" ? " bad" : "") + '"><span>' + f[0] + "</span><span>" + f[1] + '/100 <span class="tag ' + f[2] + '">' + lbl + "</span></span></div>";
      }).join("") + '<div class="nx"><span>Siguiente · Tu plan de 12 semanas</span><span>→</span></div></div>';
    var l = '<div class="mc l" aria-hidden="true"><div class="dots"><i></i><i></i><i></i></div><h4>Tu mayor freno</h4><p class="k">Síntomas detectados</p>' +
      '<div class="li"><i></i>Flacidez en brazos</div><div class="li"><i></i>Bajón después de comer</div><div class="li"><i></i>Tripa hinchada</div>' +
      '<p class="k" style="margin-top:10px">Causa raíz</p><div class="li y"><i></i>Sin fuerza</div><div class="li y"><i></i>Poca proteína</div></div>';
    var r = '<div class="mc r" aria-hidden="true"><div class="dots"><i></i><i></i><i></i></div><h4>Tu plan de 12 semanas</h4><p class="k">Semanas 1 y 2</p>' +
      '<div class="li g"><i></i>Proteína en cada comida</div><div class="li g"><i></i>Desinflamar</div><p class="k" style="margin-top:10px">Semanas 3 a 6</p>' +
      '<div class="li g"><i></i>Fuerza 3 días</div><div class="li g"><i></i>Progresión semanal</div><p class="k" style="margin-top:10px">Semanas 7 a 12</p><div class="li g"><i></i>Esculpir</div></div>';
    return '<div class="mk" aria-hidden="true">' + l + r + c + "</div>";
  }

  /* ── QUIZ ──────────────────────────────────────────────────────────────── */
  function montarQuiz(root) {
    var st = { paso: 0, a: {}, t: {} };
    try { var g = JSON.parse(ss(true, PROGRESO) || "null"); if (g && g.a && g.t) st = g; } catch (e) {}
    if (st.paso === "analizando") st.paso = "adelanto";
    var timer = null, rotTimer = null;

    function salvar() { ss(false, PROGRESO, JSON.stringify(st)); }
    function datos() {
      var t = {};
      Object.keys(st.t).forEach(function (k) { t[k] = String(st.t[k] || "").trim().slice(0, 220); });
      return { v: 2, a: st.a, t: t, ts: Date.now() };
    }

    function ir(paso) {
      st.paso = paso;
      salvar();
      pintar();
      var r = root.getBoundingClientRect();
      if (r.top < -10 || r.top > window.innerHeight * 0.4) root.scrollIntoView({ behavior: "smooth", block: "start" });
      var h = root.querySelector("[data-focus]");
      if (h) try { h.focus({ preventScroll: true }); } catch (e) {}
    }

    function opcionesHTML(p, hero) {
      return '<div class="opts" role="group" aria-label="Respuestas">' + p.o.map(function (t, j) {
        var sel = st.a[p.id] === L[j];
        return '<button type="button" class="opt' + (sel ? " sel" : "") + '" data-op="' + L[j] + '" aria-pressed="' + sel + '">' +
          (hero ? esc(t) : '<span class="lt" aria-hidden="true">' + L[j] + '</span><span class="tx">' + esc(t) + '</span><span class="rd" aria-hidden="true"></span>') + "</button>";
      }).join("") + "</div>";
    }

    function pillsHTML(i) {
      return '<div class="pills" aria-hidden="true">' + Q.map(function (_, j) { return '<i class="' + (j < i ? "on" : j === i ? "now" : "") + '"></i>'; }).join("") + "</div>";
    }

    function portadaHTML() {
      var p = Q[0];
      return '<section class="hero">' +
        '<p class="chip"><b>+1.000 mujeres</b> han cambiado su cuerpo con este método · <em>sin dietas extremas</em></p>' +
        '<h1 class="serif">Recibe tu <span class="rot" aria-hidden="true"><span class="pill on">plan de entreno</span><span class="pill">plan de alimentación</span><span class="pill">plan hormonal</span><span class="pill">plan de energía</span></span><span class="sr">plan</span> personalizado en 2 minutos.</h1>' +
        mockups() +
        '<div class="qc"><p class="eb">Pregunta 1 de ' + Q.length + " · Empieza aquí</p>" +
        '<h2 class="q" style="margin-top:12px" tabindex="-1">' + esc(p.q) + "</h2>" + opcionesHTML(p, true) + "</div>" +
        '<div class="ticks"><span><i>✓</i> Resultado al instante</span><span><i>✓</i> 100% gratis</span><span><i>✓</i> Sin llamada</span></div>' +
        '<p class="intro">' + Q.length + " preguntas sobre tu cuerpo, tus hábitos y tu objetivo, unos 2 minutos. Te digo qué te está frenando, qué hacer y tu plan para las próximas 12 semanas.</p>" +
        '<p class="basado">Basado en Envejecimiento Revertido, el método que aplico con mis clientas 1:1.</p>' +
        "</section>";
    }

    function preguntaHTML(i) {
      var p = Q[i];
      var cuerpo;
      if (p.tipo === "abierta") {
        var v = st.t[p.id] || "";
        cuerpo = '<label class="sr" for="fcdq-t">Tu respuesta</label><textarea id="fcdq-t" maxlength="' + MAX_TXT + '" placeholder="' + esc(p.ph) + '">' + esc(v) + "</textarea>" +
          '<p class="cc"><b>' + v.length + "</b>/" + MAX_TXT + "</p>" +
          '<button type="button" class="btn" data-act="texto"' + (v.trim().length >= 2 ? "" : " disabled") + '>Continuar <span aria-hidden="true">→</span></button>';
      } else cuerpo = opcionesHTML(p, false);
      return '<section class="qz"><div class="qc">' +
        '<div class="hd"><button type="button" class="back" data-act="atras">← Atrás</button><span class="cnt">Pregunta <b>' + (i + 1) + "</b> de " + Q.length + "</span></div>" +
        pillsHTML(i) +
        '<p class="sec">' + esc(p.sec) + "</p>" +
        '<h2 class="q" tabindex="-1" data-focus>' + esc(p.q) + "</h2>" +
        (p.sub ? '<p class="qs">' + esc(p.sub) + "</p>" : "") +
        cuerpo + "</div></section>";
    }

    function analizandoHTML() {
      return '<section class="an" aria-live="polite"><div class="spin" aria-hidden="true"></div><h2 class="serif" tabindex="-1" data-focus>Analizando tus respuestas…</h2>' +
        '<ul class="chk">' + AREAS.map(function (x) { return '<li><i aria-hidden="true">✓</i>' + x.n + "</li>"; }).join("") + "</ul></section>";
    }

    function adelantoHTML() {
      var p = construir(datos());
      return '<section class="qz res"><div class="qc">' +
        '<div class="hd"><button type="button" class="back" data-act="atras">← Atrás</button><span class="cnt">Tu adelanto</span></div>' + pillsHTML(Q.length) +
        '<div class="cost"><p class="kl" tabindex="-1" data-focus>Lo que ' + esc(p.cuesta) + " te está costando</p><p>" + esc(p.freno) + "</p></div>" +
        '<div class="rec"><p class="kl g">Cómo recuperarlo</p><h3 class="serif">3 pasos para mejorar ' + esc(p.cuesta) + "</h3>" +
        p.pasos.map(function (s, i) { return '<div class="stp lk"><span class="n">' + (i + 1) + "</span><div><b>" + esc(s[0]) + "</b><span>" + esc(s[1]) + "</span></div></div>"; }).join("") + "</div>" +
        '<button type="button" class="btn" data-act="desbloquear">Desbloquea tu plan completo <span aria-hidden="true">→</span></button>' +
        '<p class="fine">Dejas tus datos en el paso siguiente y ves tu plan al instante. 100% gratis.</p>' +
        "</div></section>";
    }

    function formularioHTML() {
      return '<section class="qz"><div class="qc">' +
        '<div class="hd"><button type="button" class="back" data-act="atras">← Atrás</button><span class="cnt">Último paso</span></div>' + pillsHTML(Q.length) +
        '<div class="send" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#35C2FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/></svg></div>' +
        '<h2 class="q" tabindex="-1" data-focus>¿A dónde te envío tu plan personalizado?</h2>' +
        '<p class="qs">Tu diagnóstico ya está listo. Déjame tus datos y te muestro tu mayor freno, tu plan de 12 semanas y tu primer paso.</p>' +
        '<div class="frm"><div class="ld" aria-hidden="true"><div class="spin" style="margin:0"></div></div>' +
        '<iframe src="https://links.fitcondamian.com/widget/form/' + FORM_ID + '" id="inline-' + FORM_ID + '" data-layout="{\'id\':\'INLINE\'}" data-trigger-type="alwaysShow" data-trigger-value="" data-activation-type="alwaysActivated" data-activation-value="" data-deactivation-type="neverDeactivate" data-deactivation-value="" data-form-name="01 - Formulario LM Youtube" data-height="792" data-layout-iframe-id="inline-' + FORM_ID + '" data-form-id="' + FORM_ID + '" title="01 - Formulario LM Youtube"></iframe></div>' +
        '<div class="ticks" style="margin-top:14px"><span><i>🔒</i> Tus datos están protegidos</span><span><i>✓</i> Sin spam</span><span><i>✓</i> 100% gratis</span></div>' +
        "</div></section>";
    }

    function cargarFormEmbed() {
      var fr = root.querySelector(".frm iframe"), ld = root.querySelector(".frm .ld");
      if (fr && ld) fr.addEventListener("load", function () { ld.style.display = "none"; });
      var s = document.createElement("script");
      s.src = "https://links.fitcondamian.com/js/form_embed.js";
      s.type = "text/javascript";
      document.body.appendChild(s);
    }

    function rotar() {
      var items = root.querySelectorAll(".rot > span");
      if (items.length < 2) return;
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      var k = 0;
      rotTimer = setInterval(function () {
        if (!document.body.contains(items[0])) { clearInterval(rotTimer); return; }
        items[k].classList.remove("on"); k = (k + 1) % items.length; items[k].classList.add("on");
      }, 2200);
    }

    function pintar() {
      if (timer) { clearTimeout(timer); timer = null; }
      if (rotTimer) { clearInterval(rotTimer); rotTimer = null; }
      var p = st.paso;
      if (p === 0) { root.innerHTML = portadaHTML(); rotar(); }
      else if (typeof p === "number") root.innerHTML = preguntaHTML(p);
      else if (p === "analizando") {
        root.innerHTML = analizandoHTML();
        var lis = root.querySelectorAll(".chk li"), k = 0;
        (function tick() {
          if (k < lis.length) { lis[k].className = "ok"; k++; timer = setTimeout(tick, 520); }
          else timer = setTimeout(function () { ir("adelanto"); }, 450);
        })();
      }
      else if (p === "adelanto") root.innerHTML = adelantoHTML();
      else if (p === "form") { root.innerHTML = formularioHTML(); cargarFormEmbed(); }
      var ta = root.querySelector("#fcdq-t");
      if (ta) {
        var id = Q[st.paso].id, b = root.querySelector('[data-act="texto"]'), cc = root.querySelector(".cc b");
        ta.addEventListener("input", function () { st.t[id] = ta.value; cc.textContent = ta.value.length; b.disabled = ta.value.trim().length < 2; salvar(); });
      }
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
        if (st.paso === 0) track("quiz_inicio");
        salvar();
        setTimeout(siguiente, 240);
        return;
      }
      var act = e.target.closest("[data-act]");
      if (!act) return;
      var a = act.getAttribute("data-act");
      if (a === "atras") {
        if (st.paso === "form") ir("adelanto");
        else if (st.paso === "adelanto") ir(Q.length - 1);
        else if (typeof st.paso === "number" && st.paso > 0) ir(st.paso - 1);
      }
      else if (a === "texto") { var t = root.querySelector("#fcdq-t"); if (t && t.value.trim().length >= 2) { st.t[Q[st.paso].id] = t.value.trim(); siguiente(); } }
      else if (a === "desbloquear") { guardar(datos()); track("registro"); ir("form"); }
    });

    pintar();
  }

  /* ── PLAN (página de acceso) ───────────────────────────────────────────── */
  function montarPlan(root) {
    var d = cargar();
    if (!d || !d.t) { root.innerHTML = ""; root.style.display = "none"; return; }
    var p = construir(d), t = d.t;
    var fasesHTML = p.fases.map(function (f) {
      return '<div class="ph"><small>' + f.k + '</small><h3 class="serif">' + esc(f.t) + "</h3><ul>" + f.l.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>";
    }).join("");
    var tibia = d.a && (d.a.prioridad === "c" || d.a.prioridad === "d");
    var ctaTxt = tibia
      ? "Cuando quieras ir en serio, en una llamada gratuita de 30 minutos revisamos tu plan y te digo cómo aplicarlo a tu caso."
      : "En una llamada gratuita de 30 minutos revisamos tu plan juntos y te digo exactamente cómo aplicarlo a tu cuerpo y a tu día a día.";
    var probadoHTML = vacio(t.probado) ? "" : '<p class="tx">Me dijiste que has probado: <b style="color:#fff">«' + esc(t.probado) + "»</b>. Este plan no va por ahí.</p>";
    root.innerHTML = '<section class="res">' +
      '<div class="ctr"><span class="ok">✓ Plan desbloqueado</span></div>' +
      '<h1 class="ttl serif">Este es tu plan <span class="pill">personalizado</span></h1>' +
      '<div class="card"><p class="kk">Tu diagnóstico</p><div class="score">' + ring(p.media) + "<p>Tu puntuación global es <b>" + p.media + " de 100</b>. Tu mayor freno es <b>" + esc(p.areaNombre.toLowerCase()) + "</b>: por ahí empieza tu plan.</p></div>" + areasHTML(p.s, p.area) + "</div>" +
      (vacio(t.situacion) ? "" : '<div class="card"><p class="kk">Tu punto de partida</p><p class="quote">«' + esc(t.situacion) + "»</p></div>") +
      '<div class="cost"><p class="kl">Lo que ' + esc(p.cuesta) + " te está costando</p><p>" + esc(p.freno) + "</p></div>" +
      '<div class="card"><p class="kl g">Cómo recuperarlo</p>' + p.pasos.map(function (s, i) { return '<div class="stp"><span class="n">' + (i + 1) + "</span><div><b>" + esc(s[0]) + "</b><span>" + esc(s[1]) + "</span></div></div>"; }).join("") + "</div>" +
      '<div class="card"><p class="kk">Por qué no te ha funcionado hasta ahora</p><p class="tx">' + esc(p.porque) + "</p>" + probadoHTML + (p.edad ? '<p class="tx">' + esc(p.edad) + "</p>" : "") + "</div>" +
      (p.respetos.length ? '<div class="card"><p class="kk">Respetando lo que no quieres hacer</p><ul class="lst ck">' + p.respetos.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>" : "") +
      '<div class="card"><p class="kk">Tu plan de 12 semanas</p>' + fasesHTML + "</div>" +
      '<div class="card today"><p class="kk">Tu primer paso, hoy mismo</p><p>' + esc(p.hoy) + "</p></div>" +
      '<div class="card cta"><h3 class="serif">¿Quieres que te ayude a aplicarlo?</h3><p>' + ctaTxt + '</p><a class="btn" href="#agendar" data-agendar>📞 Revisar mi plan en una llamada gratis</a><p class="fine">30 minutos · 100% gratuito · sin compromiso</p></div>' +
      '<div class="div">Antes de la llamada, mira este vídeo</div>' +
      "</section>";
    var a = root.querySelector("[data-agendar]");
    if (a) a.addEventListener("click", function (e) {
      var tg = document.getElementById("agendar") || document.getElementById("fcd-agendar");
      track("plan_agendar");
      if (tg) { e.preventDefault(); tg.scrollIntoView({ behavior: "smooth", block: "start" }); }
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

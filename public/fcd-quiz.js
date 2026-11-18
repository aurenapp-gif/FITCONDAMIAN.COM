/* ─────────────────────────────────────────────────────────────────────────
   Fit con Damián · Quiz funnel «Diagnóstico gratis + plan personalizado»

   Un solo script para la web (fitcondamian.com) y para GoHighLevel:
     <div data-fcd="quiz"></div>   → portada con la pregunta 1, preguntas,
                                     adelanto y formulario
     <div data-fcd="plan"></div>   → plan personalizado (página de acceso)
     <script src="https://fitcondamian.com/fcd-quiz.js"></script>

   La captura de datos es un formulario propio (nombre, email y WhatsApp):
   se envía a /api/quiz-lead, que manda un correo con los datos, todas las
   respuestas y el plan ya redactado. La lead solo ve una pantalla de gracias
   («te enviaremos tu plan por WhatsApp»): el equipo le escribe después.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";
  if (window.FCDQuiz) { window.FCDQuiz.mountAll(); return; }

  var SCRIPT = document.currentScript;
  var BASE = "https://fitcondamian.com";
  try { if (SCRIPT && SCRIPT.src) BASE = new URL(SCRIPT.src, location.href).origin; } catch (e) {}
  var COOKIE = "fcd_plan";
  var PROGRESO = "fcd_quiz_progreso_v2";
  var MAX_TXT = 500;
  var API = BASE + "/api/quiz-lead";

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
    /* Paleta Método RHS: rosa #FFCFFD · beige #FFF7D2 · negro ceniza #343337 */
    ".fcdq{--rosa:#FFCFFD;--beige:#FFF7D2;--ink:#343337;--bg:#FFF7D2;--card:#FFFCEB;--tx:#343337;--mu:#57565b;--mu2:#6b6a6f;--ln:rgba(52,51,55,.14);--soft:rgba(52,51,55,.05);color:var(--tx);font-family:" + SANS + ";line-height:1.5;-webkit-font-smoothing:antialiased;max-width:560px;margin:0 auto;padding:0 18px;scroll-margin-top:12px}",
    ".fcdq *,.fcdq *::before,.fcdq *::after{box-sizing:border-box}",
    ".er-wrap .fcdq,.er-wrap.fcdq{padding-left:0;padding-right:0}",
    ".fcdq :where(h1,h2,h3,p,ul,ol){margin:0;padding:0}",
    ".fcdq button{font-family:inherit;cursor:pointer}",
    ".fcdq .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}",
    ".fcdq .serif{font-family:" + SERIF + ";font-weight:400}",
    ".fcdq .pill{display:inline-block;font-style:italic;color:var(--ink);background:var(--rosa);padding:0 .26em .05em;border-radius:.3em;line-height:1.1;box-shadow:0 4px 0 var(--ink)}",
    ".fcdq .eb{font-size:11.5px;font-weight:800;letter-spacing:2.4px;text-transform:uppercase;color:var(--ink)}",
    ".fcdq .btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;text-align:center;font-weight:900;font-size:17px;padding:19px 18px;border-radius:99px;border:0;background:var(--ink);color:var(--beige);box-shadow:0 6px 0 var(--rosa),0 14px 30px rgba(52,51,55,.22);letter-spacing:-.2px;text-decoration:none;transition:transform .15s,opacity .2s}",
    ".fcdq .btn:active{transform:translateY(2px)}",
    ".fcdq .btn[disabled]{opacity:.35;cursor:not-allowed;box-shadow:none}",
    ".fcdq .btn:focus-visible,.fcdq .opt:focus-visible,.fcdq .lnk:focus-visible,.fcdq textarea:focus-visible,.fcdq .back:focus-visible,.fcdq .chkb input:focus-visible{outline:3px solid var(--ink);outline-offset:3px}",
    ".fcdq .ticks{display:flex;justify-content:center;flex-wrap:wrap;gap:6px 18px;margin-top:18px;font-size:14px;font-weight:600;color:var(--mu)}",
    ".fcdq .ticks span{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}",
    ".fcdq .ticks i{font-style:normal;color:var(--ink);font-weight:900}",
    ".fcdq .lnk{display:block;margin:12px auto 0;background:none;border:0;color:var(--mu);font-size:13.5px;text-decoration:underline;text-underline-offset:3px;padding:6px}",
    ".fcdq .fine{text-align:center;font-size:13px;color:var(--mu2);margin-top:12px;line-height:1.5}",
    /* portada */
    ".fcdq .hero{padding:22px 0 36px;text-align:center}",
    ".fcdq .chip{display:block;margin:0 auto;max-width:430px;border-radius:20px;background:var(--card);border:1px solid var(--ln);padding:11px 14px;font-size:14px;line-height:1.55;color:var(--mu)}",
    ".fcdq .chip b{color:var(--ink)}",
    ".fcdq .chip em{font-style:normal;color:var(--ink);font-weight:700;background:var(--rosa);border-radius:6px;padding:0 5px}",
    ".fcdq .hero h1{font-size:clamp(36px,10vw,50px);line-height:1.1;color:var(--ink);margin-top:26px;text-wrap:balance}",
    ".fcdq .rot{display:inline-grid;vertical-align:bottom}",
    ".fcdq .rot>span{grid-area:1/1;opacity:0;transform:translateY(.45em);transition:opacity .45s,transform .45s}",
    ".fcdq .rot>span.on{opacity:1;transform:none}",
    /* mockups (tarjetas negro ceniza, como capturas de la app) */
    ".fcdq .mk{position:relative;margin:30px -6px 26px}",
    ".fcdq .mc{position:absolute;top:0;width:58%;border-radius:16px;background:var(--ink);border:1px solid rgba(255,247,210,.12);box-shadow:0 24px 50px rgba(52,51,55,.35);padding:12px 12px 14px;text-align:left;font-size:10.5px;color:var(--beige)}",
    ".fcdq .mc.c{position:relative;left:auto;margin:0 auto;z-index:2}",
    ".fcdq .mc.l{left:0;top:36px;transform:perspective(700px) rotateY(16deg) rotate(-3deg);opacity:.85;width:46%}",
    ".fcdq .mc.r{right:0;top:36px;transform:perspective(700px) rotateY(-16deg) rotate(3deg);opacity:.85;width:46%}",
    ".fcdq .mc .dots{display:flex;gap:4px;align-items:center;margin-bottom:8px;font-size:8.5px;color:rgba(255,247,210,.6)}",
    ".fcdq .mc .dots i{width:5px;height:5px;border-radius:50%;background:rgba(255,247,210,.3)}",
    ".fcdq .mc h4{margin:0 0 10px;font-size:12.5px;font-weight:800;color:var(--beige)}",
    ".fcdq .mc .sc{display:flex;align-items:center;gap:10px;border:1px solid rgba(255,247,210,.14);border-radius:12px;padding:9px;margin-bottom:9px}",
    ".fcdq .mc .sc .ring{flex:0 0 46px;width:46px;height:46px;background:conic-gradient(var(--rosa) calc(var(--p)*1%),rgba(255,247,210,.14) 0)}",
    ".fcdq .mc .sc .ring span{width:36px;height:36px;font-size:14px;background:var(--ink);color:var(--beige)}",
    ".fcdq .mc .sc .ring small{font-size:6.5px;color:rgba(255,247,210,.6)}",
    ".fcdq .mc .sc p{font-size:9.5px;line-height:1.55;color:rgba(255,247,210,.7)}",
    ".fcdq .mc .sc p b{color:var(--beige)}",
    ".fcdq .mc .k{font-size:7.5px;font-weight:800;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,247,210,.6);margin:4px 0 6px}",
    ".fcdq .mc .row{display:flex;align-items:center;justify-content:space-between;gap:6px;background:rgba(255,247,210,.06);border:1px solid rgba(255,247,210,.08);border-radius:8px;padding:6px 7px;margin-top:5px;font-weight:700;color:var(--beige);font-size:9.5px}",
    ".fcdq .mc .row.bad{border-color:var(--rosa);background:rgba(255,207,253,.12)}",
    ".fcdq .mc .row span:last-child{display:flex;align-items:center;gap:5px;color:rgba(255,247,210,.6);font-weight:600}",
    ".fcdq .mc .li{display:flex;gap:6px;align-items:center;background:rgba(255,247,210,.06);border-radius:7px;padding:6px 7px;margin-top:5px;font-weight:600;color:var(--beige);font-size:9px}",
    ".fcdq .mc .li i{flex:0 0 5px;width:5px;height:5px;border-radius:50%;background:var(--rosa)}",
    ".fcdq .mc .li.y i{background:var(--beige)}",
    ".fcdq .mc .li.g i{background:var(--rosa)}",
    ".fcdq .mc .nx{margin-top:9px;border-radius:9px;background:var(--rosa);color:var(--ink);font-weight:800;font-size:9.5px;padding:7px 9px;display:flex;justify-content:space-between}",
    ".fcdq .tag{display:inline-block;font-size:7.5px;font-weight:900;letter-spacing:1px;text-transform:uppercase;border-radius:5px;padding:2px 5px}",
    ".fcdq .tag.t-fr{background:var(--rosa);color:var(--ink)}",
    ".fcdq .tag.t-mej{background:var(--beige);color:var(--ink)}",
    ".fcdq .tag.t-ok{background:transparent;color:inherit;box-shadow:inset 0 0 0 1px currentColor}",
    ".fcdq .mc .row span.tag.t-fr,.fcdq .mc .row span.tag.t-mej{color:var(--ink)}",
    "@media (max-width:380px){.fcdq .mc{font-size:9.5px}}",
    /* tarjeta de pregunta */
    ".fcdq .qc{background:var(--card);border:1px solid var(--ln);border-radius:26px;padding:24px 20px 24px;box-shadow:0 18px 50px rgba(52,51,55,.10);text-align:left}",
    ".fcdq .hero .qc{margin-top:8px;text-align:center;border:2px solid var(--ink);box-shadow:0 8px 0 var(--rosa),0 18px 50px rgba(52,51,55,.12)}",
    ".fcdq .qc .hd{display:flex;align-items:center;justify-content:space-between;gap:10px}",
    ".fcdq .qc .cnt{font-size:12px;font-weight:800;letter-spacing:2.2px;text-transform:uppercase;color:var(--mu2);margin-left:auto}",
    ".fcdq .qc .cnt b{color:var(--ink)}",
    ".fcdq .back{background:none;border:0;color:var(--mu);font-weight:700;font-size:13px;padding:4px 0}",
    ".fcdq .pills{display:flex;gap:5px;margin:14px 0 22px}",
    ".fcdq .pills i{flex:1;height:6px;border-radius:9px;background:rgba(52,51,55,.1)}",
    ".fcdq .pills i.on{background:var(--ink)}",
    ".fcdq .pills i.now{background:linear-gradient(90deg,var(--ink) 50%,rgba(52,51,55,.1) 50%)}",
    ".fcdq .sec{display:inline-block;font-size:12px;font-weight:800;letter-spacing:2.4px;text-transform:uppercase;color:var(--ink);background:var(--rosa);border-radius:6px;padding:3px 8px;margin-bottom:12px}",
    ".fcdq .q{font-family:" + SERIF + ";font-weight:400;font-size:clamp(27px,7.4vw,34px);line-height:1.12;color:var(--ink);text-wrap:balance;outline:none}",
    ".fcdq .hero .q{font-size:clamp(28px,7.8vw,36px)}",
    ".fcdq .qs{color:var(--mu);font-size:15.5px;line-height:1.55;margin-top:10px}",
    ".fcdq .opts{display:flex;flex-direction:column;gap:11px;margin-top:22px}",
    ".fcdq .opt{display:flex;align-items:center;gap:14px;width:100%;text-align:left;font-size:16.5px;line-height:1.35;font-weight:700;color:var(--ink);border:1.5px solid var(--ln);border-radius:18px;padding:17px 16px;background:#fff;transition:border-color .2s,background .2s,transform .15s}",
    ".fcdq .opt .lt{flex:0 0 34px;width:34px;height:34px;border-radius:10px;border:1.5px solid var(--ln);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:var(--mu);text-transform:uppercase}",
    ".fcdq .opt .tx{flex:1}",
    ".fcdq .opt .rd{flex:0 0 24px;width:24px;height:24px;border-radius:50%;border:2px solid rgba(52,51,55,.25);transition:all .2s}",
    ".fcdq .hero .opt{justify-content:center;text-align:center;background:var(--beige);border-color:transparent;padding:19px 16px}",
    "@media (hover:hover){.fcdq .opt:hover{border-color:var(--ink);background:#fff}.fcdq .hero .opt:hover{background:var(--rosa)}}",
    ".fcdq .opt:active{transform:scale(.99)}",
    ".fcdq .opt.sel{border-color:var(--ink);background:var(--rosa)}",
    ".fcdq .opt.sel .lt{background:var(--ink);border-color:var(--ink);color:var(--beige)}",
    ".fcdq .opt.sel .rd{border-color:var(--ink);background:var(--ink);box-shadow:inset 0 0 0 4px var(--rosa)}",
    ".fcdq textarea{display:block;width:100%;margin-top:22px;font:inherit;font-size:16.5px;line-height:1.5;color:var(--ink);background:#fff;border:1.5px solid var(--ln);border-radius:18px;padding:16px 18px;min-height:140px;resize:vertical}",
    ".fcdq textarea::placeholder,.fcdq .in::placeholder{color:#8a888e}",
    ".fcdq textarea:focus{border-color:var(--ink);outline:none}",
    ".fcdq .cc{text-align:right;font-size:13px;color:var(--mu2);margin-top:8px}",
    ".fcdq .cc b{color:var(--ink)}",
    ".fcdq .qc .btn{margin-top:16px}",
    ".fcdq .qz{padding:20px 0 40px}",
    ".fcdq .intro{color:var(--tx);font-size:16.5px;line-height:1.6;margin:24px auto 0;max-width:460px;text-wrap:balance}",
    ".fcdq .basado{color:var(--mu2);font-size:13.5px;margin:12px auto 0;max-width:420px}",
    /* analizando */
    ".fcdq .an{padding:56px 0 80px;text-align:center;min-height:60vh}",
    ".fcdq .spin{width:54px;height:54px;margin:0 auto 22px;border-radius:50%;border:4px solid rgba(52,51,55,.12);border-top-color:var(--ink);animation:fcdq-spin .8s linear infinite}",
    "@keyframes fcdq-spin{to{transform:rotate(360deg)}}",
    ".fcdq .an h2{font-size:clamp(27px,7.4vw,34px);color:var(--ink);line-height:1.15}",
    ".fcdq .chk{list-style:none;display:flex;flex-direction:column;gap:11px;max-width:300px;margin:26px auto 0;text-align:left}",
    ".fcdq .chk li{display:flex;align-items:center;gap:10px;font-size:15.5px;color:var(--mu2);transition:color .3s}",
    ".fcdq .chk li i{flex:0 0 22px;width:22px;height:22px;border-radius:50%;border:2px solid rgba(52,51,55,.2);display:flex;align-items:center;justify-content:center;font-style:normal;font-size:12px;font-weight:900;color:transparent;transition:all .3s}",
    ".fcdq .chk li.ok{color:var(--ink)}",
    ".fcdq .chk li.ok i{background:var(--rosa);border-color:var(--ink);color:var(--ink)}",
    /* adelanto */
    ".fcdq .cost{border-radius:24px;padding:24px 20px;background:var(--ink);color:var(--beige)}",
    ".fcdq .kl{display:flex;align-items:flex-start;gap:12px;font-size:12px;font-weight:900;letter-spacing:2.4px;text-transform:uppercase;line-height:1.6;color:var(--rosa);margin-bottom:14px}",
    ".fcdq .kl::before{content:'';flex:0 0 20px;height:2px;background:currentColor;margin-top:.8em}",
    ".fcdq .kl.g{color:var(--ink)}",
    ".fcdq .cost p{font-size:17px;line-height:1.6;color:var(--beige)}",
    ".fcdq .cost .kl{color:var(--rosa)}",
    ".fcdq .rec{margin-top:14px;border-radius:24px;padding:24px 18px;border:1px solid var(--ln);background:#fff}",
    ".fcdq .rec h3{font-size:clamp(24px,6.6vw,30px);line-height:1.15;color:var(--ink);margin-bottom:16px;text-wrap:balance}",
    ".fcdq .stp{display:flex;gap:14px;padding:16px 14px;border-radius:18px;background:var(--beige)}",
    ".fcdq .stp+.stp{margin-top:10px}",
    ".fcdq .stp .n{flex:0 0 40px;width:40px;height:40px;border-radius:12px;background:var(--ink);color:var(--rosa);font-family:" + NUM + ";font-weight:800;font-size:17px;display:flex;align-items:center;justify-content:center}",
    ".fcdq .stp b{display:block;color:var(--ink);font-size:16.5px;line-height:1.3}",
    ".fcdq .stp span{display:block;color:var(--mu);font-size:14.5px;line-height:1.55;margin-top:5px}",
    ".fcdq .stp.lk div span{filter:blur(5.5px);user-select:none;pointer-events:none}",
    ".fcdq .res .btn{margin-top:20px}",
    /* formulario */
    ".fcdq .send{width:56px;height:56px;border-radius:16px;background:var(--ink);display:flex;align-items:center;justify-content:center;margin-bottom:16px}",
    ".fcdq .fp{margin-top:18px}",
    ".fcdq .lb{display:block;font-size:15px;font-weight:800;color:var(--ink);margin:16px 0 8px}",
    ".fcdq .in,.fcdq .fp select{display:block;width:100%;font:inherit;font-size:16.5px;color:var(--ink);background:#fff;border:1.5px solid var(--ln);border-radius:16px;padding:16px 16px;min-height:56px}",
    ".fcdq .in:focus,.fcdq .fp select:focus{border-color:var(--ink);outline:none}",
    ".fcdq .telw{display:flex;gap:8px}",
    ".fcdq .telw select{flex:0 0 112px;width:112px;padding:0 10px;background-color:var(--beige);-webkit-appearance:none;appearance:none;background-image:linear-gradient(45deg,transparent 50%,#343337 50%),linear-gradient(135deg,#343337 50%,transparent 50%);background-position:calc(100% - 16px) 50%,calc(100% - 11px) 50%;background-size:5px 5px;background-repeat:no-repeat}",
    ".fcdq .telw .in{flex:1;min-width:0}",
    ".fcdq .hint{font-size:13px;color:var(--mu2);margin-top:7px}",
    ".fcdq .hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}",
    ".fcdq .chkb{display:flex;gap:12px;align-items:flex-start;margin-top:20px;font-size:14px;line-height:1.5;color:var(--mu);cursor:pointer}",
    ".fcdq .chkb input{flex:0 0 22px;width:22px;height:22px;margin:1px 0 0;accent-color:#343337}",
    ".fcdq .chkb a{color:var(--ink);font-weight:700}",
    ".fcdq .err{margin-top:14px;padding:11px 14px;border-radius:12px;background:var(--rosa);border:1.5px solid var(--ink);color:var(--ink);font-size:14px;font-weight:700}",
    ".fcdq .fp .btn{margin-top:18px}",
    /* gracias */
    ".fcdq .gr{text-align:center;padding:34px 22px 30px}",
    ".fcdq .okc{width:72px;height:72px;margin:0 auto 18px;border-radius:50%;background:var(--rosa);border:2px solid var(--ink);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 0 var(--ink)}",
    ".fcdq .gr .q{margin-top:10px}",
    ".fcdq .gr .qs b{color:var(--ink)}",
    ".fcdq .wa{display:flex;gap:12px;align-items:center;text-align:left;margin-top:22px;padding:14px 16px;border-radius:16px;background:var(--beige);border:1px solid var(--ln)}",
    ".fcdq .wa span{font-size:24px}",
    ".fcdq .wa p{font-size:15px;line-height:1.5;color:var(--ink);font-weight:600}",
    /* barras y plan */
    ".fcdq .ring{position:relative;flex:0 0 84px;width:84px;height:84px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:conic-gradient(var(--ink) calc(var(--p)*1%),var(--rosa) 0)}",
    ".fcdq .ring span{width:68px;height:68px;border-radius:50%;background:var(--card);display:flex;align-items:center;justify-content:center;flex-direction:column;font-family:" + NUM + ";font-weight:800;font-size:24px;color:var(--ink);line-height:1}",
    ".fcdq .ring small{font-family:" + SANS + ";font-size:10px;font-weight:700;color:var(--mu2);margin-top:3px}",
    ".fcdq .card{border-radius:22px;border:1px solid var(--ln);background:var(--card);padding:22px 18px}",
    ".fcdq .card+.card,.fcdq .cost+.card,.fcdq .card+.cost{margin-top:14px}",
    ".fcdq .kk{font-size:11.5px;font-weight:900;letter-spacing:1.8px;text-transform:uppercase;color:var(--ink);margin-bottom:12px}",
    ".fcdq .score{display:flex;align-items:center;gap:16px;margin-bottom:16px}",
    ".fcdq .score p{font-size:15px;color:var(--mu);line-height:1.5}",
    ".fcdq .score p b{color:var(--ink)}",
    ".fcdq .ar{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 12px;border-radius:12px;background:#fff;border:1px solid var(--ln);font-size:15px;font-weight:700;color:var(--ink)}",
    ".fcdq .ar+.ar{margin-top:7px}",
    ".fcdq .ar.bad{border:1.5px solid var(--ink);background:var(--rosa)}",
    ".fcdq .ar .v{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--mu2);font-weight:600;white-space:nowrap}",
    ".fcdq .ar .v b{color:var(--ink);font-family:" + NUM + ";font-size:15px}",
    ".fcdq .ar .tag{font-size:9.5px;padding:3px 7px}",
    ".fcdq .ar .tag.t-fr{background:var(--ink);color:var(--rosa)}",
    ".fcdq .ar .tag.t-ok{color:var(--ink)}",
    ".fcdq.plan{padding-top:22px;padding-bottom:6px;background:var(--bg);border-radius:26px;padding-left:16px;padding-right:16px;margin-bottom:30px}",
    ".fcdq .ok{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:800;color:var(--ink);background:var(--rosa);border:1.5px solid var(--ink);border-radius:99px;padding:6px 12px}",
    ".fcdq .ctr{text-align:center}",
    ".fcdq .ttl{font-size:clamp(30px,8.4vw,40px);line-height:1.12;color:var(--ink);text-align:center;margin:14px 0 22px;text-wrap:balance}",
    ".fcdq .quote{font-family:" + SERIF + ";font-style:italic;font-size:20px;line-height:1.4;color:var(--ink)}",
    ".fcdq .tx{font-size:15.5px;color:var(--mu);line-height:1.65}",
    ".fcdq .tx b{color:var(--ink)}",
    ".fcdq .tx+.tx{margin-top:10px}",
    ".fcdq .ph{position:relative;padding:0 0 20px 24px;border-left:2px solid rgba(52,51,55,.2);margin-left:7px}",
    ".fcdq .ph:last-child{padding-bottom:0;border-left-color:transparent}",
    ".fcdq .ph::before{content:'';position:absolute;left:-8px;top:3px;width:14px;height:14px;border-radius:50%;background:var(--rosa);border:2px solid var(--ink);box-shadow:0 0 0 4px var(--card)}",
    ".fcdq .ph small{display:block;font-size:11px;font-weight:900;letter-spacing:1.4px;text-transform:uppercase;color:var(--mu2)}",
    ".fcdq .ph h3{font-size:23px;line-height:1.15;color:var(--ink);margin:2px 0 8px}",
    ".fcdq .ph ul,.fcdq .lst{list-style:none;display:flex;flex-direction:column;gap:8px}",
    ".fcdq .ph li,.fcdq .lst li{position:relative;padding-left:20px;font-size:15px;color:var(--mu);line-height:1.55}",
    ".fcdq .ph li::before,.fcdq .lst li::before{content:'→';position:absolute;left:0;color:var(--ink);font-weight:900}",
    ".fcdq .lst.ck li::before{content:'✓'}",
    ".fcdq .today{border:1.5px solid var(--ink);background:var(--rosa)}",
    ".fcdq .today p{font-size:16px;color:var(--ink);line-height:1.6}",
    ".fcdq .cta{text-align:center;background:var(--ink);border-color:var(--ink)}",
    ".fcdq .cta h3{font-size:clamp(26px,7vw,32px);line-height:1.12;color:var(--beige);margin-bottom:8px;text-wrap:balance}",
    ".fcdq .cta p{font-size:15px;color:rgba(255,247,210,.8);margin-bottom:16px}",
    ".fcdq .cta .btn{background:var(--rosa);color:var(--ink);box-shadow:0 6px 0 var(--beige)}",
    ".fcdq .cta .fine{color:rgba(255,247,210,.7)}",
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
    var c = '<div class="mc c"><div class="dots"><i></i><i></i><i></i>&nbsp;Método RHS · Diagnóstico</div><h4>Tu diagnóstico</h4>' +
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
        '<div class="ticks"><span><i>✓</i> Diagnóstico al instante</span><span><i>✓</i> 100% gratis</span><span><i>✓</i> Sin llamada</span></div>' +
        '<p class="intro">' + Q.length + " preguntas sobre tu cuerpo, tus hábitos y tu objetivo, unos 2 minutos. Te digo qué te está frenando, qué hacer y tu plan para las próximas 12 semanas.</p>" +
        '<p class="basado">Basado en el Método RHS, lo que aplico con mis clientas 1:1.</p>' +
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
        '<p class="fine">Dejas tus datos en el paso siguiente y te enviamos tu plan por WhatsApp. 100% gratis.</p>' +
        "</div></section>";
    }

    var PREFIJOS = [["+34", "🇪🇸 +34"], ["+52", "🇲🇽 +52"], ["+54", "🇦🇷 +54"], ["+57", "🇨🇴 +57"], ["+56", "🇨🇱 +56"], ["+51", "🇵🇪 +51"], ["+593", "🇪🇨 +593"], ["+58", "🇻🇪 +58"], ["+598", "🇺🇾 +598"], ["+595", "🇵🇾 +595"], ["+591", "🇧🇴 +591"], ["+506", "🇨🇷 +506"], ["+507", "🇵🇦 +507"], ["+502", "🇬🇹 +502"], ["+503", "🇸🇻 +503"], ["+504", "🇭🇳 +504"], ["+505", "🇳🇮 +505"], ["+1", "🇺🇸 +1"], ["+1809", "🇩🇴 +1"], ["+351", "🇵🇹 +351"], ["+33", "🇫🇷 +33"], ["+39", "🇮🇹 +39"], ["+49", "🇩🇪 +49"], ["+44", "🇬🇧 +44"], ["+41", "🇨🇭 +41"]];

    function formPropioHTML() {
      return '<form class="fp" novalidate>' +
        '<label class="lb" for="fcdq-nom">Nombre y apellido</label><input class="in" id="fcdq-nom" name="nombre" type="text" autocomplete="name" maxlength="80" placeholder="Tu nombre" required>' +
        '<label class="lb" for="fcdq-em">Email</label><input class="in" id="fcdq-em" name="email" type="email" autocomplete="email" inputmode="email" maxlength="160" placeholder="tu@email.com" required>' +
        '<label class="lb" for="fcdq-tel">WhatsApp</label><div class="telw"><select id="fcdq-pre" name="prefijo" aria-label="Prefijo del país">' + PREFIJOS.map(function (x) { return '<option value="' + x[0] + '">' + x[1] + "</option>"; }).join("") + '</select>' +
        '<input class="in" id="fcdq-tel" name="telefono" type="tel" autocomplete="tel-national" inputmode="tel" maxlength="20" placeholder="612 34 56 78" required></div>' +
        '<p class="hint">Sin el prefijo: ya lo eliges a la izquierda.</p>' +
        '<input class="hp" type="text" name="web" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<label class="chkb"><input type="checkbox" name="acepto" required><span>Acepto la <a href="' + BASE + '/privacidad" target="_blank" rel="noopener">política de privacidad</a> y que me contactéis por WhatsApp o email para enviarme el plan.</span></label>' +
        '<p class="err" role="alert" hidden></p>' +
        '<button type="submit" class="btn">Recibir mi plan <span aria-hidden="true">→</span></button>' +
        "</form>";
    }

    function formularioHTML() {
      return '<section class="qz"><div class="qc">' +
        '<div class="hd"><button type="button" class="back" data-act="atras">← Atrás</button><span class="cnt">Último paso</span></div>' + pillsHTML(Q.length) +
        '<div class="send" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FFCFFD" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/></svg></div>' +
        '<h2 class="q" tabindex="-1" data-focus>¿A dónde te envío tu plan personalizado?</h2>' +
        '<p class="qs">Tu diagnóstico ya está listo. Déjame tus datos y te enviamos por WhatsApp tu plan de 12 semanas y tu primer paso.</p>' +
        formPropioHTML() +
        '<div class="ticks" style="margin-top:14px"><span><i>🔒</i> Tus datos están protegidos</span><span><i>✓</i> Sin spam</span><span><i>✓</i> 100% gratis</span></div>' +
        "</div></section>";
    }

    function respuestasEtiquetadas() {
      return Q.map(function (p) {
        var a = p.tipo === "abierta" ? (st.t[p.id] || "") : (p.o[L.indexOf(st.a[p.id])] || "");
        return { q: p.q, a: String(a).trim() };
      });
    }
    function utm() {
      var u = {};
      try { new URLSearchParams(location.search).forEach(function (v, k) { if (/^utm_|^fbclid$|^gclid$/.test(k)) u[k] = v.slice(0, 200); }); } catch (e) {}
      return u;
    }

    function activarFormPropio() {
      var f = root.querySelector("form.fp");
      if (!f) return;
      var err = f.querySelector(".err"), btn = f.querySelector('button[type="submit"]');
      function fallo(m, campo) { err.textContent = m; err.hidden = false; if (campo) try { campo.focus(); } catch (e) {} }
      f.addEventListener("submit", function (e) {
        e.preventDefault();
        err.hidden = true;
        var nom = f.nombre.value.trim(), em = f.email.value.trim(), tel = f.telefono.value.replace(/[^\d]/g, "");
        if (tel.indexOf("00") === 0) tel = tel.slice(2);
        var pre = f.prefijo.value === "+1809" ? "+1" : f.prefijo.value;
        if (nom.length < 2) return fallo("Escribe tu nombre.", f.nombre);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) return fallo("Revisa tu email: parece que no está bien escrito.", f.email);
        if (tel.length < 6 || tel.length > 13) return fallo("Revisa tu número de WhatsApp (sin el prefijo del país).", f.telefono);
        if (!f.acepto.checked) return fallo("Para enviarte el plan necesito que aceptes la política de privacidad.", f.acepto);
        var p = construir(datos());
        var cuerpo = {
          nombre: nom, email: em, telefono: pre + tel, web: f.web.value,
          respuestas: respuestasEtiquetadas(),
          diagnostico: { media: p.media, freno: p.areaNombre, areas: AREAS.map(function (x) { return { n: x.n, v: p.s[x.k] }; }) },
          plan: planTexto(datos(), nom),
          pagina: location.href.split("#")[0].slice(0, 300), utm: utm()
        };
        btn.disabled = true; btn.innerHTML = "Enviando…";
        fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cuerpo) })
          .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { status: r.status, j: j }; }); })
          .then(function (res) {
            if (res.status === 400) { var e400 = new Error("datos"); e400.datos = true; throw e400; }
            if (!res.j || !res.j.ok) throw new Error("envio");
            var d = datos(); d.n = nom; guardar(d);
            st.n = nom; st.tel = pre + " " + tel;
            track("registro_enviado", { freno: p.area });
            try { if (typeof window.fbq === "function") window.fbq("track", "Lead"); } catch (e2) {}
            ir("gracias");
          })
          .catch(function (er) {
            btn.disabled = false; btn.innerHTML = 'Recibir mi plan <span aria-hidden="true">→</span>';
            fallo(er && er.datos ? "Revisa tus datos: el email o el WhatsApp no parecen correctos." : "No se ha podido enviar. Revisa tu conexión e inténtalo de nuevo.");
          });
      });
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
      else if (p === "form") { root.innerHTML = formularioHTML(); activarFormPropio(); }
      else if (p === "gracias" || p === "plan") root.innerHTML = graciasHTML();
      var ta = root.querySelector("#fcdq-t");
      if (ta) {
        var id = Q[st.paso].id, b = root.querySelector('[data-act="texto"]'), cc = root.querySelector(".cc b");
        ta.addEventListener("input", function () { st.t[id] = ta.value; cc.textContent = ta.value.length; b.disabled = ta.value.trim().length < 2; salvar(); });
      }
    }

    function graciasHTML() {
      var nom = String(st.n || "").trim().split(/\s+/)[0] || "";
      if (nom) nom = nom.charAt(0).toUpperCase() + nom.slice(1).toLowerCase();
      return '<section class="qz"><div class="qc gr">' +
        '<div class="okc" aria-hidden="true"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#343337" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>' +
        '<p class="eb">Solicitud recibida</p>' +
        '<h2 class="q" tabindex="-1" data-focus>' + (nom ? "¡Gracias, " + esc(nom) + "!" : "¡Gracias!") + "</h2>" +
        '<p class="qs">Ya tenemos tu diagnóstico. Te enviaremos tu <b>plan personalizado por WhatsApp</b>' + (st.tel ? " al <b>" + esc(st.tel) + "</b>" : "") + ".</p>" +
        '<div class="wa"><span aria-hidden="true">💬</span><p>Estate atenta a tu WhatsApp: te escribiremos nosotros muy pronto.</p></div>' +
        "</div></section>";
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

  /* ── PLAN ──────────────────────────────────────────────────────────────── */
  // Plan en texto: va en el correo para que el equipo se lo envíe por WhatsApp.
  function planTexto(d, nombre) {
    var p = construir(d);
    var nom = String(nombre || "").trim().split(/\s+/)[0] || "";
    if (nom) nom = nom.charAt(0).toUpperCase() + nom.slice(1).toLowerCase();
    var L2 = [];
    L2.push("Hola" + (nom ? " " + nom : "") + ", aquí tienes tu plan personalizado del Método RHS:");
    L2.push("");
    L2.push("Tu puntuación: " + p.media + "/100. Tu mayor freno: " + p.areaNombre.toLowerCase() + ".");
    L2.push("");
    L2.push("Lo que " + p.cuesta + " te está costando:");
    L2.push(p.freno);
    L2.push("");
    L2.push("Cómo recuperarlo:");
    p.pasos.forEach(function (x, i) { L2.push((i + 1) + ". " + x[0] + ": " + x[1]); });
    if (p.respetos.length) { L2.push(""); L2.push("Respetando lo que no quieres hacer:"); p.respetos.forEach(function (x) { L2.push("- " + x); }); }
    L2.push("");
    L2.push("Tu plan de 12 semanas:");
    p.fases.forEach(function (f) { L2.push(f.k + " · " + f.t); f.l.forEach(function (x) { L2.push("- " + x); }); });
    L2.push("");
    L2.push("Tu primer paso, hoy mismo: " + p.hoy);
    return L2.join("\n");
  }

  function planHTML(d) {
    var p = construir(d), t = d.t || {};
    var nom = String(d.n || "").trim().split(/\s+/)[0] || "";
    if (nom) nom = nom.charAt(0).toUpperCase() + nom.slice(1).toLowerCase();
    var fasesHTML = p.fases.map(function (f) {
      return '<div class="ph"><small>' + f.k + '</small><h3 class="serif">' + esc(f.t) + "</h3><ul>" + f.l.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>";
    }).join("");
    var tibia = d.a && (d.a.prioridad === "c" || d.a.prioridad === "d");
    var ctaTxt = tibia
      ? "Cuando quieras ir en serio, en una llamada gratuita de 30 minutos revisamos tu plan y te digo cómo aplicarlo a tu caso."
      : "En una llamada gratuita de 30 minutos revisamos tu plan juntos y te digo exactamente cómo aplicarlo a tu cuerpo y a tu día a día.";
    var probadoHTML = vacio(t.probado) ? "" : '<p class="tx">Me dijiste que has probado: <b>«' + esc(t.probado) + "»</b>. Este plan no va por ahí.</p>";
    return '<section class="res">' +
      '<div class="ctr"><span class="ok">✓ Plan desbloqueado</span></div>' +
      '<h1 class="ttl serif" tabindex="-1" data-focus>' + (nom ? esc(nom) + ", este es tu plan" : "Este es tu plan") + ' <span class="pill">personalizado</span></h1>' +
      '<div class="card"><p class="kk">Tu diagnóstico</p><div class="score">' + ring(p.media) + "<p>Tu puntuación global es <b>" + p.media + " de 100</b>. Tu mayor freno es <b>" + esc(p.areaNombre.toLowerCase()) + "</b>: por ahí empieza tu plan.</p></div>" + areasHTML(p.s, p.area) + "</div>" +
      (vacio(t.situacion) ? "" : '<div class="card"><p class="kk">Tu punto de partida</p><p class="quote">«' + esc(t.situacion) + "»</p></div>") +
      '<div class="cost"><p class="kl">Lo que ' + esc(p.cuesta) + " te está costando</p><p>" + esc(p.freno) + "</p></div>" +
      '<div class="card"><p class="kl g">Cómo recuperarlo</p>' + p.pasos.map(function (x, i) { return '<div class="stp"><span class="n">' + (i + 1) + "</span><div><b>" + esc(x[0]) + "</b><span>" + esc(x[1]) + "</span></div></div>"; }).join("") + "</div>" +
      '<div class="card"><p class="kk">Por qué no te ha funcionado hasta ahora</p><p class="tx">' + esc(p.porque) + "</p>" + probadoHTML + (p.edad ? '<p class="tx">' + esc(p.edad) + "</p>" : "") + "</div>" +
      (p.respetos.length ? '<div class="card"><p class="kk">Respetando lo que no quieres hacer</p><ul class="lst ck">' + p.respetos.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>" : "") +
      '<div class="card"><p class="kk">Tu plan de 12 semanas</p>' + fasesHTML + "</div>" +
      '<div class="card today"><p class="kk">Tu primer paso, hoy mismo</p><p>' + esc(p.hoy) + "</p></div>" +
      '<div class="card cta"><h3 class="serif">¿Quieres que te ayude a aplicarlo?</h3><p>' + ctaTxt + '</p><a class="btn" href="#agendar" data-agendar>📞 Revisar mi plan en una llamada gratis</a><p class="fine">30 minutos · 100% gratuito · sin compromiso</p></div>' +
      '<div class="div">Antes de la llamada, mira este vídeo</div>' + "</section>";
  }

  function activarPlan(root, p) {
    root.querySelectorAll("[data-agendar]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        var tg = document.getElementById("agendar") || document.getElementById("fcd-agendar");
        track("plan_agendar");
        if (tg) { e.preventDefault(); tg.scrollIntoView({ behavior: "smooth", block: "start" }); }
      });
    });
    track("plan_visto", { freno: p.area });
  }

  // Página de acceso a recursos: pinta el plan si la lead viene del quiz.
  function montarPlan(root) {
    var d = cargar();
    if (!d || !d.t) { root.innerHTML = ""; root.style.display = "none"; return; }
    root.innerHTML = planHTML(d);
    activarPlan(root, construir(d));
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

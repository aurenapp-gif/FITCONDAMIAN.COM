// Los 10 recursos gratuitos: nombre, gancho, portada y enlaces.
// Lo usan la landing /recursos (antes de registrarse) y /acceso-recursos (después).
// Los códigos de GoHighLevel (ghl-export/recursos*.html) llevan una copia de esta lista.

export type Recurso = {
  id: string;         // clave interna (r01…r10), la usa el test de la landing
  n: string;          // número visible en la portada
  g: string;          // clase de color de la portada (app/_styles/er.css)
  cat: string;        // etiqueta corta de la portada
  name: string;       // nombre del recurso
  hook: string;       // una línea de beneficio
  linkVideo: string;  // vídeo de YouTube o "#" si no tiene
  linkDoc: string;    // documento, guía o test
  docLabel?: string;  // texto del botón del documento
};

export const RECURSOS: Recurso[] = [
  { id: "r01", n: "01", g: "er-g1",  cat: "Test",      name: "Test de tu Edad Real",
    hook: "Descubre cuántos años tiene tu cuerpo por dentro y cómo empezar a quitárselos.",
    linkVideo: "https://youtu.be/0b7aIuPJaKo",
    linkDoc: "https://docs.google.com/document/d/1V7yt1PqsGQ94hrfg0ZvKssG5anq9YQdWChuIUWF29uk/edit?usp=sharing" },
  { id: "r02", n: "02", g: "er-g2",  cat: "Test",      name: "El Test del Espejo",
    hook: "Los hábitos que te están envejeciendo y haciendo verte flácida sin que lo sepas.",
    linkVideo: "https://youtu.be/WFn9kDt3FsA",
    linkDoc: "https://docs.google.com/document/d/1VZ4_MZc70PqgGliHsGplkZ6xoK_r1FdxmZi_1YRyT8I/edit?usp=sharing" },
  { id: "r03", n: "03", g: "er-g3",  cat: "Con IA",    name: "Tu Coach Personal con IA",
    hook: "Te crea un plan a tu medida para que esta vez no lo abandones.",
    linkVideo: "https://youtu.be/qZArQavUepk",
    linkDoc: "https://docs.google.com/document/d/1Y9gKtg2GO50LH30e8dKqpp99Y2afHN4GZlgDTZiMInU/edit?usp=sharing" },
  { id: "r04", n: "04", g: "er-g4",  cat: "Plan",      name: "El Mapa de las +1.000",
    hook: "El plan paso a paso que han seguido más de 1.000 mujeres para eliminar la flacidez.",
    linkVideo: "https://youtu.be/pUwfONeAbuk",
    linkDoc: "https://docs.google.com/document/d/1SWwjWBsRMb1K4SEcLMGYE7ASWvjAkNXOhFFV_1u9qk8/edit?usp=sharing" },
  { id: "r05", n: "05", g: "er-g5",  cat: "Exclusivo", name: "Acceso VIP: Técnicas Filtradas",
    hook: "Lo que solo ven las alumnas de mi programa privado Envejecimiento Revertido.",
    linkVideo: "#",
    linkDoc: "https://docs.google.com/document/d/1xv9LAmY7VfWKhhnN19oRk48FzuM0hssq1NvaXWUAQL4/edit?usp=sharing" },
  { id: "r06", n: "06", g: "er-g6",  cat: "Nutrición", name: "El Plato Anti-Menopausia",
    hook: "Qué comer para deshincharte, tener energía y no ganar peso.",
    linkVideo: "https://youtu.be/oQqtijKMbHw",
    linkDoc: "https://guialaimentacionmenopausia.netlify.app", docLabel: "Abrir guía" },
  { id: "r07", n: "07", g: "er-g7",  cat: "Grasa",     name: "Adiós a la Tripa de la Menopausia",
    hook: "3 cambios para perder grasa abdominal sin pasar hambre.",
    linkVideo: "#",
    linkDoc: "https://guiaperdidadegrasa.netlify.app", docLabel: "Abrir guía" },
  { id: "r08", n: "08", g: "er-g8",  cat: "Energía",   name: "¿Qué te Roba la Energía?",
    hook: "Descubre por qué estás cansada todo el día y cómo recuperar tu vitalidad.",
    linkVideo: "#",
    linkDoc: "https://test-amticansancio.netlify.app", docLabel: "Hacer el test" },
  { id: "r09", n: "09", g: "er-g9",  cat: "Grasa",     name: "Adelgaza Sin Rebote",
    hook: "La estrategia para perder grasa y que no vuelva.",
    linkVideo: "#",
    linkDoc: "https://estrategia-perdida-grasa.netlify.app", docLabel: "Abrir estrategia" },
  { id: "r10", n: "10", g: "er-g10", cat: "Músculo",   name: "Firme y Tonificada",
    hook: "Recupera músculo y di adiós a la flacidez en brazos, glúteos y piernas.",
    linkVideo: "#",
    linkDoc: "https://protocolomasamuscular.netlify.app", docLabel: "Abrir protocolo" },
];

export const recursoPorId = (id: string) => RECURSOS.find((r) => r.id === id)!;

// Calendario de "Agenda tu llamada", VSL (Vimeo) y casos de éxito (YouTube).
export const CALENDARIO = "https://links.fitcondamian.com/widget/bookings/reserva-de-la-llamada";
// Mismo calendario, versión para incrustar en la página (el botón baja hasta él).
export const CALENDARIO_EMBED = "https://links.fitcondamian.com/widget/booking/ZW1BMfIE9nqeZvmsoNRy";
export const VSL_SRC = "https://player.vimeo.com/video/1228323445?title=0&byline=0&portrait=0&badge=0&dnt=1&color=35C2FF";
export const CASOS_EXITO = ["wnaKW0mFnHw", "hrVa6H6ankg", "E8AU7yjUHGA"];

// Extrae el ID de un enlace de YouTube (null si no hay vídeo).
export function youtubeId(url: string): string | null {
  if (!url || url === "#") return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

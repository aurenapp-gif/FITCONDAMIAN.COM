import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agenda tu Llamada Gratuita",
  description: "Reserva una llamada estratégica gratuita de 30 minutos. Te digo exactamente qué necesitas para transformar tu cuerpo.",
};

// Calendario GHL — Reserva de llamada 1:1 con Damián
// En GHL ve a tu calendario → Configuración → URL de confirmación = https://fitcondamian.com/gracias
const GHL_CALENDAR_EMBED = `
  <iframe
    src="https://links.fitcondamian.com/widget/bookings/reserva-de-llamada-1a1-damian"
    style="width:100%;min-height:700px;border:none;overflow:hidden;"
    scrolling="no"
    title="Reserva tu llamada con Damián"
    loading="lazy">
  </iframe>
`;

const beneficios = [
  { emoji: "🎯", texto: "Análisis personalizado de tu situación actual" },
  { emoji: "🗺️", texto: "Un plan de acción concreto para las próximas 4 semanas" },
  { emoji: "❓", texto: "Respuestas a todas tus dudas sobre nutrición y entrenamiento" },
  { emoji: "🚫", texto: "Sin presión de venta — solo valor real" },
];

export default function AgendarPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">

      {/* HEADER */}
      <header className="py-5 px-6 text-center border-b border-gray-100">
        <p className="text-xl font-black tracking-tight text-gray-900">
          Fit con <span className="text-brand">Damián</span>
        </p>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12 w-full">

        {/* BADGE */}
        <div className="flex justify-center mb-6">
          <span className="bg-orange-50 text-brand font-bold text-sm px-4 py-2 rounded-full border border-orange-200">
            📞 30 minutos · 100% Gratuito · Sin compromiso
          </span>
        </div>

        {/* HEADLINE */}
        <h1 className="text-4xl md:text-5xl font-black text-center text-gray-900 leading-tight mb-5">
          Agenda tu llamada{" "}
          <span className="text-brand">estratégica gratuita</span>
        </h1>

        <p className="text-lg text-center text-gray-600 leading-relaxed mb-10">
          En 30 minutos te digo exactamente qué necesitas cambiar para empezar a ver resultados.
          Sin rodeos. Sin venderme.
        </p>

        {/* BENEFICIOS */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-10 border border-gray-200">
          <h2 className="font-black text-gray-900 mb-4 text-lg">En esta llamada vas a conseguir:</h2>
          <ul className="space-y-3">
            {beneficios.map((b, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="text-xl">{b.emoji}</span>
                <span className="text-gray-700">{b.texto}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* DIVIDER */}
        <div className="section-divider" />

        <h2 className="text-2xl font-black text-center text-gray-900 mb-2">
          Elige tu horario
        </h2>
        <p className="text-center text-gray-500 text-sm mb-8">
          Selecciona el día y la hora que mejor te venga
        </p>

        {/* GHL CALENDAR EMBED */}
        <div
          className="min-h-[500px] rounded-2xl overflow-hidden border border-gray-200"
          dangerouslySetInnerHTML={{ __html: GHL_CALENDAR_EMBED }}
        />

        {/* QUIÉN SOY */}
        <div className="mt-12 flex gap-4 items-start bg-orange-50 rounded-2xl p-6 border border-orange-100">
          <div className="w-14 h-14 bg-brand rounded-full flex items-center justify-center text-white font-black text-xl flex-shrink-0">
            D
          </div>
          <div>
            <p className="font-black text-gray-900 mb-1">Damián</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Entrenador personal y nutricionista. Más de X años transformando cuerpos
              con un método basado en la ciencia y adaptado a la vida real.
              {/* 👉 Personaliza esta bio con tu info real */}
            </p>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="mt-auto py-8 px-6 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} Fit con Damián · fitcondamian.com
          {" · "}
          <a href="/privacidad" className="hover:text-brand transition-colors">Privacidad</a>
          {" · "}
          <a href="/aviso-legal" className="hover:text-brand transition-colors">Aviso Legal</a>
        </p>
      </footer>
    </main>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tus Recursos Gratuitos",
  robots: { index: false, follow: false },
};

// =====================================================
// 👉 REEMPLAZA LOS LINKS DE CADA RECURSO con tus URLs reales
// (PDF de Google Drive, Notion, etc.)
// =====================================================
const recursos = [
  {
    emoji: "📋",
    titulo: "Diagnóstico de Composición Corporal",
    descripcion: "Descubre en 3 minutos dónde estás y qué necesitas cambiar.",
    linkLabel: "Acceder al diagnóstico",
    href: "#",  // 👉 Reemplaza con tu link real
    color: "bg-orange-50 border-orange-200",
    btnColor: "bg-brand hover:bg-brand-dark",
  },
  {
    emoji: "🥗",
    titulo: "Guía de Nutrición Sin Dietas",
    descripcion: "El sistema de alimentación que uso con mis clientes de pago.",
    linkLabel: "Descargar guía (PDF)",
    href: "#",  // 👉 Reemplaza con tu link real
    color: "bg-green-50 border-green-200",
    btnColor: "bg-green-600 hover:bg-green-700",
  },
  {
    emoji: "💪",
    titulo: "Rutina de Entrenamiento Express",
    descripcion: "30 minutos, 3 veces por semana. El programa que transforma cuerpos.",
    linkLabel: "Descargar rutina (PDF)",
    href: "#",  // 👉 Reemplaza con tu link real
    color: "bg-blue-50 border-blue-200",
    btnColor: "bg-blue-600 hover:bg-blue-700",
  },
  {
    emoji: "😴",
    titulo: "Protocolo de Recuperación",
    descripcion: "El factor oculto que sabotea tus resultados. La guía definitiva.",
    linkLabel: "Descargar protocolo (PDF)",
    href: "#",  // 👉 Reemplaza con tu link real
    color: "bg-purple-50 border-purple-200",
    btnColor: "bg-purple-600 hover:bg-purple-700",
  },
];

export default function AccesoRecursosPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">

      {/* HEADER */}
      <header className="py-5 px-6 text-center border-b border-gray-100">
        <p className="text-xl font-black tracking-tight text-gray-900">
          Fit con <span className="text-brand">Damián</span>
        </p>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12 w-full">

        {/* WELCOME */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
            ¡Acceso concedido!
          </h1>
          <p className="text-gray-600 text-lg">
            Aquí tienes todos tus recursos gratuitos. Guárdalos antes de cerrar esta página.
          </p>
        </div>

        {/* RECURSOS */}
        <div className="grid grid-cols-1 gap-5 mb-12">
          {recursos.map((r, i) => (
            <div key={i} className={`rounded-2xl border p-6 ${r.color}`}>
              <div className="flex items-start gap-4">
                <div className="text-4xl flex-shrink-0">{r.emoji}</div>
                <div className="flex-1">
                  <h2 className="font-black text-gray-900 text-lg mb-1">{r.titulo}</h2>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{r.descripcion}</p>
                  <a
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-block text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-colors ${r.btnColor}`}
                  >
                    {r.linkLabel} →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* BONUS CTA — Agendar llamada */}
        <div className="bg-gray-900 text-white rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">📞</div>
          <h2 className="text-2xl font-black mb-3">
            ¿Quieres resultados más rápidos?
          </h2>
          <p className="text-gray-300 mb-6 leading-relaxed">
            Agenda una llamada gratuita de 30 minutos conmigo.
            Te digo exactamente qué tienes que hacer según tu caso.
          </p>
          <a href="/agendar" className="btn-primary">
            Agendar llamada gratuita
          </a>
          <p className="text-xs text-gray-500 mt-3">Sin compromiso · 100% gratuito</p>
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

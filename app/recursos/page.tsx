"use client";

import Script from "next/script";

const recursos = [
  {
    emoji: "📋",
    titulo: "Diagnóstico de Composición Corporal",
    descripcion: "Descubre en 3 minutos exactamente dónde estás y qué necesitas cambiar para ver resultados reales.",
  },
  {
    emoji: "🥗",
    titulo: "Guía de Nutrición Sin Dietas",
    descripcion: "El sistema de alimentación que uso con mis clientes para perder grasa sin pasar hambre ni contar calorías.",
  },
  {
    emoji: "💪",
    titulo: "Rutina de Entrenamiento Express",
    descripcion: "30 minutos al día, 3 veces por semana. El programa que transforma cuerpos sin vivir en el gimnasio.",
  },
  {
    emoji: "😴",
    titulo: "Protocolo de Recuperación",
    descripcion: "El factor oculto que sabotea tus resultados. La guía de descanso y recuperación que nadie te cuenta.",
  },
];

export default function RecursosPage() {
  return (
    <main className="min-h-screen bg-white">

      {/* GHL form embed script */}
      <Script
        src="https://links.fitcondamian.com/js/form_embed.js"
        strategy="afterInteractive"
      />

      {/* HEADER */}
      <header className="py-5 px-6 text-center border-b border-gray-100">
        <p className="text-xl font-black tracking-tight text-gray-900">
          Fit con <span className="text-brand">Damián</span>
        </p>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* BADGE */}
        <div className="flex justify-center mb-6">
          <span className="bg-orange-50 text-brand font-bold text-sm px-4 py-2 rounded-full border border-orange-200">
            🎁 100% GRATIS — Sin tarjeta de crédito
          </span>
        </div>

        {/* HEADLINE */}
        <h1 className="text-4xl md:text-5xl font-black text-center text-gray-900 leading-tight mb-5">
          Accede gratis a los recursos que han{" "}
          <span className="text-brand">transformado cientos de cuerpos</span>
        </h1>

        {/* SUBHEADLINE */}
        <p className="text-lg md:text-xl text-center text-gray-600 leading-relaxed mb-8">
          Sin dietas imposibles. Sin horas en el gimnasio. Sin excusas.
          <br />
          <strong className="text-gray-800">El mismo sistema que uso con mis clientes de pago.</strong>
        </p>

        {/* VIDEO PLACEHOLDER */}
        <div className="rounded-2xl overflow-hidden bg-gray-900 aspect-video flex items-center justify-center mb-4 shadow-xl">
          <div className="text-center text-white px-6">
            <div className="text-5xl mb-3">▶️</div>
            <p className="font-bold text-lg">Mira esto antes de acceder</p>
            <p className="text-gray-400 text-sm mt-1">
              Pega aquí tu video embed de YouTube o Vimeo
            </p>
          </div>
        </div>
        <p className="text-center text-sm text-gray-500 mb-10">
          🔊 Activa el sonido para escuchar el mensaje completo
        </p>

        {/* RECURSOS CARDS */}
        <div className="mb-10">
          <h2 className="text-2xl font-black text-center text-gray-900 mb-2">
            Esto es lo que vas a recibir
          </h2>
          <p className="text-center text-gray-500 mb-6 text-sm">
            Todo lo que necesitas para empezar hoy mismo
          </p>

          <div className="grid grid-cols-1 gap-4">
            {recursos.map((r, i) => (
              <div
                key={i}
                className="flex gap-4 p-5 rounded-xl border border-gray-200 bg-gray-50 hover:border-brand hover:bg-orange-50 transition-colors"
              >
                <div className="text-3xl flex-shrink-0">{r.emoji}</div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{r.titulo}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{r.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DIVIDER */}
        <div className="section-divider" />

        {/* CTA PRE-FORM */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            ¿Listo para empezar?
          </h2>
          <p className="text-gray-600">
            Déjame tu correo y te envío acceso inmediato a todos los recursos
          </p>
        </div>

        {/* GHL FORM EMBED */}
        <div className="rounded-2xl overflow-hidden border border-gray-200">
          <iframe
            src="https://links.fitcondamian.com/widget/form/vmfyZr4yJIrYZYPSkuko"
            style={{ width: "100%", minHeight: "400px", border: "none" }}
            id="inline-vmfyZr4yJIrYZYPSkuko"
            data-layout="{'id':'LAYOUT_vmfyZr4yJIrYZYPSkuko'}"
            data-trigger-type="alwaysShow"
            data-activation-type="alwaysActivated"
            title="Formulario de acceso a recursos gratuitos"
          />
        </div>

        {/* TRUST */}
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="text-green-500">✓</span> Sin spam
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-green-500">✓</span> Cancela cuando quieras
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-green-500">✓</span> Acceso inmediato
          </span>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="py-8 px-6 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} Fit con Damián · fitcondamian.com
          {" · "}
          <a href="/privacidad" className="hover:text-brand transition-colors">Privacidad</a>
          {" · "}
          <a href="/cookies" className="hover:text-brand transition-colors">Cookies</a>
          {" · "}
          <a href="/aviso-legal" className="hover:text-brand transition-colors">Aviso Legal</a>
        </p>
      </footer>
    </main>
  );
}

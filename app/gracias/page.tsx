import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "¡Llamada confirmada!",
  robots: { index: false, follow: false },
};

const pasos = [
  {
    num: "1",
    titulo: "Revisa tu correo",
    desc: "Te hemos enviado un email con todos los detalles de la llamada y el link de videollamada.",
  },
  {
    num: "2",
    titulo: "Añádela a tu calendario",
    desc: "Haz clic en el enlace del email para añadir la cita a Google Calendar o iCal y no olvidarte.",
  },
  {
    num: "3",
    titulo: "Prepara tus dudas",
    desc: "Anota qué has intentado hasta ahora, cuál es tu objetivo y qué te frena. Así aprovechamos mejor el tiempo.",
  },
];

export default function GraciasPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">

      {/* HEADER */}
      <header className="py-5 px-6 text-center border-b border-gray-100">
        <p className="text-xl font-black tracking-tight text-gray-900">
          Fit con <span className="text-brand">Damián</span>
        </p>
      </header>

      <div className="flex-1 max-w-lg mx-auto px-6 py-12 w-full">

        {/* ICON + HEADLINE */}
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-100">
            <span className="text-5xl">✅</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
            ¡Llamada confirmada!
          </h1>
          <p className="text-lg text-gray-600">
            Nos vemos pronto. Estoy deseando conocer tu caso y ayudarte.
          </p>
        </div>

        {/* PASOS */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 mb-8">
          <h2 className="font-black text-gray-900 mb-5">Qué hacer ahora:</h2>
          <div className="space-y-5">
            {pasos.map((p) => (
              <div key={p.num} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-brand text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {p.num}
                </div>
                <div>
                  <p className="font-bold text-gray-900 mb-0.5">{p.titulo}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MIENTRAS TANTO */}
        <div className="text-center mb-8">
          <p className="text-gray-500 text-sm mb-4">Mientras tanto, accede a los recursos gratuitos:</p>
          <Link href="/acceso-recursos" className="btn-primary inline-block">
            Ver recursos gratuitos
          </Link>
        </div>

        {/* RRSS */}
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-3">Sígueme para más contenido gratuito:</p>
          <div className="flex justify-center gap-4">
            {/* 👉 Reemplaza los # con tus links reales de redes sociales */}
            <a href="#" target="_blank" rel="noopener noreferrer"
              className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors">
              Instagram
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer"
              className="px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">
              YouTube
            </a>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="py-8 px-6 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} Fit con Damián · fitcondamian.com
        </p>
      </footer>
    </main>
  );
}

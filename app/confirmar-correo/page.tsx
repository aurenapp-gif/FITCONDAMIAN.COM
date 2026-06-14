import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Confirma tu correo",
  robots: { index: false, follow: false },
};

export default function ConfirmarCorreoPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">

      {/* HEADER */}
      <header className="py-5 px-6 text-center border-b border-gray-100">
        <p className="text-xl font-black tracking-tight text-gray-900">
          Fit con <span className="text-brand">Damián</span>
        </p>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-lg w-full text-center">

          {/* ICON */}
          <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-orange-100">
            <span className="text-5xl">📧</span>
          </div>

          {/* HEADLINE */}
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
            ¡Un paso más!
          </h1>

          <p className="text-xl font-semibold text-brand mb-6">
            Revisa tu correo electrónico
          </p>

          {/* INSTRUCCIONES */}
          <div className="bg-gray-50 rounded-2xl p-6 text-left mb-8 border border-gray-200">
            <h2 className="font-bold text-gray-900 mb-4">Qué tienes que hacer ahora:</h2>
            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 bg-brand text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <p className="text-gray-700 leading-relaxed">
                  Abre el correo que te acabamos de enviar (revisa también <strong>Spam</strong> o <strong>Promociones</strong>)
                </p>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 bg-brand text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <p className="text-gray-700 leading-relaxed">
                  Haz clic en el botón <strong>&quot;Confirmar y acceder a los recursos&quot;</strong>
                </p>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 bg-brand text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <p className="text-gray-700 leading-relaxed">
                  Accederás directamente a todos los recursos gratuitos
                </p>
              </li>
            </ol>
          </div>

          {/* AVISO SPAM */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
            <p className="text-sm text-yellow-800">
              <strong>¿No encuentras el correo?</strong> A veces tarda 1-2 minutos.
              Busca un email de <strong>Damián</strong> en tu carpeta de Spam
              o Promociones y márcalo como &quot;No es spam&quot;.
            </p>
          </div>

          {/* VOLVER */}
          <Link href="/recursos" className="text-sm text-gray-500 hover:text-brand transition-colors underline underline-offset-2">
            ← Volver a la página de recursos
          </Link>

        </div>
      </div>

      {/* FOOTER */}
      <footer className="py-6 px-6 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} Fit con Damián · fitcondamian.com
        </p>
      </footer>
    </main>
  );
}

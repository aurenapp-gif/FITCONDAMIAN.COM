import type { Metadata } from "next";
import LegalDoc from "../_components/LegalDoc";

export const metadata: Metadata = {
  title: "Política de Cookies",
  robots: { index: false, follow: false },
};

const b = { color: "#fff", fontWeight: 700 };
const a = { color: "#00AAFF", textDecoration: "none" };

const th = { textAlign: "left" as const, padding: "10px 12px", color: "#fff", fontSize: "13px", fontWeight: 700, borderBottom: "1px solid #2a2a2a" };
const td = { padding: "10px 12px", color: "#A0A0A0", fontSize: "13px", borderBottom: "1px solid #1a1a1a", verticalAlign: "top" as const };

export default function PoliticaCookiesPage() {
  return (
    <LegalDoc
      title="Política de Cookies"
      updated="11 de julio de 2026"
      sections={[
        {
          heading: "1. ¿Qué son las cookies?",
          body: (
            <p style={{ margin: 0 }}>
              Las cookies son pequeños archivos de texto que los sitios web instalan en tu dispositivo cuando los visitas.
              Sirven para que la web funcione, para recordar tus preferencias y para obtener información estadística y de
              marketing. Esta política se rige por la <strong style={b}>Lei n.º 41/2004</strong>, de 18 de agosto (sobre
              privacidad en las comunicaciones electrónicas) y por el <strong style={b}>RGPD</strong>.
            </p>
          ),
        },
        {
          heading: "2. Responsable",
          body: (
            <p style={{ margin: 0 }}>
              <strong style={b}>VENTO COGITATIVO UNIPESSOAL LDA</strong> — NIPC PT519216121 — Avenida Gomes Pereira, 105,
              1500-328 Lisboa (Portugal) — <a style={a} href="mailto:info@fitconaurena.com">info@fitconaurena.com</a>.
            </p>
          ),
        },
        {
          heading: "3. Tipos de cookies que utilizamos",
          body: (
            <>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "480px" }}>
                  <thead>
                    <tr>
                      <th style={th}>Tipo</th>
                      <th style={th}>Proveedor</th>
                      <th style={th}>Finalidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={td}><strong style={b}>Técnicas</strong> (necesarias)</td>
                      <td style={td}>Sitio propio / GoHighLevel</td>
                      <td style={td}>Permiten el funcionamiento básico de la web y del formulario. No requieren consentimiento.</td>
                    </tr>
                    <tr>
                      <td style={td}><strong style={b}>Analíticas</strong></td>
                      <td style={td}>Google Analytics (Google LLC)</td>
                      <td style={td}>Miden el número de visitas y el uso del sitio para mejorarlo. Requieren tu consentimiento.</td>
                    </tr>
                    <tr>
                      <td style={td}><strong style={b}>Marketing</strong></td>
                      <td style={td}>Meta Pixel (Meta Platforms Inc.)</td>
                      <td style={td}>Miden la eficacia de las campañas publicitarias y permiten mostrar anuncios personalizados. Requieren tu consentimiento.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          ),
        },
        {
          heading: "4. Base jurídica",
          body: (
            <p style={{ margin: 0 }}>
              Las cookies <strong style={b}>técnicas o necesarias</strong> se utilizan sobre la base del interés legítimo
              en prestar un servicio expresamente solicitado. Las cookies <strong style={b}>analíticas y de marketing</strong>{" "}
              solo se instalan si nos prestas tu <strong style={b}>consentimiento</strong>, que puedes otorgar o rechazar
              y retirar en cualquier momento.
            </p>
          ),
        },
        {
          heading: "5. Gestión y desactivación de cookies",
          body: (
            <>
              <p style={{ margin: "0 0 12px 0" }}>
                Puedes gestionar o eliminar las cookies desde la configuración de tu navegador. A continuación tienes los
                enlaces de ayuda de los navegadores más habituales:
              </p>
              <ul style={{ margin: 0, paddingLeft: "20px" }}>
                <li><a style={a} href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
                <li><a style={a} href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
                <li><a style={a} href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
                <li><a style={a} href="https://support.microsoft.com/es-es/microsoft-edge" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
              </ul>
              <p style={{ margin: "12px 0 0 0" }}>
                Ten en cuenta que la desactivación de algunas cookies puede afectar al correcto funcionamiento del sitio.
              </p>
            </>
          ),
        },
        {
          heading: "6. Más información",
          body: (
            <p style={{ margin: 0 }}>
              Para más detalles sobre cómo tratamos tus datos personales, consulta nuestra{" "}
              <a style={a} href="/privacidad">Política de Privacidad</a>.
            </p>
          ),
        },
      ]}
    />
  );
}

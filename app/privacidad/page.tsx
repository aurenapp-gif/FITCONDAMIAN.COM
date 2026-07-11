import type { Metadata } from "next";
import LegalDoc from "../_components/LegalDoc";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  robots: { index: false, follow: false },
};

const b = { color: "#fff", fontWeight: 700 };
const a = { color: "#00AAFF", textDecoration: "none" };

export default function PrivacidadPage() {
  return (
    <LegalDoc
      title="Política de Privacidad"
      updated="11 de julio de 2026"
      sections={[
        {
          heading: "1. Responsable del tratamiento",
          body: (
            <p style={{ margin: 0 }}>
              El responsable del tratamiento de tus datos personales es:<br /><br />
              <strong style={b}>VENTO COGITATIVO UNIPESSOAL LDA</strong><br />
              NIPC: PT519216121<br />
              Domicilio: Avenida Gomes Pereira, 105 — 1500-328 Lisboa (Portugal)<br />
              Correo electrónico: <a style={a} href="mailto:info@fitconaurena.com">info@fitconaurena.com</a><br />
              Sitio web: fitcondamian.com
            </p>
          ),
        },
        {
          heading: "2. Marco legal aplicable",
          body: (
            <p style={{ margin: 0 }}>
              La presente política se rige por el <strong style={b}>Reglamento (UE) 2016/679</strong> (Reglamento General
              de Protección de Datos, RGPD), por la <strong style={b}>Lei n.º 58/2019</strong>, de 8 de agosto (que
              asegura la ejecución del RGPD en el ordenamiento jurídico portugués), y por la demás legislación portuguesa
              y europea aplicable en materia de protección de datos personales. La autoridad de control competente es la
              <strong style={b}> Comissão Nacional de Proteção de Dados (CNPD)</strong>.
            </p>
          ),
        },
        {
          heading: "3. Datos que recogemos",
          body: (
            <>
              <p style={{ margin: "0 0 12px 0" }}>
                Recogemos únicamente los datos que nos facilitas de forma voluntaria a través de nuestros formularios:
              </p>
              <ul style={{ margin: 0, paddingLeft: "20px" }}>
                <li>Nombre</li>
                <li>Dirección de correo electrónico</li>
                <li>Número de teléfono</li>
              </ul>
              <p style={{ margin: "12px 0 0 0" }}>
                Adicionalmente, y a través de cookies y tecnologías similares, podemos recoger datos de navegación
                (dirección IP, tipo de dispositivo y navegador, páginas visitadas). Consulta nuestra{" "}
                <a style={a} href="/politica-cookies">Política de Cookies</a> para más información.
              </p>
            </>
          ),
        },
        {
          heading: "4. Finalidades y base jurídica del tratamiento",
          body: (
            <>
              <p style={{ margin: "0 0 12px 0" }}>Tratamos tus datos con las siguientes finalidades:</p>
              <ul style={{ margin: 0, paddingLeft: "20px" }}>
                <li><strong style={b}>Enviarte los recursos gratuitos</strong> solicitados y darte acceso a ellos — base jurídica: ejecución de las medidas precontractuales / tu consentimiento (art. 6.1.a y 6.1.b RGPD).</li>
                <li><strong style={b}>Comunicaciones comerciales</strong> (correos con contenido, ofertas y seguimiento) — base jurídica: tu consentimiento (art. 6.1.a RGPD).</li>
                <li><strong style={b}>Agendar y realizar llamadas</strong> de asesoramiento — base jurídica: tu consentimiento y el interés legítimo en gestionar la relación (art. 6.1.a y 6.1.f RGPD).</li>
                <li><strong style={b}>Análisis y mejora</strong> del sitio web y de nuestras campañas — base jurídica: tu consentimiento para las cookies analíticas y de marketing (art. 6.1.a RGPD).</li>
              </ul>
            </>
          ),
        },
        {
          heading: "5. Destinatarios y encargados del tratamiento",
          body: (
            <>
              <p style={{ margin: "0 0 12px 0" }}>
                Para prestar nuestros servicios trabajamos con proveedores tecnológicos que actúan como encargados del
                tratamiento y que pueden tratar tus datos por cuenta nuestra:
              </p>
              <ul style={{ margin: 0, paddingLeft: "20px" }}>
                <li><strong style={b}>GoHighLevel</strong> (HighLevel Inc.) — CRM, gestión de formularios, envío de correos y agenda de citas.</li>
                <li><strong style={b}>Vercel Inc.</strong> — alojamiento (hosting) del sitio web.</li>
                <li><strong style={b}>Google LLC</strong> — Google Analytics (analítica) y alojamiento de documentos.</li>
                <li><strong style={b}>Meta Platforms Inc.</strong> — píxel de seguimiento de Facebook/Instagram para medición de campañas.</li>
              </ul>
              <p style={{ margin: "12px 0 0 0" }}>
                Algunos de estos proveedores están ubicados fuera del Espacio Económico Europeo (EEE). En dichos casos, las
                transferencias internacionales de datos se realizan al amparo de las garantías previstas en el RGPD, como
                las <strong style={b}>Cláusulas Contractuales Tipo</strong> aprobadas por la Comisión Europea o el marco
                <strong style={b}> EU-US Data Privacy Framework</strong>. No vendemos ni cedemos tus datos a terceros con
                fines distintos de los aquí descritos, salvo obligación legal.
              </p>
            </>
          ),
        },
        {
          heading: "6. Plazo de conservación",
          body: (
            <p style={{ margin: 0 }}>
              Conservaremos tus datos mientras mantengas tu relación con nosotros y no solicites su supresión, o mientras
              sigas suscrito a nuestras comunicaciones. Una vez retirado el consentimiento o solicitada la baja, tus datos
              se bloquearán y se conservarán únicamente durante los plazos legalmente exigibles para atender posibles
              responsabilidades, tras lo cual serán suprimidos.
            </p>
          ),
        },
        {
          heading: "7. Tus derechos",
          body: (
            <>
              <p style={{ margin: "0 0 12px 0" }}>
                Puedes ejercer en cualquier momento los siguientes derechos de forma gratuita:
              </p>
              <ul style={{ margin: 0, paddingLeft: "20px" }}>
                <li>Acceso a tus datos personales.</li>
                <li>Rectificación de datos inexactos.</li>
                <li>Supresión (derecho al olvido).</li>
                <li>Limitación del tratamiento.</li>
                <li>Portabilidad de tus datos.</li>
                <li>Oposición al tratamiento.</li>
                <li>Retirar el consentimiento prestado en cualquier momento.</li>
              </ul>
              <p style={{ margin: "12px 0 0 0" }}>
                Para ejercerlos, escríbenos a{" "}
                <a style={a} href="mailto:info@fitconaurena.com">info@fitconaurena.com</a> indicando el derecho que deseas
                ejercer. Si consideras que el tratamiento no se ajusta a la normativa, tienes derecho a presentar una
                reclamación ante la <strong style={b}>Comissão Nacional de Proteção de Dados (CNPD)</strong> —{" "}
                <a style={a} href="https://www.cnpd.pt" target="_blank" rel="noopener noreferrer">www.cnpd.pt</a>.
              </p>
            </>
          ),
        },
        {
          heading: "8. Seguridad de los datos",
          body: (
            <p style={{ margin: 0 }}>
              Aplicamos las medidas técnicas y organizativas apropiadas para garantizar un nivel de seguridad adecuado al
              riesgo, protegiendo tus datos frente a la destrucción, pérdida, alteración o acceso no autorizado.
            </p>
          ),
        },
        {
          heading: "9. Cambios en esta política",
          body: (
            <p style={{ margin: 0 }}>
              Podremos actualizar esta Política de Privacidad para adaptarla a novedades legislativas o cambios en nuestros
              servicios. La versión vigente será siempre la publicada en esta página, con indicación de la fecha de última
              actualización.
            </p>
          ),
        },
      ]}
    />
  );
}

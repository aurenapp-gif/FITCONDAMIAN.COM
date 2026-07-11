import type { Metadata } from "next";
import LegalDoc from "../_components/LegalDoc";

export const metadata: Metadata = {
  title: "Aviso Legal",
  robots: { index: false, follow: false },
};

const b = { color: "#fff", fontWeight: 700 };
const a = { color: "#00AAFF", textDecoration: "none" };

export default function AvisoLegalPage() {
  return (
    <LegalDoc
      title="Aviso Legal"
      updated="11 de julio de 2026"
      sections={[
        {
          heading: "1. Datos identificativos del titular",
          body: (
            <p style={{ margin: 0 }}>
              En cumplimiento del deber de información recogido en el <strong style={b}>Decreto-Lei n.º 7/2004</strong>,
              de 7 de enero, sobre comercio electrónico, se hacen constar los siguientes datos:<br /><br />
              <strong style={b}>Titular:</strong> VENTO COGITATIVO UNIPESSOAL LDA<br />
              <strong style={b}>NIPC:</strong> PT519216121<br />
              <strong style={b}>Domicilio:</strong> Avenida Gomes Pereira, 105 — 1500-328 Lisboa (Portugal)<br />
              <strong style={b}>Correo electrónico:</strong>{" "}
              <a style={a} href="mailto:info@fitconaurena.com">info@fitconaurena.com</a><br />
              <strong style={b}>Sitio web:</strong> fitcondamian.com
            </p>
          ),
        },
        {
          heading: "2. Objeto",
          body: (
            <p style={{ margin: 0 }}>
              El presente Aviso Legal regula el acceso, la navegación y el uso del sitio web fitcondamian.com (en adelante,
              el &quot;Sitio Web&quot;). El acceso y la utilización del Sitio Web atribuyen la condición de usuario e implican
              la aceptación plena de todas las condiciones incluidas en este Aviso Legal. Si no estás de acuerdo con estas
              condiciones, te rogamos que no utilices el Sitio Web.
            </p>
          ),
        },
        {
          heading: "3. Condiciones de uso",
          body: (
            <>
              <p style={{ margin: "0 0 12px 0" }}>El usuario se compromete a:</p>
              <ul style={{ margin: 0, paddingLeft: "20px" }}>
                <li>Hacer un uso adecuado y lícito del Sitio Web y de sus contenidos.</li>
                <li>No emplear el Sitio Web con fines o efectos ilícitos, lesivos o dañinos.</li>
                <li>Facilitar información veraz en los formularios.</li>
                <li>No introducir ni difundir contenidos que atenten contra los derechos de terceros.</li>
              </ul>
            </>
          ),
        },
        {
          heading: "4. Propiedad intelectual e industrial",
          body: (
            <p style={{ margin: 0 }}>
              Todos los contenidos del Sitio Web (textos, imágenes, vídeos, logotipos, marcas, diseño gráfico, código
              fuente, así como los recursos y materiales descargables) son titularidad de VENTO COGITATIVO UNIPESSOAL LDA o
              de terceros que han autorizado su uso, y están protegidos por la normativa de propiedad intelectual e
              industrial. Queda prohibida su reproducción, distribución, comunicación pública o transformación sin la
              autorización expresa de su titular.
            </p>
          ),
        },
        {
          heading: "5. Exención de responsabilidad",
          body: (
            <>
              <p style={{ margin: "0 0 12px 0" }}>
                La información y los recursos ofrecidos en este Sitio Web tienen carácter <strong style={b}>meramente
                informativo y educativo</strong> y no constituyen asesoramiento médico, nutricional ni de salud
                individualizado. Antes de iniciar cualquier programa de ejercicio o cambio en tus hábitos, te recomendamos
                consultar con un profesional sanitario cualificado.
              </p>
              <p style={{ margin: 0 }}>
                El titular no se responsabiliza de los daños que pudieran derivarse del uso de la información contenida en
                el Sitio Web, ni garantiza la ausencia de interrupciones o errores en su acceso, si bien empleará los
                medios razonables para evitarlos.
              </p>
            </>
          ),
        },
        {
          heading: "6. Enlaces a terceros",
          body: (
            <p style={{ margin: 0 }}>
              El Sitio Web puede contener enlaces a sitios de terceros. El titular no asume responsabilidad alguna sobre
              los contenidos, políticas o prácticas de dichos sitios externos.
            </p>
          ),
        },
        {
          heading: "7. Protección de datos y cookies",
          body: (
            <p style={{ margin: 0 }}>
              El tratamiento de los datos personales de los usuarios se rige por nuestra{" "}
              <a style={a} href="/privacidad">Política de Privacidad</a>, y el uso de cookies por nuestra{" "}
              <a style={a} href="/politica-cookies">Política de Cookies</a>.
            </p>
          ),
        },
        {
          heading: "8. Legislación aplicable y jurisdicción",
          body: (
            <p style={{ margin: 0 }}>
              El presente Aviso Legal se rige por la <strong style={b}>legislación portuguesa</strong>. Para la resolución
              de cualquier controversia derivada del acceso o uso del Sitio Web, las partes se someten a los juzgados y
              tribunales del domicilio del titular, salvo que la normativa de consumo aplicable disponga otro fuero.
            </p>
          ),
        },
      ]}
    />
  );
}

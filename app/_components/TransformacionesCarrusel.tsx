// Carrusel deslizable de transformaciones (antes/después).
// Las imágenes viven en /public como caso-exito-1.jpg ... caso-exito-N.jpg.
// Para añadir más: sube la imagen y sube el número TOTAL.
// Estilos: clases er-tr* de app/_styles/er.css.
const TOTAL = 18;

export default function TransformacionesCarrusel() {
  const casos = Array.from({ length: TOTAL }, (_, i) => i + 1);
  return (
    <section className="er-sec">
      <div className="er-sh">
        <p className="k">Transformaciones reales</p>
        <h2>Antes y <span className="er-pill">después</span></h2>
        <p className="er-tr-hint">Desliza para ver más →</p>
      </div>
      <div className="er-tr">
        {casos.map((n) => (
          <div key={n} className="er-tr-slide">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/caso-exito-${n}.jpg`} alt={`Transformación real ${n}`} loading="lazy" />
          </div>
        ))}
      </div>
    </section>
  );
}

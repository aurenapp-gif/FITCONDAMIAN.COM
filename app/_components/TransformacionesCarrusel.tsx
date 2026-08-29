// Carrusel deslizable de transformaciones (antes/después).
// Las imágenes viven en /public como caso-exito-1.jpg ... caso-exito-N.jpg.
// Para añadir más: sube la imagen y sube el número TOTAL.
const TOTAL = 18;

export default function TransformacionesCarrusel() {
  const casos = Array.from({ length: TOTAL }, (_, i) => i + 1);
  return (
    <>
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <p style={{ color: "#00AAFF", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 6px 0" }}>
          TRANSFORMACIONES REALES
        </p>
        <p style={{ color: "#777", fontSize: "13px", margin: 0 }}>Desliza para ver más →</p>
      </div>
      <div style={{ display: "flex", gap: "12px", overflowX: "auto", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch", paddingBottom: "8px", marginBottom: "48px" }}>
        {casos.map((n) => (
          <div key={n} style={{ flex: "0 0 auto", width: "min(78%, 300px)", scrollSnapAlign: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/caso-exito-${n}.jpg`}
              alt={`Transformación real ${n}`}
              loading="lazy"
              style={{ width: "100%", height: "auto", borderRadius: "16px", border: "1px solid #1f1f1f", display: "block" }}
            />
          </div>
        ))}
      </div>
    </>
  );
}
